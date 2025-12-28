// Load environment variables first
require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const { handleFormSubmission } = require("./form-handler");
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  processCheckout,
} = require("./cart-handler");
// Initialize email handler (optional - may fail if SMTP not configured)
let emailHandler = null;
try {
  const EmailHandler = require("./email-handler");
  emailHandler = new EmailHandler();
  console.log("✅ Email handler initialized");
} catch (error) {
  console.warn("⚠️ Email handler not available:", error.message);
  console.warn(
    "   Email functionality will be disabled until SMTP is configured"
  );
}

const PORT = process.env.PORT || 3000;

// Handle admin authentication
async function handleAdminAuth(req, res) {
  console.log(
    "🔐 handleAdminAuth called, method:",
    req.method,
    "url:",
    req.url
  );

  // OPTIONS requests are handled before this function is called
  // Only accept POST requests (OPTIONS already handled)
  if (req.method !== "POST") {
    console.log("❌ Method not POST, returning 405");
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: "Method not allowed",
      })
    );
    return;
  }

  console.log("✅ POST method accepted, processing auth...");

  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { username, password } = JSON.parse(body || "{}");

        // Validate input
        if (!username || !password) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              error: "Username and password required",
            })
          );
          return;
        }

        // Get credentials from environment variables (SECURE)
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "TNR2024!";

        // Debug logging
        console.log("🔐 Auth attempt:", {
          providedUsername: username,
          providedPassword: password
            ? `${password.substring(0, 2)}***`
            : "empty",
          expectedUsername: ADMIN_USERNAME,
          expectedPassword: ADMIN_PASSWORD
            ? `${ADMIN_PASSWORD.substring(0, 2)}***`
            : "empty",
          usernameMatch: username === ADMIN_USERNAME,
          passwordMatch: password === ADMIN_PASSWORD,
          passwordLength: password?.length,
          expectedLength: ADMIN_PASSWORD?.length,
        });

        // Validate credentials (trim whitespace and handle special characters)
        const trimmedUsername = username?.trim();
        const trimmedPassword = password?.trim();
        const trimmedAdminUsername = ADMIN_USERNAME?.trim();
        const trimmedAdminPassword = ADMIN_PASSWORD?.trim();

        const usernameMatches = trimmedUsername === trimmedAdminUsername;
        const passwordMatches = trimmedPassword === trimmedAdminPassword;

        if (usernameMatches && passwordMatches) {
          // Generate a simple session token (in production, use JWT or proper session management)
          const sessionToken = Buffer.from(
            `${username}:${Date.now()}`
          ).toString("base64");

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: true,
              message: "Authentication successful",
              sessionToken: sessionToken,
              redirectTo: "/admin-dashboard-v2.html",
            })
          );
        } else {
          // Add small delay to prevent brute force attacks
          await new Promise((resolve) => setTimeout(resolve, 1000));

          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              error: "Invalid credentials",
            })
          );
        }
      } catch (error) {
        console.error("Auth error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "Internal server error",
          })
        );
      }
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      })
    );
  }
}

// Handle form submissions with email
async function handleFormSubmissionWithEmail(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const formData = JSON.parse(body || "{}");

        console.log(
          "📥 Server received form data:",
          JSON.stringify(formData, null, 2)
        );

        // Send email notification
        const emailResult = await emailHandler.sendContactFormEmail(formData);

        console.log("📧 Email send result:", emailResult);

        // Email notification processed

        // Send success response
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Form submitted successfully",
            emailSent: emailResult.success,
          })
        );
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "Form processing error",
          })
        );
      }
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        message: "Server error",
      })
    );
  }
}

// Handle cart operations
async function handleCartRequest(req, res, operation) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body || "{}");
      const { sessionId, serviceId, quantity } = data;

      let result;

      switch (operation) {
        case "add":
          result = addToCart(sessionId, serviceId, quantity);
          break;
        case "remove":
          result = removeFromCart(sessionId, serviceId);
          break;
        case "update":
          result = updateCartItem(sessionId, serviceId, quantity);
          break;
        case "clear":
          result = clearCart(sessionId);
          break;
        case "get":
          result = { success: true, cart: getCart(sessionId) };
          break;
        default:
          result = { success: false, message: "Invalid operation" };
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ success: false, message: "Internal server error" })
    );
  }
}

// Handle checkout
async function handleCheckout(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { sessionId, customerInfo, paymentInfo, cart } = data;

      const result = await processCheckout(
        sessionId,
        customerInfo,
        paymentInfo,
        cart
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Checkout failed" }));
  }
}

// Handle dashboard stats API
async function handleDashboardStats(req, res) {
  try {
    // Simulate real-time stats (integrate with your CRM/analytics system)
    const stats = {
      liveVisitors: Math.floor(Math.random() * 50) + 10,
      todayLeads: Math.floor(Math.random() * 20) + 5,
      monthlyRevenue: Math.floor(Math.random() * 50000) + 10000,
      conversionRate: (Math.random() * 5 + 2).toFixed(1),
      responseTime: (Math.random() * 2 + 1).toFixed(1)
    };

    res.writeHead(200, { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    });
    res.end(JSON.stringify(stats));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Failed to fetch stats" }));
  }
}

// Handle recent leads API
async function handleRecentLeads(req, res) {
  try {
    // Simulate recent leads (integrate with your CRM system)
    const leads = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        type: "insurance_quote",
        source: "contact_form",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: "new"
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        type: "consultation",
        source: "landing_page",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: "contacted"
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        type: "quote_request",
        source: "exit_intent",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        status: "new"
      }
    ];

    res.writeHead(200, { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    });
    res.end(JSON.stringify(leads));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Failed to fetch leads" }));
  }
}

// Handle export leads API
async function handleExportLeads(req, res) {
  try {
    // Generate CSV data
    const csvData = [
      ['Name', 'Email', 'Type', 'Source', 'Timestamp', 'Status'],
      ['John Doe', 'john@example.com', 'insurance_quote', 'contact_form', new Date().toISOString(), 'new'],
      ['Jane Smith', 'jane@example.com', 'consultation', 'landing_page', new Date().toISOString(), 'contacted']
    ].map(row => row.join(',')).join('\n');

    res.writeHead(200, { 
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=leads.csv"
    });
    res.end(csvData);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Failed to export leads" }));
  }
}

// MIME types for different file extensions
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Enhanced caching headers
function getCacheHeaders(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    "Cache-Control": "",
    ETag: "",
    "Last-Modified": "",
    Expires: "",
  };

  // Set cache duration based on file type
  let maxAge = 0;
  let cacheType = "no-cache";

  // Static assets (1 year)
  if (
    [
      ".css",
      ".js",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
      ".ico",
      ".woff",
      ".woff2",
      ".ttf",
      ".eot",
    ].includes(ext)
  ) {
    maxAge = 31536000; // 1 year
    cacheType = "public, immutable";
  }
  // HTML files (1 hour)
  else if (ext === ".html") {
    maxAge = 3600; // 1 hour
    cacheType = "public";
  }
  // Images (1 month)
  else if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext)) {
    maxAge = 2592000; // 30 days
    cacheType = "public";
  }
  // Default (5 minutes)
  else {
    maxAge = 300;
    cacheType = "public";
  }

  try {
    const stats = fs.statSync(filePath);
    const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
    headers["ETag"] = etag;
    headers["Last-Modified"] = stats.mtime.toUTCString();
    headers["Cache-Control"] = `${cacheType}, max-age=${maxAge}`;

    const expires = new Date(Date.now() + maxAge * 1000);
    headers["Expires"] = expires.toUTCString();
  } catch (error) {
    headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
  }

  return headers;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle Admin Authentication FIRST (before other API routes)
  if (pathname === "/api/admin/auth") {
    console.log("🔐 Admin auth route matched, method:", req.method);
    // Handle CORS preflight (OPTIONS) requests
    if (req.method === "OPTIONS") {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      res.end();
      return;
    }
    handleAdminAuth(req, res);
    return;
  }

  // Handle Admin Requests (password reset, new user)
  if (pathname === "/api/admin-requests") {
    const adminRequestsHandler = require("./server/handlers/admin-requests");
    adminRequestsHandler(req, res).catch((err) => {
      console.error("Admin Requests Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle WhatsApp Sending
  if (pathname.startsWith("/api/send/whatsapp")) {
    const whatsappHandler = require("./server/handlers/send-whatsapp");
    whatsappHandler(req, res).catch((err) => {
      console.error("WhatsApp Send Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle CRM API requests
  if (pathname.startsWith("/api/crm/")) {
    const crmApiHandler = require("./server/handlers/crm-api");
    crmApiHandler(req, res).catch((err) => {
      console.error("CRM API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Campaign API requests
  if (pathname.startsWith("/api/campaigns/")) {
    const campaignApiHandler = require("./server/handlers/campaign-api");
    campaignApiHandler(req, res).catch((err) => {
      console.error("Campaign API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Workflows API
  if (pathname.startsWith("/api/workflows")) {
    const workflowsApi = require("./server/handlers/workflows-api");
    workflowsApi(req, res).catch((err) => {
      console.error("Workflows API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Dashboard Stats API
  if (
    pathname === "/api/stats/dashboard" ||
    pathname.startsWith("/api/stats/")
  ) {
    const dashboardStatsApi = require("./server/handlers/dashboard-stats-api");
    dashboardStatsApi(req, res).catch((err) => {
      console.error("Dashboard Stats API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Posts API
  if (pathname.startsWith("/api/posts")) {
    const postsApi = require("./server/handlers/posts-api");
    postsApi(req, res).catch((err) => {
      console.error("Posts API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Messages API
  if (pathname.startsWith("/api/messages")) {
    const messagesApi = require("./server/handlers/messages-api");
    messagesApi(req, res).catch((err) => {
      console.error("Messages API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Analytics Events API
  if (
    pathname.startsWith("/api/analytics/events") ||
    pathname === "/api/analytics-events"
  ) {
    const analyticsEventsApi = require("./server/handlers/analytics-events-api");
    analyticsEventsApi(req, res).catch((err) => {
      console.error("Analytics Events API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Analytics API
  if (pathname.startsWith("/api/analytics")) {
    const analyticsApi = require("./server/handlers/analytics-api");
    analyticsApi(req, res).catch((err) => {
      console.error("Analytics API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Activities API
  if (pathname.startsWith("/api/activities")) {
    const activitiesApi = require("./server/handlers/activities-api");
    activitiesApi(req, res).catch((err) => {
      console.error("Activities API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Email Templates API
  if (pathname.startsWith("/api/email-templates")) {
    const templatesApi = require("./server/handlers/email-templates-api");
    templatesApi(req, res).catch((err) => {
      console.error("Email Templates API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Social Media Tokens API
  if (pathname.startsWith("/api/social/tokens")) {
    const tokensApi = require("./server/handlers/social-tokens-api");
    tokensApi(req, res).catch((err) => {
      console.error("Social Tokens API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Settings API
  if (pathname.startsWith("/api/settings")) {
    const settingsApi = require("./server/handlers/settings-api");
    settingsApi(req, res).catch((err) => {
      console.error("Settings API Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Meta OAuth
  if (pathname.startsWith("/api/auth/meta")) {
    if (pathname.includes("callback")) {
      const callbackHandler = require("./server/handlers/auth-meta-callback");
      callbackHandler(req, res).catch((err) => {
        console.error("Meta OAuth Callback Error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, error: "Internal server error" })
          );
        }
      });
    } else {
      const authHandler = require("./server/handlers/auth-meta");
      authHandler(req, res).catch((err) => {
        console.error("Meta OAuth Error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, error: "Internal server error" })
          );
        }
      });
    }
    return;
  }

  // Handle LinkedIn OAuth
  if (pathname.startsWith("/api/auth/linkedin")) {
    if (pathname.includes("callback")) {
      const callbackHandler = require("./server/handlers/auth-linkedin-callback");
      callbackHandler(req, res).catch((err) => {
        console.error("LinkedIn OAuth Callback Error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, error: "Internal server error" })
          );
        }
      });
    } else {
      const authHandler = require("./server/handlers/auth-linkedin");
      authHandler(req, res).catch((err) => {
        console.error("LinkedIn OAuth Error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, error: "Internal server error" })
          );
        }
      });
    }
    return;
  }

  // Handle Twitter OAuth
  if (pathname.startsWith("/api/auth/twitter")) {
    if (pathname.includes("callback")) {
      const callbackHandler = require("./server/handlers/auth-twitter-callback");
      callbackHandler(req, res).catch((err) => {
        console.error("Twitter OAuth Callback Error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, error: "Internal server error" })
          );
        }
      });
    } else {
      const authHandler = require("./server/handlers/auth-twitter");
      authHandler(req, res).catch((err) => {
        console.error("Twitter OAuth Error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, error: "Internal server error" })
          );
        }
      });
    }
    return;
  }

  // Handle Threads OAuth
  if (pathname.startsWith("/api/auth/threads")) {
    if (pathname.includes("callback")) {
      const callbackHandler = require("./server/handlers/auth-threads-callback");
      callbackHandler(req, res).catch((err) => {
        console.error("Threads OAuth Callback Error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, error: "Internal server error" })
          );
        }
      });
    } else {
      const authHandler = require("./server/handlers/auth-threads");
      authHandler(req, res).catch((err) => {
        console.error("Threads OAuth Error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, error: "Internal server error" })
          );
        }
      });
    }
    return;
  }

  // Handle Multi-Platform Social Media Posting
  if (
    pathname.startsWith("/api/social/post-to-multiple-platforms") ||
    pathname.startsWith("/api/social/post-to-multiple")
  ) {
    const multiPlatformHandler = require("./server/handlers/post-to-multiple-platforms");
    multiPlatformHandler(req, res).catch((err) => {
      console.error("Multi-Platform Posting Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle Social Media Posting
  if (pathname.startsWith("/api/social/post-to-facebook")) {
    const fbHandler = require("./server/handlers/post-to-facebook");
    fbHandler(req, res).catch((err) => {
      console.error("Facebook Posting Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  if (pathname.startsWith("/api/social/post-to-instagram")) {
    const igHandler = require("./server/handlers/post-to-instagram");
    igHandler(req, res).catch((err) => {
      console.error("Instagram Posting Error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Internal server error" })
        );
      }
    });
    return;
  }

  // Handle form submissions
  if (pathname === "/submit-form") {
    // Handle CORS preflight (OPTIONS) requests
    if (req.method === "OPTIONS") {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      res.end();
      return;
    }
    if (req.method === "POST") {
      handleFormSubmissionWithEmail(req, res);
      return;
    }
    // Method not allowed
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Method not allowed" }));
    return;
  }

  // Handle cart operations
  if (req.method === "POST" && pathname === "/cart/add") {
    handleCartRequest(req, res, "add");
    return;
  }

  if (req.method === "POST" && pathname === "/cart/remove") {
    handleCartRequest(req, res, "remove");
    return;
  }

  if (req.method === "POST" && pathname === "/cart/update") {
    handleCartRequest(req, res, "update");
    return;
  }

  if (req.method === "POST" && pathname === "/cart/clear") {
    handleCartRequest(req, res, "clear");
    return;
  }

  if (req.method === "GET" && pathname === "/cart") {
    handleCartRequest(req, res, "get");
    return;
  }

  // Handle dashboard API endpoints
  if (req.method === "GET" && pathname === "/api/dashboard/stats") {
    handleDashboardStats(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/leads/recent") {
    handleRecentLeads(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/leads/export") {
    handleExportLeads(req, res);
    return;
  }

  // Handle checkout
  if (req.method === "POST" && pathname === "/checkout") {
    handleCheckout(req, res);
    return;
  }

  // Handle favicon requests gracefully
  if (pathname === "/favicon.ico") {
    res.writeHead(204, { "Content-Type": "image/x-icon" });
    res.end();
    return;
  }

  // Handle root path
  if (pathname === "/" || pathname === "/index.html") {
    pathname = "/index.html";
  }

  // Handle admin directory - ensure it serves index.html for directories
  if (pathname.startsWith("/admin")) {
    // If it's exactly "/admin" or "/admin/", redirect to index
    if (pathname === "/admin" || pathname === "/admin/") {
      pathname = "/admin/index.html";
    }
    // If it's a directory path ending with /, add index.html
    else if (pathname.endsWith("/")) {
      pathname = pathname.replace(/\/$/, "") + "/index.html";
    }
    // If no extension and doesn't end with /, assume it's a directory and add index.html
    else if (!path.extname(pathname)) {
      pathname = pathname + "/index.html";
    }
  }

  // Construct file path
  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath);
  const mimeType = mimeTypes[ext] || "text/plain";

  // Debug logging
  console.log(`📂 Request: ${pathname} -> ${filePath}`);

  // Check if file exists
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // File not found - log for debugging
      console.error(`❌ 404: ${pathname} -> ${filePath}`);
      console.error(`   Error: ${err.message}`);

      // Try to serve index.html if it's a directory
      if (err.code === "EISDIR" || err.code === "ENOENT") {
        const dirIndexPath = path.join(filePath, "index.html");
        fs.readFile(dirIndexPath, (err2, data2) => {
          if (!err2) {
            res.writeHead(200, {
              "Content-Type": "text/html",
              ...getCacheHeaders(dirIndexPath),
            });
            res.end(data2);
            return;
          }
        });
      }

      // File not found
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The file <code>${pathname}</code> was not found.</p>
            <p>Requested path: <code>${filePath}</code></p>
            <p><a href="/">← Back to Home</a></p>
            <p><a href="/admin/">Admin Dashboard</a></p>
          </body>
        </html>
      `);
      return;
    }

    // File found, serve it
    res.writeHead(200, {
      "Content-Type": mimeType,
      ...getCacheHeaders(filePath),
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(
    `📊 Admin Dashboard: http://localhost:${PORT}/admin-dashboard-v2.html`
  );
  console.log(`👥 CRM System: http://localhost:${PORT}/admin/crm/`);
  console.log(`📧 Email Campaigns: http://localhost:${PORT}/admin/campaigns/`);
  console.log(`🤖 Workflows: http://localhost:${PORT}/admin/automation/`);
  console.log(`📈 Analytics: http://localhost:${PORT}/admin/analytics/`);
  console.log(`📝 Templates: http://localhost:${PORT}/admin/email-templates/`);
});
