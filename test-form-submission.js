// Test form submission to CRM integration
const http = require('http');

// Test data
const testSubmission = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '555-123-4567',
  company: 'Test Company',
  message: 'This is a test form submission',
  services: ['Web Design'],
  source: 'Test Script',
  date: new Date().toISOString().split('T')[0],
  status: 'New'
};

// Test form submission endpoint
const postData = JSON.stringify(testSubmission);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/submit-form',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing form submission to CRM...');
console.log('Test data:', testSubmission);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Form submission successful');
    } else {
      console.log('❌ Form submission failed');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.write(postData);
req.end();
