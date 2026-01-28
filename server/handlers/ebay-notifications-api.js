/**
 * eBay Notification Endpoint Handler
 * Handles eBay marketplace deletion notifications and other webhook events
 * 
 * Endpoint: /api/ebay/notifications/marketplace-deletion
 * Verification Token: TNR-Cards-2026-woowreDVxpwAmvzZ2LE2DOOx
 */

const { setCorsHeaders, handleCorsPreflight } = require("./cors-utils");
const { sendJson, sendError } = require("./http-utils");

// eBay verification token from environment or default
const EBAY_VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN || "TNR-Cards-2026-woowreDVxpwAmvzZ2LE2DOOx";

module.exports = async (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  
  // Handle CORS preflight
  if (handleCorsPreflight(req, res)) {
    return;
  }
  
  setCorsHeaders(res, origin);

  try {
    const method = req.method;

    // GET - eBay webhook verification (challenge-response)
    if (method === "GET") {
      const challenge = req.query.challenge;
      const verifyToken = req.query.verificationToken || req.headers["x-ebay-verification-token"];

      console.log("eBay Webhook Verification Request:", {
        challenge,
        verifyToken,
        query: req.query,
        headers: req.headers,
      });

      // Verify the token matches
      if (verifyToken !== EBAY_VERIFICATION_TOKEN) {
        console.warn("eBay verification token mismatch:", {
          received: verifyToken,
          expected: EBAY_VERIFICATION_TOKEN.substring(0, 10) + "...",
        });
        return sendJson(res, 401, {
          success: false,
          error: "Invalid verification token",
        });
      }

      // Return the challenge string (eBay requirement)
      if (challenge) {
        console.log("✅ eBay webhook verified successfully");
        res.writeHead(200, {
          "Content-Type": "text/plain",
          "X-Content-Type-Options": "nosniff",
        });
        res.end(challenge);
        return;
      }

      // If no challenge, return success anyway
      return sendJson(res, 200, {
        success: true,
        message: "eBay webhook endpoint is active",
        verificationToken: EBAY_VERIFICATION_TOKEN.substring(0, 10) + "...",
      });
    }

    // POST - Handle eBay notification events
    if (method === "POST") {
      let body = "";
      
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const notification = JSON.parse(body);
          
          console.log("📦 eBay Notification Received:", {
            timestamp: new Date().toISOString(),
            eventType: notification.eventType || notification.notificationType,
            topic: notification.topic,
            data: notification.data || notification.payload,
          });

          // Handle different notification types
          const eventType = notification.eventType || notification.notificationType || notification.topic;
          
          switch (eventType) {
            case "MARKETPLACE_ACCOUNT_DELETION":
            case "marketplace-deletion":
            case "MARKETPLACE_DELETION":
              await handleMarketplaceDeletion(notification);
              break;
            
            case "ORDER_CREATED":
            case "order-created":
              await handleOrderCreated(notification);
              break;
            
            case "ORDER_UPDATED":
            case "order-updated":
              await handleOrderUpdated(notification);
              break;
            
            case "INVENTORY_UPDATED":
            case "inventory-updated":
              await handleInventoryUpdated(notification);
              break;
            
            default:
              console.log("⚠️ Unknown eBay notification type:", eventType);
              // Still return 200 to acknowledge receipt
          }

          // Always return 200 OK to acknowledge receipt (eBay requirement)
          return sendJson(res, 200, {
            success: true,
            message: "Notification received and processed",
            eventType: eventType,
            timestamp: new Date().toISOString(),
          });

        } catch (parseError) {
          console.error("❌ Error parsing eBay notification:", parseError);
          console.error("Raw body:", body.substring(0, 500));
          
          // Still return 200 to prevent eBay from retrying invalid payloads
          return sendJson(res, 200, {
            success: false,
            error: "Notification received but could not be parsed",
            message: parseError.message,
          });
        }
      });
      
      return; // Don't send response yet, wait for 'end' event
    }

    // Unsupported method
    return sendJson(res, 405, {
      success: false,
      error: "Method not allowed",
      allowedMethods: ["GET", "POST"],
    });

  } catch (error) {
    console.error("❌ eBay notification handler error:", error);
    return sendError(res, 500, {
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

/**
 * Handle marketplace account deletion notification
 */
async function handleMarketplaceDeletion(notification) {
  console.log("🗑️ Marketplace Deletion Notification:", {
    userId: notification.data?.userId || notification.payload?.userId,
    marketplaceId: notification.data?.marketplaceId || notification.payload?.marketplaceId,
    timestamp: notification.timestamp || new Date().toISOString(),
  });

  // TODO: Implement your business logic here
  // Examples:
  // - Remove user data from your database
  // - Cancel active subscriptions
  // - Send notification email
  // - Update CRM records
  
  // Log to activity log if available
  try {
    const { logActivity } = require("./activity-log-api");
    if (logActivity) {
      await logActivity(
        "ebay",
        "marketplace_deletion",
        `Marketplace account deleted: ${notification.data?.userId || "unknown"}`,
        "system",
        "ebay-integration",
        notification
      );
    }
  } catch (logError) {
    // Activity logging is optional, don't fail if it's not available
    console.log("Could not log activity:", logError.message);
  }
}

/**
 * Handle order created notification
 */
async function handleOrderCreated(notification) {
  console.log("🛒 Order Created Notification:", {
    orderId: notification.data?.orderId || notification.payload?.orderId,
    buyerId: notification.data?.buyerId || notification.payload?.buyerId,
    total: notification.data?.total || notification.payload?.total,
  });

  // TODO: Implement order processing logic
  // - Create order in your system
  // - Update inventory
  // - Send confirmation email
  // - Update CRM
}

/**
 * Handle order updated notification
 */
async function handleOrderUpdated(notification) {
  console.log("📝 Order Updated Notification:", {
    orderId: notification.data?.orderId || notification.payload?.orderId,
    status: notification.data?.status || notification.payload?.status,
  });

  // TODO: Implement order update logic
  // - Update order status in your system
  // - Trigger fulfillment if needed
  // - Send status update email
}

/**
 * Handle inventory updated notification
 */
async function handleInventoryUpdated(notification) {
  console.log("📦 Inventory Updated Notification:", {
    sku: notification.data?.sku || notification.payload?.sku,
    quantity: notification.data?.quantity || notification.payload?.quantity,
  });

  // TODO: Implement inventory sync logic
  // - Update inventory levels
  // - Sync with your inventory system
  // - Update product listings if needed
}
