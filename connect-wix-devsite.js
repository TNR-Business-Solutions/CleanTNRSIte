/**
 * Connect Wix Devsite Script
 * Helps connect and verify the devsite connection
 * Uses latest Wix Dev Mode features
 */

const { clientTokensDB } = require("./server/handlers/auth-wix-callback");
const tokenManager = require("./server/handlers/wix-token-manager");
const WixEditorConnector = require("./wix-editor-connector");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log("\n🔗 Wix Devsite Connection Helper", "bright");
  log("═".repeat(60), "cyan");
  log("", "reset");

  // Step 1: Check database
  log("📊 Step 1: Checking database for tokens...", "cyan");
  try {
    await tokenManager.loadTokens(clientTokensDB);
    const tokenCount = clientTokensDB.size;
    log(`   Found ${tokenCount} token(s) in database`, tokenCount > 0 ? "green" : "yellow");
    
    if (tokenCount === 0) {
      log("\n⚠️  No tokens found in database!", "yellow");
      log("\n💡 To connect the devsite:", "yellow");
      log("   1. Start the server: node server/index.js", "reset");
      log("   2. Open: http://localhost:3000/wix-client-dashboard.html", "reset");
      log("   3. Click 'Connect New Wix Client'", "reset");
      log("   4. Complete the OAuth flow", "reset");
      log("   5. The token will be saved automatically", "reset");
      return;
    }

    // List all tokens
    log("\n📋 Connected Wix Clients:", "cyan");
    let index = 1;
    for (const [instanceId, data] of clientTokensDB.entries()) {
      const isDevsite = instanceId === "b1a11299-b3ef-4aaa-bb2d-636fea489608";
      const status = data.expiresAt > Date.now() ? "✅ Active" : "❌ Expired";
      log(`   ${index}. ${isDevsite ? "🎯 DEVSITE" : "Client"}: ${instanceId.substring(0, 8)}...`, isDevsite ? "bright" : "reset");
      log(`      Status: ${status}`, isDevsite ? "green" : "reset");
      log(`      Metasite ID: ${data.metadata?.metasiteId || "N/A"}`, "blue");
      index++;
    }

  } catch (error) {
    log(`❌ Error checking database: ${error.message}`, "red");
    return;
  }

  // Step 2: Test devsite connection
  const devsiteInstanceId = "b1a11299-b3ef-4aaa-bb2d-636fea489608";
  log(`\n🧪 Step 2: Testing devsite connection (${devsiteInstanceId.substring(0, 8)}...)`, "cyan");
  
  const devsiteToken = clientTokensDB.get(devsiteInstanceId);
  if (!devsiteToken) {
    log("   ❌ Devsite token not found", "red");
    log("\n💡 Solution:", "yellow");
    log("   Reconnect the devsite through the dashboard", "reset");
    return;
  }

  log("   ✅ Devsite token found", "green");

  // Step 3: Test API connection
  log("\n📡 Step 3: Testing API connection...", "cyan");
  try {
    const connector = new WixEditorConnector(devsiteInstanceId);
    const siteInfo = await connector.getSiteInfo();
    
    if (siteInfo.success) {
      log("   ✅ API connection successful!", "green");
      log(`      Site Name: ${siteInfo.site?.displayName || "N/A"}`, "blue");
      log(`      Site ID: ${siteInfo.site?.id || "N/A"}`, "blue");
      log("\n🎉 Devsite is connected and working!", "green");
    } else {
      log(`   ❌ API connection failed: ${siteInfo.error}`, "red");
      log("\n💡 Troubleshooting:", "yellow");
      log("   1. Check that the token is valid", "reset");
      log("   2. Verify the instance ID is correct", "reset");
      log("   3. Try reconnecting through the dashboard", "reset");
    }
  } catch (error) {
    log(`   ❌ Error testing connection: ${error.message}`, "red");
    log("\n💡 Troubleshooting:", "yellow");
    log("   1. Make sure the server is running", "reset");
    log("   2. Check network connectivity", "reset");
    log("   3. Verify Wix API credentials", "reset");
  }
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});

