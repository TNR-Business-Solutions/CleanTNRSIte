// Test email sending with the actual client data
require('dotenv').config();

const EmailHandler = require('./email-handler');

async function test() {
  console.log('🧪 Testing Welcome Email Send with TNR Client Data\n');
  
  const clientData = {
    id: 'client-test-123',
    name: 'TNR Business Solutions',
    email: 'Roy.Turner@TNRBusinessSolutions.com',
    phone: '412-499-2987',
    company: 'TNR Business Solutions',
    services: [
      "Web Design & Development",
      "SEO Services",
      "Social Media Management",
      "Content Creation",
      "Paid Advertising",
      "Email Marketing",
      "Google My Business (GMB) Optimization",
      "Business Listings",
      "Insurance Services",
      "Digital Marketing Consulting"
    ],
    status: 'Active',
    notes: 'Personal Testing'
  };
  
  try {
    const emailHandler = new EmailHandler();
    console.log('✅ EmailHandler initialized');
    console.log('\n📧 Sending welcome email to:', clientData.email);
    console.log('📧 Sending notification to: Roy.Turner@TNRBusinessSolutions.com');
    
    const result = await emailHandler.sendWelcomeEmail(clientData);
    
    if (result.success) {
      console.log('\n✅ SUCCESS!');
      console.log('   Message:', result.message);
      console.log('\n💡 Check your email inbox for:');
      console.log('   1. Welcome email to:', clientData.email);
      console.log('   2. Notification email to: Roy.Turner@TNRBusinessSolutions.com');
    } else {
      console.log('\n❌ FAILED');
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('   Stack:', error.stack);
  }
  
  process.exit(0);
}

test();

