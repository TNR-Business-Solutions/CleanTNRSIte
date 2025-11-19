/**
 * Wix Automation Server - Standalone Version
 * Simple, guaranteed-to-work server for Wix automation
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Import handlers - with error handling
let authWix, authWixCallback, wixApiRoutes;

try {
  authWix = require('./handlers/auth-wix');
  authWixCallback = require('./handlers/auth-wix-callback');
  wixApiRoutes = require('./handlers/wix-api-routes');
  console.log('✅ All Wix handlers loaded successfully');
} catch (error) {
  console.error('❌ Error loading Wix handlers:', error.message);
  console.error('Server will start but Wix features will not work.');
  console.error('Check that all handler files exist in ./handlers/');
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Wix Automation Server is running!',
    timestamp: new Date().toISOString(),
    wixHandlersLoaded: !!(authWix && authWixCallback && wixApiRoutes)
  });
});

// Wix OAuth Routes (only if handlers loaded)
if (authWix && authWixCallback && wixApiRoutes) {
  app.get('/api/auth/wix', authWix);
  app.get('/api/auth/wix/callback', authWixCallback);
  // Also support legacy /callback route for compatibility
  app.get('/callback', authWixCallback);
  // Handle root redirect with token (Wix sometimes redirects to root)
  app.get('/', (req, res) => {
    if (req.query.token) {
      console.log('📝 Root route received token, forwarding to callback handler');
      // Forward to callback handler
      return authWixCallback(req, res);
    }
    // Otherwise redirect to dashboard
    res.redirect('/wix-client-dashboard.html');
  });
  app.get('/api/wix', wixApiRoutes);
  app.post('/api/wix', wixApiRoutes);
  console.log('✅ Wix API routes registered (including token redirect handler)');
} else {
  console.warn('⚠️  Wix API routes not registered - handlers failed to load');
}

// Dashboard routes
app.get('/wix-client-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'wix-client-dashboard.html'));
});

app.get('/wix-seo-manager.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'wix-seo-manager.html'));
});

app.get('/wix-ecommerce-manager.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'wix-ecommerce-manager.html'));
});

app.get('/wix-change-log.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'wix-change-log.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║                                                       ║');
  console.log('║         🚀 WIX AUTOMATION SERVER STARTED! 🚀         ║');
  console.log('║                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Main Dashboard: http://localhost:${PORT}/wix-client-dashboard.html`);
  console.log(`🎯 SEO Manager: http://localhost:${PORT}/wix-seo-manager.html`);
  console.log(`🛒 E-commerce Manager: http://localhost:${PORT}/wix-ecommerce-manager.html`);
  console.log('\n✅ Ready to connect Wix clients!\n');
  console.log('Press Ctrl+C to stop the server');
  console.log('─'.repeat(60));
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});

