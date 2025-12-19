// Centralized Error Handler Utility
// Provides consistent error handling across all API endpoints

class ErrorHandler {
  /**
   * Handle API errors and return consistent error responses
   * @param {Error} error - The error object
   * @param {Object} context - Additional context (endpoint, userId, etc.)
   * @returns {Object} Formatted error response
   */
  static handleError(error, context = {}) {
    const errorId = `err-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`;
    const { endpoint = "unknown" } = context;

    // Log error with context
    console.error(`[${errorId}] Error in ${endpoint}:`, {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
    });

    // Network/Connection Errors
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ENOTFOUND"
    ) {
      return {
        success: false,
        error: "Connection Error",
        message:
          "Unable to connect to external service. Please check your internet connection and try again.",
        errorId: errorId,
        errorCode: error.code,
        retryable: true,
        help: "This is usually a temporary issue. Please try again in a few moments.",
      };
    }

    // HTTP Errors (from external APIs)
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // 401 Unauthorized
      if (status === 401) {
        return {
          success: false,
          error: "Authentication Error",
          message:
            "Your authentication token has expired or is invalid. Please reconnect your account.",
          errorId: errorId,
          statusCode: status,
          retryable: false,
          action: "reconnect",
          help: "Go to Platform Connections and reconnect your account.",
        };
      }

      // 403 Forbidden
      if (status === 403) {
        return {
          success: false,
          error: "Permission Denied",
          message:
            "You do not have permission to perform this action. Please check your account permissions.",
          errorId: errorId,
          statusCode: status,
          retryable: false,
          help: "Ensure you have the correct permissions on your account.",
        };
      }

      // 404 Not Found
      if (status === 404) {
        return {
          success: false,
          error: "Resource Not Found",
          message: "The requested resource could not be found.",
          errorId: errorId,
          statusCode: status,
          retryable: false,
          help: "Please verify the resource exists and try again.",
        };
      }

      // 429 Rate Limit
      if (status === 429) {
        return {
          success: false,
          error: "Rate Limit Exceeded",
          message:
            "Too many requests. Please wait a moment before trying again.",
          errorId: errorId,
          statusCode: status,
          retryable: true,
          retryAfter: error.response.headers["retry-after"] || 60,
          help: "Please wait a few minutes before trying again.",
        };
      }

      // 500+ Server Errors
      if (status >= 500) {
        return {
          success: false,
          error: "External Service Error",
          message:
            "The external service is experiencing issues. Please try again later.",
          errorId: errorId,
          statusCode: status,
          retryable: true,
          help: "This is usually a temporary issue with the external service.",
        };
      }

      // Other HTTP errors
      return {
        success: false,
        error: "API Error",
        message:
          data?.message ||
          data?.error?.message ||
          `Request failed with status ${status}`,
        errorId: errorId,
        statusCode: status,
        originalError: data,
        retryable: status >= 500,
      };
    }

    // Database Errors
    if (
      error.code === "SQLITE_ERROR" ||
      error.code === "SQLITE_CONSTRAINT" ||
      error.message?.includes("database")
    ) {
      return {
        success: false,
        error: "Database Error",
        message:
          "An error occurred while accessing the database. Please try again.",
        errorId: errorId,
        errorCode: error.code,
        retryable: true,
        help: "If this problem persists, please contact support.",
      };
    }

    // Validation Errors
    if (
      error.name === "ValidationError" ||
      error.message?.includes("required") ||
      error.message?.includes("invalid")
    ) {
      return {
        success: false,
        error: "Validation Error",
        message: error.message || "Please check your input and try again.",
        errorId: errorId,
        retryable: false,
        help: "Please review the form and ensure all required fields are filled correctly.",
      };
    }

    // Generic Error
    return {
      success: false,
      error: "Unexpected Error",
      message:
        error.message || "An unexpected error occurred. Please try again.",
      errorId: errorId,
      retryable: true,
      help: "If this problem persists, please contact support with the error ID.",
    };
  }

  /**
   * Send error response to client
   * @param {Object} res - Express response object
   * @param {Object} errorResponse - Error response from handleError
   * @param {Number} statusCode - HTTP status code (default: 500)
   */
  static sendErrorResponse(res, errorResponse, statusCode = 500) {
    // Determine status code from error response
    const finalStatusCode = errorResponse.statusCode || statusCode;

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    res.writeHead(finalStatusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(errorResponse));
  }

  /**
   * Handle async route errors
   * Wraps async route handlers to catch errors
   */
  static asyncHandler(fn) {
    return async (req, res, ...args) => {
      try {
        await fn(req, res, ...args);
      } catch (error) {
        const errorResponse = this.handleError(error, {
          endpoint: req.url,
          method: req.method,
          userId: req.user?.id,
        });
        this.sendErrorResponse(res, errorResponse);
      }
    };
  }

  /**
   * Validate required fields
   * @param {Object} data - Data to validate
   * @param {Array} requiredFields - Array of required field names
   * @throws {Error} ValidationError if fields are missing
   */
  static validateRequired(data, requiredFields) {
    const missing = requiredFields.filter((field) => !data[field]);
    if (missing.length > 0) {
      const error = new Error(`Missing required fields: ${missing.join(", ")}`);
      error.name = "ValidationError";
      error.missingFields = missing;
      throw error;
    }
  }
}

module.exports = ErrorHandler;
