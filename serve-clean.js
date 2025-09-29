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

const PORT = process.env.PORT || 5000;

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
    console.error("Cart operation error:", error);
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
    console.error("Checkout error:", error);
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

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle form submissions
  if (req.method === "POST" && pathname === "/submit-form") {
    handleFormSubmission(req, res);
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
      "Cache-Control": "no-cache", // Prevent caching for development
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log("🚀 TNR Clean Site Server Started!");
  console.log("================================================");
  console.log(`📍 Clean site running at: http://localhost:${PORT}`);
  console.log(`🏠 Homepage: http://localhost:${PORT}`);
  console.log(`🎨 Web Design: http://localhost:${PORT}/web-design.html`);
  console.log(`🔍 SEO Services: http://localhost:${PORT}/seo-services.html`);
  console.log(`📦 Packages: http://localhost:${PORT}/packages.html`);
  console.log("================================================");
  console.log("✨ Clean, simplified structure with Army Green cards!");
  console.log("🎯 Compare with main site at http://localhost:3000");
  console.log("================================================");
  console.log("Press Ctrl+C to stop the server");
});
