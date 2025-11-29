// Nextdoor OAuth Initiation - Vercel Serverless Function
// This endpoint starts the OAuth flow by redirecting to Nextdoor's authorization page

const qs = require("querystring");

module.exports = (req, res) => {
  // Get configuration from environment variables
  const NEXTDOOR_CLIENT_ID = process.env.NEXTDOOR_CLIENT_ID;
  const REDIRECT_URI =
    process.env.NEXTDOOR_REDIRECT_URI ||
    "https://www.tnrbusinesssolutions.com/api/auth/nextdoor/callback";

  // Validate configuration
  if (!NEXTDOOR_CLIENT_ID) {
    return res.status(500).json({
      error: "Server configuration error",
      message:
        "NEXTDOOR_CLIENT_ID not configured. Please set environment variables in Vercel.",
    });
  }

  // Define required permissions for Nextdoor posting
  // Note: Nextdoor API permissions may vary - adjust based on their API documentation
  const scopes = [
    "read", // Read user profile and neighborhood information
    "write", // Post content to Nextdoor
  ];

  // Generate state for CSRF protection
  const state = "tnr_nextdoor_oauth_" + Date.now();

  // Build Nextdoor OAuth URL
  // Note: Update this URL based on Nextdoor's actual OAuth endpoint
  const authUrl = `https://nextdoor.com/oauth/authorize?${qs.stringify({
    response_type: "code",
    client_id: NEXTDOOR_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scopes.join(" "),
  })}`;

  console.log("Nextdoor OAuth initiated:", {
    clientId: NEXTDOOR_CLIENT_ID.substring(0, 8) + "...",
    redirectUri: REDIRECT_URI,
    timestamp: new Date().toISOString(),
  });

  // Redirect user to Nextdoor authorization page
  res.redirect(authUrl);
};

