/**
 * Pinterest OAuth Handler
 * Placeholder for future Pinterest OAuth implementation
 */

const { setCorsHeaders, handleCorsPreflight } = require("./cors-utils");
const { sendErrorResponse, handleUnexpectedError, ERROR_CODES } = require("./error-handler");
const { sendJson } = require("./http-utils");

module.exports = async (req, res) => {
  // Handle CORS
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  if (req.method !== "GET") {
    return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, "Method not allowed. Only GET requests are accepted.");
  }

  // Pinterest OAuth is not yet implemented
  // This is a placeholder for future implementation
  return sendJson(res, 501, {
    success: false,
    error: "Pinterest OAuth not yet implemented",
    message: "Pinterest OAuth integration is planned but not yet available. Please check back later.",
    status: "not_implemented"
  });
};

