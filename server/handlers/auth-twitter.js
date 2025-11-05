// Twitter/X OAuth 2.0 Initiation - Vercel Serverless Function
// This endpoint starts the OAuth 2.0 flow by redirecting to Twitter's authorization page

const qs = require('querystring');
const crypto = require('crypto');

module.exports = (req, res) => {
  // Get configuration from environment variables
  const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
  const REDIRECT_URI = process.env.TWITTER_REDIRECT_URI || 'https://www.tnrbusinesssolutions.com/api/auth/twitter/callback';
  
  // Validate configuration
  if (!TWITTER_CLIENT_ID) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'TWITTER_CLIENT_ID not configured. Please set environment variables in Vercel.'
    });
  }

  // Generate code verifier and challenge for PKCE (OAuth 2.0 security)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  
  // Generate state for CSRF protection
  const state = 'tnr_twitter_oauth_' + Date.now();

  // Store code verifier and state in a way that can be retrieved in callback
  // In production, you'd use a session store or encrypted cookie
  // For now, we'll pass it in the state parameter (not ideal, but works for MVP)
  // Better: Use Vercel KV or a session store
  const stateWithVerifier = Buffer.from(JSON.stringify({ state, codeVerifier })).toString('base64url');

  // Define required scopes for Twitter posting
  // tweet.read - Read Tweets
  // tweet.write - Write Tweets
  // users.read - Read user profile
  const scopes = [
    'tweet.read',
    'tweet.write',
    'users.read',
    'offline.access' // Get refresh token
  ];

  // Build Twitter OAuth 2.0 URL
  const authUrl = `https://twitter.com/i/oauth2/authorize?${qs.stringify({
    response_type: 'code',
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(' '),
    state: stateWithVerifier,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })}`;

  console.log('Twitter OAuth initiated:', {
    clientId: TWITTER_CLIENT_ID.substring(0, 8) + '...',
    redirectUri: REDIRECT_URI,
    timestamp: new Date().toISOString()
  });

  // Redirect user to Twitter authorization page
  res.redirect(authUrl);
};

