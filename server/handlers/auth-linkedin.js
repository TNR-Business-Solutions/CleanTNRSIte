// LinkedIn OAuth Initiation - Vercel Serverless Function
// This endpoint starts the OAuth flow by redirecting to LinkedIn's authorization page

const qs = require('querystring');

module.exports = (req, res) => {
  // Get configuration from environment variables
  const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '78pjq1wt4wz1fs'; // Default from existing setup
  const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback';
  
  // Validate configuration
  if (!LINKEDIN_CLIENT_ID) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'LINKEDIN_CLIENT_ID not configured. Please set environment variables in Vercel.'
    });
  }

  // Define required permissions for LinkedIn posting
  // w_member_social - Post content on behalf of the user (required for posting)
  // r_liteprofile - Read basic profile info (optional, for displaying user name)
  const scopes = [
    'w_member_social',     // Post content on LinkedIn (required for UGC Posts API)
    'r_liteprofile'        // Read basic profile info (optional, for user display)
  ];

  // Generate state for CSRF protection
  const state = 'tnr_linkedin_oauth_' + Date.now();

  // Build LinkedIn OAuth URL
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${qs.stringify({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scopes.join(' ')
  })}`;

  console.log('LinkedIn OAuth initiated:', {
    clientId: LINKEDIN_CLIENT_ID.substring(0, 8) + '...',
    redirectUri: REDIRECT_URI,
    timestamp: new Date().toISOString()
  });

  // Redirect user to LinkedIn authorization page
  res.redirect(authUrl);
};

