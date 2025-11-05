// Admin Authentication - Vercel Serverless Function
// Securely validates admin credentials server-side

const { parseBody } = require('./http-utils');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }));
    return;
  }

  try {
    // Try to get body - Vercel may have already parsed it, or we need to parse it
    let body;
    
    // Check if req.body exists and is already an object (Vercel auto-parsed)
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      body = req.body;
      console.log('✅ Using Vercel-parsed req.body');
    } else if (req.body && typeof req.body === 'string') {
      // Body is a string, parse it
      try {
        body = JSON.parse(req.body);
        console.log('✅ Parsed req.body string');
      } catch (parseError) {
        throw new Error('Invalid JSON in request body: ' + parseError.message);
      }
    } else {
      // Need to parse from stream
      try {
        body = await parseBody(req);
        console.log('✅ Parsed body from stream');
      } catch (parseError) {
        console.error('Failed to parse body:', parseError);
        throw new Error('Failed to parse request body: ' + parseError.message);
      }
    }
    
    console.log('Body received:', { hasUsername: !!body.username, hasPassword: !!body.password, keys: Object.keys(body) });
    
    const { username, password } = body || {};

    // Validate input
    if (!username || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Username and password required'
      }));
      return;
    }

    // Get credentials from environment variables (SECURE)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TNR2024!';

    console.log('Admin auth attempt:', { username, hasPassword: !!password, envUsername: ADMIN_USERNAME });

    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate a simple session token (in production, use JWT or proper session management)
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Authentication successful',
        sessionToken: sessionToken,
        redirectTo: '/admin-dashboard.html'
      }));
      return;
    } else {
      // Add small delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Invalid credentials'
      }));
      return;
    }
  } catch (error) {
    console.error('Auth error:', error);
    console.error('Error stack:', error.stack);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: error.message
    }));
    return;
  }
};

