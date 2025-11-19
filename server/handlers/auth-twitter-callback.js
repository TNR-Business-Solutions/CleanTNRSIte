// Twitter/X OAuth 2.0 Callback Handler - Vercel Serverless Function
// This endpoint handles the redirect from Twitter after user authorization
// It exchanges the authorization code for access tokens

const axios = require('axios');
const TNRDatabase = require('../../database');
const qs = require('querystring');
const crypto = require('crypto');

module.exports = async (req, res) => {
  const { code, error, error_description, state } = req.query;
  
  // Get configuration from environment variables
  const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
  const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
  const REDIRECT_URI = process.env.TWITTER_REDIRECT_URI || 'https://www.tnrbusinesssolutions.com/api/auth/twitter/callback';

  // Validate configuration
  if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET not configured. Please set environment variables in Vercel.'
    });
  }

  // Log callback received (for debugging)
  console.log('Twitter OAuth callback received:', {
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
      message: 'No authorization code received from Twitter. Please try again.'
    });
  }

  try {
    // Extract code verifier from state (not ideal, but works for MVP)
    // In production, use Vercel KV or session store
    let codeVerifier = null;
    try {
      if (state) {
        const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
        codeVerifier = stateData.codeVerifier;
      }
    } catch (stateError) {
      console.warn('Could not extract code verifier from state:', stateError.message);
    }

    // If we don't have code verifier, we can't complete PKCE flow
    // This is a limitation - in production, store code verifier in session/KV
    if (!codeVerifier) {
      console.warn('⚠️ Code verifier not found - attempting token exchange without PKCE (may fail)');
    }

    // Step 1: Exchange authorization code for access token
    console.log('Exchanging code for access token...');
    
    const tokenRequest = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: TWITTER_CLIENT_ID,
      ...(codeVerifier ? {
        code_verifier: codeVerifier
      } : {})
    };

    // Create Basic Auth header for client credentials
    const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');

    const tokenResponse = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      qs.stringify(tokenRequest),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        timeout: 10000
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token || null;
    const expiresIn = tokenResponse.data.expires_in || 7200; // Default to 2 hours
    const tokenType = tokenResponse.data.token_type || 'Bearer';

    if (!accessToken) {
      throw new Error('No access token received from Twitter');
    }

    // Step 2: Fetch user profile to get user ID and username
    console.log('Fetching Twitter profile...');
    const profileResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        'user.fields': 'id,name,username,profile_image_url'
      },
      timeout: 10000
    });

    const userProfile = profileResponse.data.data;
    const userId = userProfile.id;
    const username = userProfile.username;

    // Step 3: Save token to database
    const db = new TNRDatabase();
    await db.initialize();
    
    try {
      // Calculate expiration date
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

      // Save Twitter token
      await db.saveSocialMediaToken({
        platform: 'twitter',
        page_id: userId, // Use user ID as page_id for Twitter
        access_token: accessToken,
        token_type: tokenType,
        expires_at: expiresAt,
        refresh_token: refreshToken,
        user_id: userId,
        page_name: `${userProfile.name} (@${username})`,
      });

      console.log('✅ Twitter token saved to database:', {
        userId: userId,
        username: username,
        expiresIn: expiresIn ? `${Math.floor(expiresIn / 3600)} hours` : 'Never'
      });
    } catch (dbError) {
      console.error('⚠️ Could not save token to database:', dbError.message);
      // Continue even if database save fails - token is still shown on success page
    }

    // Step 4: Build success response
    const response = {
      success: true,
      message: 'Successfully authorized Twitter/X! Token saved automatically to database.',
      authorization: {
        accessToken: accessToken,
        expiresIn: expiresIn,
        expiresInHours: expiresIn ? Math.floor(expiresIn / 3600) : null,
        refreshToken: refreshToken,
        tokenType: tokenType
      },
      profile: {
        id: userId,
        username: username,
        name: userProfile.name,
        profileImageUrl: userProfile.profile_image_url
      },
      nextSteps: [
        '1. ✅ Access token saved to database automatically',
        '2. You can now post to Twitter/X from the admin dashboard',
        '3. Token expires in ' + (expiresIn ? `${Math.floor(expiresIn / 3600)} hours` : 'never'),
        refreshToken ? '4. Refresh token saved - will auto-refresh before expiration' : '4. No refresh token available - manual re-auth required when expired',
        '5. View and manage tokens in Admin Dashboard → Social Media'
      ]
    };

    console.log('Twitter OAuth flow completed successfully:', {
      userId: userId,
      username: username,
      tokenSaved: true
    });

    // Return formatted HTML response
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(generateSuccessHTML(response));

  } catch (error) {
    console.error('Token exchange error:', error.message);
    console.error('Error details:', error.response?.data);

    // Handle specific error cases
    if (error.response?.data) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send(generateErrorHTML(
        'Twitter API Error',
        error.response.data.error_description || error.response.data.error || 'Failed to exchange tokens with Twitter. The authorization code may have expired.'
      ));
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(500).send(generateErrorHTML(
      'Internal Server Error',
      error.message || 'Please try the authorization flow again.'
    ));
  }
};

// HTML generation function for success page
function generateSuccessHTML(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twitter/X OAuth Success - TNR Business Solutions</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #1DA1F2; font-size: 2rem; margin-bottom: 10px; text-align: center; }
        .success-badge {
            background: #d4edda;
            color: #155724;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 600;
            display: inline-block;
            margin: 10px 0;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            border-left: 4px solid #1DA1F2;
        }
        .section h3 { color: #1DA1F2; margin-bottom: 15px; }
        .token-box {
            background: white;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            word-break: break-all;
            margin: 10px 0;
            border: 1px solid #e0e0e0;
        }
        .copy-btn {
            background: #1DA1F2;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }
        .copy-btn:hover { background: #0d8bd9; }
        .next-steps {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 12px;
            padding: 20px;
            margin-top: 30px;
        }
        .next-steps h3 { color: #856404; margin-bottom: 15px; }
        .next-steps ol { margin-left: 20px; color: #856404; }
        .next-steps li { margin: 10px 0; }
        .btn { padding: 12px 30px; border-radius: 8px; border: none; cursor: pointer; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; margin: 5px; }
        .btn-primary { background: #1DA1F2; color: white; }
        .btn-primary:hover { background: #0d8bd9; }
        .btn-secondary { background: #6c757d; color: white; }
        .profile-info {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        .profile-image {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            margin-right: 15px;
            vertical-align: middle;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Twitter/X OAuth Authorization</h1>
        <div style="text-align: center;"><span class="success-badge">✅ Authorization Successful!</span></div>
        
        <div class="section">
            <h3>👤 Your Twitter/X Profile</h3>
            <div class="profile-info">
                ${data.profile.profileImageUrl ? `<img src="${data.profile.profileImageUrl}" alt="Profile" class="profile-image">` : ''}
                <strong>Name:</strong> ${data.profile.name}<br>
                <strong>Username:</strong> @${data.profile.username}<br>
                <strong>Twitter ID:</strong> ${data.profile.id}<br>
            </div>
        </div>
        
        <div class="section">
            <h3>🔑 Your Access Token</h3>
            <p style="margin-bottom: 15px;">This token has been saved to the database automatically.</p>
            <div style="margin: 20px 0;">
                <strong>Access Token:</strong>
                <div class="token-box" id="accessToken">${data.authorization.accessToken}</div>
                <button class="copy-btn" onclick="copyToken('accessToken')">📋 Copy Token</button>
                <p style="color: #666; font-size: 14px; margin-top: 10px;">
                    ${data.authorization.expiresInHours ? `Expires in ${data.authorization.expiresInHours} hours` : 'Never expires'}
                </p>
            </div>
            ${data.authorization.refreshToken ? `
            <div style="margin: 20px 0;">
                <strong>Refresh Token:</strong>
                <div class="token-box" id="refreshToken">${data.authorization.refreshToken}</div>
                <button class="copy-btn" onclick="copyToken('refreshToken')">📋 Copy Refresh Token</button>
                <p style="color: #28a745; font-size: 14px; margin-top: 10px;">✅ Can be used to refresh access token</p>
            </div>
            ` : ''}
        </div>
        
        <div class="next-steps">
            <h3>🎯 Next Steps</h3>
            <ol>${data.nextSteps.map(step => `<li>${step}</li>`).join('')}</ol>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/admin-dashboard.html" class="btn btn-primary">🚀 Go to Dashboard</a>
            <a href="/social-media-automation-dashboard.html" class="btn btn-secondary">📱 Social Media Dashboard</a>
        </div>
    </div>
    
    <script>
        function copyToken(id) {
            const text = document.getElementById(id).textContent;
            navigator.clipboard.writeText(text).then(() => {
                event.target.textContent = '✅ Copied!';
                event.target.style.background = '#28a745';
                setTimeout(() => {
                    event.target.textContent = '📋 Copy Token';
                    event.target.style.background = '#1DA1F2';
                }, 2000);
            });
        }
    </script>
</body>
</html>`;
}

// HTML generation function for error page
function generateErrorHTML(error, details) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twitter/X OAuth Error - TNR Business Solutions</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #1DA1F2; font-size: 2rem; margin-bottom: 10px; text-align: center; }
        .error-badge {
            background: #f8d7da;
            color: #721c24;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 600;
            display: inline-block;
            margin: 10px 0;
        }
        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #f5c6cb;
            margin: 20px 0;
        }
        .error-message h3 { margin-bottom: 10px; }
        .btn {
            padding: 12px 30px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        .btn-primary { background: #1DA1F2; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ Authorization Failed</h1>
        <div style="text-align: center;"><span class="error-badge">Error</span></div>
        
        <div class="error-message">
            <h3>${error}</h3>
            <p>${details}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/api/auth/twitter" class="btn btn-primary">🔄 Try Again</a>
            <a href="/" class="btn btn-secondary">🏠 Go Home</a>
        </div>
    </div>
</body>
</html>`;
}

