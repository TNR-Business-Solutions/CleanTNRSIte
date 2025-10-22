// Check CRM data after form submission
const fs = require('fs');

console.log('Checking CRM data...');

// Check if there are any form submissions in localStorage (simulated)
// In a real browser, this would be in localStorage
console.log('Note: This script checks server-side data only.');
console.log('For client-side CRM data, check the browser console on the test page.');

// Check if the server is handling form submissions correctly
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Server Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Server is responding');
    console.log('To test CRM integration:');
    console.log('1. Open http://localhost:5000/test-form-crm-integration.html in your browser');
    console.log('2. Fill out and submit the test form');
    console.log('3. Check the debug information on the page');
    console.log('4. Check the browser console for any errors');
  });
});

req.on('error', (e) => {
  console.error(`❌ Server error: ${e.message}`);
});

req.end();
