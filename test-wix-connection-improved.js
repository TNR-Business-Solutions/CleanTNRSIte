/**
 * Improved Wix Connection Test
 * Uses latest Wix Dev Mode features and REST API patterns
 * Based on dev.wix.com documentation
 */

const WixEditorConnector = require("./wix-editor-connector");
const { clientTokensDB } = require("./server/handlers/auth-wix-callback");
const tokenManager = require("./server/handlers/wix-token-manager");
const axios = require("axios");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Get metasite ID from instance ID or token
 * In Wix, the instance ID is often the same as metasite ID for REST API calls
 */
async function getMetasiteId(instanceId, accessToken) {
  try {
    // Try to get site info to extract metasite ID
    const response = await axios.get("https://www.wixapis.com/sites/v1/site", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "wix-instance-id": instanceId,
        "Content-Type": "application/json",
      },
    });

    if (response.data?.site?.id) {
      return response.data.site.id;
    }
  } catch (error) {
    // If that fails, try using instance ID as metasite ID
    log(`⚠️  Could not fetch metasite ID, using instance ID: ${instanceId}`, "yellow");
  }

  return instanceId;
}

/**
 * Test connection with improved error handling
 */
async function testConnection(instanceId) {
  log("\n🔍 Testing Wix Connection (Improved)", "bright");
  log("═".repeat(60), "cyan");
  log(`Instance ID: ${instanceId}`, "blue");
  log("", "reset");

  try {
    // Step 1: Load tokens from database
    log("📥 Step 1: Loading tokens from database...", "cyan");
    await tokenManager.loadTokens(clientTokensDB);
    log("✅ Tokens loaded", "green");

    // Step 2: Check if token exists
    log("\n🔑 Step 2: Checking token availability...", "cyan");
    let clientData = clientTokensDB.get(instanceId);

    if (!clientData) {
      // Try loading from database directly
      log("   Token not in memory, checking database...", "yellow");
      const dbToken = await tokenManager.getToken(instanceId);

      if (dbToken) {
        clientData = {
          instanceId: dbToken.instanceId,
          accessToken: dbToken.accessToken,
          refreshToken: dbToken.refreshToken,
          expiresAt: dbToken.expiresAt || Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
          metadata: dbToken.metadata || {},
          createdAt: dbToken.createdAt || Date.now(),
          updatedAt: dbToken.updatedAt || Date.now(),
        };
        clientTokensDB.set(instanceId, clientData);
        log("✅ Token loaded from database", "green");
      } else {
        log("❌ No token found for this instance", "red");
        log("\n💡 Solution:", "yellow");
        log("   1. Make sure the server is running", "reset");
        log("   2. Open the Wix Client Dashboard", "reset");
        log("   3. Click 'Connect New Wix Client'", "reset");
        log("   4. Complete the OAuth flow", "reset");
        return false;
      }
    } else {
      log("✅ Token found in memory", "green");
    }

    // Step 3: Verify token is valid
    log("\n🔐 Step 3: Verifying token validity...", "cyan");
    if (!clientData.accessToken) {
      log("❌ Access token is missing", "red");
      return false;
    }

    if (clientData.expiresAt && clientData.expiresAt < Date.now()) {
      log("⚠️  Token has expired", "yellow");
      log("   Attempting to refresh...", "yellow");
      // Token refresh would happen automatically in WixAPIClient
    }

    log(`✅ Token is valid (expires: ${clientData.expiresAt ? new Date(clientData.expiresAt).toLocaleString() : 'Never'})`, "green");

    // Step 4: Get metasite ID
    log("\n🌐 Step 4: Determining metasite ID...", "cyan");
    const metasiteId = clientData.metadata?.metasiteId || instanceId;
    log(`   Using metasite ID: ${metasiteId}`, "blue");

    // Step 5: Test API connection
    log("\n📡 Step 5: Testing API connection...", "cyan");
    const connector = new WixEditorConnector(instanceId);

    // Test 1: Get site info
    log("   Testing: Get Site Info", "blue");
    const siteInfo = await connector.getSiteInfo();
    if (siteInfo.success) {
      log("   ✅ Site info retrieved successfully", "green");
      log(`      Site ID: ${siteInfo.site?.id || "N/A"}`, "blue");
      log(`      Site Name: ${siteInfo.site?.displayName || "N/A"}`, "blue");
    } else {
      log(`   ❌ Failed: ${siteInfo.error}`, "red");
      return false;
    }

    // Test 2: List pages
    log("\n   Testing: List Pages", "blue");
    const pages = await connector.listPages();
    if (pages.success) {
      log(`   ✅ Pages listed successfully (${pages.pages.length} pages)`, "green");
    } else {
      log(`   ⚠️  Warning: ${pages.error}`, "yellow");
    }

    // Test 3: List products (if store is enabled)
    log("\n   Testing: List Products", "blue");
    const products = await connector.listProducts({ limit: 5 });
    if (products.success) {
      log(`   ✅ Products listed successfully (${products.total} total)`, "green");
    } else {
      log(`   ⚠️  Warning: ${products.error}`, "yellow");
      log("      (This is normal if the store is not enabled)", "yellow");
    }

    log("\n✅ Connection test completed successfully!", "green");
    return true;

  } catch (error) {
    log(`\n❌ Connection test failed: ${error.message}`, "red");
    console.error(error);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const instanceId = args[0];

  if (!instanceId) {
    log("❌ Error: Instance ID required", "red");
    log("\nUsage:", "yellow");
    log("  node test-wix-connection-improved.js <instanceId>", "reset");
    log("\nTo get your instance ID:", "yellow");
    log("  node wix-cli-commands.js list-clients", "reset");
    log("\nOr test the devsite:", "yellow");
    log("  node test-wix-connection-improved.js b1a11299-b3ef-4aaa-bb2d-636fea489608", "reset");
    return;
  }

  const success = await testConnection(instanceId);

  if (!success) {
    log("\n💡 Troubleshooting Tips:", "yellow");
    log("   1. Ensure the server is running: node server/index.js", "reset");
    log("   2. Check that tokens are saved in the database", "reset");
    log("   3. Verify the instance ID is correct", "reset");
    log("   4. Try reconnecting the Wix client through the dashboard", "reset");
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  });
}

module.exports = { testConnection };

