// Comprehensive CRM API Test
const http = require('http');

console.log('🧪 COMPREHENSIVE CRM API TEST\n');
console.log('='.repeat(60));

const tests = [
  {
    name: 'Get All Clients',
    path: '/api/crm/clients',
    method: 'GET'
  },
  {
    name: 'Get CRM Stats',
    path: '/api/crm/stats',
    method: 'GET'
  },
  {
    name: 'Get All Leads',
    path: '/api/crm/leads',
    method: 'GET'
  }
];

let completedTests = 0;

tests.forEach((test, index) => {
  setTimeout(() => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: test.path,
      method: test.method
    };

    console.log(`\n📋 Test ${index + 1}: ${test.name}`);
    console.log(`   URL: http://localhost:3000${test.path}`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200 && result.success) {
            console.log(`   ✅ SUCCESS (Status: ${res.statusCode})`);
            if (test.path.includes('clients')) {
              console.log(`   📊 Clients: ${result.data.length}`);
              if (result.data.length > 0) {
                result.data.forEach((c, i) => {
                  console.log(`      ${i + 1}. ${c.name}`);
                });
              }
            } else if (test.path.includes('stats')) {
              console.log(`   📊 Total Clients: ${result.data.totalClients}`);
              console.log(`   📊 Active Clients: ${result.data.activeClients}`);
            } else if (test.path.includes('leads')) {
              console.log(`   📊 Leads: ${result.data.length}`);
            }
          } else {
            console.log(`   ❌ FAILED (Status: ${res.statusCode})`);
            console.log(`   Error: ${result.error || 'Unknown error'}`);
          }
        } catch (e) {
          console.log(`   ❌ PARSE ERROR: ${e.message}`);
          console.log(`   Response: ${data.substring(0, 200)}`);
        }
        completedTests++;
        if (completedTests === tests.length) {
          console.log('\n' + '='.repeat(60));
          console.log('✅ All tests completed!');
          console.log('\n💡 If all tests passed, refresh your browser and check the admin dashboard.');
          process.exit(0);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`   ❌ CONNECTION ERROR: ${e.message}`);
      console.log('   💡 Make sure the server is running on port 3000');
      completedTests++;
      if (completedTests === tests.length) {
        process.exit(1);
      }
    });

    req.end();
  }, index * 500);
});

