// Test email configuration and sending
require('dotenv').config();

console.log('🔍 Email Configuration Test\n');
console.log('='.repeat(60));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set (hidden)' : '❌ NOT SET');
console.log('SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com (default)');
console.log('SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');
console.log('BUSINESS_EMAIL:', process.env.BUSINESS_EMAIL || 'Roy.Turner@TNRBusinessSolutions.com (default)');

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.log('\n❌ ERROR: SMTP credentials not configured!');
  console.log('\n💡 To fix this:');
  console.log('1. Create a .env file in the project root if it doesn\'t exist');
  console.log('2. Add the following variables:');
  console.log('   SMTP_USER=your-email@gmail.com');
  console.log('   SMTP_PASS=your-app-password');
  console.log('   BUSINESS_EMAIL=Roy.Turner@TNRBusinessSolutions.com');
  console.log('\n3. For Gmail, you need to:');
  console.log('   - Enable 2-Factor Authentication');
  console.log('   - Generate an App Password');
  console.log('   - Use that App Password in SMTP_PASS');
  process.exit(1);
}

// Try to initialize EmailHandler
console.log('\n📋 Testing Email Handler Initialization...');
try {
  const EmailHandler = require('./email-handler');
  const emailHandler = new EmailHandler();
  console.log('✅ EmailHandler initialized successfully');
  
  // Test sending a welcome email
  console.log('\n📋 Testing Welcome Email Send...');
  const testClient = {
    id: 'test-client-123',
    name: 'Test Client',
    email: process.env.BUSINESS_EMAIL || 'Roy.Turner@TNRBusinessSolutions.com',
    company: 'Test Company',
    services: ['Web Design', 'SEO Services'],
    status: 'Active'
  };
  
  emailHandler.sendWelcomeEmail(testClient)
    .then(result => {
      if (result.success) {
        console.log('✅ Welcome email sent successfully!');
        console.log('   Message:', result.message);
        console.log('\n💡 Check your email inbox for the test email');
      } else {
        console.log('❌ Failed to send welcome email');
        console.log('   Error:', result.error);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error sending email:', error.message);
      console.error('   Stack:', error.stack);
      process.exit(1);
    });
  
} catch (error) {
  console.error('❌ Error initializing EmailHandler:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

