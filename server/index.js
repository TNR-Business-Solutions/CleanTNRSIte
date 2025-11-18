const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Import Wix handlers
const authWix = require('./handlers/auth-wix');
const authWixCallback = require('./handlers/auth-wix-callback');
const wixApiRoutes = require('./handlers/wix-api-routes');

const app = express();

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from parent directory (for HTML files, assets, etc.)
// This must come AFTER the root route handler to allow OAuth callbacks to work
const staticPath = path.join(__dirname, '..');
console.log('📁 Serving static files from:', staticPath);

// Configuration via environment variables (never hardcode secrets)
const PORT = Number(process.env.PORT || 3000);
let META_APP_ID = process.env.META_APP_ID;
let META_APP_SECRET = process.env.META_APP_SECRET;
// Use HTTP for local dev; add this URI to Meta App > Facebook Login > Settings
let REDIRECT_URI = process.env.META_REDIRECT_URI || 'http://localhost:3000/auth/meta/callback';

// Fallback to local file for dev if env vars are missing
try {
  const localEnvPath = path.join(__dirname, 'env.local.json');
  if (fs.existsSync(localEnvPath)) {
    const raw = fs.readFileSync(localEnvPath, 'utf8');
    const conf = JSON.parse(raw);
    
    // Load Meta settings
    META_APP_ID = META_APP_ID || conf.META_APP_ID;
    META_APP_SECRET = META_APP_SECRET || conf.META_APP_SECRET;
    REDIRECT_URI = conf.META_REDIRECT_URI || REDIRECT_URI;
    
    // Load Wix settings into process.env (for Wix handlers to use)
    if (conf.WIX_APP_ID && !process.env.WIX_APP_ID) {
      process.env.WIX_APP_ID = conf.WIX_APP_ID;
    }
    if (conf.WIX_APP_SECRET && !process.env.WIX_APP_SECRET) {
      process.env.WIX_APP_SECRET = conf.WIX_APP_SECRET;
    }
    if (conf.WIX_REDIRECT_URI && !process.env.WIX_REDIRECT_URI) {
      process.env.WIX_REDIRECT_URI = conf.WIX_REDIRECT_URI;
    }
    
    console.log('✅ Loaded environment variables from env.local.json');
  }
} catch (e) {
  console.warn('Failed to read env.local.json:', e.message);
}

if (!META_APP_ID || !META_APP_SECRET) {
  console.warn('Warning: META_APP_ID or META_APP_SECRET not set. OAuth will fail until configured.');
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Avoid favicon 404 noise
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Helper to verify current config and build the auth URL
app.get('/auth/meta/debug', (req, res) => {
  const scopes = [
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_show_list',
    'pages_manage_metadata'
  ];
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${qs.stringify({
    client_id: META_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(','),
    response_type: 'code'
  })}`;
  res.json({
    redirectUri: REDIRECT_URI,
    appIdConfigured: Boolean(META_APP_ID),
    hasSecretConfigured: Boolean(META_APP_SECRET),
    authUrl
  });
});

// Step 1: Kick off Meta OAuth login
app.get('/auth/meta', (req, res) => {
  const scopes = [
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_show_list',
    'pages_manage_metadata'
  ];

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${qs.stringify({
    client_id: META_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(','),
    response_type: 'code'
  })}`;

  res.redirect(authUrl);
});

// Step 2: Handle callback and exchange code for tokens
app.get('/auth/meta/callback', async (req, res) => {
  const { code, error, error_description } = req.query;
  // Log incoming query for debugging in local dev
  console.log('OAuth callback query:', req.query);
  if (error) {
    return res.status(400).send(`OAuth error: ${error} - ${error_description || ''}`);
  }
  if (!code) {
    return res
      .status(400)
      .send(
        'Missing authorization code. Make sure you started from /auth/meta and that your Meta App "Valid OAuth Redirect URIs" includes http://localhost:3000/auth/meta/callback exactly.'
      );
  }

  try {
    // Exchange short-lived user token
    const tokenResp = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: REDIRECT_URI,
        code
      }
    });

    const shortLivedUserToken = tokenResp.data.access_token;

    // Exchange for long-lived user token
    const longLivedResp = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        fb_exchange_token: shortLivedUserToken
      }
    });
    const longLivedUserToken = longLivedResp.data.access_token;

    // Fetch managed Pages (includes page_access_token per page)
    const pagesResp = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token: longLivedUserToken }
    });

    // For now, just show results (no storage yet). We will store securely next step.
    res.json({
      longLivedUserTokenObtained: Boolean(longLivedUserToken),
      pages: pagesResp.data.data || []
    });
  } catch (e) {
    const msg = e.response?.data || e.message;
    res.status(500).send(`Token exchange failed: ${JSON.stringify(msg)}`);
  }
});

// Handle Wix OAuth callback redirected to root (common Wix behavior)
// IMPORTANT: This must be defined BEFORE static file serving
app.get('/', (req, res, next) => {
  console.log('📍 Root route handler called');
  console.log('   URL:', req.url);
  console.log('   Query:', req.query);
  
  // If token parameter exists, redirect to proper callback endpoint
  if (req.query.token || req.query.code || req.query.instanceId) {
    console.log('🔄 Root route received Wix OAuth callback, redirecting to /api/auth/wix/callback');
    console.log('   Query params:', Object.keys(req.query));
    console.log('   Has token:', !!req.query.token);
    console.log('   Has code:', !!req.query.code);
    console.log('   Has instanceId:', !!req.query.instanceId);
    console.log('   Protocol:', req.secure ? 'https' : 'http');
    console.log('   Host:', req.headers.host);
    
    // Build callback URL with all query parameters
    // Detect protocol from request (https if secure connection or X-Forwarded-Proto header)
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const callbackUrl = new URL('/api/auth/wix/callback', `${protocol}://${req.headers.host}`);
    Object.keys(req.query).forEach(key => {
      callbackUrl.searchParams.append(key, req.query[key]);
    });
    
    console.log('   Redirecting to:', callbackUrl.toString().substring(0, 100) + '...');
    
    return res.redirect(callbackUrl.toString());
  }
  
  // Otherwise, serve a simple response or redirect to dashboard
  console.log('📍 Root route: serving default page');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>TNR Business Solutions - Wix Automation</title>
      <meta http-equiv="refresh" content="2;url=/wix-client-dashboard.html">
    </head>
    <body>
      <h1>TNR Business Solutions</h1>
      <p>Wix Automation Server is running.</p>
      <p>Redirecting to dashboard...</p>
      <p><a href="/wix-client-dashboard.html">Go to Dashboard</a></p>
    </body>
    </html>
  `);
});

// Wix OAuth Routes
app.get('/api/auth/wix', authWix);
app.get('/api/auth/wix/callback', authWixCallback);

// Wix API Routes
app.get('/api/wix', wixApiRoutes);
app.post('/api/wix', wixApiRoutes);

// Serve static files AFTER all API routes (so API routes take precedence)
// The root route handler is defined above, so it will take precedence over static files
app.use(express.static(staticPath, { index: false })); // Don't serve index.html automatically

// Start HTTP and, if certificates exist, HTTPS on the same port (HTTPS-only when redirect is https)
function startServer() {
  const certDir = path.join(__dirname, 'certs');
  const keyPath = path.join(certDir, 'localhost-key.pem');
  const certPath = path.join(certDir, 'localhost-cert.pem');

  const wantHttps = (process.env.META_REDIRECT_URI || '').startsWith('https://');
  const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

  if (wantHttps && hasCerts) {
    const credentials = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    https.createServer(credentials, app).listen(PORT, () => {
      console.log(`HTTPS server listening on https://localhost:${PORT}`);
    });
  } else if (wantHttps && !hasCerts) {
    console.warn('META_REDIRECT_URI is HTTPS but no certificates found at server/certs.');
    console.warn('Generating a self-signed certificate for local development...');
    try {
      const selfsigned = require('selfsigned');
      const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
        days: 365,
        keySize: 2048,
        algorithm: 'sha256'
      });
      fs.mkdirSync(path.join(__dirname, 'certs'), { recursive: true });
      fs.writeFileSync(keyPath, pems.private, 'utf8');
      fs.writeFileSync(certPath, pems.cert, 'utf8');
      const credentials = { key: pems.private, cert: pems.cert };
      https.createServer(credentials, app).listen(PORT, () => {
        console.log(`HTTPS server (self-signed) listening on https://localhost:${PORT}`);
      });
    } catch (err) {
      console.error('Failed to generate self-signed certificate:', err.message);
      http.createServer(app).listen(PORT, () => {
        console.log(`HTTP server listening on http://localhost:${PORT}`);
      });
    }
  } else {
    http.createServer(app).listen(PORT, () => {
      console.log(`HTTP server listening on http://localhost:${PORT}`);
    });
  }
}

startServer();


