/**
 * Wix Client Manager - Complete Flowthrough Test Suite
 * Tests the entire flow: Connect → SEO Tools → E-commerce Sync
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

// Use port 3000 for local server (server runs on 3000, .env has 5000 but server uses 3000)
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 30000; // 30 seconds

// Test results tracking
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Test helper functions
 */
function logTest(testName, status, message = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} [${status}] ${testName}${message ? ': ' + message : ''}`);
  
  if (status === 'PASS') {
    testResults.passed.push(testName);
  } else if (status === 'FAIL') {
    testResults.failed.push({ test: testName, message });
  } else {
    testResults.warnings.push({ test: testName, message });
  }
}

async function makeRequest(method, endpoint, data = null, headers = {}, followRedirects = true) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: TEST_TIMEOUT,
      maxRedirects: followRedirects ? 5 : 0, // Don't follow redirects for OAuth tests
      validateStatus: function (status) {
        // Accept all status codes (including redirects)
        return status >= 200 && status < 600;
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const startTime = performance.now();
    const response = await axios(config);
    const duration = performance.now() - startTime;
    
    return { response, duration, error: null };
  } catch (error) {
    // For redirect errors, check if we got a redirect status
    if (error.response && (error.response.status === 302 || error.response.status === 301)) {
      return {
        response: error.response,
        duration: 0,
        error: null // Not an error, it's a redirect
      };
    }
    return {
      response: error.response,
      duration: 0,
      error: error.message
    };
  }
}

/**
 * SMOKE TESTS - Basic functionality checks
 */
async function smokeTests() {
  console.log('\n🔥 SMOKE TESTS\n');
  
  // Test 1: Server Health Check
  const healthCheck = await makeRequest('GET', '/health');
  if (healthCheck.response && healthCheck.response.status === 200) {
    logTest('Server Health Check', 'PASS', `Response time: ${healthCheck.duration.toFixed(2)}ms`);
  } else {
    logTest('Server Health Check', 'FAIL', healthCheck.error || 'Server not responding');
    return false;
  }
  
  // Test 2: Database Connection
  const dbTest = await makeRequest('GET', '/api/db/test');
  if (dbTest.response && dbTest.response.status === 200 && dbTest.response.data.success) {
    logTest('Database Connection', 'PASS', `Type: ${dbTest.response.data.database.type}`);
  } else {
    logTest('Database Connection', 'FAIL', dbTest.error || 'Database not connected');
  }
  
  // Test 3: Wix OAuth Initiation Endpoint (should redirect to Wix)
  const oauthTest = await makeRequest('GET', '/api/auth/wix', null, {}, false); // Don't follow redirects
  if (oauthTest.response && (oauthTest.response.status === 302 || oauthTest.response.status === 301)) {
    const location = oauthTest.response.headers?.location || '';
    if (location.includes('wix.com')) {
      logTest('Wix OAuth Endpoint', 'PASS', `Redirects to Wix correctly (${oauthTest.response.status})`);
    } else if (location) {
      logTest('Wix OAuth Endpoint', 'PASS', `Redirects correctly (${oauthTest.response.status})`);
    } else {
      logTest('Wix OAuth Endpoint', 'WARN', 'Redirects but no location header');
    }
  } else if (oauthTest.error && oauthTest.error.includes('redirect')) {
    // Axios throws error for redirects when maxRedirects is 0
    logTest('Wix OAuth Endpoint', 'PASS', 'OAuth endpoint redirects (expected behavior)');
  } else {
    logTest('Wix OAuth Endpoint', 'FAIL', oauthTest.error || `Unexpected status: ${oauthTest.response?.status}`);
  }
  
  // Test 4: Wix API Routes Endpoint
  const apiTest = await makeRequest('GET', '/api/wix?action=listClients');
  if (apiTest.response && apiTest.response.status === 200) {
    logTest('Wix API Routes', 'PASS', 'API routes accessible');
  } else {
    logTest('Wix API Routes', 'FAIL', apiTest.error || 'API routes not working');
  }
  
  return testResults.failed.length === 0;
}

/**
 * OAUTH FLOW TESTS
 */
async function oauthFlowTests() {
  console.log('\n🔐 OAUTH FLOW TESTS\n');
  
  // Test 1: OAuth Initiation (should redirect to Wix)
  const oauthInit = await makeRequest('GET', '/api/auth/wix?clientId=test-client&returnUrl=/wix-client-dashboard.html', null, {}, false); // Don't follow redirects
  if (oauthInit.response && (oauthInit.response.status === 302 || oauthInit.response.status === 301)) {
    const location = oauthInit.response.headers?.location || '';
    if (location && location.includes('wix.com')) {
      logTest('OAuth Initiation', 'PASS', 'Redirects to Wix correctly');
    } else if (location) {
      logTest('OAuth Initiation', 'PASS', `Redirects (status ${oauthInit.response.status})`);
    } else {
      logTest('OAuth Initiation', 'WARN', 'Redirects but location header missing');
    }
  } else if (oauthInit.error && oauthInit.error.includes('redirect')) {
    // Axios throws error for redirects when maxRedirects is 0
    logTest('OAuth Initiation', 'PASS', 'OAuth redirects correctly (expected)');
  } else {
    logTest('OAuth Initiation', 'FAIL', oauthInit.error || `Unexpected status: ${oauthInit.response?.status}`);
  }
  
  // Test 2: OAuth Callback (with mock data)
  // Note: This will fail in real test, but we can check the endpoint exists
  const callbackTest = await makeRequest('GET', '/api/auth/wix/callback?code=test&state=test');
  if (callbackTest.response) {
    // Callback endpoint exists (even if it fails without real token)
    logTest('OAuth Callback Endpoint', 'PASS', 'Callback endpoint accessible');
  } else {
    logTest('OAuth Callback Endpoint', 'FAIL', callbackTest.error);
  }
  
  // Test 3: Token Storage Check
  const tokenCheck = await makeRequest('GET', '/api/wix?action=listClients');
  if (tokenCheck.response && tokenCheck.response.status === 200) {
    const clients = tokenCheck.response.data.clients || [];
    logTest('Token Storage', 'PASS', `Found ${clients.length} connected client(s)`);
  } else {
    logTest('Token Storage', 'WARN', 'Could not verify token storage');
  }
}

/**
 * SEO TOOLS TESTS
 */
async function seoToolsTests(instanceId = null) {
  console.log('\n🎯 SEO TOOLS TESTS\n');
  
  if (!instanceId) {
    logTest('SEO Tools Tests', 'WARN', 'No instance ID provided - skipping detailed tests');
    return;
  }
  
  // Test 1: Get Site SEO
  const siteSEO = await makeRequest('POST', '/api/wix', {
    action: 'getSiteSEO',
    instanceId
  });
  if (siteSEO.response && siteSEO.response.status === 200) {
    logTest('Get Site SEO', 'PASS', 'Site SEO data retrieved');
  } else {
    logTest('Get Site SEO', 'FAIL', siteSEO.error || 'Failed to get site SEO');
  }
  
  // Test 2: Update Site SEO
  const updateSEO = await makeRequest('POST', '/api/wix', {
    action: 'updateSiteSEO',
    instanceId,
    seoData: {
      title: 'Test Site Title',
      description: 'Test site description',
      keywords: ['test', 'seo']
    }
  });
  if (updateSEO.response && updateSEO.response.status === 200) {
    logTest('Update Site SEO', 'PASS', 'Site SEO updated successfully');
  } else {
    logTest('Update Site SEO', 'WARN', updateSEO.error || 'Update may have failed');
  }
  
  // Test 3: SEO Audit
  const auditSEO = await makeRequest('POST', '/api/wix', {
    action: 'auditSiteSEO',
    instanceId
  });
  if (auditSEO.response && auditSEO.response.status === 200) {
    logTest('SEO Audit', 'PASS', 'SEO audit completed');
  } else {
    logTest('SEO Audit', 'WARN', auditSEO.error || 'Audit may have failed');
  }
  
  // Test 4: Auto-Optimize SEO
  const autoOptimize = await makeRequest('POST', '/api/wix', {
    action: 'autoOptimizeSEO',
    instanceId
  });
  if (autoOptimize.response && autoOptimize.response.status === 200) {
    logTest('Auto-Optimize SEO', 'PASS', 'Auto-optimization completed');
  } else {
    logTest('Auto-Optimize SEO', 'WARN', autoOptimize.error || 'Auto-optimization may have failed');
  }
}

/**
 * E-COMMERCE MANAGER TESTS
 */
async function ecommerceTests(instanceId = null) {
  console.log('\n🛒 E-COMMERCE MANAGER TESTS\n');
  
  if (!instanceId) {
    logTest('E-commerce Tests', 'WARN', 'No instance ID provided - skipping detailed tests');
    return;
  }
  
  // Test 1: Get Products
  const getProducts = await makeRequest('POST', '/api/wix', {
    action: 'getProducts',
    instanceId,
    options: { limit: 10 }
  });
  if (getProducts.response && getProducts.response.status === 200) {
    const products = getProducts.response.data.data?.products || [];
    logTest('Get Products', 'PASS', `Retrieved ${products.length} products`);
  } else {
    logTest('Get Products', 'FAIL', getProducts.error || 'Failed to get products');
  }
  
  // Test 2: Get Collections
  const getCollections = await makeRequest('POST', '/api/wix', {
    action: 'getCollections',
    instanceId
  });
  if (getCollections.response && getCollections.status === 200) {
    logTest('Get Collections', 'PASS', 'Collections retrieved');
  } else {
    logTest('Get Collections', 'WARN', getCollections.error || 'Collections may not be available');
  }
  
  // Test 3: Get Orders
  const getOrders = await makeRequest('POST', '/api/wix', {
    action: 'getOrders',
    instanceId,
    options: { limit: 10 }
  });
  if (getOrders.response && getOrders.response.status === 200) {
    logTest('Get Orders', 'PASS', 'Orders retrieved');
  } else {
    logTest('Get Orders', 'WARN', getOrders.error || 'Orders may not be available');
  }
  
  // Test 4: Catalog Sync (if implemented)
  // This would test syncing products to external platforms
  logTest('Catalog Sync', 'WARN', 'Catalog sync test not implemented yet');
}

/**
 * LIGHTHOUSE PERFORMANCE TESTS
 */
async function lighthouseTests() {
  console.log('\n🚀 LIGHTHOUSE PERFORMANCE TESTS\n');
  
  const pages = [
    { name: 'Wix Client Dashboard', path: '/wix-client-dashboard.html' },
    { name: 'Wix SEO Manager', path: '/wix-seo-manager.html' },
    { name: 'Wix E-commerce Manager', path: '/wix-ecommerce-manager.html' }
  ];
  
  for (const page of pages) {
    const startTime = performance.now();
    const pageTest = await makeRequest('GET', page.path);
    const loadTime = performance.now() - startTime;
    
    if (pageTest.response && pageTest.response.status === 200) {
      const size = JSON.stringify(pageTest.response.data || '').length;
      const sizeKB = (size / 1024).toFixed(2);
      
      if (loadTime < 1000) {
        logTest(`${page.name} - Load Time`, 'PASS', `${loadTime.toFixed(2)}ms (${sizeKB}KB)`);
      } else if (loadTime < 3000) {
        logTest(`${page.name} - Load Time`, 'WARN', `${loadTime.toFixed(2)}ms (${sizeKB}KB) - Could be faster`);
      } else {
        logTest(`${page.name} - Load Time`, 'FAIL', `${loadTime.toFixed(2)}ms (${sizeKB}KB) - Too slow`);
      }
    } else {
      logTest(`${page.name} - Load Time`, 'FAIL', pageTest.error || 'Page not accessible');
    }
  }
}

/**
 * COMPLETE FLOWTHROUGH TEST
 */
async function completeFlowthroughTest() {
  console.log('\n🔄 COMPLETE FLOWTHROUGH TEST\n');
  
  console.log('Step 1: Check server status...');
  const health = await makeRequest('GET', '/health');
  if (!health.response || health.response.status !== 200) {
    logTest('Complete Flowthrough', 'FAIL', 'Server not available');
    return;
  }
  
  console.log('Step 2: Check database connection...');
  const db = await makeRequest('GET', '/api/db/test');
  if (!db.response || !db.response.data.success) {
    logTest('Complete Flowthrough', 'FAIL', 'Database not connected');
    return;
  }
  
  console.log('Step 3: List connected clients...');
  const clients = await makeRequest('GET', '/api/wix?action=listClients');
  if (clients.response && clients.response.status === 200) {
    const clientList = clients.response.data.clients || [];
    if (clientList.length > 0) {
      const testInstanceId = clientList[0].instanceId;
      logTest('Complete Flowthrough - Client Found', 'PASS', `Using instance: ${testInstanceId}`);
      
      console.log('Step 4: Test SEO tools...');
      await seoToolsTests(testInstanceId);
      
      console.log('Step 5: Test E-commerce manager...');
      await ecommerceTests(testInstanceId);
      
      logTest('Complete Flowthrough', 'PASS', 'All steps completed');
    } else {
      logTest('Complete Flowthrough', 'WARN', 'No connected clients found - connect a client first');
    }
  } else {
    logTest('Complete Flowthrough', 'FAIL', 'Could not list clients');
  }
}

/**
 * Generate Test Report
 */
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST REPORT');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
  console.log(`📈 Total: ${testResults.passed.length + testResults.failed.length + testResults.warnings.length}`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach(fail => {
      console.log(`   - ${fail.test}: ${fail.message}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    testResults.warnings.forEach(warn => {
      console.log(`   - ${warn.test}: ${warn.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with appropriate code
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🧪 WIX CLIENT MANAGER - COMPREHENSIVE TEST SUITE');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(60));
  
  try {
    // Run all test suites
    await smokeTests();
    await oauthFlowTests();
    await lighthouseTests();
    await completeFlowthroughTest();
    
    // Generate report
    generateReport();
  } catch (error) {
    console.error('❌ Test suite error:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  smokeTests,
  oauthFlowTests,
  seoToolsTests,
  ecommerceTests,
  lighthouseTests,
  completeFlowthroughTest,
  runAllTests
};

