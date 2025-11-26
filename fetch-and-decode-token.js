/**
 * Fetch token from Vercel and decode JWT to see what fields are available
 */

const https = require('https');

const instanceId = 'a4890371-c6da-46f4-a830-9e19df999cf8';
const url = `https://www.tnrbusinesssolutions.com/api/wix/test-token?instanceId=${instanceId}`;

console.log(`🔍 Fetching token from: ${url}\n`);

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (!result.success) {
        console.error('❌ API returned error:', result);
        return;
      }
      
      // Find the token in the logs
      const tokenLog = result.logs.find(log => log.includes('"accessTokenPreview"'));
      if (!tokenLog) {
        console.error('❌ Could not find token in response');
        return;
      }
      
      // Extract the full token from the log
      // It's in the format: accessTokenPreview": "OAUTH2.eyJ...
      const match = tokenLog.match(/"accessTokenPreview":\s*"([^"]+)"/);
      if (!match) {
        console.error('❌ Could not extract token from log');
        return;
      }
      
      const tokenPreview = match[1];
      console.log(`Found token preview: ${tokenPreview.substring(0, 50)}...`);
      console.log(`\n⚠️  Note: This is only a preview. Need full token to decode.`);
      console.log(`\nTo get the full token, look at the Vercel logs for the OAuth callback.`);
      console.log(`Search for "JWT decoded successfully" to see what fields Wix provides.`);
      
      // Try to decode what we have anyway
      const jwtToken = tokenPreview.startsWith("OAUTH2.") ? tokenPreview.substring(7) : tokenPreview;
      const parts = jwtToken.split(".");
      
      if (parts.length >= 2) {
        try {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
          console.log("\n📋 JWT Payload (from preview):");
          console.log(JSON.stringify(payload, null, 2));
          
          console.log("\n🔍 Key Fields:");
          console.log(`   metaSiteId: ${payload.metaSiteId || "NOT FOUND"}`);
          console.log(`   metasiteId: ${payload.metasiteId || "NOT FOUND"}`);
          console.log(`   siteId: ${payload.siteId || "NOT FOUND"}`);
          console.log(`   instanceId: ${payload.instanceId || "NOT FOUND"}`);
          console.log(`   aud: ${payload.aud || "NOT FOUND"}`);
          console.log("\n✅ All fields:", Object.keys(payload).join(", "));
        } catch (e) {
          console.log("\n❌ Could not decode payload from preview");
        }
      }
      
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('❌ Request error:', error.message);
});



