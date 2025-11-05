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
    // Read request body - use same pattern as CRM handler
    // This works reliably in Vercel serverless functions
    let body = '';
    
    // First check if req.body is already available (Vercel sometimes pre-parses)
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      console.log('✅ Using pre-parsed req.body');
      const { username, password } = req.body;
      return await handleAuth(username, password, res);
    }
    
    // Otherwise, read from stream
    return new Promise((resolve, reject) => {
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const parsedBody = body.trim() ? JSON.parse(body) : {};
          console.log('✅ Parsed body from stream:', { hasUsername: !!parsedBody.username, hasPassword: !!parsedBody.password });
          
          const { username, password } = parsedBody;
          await handleAuth(username, password, res);
          resolve();
        } catch (parseError) {
          console.error('Body parse error:', parseError);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid request body',
            message: parseError.message
          }));
          resolve();
        }
      });

      req.on('error', (error) => {
        console.error('Request stream error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Request error',
          message: error.message
        }));
        resolve();
      });
    });
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
// Extract auth logic to separate function
async function handleAuth(username, password, res) {
  try {
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
    console.error('handleAuth error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Authentication error',
      message: error.message
    }));
    return;
  }


