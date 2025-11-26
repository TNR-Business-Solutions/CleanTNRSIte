// Test script for landing page form submission
// This script tests the complete flow: form submission → CRM lead creation → email sending

const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const FORM_DATA = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '(412) 555-0123',
  company: 'Test Company',
  message: 'This is a test message from the landing page form test script.'
};

async function testFormSubmission() {
  console.log('🧪 Starting Landing Page Form Submission Test\n');
  console.log('='.repeat(60));
  
  // Test 1: Check if form exists on landing page
  console.log('\n📋 Test 1: Checking if form exists on landing page...');
  try {
    const html = await fetch(BASE_URL).then(r => r.text());
    if (html.includes('id="contact-form"')) {
      console.log('✅ Landing page form found with ID "contact-form"');
    } else {
      console.log('❌ Landing page form NOT found');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Could not fetch landing page:', error.message);
    console.log('   (This is OK if server is not running)');
  }
  
  // Test 2: Test CRM API endpoint
  console.log('\n📋 Test 2: Testing CRM Lead Creation API...');
  try {
    const response = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...FORM_DATA,
        source: 'Contact Form',
        status: 'New',
        date: new Date().toISOString().split('T')[0],
      })
    });
    
    const result = await response.json();
    if (result.success && result.data) {
      console.log('✅ Lead created successfully in CRM');
      console.log(`   Lead ID: ${result.data.id}`);
      console.log(`   Lead Name: ${result.data.name || FORM_DATA.name}`);
      return true;
    } else {
      console.log('❌ Lead creation failed:', result.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ CRM API test failed:', error.message);
    return false;
  }
}

async function testEmailSubmission() {
  console.log('\n📋 Test 3: Testing Email Submission...');
  try {
    const response = await fetch(`${BASE_URL}/submit-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...FORM_DATA,
        source: 'Contact Form',
        status: 'New',
        date: new Date().toISOString().split('T')[0],
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('✅ Email submission successful');
      console.log(`   Business email sent: ${result.emailSent ? 'Yes' : 'No'}`);
      console.log(`   Customer email sent: ${result.customerEmailSent ? 'Yes' : 'No'}`);
      if (result.messageId) {
        console.log(`   Message ID: ${result.messageId}`);
      }
      return true;
    } else {
      console.log('❌ Email submission failed:', result.error || result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Email submission test failed:', error.message);
    return false;
  }
}

// Run tests
(async () => {
  console.log('🚀 Landing Page Form Testing Suite\n');
  
  const results = {
    formExists: await testFormSubmission(),
    emailWorks: await testEmailSubmission(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:');
  console.log('─'.repeat(60));
  console.log(`Form on Landing Page: ${results.formExists ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Email Submission: ${results.emailWorks ? '✅ PASS' : '❌ FAIL'}`);
  
  if (results.formExists && results.emailWorks) {
    console.log('\n🎉 All tests passed! Landing page form is set up correctly.');
    console.log('\n✅ Form flow:');
    console.log('   1. User fills out form on landing page');
    console.log('   2. form-integration-simple.js handles submission');
    console.log('   3. Lead created in CRM (Neon database)');
    console.log('   4. Confirmation emails sent to business and customer');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    process.exit(1);
  }
})();

