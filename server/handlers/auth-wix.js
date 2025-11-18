/**
 * Wix OAuth Authentication Handler
 * Initiates OAuth flow for Wix app installation
 */

const crypto = require('crypto');

// Store state tokens temporarily (in production, use Redis or database)
const stateStore = new Map();

// Wix App Configuration
const WIX_APP_ID = process.env.WIX_APP_ID || '9901133d-7490-4e6e-adfd-cb11615cc5e4';

// Determine redirect URI based on environment
// Production: Use tnrbusinesssolutions.com
// Development: Use localhost (HTTPS required)
function getRedirectUri() {
  // Check if we're in production (Vercel sets VERCEL env var)
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    // Production: Use your domain
    return process.env.WIX_REDIRECT_URI || 'https://www.tnrbusinesssolutions.com/api/auth/wix/callback';
  }
  
  // Development: Use localhost with HTTPS
  return process.env.WIX_REDIRECT_URI || 'https://localhost:3000/api/auth/wix/callback';
}

const WIX_REDIRECT_URI = getRedirectUri();

// Log configuration for debugging
console.log('🔧 Wix OAuth Configuration:', {
  appId: WIX_APP_ID.substring(0, 8) + '...',
  redirectUri: WIX_REDIRECT_URI,
  hasEnvAppId: !!process.env.WIX_APP_ID,
  hasEnvRedirect: !!process.env.WIX_REDIRECT_URI
});

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
    
    // Use the redirect URI (already set correctly by getRedirectUri())
    const redirectUri = WIX_REDIRECT_URI;
    
    console.log(`✅ Using redirect URI: ${redirectUri}`);
    
    // Build OAuth authorization URL
    const authUrl = new URL(WIX_AUTHORIZE_URL);
    authUrl.searchParams.append('appId', WIX_APP_ID);
    authUrl.searchParams.append('redirectUrl', redirectUri);
    authUrl.searchParams.append('state', state);
    
    // Optional: Add token to request specific permissions
    // authUrl.searchParams.append('token', 'your-token-here');
    
    console.log(`✅ Redirecting to Wix OAuth`);
    console.log(`   Redirect URI: ${redirectUri}`);
    console.log(`   Full URL: ${authUrl.toString().substring(0, 150)}...`);
    
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

