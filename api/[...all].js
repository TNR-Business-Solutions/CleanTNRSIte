// Consolidated API Router - Single Serverless Function
// Routes all API requests to appropriate handlers

module.exports = async (req, res) => {
  // Get pathname from request
  // Vercel provides req.url with query string, or we can use the path directly
  let pathname = req.url.split('?')[0]; // Remove query string if present
  let route = '';
  
  // Handle Vercel's catch-all parameter - this is the primary way Vercel passes segments
  // For catch-all routes like /api/[...all], Vercel passes segments in req.query.all
  if (req.query && req.query.all !== undefined && req.query.all !== null) {
    // For routes like /api/crm/clients, req.query.all might be "crm/clients" or ['crm', 'clients']
    const allParam = Array.isArray(req.query.all) ? req.query.all.join('/') : String(req.query.all);
    route = allParam;
    pathname = '/api/' + allParam;
  } else if (req.url) {
    // Fallback: extract from req.url if query.all is not available
    // This handles cases where Vercel might structure the request differently
    // Remove query string first
    const urlWithoutQuery = req.url.split('?')[0];
    const urlMatch = urlWithoutQuery.match(/\/api\/(.+)$/);
    if (urlMatch && urlMatch[1]) {
      route = urlMatch[1];
      pathname = '/api/' + route;
    } else if (urlWithoutQuery === '/api' || urlWithoutQuery === '/api/') {
      route = '';
      pathname = '/api';
    }
  }
  
  // If route is still empty, try to get it from the path
  if (!route && pathname) {
    const match = pathname.match(/\/api\/(.+)$/);
    if (match) {
      route = match[1];
    }
  }
  
  // Always log for debugging (will help identify routing issues)
  console.log('API Route Debug:', { 
    pathname, 
    route, 
    query: req.query, 
    url: req.url,
    method: req.method,
    hasAll: req.query?.all !== undefined,
    allValue: req.query?.all
  });
  
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
    // Handle CRM routes - check for 'crm' at the start or as the whole route
    if (route === 'crm' || route.startsWith('crm/')) {
      console.log('✅ Routing to CRM API handler');
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
    
    // Admin auth route - check early and explicitly
    if (route === 'admin/auth' || route === 'admin/auth/' || route.startsWith('admin/auth/')) {
      console.log('Routing to admin-auth handler');
      const handler = require('../server/handlers/admin-auth');
      return await handler(req, res);
    }
    
    // Also check if route is just 'admin/auth' without the slash
    if (route.includes('admin') && route.includes('auth')) {
      console.log('Detected admin/auth in route, attempting to route');
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
    
    // Social media token management - handle both /api/social-tokens and /api/social/tokens
    if (route === 'social-tokens' || route.startsWith('social/tokens') || route === 'social/tokens') {
      const handler = require('../server/handlers/social-tokens-api');
      return await handler(req, res);
    }
    
    // Post to Twitter - handle both /api/post-to-twitter and /api/social/post-to-twitter
    if (route === 'post-to-twitter' || route.includes('post-to-twitter') || route === 'social/post-twitter') {
      const handler = require('../server/handlers/post-to-twitter');
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
    
    // 404 for unknown routes - log what we received
    console.error('❌ Route not found:', { route, pathname, url: req.url, query: req.query });
    res.status(404).json({ 
      success: false, 
      error: 'Endpoint not found',
      route: route,
      pathname: pathname,
      url: req.url
    });
    
  } catch (error) {
    console.error('❌ API Router Error:', error);
    console.error('Error stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
