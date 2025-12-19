// Test Token Handler
// Tests social media token validity

const TNRDatabase = require("../../database");
const axios = require("axios");
const { setCorsHeaders, handleCorsPreflight } = require("./cors-utils");
const {
  sendErrorResponse,
  handleUnexpectedError,
  ERROR_CODES,
} = require("./error-handler");
const { parseBody } = require("./http-utils");

module.exports = async (req, res) => {
  // Handle CORS
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  if (req.method !== "POST") {
    return sendErrorResponse(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      "Method not allowed. Only POST requests are accepted.",
      {
        method: req.method,
        allowed: ["POST"],
      }
    );
  }

  try {
    // Parse body - handle both Vercel (pre-parsed) and local (stream) environments
    const data = await parseBody(req);
    console.log("test-token received body:", JSON.stringify(data));
    const { tokenId, platform } = data;

    console.log("Extracted tokenId:", tokenId, "Type:", typeof tokenId);
    console.log("Extracted platform:", platform);

    if (!tokenId || !platform) {
      console.error(
        "Missing fields - tokenId:",
        tokenId,
        "platform:",
        platform
      );
      return sendErrorResponse(
        res,
        ERROR_CODES.MISSING_FIELD,
        "tokenId and platform are required.",
        {
          missing: !tokenId
            ? ["tokenId"]
            : !platform
            ? ["platform"]
            : ["tokenId", "platform"],
          received: {
            tokenId: tokenId ? String(tokenId).substring(0, 20) + "..." : null,
            platform: platform,
            dataKeys: Object.keys(data || {}),
          },
        }
      );
    }

    const db = new TNRDatabase();
    await db.initialize();

    const tokens = await db.getSocialMediaTokens(platform);
    const token = tokens.find((t) => t.id === tokenId);

    if (!token) {
      return sendErrorResponse(
        res,
        ERROR_CODES.RECORD_NOT_FOUND,
        "Token not found."
      );
    }

    // Test token based on platform
    let isValid = false;
    let testResult = {};

    // Initialize isValid to false
    isValid = false;

    if (platform === "facebook" || platform === "instagram") {
      try {
        // For Facebook, test with page_id if available, otherwise use /me
        const testUrl = token.page_id
          ? `https://graph.facebook.com/v19.0/${token.page_id}?fields=id,name,category&access_token=${token.access_token}`
          : `https://graph.facebook.com/v19.0/me?access_token=${token.access_token}`;

        const response = await axios.get(testUrl, { timeout: 10000 });
        isValid = response.status === 200;

        // Get page info
        const pageInfo = {
          id: response.data.id,
          name: response.data.name || token.page_name || "Facebook Page",
          category: response.data.category || null,
        };

        // Try to get Instagram account if available
        let instagramInfo = null;
        if (token.instagram_account_id) {
          try {
            const igResponse = await axios.get(
              `https://graph.facebook.com/v19.0/${token.instagram_account_id}?fields=id,username,name,profile_picture_url,followers_count&access_token=${token.access_token}`,
              { timeout: 10000 }
            );
            instagramInfo = {
              id: igResponse.data.id,
              username: igResponse.data.username || token.instagram_username,
              name: igResponse.data.name,
              followersCount: igResponse.data.followers_count,
            };
          } catch (igError) {
            console.warn("Could not fetch Instagram info:", igError.message);
            // Still return basic Instagram info from token
            if (token.instagram_username) {
              instagramInfo = {
                id: token.instagram_account_id,
                username: token.instagram_username,
              };
            }
          }
        }

        testResult = {
          platform: "Facebook/Instagram",
          page: pageInfo,
          instagram: instagramInfo,
          isValid: true,
        };
      } catch (error) {
        isValid = false;
        testResult = {
          error: error.response?.data?.error?.message || error.message,
          errorCode: error.response?.data?.error?.code,
        };
      }
    } else if (platform === "linkedin") {
      try {
        const response = await axios.get(
          "https://api.linkedin.com/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
            timeout: 10000,
          }
        );
        isValid = response.status === 200;
        testResult = {
          platform: "LinkedIn",
          user_id: response.data.sub,
        };
      } catch (error) {
        isValid = false;
        testResult = {
          error: error.response?.data?.error_description || error.message,
        };
      }
    } else if (platform === "twitter") {
      try {
        const response = await axios.get("https://api.twitter.com/2/users/me", {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
          timeout: 10000,
        });
        isValid = response.status === 200;
        testResult = {
          platform: "Twitter/X",
          user_id: response.data.data?.id,
          username: response.data.data?.username,
        };
      } catch (error) {
        isValid = false;
        testResult = {
          error: error.response?.data?.detail || error.message,
        };
      }
    } else {
      return sendErrorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        `Unsupported platform: ${platform}`,
        {
          platform,
          supported: ["facebook", "instagram", "linkedin", "twitter"],
        }
      );
    }

    // Format response to match frontend expectations
    const response = {
      success: true,
      isValid,
      tokenId,
      platform,
    };

    // For Facebook/Instagram, include page and instagram info directly
    if (platform === "facebook" || platform === "instagram") {
      if (testResult.page) {
        response.page = testResult.page;
      }
      if (testResult.instagram) {
        response.instagram = testResult.instagram;
      }
      if (testResult.error) {
        response.message = testResult.error;
        response.errorCode = testResult.errorCode;
      }
      // Include token expiration info if available
      if (token.expires_at) {
        response.tokenInfo = {
          expires_at: token.expires_at,
        };
      }
    } else {
      // For other platforms, include testResult
      response.testResult = testResult;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
  } catch (error) {
    return handleUnexpectedError(res, error, "Test Token");
  }
};
