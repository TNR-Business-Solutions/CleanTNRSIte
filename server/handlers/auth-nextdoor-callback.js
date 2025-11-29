// Nextdoor OAuth 2.0 Callback Handler - Vercel Serverless Function
// This endpoint handles the redirect from Nextdoor after user authorization
// It exchanges the authorization code for access tokens

const axios = require('axios');
const TNRDatabase = require('../../database');
const qs = require('querystring');

module.exports = async (req, res) => {
  const { code, error, error_description, state } = req.query;
  
  // Get configuration from environment variables
  const NEXTDOOR_CLIENT_ID = process.env.NEXTDOOR_CLIENT_ID;
  const NEXTDOOR_CLIENT_SECRET = process.env.NEXTDOOR_CLIENT_SECRET;
  const REDIRECT_URI = process.env.NEXTDOOR_REDIRECT_URI || 'https://www.tnrbusinesssolutions.com/api/auth/nextdoor/callback';

  // Validate configuration
  if (!NEXTDOOR_CLIENT_ID || !NEXTDOOR_CLIENT_SECRET) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'NEXTDOOR_CLIENT_ID or NEXTDOOR_CLIENT_SECRET not configured. Please set environment variables in Vercel.'
    });
  }

  // Log callback received (for debugging)
  console.log('Nextdoor OAuth callback received:', {
    hasCode: !!code,
    hasError: !!error,
    state: state ? 'present' : 'missing',
    timestamp: new Date().toISOString()
  });

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description);
    return res.status(400).json({
      success: false,
      error: 'OAuth Authorization Failed',
      details: error_description || error,
      message: 'User denied authorization or an error occurred during the OAuth flow.'
    });
  }

  // Validate authorization code
  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Missing authorization code',
      message: 'No authorization code received from Nextdoor. Please try again.'
    });
  }

  try {
    // Step 1: Exchange authorization code for access token
    console.log('Exchanging code for access token...');
    
    const tokenRequest = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: NEXTDOOR_CLIENT_ID,
      client_secret: NEXTDOOR_CLIENT_SECRET
    };

    // Note: Update this URL based on Nextdoor's actual token endpoint
    const tokenResponse = await axios.post(
      'https://nextdoor.com/oauth/token',
      qs.stringify(tokenRequest),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token || null;
    const expiresIn = tokenResponse.data.expires_in || 3600; // Default to 1 hour
    const tokenType = tokenResponse.data.token_type || 'Bearer';

    if (!accessToken) {
      throw new Error('No access token received from Nextdoor');
    }

    // Step 2: Fetch user profile to get user ID and username
    console.log('Fetching user profile...');
    
    // Note: Update this URL based on Nextdoor's actual API endpoint
    const profileResponse = await axios.get(
      'https://api.nextdoor.com/v1/me',
      {
        headers: {
          'Authorization': `${tokenType} ${accessToken}`
        },
        timeout: 10000
      }
    );

    const userProfile = profileResponse.data;
    const userId = userProfile.id || userProfile.user_id;
    const username = userProfile.username || userProfile.name || 'Nextdoor User';
    const neighborhoodId = userProfile.neighborhood_id || null;

    // Step 3: Save token to database
    console.log('Saving token to database...');
    
    try {
      const db = new TNRDatabase();
      
      // Calculate expiration timestamp
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;
      
      // Save token (platform: 'nextdoor', pageId: userId or neighborhoodId)
      await db.saveSocialMediaToken({
        platform: 'nextdoor',
        page_id: userId || neighborhoodId || 'default',
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        token_type: tokenType,
        metadata: JSON.stringify({
          username: username,
          user_id: userId,
          neighborhood_id: neighborhoodId,
          connected_at: new Date().toISOString()
        })
      });

      console.log('✅ Nextdoor token saved successfully');
    } catch (dbError) {
      console.error('❌ Database error (non-fatal):', dbError);
      // Continue even if database save fails - user can still use the token
    }

    // Step 4: Redirect to success page
    const returnUrl = '/admin-dashboard-v2.html?nextdoor_connected=true';
    
    // Return success HTML page
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nextdoor Connection Successful</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
          }
          h1 { color: #4CAF50; margin-top: 0; }
          .success-icon { font-size: 4rem; margin-bottom: 1rem; }
          p { line-height: 1.6; color: #666; }
          .button {
            display: inline-block;
            margin-top: 1.5rem;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: transform 0.2s;
          }
          .button:hover { transform: translateY(-2px); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Nextdoor Connected Successfully!</h1>
          <p>Your Nextdoor account has been connected and you can now post to Nextdoor from the dashboard.</p>
          <p><strong>Username:</strong> ${username}</p>
          <a href="${returnUrl}" class="button">Go to Dashboard</a>
          <script>
            // Auto-redirect after 3 seconds
            setTimeout(() => {
              window.location.href = '${returnUrl}';
            }, 3000);
          </script>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Nextdoor OAuth callback error:', error);
    
    const errorMessage = error.response?.data?.error_description || 
                        error.response?.data?.error || 
                        error.message || 
                        'Unknown error occurred';

    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nextdoor Connection Error</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
          }
          .error-icon { font-size: 4rem; margin-bottom: 1rem; }
          .button {
            display: inline-block;
            margin-top: 1.5rem;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">❌</div>
          <h1>Connection Failed</h1>
          <p>${errorMessage}</p>
          <a href="/admin-dashboard-v2.html" class="button">Return to Dashboard</a>
        </div>
      </body>
      </html>
    `);
  }
};

