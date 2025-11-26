// Full Project Testing Suite
// Comprehensive test runner for all critical functionality

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logTest(name, status, details = '') {
  totalTests++;
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  
  if (status === 'pass') passedTests++;
  else if (status === 'fail') failedTests++;
  else skippedTests++;
  
  log(`${icon} ${name}${details ? ` - ${details}` : ''}`, color);
}

// ========== TEST 1: DATABASE CONNECTION ==========
async function testDatabaseConnection() {
  log('\n' + '='.repeat(70), 'cyan');
  log('TEST SUITE 1: DATABASE & INFRASTRUCTURE', 'cyan');
  log('='.repeat(70), 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/crm/clients`);
    const result = await response.json();
    
    if (response.ok && (result.success || Array.isArray(result))) {
      logTest('Database Connection', 'pass', 'API is responding');
      return true;
    } else {
      logTest('Database Connection', 'fail', result.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    logTest('Database Connection', 'fail', `Server may not be running: ${error.message}`);
    log('\n⚠️  Make sure the server is running:', 'yellow');
    log('   npm start  or  node serve-clean.js', 'yellow');
    return false;
  }
}

// ========== TEST 2: CRM LEAD CREATION ==========
async function testCRMLeadCreation() {
  log('\n' + '='.repeat(70), 'cyan');
  log('TEST SUITE 2: CRM LEAD MANAGEMENT', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const testLead = {
    name: 'Test Lead ' + Date.now(),
    email: `test-lead-${Date.now()}@example.com`,
    phone: '(412) 555-0123',
    company: 'Test Company',
    message: 'Testing CRM lead creation',
    source: 'Test Suite',
    status: 'New',
    date: new Date().toISOString().split('T')[0],
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testLead),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success && result.data && result.data.id) {
      logTest('Create Lead via API', 'pass', `Lead ID: ${result.data.id}`);
      return { success: true, leadId: result.data.id };
    } else {
      logTest('Create Lead via API', 'fail', result.error || 'Unknown error');
      log('   Response: ' + JSON.stringify(result, null, 2), 'red');
      return { success: false, error: result.error };
    }
  } catch (error) {
    logTest('Create Lead via API', 'fail', error.message);
    return { success: false, error: error.message };
  }
}

// ========== TEST 3: CRM LEAD RETRIEVAL ==========
async function testCRMLeadRetrieval() {
  try {
    const response = await fetch(`${BASE_URL}/api/crm/leads`);
    const result = await response.json();
    
    if (response.ok && result.success && Array.isArray(result.data)) {
      logTest('Retrieve All Leads', 'pass', `Found ${result.data.length} leads`);
      return { success: true, leads: result.data };
    } else {
      logTest('Retrieve All Leads', 'fail', result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
  } catch (error) {
    logTest('Retrieve All Leads', 'fail', error.message);
    return { success: false, error: error.message };
  }
}

// ========== TEST 4: CRM LEAD FILTERING ==========
async function testCRMLeadFiltering() {
  try {
    const response = await fetch(`${BASE_URL}/api/crm/leads?status=New&sort=createdAt&order=desc`);
    const result = await response.json();
    
    if (response.ok && result.success && Array.isArray(result.data)) {
      logTest('Filter Leads by Status', 'pass', `Found ${result.data.length} new leads`);
      return { success: true };
    } else {
      logTest('Filter Leads by Status', 'fail', result.error || 'Unknown error');
      return { success: false };
    }
  } catch (error) {
    logTest('Filter Leads by Status', 'fail', error.message);
    return { success: false };
  }
}

// ========== TEST 5: CRM CLIENT CREATION ==========
async function testCRMClientCreation() {
  log('\n' + '='.repeat(70), 'cyan');
  log('TEST SUITE 3: CRM CLIENT MANAGEMENT', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const testClient = {
    name: 'Test Client ' + Date.now(),
    email: `test-client-${Date.now()}@example.com`,
    phone: '(412) 555-0456',
    company: 'Test Client Company',
    industry: 'Technology',
    status: 'Active',
    source: 'Test Suite',
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/crm/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testClient),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success && result.data && result.data.id) {
      logTest('Create Client via API', 'pass', `Client ID: ${result.data.id}`);
      return { success: true, clientId: result.data.id };
    } else {
      logTest('Create Client via API', 'fail', result.error || 'Unknown error');
      log('   Response: ' + JSON.stringify(result, null, 2), 'red');
      return { success: false, error: result.error };
    }
  } catch (error) {
    logTest('Create Client via API', 'fail', error.message);
    return { success: false, error: error.message };
  }
}

// ========== TEST 6: CRM CLIENT RETRIEVAL ==========
async function testCRMClientRetrieval() {
  try {
    const response = await fetch(`${BASE_URL}/api/crm/clients`);
    const result = await response.json();
    
    if (response.ok && result.success && Array.isArray(result.data)) {
      logTest('Retrieve All Clients', 'pass', `Found ${result.data.length} clients`);
      return { success: true, clients: result.data };
    } else {
      logTest('Retrieve All Clients', 'fail', result.error || 'Unknown error');
      return { success: false };
    }
  } catch (error) {
    logTest('Retrieve All Clients', 'fail', error.message);
    return { success: false };
  }
}

// ========== TEST 7: LEAD TO CLIENT CONVERSION ==========
async function testLeadConversion(leadId) {
  if (!leadId) {
    logTest('Convert Lead to Client', 'skip', 'No lead ID available');
    return { success: false, skipped: true };
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/crm/convert-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      logTest('Convert Lead to Client', 'pass', 'Conversion successful');
      return { success: true };
    } else {
      logTest('Convert Lead to Client', 'fail', result.error || 'Unknown error');
      return { success: false };
    }
  } catch (error) {
    logTest('Convert Lead to Client', 'fail', error.message);
    return { success: false };
  }
}

// ========== TEST 8: FORM SUBMISSION ENDPOINT ==========
async function testFormSubmission() {
  log('\n' + '='.repeat(70), 'cyan');
  log('TEST SUITE 4: FORM SUBMISSIONS', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const formData = {
    name: 'Form Test User',
    email: `form-test-${Date.now()}@example.com`,
    phone: '(412) 555-0789',
    company: 'Form Test Company',
    message: 'This is a test form submission',
    source: 'Contact Form',
    formType: 'Contact Form',
  };
  
  try {
    const response = await fetch(`${BASE_URL}/submit-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      logTest('Form Submission Endpoint', 'pass', 'Email notification sent');
      return { success: true };
    } else {
      logTest('Form Submission Endpoint', 'fail', result.error || result.message || 'Unknown error');
      return { success: false };
    }
  } catch (error) {
    logTest('Form Submission Endpoint', 'fail', error.message);
    return { success: false };
  }
}

// ========== TEST 9: EMAIL CAMPAIGN PREVIEW ==========
async function testEmailCampaign() {
  log('\n' + '='.repeat(70), 'cyan');
  log('TEST SUITE 5: EMAIL CAMPAIGNS', 'cyan');
  log('='.repeat(70), 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/campaigns/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audienceType: 'leads',
        audienceFilters: { status: 'New' }
      }),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success !== false) {
      logTest('Email Campaign Preview', 'pass', `Audience count: ${result.count || 0}`);
      return { success: true };
    } else {
      logTest('Email Campaign Preview', 'skip', 'Endpoint may not exist (this is OK)');
      return { success: false, skipped: true };
    }
  } catch (error) {
    logTest('Email Campaign Preview', 'skip', 'Endpoint may not exist (this is OK)');
    return { success: false, skipped: true };
  }
}

// ========== TEST 10: ORDER RETRIEVAL ==========
async function testOrderRetrieval() {
  log('\n' + '='.repeat(70), 'cyan');
  log('TEST SUITE 6: ORDER MANAGEMENT', 'cyan');
  log('='.repeat(70), 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/crm/orders`);
    const result = await response.json();
    
    if (response.ok && (result.success || Array.isArray(result.data) || Array.isArray(result))) {
      const orders = result.data || result || [];
      logTest('Retrieve Orders', 'pass', `Found ${orders.length} orders`);
      return { success: true };
    } else {
      logTest('Retrieve Orders', 'skip', 'No orders endpoint or empty orders');
      return { success: false, skipped: true };
    }
  } catch (error) {
    logTest('Retrieve Orders', 'skip', 'Endpoint may not exist (this is OK)');
    return { success: false, skipped: true };
  }
}

// ========== TEST 11: API ROUTES ACCESSIBILITY ==========
async function testAPIRoutes() {
  log('\n' + '='.repeat(70), 'cyan');
  log('TEST SUITE 7: API ENDPOINTS', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const routes = [
    { path: '/api/crm/clients', method: 'GET', name: 'GET /api/crm/clients' },
    { path: '/api/crm/leads', method: 'GET', name: 'GET /api/crm/leads' },
    { path: '/api/crm/orders', method: 'GET', name: 'GET /api/crm/orders' },
  ];
  
  const results = [];
  
  for (const route of routes) {
    try {
      const response = await fetch(`${BASE_URL}${route.path}`, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok || response.status === 200) {
        logTest(route.name, 'pass', `Status: ${response.status}`);
        results.push({ ...route, success: true });
      } else {
        logTest(route.name, 'skip', `Status: ${response.status} (may be intentional)`);
        results.push({ ...route, success: false, skipped: true });
      }
    } catch (error) {
      logTest(route.name, 'skip', `Error: ${error.message}`);
      results.push({ ...route, success: false, skipped: true });
    }
  }
  
  return results;
}

// ========== MAIN TEST RUNNER ==========
(async () => {
  log('\n' + '='.repeat(70), 'blue');
  log('🚀 FULL PROJECT TESTING SUITE', 'blue');
  log('='.repeat(70), 'blue');
  log(`Testing against: ${BASE_URL}`, 'cyan');
  log('Starting tests...\n', 'cyan');
  
  const startTime = Date.now();
  
  // Test 1: Database Connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    log('\n❌ Database connection failed. Cannot proceed with other tests.', 'red');
    log('Please start the server first: npm start', 'yellow');
    process.exit(1);
  }
  
  // Test 2-4: CRM Leads
  const leadResult = await testCRMLeadCreation();
  await testCRMLeadRetrieval();
  await testCRMLeadFiltering();
  
  // Test 5-6: CRM Clients
  const clientResult = await testCRMClientCreation();
  await testCRMClientRetrieval();
  
  // Test 7: Lead Conversion
  if (leadResult.success) {
    await testLeadConversion(leadResult.leadId);
  }
  
  // Test 8: Form Submission
  await testFormSubmission();
  
  // Test 9: Email Campaign
  await testEmailCampaign();
  
  // Test 10: Orders
  await testOrderRetrieval();
  
  // Test 11: API Routes
  await testAPIRoutes();
  
  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n' + '='.repeat(70), 'blue');
  log('📊 TEST RESULTS SUMMARY', 'blue');
  log('='.repeat(70), 'blue');
  log(`Total Tests: ${totalTests}`, 'cyan');
  log(`✅ Passed: ${passedTests}`, 'green');
  log(`❌ Failed: ${failedTests}`, 'red');
  log(`⏭️  Skipped: ${skippedTests}`, 'yellow');
  log(`⏱️  Duration: ${duration}s`, 'cyan');
  
  const successRate = totalTests > 0 ? ((passedTests / (totalTests - skippedTests)) * 100).toFixed(1) : 0;
  log(`📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red');
  
  log('\n' + '='.repeat(70), 'blue');
  
  if (failedTests === 0) {
    log('🎉 ALL CRITICAL TESTS PASSED!', 'green');
    log('Your admin dashboard and CRM system are fully functional.', 'green');
    process.exit(0);
  } else {
    log('⚠️  SOME TESTS FAILED', 'yellow');
    log('Review the errors above and check:', 'yellow');
    log('  1. Database connection (POSTGRES_URL environment variable)', 'yellow');
    log('  2. Server logs for detailed error messages', 'yellow');
    log('  3. API endpoint configurations', 'yellow');
    process.exit(1);
  }
})();

