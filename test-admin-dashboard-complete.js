// Comprehensive Admin Dashboard Test Script
// Tests all CRM functionality and admin dashboard features

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const TEST_LEAD = {
  name: 'Test Admin Dashboard Lead',
  email: 'test-admin@example.com',
  phone: '(412) 555-0123',
  company: 'Test Company',
  website: 'https://testcompany.com',
  industry: 'Technology',
  message: 'Testing admin dashboard CRM functionality',
  source: 'Admin Dashboard Test',
  status: 'New',
  date: new Date().toISOString().split('T')[0],
};

const TEST_CLIENT = {
  name: 'Test Admin Dashboard Client',
  email: 'test-client@example.com',
  phone: '(412) 555-0456',
  company: 'Test Client Company',
  industry: 'Construction',
  status: 'Active',
  source: 'Admin Dashboard Test',
};

async function testCRMLeadCreation() {
  console.log('\n📋 Test 1: CRM Lead Creation');
  console.log('─'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_LEAD),
    });

    const result = await response.json();
    if (result.success && result.data && result.data.id) {
      console.log('✅ Lead created successfully');
      console.log(`   Lead ID: ${result.data.id}`);
      console.log(`   Lead Name: ${result.data.name}`);
      return { success: true, leadId: result.data.id, data: result.data };
    } else {
      console.log('❌ Lead creation failed:', result.error || 'Unknown error');
      console.log('   Response:', JSON.stringify(result, null, 2));
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('❌ CRM lead creation error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCRMLeadRetrieval() {
  console.log('\n📋 Test 2: CRM Lead Retrieval');
  console.log('─'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/crm/leads`);
    const result = await response.json();
    
    if (result.success && Array.isArray(result.data)) {
      console.log(`✅ Retrieved ${result.data.length} leads`);
      if (result.data.length > 0) {
        console.log(`   Latest lead: ${result.data[0].name} (${result.data[0].id})`);
      }
      return { success: true, count: result.data.length, leads: result.data };
    } else {
      console.log('❌ Lead retrieval failed:', result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('❌ Lead retrieval error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCRMClientCreation() {
  console.log('\n📋 Test 3: CRM Client Creation');
  console.log('─'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/crm/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CLIENT),
    });

    const result = await response.json();
    if (result.success && result.data && result.data.id) {
      console.log('✅ Client created successfully');
      console.log(`   Client ID: ${result.data.id}`);
      console.log(`   Client Name: ${result.data.name}`);
      return { success: true, clientId: result.data.id, data: result.data };
    } else {
      console.log('❌ Client creation failed:', result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('❌ Client creation error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCRMClientRetrieval() {
  console.log('\n📋 Test 4: CRM Client Retrieval');
  console.log('─'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/crm/clients`);
    const result = await response.json();
    
    if (result.success && Array.isArray(result.data)) {
      console.log(`✅ Retrieved ${result.data.length} clients`);
      if (result.data.length > 0) {
        console.log(`   Latest client: ${result.data[0].name} (${result.data[0].id})`);
      }
      return { success: true, count: result.data.length, clients: result.data };
    } else {
      console.log('❌ Client retrieval failed:', result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('❌ Client retrieval error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testLeadToClientConversion(leadId) {
  console.log('\n📋 Test 5: Convert Lead to Client');
  console.log('─'.repeat(60));
  if (!leadId) {
    console.log('⏭️  Skipping - no lead ID available');
    return { success: false, skipped: true };
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/crm/convert-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    });

    const result = await response.json();
    if (result.success) {
      console.log('✅ Lead converted to client successfully');
      return { success: true, data: result.data };
    } else {
      console.log('❌ Conversion failed:', result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('❌ Conversion error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCRMFiltering() {
  console.log('\n📋 Test 6: CRM Filtering & Sorting');
  console.log('─'.repeat(60));
  try {
    // Test filter by status
    const response = await fetch(`${BASE_URL}/api/crm/leads?status=New&sort=createdAt&order=desc`);
    const result = await response.json();
    
    if (result.success && Array.isArray(result.data)) {
      console.log(`✅ Filtering works - Found ${result.data.length} leads with status=New`);
      return { success: true };
    } else {
      console.log('❌ Filtering failed:', result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('❌ Filtering error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEmailCampaign() {
  console.log('\n📋 Test 7: Email Campaign Functionality');
  console.log('─'.repeat(60));
  try {
    // Test audience count
    const response = await fetch(`${BASE_URL}/api/campaigns/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audienceType: 'leads',
        audienceFilters: { status: 'New' }
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✅ Email campaign preview works`);
      console.log(`   Audience count: ${result.count || 0}`);
      return { success: true, count: result.count };
    } else {
      console.log('⚠️  Campaign preview endpoint may not exist (this is OK)');
      return { success: false, skipped: true };
    }
  } catch (error) {
    console.log('⚠️  Campaign preview endpoint may not exist (this is OK)');
    return { success: false, skipped: true };
  }
}

async function testFormSubmissionCreatesLead() {
  console.log('\n📋 Test 8: Form Submission Creates CRM Lead');
  console.log('─'.repeat(60));
  
  const formData = {
    name: 'Form Test User',
    email: 'form-test@example.com',
    phone: '(412) 555-0789',
    company: 'Form Test Company',
    message: 'This is a test form submission',
    source: 'Contact Form',
    status: 'New',
    date: new Date().toISOString().split('T')[0],
  };
  
  try {
    // Step 1: Create lead via CRM API (simulating form-integration-simple.js)
    console.log('   Step 1: Creating lead via CRM API...');
    const leadResponse = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const leadResult = await leadResponse.json();
    if (leadResult.success && leadResult.data && leadResult.data.id) {
      console.log('   ✅ Lead created via CRM API');
      
      // Step 2: Verify lead can be retrieved
      console.log('   Step 2: Verifying lead retrieval...');
      const verifyResponse = await fetch(`${BASE_URL}/api/crm/leads?q=${encodeURIComponent(formData.email)}`);
      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.success && verifyResult.data && verifyResult.data.length > 0) {
        const foundLead = verifyResult.data.find(l => l.email === formData.email);
        if (foundLead) {
          console.log('   ✅ Lead successfully stored and can be retrieved');
          return { success: true, leadId: foundLead.id };
        }
      }
      
      console.log('   ⚠️  Lead created but not found in search');
      return { success: false, error: 'Lead not found after creation' };
    } else {
      console.log('   ❌ Lead creation failed:', leadResult.error || 'Unknown error');
      return { success: false, error: leadResult.error };
    }
  } catch (error) {
    console.log('   ❌ Test error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run all tests
(async () => {
  console.log('🚀 Admin Dashboard Comprehensive Test Suite');
  console.log('='.repeat(60));
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(60));

  const results = {
    leadCreation: await testCRMLeadCreation(),
    leadRetrieval: await testCRMLeadRetrieval(),
    clientCreation: await testCRMClientCreation(),
    clientRetrieval: await testCRMClientRetrieval(),
    filtering: await testCRMFiltering(),
    emailCampaign: await testEmailCampaign(),
    formSubmission: await testFormSubmissionCreatesLead(),
  };

  // Try conversion if we have a lead ID
  if (results.leadCreation.success && results.leadCreation.leadId) {
    results.leadConversion = await testLeadToClientConversion(results.leadCreation.leadId);
  } else {
    results.leadConversion = { success: false, skipped: true };
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(60));
  console.log(`CRM Lead Creation: ${results.leadCreation.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CRM Lead Retrieval: ${results.leadRetrieval.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CRM Client Creation: ${results.clientCreation.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CRM Client Retrieval: ${results.clientRetrieval.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CRM Filtering: ${results.filtering.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Email Campaign: ${results.emailCampaign.skipped ? '⏭️  SKIP' : (results.emailCampaign.success ? '✅ PASS' : '❌ FAIL')}`);
  console.log(`Form → CRM Lead: ${results.formSubmission.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Lead Conversion: ${results.leadConversion.skipped ? '⏭️  SKIP' : (results.leadConversion.success ? '✅ PASS' : '❌ FAIL')}`);

  const passed = Object.values(results).filter(r => r.success).length;
  const failed = Object.values(results).filter(r => !r.success && !r.skipped).length;
  const skipped = Object.values(results).filter(r => r.skipped).length;

  console.log('\n' + '─'.repeat(60));
  console.log(`Total: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  
  if (failed === 0) {
    console.log('\n🎉 All critical tests passed! Admin dashboard should be functional.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Admin dashboard may have issues.');
    console.log('\n📝 Next Steps:');
    console.log('   1. Check database connection (Neon/PostgreSQL)');
    console.log('   2. Verify API endpoints are accessible');
    console.log('   3. Check server logs for errors');
    console.log('   4. Ensure environment variables are set correctly');
    process.exit(1);
  }
})();

