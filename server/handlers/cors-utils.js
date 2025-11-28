// CORS Utility - Restricted to specific domains
// Provides secure CORS configuration

const ALLOWED_ORIGINS = [
  'https://www.tnrbusinesssolutions.com',
  'https://tnrbusinesssolutions.com',
  'http://localhost:5000',
  'http://localhost:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:3000'
];

/**
 * Get allowed origin for CORS
 * @param {string} origin - Request origin header
 * @returns {string} - Allowed origin or null
 */
function getAllowedOrigin(origin) {
  if (!origin) {
    // For same-origin requests, allow
    return null;
  }
  
  // Check if origin is in allowed list
  if (ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  
  // For development, allow localhost with any port
  if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
    return origin;
  }
  
  // Default: no CORS for unauthorized origins
  return null;
}

/**
 * Set CORS headers on response
 * @param {object} res - Response object
 * @param {string} origin - Request origin header
 */
function setCorsHeaders(res, origin) {
  if (res.headersSent) {
    return;
  }
  
  const allowedOrigin = getAllowedOrigin(origin);
  
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Handle CORS preflight request
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {boolean} - True if handled, false otherwise
 */
function handleCorsPreflight(req, res) {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || req.headers.referer;
    setCorsHeaders(res, origin);
    res.writeHead(200);
    res.end();
    return true;
  }
  return false;
}

module.exports = {
  getAllowedOrigin,
  setCorsHeaders,
  handleCorsPreflight
};

