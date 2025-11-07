// Admin Authentication - Vercel Serverless Function
// Securely validates admin credentials server-side

module.exports = async (req, res) => {
  // Set CORS headers first
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Handle request body - Vercel pre-parses JSON in most cases
    let username, password;
    
    // Check if req.body is already available (Vercel pre-parses JSON)
    if (req.body && typeof req.body === 'object') {
      username = req.body.username;
      password = req.body.password;
    } else if (typeof req.body === 'string') {
      // Sometimes Vercel gives us a string
      try {
        const parsed = JSON.parse(req.body);
        username = parsed.username;
        password = parsed.password;
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
    }
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password required'
      });
    }

    // Get credentials from environment variables (SECURE)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TNR2024!';

    console.log('Admin auth attempt:', { 
      username, 
      hasPassword: !!password, 
      envUsername: ADMIN_USERNAME,
      bodyType: typeof req.body,
      hasBody: !!req.body
    });

    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate a simple session token
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        sessionToken: sessionToken,
        redirectTo: '/admin-dashboard.html'
      });
    } else {
      // Add small delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
