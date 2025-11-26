/**
 * Quick script to decode a JWT token and inspect its contents
 */

// Sample token from diagnostic (first 100 chars): OAUTH2.eyJraWQiOiJWUTQwMVRlWiIsImFsZyI6IkhTMjU2In0...
// We need to decode the actual token to see what fields are in the payload

const token = process.argv[2];

if (!token) {
  console.log("Usage: node decode-jwt-test.js <token>");
  console.log("\nThis will decode the JWT and show what fields are available.");
  process.exit(1);
}

try {
  // Remove OAUTH2. prefix if present
  const jwtToken = token.startsWith("OAUTH2.") ? token.substring(7) : token;
  
  // JWT has 3 parts: header.payload.signature
  const parts = jwtToken.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid JWT format (got ${parts.length} parts, expected 3)`);
  }
  
  // Decode header
  const header = JSON.parse(Buffer.from(parts[0], "base64").toString("utf8"));
  console.log("\n📋 JWT Header:");
  console.log(JSON.stringify(header, null, 2));
  
  // Decode payload
  const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
  console.log("\n📋 JWT Payload:");
  console.log(JSON.stringify(payload, null, 2));
  
  console.log("\n🔍 Key Fields to Look For:");
  console.log(`   metaSiteId: ${payload.metaSiteId || "NOT FOUND"}`);
  console.log(`   metasiteId: ${payload.metasiteId || "NOT FOUND"}`);
  console.log(`   siteId: ${payload.siteId || "NOT FOUND"}`);
  console.log(`   instanceId: ${payload.instanceId || "NOT FOUND"}`);
  console.log(`   instance_id: ${payload.instance_id || "NOT FOUND"}`);
  console.log(`   accountId: ${payload.accountId || "NOT FOUND"}`);
  console.log(`   aud: ${payload.aud || "NOT FOUND"}`);
  
  console.log("\n✅ All fields in payload:");
  console.log(Object.keys(payload).join(", "));
  
} catch (error) {
  console.error("❌ Error decoding JWT:", error.message);
  process.exit(1);
}



