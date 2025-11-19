// Meta OAuth Initiation - Vercel Serverless Function
// This endpoint starts the OAuth flow by redirecting to Facebook's authorization page

const qs = require('querystring');

module.exports = (req, res) => {
  // Get configuration from environment variables
  const META_APP_ID = process.env.META_APP_ID;
  const REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://www.tnrbusinesssolutions.com/api/auth/meta/callback';
  
  // Validate configuration
  if (!META_APP_ID) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'META_APP_ID not configured. Please set environment variables in Vercel.'
    });
  }

  // Define required permissions for Facebook/Instagram posting
  // Note: Instagram posting works through Facebook Pages API
  // No separate Instagram permissions are needed - just connect Instagram Business Account to Page
  const scopes = [
    'pages_manage_posts',        // Create, edit and delete posts on Pages (includes Instagram)
    'pages_read_engagement',     // Read engagement data on Pages
    'pages_show_list',          // Access the list of Pages a person manages
    'pages_manage_metadata'     // Manage Page settings
  ];

  // Build Facebook OAuth URL
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${qs.stringify({
    client_id: META_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(','),
    response_type: 'code',
    state: 'tnr_oauth_' + Date.now() // CSRF protection
  })}`;

  console.log('Meta OAuth initiated:', {
    appId: META_APP_ID.substring(0, 8) + '...',
    redirectUri: REDIRECT_URI,
    timestamp: new Date().toISOString()
  });

  // Redirect user to Facebook authorization page
  res.redirect(authUrl);
};

