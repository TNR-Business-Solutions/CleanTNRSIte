// Complete system test - Client viewing and email sending
require('dotenv').config();

const http = require('http');

console.log('🧪 COMPLETE SYSTEM TEST\n');
console.log('='.repeat(60));

// Test 1: Check if clients can be loaded
console.log('\n📋 Test 1: Load Clients from API');
http.get('http://localhost:3000/api/crm/clients', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.success) {
        console.log(`   ✅ Successfully loaded ${result.data.length} client(s)`);
        
        const tnr = result.data.find(c => c.name && c.name.includes('TNR Business Solutions'));
        if (tnr) {
          console.log('\n   ✅ TNR Business Solutions Client Details:');
          console.log(`   ID: ${tnr.id}`);
          console.log(`   Name: ${tnr.name}`);
          console.log(`   Email: ${tnr.email}`);
          console.log(`   Phone: ${tnr.phone}`);
          console.log(`   Company: ${tnr.company || 'N/A'}`);
          console.log(`   Status: ${tnr.status || 'Active'}`);
          
          // Parse services
          let services = [];
          try {
            if (typeof tnr.services === 'string') {
              if (tnr.services.trim().startsWith('[')) {
                services = JSON.parse(tnr.services);
              } else {
                services = tnr.services.split(',').map(s => s.trim());
              }
            } else if (Array.isArray(tnr.services)) {
              services = tnr.services;
            }
          } catch (e) {
            services = [];
          }
          
          console.log(`   Services: ${services.length} services`);
          services.forEach((s, i) => console.log(`     ${i + 1}. ${s}`));
          console.log(`   Notes: ${tnr.notes || 'None'}`);
          
          // Test 2: Email sending
          console.log('\n📋 Test 2: Email Configuration');
          console.log('   SMTP_USER:', process.env.SMTP_USER ? '✅ Configured' : '❌ Not configured');
          console.log('   SMTP_PASS:', process.env.SMTP_PASS ? '✅ Configured' : '❌ Not configured');
          console.log('   BUSINESS_EMAIL:', process.env.BUSINESS_EMAIL || 'Roy.Turner@TNRBusinessSolutions.com');
          
          // Test 3: Send welcome email
          console.log('\n📋 Test 3: Send Welcome Email');
          testWelcomeEmail(tnr);
        } else {
          console.log('   ⚠️ TNR Business Solutions not found in results');
          console.log('\n   Available clients:');
          result.data.forEach(c => {
            console.log(`   - ${c.name} (${c.id})`);
          });
        }
      } else {
        console.log('   ❌ API Error:', result.error);
      }
    } catch (e) {
      console.error('   ❌ Parse Error:', e.message);
      console.log('   Response:', data.substring(0, 200));
    }
  });
}).on('error', (err) => {
  console.error('   ❌ Connection Error:', err.message);
  console.log('   💡 Make sure server is running on port 3000');
  process.exit(1);
});

function testWelcomeEmail(clientData) {
  const EmailHandler = require('./email-handler');
  
  try {
    const emailHandler = new EmailHandler();
    console.log('   ✅ EmailHandler initialized');
    
    console.log('\n   📧 Sending welcome email...');
    console.log('   To:', clientData.email);
    console.log('   Notification to:', process.env.BUSINESS_EMAIL || 'Roy.Turner@TNRBusinessSolutions.com');
    
    emailHandler.sendWelcomeEmail(clientData)
      .then(result => {
        if (result.success) {
          console.log('   ✅ Welcome email sent successfully!');
          console.log('   ✅ Notification email sent successfully!');
          console.log('\n' + '='.repeat(60));
          console.log('📊 SYSTEM STATUS: ALL TESTS PASSED ✅');
          console.log('='.repeat(60));
          console.log('\n💡 Check your email inbox for:');
          console.log('   1. Welcome email to:', clientData.email);
          console.log('   2. Notification email to:', process.env.BUSINESS_EMAIL || 'Roy.Turner@TNRBusinessSolutions.com');
          console.log('\n✅ Client viewing and email system are working correctly!\n');
        } else {
          console.log('   ❌ Email failed:', result.error);
        }
        process.exit(0);
      })
      .catch(err => {
        console.error('   ❌ Email error:', err.message);
        process.exit(1);
      });
  } catch (error) {
    console.error('   ❌ EmailHandler error:', error.message);
    console.error('   Make sure SMTP credentials are set in .env file');
    process.exit(1);
  }
}

