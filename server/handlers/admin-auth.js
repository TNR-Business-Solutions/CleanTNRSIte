// Admin Authentication - Vercel Serverless Function
// Securely validates admin credentials server-side

module.exports = async (req, res) => {
  // Set CORS headers first
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    // Handle request body - Vercel pre-parses JSON in most cases
    let username, password;

    // Check if req.body is already available (Vercel pre-parses JSON)
    if (req.body && typeof req.body === "object") {
      username = req.body.username;
      password = req.body.password;
    } else if (typeof req.body === "string") {
      // Sometimes Vercel gives us a string
      try {
        const parsed = JSON.parse(req.body);
        username = parsed.username;
        password = parsed.password;
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid request body",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: "Request body is required",
      });
    }

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password required",
      });
    }

    // Get credentials from environment variables (SECURE)
    // Support multiple users
    const ADMIN_USERS = [
      {
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "TNR2024!",
        role: "admin"
      },
      {
        username: process.env.EMPLOYEE_USERNAME || "employee1",
        password: process.env.EMPLOYEE_PASSWORD || "",
        role: "employee"
      }
    ].filter(user => user.password); // Only include users with passwords set

    console.log("Admin auth attempt:", {
      username,
      hasPassword: !!password,
      bodyType: typeof req.body,
      hasBody: !!req.body,
    });

    // Validate credentials against all users
    const user = ADMIN_USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Generate a simple session token (in production, use JWT or proper session management)
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString(
        "base64"
      );

      return res.status(200).json({
        success: true,
        message: "Authentication successful",
        sessionToken: sessionToken,
        redirectTo: "/admin-dashboard-v2.html",
        role: user.role,
        username: user.username
      });
    } else {
      // Add small delay to prevent brute force attacks
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("Auth error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
