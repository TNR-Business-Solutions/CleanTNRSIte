/**
 * Wix OAuth Callback Handler
 * Handles the OAuth callback from Wix and exchanges code for access token
 */

const axios = require("axios");
const crypto = require("crypto");
const { stateStore } = require("./auth-wix");

// Wix App Configuration - Use environment variables if available
const WIX_APP_ID =
  process.env.WIX_APP_ID || "9901133d-7490-4e6e-adfd-cb11615cc5e4";
const WIX_APP_SECRET =
  process.env.WIX_APP_SECRET || "87fd621b-f3d2-4b2f-b085-2c4f00a17b97";

// Log configuration for debugging
console.log("🔧 Wix OAuth Callback Configuration:", {
  appId: WIX_APP_ID.substring(0, 8) + "...",
  hasSecret: !!WIX_APP_SECRET,
  hasEnvAppId: !!process.env.WIX_APP_ID,
  hasEnvSecret: !!process.env.WIX_APP_SECRET,
});

// Token endpoint - Wix uses wixapis.com domain for API calls
const WIX_TOKEN_URL = "https://www.wixapis.com/oauth/access";

// Database for storing client tokens (in production, use PostgreSQL/MongoDB)
const clientTokensDB = new Map();

// Persistent token storage
const tokenManager = require("./wix-token-manager");

// Load tokens from database on startup (async, but we'll call it)
// In serverless, this will load from Postgres; in local dev, from SQLite
tokenManager.loadTokens(clientTokensDB).catch((err) => {
  console.warn("⚠️  Could not load tokens on startup:", err.message);
});

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code) {
  try {
    console.log("🔄 Exchanging authorization code for access token");
    console.log(`   Using token endpoint: ${WIX_TOKEN_URL}`);
    console.log(`   App ID: ${WIX_APP_ID.substring(0, 8)}...`);
    console.log(`   Code length: ${code?.length || 0} characters`);

    const response = await axios.post(
      WIX_TOKEN_URL,
      {
        grant_type: "authorization_code",
        client_id: WIX_APP_ID,
        client_secret: WIX_APP_SECRET,
        code: code,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log("✅ Successfully obtained access token");
    const tokenResponse = {
      hasAccessToken: !!response.data.access_token,
      hasRefreshToken: !!response.data.refresh_token,
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type,
      instanceId:
        response.data.instance_id || response.data.instanceId || "not provided",
      siteId: response.data.site_id || response.data.siteId || "not provided",
      metasiteId:
        response.data.metasite_id ||
        response.data.metasiteId ||
        response.data.instance_id ||
        response.data.instanceId ||
        "not provided",
    };
    console.log("   Token response:", JSON.stringify(tokenResponse, null, 2));

    // Store metasite ID in token data for later use
    if (!response.data.metasite_id && !response.data.metasiteId) {
      // If metasite ID is not provided, use instance ID as metasite ID
      response.data.metasite_id =
        response.data.instance_id || response.data.instanceId;
    }

    // Log full response for debugging (but mask sensitive data)
    if (response.data.access_token) {
      console.log(
        `   Access token length: ${response.data.access_token.length} characters`
      );
      console.log(
        `   Access token preview: ${response.data.access_token.substring(
          0,
          30
        )}...`
      );
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error exchanging code for token");
    console.error("   Status:", error.response?.status);
    console.error("   Status Text:", error.response?.statusText);
    console.error(
      "   Error Data:",
      JSON.stringify(error.response?.data || error.message, null, 2)
    );
    console.error("   Full Error:", error.message);

    // Provide helpful error message
    if (error.response?.status === 400) {
      throw new Error(
        `Invalid authorization code. The code may have expired or already been used. Details: ${JSON.stringify(
          error.response.data
        )}`
      );
    } else if (error.response?.status === 401) {
      throw new Error(
        `Authentication failed. Check your WIX_APP_ID and WIX_APP_SECRET. Details: ${JSON.stringify(
          error.response.data
        )}`
      );
    } else if (error.response?.status === 404) {
      throw new Error(
        `Token endpoint not found. Verify WIX_TOKEN_URL is correct: ${WIX_TOKEN_URL}`
      );
    }

    throw error;
  }
}

/**
 * Get instance details using access token
 * Note: This endpoint may not be available - non-critical
 */
async function getInstanceDetails(accessToken) {
  try {
    console.log("🔍 Fetching Wix instance details");

    // Try to get site info - this endpoint may vary
    // For now, we'll skip this as it's non-critical
    // The instance ID is already provided in the callback
    console.log("ℹ️  Skipping instance details fetch (non-critical)");
    return null;
  } catch (error) {
    console.error(
      "❌ Error fetching instance details:",
      error.response?.data || error.message
    );
    // Non-critical error, continue anyway
    return null;
  }
}

/**
 * Refresh access token
 */
async function refreshAccessToken(refreshToken) {
  try {
    console.log("🔄 Refreshing access token");

    const response = await axios.post(
      WIX_TOKEN_URL,
      {
        grant_type: "refresh_token",
        client_id: WIX_APP_ID,
        client_secret: WIX_APP_SECRET,
        refresh_token: refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Successfully refreshed access token");
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error refreshing token:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Save client tokens to database
 */
async function saveClientTokens(instanceId, tokenData, metadata = {}) {
  // Wix tokens typically don't expire, or have very long expiration
  // If expires_in is not provided, default to 10 years
  const expiresIn = tokenData.expires_in || 10 * 365 * 24 * 60 * 60; // 10 years in seconds

  const clientData = {
    instanceId,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: Date.now() + expiresIn * 1000,
    metadata,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Save to in-memory Map for backward compatibility
  clientTokensDB.set(instanceId, clientData);
  console.log(
    `💾 Saved tokens for instance: ${instanceId} (expires in ${Math.floor(
      expiresIn / 86400
    )} days)`
  );

  // Save to database (async)
  try {
    await tokenManager.saveToken(clientData);
    console.log(`✅ Token saved to database for instance: ${instanceId}`);
  } catch (error) {
    console.error(`❌ Error saving token to database:`, error.message);
    // Continue anyway - token is in memory
  }

  return clientData;
}

/**
 * Handle Wix OAuth callback
 * Supports both authorization code flow and direct token flow
 */
module.exports = async (req, res) => {
  try {
    console.log("🎯 Wix OAuth callback received");
    console.log("   Query params:", Object.keys(req.query));
    console.log("   Full URL:", req.url);

    const { code, state, instanceId, token } = req.query;

    // PRIORITY 1: Check if token is provided directly in query parameter
    if (token) {
      console.log("📝 Direct token provided in callback");
      console.log(`   Token length: ${token.length} characters`);
      console.log(`   Token preview: ${token.substring(0, 50)}...`);

      // Try to get instance ID from state or use the one from URL
      let stateData = null;
      if (state) {
        stateData = stateStore.get(state);
        if (stateData) {
          stateStore.delete(state); // Clean up used state
        }
      }

      // Use instance ID from query, state, or use the known one
      const finalInstanceId =
        instanceId ||
        stateData?.instanceId ||
        "a4890371-c6da-46f4-a830-9e19df999cf8";

      console.log(`   Using instance ID: ${finalInstanceId}`);

      // Save token directly
      const clientData = {
        instanceId: finalInstanceId,
        accessToken: token,
        refreshToken: null,
        expiresAt: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
        metadata: {
          clientId: stateData?.clientId || "shesallthatandmore",
          source: "direct-token-callback",
          tokenReceivedAt: new Date().toISOString(),
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      clientTokensDB.set(finalInstanceId, clientData);
      try {
        await tokenManager.saveToken(clientData);
        console.log(
          `✅ Token saved to database for instance: ${finalInstanceId}`
        );
      } catch (error) {
        console.error(`❌ Error saving token to database:`, error.message);
      }

      console.log(`💾 Saved direct token for instance: ${finalInstanceId}`);
      console.log(`✅ Token saved successfully`);

      // Redirect to success page
      const returnUrl = stateData?.returnUrl || "/wix-client-dashboard.html";
      const successUrl = new URL(returnUrl, `http://${req.headers.host}`);
      successUrl.searchParams.append("success", "true");
      successUrl.searchParams.append("instanceId", finalInstanceId);
      successUrl.searchParams.append("tokenSaved", "true");

      return res.redirect(successUrl.toString());
    }

    // PRIORITY 2: Check if code is actually a JWT token (Wix sometimes returns JWT directly)
    // JWT tokens start with "OAUTH2." or "eyJ" (base64 encoded JSON)
    const isJWTToken =
      code && (code.startsWith("OAUTH2.") || code.startsWith("eyJ"));

    if (isJWTToken) {
      console.log("📝 JWT token detected in code parameter");
      console.log(`   Token length: ${code.length} characters`);
      console.log(`   Token preview: ${code.substring(0, 50)}...`);

      // Get instance ID from query or state
      let stateData = null;
      if (state) {
        stateData = stateStore.get(state);
        if (stateData) {
          stateStore.delete(state); // Clean up used state
        }
      }

      const finalInstanceId =
        instanceId ||
        stateData?.instanceId ||
        "a4890371-c6da-46f4-a830-9e19df999cf8";

      console.log(`   Using instance ID: ${finalInstanceId}`);

      // Save JWT token directly as access token
      const clientData = {
        instanceId: finalInstanceId,
        accessToken: code, // Use JWT token directly
        refreshToken: null,
        expiresAt: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
        metadata: {
          clientId: stateData?.clientId || "shesallthatandmore",
          source: "jwt-token-from-code",
          tokenType: "JWT",
          tokenReceivedAt: new Date().toISOString(),
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      clientTokensDB.set(finalInstanceId, clientData);
      try {
        await tokenManager.saveToken(clientData);
        console.log(
          `✅ Token saved to database for instance: ${finalInstanceId}`
        );
      } catch (error) {
        console.error(`❌ Error saving token to database:`, error.message);
      }

      console.log(`💾 Saved JWT token for instance: ${finalInstanceId}`);
      console.log(`✅ Token saved successfully`);

      // Redirect to success page
      const returnUrl = stateData?.returnUrl || "/wix-client-dashboard.html";
      const successUrl = new URL(returnUrl, `http://${req.headers.host}`);
      successUrl.searchParams.append("success", "true");
      successUrl.searchParams.append("instanceId", finalInstanceId);
      successUrl.searchParams.append("tokenSaved", "true");

      return res.redirect(successUrl.toString());
    }

    // PRIORITY 3: Standard OAuth authorization code flow
    if (!code) {
      throw new Error("Missing authorization code or token");
    }

    if (!state) {
      throw new Error("Missing state parameter");
    }

    // Verify state token (CSRF protection)
    const stateData = stateStore.get(state);
    if (!stateData) {
      throw new Error("Invalid or expired state token");
    }

    // Remove used state token
    stateStore.delete(state);

    console.log(`✅ State validated for client: ${stateData.clientId}`);
    console.log(
      `📍 Instance ID: ${instanceId || "Will be obtained from token"}`
    );

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Get instance details (non-critical)
    const instanceDetails = await getInstanceDetails(tokenData.access_token);

    // Determine final instance ID (this should be the metasite ID)
    // In Wix OAuth, instance_id from token response is the metasite ID
    const finalInstanceId =
      instanceId ||
      tokenData.instance_id ||
      tokenData.instanceId ||
      tokenData.metasite_id ||
      tokenData.metasiteId ||
      instanceDetails?.sites?.[0]?.siteId ||
      crypto.randomBytes(16).toString("hex");

    // Store metasite ID in metadata for reference
    const metadata = {
      clientId: stateData.clientId,
      instanceDetails,
      metasiteId: finalInstanceId, // Store metasite ID explicitly
      instanceId: finalInstanceId,
    };

    // Save tokens to database
    const clientData = await saveClientTokens(
      finalInstanceId,
      tokenData,
      metadata
    );

    console.log("🎉 OAuth flow completed successfully!");

    // Redirect to success page with instance info
    const successUrl = new URL(
      stateData.returnUrl,
      `http://${req.headers.host}`
    );
    successUrl.searchParams.append("success", "true");
    successUrl.searchParams.append("instanceId", finalInstanceId);

    res.redirect(successUrl.toString());
  } catch (error) {
    console.error("❌ Error in Wix OAuth callback:", error);
    console.error("   Error details:", error.message);
    console.error("   Query params received:", req.query);
    console.error("   Stack:", error.stack);

    // Provide detailed error information
    let errorMessage = error.message || "Unknown error occurred";
    let errorDetails = "";

    if (error.response) {
      errorDetails = JSON.stringify(
        error.response.data || error.response.statusText
      );
      console.error("   API Error Response:", errorDetails);
    }

    // Redirect to error page with detailed information
    const errorUrl = new URL(
      "/wix-client-dashboard.html",
      `http://${req.headers.host}`
    );
    errorUrl.searchParams.append("error", errorMessage);
    if (errorDetails) {
      errorUrl.searchParams.append("details", errorDetails);
    }

    res.redirect(errorUrl.toString());
  }
};

// Export for use in other modules
module.exports.clientTokensDB = clientTokensDB;
module.exports.refreshAccessToken = refreshAccessToken;
