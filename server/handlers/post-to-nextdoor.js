// Post to Nextdoor - Vercel Serverless Function
// Handles posting content to Nextdoor using stored tokens

const axios = require('axios');
const TNRDatabase = require('../../database');
const { setCorsHeaders, handleCorsPreflight } = require('./cors-utils');
const { sendErrorResponse, handleUnexpectedError, ERROR_CODES } = require('./error-handler');

module.exports = async (req, res) => {
  // Handle CORS
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  // Only accept POST requests
  if (req.method !== 'POST') {
    return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Method not allowed. Only POST requests are accepted.', {
      method: req.method,
      allowed: ['POST']
    });
  }

  try {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { text, useDatabaseToken, access_token } = data;

        if (!text || !text.trim()) {
          return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Post content is required.', {
            receivedData: data
          });
        }

        let accessToken = access_token;

        // Get token from database if requested
        if (useDatabaseToken && !accessToken) {
          try {
            const db = new TNRDatabase();
            const tokens = await db.getSocialMediaTokens('nextdoor');
            
            if (!tokens || tokens.length === 0) {
              return sendErrorResponse(res, ERROR_CODES.AUTHENTICATION_ERROR, 'No Nextdoor token found. Please connect your Nextdoor account first.', {
                help: {
                  title: 'How to connect Nextdoor',
                  steps: [
                    '1. Go to the Social Media Dashboard',
                    '2. Click "Connect Nextdoor" in the Nextdoor Setup section',
                    '3. Authorize the application',
                    '4. Return to the dashboard and try posting again'
                  ]
                }
              });
            }

            // Use the first available token
            const token = tokens[0];
            accessToken = token.access_token;

            // Check if token is expired
            if (token.expires_at && new Date(token.expires_at) < new Date()) {
              // Try to refresh if refresh token is available
              if (token.refresh_token) {
                // TODO: Implement token refresh logic
                console.warn('Token expired, refresh not yet implemented');
              }
              
              return sendErrorResponse(res, ERROR_CODES.AUTHENTICATION_ERROR, 'Nextdoor token has expired. Please reconnect your account.', {
                help: {
                  title: 'Token Expired',
                  solution: 'Go to the Social Media Dashboard and click "Connect Nextdoor" to reconnect your account.'
                }
              });
            }
          } catch (dbError) {
            console.error('Database error:', dbError);
            return sendErrorResponse(res, ERROR_CODES.INTERNAL_ERROR, 'Failed to retrieve Nextdoor token from database.', {
              error: dbError.message
            });
          }
        }

        if (!accessToken) {
          return sendErrorResponse(res, ERROR_CODES.AUTHENTICATION_ERROR, 'Nextdoor access token is required. Please provide a token or connect your account.', {
            receivedData: { hasText: !!text, useDatabaseToken, hasAccessToken: !!access_token }
          });
        }

        // Post to Nextdoor
        // Note: Update this URL based on Nextdoor's actual API endpoint
        console.log('Posting to Nextdoor...', { textLength: text.length });
        
        const postResponse = await axios.post(
          'https://api.nextdoor.com/v1/posts',
          {
            text: text,
            visibility: 'neighborhood' // or 'public' depending on Nextdoor API
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        const postData = postResponse.data;
        const postId = postData.id || postData.post_id;
        const postUrl = postData.url || `https://nextdoor.com/posts/${postId}`;

        console.log('✅ Nextdoor post successful:', { postId, postUrl });

        return res.status(200).json({
          success: true,
          message: 'Post published to Nextdoor successfully',
          postId: postId,
          postUrl: postUrl,
          data: postData
        });

      } catch (error) {
        return handleUnexpectedError(res, error, 'Nextdoor Post Handler');
      }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Nextdoor Post Handler');
  }
};

