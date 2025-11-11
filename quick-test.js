// Quick server and API test
const http = require('http');

console.log('🧪 Testing Server and CRM API...\n');

// Test 1: Check if server is running
http.get('http://localhost:3000/api/crm/clients', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Server is running!');
      console.log(`✅ HTTP Status: ${res.statusCode}`);
      if (result.success) {
        console.log(`✅ API is working!`);
        console.log(`📊 Clients found: ${result.data.length}`);
        if (result.data.length > 0) {
          console.log('\n📋 Clients:');
          result.data.forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.name} (${c.email || 'No email'})`);
          });
        }
        console.log('\n✅ All tests passed!');
        console.log('💡 Refresh your browser and check the admin dashboard.');
      } else {
        console.log(`❌ API Error: ${result.error}`);
      }
    } catch (e) {
      console.log('❌ Parse Error:', e.message);
      console.log('Response:', data.substring(0, 200));
    }
    process.exit(0);
  });
}).on('error', (e) => {
  console.error('❌ Server is not running!');
  console.error('   Error:', e.message);
  console.log('\n💡 Start the server with: node serve-clean.js');
  process.exit(1);
});

