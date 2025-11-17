/**
 * Wix OAuth Authentication Handler
 * Initiates OAuth flow for Wix app installation
 */

const crypto = require('crypto');

// Store state tokens temporarily (in production, use Redis or database)
const stateStore = new Map();

// Wix App Configuration
const WIX_APP_ID = '9901133d-7490-4e6e-adfd-cb11615cc5e4';
const WIX_REDIRECT_URI = process.env.WIX_REDIRECT_URI || 'http://localhost:3000/api/auth/wix/callback';

// OAuth endpoints
const WIX_AUTHORIZE_URL = 'https://www.wix.com/installer/install';

/**
 * Clean up expired state tokens (older than 10 minutes)
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
 * Initiate Wix OAuth flow
 */
module.exports = async (req, res) => {
  try {
    console.log('🚀 Initiating Wix OAuth flow');
    
    // Generate random state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Optional: Get client identifier from query params
    const clientId = req.query.clientId || 'default';
    const returnUrl = req.query.returnUrl || '/wix-client-dashboard.html';
    
    // Store state with metadata
    stateStore.set(state, {
      timestamp: Date.now(),
      clientId,
      returnUrl
    });
    
    console.log(`📝 Generated state token: ${state.substring(0, 10)}...`);
    console.log(`🔗 Client ID: ${clientId}`);
    
    // Build OAuth authorization URL
    const authUrl = new URL(WIX_AUTHORIZE_URL);
    authUrl.searchParams.append('appId', WIX_APP_ID);
    authUrl.searchParams.append('redirectUrl', WIX_REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    
    // Optional: Add token to request specific permissions
    // authUrl.searchParams.append('token', 'your-token-here');
    
    console.log(`✅ Redirecting to Wix OAuth: ${authUrl.toString().substring(0, 100)}...`);
    
    // Redirect user to Wix authorization page
    res.redirect(authUrl.toString());
    
  } catch (error) {
    console.error('❌ Error initiating Wix OAuth:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate Wix authentication',
      details: error.message
    });
  }
};

// Export state store for callback handler
module.exports.stateStore = stateStore;

