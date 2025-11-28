// Rate Limiting Utility
// Prevents API abuse and ensures fair usage

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map();

/**
 * Rate limiter configuration
 */
const RATE_LIMITS = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later'
  },
  
  // Form submissions
  forms: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 submissions per hour
    message: 'Too many form submissions, please try again later'
  },
  
  // API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many API requests, please try again later'
  },
  
  // Email campaigns
  campaigns: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 campaigns per hour
    message: 'Too many campaign requests, please try again later'
  },
  
  // Social media posting
  social: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 posts per hour
    message: 'Too many social media posts, please try again later'
  }
};

/**
 * Get client identifier from request
 * @param {object} req - Request object
 * @returns {string} - Client identifier
 */
function getClientId(req) {
  // Use IP address as primary identifier
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
             req.headers['x-real-ip'] || 
             req.connection?.remoteAddress || 
             'unknown';
  
  // For authenticated users, use user ID
  if (req.user && req.user.username) {
    return `user:${req.user.username}`;
  }
  
  return `ip:${ip}`;
}

/**
 * Rate limit middleware
 * @param {string} type - Rate limit type (auth, forms, api, campaigns, social)
 * @returns {function} - Express middleware function
 */
function rateLimiter(type = 'api') {
  const config = RATE_LIMITS[type] || RATE_LIMITS.api;
  
  return (req, res, next) => {
    const clientId = getClientId(req);
    const key = `${type}:${clientId}`;
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || now - entry.resetTime > config.windowMs) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      };
      rateLimitStore.set(key, entry);
    }
    
    // Increment count
    entry.count++;
    
    // Check if limit exceeded
    if (entry.count > config.max) {
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
      
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: config.message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000) // seconds
      });
    }
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - entry.count));
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
    
    next();
  };
}

/**
 * Clean up expired rate limit entries (run periodically)
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

module.exports = {
  rateLimiter,
  getClientId,
  cleanupRateLimitStore
};

