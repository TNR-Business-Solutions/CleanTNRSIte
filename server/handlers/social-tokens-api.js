// Social Media Token Management API
// Handles GET, DELETE, and TEST operations for stored tokens

const TNRDatabase = require("../../database");
const axios = require("axios");
const { parseQuery, parseBody, sendJson } = require("./http-utils");

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const db = new TNRDatabase();
  await db.initialize();

  try {
    // GET - List all tokens
    if (req.method === "GET") {
      const query = parseQuery(req);
      const platform = query.platform || null;
      const tokens = await db.getSocialMediaTokens(platform);

      sendJson(res, 200, {
        success: true,
        tokens: tokens.map((token) => ({
          id: token.id,
          platform: token.platform,
          page_id: token.page_id,
          page_name: token.page_name,
          instagram_account_id: token.instagram_account_id,
          instagram_username: token.instagram_username,
          expires_at: token.expires_at,
          created_at: token.created_at,
          updated_at: token.updated_at,
          // Don't return full access_token in list view for security
          has_token: !!token.access_token,
        })),
      });
    }

    // DELETE - Remove a token
    if (req.method === "DELETE") {
      const query = parseQuery(req);
      const { tokenId } = query;

      if (!tokenId) {
        sendJson(res, 400, {
          success: false,
          error: "tokenId is required",
        });
        return;
      }

      await db.deleteSocialMediaToken(tokenId);

      sendJson(res, 200, {
        success: true,
        message: "Token deleted successfully",
      });
      return;
    }

    // POST - Test token validity (check both query and body)
    if (req.method === "POST") {
      const query = parseQuery(req);
      const body = await parseBody(req);
      const action = query.action || body.action;

      if (action === "test") {
        const { tokenId, platform } = body;

        if (!tokenId || !platform) {
          sendJson(res, 400, {
            success: false,
            error: "tokenId and platform are required",
          });
          return;
        }

        const tokens = await db.getSocialMediaTokens(platform);
        const token = tokens.find((t) => t.id === tokenId);

        if (!token) {
          sendJson(res, 404, {
            success: false,
            error: "Token not found",
          });
          return;
        }

        // Test token by making API call
        try {
          if (platform === "facebook" || platform === "instagram") {
            // Test Facebook/Instagram token
            const testUrl =
              platform === "instagram" && token.instagram_account_id
                ? `https://graph.facebook.com/v19.0/${token.instagram_account_id}?fields=id,username&access_token=${token.access_token}`
                : `https://graph.facebook.com/v19.0/me?access_token=${token.access_token}`;

            const response = await axios.get(testUrl, { timeout: 5000 });

            sendJson(res, 200, {
              success: true,
              valid: true,
              platform: platform,
              account: response.data,
              message: `✅ ${
                platform === "instagram" ? "Instagram" : "Facebook"
              } token is valid`,
            });
            return;
          } else if (platform === "linkedin") {
            // Test LinkedIn token
            const response = await axios.get("https://api.linkedin.com/v2/me", {
              headers: {
                Authorization: `Bearer ${token.access_token}`,
                "X-Restli-Protocol-Version": "2.0.0",
              },
              timeout: 5000,
            });

            sendJson(res, 200, {
              success: true,
              valid: true,
              platform: "linkedin",
              account: response.data,
              message: "✅ LinkedIn token is valid",
            });
            return;
          } else if (platform === "twitter") {
            // Test Twitter/X token
            const response = await axios.get(
              "https://api.twitter.com/2/users/me",
              {
                headers: {
                  Authorization: `Bearer ${token.access_token}`,
                },
                params: {
                  "user.fields": "id,name,username",
                },
                timeout: 5000,
              }
            );

            sendJson(res, 200, {
              success: true,
              valid: true,
              platform: "twitter",
              account: response.data.data,
              message: "✅ Twitter/X token is valid",
            });
            return;
          } else {
            sendJson(res, 400, {
              success: false,
              error: `Token testing for ${platform} not yet implemented`,
            });
            return;
          }
        } catch (testError) {
          // Provide more detailed error information
          let errorMessage = "❌ Token is invalid or expired";
          let errorDetails = testError.message;
          let statusCode = null;
          let helpText = undefined;

          if (testError.response) {
            statusCode = testError.response.status;
            const errorData = testError.response.data;

            if (statusCode === 401) {
              errorMessage =
                "❌ Unauthorized - Token is invalid, expired, or has insufficient permissions";
              if (errorData?.detail) {
                errorDetails = errorData.detail;
              } else if (errorData?.title) {
                errorDetails = errorData.title;
              } else {
                errorDetails =
                  'The Bearer Token may have "Read Only" permissions. Please regenerate it with "Read and Write" permissions in the X Developer Portal.';
              }
              helpText =
                'Go to X Developer Portal → Your App → Settings → User authentication settings → Change App permissions to "Read and Write" → Regenerate Bearer Token';
            } else if (statusCode === 403) {
              errorMessage = "❌ Forbidden - Token lacks required permissions";
              errorDetails =
                'Your token may have "Read Only" permissions. Update app permissions to "Read and Write" in X Developer Portal and regenerate the token.';
              helpText =
                'Go to X Developer Portal → Your App → Settings → User authentication settings → Change App permissions to "Read and Write" → Regenerate Bearer Token';
            } else if (statusCode === 429) {
              errorMessage = "❌ Rate limit exceeded";
              errorDetails =
                "Too many requests. Please wait a moment and try again.";
            } else {
              errorDetails =
                errorData?.detail ||
                errorData?.title ||
                errorData?.error ||
                errorMessage;
            }
          }

          sendJson(res, 200, {
            success: true,
            valid: false,
            error: errorDetails,
            message: errorMessage,
            statusCode: statusCode,
            help: helpText,
          });
          return;
        }
      }

      // POST - Save token manually (for OAuth 1.0a tokens or manual entry)
      if (action === "save") {
        const {
          platform,
          access_token,
          access_token_secret,
          page_id,
          page_name,
          user_id,
          expires_at,
        } = body;

        if (!platform || !access_token) {
          sendJson(res, 400, {
            success: false,
            error: "platform and access_token are required",
          });
          return;
        }

        // Extract user ID from Twitter access token if not provided
        // Twitter OAuth 1.0a tokens have format: USERID-TOKEN
        let extractedUserId = user_id;
        if (
          platform === "twitter" &&
          !extractedUserId &&
          access_token.includes("-")
        ) {
          extractedUserId = access_token.split("-")[0];
        }

        // Save token to database
        const tokenData = {
          platform: platform,
          access_token: access_token,
          token_type: body.token_type || "Bearer", // Include token_type from request
          page_id: page_id || extractedUserId || null,
          user_id: extractedUserId || user_id || null,
          page_name:
            page_name || `Twitter User (${extractedUserId || "Manual"})`,
          expires_at: expires_at || null,
          // Note: access_token_secret is not stored in current schema
          // For OAuth 1.0a, we'd need to add this field to the database
        };

        await db.saveSocialMediaToken(tokenData);

        sendJson(res, 200, {
          success: true,
          message: "Token saved successfully",
          token: {
            platform: platform,
            page_id: tokenData.page_id,
            page_name: tokenData.page_name,
            user_id: tokenData.user_id,
          },
        });
        return;
      }

      // POST - Get token for posting (returns full token securely)
      if (query.action === "get") {
        const { platform, pageId } = body;

        if (!platform) {
          sendJson(res, 400, {
            success: false,
            error: "platform is required",
          });
          return;
        }

        const token = await db.getSocialMediaToken(platform, pageId);

        if (!token) {
          sendJson(res, 404, {
            success: false,
            error: "Token not found for this platform",
          });
          return;
        }

        sendJson(res, 200, {
          success: true,
          token: {
            id: token.id,
            platform: token.platform,
            page_id: token.page_id,
            access_token: token.access_token,
            instagram_account_id: token.instagram_account_id,
            page_name: token.page_name,
          },
        });
        return;
      }
    }

    sendJson(res, 405, {
      success: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Token API error:", error);
    sendJson(res, 500, {
      success: false,
      error: error.message || "Internal server error",
    });
  }
};
