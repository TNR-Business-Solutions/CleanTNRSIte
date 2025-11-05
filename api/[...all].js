// Consolidated API Router - Single Serverless Function
// Routes all API requests to appropriate handlers

module.exports = async (req, res) => {
  // Get pathname from request
  // Vercel provides req.url with query string, or we can use the path directly
  let pathname = req.url.split('?')[0]; // Remove query string if present
  
  // Handle Vercel's catch-all parameter if available
  // For catch-all routes like /api/[...all], Vercel passes segments in req.query.all
  if (req.query && req.query.all) {
    // For routes like /api/crm/clients, req.query.all might be "crm/clients"
    const allParam = Array.isArray(req.query.all) ? req.query.all.join('/') : req.query.all;
    pathname = '/api/' + allParam;
  }
  
  // Fallback: if pathname is just /api, try to get from req.url
  if (pathname === '/api' || pathname === '/api/') {
    // Try to extract from the original URL
    const urlMatch = req.url.match(/\/api\/(.+?)(?:\?|$)/);
    if (urlMatch) {
      pathname = '/api/' + urlMatch[1];
    }
  }
  
  // Remove leading /api if present for cleaner routing
  let route = pathname.replace(/^\/api\//, '');
  
  // Debug logging (remove in production if needed)
  if (process.env.NODE_ENV !== 'production') {
    console.log('API Route Debug:', { pathname, route, query: req.query, url: req.url });
  }
  
  // Handle CORS globally
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Ensure req.url has full path for handlers that parse it
    const fullPath = pathname.startsWith('/api/') ? pathname : '/api' + pathname;
    
    // Route to appropriate handler
    if (route.startsWith('crm/') || route === 'crm') {
      const handler = require('../server/handlers/crm-api');
      req.url = fullPath;
      return await handler(req, res);
    }
    
    if (route.startsWith('campaigns/') || route === 'campaigns') {
      const handler = require('../server/handlers/campaign-api');
      req.url = fullPath;
      return await handler(req, res);
    }
    
    if (route === 'submit-form' || pathname === '/submit-form') {
      const handler = require('../server/handlers/submit-form');
      return await handler(req, res);
    }
    
    if (route === 'checkout' || pathname === '/checkout') {
      const handler = require('../server/handlers/checkout');
      return await handler(req, res);
    }
    
    if (route === 'admin/auth' || route.startsWith('admin/auth')) {
      const handler = require('../server/handlers/admin-auth');
      return await handler(req, res);
    }
    
    if (route.startsWith('auth/meta')) {
      if (route === 'auth/meta/callback' || route.endsWith('/callback')) {
        const handler = require('../server/handlers/auth-meta-callback');
        return await handler(req, res);
      }
      const handler = require('../server/handlers/auth-meta');
      return await handler(req, res);
    }
    
    if (route.startsWith('auth/linkedin')) {
      if (route === 'auth/linkedin/callback' || route.endsWith('/callback')) {
        const handler = require('../server/handlers/auth-linkedin-callback');
        return await handler(req, res);
      }
      const handler = require('../server/handlers/auth-linkedin');
      return await handler(req, res);
    }
    
    if (route.startsWith('auth/twitter')) {
      if (route === 'auth/twitter/callback' || route.endsWith('/callback')) {
        const handler = require('../server/handlers/auth-twitter-callback');
        return await handler(req, res);
      }
      const handler = require('../server/handlers/auth-twitter');
      return await handler(req, res);
    }
    
    if (route.startsWith('workflows/') || route === 'workflows') {
      const handler = require('../server/handlers/workflows-api');
      return await handler(req, res);
    }
    
    if (route.startsWith('analytics/') || route === 'analytics') {
      const handler = require('../server/handlers/analytics-api');
      return await handler(req, res);
    }
    
    if (route.startsWith('activities/') || route === 'activities') {
      const handler = require('../server/handlers/activities-api');
      return await handler(req, res);
    }
    
    if (route.startsWith('email-templates/') || route === 'email-templates') {
      const handler = require('../server/handlers/email-templates-api');
      return await handler(req, res);
    }
    
    if (route.startsWith('social/')) {
      if (route.includes('tokens') || route === 'social/tokens') {
        const handler = require('../server/handlers/social-tokens-api');
        return await handler(req, res);
      }
      if (route.includes('post-to-facebook') || route === 'social/post-facebook' || route === 'social/post') {
        const handler = require('../server/handlers/post-to-facebook');
        return await handler(req, res);
      }
      if (route.includes('post-to-instagram') || route === 'social/post-instagram') {
        const handler = require('../server/handlers/post-to-instagram');
        return await handler(req, res);
      }
      if (route.includes('post-to-linkedin') || route === 'social/post-linkedin') {
        const handler = require('../server/handlers/post-to-linkedin');
        return await handler(req, res);
      }
      if (route.includes('post-to-twitter') || route === 'social/post-twitter') {
        const handler = require('../server/handlers/post-to-twitter');
        return await handler(req, res);
      }
      if (route.includes('test-token') || route === 'social/test') {
        const handler = require('../server/handlers/test-token');
        return await handler(req, res);
      }
      if (route.includes('get-insights')) {
        const handler = require('../server/handlers/get-insights');
        return await handler(req, res);
      }
    }
    
    // 404 for unknown routes
    res.status(404).json({ success: false, error: 'Endpoint not found' });
    
  } catch (error) {
    console.error('❌ API Router Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
