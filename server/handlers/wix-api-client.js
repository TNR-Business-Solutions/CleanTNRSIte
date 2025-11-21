/**
 * Wix API Client
 * Centralized client for making authenticated requests to Wix APIs
 */

const axios = require("axios");
const { clientTokensDB, refreshAccessToken } = require("./auth-wix-callback");
const { logRequest, logResponse } = require("./wix-api-logger");

// Wix API Base URLs
const WIX_API_BASE = "https://www.wixapis.com";

class WixAPIClient {
  constructor(instanceId) {
    this.originalInstanceId = instanceId;
    this.instanceId = instanceId;
    this.clientData = null;
  }

  /**
   * Get client data and ensure token is valid
   */
  async getValidToken() {
    // First check in-memory cache
    this.clientData = clientTokensDB.get(this.instanceId);

    // If not in memory, try loading from database
    if (!this.clientData) {
      console.log(
        `🔍 Token not in memory for instance ${this.instanceId}, checking database...`
      );
      try {
        const tokenManager = require("./wix-token-manager");
        const dbToken = await tokenManager.getToken(this.instanceId);

        if (dbToken) {
          // Convert database format to Map format
          this.clientData = {
            instanceId: dbToken.instanceId,
            accessToken: dbToken.accessToken,
            refreshToken: dbToken.refreshToken,
            expiresAt:
              dbToken.expiresAt || Date.now() + 10 * 365 * 24 * 60 * 60 * 1000, // Default 10 years
            metadata: dbToken.metadata || {},
            createdAt: dbToken.createdAt || Date.now(),
            updatedAt: dbToken.updatedAt || Date.now(),
          };

          // Cache in memory for future requests
          clientTokensDB.set(this.instanceId, this.clientData);
          console.log(
            `✅ Loaded token from database for instance: ${this.instanceId}`
          );
          console.log(
            `   Metadata metasite ID: ${this.clientData.metadata?.metasiteId || 'N/A'}`
          );
        }
      } catch (error) {
        console.error(`❌ Error loading token from database:`, error.message);
      }
    }
    
    // If we have metadata with a different metasite ID, use that
    // The instance ID passed to constructor might be different from the actual metasite ID
    if (this.clientData?.metadata?.metasiteId) {
      const metadataMetasiteId = this.clientData.metadata.metasiteId;
      if (metadataMetasiteId !== this.instanceId) {
        console.log(
          `⚠️  Instance ID mismatch: Constructor has ${this.instanceId}, but metadata has metasite ID: ${metadataMetasiteId}`
        );
        console.log(`   Using metasite ID from metadata: ${metadataMetasiteId}`);
        // Update instance ID to use the metasite ID from metadata
        this.instanceId = metadataMetasiteId;
      } else {
        console.log(`✅ Instance ID matches metadata metasite ID: ${this.instanceId}`);
      }
    } else {
      console.log(`⚠️  No metasite ID in metadata, using instance ID: ${this.instanceId}`);
    }

    if (!this.clientData) {
      throw new Error(
        `No tokens found for instance: ${this.instanceId}. Please reconnect the Wix client.`
      );
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (this.clientData.expiresAt - now < fiveMinutes) {
      console.log("🔄 Token expired or expiring soon, refreshing...");

      try {
        const newTokenData = await refreshAccessToken(
          this.clientData.refreshToken
        );

        // Update stored tokens
        this.clientData.accessToken = newTokenData.access_token;
        this.clientData.refreshToken =
          newTokenData.refresh_token || this.clientData.refreshToken;
        this.clientData.expiresAt = Date.now() + newTokenData.expires_in * 1000;
        this.clientData.updatedAt = Date.now();

        clientTokensDB.set(this.instanceId, this.clientData);
        console.log("✅ Token refreshed successfully");

        // Save to persistent storage
        const tokenManager = require("./wix-token-manager");
        try {
          await tokenManager.saveToken(this.clientData);
          console.log("✅ Refreshed token saved to database");
        } catch (error) {
          console.error(
            "❌ Error saving refreshed token to database:",
            error.message
          );
        }
      } catch (error) {
        console.error("❌ Failed to refresh token:", error);
        throw new Error(
          "Token refresh failed. Client needs to re-authenticate."
        );
      }
    }

    // Return token - ensure it's a string
    const token = this.clientData.accessToken;
    if (!token) {
      throw new Error("Access token is missing");
    }

    // Log token info for debugging (first 20 chars only)
    console.log(
      `   Token preview: ${token.substring(0, 20)}... (length: ${token.length})`
    );

    return token;
  }

  /**
   * Make authenticated API request
   */
  async request(method, endpoint, data = null, options = {}) {
    const operation = `${method} ${endpoint}`;
    let apiUrl = ''; // Declare outside try block for error handler access

    try {
      const token = await this.getValidToken();

      // Trivial comment to force redeploy: Debug logging added for API calls - v2
      console.log(`🔍 Making API request to Wix (v2 debug):`);
      console.log(`   Operation: ${operation}`);
      console.log(`   Endpoint: ${endpoint}`);
      console.log(`   Method: ${method}`);
      console.log(`   Instance ID: ${this.instanceId}`);
      console.log(`   Original Instance ID: ${this.originalInstanceId}`);
      console.log(`   Metadata: ${JSON.stringify(this.clientData.metadata)}`);

      // Log request
      logRequest(operation, this.instanceId, {
        endpoint,
        method,
        data: data || null,
      });

      // Wix REST API requires Bearer token format
      const authHeader = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // Wix REST API requires instance ID (metasite ID) in headers
      // The instance ID is the metasite ID for Wix REST API
      const headers = {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "wix-instance-id": this.instanceId,
        // Some Wix APIs also require the metasite ID in a different header format
        "X-Wix-Metasite-Id": this.instanceId,
        ...options.headers,
      };

      // Log full headers (without sensitive token)
      console.log(`   Headers (preview):`, {
        Authorization: "Bearer [redacted]",
        "Content-Type": "application/json",
        "wix-instance-id": this.instanceId,
        "X-Wix-Metasite-Id": this.instanceId,
      });

      // Wix REST API requires instance ID (metasite ID) in headers only
      // Some endpoints may require it in URL path, but query params are not standard
      apiUrl = `${WIX_API_BASE}${endpoint}`;
      
      // Add query params from options if provided
      if (options.params && Object.keys(options.params).length > 0) {
        try {
          const url = new URL(apiUrl);
          Object.keys(options.params).forEach(key => {
            url.searchParams.set(key, options.params[key]);
          });
          apiUrl = url.toString();
        } catch (urlError) {
          // If URL parsing fails, append as query string manually
          const separator = endpoint.includes('?') ? '&' : '?';
          const queryString = Object.keys(options.params)
            .map(key => `${key}=${encodeURIComponent(options.params[key])}`)
            .join('&');
          apiUrl = `${apiUrl}${separator}${queryString}`;
        }
      }
      
      // Validate instance ID format (should be UUID format)
      if (!this.instanceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.instanceId)) {
        console.warn(`⚠️  Instance ID format may be invalid: ${this.instanceId}`);
        console.warn(`   Expected UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`);
      }

      const config = {
        method,
        url: apiUrl,
        headers,
        data: data || undefined,
      };

      // Log the request for debugging
      console.log(`   API URL: ${config.url}`);
      console.log(`   Instance ID: ${this.instanceId}`);
      console.log(`   Method: ${method}`);
      console.log(`   Headers:`, {
        Authorization: authHeader.substring(0, 30) + "...",
        "wix-instance-id": this.instanceId,
        "Content-Type": "application/json",
      });

      if (data) {
        config.data = data;
      }

      // Ensure instance ID is in request body for POST requests if needed
      if (
        method === "POST" &&
        data &&
        typeof data === "object" &&
        !data.instanceId
      ) {
        // Some Wix APIs might need instance ID in body too
        // But let's try headers first
      }

      const response = await axios(config);

      // Log successful response
      logResponse(operation, this.instanceId, {
        status: response.status,
        data: response.data,
        success: true,
      });

      return response.data;
    } catch (error) {
      // Log error response with full details
      const errorData = error.response?.data || error.message;
      logResponse(operation, this.instanceId, {
        status: error.response?.status || 0,
        error: errorData,
        success: false,
      });

      console.error(
        `❌ Wix API Error (${method} ${endpoint}):`,
        JSON.stringify(errorData, null, 2)
      );
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Instance ID used: ${this.instanceId}`);
      console.error(`   URL: ${apiUrl}`);
      console.error(`   Headers sent:`, {
        Authorization: "Bearer [token]",
        "wix-instance-id": this.instanceId,
        "X-Wix-Metasite-Id": this.instanceId,
      });
      console.error(`   Client data:`, {
        hasToken: !!this.clientData?.accessToken,
        tokenLength: this.clientData?.accessToken?.length || 0,
        metadataMetasiteId: this.clientData?.metadata?.metasiteId || 'N/A',
        expiresAt: this.clientData?.expiresAt || 'N/A'
      });

      // Provide more helpful error messages
      if (error.response?.status === 401) {
        if (errorData?.message?.includes("Metasite Context")) {
          throw new Error(
            "No Metasite Context: The access token may be invalid or the instance ID is incorrect. Please reconnect the Wix client."
          );
        }
        throw new Error(
          "Authentication failed. Please reconnect the Wix client."
        );
      }

      throw error;
    }
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request("GET", endpoint, null, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request("POST", endpoint, data, options);
  }

  async put(endpoint, data, options = {}) {
    return this.request("PUT", endpoint, data, options);
  }

  async patch(endpoint, data, options = {}) {
    return this.request("PATCH", endpoint, data, options);
  }

  async delete(endpoint, options = {}) {
    return this.request("DELETE", endpoint, null, options);
  }
}

/**
 * Factory function to create Wix API client
 */
function createWixClient(instanceId) {
  return new WixAPIClient(instanceId);
}

module.exports = { WixAPIClient, createWixClient, clientTokensDB };
/ /   T r i v i a l   c o m m e n t   t o   f o r c e   r e d e p l o y  
 