// Error Handler Utility
// Provides standardized error responses and logging

/**
 * Error codes for different error types
 */
const ERROR_CODES = {
  // Authentication errors (1000-1099)
  AUTH_REQUIRED: 1001,
  AUTH_INVALID: 1002,
  AUTH_EXPIRED: 1003,
  AUTH_INSUFFICIENT_PERMISSIONS: 1004,
  
  // Validation errors (1100-1199)
  VALIDATION_ERROR: 1101,
  MISSING_FIELD: 1102,
  INVALID_FORMAT: 1103,
  INVALID_VALUE: 1104,
  
  // Rate limiting (1200-1299)
  RATE_LIMIT_EXCEEDED: 1201,
  
  // Database errors (1300-1399)
  DATABASE_ERROR: 1301,
  RECORD_NOT_FOUND: 1302,
  RECORD_EXISTS: 1303,
  
  // External API errors (1400-1499)
  EXTERNAL_API_ERROR: 1401,
  EXTERNAL_API_TIMEOUT: 1402,
  
  // Server errors (1500-1599)
  INTERNAL_ERROR: 1501,
  SERVICE_UNAVAILABLE: 1502,
  
  // CORS errors (1600-1699)
  CORS_NOT_ALLOWED: 1601
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Authentication required. Please log in.',
  [ERROR_CODES.AUTH_INVALID]: 'Invalid credentials. Please check your username and password.',
  [ERROR_CODES.AUTH_EXPIRED]: 'Your session has expired. Please log in again.',
  [ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action.',
  
  [ERROR_CODES.VALIDATION_ERROR]: 'The provided data is invalid. Please check your input.',
  [ERROR_CODES.MISSING_FIELD]: 'Required field is missing.',
  [ERROR_CODES.INVALID_FORMAT]: 'The data format is invalid.',
  [ERROR_CODES.INVALID_VALUE]: 'The provided value is not valid.',
  
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later.',
  
  [ERROR_CODES.DATABASE_ERROR]: 'A database error occurred. Please try again.',
  [ERROR_CODES.RECORD_NOT_FOUND]: 'The requested record was not found.',
  [ERROR_CODES.RECORD_EXISTS]: 'A record with this information already exists.',
  
  [ERROR_CODES.EXTERNAL_API_ERROR]: 'An external service error occurred. Please try again later.',
  [ERROR_CODES.EXTERNAL_API_TIMEOUT]: 'The request timed out. Please try again.',
  
  [ERROR_CODES.INTERNAL_ERROR]: 'An internal server error occurred. Please try again later.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again later.',
  
  [ERROR_CODES.CORS_NOT_ALLOWED]: 'This request is not allowed from your origin.'
};

/**
 * HTTP status codes mapping
 */
const HTTP_STATUS = {
  [ERROR_CODES.AUTH_REQUIRED]: 401,
  [ERROR_CODES.AUTH_INVALID]: 401,
  [ERROR_CODES.AUTH_EXPIRED]: 401,
  [ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 403,
  
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.MISSING_FIELD]: 400,
  [ERROR_CODES.INVALID_FORMAT]: 400,
  [ERROR_CODES.INVALID_VALUE]: 400,
  
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  
  [ERROR_CODES.DATABASE_ERROR]: 500,
  [ERROR_CODES.RECORD_NOT_FOUND]: 404,
  [ERROR_CODES.RECORD_EXISTS]: 409,
  
  [ERROR_CODES.EXTERNAL_API_ERROR]: 502,
  [ERROR_CODES.EXTERNAL_API_TIMEOUT]: 504,
  
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
  
  [ERROR_CODES.CORS_NOT_ALLOWED]: 403
};

/**
 * Create standardized error response
 * @param {number} errorCode - Error code
 * @param {string} message - Custom message (optional)
 * @param {object} details - Additional error details (optional)
 * @returns {object} - Error response object
 */
function createErrorResponse(errorCode, message = null, details = {}) {
  const userMessage = message || ERROR_MESSAGES[errorCode] || 'An error occurred';
  const statusCode = HTTP_STATUS[errorCode] || 500;
  
  return {
    success: false,
    error: {
      code: errorCode,
      message: userMessage,
      type: getErrorType(errorCode),
      ...details
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Get error type from error code
 * @param {number} errorCode - Error code
 * @returns {string} - Error type
 */
function getErrorType(errorCode) {
  if (errorCode >= 1000 && errorCode < 1100) return 'authentication';
  if (errorCode >= 1100 && errorCode < 1200) return 'validation';
  if (errorCode >= 1200 && errorCode < 1300) return 'rate_limit';
  if (errorCode >= 1300 && errorCode < 1400) return 'database';
  if (errorCode >= 1400 && errorCode < 1500) return 'external_api';
  if (errorCode >= 1500 && errorCode < 1600) return 'server';
  if (errorCode >= 1600 && errorCode < 1700) return 'cors';
  return 'unknown';
}

/**
 * Send error response
 * @param {object} res - Response object
 * @param {number} errorCode - Error code
 * @param {string} message - Custom message (optional)
 * @param {object} details - Additional details (optional)
 */
function sendErrorResponse(res, errorCode, message = null, details = {}) {
  const errorResponse = createErrorResponse(errorCode, message, details);
  const statusCode = HTTP_STATUS[errorCode] || 500;
  
  // Log error for debugging (but not sensitive details)
  const logDetails = { ...details };
  delete logDetails.password;
  delete logDetails.token;
  console.error(`[Error ${errorCode}] ${errorResponse.error.message}`, logDetails);
  
  if (!res.headersSent) {
    res.status(statusCode).json(errorResponse);
  }
}

/**
 * Handle unexpected errors
 * @param {object} res - Response object
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleUnexpectedError(res, error, context = 'Unknown') {
  console.error(`[Unexpected Error in ${context}]`, {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  
  const errorResponse = createErrorResponse(
    ERROR_CODES.INTERNAL_ERROR,
    'An unexpected error occurred. Please try again later.',
    {
      context,
      // Only include error details in development
      ...(process.env.NODE_ENV === 'development' && {
        originalError: error.message
      })
    }
  );
  
  if (!res.headersSent) {
    res.status(500).json(errorResponse);
  }
}

/**
 * Validation error helper
 * @param {object} res - Response object
 * @param {string} field - Field name
 * @param {string} message - Error message
 */
function sendValidationError(res, field, message) {
  sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, message, {
    field,
    validation: true
  });
}

/**
 * Authentication error helper
 * @param {object} res - Response object
 * @param {number} code - Specific auth error code
 * @param {string} message - Custom message
 */
function sendAuthError(res, code = ERROR_CODES.AUTH_INVALID, message = null) {
  sendErrorResponse(res, code, message);
}

module.exports = {
  ERROR_CODES,
  ERROR_MESSAGES,
  HTTP_STATUS,
  createErrorResponse,
  sendErrorResponse,
  handleUnexpectedError,
  sendValidationError,
  sendAuthError,
  getErrorType
};

