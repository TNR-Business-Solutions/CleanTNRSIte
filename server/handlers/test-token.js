// Test Token Handler
// Tests social media token validity

const TNRDatabase = require("../../database");
const axios = require("axios");
const { setCorsHeaders, handleCorsPreflight } = require("./cors-utils");
const { sendErrorResponse, handleUnexpectedError, ERROR_CODES } = require("./error-handler");

module.exports = async (req, res) => {
  // Handle CORS
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  if (req.method !== "POST") {
    return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, "Method not allowed. Only POST requests are accepted.", {
      method: req.method,
      allowed: ['POST']
    });
  }

  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body || "{}");
        const { tokenId, platform } = data;

        if (!tokenId || !platform) {
          return sendErrorResponse(res, ERROR_CODES.MISSING_FIELD, "tokenId and platform are required.", {
            missing: !tokenId ? ['tokenId'] : !platform ? ['platform'] : ['tokenId', 'platform']
          });
        }

        const db = new TNRDatabase();
        await db.initialize();

        const tokens = await db.getSocialMediaTokens(platform);
        const token = tokens.find((t) => t.id === tokenId);

        if (!token) {
          return sendErrorResponse(res, ERROR_CODES.RECORD_NOT_FOUND, "Token not found.");
        }

        // Test token based on platform
        let isValid = false;
        let testResult = {};

        if (platform === "facebook" || platform === "instagram") {
          try {
            const response = await axios.get(
              `https://graph.facebook.com/v18.0/me?access_token=${token.access_token}`
            );
            isValid = response.status === 200;
            testResult = {
              platform: "Facebook/Instagram",
              user_id: response.data.id,
              name: response.data.name,
            };
          } catch (error) {
            isValid = false;
            testResult = {
              error: error.response?.data?.error?.message || error.message,
            };
          }
        } else if (platform === "linkedin") {
          try {
            const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
              headers: {
                Authorization: `Bearer ${token.access_token}`,
              },
            });
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
        } else {
          return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, `Unsupported platform: ${platform}`, {
            platform,
            supported: ['facebook', 'instagram', 'linkedin']
          });
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            isValid,
            tokenId,
            platform,
            testResult,
          })
        );
      } catch (parseError) {
        return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, "Invalid request format. JSON expected.", {
          error: parseError.message
        });
      }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Test Token');
  }
};

