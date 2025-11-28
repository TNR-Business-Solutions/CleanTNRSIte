// HTTP Utilities for Raw Node.js HTTP Server
// Provides Express-like helpers for request/response handling

const { URL } = require("url");

/**
 * Parse query string from request URL
 */
function parseQuery(req) {
  const parsedUrl = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`
  );
  const query = {};
  parsedUrl.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

/**
 * Parse request body (supports JSON)
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        if (body.trim() === "") {
          resolve({});
        } else {
          resolve(JSON.parse(body));
        }
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

/**
 * Send JSON response
 * @param {Object} res - Response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Data to send as JSON
 * @param {Object} headers - Optional additional headers (defaults to CORS headers)
 */
function sendJson(res, statusCode, data, headers = {}) {
  // Check if headers have already been sent
  if (res.headersSent) {
    console.warn("Attempted to send response after headers were already sent");
    return;
  }
  
  // Default CORS headers
  const defaultHeaders = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "https://www.tnrbusinesssolutions.com",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  
  // Merge headers (user headers override defaults)
  const responseHeaders = { ...defaultHeaders, ...headers };
  
  res.writeHead(statusCode, responseHeaders);
  res.end(JSON.stringify(data));
}

module.exports = {
  parseQuery,
  parseBody,
  sendJson,
};
