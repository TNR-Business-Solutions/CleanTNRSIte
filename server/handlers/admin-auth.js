// Admin Authentication - Vercel Serverless Function
// Securely validates admin credentials server-side

module.exports = async (req, res) => {
  try {
    // Set CORS headers first
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

    // Handle request body - Vercel serverless functions may pre-parse
    let parsedBody = {};
    
    // First check if req.body is already available (Vercel pre-parses JSON)
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      parsedBody = req.body;
    } else if (typeof req.body === 'string') {
      // Sometimes Vercel gives us a string
      try {
        parsedBody = JSON.parse(req.body);
      } catch (e) {
        // If parsing fails, read from stream
      }
    }
    
    // If we have parsed body, use it
    if (parsedBody && (parsedBody.username || parsedBody.password)) {
      const { username, password } = parsedBody;
      return await handleAuth(username, password, res);
    }
    
    // Otherwise, read from stream (for local dev or if Vercel didn't parse)
    return new Promise((resolve) => {
      let body = '';
      
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          parsedBody = body.trim() ? JSON.parse(body) : {};
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
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      }));
    }
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


