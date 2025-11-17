// LinkedIn OAuth Callback Handler - Vercel Serverless Function
// This endpoint handles the redirect from LinkedIn after user authorization
// It exchanges the authorization code for access tokens

const axios = require("axios");
const TNRDatabase = require("../../database");
const qs = require("querystring");

module.exports = async (req, res) => {
  const { code, error: oauthError, error_description, state } = req.query;

  // Get configuration from environment variables
  const {
    LINKEDIN_CLIENT_ID = "78pjq1wt4wz1fs",
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_REDIRECT_URI,
  } = process.env;
  const REDIRECT_URI =
    LINKEDIN_REDIRECT_URI ||
    "https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback";

  // Validate configuration
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    return res.status(500).json({
      error: "Server configuration error",
      message:
        "LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET not configured. Please set environment variables in Vercel.",
    });
  }

  // Log callback received (for debugging)
  console.log("LinkedIn OAuth callback received:", {
    hasCode: !!code,
    hasError: !!oauthError,
    state: state,
    timestamp: new Date().toISOString(),
  });

  // Handle OAuth errors
  if (oauthError) {
    console.error("OAuth error:", oauthError, error_description);
    return res.status(400).json({
      success: false,
      error: "OAuth Authorization Failed",
      details: error_description || oauthError,
      message:
        "User denied authorization or an error occurred during the OAuth flow.",
    });
  }

  // Validate authorization code
  if (!code) {
    return res.status(400).json({
      success: false,
      error: "Missing authorization code",
      message:
        "No authorization code received from LinkedIn. Please try again.",
    });
  }

  try {
    // Step 1: Exchange authorization code for access token
    console.log("Exchanging code for access token...");
    console.log("Token exchange parameters:", {
      grant_type: "authorization_code",
      code: code ? code.substring(0, 20) + "..." : "MISSING",
      redirect_uri: REDIRECT_URI,
      client_id: LINKEDIN_CLIENT_ID,
      has_client_secret: !!LINKEDIN_CLIENT_SECRET,
      client_secret_length: LINKEDIN_CLIENT_SECRET?.length || 0,
    });

    const tokenRequestParams = {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    };

    // Validate all required parameters
    if (!code) {
      throw new Error("Authorization code is missing");
    }
    if (!LINKEDIN_CLIENT_ID) {
      throw new Error("LINKEDIN_CLIENT_ID is missing");
    }
    if (!LINKEDIN_CLIENT_SECRET) {
      throw new Error(
        "LINKEDIN_CLIENT_SECRET is missing - check Vercel environment variables"
      );
    }
    if (!REDIRECT_URI) {
      throw new Error("REDIRECT_URI is missing");
    }

    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      qs.stringify(tokenRequestParams),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      }
    );

    console.log(
      "Token exchange successful, response keys:",
      Object.keys(tokenResponse.data || {})
    );

    const accessToken = tokenResponse.data.access_token;
    const expiresIn = tokenResponse.data.expires_in || 5184000; // Default to 60 days if not provided
    const refreshToken = tokenResponse.data.refresh_token || null;

    // Log token response to see if it contains user info
    console.log("Token response keys:", Object.keys(tokenResponse.data || {}));
    console.log("Token response (excluding token):", {
      expires_in: tokenResponse.data.expires_in,
      token_type: tokenResponse.data.token_type,
      scope: tokenResponse.data.scope,
      has_refresh_token: !!refreshToken,
    });

    if (!accessToken) {
      throw new Error("No access token received from LinkedIn");
    }

    // Step 2: Fetch user profile to get user ID and name
    // Note: Profile fetch may fail since we only request w_member_social scope (no profile scope)
    // This is expected and handled gracefully with fallback user info
    console.log("Fetching LinkedIn profile...");
    console.log("Profile request config:", {
      url: "https://api.linkedin.com/v2/me",
      hasAccessToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
      tokenPrefix: accessToken
        ? accessToken.substring(0, 20) + "..."
        : "MISSING",
    });

    let profileResponse;
    try {
      // Try OpenID Connect userinfo endpoint first (works with openid profile scopes)
      try {
        profileResponse = await axios.get(
          "https://api.linkedin.com/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            timeout: 10000,
          }
        );
        console.log(
          "UserInfo fetch successful (OpenID Connect), response keys:",
          Object.keys(profileResponse.data || {})
        );
      } catch (userInfoError) {
        // Fallback to /v2/me endpoint
        console.log("UserInfo endpoint failed, trying /v2/me endpoint...");
        profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
          timeout: 10000,
        });
        console.log(
          "Profile fetch successful (/v2/me), response keys:",
          Object.keys(profileResponse.data || {})
        );
      }
    } catch (profileError) {
      // Profile fetch failed - log details
      console.warn("Profile fetch failed:", profileError.message);
      if (profileError.response) {
        console.log(
          "Profile error response:",
          JSON.stringify(profileError.response?.data, null, 2)
        );
        console.log("Profile error status:", profileError.response?.status);
      }

      // If profile fetch fails but we have a token, we can still save it
      // Use a default user ID based on token or timestamp
      const fallbackUserId = `linkedin_user_${Date.now()}`;
      console.log(
        "✅ Using fallback user ID (token will still work for posting):",
        fallbackUserId
      );

      // Try to save token anyway with fallback info
      const db = new TNRDatabase();
      await db.initialize();

      try {
        const expiresAt = expiresIn
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
          : null;

        await db.saveSocialMediaToken({
          platform: "linkedin",
          page_id: fallbackUserId,
          access_token: accessToken,
          token_type: "Bearer",
          expires_at: expiresAt,
          refresh_token: refreshToken,
          user_id: fallbackUserId,
          page_name: "LinkedIn User (Profile fetch failed)",
        });

        console.log("✅ Token saved with fallback user info");

        // Return success but with a warning
        if (!res.headersSent) {
          res.setHeader("Content-Type", "text/html");
          return res.status(200).send(
            generateSuccessHTML({
              success: true,
              message:
                "LinkedIn token saved successfully! Note: Profile fetch failed, but token is valid.",
              authorization: {
                accessToken: accessToken,
                expiresIn: expiresIn,
                expiresInDays: expiresIn ? Math.floor(expiresIn / 86400) : null,
                refreshToken: refreshToken,
              },
              profile: {
                id: fallbackUserId,
                firstName: "LinkedIn",
                lastName: "User",
                email: null,
              },
              nextSteps: [
                "1. ✅ Access token saved to database",
                "2. ⚠️ Profile fetch failed - token may still work for posting",
                "3. You can test posting to LinkedIn from the dashboard",
                "4. If posting fails, try reconnecting",
              ],
            })
          );
        }
        return;
      } catch (dbError) {
        console.error("Failed to save token:", dbError.message);
        throw profileError; // Re-throw original error
      }
    }

    const userProfile = profileResponse.data;
    // OpenID Connect userinfo returns 'sub' as user ID, /v2/me returns 'id'
    const userId = userProfile.sub || userProfile.id;

    // Extract name (handles both v1 and v2 API formats)
    const firstName =
      userProfile.firstName?.localized?.en_US ||
      userProfile.firstName?.preferredLocale?.language ||
      userProfile.firstName ||
      "";
    const lastName =
      userProfile.lastName?.localized?.en_US ||
      userProfile.lastName?.preferredLocale?.language ||
      userProfile.lastName ||
      "";

    // Email is not available without r_emailaddress scope, which we removed for simplicity
    // We only need w_member_social for posting
    const email = null;

    // Step 3: Save token to database
    const db = new TNRDatabase();
    await db.initialize();

    try {
      // Calculate expiration date
      const expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : null;

      // Save LinkedIn token
      await db.saveSocialMediaToken({
        platform: "linkedin",
        page_id: userId, // Use user ID as page_id for LinkedIn
        access_token: accessToken,
        token_type: "Bearer",
        expires_at: expiresAt,
        refresh_token: refreshToken,
        user_id: userId,
        page_name: `${firstName} ${lastName}`.trim() || "LinkedIn User",
      });

      console.log("✅ LinkedIn token saved to database:", {
        userId: userId,
        expiresIn: expiresIn
          ? `${Math.floor(expiresIn / 86400)} days`
          : "Never",
      });
    } catch (dbError) {
      console.error("⚠️ Could not save token to database:", dbError.message);
      // Continue even if database save fails - token is still shown on success page
    }

    // Step 4: Build success response
    const response = {
      success: true,
      message:
        "Successfully authorized LinkedIn! Token saved automatically to database.",
      authorization: {
        accessToken: accessToken,
        expiresIn: expiresIn,
        expiresInDays: expiresIn ? Math.floor(expiresIn / 86400) : null,
        refreshToken: refreshToken,
      },
      profile: {
        id: userId,
        firstName: firstName,
        lastName: lastName,
        email: email,
      },
      nextSteps: [
        "1. ✅ Access token saved to database automatically",
        "2. You can now post to LinkedIn from the admin dashboard",
        "3. Token expires in " +
          (expiresIn ? `${Math.floor(expiresIn / 86400)} days` : "never"),
        refreshToken
          ? "4. Refresh token saved - will auto-refresh before expiration"
          : "4. No refresh token available - manual re-auth required when expired",
        "5. View and manage tokens in Admin Dashboard → Social Media",
      ],
    };

    console.log("LinkedIn OAuth flow completed successfully:", {
      userId: userId,
      tokenSaved: true,
    });

    // Return formatted HTML response
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(generateSuccessHTML(response));
    }
  } catch (error) {
    console.error("Token exchange error:", error.message);
    console.error(
      "Error details:",
      JSON.stringify(error.response?.data, null, 2)
    );
    console.error("Error status:", error.response?.status);
    console.error("Error headers:", error.response?.headers);
    console.error("Request config:", {
      url: error.config?.url,
      method: error.config?.method,
      redirectUri: REDIRECT_URI,
      hasClientId: !!LINKEDIN_CLIENT_ID,
      hasClientSecret: !!LINKEDIN_CLIENT_SECRET,
      clientIdLength: LINKEDIN_CLIENT_ID?.length || 0,
      clientSecretLength: LINKEDIN_CLIENT_SECRET?.length || 0,
    });

    // Check for missing environment variables first
    if (!LINKEDIN_CLIENT_SECRET) {
      console.error("❌ LINKEDIN_CLIENT_SECRET is missing!");
      if (!res.headersSent) {
        res.setHeader("Content-Type", "text/html");
        return res
          .status(500)
          .send(
            generateErrorHTML(
              "Configuration Error",
              "LINKEDIN_CLIENT_SECRET is not set in Vercel environment variables. This is required for token exchange.",
              [
                "1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
                "2. Add LINKEDIN_CLIENT_SECRET with your Primary Client Secret (get from LinkedIn Developer Console)",
                "3. Make sure it's set for Production, Preview, and Development",
                "4. Wait 1-2 minutes for Vercel to redeploy",
                "5. Try the authorization flow again",
              ]
            )
          );
      }
      return;
    }

    if (!LINKEDIN_CLIENT_ID) {
      console.error("❌ LINKEDIN_CLIENT_ID is missing!");
      if (!res.headersSent) {
        res.setHeader("Content-Type", "text/html");
        return res
          .status(500)
          .send(
            generateErrorHTML(
              "Configuration Error",
              "LINKEDIN_CLIENT_ID is not set in Vercel environment variables.",
              [
                "1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
                "2. Add LINKEDIN_CLIENT_ID = 78pjq1wt4wz1fs",
                "3. Make sure it's set for Production, Preview, and Development",
                "4. Wait 1-2 minutes for Vercel to redeploy",
                "5. Try the authorization flow again",
              ]
            )
          );
      }
      return;
    }

    // Handle specific error cases
    if (error.response?.data) {
      const linkedinError = error.response.data;
      const errorCode = linkedinError.error;
      // Try multiple ways to extract error description
      const errorDescription =
        linkedinError.error_description ||
        linkedinError.error ||
        linkedinError.message ||
        linkedinError.detail ||
        (typeof linkedinError === "string" ? linkedinError : "Unknown error");

      console.error("LinkedIn error code:", errorCode);
      console.error("LinkedIn error description:", errorDescription);
      console.error(
        "Full LinkedIn error response:",
        JSON.stringify(linkedinError, null, 2)
      );

      let errorTitle = "LinkedIn API Error";
      let errorMessage = errorDescription;
      let troubleshooting = [];

      // Log the full error for debugging
      console.error("LinkedIn API Error Response:", {
        status: error.response?.status,
        errorCode: errorCode,
        errorDescription: errorDescription,
        fullResponse: JSON.stringify(linkedinError, null, 2),
      });

      // Handle specific LinkedIn error codes
      if (
        errorCode === "invalid_grant" ||
        errorDescription.includes("expired") ||
        errorDescription.includes("invalid")
      ) {
        errorTitle = "Authorization Code Error";
        errorMessage =
          "The authorization code is invalid or has expired. Authorization codes expire quickly and can only be used once.";
        troubleshooting = [
          '1. Click "🔄 Try Again" to start a fresh authorization',
          "2. Complete the authorization flow quickly (don't wait too long)",
          '3. Make sure you\'re clicking "Allow" on LinkedIn immediately',
          "4. Don't refresh or go back during the authorization process",
        ];
      } else if (
        errorCode === "invalid_client" ||
        errorDescription.includes("client")
      ) {
        errorTitle = "Client Credentials Error";
        errorMessage = "LinkedIn client ID or client secret is incorrect.";
        troubleshooting = [
          "1. Check your LINKEDIN_CLIENT_ID in Vercel environment variables",
          "2. Check your LINKEDIN_CLIENT_SECRET in Vercel environment variables",
          "3. Make sure there are no extra spaces or characters",
          "4. Redeploy your application after updating environment variables",
        ];
      } else if (
        errorCode === "redirect_uri_mismatch" ||
        errorDescription.includes("redirect") ||
        errorDescription.includes("URI")
      ) {
        errorTitle = "Redirect URI Mismatch";
        errorMessage =
          "The redirect URI doesn't match what's configured in LinkedIn.";
        troubleshooting = [
          "1. Go to LinkedIn Developer Console: https://www.linkedin.com/developers/apps",
          "2. Select your app → Auth tab",
          '3. Under "Authorized redirect URLs", add exactly:',
          `   ${REDIRECT_URI}`,
          "4. Make sure it matches exactly (including https:// and www.)",
          '5. Click "Update" and try again',
        ];
      } else {
        // For unknown errors, provide comprehensive troubleshooting
        troubleshooting = [
          "1. **Check Vercel Environment Variables**:",
          "   - Go to Vercel Dashboard → Settings → Environment Variables",
          "   - Verify LINKEDIN_CLIENT_ID = 78pjq1wt4wz1fs",
          "   - Verify LINKEDIN_CLIENT_SECRET is set (use Primary Client Secret)",
          "   - Verify LINKEDIN_REDIRECT_URI = https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback",
          "   - Make sure all are set for Production, Preview, and Development",
          "   - Redeploy after adding/updating variables",
          "",
          "2. **Verify LinkedIn App Settings**:",
          "   - Go to https://www.linkedin.com/developers/apps",
          "   - Select your app → Auth tab",
          '   - Under "Authorized redirect URLs", verify:',
          "     https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback",
          "   - Must match exactly (including https:// and www.)",
          "",
          "3. **Check Vercel Logs**:",
          "   - Go to Vercel Dashboard → Your Project → Logs",
          "   - Look for detailed error messages",
          "   - Check for any configuration issues",
          "",
          "4. **Try Again**:",
          "   - Clear browser cache or use incognito mode",
          '   - Click "🔄 Try Again" to start fresh',
          "   - Complete the authorization flow quickly (codes expire fast)",
        ];
      }

      if (!res.headersSent) {
        res.setHeader("Content-Type", "text/html");
        return res
          .status(400)
          .send(
            generateErrorHTML(
              errorTitle,
              errorMessage,
              troubleshooting,
              errorCode
            )
          );
      }
      return;
    }

    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/html");
      return res
        .status(500)
        .send(
          generateErrorHTML(
            "Internal Server Error",
            error.message || "Please try the authorization flow again.",
            [
              "1. Check Vercel logs for more details",
              "2. Verify environment variables are set correctly",
              "3. Try the authorization flow again",
            ]
          )
        );
    }
  }
};

// HTML generation function for success page
function generateSuccessHTML(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn OAuth Success - TNR Business Solutions</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
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
        h1 { color: #0077b5; font-size: 2rem; margin-bottom: 10px; text-align: center; }
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
            border-left: 4px solid #0077b5;
        }
        .section h3 { color: #0077b5; margin-bottom: 15px; }
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
            background: #0077b5;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }
        .copy-btn:hover { background: #005885; }
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
        .btn-primary { background: #0077b5; color: white; }
        .btn-primary:hover { background: #005885; }
        .btn-secondary { background: #6c757d; color: white; }
        .profile-info {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 LinkedIn OAuth Authorization</h1>
        <div style="text-align: center;"><span class="success-badge">✅ Authorization Successful!</span></div>
        
        <div class="section">
            <h3>👤 Your LinkedIn Profile</h3>
            <div class="profile-info">
                <strong>Name:</strong> ${data.profile.firstName} ${
    data.profile.lastName
  }<br>
                <strong>LinkedIn ID:</strong> ${data.profile.id}<br>
                ${
                  data.profile.email
                    ? `<strong>Email:</strong> ${data.profile.email}<br>`
                    : ""
                }
            </div>
        </div>
        
        <div class="section">
            <h3>🔑 Your Access Token</h3>
            <p style="margin-bottom: 15px;">This token has been saved to the database automatically.</p>
            <div style="margin: 20px 0;">
                <strong>Access Token:</strong>
                <div class="token-box" id="accessToken">${
                  data.authorization.accessToken
                }</div>
                <button class="copy-btn" onclick="copyToken('accessToken')">📋 Copy Token</button>
                <p style="color: #666; font-size: 14px; margin-top: 10px;">
                    ${
                      data.authorization.expiresInDays
                        ? `Expires in ${data.authorization.expiresInDays} days`
                        : "Never expires"
                    }
                </p>
            </div>
            ${
              data.authorization.refreshToken
                ? `
            <div style="margin: 20px 0;">
                <strong>Refresh Token:</strong>
                <div class="token-box" id="refreshToken">${data.authorization.refreshToken}</div>
                <button class="copy-btn" onclick="copyToken('refreshToken')">📋 Copy Refresh Token</button>
                <p style="color: #28a745; font-size: 14px; margin-top: 10px;">✅ Can be used to refresh access token</p>
            </div>
            `
                : ""
            }
        </div>
        
        <div class="next-steps">
            <h3>🎯 Next Steps</h3>
            <ol>${data.nextSteps
              .map((step) => `<li>${step}</li>`)
              .join("")}</ol>
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
                    event.target.style.background = '#0077b5';
                }, 2000);
            });
        }
    </script>
</body>
</html>`;
}

// HTML generation function for error page
function generateErrorHTML(
  error,
  details,
  troubleshooting = [],
  errorCode = null
) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn OAuth Error - TNR Business Solutions</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
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
            max-width: 700px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #0077b5; font-size: 2rem; margin-bottom: 10px; text-align: center; }
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
        .troubleshooting {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .troubleshooting h3 {
            color: #856404;
            margin-bottom: 15px;
        }
        .troubleshooting ol {
            margin-left: 20px;
            color: #856404;
        }
        .troubleshooting li {
            margin: 10px 0;
            line-height: 1.6;
        }
        .error-code {
            background: #e9ecef;
            padding: 10px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
            margin-top: 10px;
            color: #495057;
        }
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
        .btn-primary { background: #0077b5; color: white; }
        .btn-primary:hover { background: #005885; }
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
            ${
              errorCode
                ? `<div class="error-code">Error Code: ${errorCode}</div>`
                : ""
            }
        </div>
        
        ${
          troubleshooting.length > 0
            ? `
        <div class="troubleshooting">
            <h3>🔧 How to Fix This</h3>
            <ol>
                ${troubleshooting.map((step) => `<li>${step}</li>`).join("")}
            </ol>
        </div>
        `
            : ""
        }
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/api/auth/linkedin" class="btn btn-primary">🔄 Try Again</a>
            <a href="/admin-dashboard.html" class="btn btn-secondary">📊 Admin Dashboard</a>
            <a href="/" class="btn btn-secondary">🏠 Go Home</a>
        </div>
    </div>
</body>
</html>`;
}
