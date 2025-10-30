// Meta OAuth Callback Handler - Vercel Serverless Function
// This endpoint handles the redirect from Facebook after user authorization
// It exchanges the authorization code for access tokens

const axios = require('axios');

module.exports = async (req, res) => {
  const { code, error, error_description, state } = req.query;
  
  // Get configuration from environment variables
  const META_APP_ID = process.env.META_APP_ID;
  const META_APP_SECRET = process.env.META_APP_SECRET;
  const REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://www.tnrbusinesssolutions.com/api/auth/meta/callback';

  // Validate configuration
  if (!META_APP_ID || !META_APP_SECRET) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'META_APP_ID or META_APP_SECRET not configured. Please set environment variables in Vercel.'
    });
  }

  // Log callback received (for debugging)
  console.log('Meta OAuth callback received:', {
    hasCode: !!code,
    hasError: !!error,
    state: state,
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
      message: 'No authorization code received from Facebook. Please try again.'
    });
  }

  try {
    // Step 1: Exchange authorization code for short-lived user access token
    console.log('Exchanging code for access token...');
    const tokenResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code
      },
      timeout: 10000 // 10 second timeout
    });

    const shortLivedToken = tokenResponse.data.access_token;

    if (!shortLivedToken) {
      throw new Error('No access token received from Facebook');
    }

    // Step 2: Exchange short-lived token for long-lived token (60 days)
    console.log('Exchanging for long-lived token...');
    const longLivedResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        fb_exchange_token: shortLivedToken
      },
      timeout: 10000
    });

    const longLivedUserToken = longLivedResponse.data.access_token;
    const expiresIn = longLivedResponse.data.expires_in || 5184000; // Default to 60 days if not provided

    // Step 3: Fetch user's managed Facebook Pages
    console.log('Fetching managed pages with token:', longLivedUserToken.substring(0, 20) + '...');
    const pagesResponse = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { 
        access_token: longLivedUserToken,
        fields: 'id,name,access_token,category,instagram_business_account',
        limit: 100
      },
      timeout: 10000
    });

    console.log('Pages API response:', JSON.stringify(pagesResponse.data, null, 2));
    const pages = pagesResponse.data.data || [];
    console.log('Number of pages found:', pages.length);

    if (pages.length === 0) {
      console.warn('WARNING: No pages returned from Facebook API');
      console.warn('User token used:', longLivedUserToken.substring(0, 30) + '...');
      
      // Try to get debug info about the token
      try {
        const debugResponse = await axios.get('https://graph.facebook.com/v19.0/debug_token', {
          params: {
            input_token: longLivedUserToken,
            access_token: longLivedUserToken
          },
          timeout: 10000
        });
        console.log('Token debug info:', JSON.stringify(debugResponse.data, null, 2));
      } catch (debugError) {
        console.error('Could not debug token:', debugError.message);
      }
    }

    // Step 4: For each page with Instagram, fetch Instagram account details
    console.log('Fetching Instagram accounts...');
    const pagesWithInstagram = await Promise.all(
      pages.map(async (page) => {
        if (page.instagram_business_account) {
          try {
            const igResponse = await axios.get(
              `https://graph.facebook.com/v19.0/${page.instagram_business_account.id}`,
              {
                params: {
                  access_token: page.access_token,
                  fields: 'id,username,name,profile_picture_url'
                },
                timeout: 10000
              }
            );
            return {
              ...page,
              instagram_account: igResponse.data
            };
          } catch (igError) {
            console.error('Error fetching Instagram account:', igError.message);
            return page;
          }
        }
        return page;
      })
    );

    // Step 5: Build success response with tokens and page information
    const response = {
      success: true,
      message: 'Successfully authorized! Save these tokens securely.',
      authorization: {
        longLivedUserToken: longLivedUserToken,
        expiresIn: expiresIn,
        expiresInDays: Math.floor(expiresIn / 86400)
      },
      pages: pagesWithInstagram.map(page => ({
        id: page.id,
        name: page.name,
        category: page.category,
        accessToken: page.access_token,
        hasInstagram: !!page.instagram_business_account,
        instagramAccount: page.instagram_account ? {
          id: page.instagram_account.id,
          username: page.instagram_account.username,
          name: page.instagram_account.name
        } : null
      })),
      nextSteps: [
        '1. Save the page access tokens securely (they don\'t expire)',
        '2. Add tokens to your social media automation dashboard',
        '3. Test posting to Facebook and Instagram',
        '4. Set up automated posting schedules'
      ]
    };

    console.log('OAuth flow completed successfully:', {
      pageCount: pages.length,
      instagramAccounts: pagesWithInstagram.filter(p => p.instagram_account).length
    });

    // If no pages but authorization succeeded, show special message
    if (pages.length === 0) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(generateNoPagesHTML(response.authorization.longLivedUserToken));
    }

    // Return formatted HTML response with embedded data
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(generateSuccessHTML(response));

  } catch (error) {
    console.error('Token exchange error:', error.message);
    console.error('Error details:', error.response?.data);

    // Handle specific error cases
    if (error.response?.data) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send(generateErrorHTML(
        'Facebook API Error',
        error.response.data.error?.message || 'Failed to exchange tokens with Facebook. The authorization code may have expired.'
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
    <title>OAuth Success - TNR Business Solutions</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        h1 { color: #667eea; font-size: 2rem; margin-bottom: 10px; text-align: center; }
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
            border-left: 4px solid #667eea;
        }
        .section h3 { color: #667eea; margin-bottom: 15px; }
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
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }
        .copy-btn:hover { background: #5568d3; }
        .page-item {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border: 1px solid #e0e0e0;
        }
        .page-name { font-size: 1.2rem; font-weight: 600; color: #333; margin-bottom: 10px; }
        .instagram-badge {
            background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 5px;
            display: inline-block;
        }
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
        .btn-primary { background: #667eea; color: white; }
        .btn-primary:hover { background: #5568d3; }
        .btn-secondary { background: #6c757d; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Meta OAuth Authorization</h1>
        <div style="text-align: center;"><span class="success-badge">✅ Authorization Successful!</span></div>
        
        <div class="section">
            <h3>📋 Your Access Tokens</h3>
            <p style="margin-bottom: 15px;">Save these tokens securely. You'll need them to post to Facebook and Instagram.</p>
            <div style="margin: 20px 0;">
                <strong>Long-Lived User Token:</strong>
                <div class="token-box" id="userToken">${data.authorization.longLivedUserToken}</div>
                <button class="copy-btn" onclick="copyToken('userToken')">📋 Copy User Token</button>
                <p style="color: #666; font-size: 14px; margin-top: 10px;">Expires in ${data.authorization.expiresInDays} days</p>
            </div>
        </div>
        
        <div class="section">
            <h3>📱 Connected Pages (${data.pages.length})</h3>
            ${data.pages.map(page => `
                <div class="page-item">
                    <div class="page-name">${page.name}</div>
                    <div style="color: #666; font-size: 14px; margin: 5px 0;">ID: ${page.id} | Category: ${page.category}</div>
                    ${page.hasInstagram ? `<div class="instagram-badge">📷 Instagram: @${page.instagramAccount?.username}</div>` : ''}
                    
                    <div style="margin-top: 15px;">
                        <strong>Page Access Token:</strong>
                        <div class="token-box" id="pageToken${page.id}">${page.accessToken}</div>
                        <button class="copy-btn" onclick="copyToken('pageToken${page.id}')">📋 Copy Token</button>
                        <p style="color: #28a745; font-size: 14px; margin-top: 10px;">✅ Never expires!</p>
                    </div>
                    ${page.instagramAccount ? `
                        <div style="margin-top: 15px;">
                            <strong>Instagram ID:</strong>
                            <div class="token-box">${page.instagramAccount.id}</div>
                            <p style="color: #666; font-size: 14px; margin-top: 5px;">Use with page token to post to Instagram</p>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="next-steps">
            <h3>🎯 Next Steps</h3>
            <ol>${data.nextSteps.map(step => `<li>${step}</li>`).join('')}</ol>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/gmb-post-generator.html" class="btn btn-primary">📝 Post Generator</a>
            <a href="/social-media-automation-dashboard.html" class="btn btn-secondary">🚀 Dashboard</a>
            <button class="btn btn-secondary" onclick="downloadTokens()">💾 Download</button>
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
                    event.target.style.background = '#667eea';
                }, 2000);
            });
        }
        
        function downloadTokens() {
            const data = ${JSON.stringify(data)};
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'meta-oauth-tokens.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
}

// HTML generation function for no pages found
function generateNoPagesHTML(userToken) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>No Pages Found - TNR Business Solutions</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        h1 { color: #667eea; font-size: 2rem; margin-bottom: 10px; text-align: center; }
        .warning-badge {
            background: #fff3cd;
            color: #856404;
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
            border-left: 4px solid #ffc107;
        }
        .section h3 { color: #856404; margin-bottom: 15px; }
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
        .btn-primary { background: #667eea; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .code { background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; margin: 10px 0; word-break: break-all; }
        ol { margin-left: 20px; margin-top: 10px; }
        li { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚠️ No Pages Connected</h1>
        <div style="text-align: center;"><span class="warning-badge">Authorization Successful, But...</span></div>
        
        <div class="section">
            <h3>🤔 What Happened?</h3>
            <p>Facebook authorized your app successfully, but we couldn't retrieve any Page Access Tokens. This usually happens when:</p>
            <ol>
                <li><strong>Pages weren't actually selected during OAuth</strong> - Even though you saw "1 Page selected"</li>
                <li><strong>Permission timing issue</strong> - Facebook needs a moment to process the permissions</li>
                <li><strong>Permissions need manual grant in Business Settings</strong></li>
            </ol>
        </div>
        
        <div class="section">
            <h3>✅ Solution: Manually Get Your Page Token</h3>
            <p><strong>Option 1: Use Facebook Graph API Explorer (Recommended)</strong></p>
            <ol>
                <li>Go to: <a href="https://developers.facebook.com/tools/explorer/" target="_blank" style="color: #667eea;">developers.facebook.com/tools/explorer/</a></li>
                <li>Select your app: <strong>TNR Social Automation</strong></li>
                <li>Click "Generate Access Token"</li>
                <li>Select permissions: <code>pages_manage_posts</code>, <code>pages_read_engagement</code>, <code>pages_show_list</code>, <code>pages_manage_metadata</code></li>
                <li>Click "Get Token" → "Get Page Access Token"</li>
                <li>Select <strong>TNR Business Solutions</strong> page</li>
                <li>Copy the token and paste it in the dashboard!</li>
            </ol>
        </div>
        
        <div class="section">
            <h3>💡 Workaround: Your User Token</h3>
            <p>We did get your User Access Token. While this won't work for posting, you can use the Graph API Explorer method above.</p>
            <div class="code">${userToken}</div>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">This token expires in 60 days and is for debugging only.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/auth/meta" class="btn btn-primary">🔄 Try OAuth Again</a>
            <a href="https://developers.facebook.com/tools/explorer/" target="_blank" class="btn btn-secondary">🔧 Graph API Explorer</a>
            <a href="/social-media-automation-dashboard.html" class="btn btn-secondary">🏠 Dashboard</a>
        </div>
        
        <div class="section" style="border-left-color: #17a2b8; background: #d1ecf1;">
            <h3 style="color: #0c5460;">📞 Need Help?</h3>
            <p>Check the Vercel function logs for more details about why pages weren't returned. The logs will show the exact Facebook API response.</p>
        </div>
    </div>
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
    <title>OAuth Error - TNR Business Solutions</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        h1 { color: #667eea; font-size: 2rem; margin-bottom: 10px; text-align: center; }
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
        .btn-primary { background: #667eea; color: white; }
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
            <a href="/api/auth/meta" class="btn btn-primary">🔄 Try Again</a>
            <a href="/" class="btn btn-secondary">🏠 Go Home</a>
        </div>
    </div>
</body>
</html>`;
}

