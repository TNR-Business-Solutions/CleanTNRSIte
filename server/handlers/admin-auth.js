// Admin Authentication - Vercel Serverless Function
// Securely validates admin credentials server-side

module.exports = async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { username, password } = req.body;

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

    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate a simple session token (in production, use JWT or proper session management)
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
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

