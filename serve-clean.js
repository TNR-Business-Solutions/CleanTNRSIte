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
const EmailHandler = require("./email-handler");
const crmApiHandler = require("./api/crm-api");

const PORT = process.env.PORT || 5000;

// Initialize email handler
const emailHandler = new EmailHandler();

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

  // Handle CRM API requests
  if (pathname.startsWith("/api/crm/")) {
    crmApiHandler(req, res);
    return;
  }

  // Handle form submissions
  if (req.method === "POST" && pathname === "/submit-form") {
    handleFormSubmissionWithEmail(req, res);
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

  // Handle checkout
  if (req.method === "POST" && pathname === "/checkout") {
    handleCheckout(req, res);
    return;
  }

  // Handle root path
  if (pathname === "/" || pathname === "/index.html") {
    pathname = "/index.html";
  }

  // Construct file path
  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath);
  const mimeType = mimeTypes[ext] || "text/plain";

  // Check if file exists
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // File not found
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The file <code>${pathname}</code> was not found.</p>
            <p><a href="/">← Back to Home</a></p>
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
  // Server started successfully
});
