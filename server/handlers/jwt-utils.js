// JWT Utilities for Session Management
// Provides secure token generation and validation

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tnr-business-solutions-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'; // 24 hours
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 days

/**
 * Generate JWT access token
 * @param {object} payload - Token payload (user data)
 * @returns {string} - JWT token
 */
function generateAccessToken(payload) {
  return jwt.sign(
    {
      ...payload,
      type: 'access'
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'tnr-business-solutions',
      audience: 'tnr-admin-dashboard'
    }
  );
}

/**
 * Generate JWT refresh token
 * @param {object} payload - Token payload (user data)
 * @returns {string} - Refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(
    {
      ...payload,
      type: 'refresh'
    },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'tnr-business-solutions',
      audience: 'tnr-admin-dashboard'
    }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} - Decoded token or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'tnr-business-solutions',
      audience: 'tnr-admin-dashboard'
    });
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

/**
 * Extract token from request headers
 * @param {object} req - Request object
 * @returns {string|null} - Token or null
 */
function extractToken(req) {
  // Check Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check sessionToken in body (for backward compatibility)
  if (req.body && req.body.sessionToken) {
    return req.body.sessionToken;
  }
  
  // Check query parameter (for backward compatibility)
  if (req.query && req.query.token) {
    return req.query.token;
  }
  
  return null;
}

/**
 * Middleware to authenticate requests
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - Next middleware
 * @returns {void}
 */
function authenticate(req, res, next) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'No token provided'
    });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Token verification failed'
    });
  }
  
  // Attach user data to request
  req.user = decoded;
  next();
}

/**
 * Generate token pair (access + refresh)
 * @param {object} userData - User data to include in token
 * @returns {object} - Token pair
 */
function generateTokenPair(userData) {
  return {
    accessToken: generateAccessToken(userData),
    refreshToken: generateRefreshToken(userData),
    expiresIn: JWT_EXPIRES_IN
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  extractToken,
  authenticate,
  generateTokenPair,
  JWT_SECRET,
  JWT_EXPIRES_IN
};

