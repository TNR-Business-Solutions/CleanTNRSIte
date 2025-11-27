/**
 * Threads OAuth Authentication Handler
 * Initiates OAuth flow for Threads API
 */

const crypto = require('crypto');

// Store state tokens temporarily
const stateStore = new Map();

// Threads App Configuration
const THREADS_APP_ID = process.env.THREADS_APP_ID || '1453925242353888';
const THREADS_APP_SECRET = process.env.THREADS_APP_SECRET || '1c72d00838f0e2f3595950b6e42ef3df';
const THREADS_REDIRECT_URI = process.env.THREADS_REDIRECT_URI || 'https://www.tnrbusinesssolutions.com/api/auth/threads/callback';

// Threads OAuth endpoints
const THREADS_AUTHORIZE_URL = 'https://threads.net/oauth/authorize';

// Log configuration
console.log('🔧 Threads OAuth Configuration:', {
  appId: THREADS_APP_ID.substring(0, 8) + '...',
  redirectUri: THREADS_REDIRECT_URI,
  hasEnvAppId: !!process.env.THREADS_APP_ID,
  hasEnvSecret: !!process.env.THREADS_APP_SECRET
});

/**
 * Clean up expired state tokens
 */
function cleanupExpiredStates() {
  const now = Date.now();
  const TEN_MINUTES = 10 * 60 * 1000;
  
  for (const [state, data] of stateStore.entries()) {
    if (now - data.timestamp > TEN_MINUTES) {
      stateStore.delete(state);
    }
  }
}

// Clean up every minute
setInterval(cleanupExpiredStates, 60000);

/**
 * Initiate Threads OAuth flow
 */
module.exports = async (req, res) => {
  try {
    console.log('🚀 Initiating Threads OAuth flow');
    
    // Generate random state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state with metadata
    stateStore.set(state, {
      timestamp: Date.now(),
      returnUrl: req.query.returnUrl || '/admin-dashboard-v2.html'
    });
    
    console.log(`📝 Generated state token: ${state.substring(0, 10)}...`);
    
    // Threads required scopes
    const scopes = [
      'threads_basic',           // Basic profile info
      'threads_content_publish', // Publish threads
      'threads_manage_insights', // Read insights
      'threads_manage_replies'   // Manage replies
    ].join(',');
    
    // Build OAuth authorization URL
    const authUrl = new URL(THREADS_AUTHORIZE_URL);
    authUrl.searchParams.append('client_id', THREADS_APP_ID);
    authUrl.searchParams.append('redirect_uri', THREADS_REDIRECT_URI);
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    
    console.log(`✅ Redirecting to Threads OAuth`);
    console.log(`   Scopes: ${scopes}`);
    
    // Redirect user to Threads authorization page
    res.redirect(authUrl.toString());
    
  } catch (error) {
    console.error('❌ Error initiating Threads OAuth:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate Threads authentication',
      details: error.message
    });
  }
};

// Export state store for callback handler
module.exports.stateStore = stateStore;
module.exports.THREADS_APP_ID = THREADS_APP_ID;
module.exports.THREADS_APP_SECRET = THREADS_APP_SECRET;
module.exports.THREADS_REDIRECT_URI = THREADS_REDIRECT_URI;

