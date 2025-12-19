/**
 * Check Wix Tokens in Database
 * Lists all stored Wix tokens to verify connections
 */

const TNRDatabase = require("./database");

async function main() {
  console.log("🔍 Checking Wix tokens in database...\n");

  try {
    const db = new TNRDatabase();
    await db.initialize();

    const tokens = await db.getAllWixTokens();

    console.log(`📊 Found ${tokens.length} Wix token(s) in database:\n`);

    if (tokens.length === 0) {
      console.log(
        "⚠️  No tokens found. You need to reconnect your Wix clients."
      );
      console.log("\nTo reconnect:");
      console.log("  1. Open the admin dashboard");
      console.log('  2. Click "Connect New Wix Client"');
      console.log("  3. Follow the OAuth flow");
    } else {
      tokens.forEach((token, index) => {
        console.log(`${index + 1}. Instance ID: ${token.instanceId}`);
        console.log(`   Has Access Token: ${!!token.accessToken}`);
        console.log(`   Has Refresh Token: ${!!token.refreshToken}`);
        console.log(
          `   Expires At: ${
            token.expiresAt ? new Date(token.expiresAt).toLocaleString() : "N/A"
          }`
        );
        console.log(
          `   Metadata: ${JSON.stringify(token.metadata || {}, null, 2)}`
        );
        console.log(
          `   Created: ${
            token.createdAt ? new Date(token.createdAt).toLocaleString() : "N/A"
          }`
        );
        console.log("");
      });
    }

    // Check for the specific devsite instance
    const devsiteInstanceId = "b1a11299-b3ef-4aaa-bb2d-636fea489608";
    const devsiteToken = tokens.find((t) => t.instanceId === devsiteInstanceId);

    if (devsiteToken) {
      console.log(`✅ Devsite token found for instance: ${devsiteInstanceId}`);
    } else {
      console.log(
        `❌ Devsite token NOT found for instance: ${devsiteInstanceId}`
      );
      console.log("   This instance needs to be reconnected.");
    }
  } catch (error) {
    console.error("❌ Error checking tokens:", error.message);
    console.error(error.stack);
  }
}

main().catch(console.error);
