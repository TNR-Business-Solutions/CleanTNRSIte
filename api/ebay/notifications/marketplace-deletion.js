/**
 * eBay Marketplace Deletion Notification Endpoint
 * Direct API route for eBay webhook verification and notifications
 * 
 * URL: /api/ebay/notifications/marketplace-deletion
 * Rewritten from: /ebay/notifications/marketplace-deletion
 */

const handler = require("../../../server/handlers/ebay-notifications-api");

module.exports = handler;
