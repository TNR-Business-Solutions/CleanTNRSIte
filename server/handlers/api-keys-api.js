// API Keys Management API - Store API keys in Neon database
// Handles saving and retrieving API keys for Buffer, Facebook, LinkedIn, Twitter, etc.

const TNRDatabase = require('../../database');
const { setCorsHeaders, handleCorsPreflight } = require('./cors-utils');
const { sendErrorResponse, handleUnexpectedError, ERROR_CODES } = require('./error-handler');
const { sendJson } = require('./http-utils');
const { verifyToken, extractToken } = require('./jwt-utils');

module.exports = async (req, res) => {
  // Handle CORS
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  // JWT Authentication
  const token = extractToken(req);
  if (!token) {
    return sendJson(res, 401, {
      success: false,
      error: "Authentication required",
      message: "No token provided"
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendJson(res, 401, {
      success: false,
      error: "Invalid token",
      message: "Token verification failed"
    });
  }
  req.user = decoded;

  try {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const db = new TNRDatabase();
        
        // Ensure API keys table exists
        await db.ensureApiKeysTable();

        if (req.method === 'GET') {
          // Get all API keys
          const keys = await db.getApiKeys();
          return sendJson(res, {
            success: true,
            keys: keys
          });

        } else if (req.method === 'POST') {
          // Save API keys
          const data = JSON.parse(body);
          const { action, keys } = data;

          if (action === 'save') {
            // Save multiple keys at once
            const savedKeys = {};
            for (const [platform, value] of Object.entries(keys)) {
              if (value && value.trim()) {
                await db.saveApiKey(platform, value.trim());
                savedKeys[platform] = 'saved';
              }
            }

            return sendJson(res, {
              success: true,
              message: 'API keys saved successfully',
              saved: savedKeys
            });

          } else if (action === 'save-single') {
            // Save a single key
            const { platform, value } = data;
            if (!platform || !value) {
              return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Platform and value are required.', {
                receivedData: data
              });
            }

            await db.saveApiKey(platform, value.trim());
            return sendJson(res, {
              success: true,
              message: `${platform} API key saved successfully`
            });

          } else if (action === 'delete') {
            // Delete a key
            const { platform } = data;
            if (!platform) {
              return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Platform is required.', {
                receivedData: data
              });
            }

            await db.deleteApiKey(platform);
            return sendJson(res, {
              success: true,
              message: `${platform} API key deleted successfully`
            });

          } else {
            return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Invalid action.', {
              action: action,
              allowedActions: ['save', 'save-single', 'delete']
            });
          }

        } else {
          return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Method not allowed.', {
            method: req.method,
            allowed: ['GET', 'POST']
          });
        }

      } catch (error) {
        return handleUnexpectedError(res, error, 'API Keys Handler');
      }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'API Keys Handler');
  }
};

