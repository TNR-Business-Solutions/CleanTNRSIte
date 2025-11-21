/**
 * Comprehensive Integration Testing Loop
 * Tests all OAuth flows, API endpoints, and features
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_RESULTS_FILE = 'test-results.json';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
const testResults = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function logTest(name, status, details = '') {
  const symbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`${symbol} ${name}`, color);
  if (details) {
    console.log(`   ${details}`);
  }
}

function recordTest(name, status, details = '', error = null) {
  testResults.tests.push({
    name,
    status,
    details,
    error: error ? error.message : null,
    timestamp: new Date().toISOString()
  });
  testResults.summary.total++;
  if (status === 'PASS') testResults.summary.passed++;
  else if (status === 'FAIL') testResults.summary.failed++;
  else testResults.summary.skipped++;
}

async function testEndpoint(name, method, url, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      validateStatus: () => true, // Don't throw on any status
      timeout: 10000
    };

    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }

    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      logTest(name, 'PASS', `Status: ${response.status}`);
      recordTest(name, 'PASS', `Status: ${response.status}`);
      return { success: true, response };
    } else {
      logTest(name, 'FAIL', `Expected ${expectedStatus}, got ${response.status}`);
      recordTest(name, 'FAIL', `Expected ${expectedStatus}, got ${response.status}`, 
        new Error(JSON.stringify(response.data)));
      return { success: false, response };
    }
  } catch (error) {
    logTest(name, 'FAIL', `Error: ${error.message}`);
    recordTest(name, 'FAIL', `Error: ${error.message}`, error);
    return { success: false, error };
  }
}

async function testServerHealth() {
  logSection('🏥 SERVER HEALTH CHECK');
  
  await testEndpoint(
    'Server is running',
    'GET',
    '/',
    null,
    200
  );

  await testEndpoint(
    'API root is accessible',
    'GET',
    '/api',
    null,
    200
  );
}

async function testWixIntegration() {
  logSection('🏢 WIX INTEGRATION TESTS');

  // Test 1: Wix Dashboard accessible
  await testEndpoint(
    'Wix Dashboard is accessible',
    'GET',
    '/wix-client-dashboard.html',
    null,
    200
  );

  // Test 2: Wix OAuth initiation
  const oauthResult = await testEndpoint(
    'Wix OAuth initiation',
    'GET',
    '/api/auth/wix',
    null,
    307 // Expect redirect
  );

  if (oauthResult.success) {
    log('   OAuth URL: ' + oauthResult.response.headers.location, 'blue');
  }

  // Test 3: Wix API client endpoint
  await testEndpoint(
    'Wix API endpoint is responding',
    'GET',
    '/api/wix?action=getClientDetails',
    null,
    404 // Expected if no client connected
  );

  // Test 4: Wix Webhooks endpoint
  await testEndpoint(
    'Wix Webhooks endpoint',
    'GET',
    '/api/wix/webhooks',
    null,
    403 // Expected without proper params
  );

  // Test 5: SEO Keywords extension
  await testEndpoint(
    'Wix SEO Keywords endpoint',
    'GET',
    '/api/wix/seo-keywords',
    null,
    405 // Expects POST
  );

  log('\n📝 Manual Test Required:', 'yellow');
  log('   1. Visit: ' + BASE_URL + '/api/auth/wix', 'yellow');
  log('   2. Connect site: http://www.shesallthatandmore.com/', 'yellow');
  log('   3. After connecting, test SEO audit and e-commerce', 'yellow');
}

async function testMetaIntegration() {
  logSection('📘 META (FACEBOOK) INTEGRATION TESTS');

  // Test 1: Meta OAuth initiation
  const oauthResult = await testEndpoint(
    'Meta OAuth initiation',
    'GET',
    '/api/auth/meta',
    null,
    307 // Expect redirect
  );

  if (oauthResult.success) {
    log('   OAuth URL: ' + oauthResult.response.headers.location, 'blue');
  }

  // Test 2: Check Facebook permissions endpoint
  await testEndpoint(
    'Facebook permission checker',
    'POST',
    '/api/social/check-facebook-permissions',
    { useDatabaseToken: true },
    400 // Expected if no token
  );

  // Test 3: Meta webhooks
  await testEndpoint(
    'Meta Webhooks endpoint',
    'GET',
    '/api/meta/webhooks',
    null,
    403 // Expected without verification
  );

  log('\n📝 Manual Test Required:', 'yellow');
  log('   1. Visit: ' + BASE_URL + '/api/auth/meta', 'yellow');
  log('   2. Connect TNR Business Solutions Facebook Page', 'yellow');
  log('   3. Grant permissions: pages_manage_posts, pages_read_engagement', 'yellow');
}

async function testInstagramIntegration() {
  logSection('📸 INSTAGRAM INTEGRATION TESTS');

  // Test 1: Instagram webhooks
  await testEndpoint(
    'Instagram Webhooks endpoint',
    'GET',
    '/api/instagram/webhooks',
    null,
    403 // Expected without verification
  );

  // Test 2: Post to Instagram endpoint exists
  await testEndpoint(
    'Instagram posting endpoint',
    'POST',
    '/api/social/post-to-instagram',
    { message: 'Test', useDatabaseToken: true },
    400 // Expected without token
  );

  log('\n📝 Manual Test Required:', 'yellow');
  log('   1. Accept Instagram Tester invitation', 'yellow');
  log('   2. Configure webhook at Meta Dashboard', 'yellow');
  log('   3. Connect Instagram Business account via Meta OAuth', 'yellow');
}

async function testWhatsAppIntegration() {
  logSection('💬 WHATSAPP INTEGRATION TESTS');

  // Test 1: WhatsApp webhooks
  await testEndpoint(
    'WhatsApp Webhooks endpoint',
    'GET',
    '/api/whatsapp/webhooks',
    null,
    403 // Expected without verification
  );

  log('\n📝 Configuration Required:', 'yellow');
  log('   1. Add WHATSAPP_ACCESS_TOKEN to Vercel', 'yellow');
  log('   2. Configure webhook in Meta Dashboard', 'yellow');
  log('   3. Test Phone: +1 555 145 9284', 'yellow');
}

async function testThreadsIntegration() {
  logSection('🧵 THREADS INTEGRATION TESTS');

  // Test 1: Threads OAuth
  const oauthResult = await testEndpoint(
    'Threads OAuth initiation',
    'GET',
    '/api/auth/threads',
    null,
    307 // Expect redirect
  );

  if (oauthResult.success) {
    log('   OAuth URL: ' + oauthResult.response.headers.location, 'blue');
  }

  // Test 2: Post to Threads
  await testEndpoint(
    'Threads posting endpoint',
    'POST',
    '/api/post/threads',
    { text: 'Test', useDatabaseToken: true },
    400 // Expected without token
  );

  log('\n📝 Manual Test Required:', 'yellow');
  log('   1. Visit: ' + BASE_URL + '/api/auth/threads', 'yellow');
  log('   2. Grant permissions for Threads', 'yellow');
}

async function testLinkedInIntegration() {
  logSection('💼 LINKEDIN INTEGRATION TESTS');

  // Test 1: LinkedIn OAuth
  const oauthResult = await testEndpoint(
    'LinkedIn OAuth initiation',
    'GET',
    '/api/auth/linkedin',
    null,
    307 // Expect redirect
  );

  if (oauthResult.success) {
    log('   OAuth URL: ' + oauthResult.response.headers.location, 'blue');
  }

  // Test 2: Post to LinkedIn
  await testEndpoint(
    'LinkedIn posting endpoint',
    'POST',
    '/api/social/post-to-linkedin',
    { message: 'Test', useDatabaseToken: true },
    400 // Expected without token
  );

  log('\n📝 Manual Test Required:', 'yellow');
  log('   1. Visit: ' + BASE_URL + '/api/auth/linkedin', 'yellow');
  log('   2. Connect LinkedIn account', 'yellow');
}

async function testTwitterIntegration() {
  logSection('🐦 TWITTER/X INTEGRATION TESTS');

  // Test 1: Twitter OAuth
  const oauthResult = await testEndpoint(
    'Twitter OAuth initiation',
    'GET',
    '/api/auth/twitter',
    null,
    307 // Expect redirect
  );

  if (oauthResult.success) {
    log('   OAuth URL: ' + oauthResult.response.headers.location, 'blue');
  }

  // Test 2: Post to Twitter
  await testEndpoint(
    'Twitter posting endpoint',
    'POST',
    '/api/social/post-to-twitter',
    { message: 'Test', useDatabaseToken: true },
    400 // Expected without token
  );

  log('\n📝 Manual Test Required:', 'yellow');
  log('   1. Visit: ' + BASE_URL + '/api/auth/twitter', 'yellow');
  log('   2. Connect Twitter account', 'yellow');
}

async function testDashboards() {
  logSection('📊 DASHBOARD TESTS');

  await testEndpoint(
    'Admin Dashboard V2',
    'GET',
    '/admin-dashboard-v2.html',
    null,
    200
  );

  await testEndpoint(
    'Social Media Automation Dashboard',
    'GET',
    '/social-media-automation-dashboard.html',
    null,
    200
  );

  await testEndpoint(
    'Wix Client Dashboard',
    'GET',
    '/wix-client-dashboard.html',
    null,
    200
  );
}

async function saveResults() {
  const resultsPath = path.join(__dirname, TEST_RESULTS_FILE);
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  log(`\n📄 Results saved to: ${resultsPath}`, 'blue');
}

async function displaySummary() {
  logSection('📊 TEST SUMMARY');

  log(`Total Tests: ${testResults.summary.total}`, 'blue');
  log(`✅ Passed: ${testResults.summary.passed}`, 'green');
  log(`❌ Failed: ${testResults.summary.failed}`, 'red');
  log(`⏭️  Skipped: ${testResults.summary.skipped}`, 'yellow');

  const successRate = Math.round(
    (testResults.summary.passed / testResults.summary.total) * 100
  );
  log(`\nSuccess Rate: ${successRate}%`, successRate > 80 ? 'green' : 'yellow');

  // List failures
  const failures = testResults.tests.filter(t => t.status === 'FAIL');
  if (failures.length > 0) {
    log('\n❌ Failed Tests:', 'red');
    failures.forEach(test => {
      log(`   - ${test.name}`, 'red');
      if (test.details) log(`     ${test.details}`, 'red');
    });
  }
}

async function runAllTests() {
  log('\n🚀 Starting Comprehensive Integration Tests', 'cyan');
  log(`📍 Base URL: ${BASE_URL}`, 'blue');
  log(`⏰ Started: ${new Date().toLocaleString()}\n`, 'blue');

  try {
    await testServerHealth();
    await testWixIntegration();
    await testMetaIntegration();
    await testInstagramIntegration();
    await testWhatsAppIntegration();
    await testThreadsIntegration();
    await testLinkedInIntegration();
    await testTwitterIntegration();
    await testDashboards();

    await displaySummary();
    await saveResults();

    logSection('🎯 NEXT STEPS');
    
    log('1. Complete OAuth flows manually:', 'yellow');
    log('   - Wix: Connect http://www.shesallthatandmore.com/', 'yellow');
    log('   - Facebook: Connect TNR Business Solutions Page', 'yellow');
    log('   - Instagram: Accept tester invite & connect', 'yellow');
    log('   - LinkedIn: Connect account', 'yellow');
    log('   - Twitter: Connect account', 'yellow');
    
    log('\n2. Test posting after OAuth:', 'yellow');
    log('   - Visit: ' + BASE_URL + '/social-media-automation-dashboard.html', 'yellow');
    log('   - Try posting to each platform', 'yellow');
    
    log('\n3. Test Wix features:', 'yellow');
    log('   - Visit: ' + BASE_URL + '/wix-client-dashboard.html', 'yellow');
    log('   - Run SEO audit', 'yellow');
    log('   - Test e-commerce sync', 'yellow');
    
    log('\n4. Re-run tests after manual steps:', 'yellow');
    log('   - Run: node test-all-integrations.js', 'yellow');

  } catch (error) {
    log(`\n❌ Critical Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

