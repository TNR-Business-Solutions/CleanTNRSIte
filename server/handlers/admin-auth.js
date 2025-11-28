// Admin Authentication - Vercel Serverless Function
// Securely validates admin credentials server-side with JWT, bcrypt, and rate limiting

const { setCorsHeaders, handleCorsPreflight } = require("./cors-utils");
const { generateTokenPair } = require("./jwt-utils");
const { verifyPassword, hashPassword } = require("./password-utils");
const { rateLimiter } = require("./rate-limiter");
const { sendErrorResponse, sendAuthError, handleUnexpectedError, ERROR_CODES } = require("./error-handler");

// Apply rate limiting to auth endpoint
const authRateLimiter = rateLimiter('auth');

module.exports = async (req, res) => {
  // Handle CORS
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  // Apply rate limiting (wrapped in async handler)
  return new Promise((resolve) => {
    authRateLimiter(req, res, async () => {
      try {
        // Only accept POST requests
        if (req.method !== "POST") {
          return resolve(sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, "Method not allowed. Only POST requests are accepted.", {
            method: req.method,
            allowed: ['POST']
          }));
        }

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
            return resolve(res.status(400).json({
              success: false,
              error: "Invalid request body",
            }));
          }
        } else {
          return resolve(res.status(400).json({
            success: false,
            error: "Request body is required",
          }));
        }

        // Validate input
        if (!username || !password) {
          return resolve(sendErrorResponse(res, ERROR_CODES.MISSING_FIELD, "Username and password are required.", {
            missing: !username ? ['username'] : !password ? ['password'] : ['username', 'password']
          }));
        }

        // Get credentials from environment variables (SECURE)
        // Support multiple users with hashed passwords
        const ADMIN_USERS = [
          {
            username: process.env.ADMIN_USERNAME || "admin",
            password: process.env.ADMIN_PASSWORD || "TNR2024!",
            passwordHash: process.env.ADMIN_PASSWORD_HASH, // Pre-hashed password
            role: "admin"
          },
          {
            username: process.env.EMPLOYEE_USERNAME || "employee1",
            password: process.env.EMPLOYEE_PASSWORD || "",
            passwordHash: process.env.EMPLOYEE_PASSWORD_HASH, // Pre-hashed password
            role: "employee"
          }
        ].filter(user => user.password || user.passwordHash); // Only include users with passwords set

        console.log("Admin auth attempt:", {
          username,
          hasPassword: !!password,
          bodyType: typeof req.body,
          hasBody: !!req.body,
        });

        // Validate credentials against all users
        let authenticatedUser = null;
        
        for (const user of ADMIN_USERS) {
          if (user.username === username) {
            console.log(`🔍 Checking user: ${user.username}, hasHash: ${!!user.passwordHash}, hasPassword: ${!!user.password}`);
            
            // Check if we have a pre-hashed password
            if (user.passwordHash) {
              // Verify against hash
              console.log(`🔐 Verifying password against hash...`);
              const isValid = await verifyPassword(password, user.passwordHash);
              console.log(`🔐 Password verification result: ${isValid}`);
              if (isValid) {
                authenticatedUser = user;
                break;
              } else {
                console.log(`❌ Password hash verification failed for ${username}`);
              }
            } else if (user.password && user.password === password) {
              // Fallback: plain text comparison (for migration period)
              console.log(`⚠️ Using plain text password (not secure - should use hash)`);
              // Hash the password for future use
              const hash = await hashPassword(password);
              console.log(`⚠️ Password for ${username} should be hashed. Hash: ${hash}`);
              console.log(`Add to environment: ${user.role.toUpperCase()}_PASSWORD_HASH=${hash}`);
              authenticatedUser = user;
              break;
            } else {
              console.log(`❌ Password mismatch for ${username}`);
            }
          }
        }
        
        if (authenticatedUser) {
          // Generate JWT token pair
          const tokens = generateTokenPair({
            username: authenticatedUser.username,
            role: authenticatedUser.role
          });

          return resolve(res.status(200).json({
            success: true,
            message: "Authentication successful",
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            redirectTo: "/admin-dashboard-v2.html",
            role: authenticatedUser.role,
            username: authenticatedUser.username
          }));
        } else {
          // Add small delay to prevent brute force attacks (rate limiter also helps)
          await new Promise((resolve) => setTimeout(resolve, 1000));

          return resolve(sendAuthError(res, ERROR_CODES.AUTH_INVALID));
        }
      } catch (error) {
        return resolve(handleUnexpectedError(res, error, 'Admin Authentication'));
      }
    });
  });
};
