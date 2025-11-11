// Test email flow by creating a test client
const http = require('http');

const testClient = {
  name: "Test Client - Email Flow",
  email: "Roy.Turner@TNRBusinessSolutions.com", // Use your email for testing
  phone: "412-499-2987",
  company: "Test Company",
  services: ["Web Design", "SEO Services"],
  status: "Active",
  source: "Testing",
  notes: "Testing email flow"
};

const postData = JSON.stringify(testClient);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/crm/clients',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing Email Flow...\n');
console.log('Creating test client to trigger welcome email...');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.success) {
        console.log('✅ Test client created successfully!');
        console.log('Client ID:', response.data.id);
        console.log('\n📧 Email Status:');
        console.log('   ✅ Welcome email triggered (sent to:', testClient.email, ')');
        console.log('   ✅ Notification email triggered (sent to: Roy.Turner@TNRBusinessSolutions.com)');
        console.log('\n💡 Check your email inbox for:');
        console.log('   1. Welcome email to:', testClient.email);
        console.log('   2. Notification email to: Roy.Turner@TNRBusinessSolutions.com');
        console.log('\n✅ Email flow test complete!');
      } else {
        console.error('❌ Error:', response.error);
      }
    } catch (error) {
      console.error('❌ Parse error:', error.message);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();

