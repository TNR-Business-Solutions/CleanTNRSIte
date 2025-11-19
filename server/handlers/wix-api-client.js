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
        }
      } catch (error) {
        console.error(`❌ Error loading token from database:`, error.message);
      }
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

    try {
      const token = await this.getValidToken();

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

      // For POST requests with body, ensure instance ID is clear
      let apiUrl = `${WIX_API_BASE}${endpoint}`;

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

      if (options.params) {
        config.params = options.params;
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
      console.error(`   Headers sent:`, {
        Authorization: "Bearer [token]",
        "wix-instance-id": this.instanceId,
        "X-Wix-Metasite-Id": this.instanceId,
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
