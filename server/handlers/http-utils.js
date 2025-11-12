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
 */
function sendJson(res, statusCode, data) {
  // Check if headers have already been sent
  if (res.headersSent) {
    console.warn("Attempted to send response after headers were already sent");
    return;
  }
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

module.exports = {
  parseQuery,
  parseBody,
  sendJson,
};
