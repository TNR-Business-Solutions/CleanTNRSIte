// Consolidated API Router - Single Serverless Function
// Routes all API requests to appropriate handlers

const { sendJson } = require("../server/handlers/http-utils");

module.exports = async (req, res) => {
  // Get pathname from request
  // Vercel provides req.url with query string, or we can use the path directly
  let pathname = req.url.split("?")[0]; // Remove query string if present
  let route = "";

  // Handle Vercel's catch-all parameter - this is the primary way Vercel passes segments
  // For catch-all routes like /api/[...all], Vercel passes segments in req.query.all
  if (req.query && req.query.all !== undefined && req.query.all !== null) {
    // For routes like /api/crm/clients, req.query.all might be "crm/clients" or ['crm', 'clients']
    const allParam = Array.isArray(req.query.all)
      ? req.query.all.join("/")
      : String(req.query.all);
    route = allParam;
    pathname = "/api/" + allParam;
  } else if (req.url) {
    // Fallback: extract from req.url if query.all is not available
    // This handles cases where Vercel might structure the request differently
    // Remove query string first
    const urlWithoutQuery = req.url.split("?")[0];
    const urlMatch = urlWithoutQuery.match(/\/api\/(.+)$/);
    if (urlMatch && urlMatch[1]) {
      route = urlMatch[1];
      pathname = "/api/" + route;
    } else if (urlWithoutQuery === "/api" || urlWithoutQuery === "/api/") {
      route = "";
      pathname = "/api";
    }
  }

  // If route is still empty, try to get it from the path
  if (!route && pathname) {
    const match = pathname.match(/\/api\/(.+)$/);
    if (match) {
      route = match[1];
    }
  }

  // Always log for debugging (will help identify routing issues)
  console.log("API Route Debug:", {
    pathname,
    route,
    query: req.query,
    url: req.url,
    method: req.method,
    hasAll: req.query?.all !== undefined,
    allValue: req.query?.all,
  });

  // Handle CORS globally - but don't set headers yet, let sendJson handle it
  // We'll handle OPTIONS separately
  if (req.method === "OPTIONS") {
    if (!res.headersSent) {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      res.end();
    }
    return;
  }

  try {
    // Ensure req.url has full path for handlers that parse it
    const fullPath = pathname.startsWith("/api/")
      ? pathname
      : "/api" + pathname;

    // Route to appropriate handler
    // Handle CRM routes - check for 'crm' at the start or as the whole route
    if (route === "crm" || route.startsWith("crm/")) {
      console.log("✅ Routing to CRM API handler");
      const handler = require("../server/handlers/crm-api");
      req.url = fullPath;
      return await handler(req, res);
    }

    if (route.startsWith("campaigns/") || route === "campaigns") {
      const handler = require("../server/handlers/campaign-api");
      req.url = fullPath;
      return await handler(req, res);
    }

    if (route === "submit-form" || pathname === "/submit-form") {
      const handler = require("../server/handlers/submit-form");
      return await handler(req, res);
    }

    if (route === "checkout" || pathname === "/checkout") {
      const handler = require("../server/handlers/checkout");
      return await handler(req, res);
    }

    // Admin auth route - check early and explicitly
    if (
      route === "admin/auth" ||
      route === "admin/auth/" ||
      route.startsWith("admin/auth/")
    ) {
      console.log("Routing to admin-auth handler");
      const handler = require("../server/handlers/admin-auth");
      return await handler(req, res);
    }

    // Also check if route is just 'admin/auth' without the slash
    if (route.includes("admin") && route.includes("auth")) {
      console.log("Detected admin/auth in route, attempting to route");
      const handler = require("../server/handlers/admin-auth");
      return await handler(req, res);
    }

    if (route.startsWith("auth/meta")) {
      if (route === "auth/meta/callback" || route.endsWith("/callback")) {
        const handler = require("../server/handlers/auth-meta-callback");
        return await handler(req, res);
      }
      const handler = require("../server/handlers/auth-meta");
      return await handler(req, res);
    }

    if (route.startsWith("auth/linkedin")) {
      if (route === "auth/linkedin/callback" || route.endsWith("/callback")) {
        const handler = require("../server/handlers/auth-linkedin-callback");
        return await handler(req, res);
      }
      const handler = require("../server/handlers/auth-linkedin");
      return await handler(req, res);
    }

    if (route.startsWith("auth/twitter")) {
      if (route === "auth/twitter/callback" || route.endsWith("/callback")) {
        const handler = require("../server/handlers/auth-twitter-callback");
        return await handler(req, res);
      }
      const handler = require("../server/handlers/auth-twitter");
      return await handler(req, res);
    }

    // Wix OAuth routes
    if (route.startsWith("auth/wix")) {
      if (route === "auth/wix/callback" || route.endsWith("/callback")) {
        const handler = require("../server/handlers/auth-wix-callback");
        return await handler(req, res);
      }
      const handler = require("../server/handlers/auth-wix");
      return await handler(req, res);
    }

    // Wix API routes - handle /api/wix requests
    if (route === "wix" || route.startsWith("wix/")) {
      console.log("✅ Routing to Wix API handler");
      const handler = require("../server/handlers/wix-api-routes");
      return await handler(req, res);
    }

    if (route.startsWith("workflows/") || route === "workflows") {
      const handler = require("../server/handlers/workflows-api");
      return await handler(req, res);
    }

    if (route.startsWith("analytics/") || route === "analytics") {
      const handler = require("../server/handlers/analytics-api");
      return await handler(req, res);
    }

    if (route.startsWith("activities/") || route === "activities") {
      const handler = require("../server/handlers/activities-api");
      return await handler(req, res);
    }

    if (route.startsWith("email-templates/") || route === "email-templates") {
      const handler = require("../server/handlers/email-templates-api");
      return await handler(req, res);
    }

    // Social media token management - handle both /api/social-tokens and /api/social/tokens
    if (
      route === "social-tokens" ||
      route.startsWith("social/tokens") ||
      route === "social/tokens"
    ) {
      const handler = require("../server/handlers/social-tokens-api");
      return await handler(req, res);
    }

    // Post to Twitter - handle both /api/post-to-twitter and /api/social/post-to-twitter
    if (
      route === "post-to-twitter" ||
      route.includes("post-to-twitter") ||
      route === "social/post-twitter"
    ) {
      const handler = require("../server/handlers/post-to-twitter");
      return await handler(req, res);
    }

    if (route.startsWith("social/")) {
      if (route.includes("tokens") || route === "social/tokens") {
        const handler = require("../server/handlers/social-tokens-api");
        return await handler(req, res);
      }
      if (
        route.includes("post-to-facebook") ||
        route === "social/post-facebook" ||
        route === "social/post"
      ) {
        const handler = require("../server/handlers/post-to-facebook");
        return await handler(req, res);
      }
      if (
        route.includes("post-to-instagram") ||
        route === "social/post-instagram"
      ) {
        const handler = require("../server/handlers/post-to-instagram");
        return await handler(req, res);
      }
      if (
        route.includes("post-to-linkedin") ||
        route === "social/post-linkedin"
      ) {
        const handler = require("../server/handlers/post-to-linkedin");
        return await handler(req, res);
      }
      if (
        route.includes("post-to-twitter") ||
        route === "social/post-twitter"
      ) {
        const handler = require("../server/handlers/post-to-twitter");
        return await handler(req, res);
      }
      if (route.includes("test-token") || route === "social/test") {
        const handler = require("../server/handlers/test-token");
        return await handler(req, res);
      }
      if (route.includes("get-insights")) {
        const handler = require("../server/handlers/get-insights");
        return await handler(req, res);
      }
    }

    // Handle root /api endpoint
    if (!route || route === "" || pathname === "/api" || pathname === "/api/") {
      sendJson(res, 200, {
        success: true,
        message: "TNR Business Solutions API",
        version: "1.0.0",
        availableEndpoints: [
          "/api/crm/* - CRM management",
          "/api/campaigns/* - Email campaigns",
          "/api/auth/meta - Facebook/Instagram OAuth",
          "/api/auth/linkedin - LinkedIn OAuth",
          "/api/auth/twitter - Twitter OAuth",
          "/api/auth/wix - Wix OAuth",
          "/api/wix - Wix automation API",
          "/api/social/tokens - Social media token management",
          "/api/social/post-to-facebook - Post to Facebook",
          "/api/social/post-to-instagram - Post to Instagram",
          "/api/social/post-to-linkedin - Post to LinkedIn",
          "/api/social/post-to-twitter - Post to Twitter",
          "/api/social/test-token - Test social media token",
          "/api/social/get-insights - Get social media insights",
          "/api/admin/auth - Admin authentication",
        ],
      });
      return;
    }

    // 404 for unknown routes - log what we received
    console.error("❌ Route not found:", {
      route,
      pathname,
      url: req.url,
      query: req.query,
      method: req.method,
    });
    sendJson(res, 404, {
      success: false,
      error: "Endpoint not found",
      message: `The API endpoint '${pathname}' was not found.`,
      route: route,
      pathname: pathname,
      url: req.url,
      method: req.method,
      availableRoutes: [
        "/api/crm/*",
        "/api/campaigns/*",
        "/api/auth/meta",
        "/api/auth/linkedin",
        "/api/auth/twitter",
        "/api/auth/wix",
        "/api/wix",
        "/api/social/tokens",
        "/api/social/post-to-facebook",
        "/api/social/post-to-instagram",
        "/api/social/post-to-linkedin",
        "/api/social/post-to-twitter",
        "/api/social/test-token",
        "/api/social/get-insights",
        "/api/admin/auth",
      ],
    });
  } catch (error) {
    console.error("❌ API Router Error:", error);
    console.error("Error stack:", error.stack);
    if (!res.headersSent) {
      sendJson(res, 500, {
        success: false,
        error: error.message,
        message:
          "An internal server error occurred while processing your request.",
      });
    }
  }
};
