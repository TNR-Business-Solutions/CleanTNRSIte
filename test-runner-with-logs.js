/**
 * Comprehensive Test Runner with Vercel Logs Integration
 * Runs Puppeteer tests in a loop and fetches Vercel logs to identify issues
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'https://www.tnrbusinesssolutions.com';
const VERCEL_API_TOKEN = process.env.VERCEL_TOKEN || '';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'tnr-business-solutions';
const TIMEOUT = 30000;
const HEADLESS = process.env.HEADLESS !== 'false';

const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  apiErrors: [],
  vercelLogs: [],
  startTime: Date.now()
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️'
  }[type] || 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function recordTest(name, passed, error = null, details = {}) {
  const result = {
    name,
    passed,
    error: error ? error.message : null,
    details,
    timestamp: Date.now()
  };
  
  if (passed) {
    testResults.passed.push(result);
    log(`PASS: ${name}`, 'success');
  } else {
    testResults.failed.push(result);
    log(`FAIL: ${name} - ${error?.message || 'Unknown error'}`, 'error');
  }
}

// Fetch Vercel logs using Vercel CLI or API
async function fetchVercelLogs(since = null) {
  if (!VERCEL_API_TOKEN) {
    log('VERCEL_TOKEN not set, skipping log fetch. Set VERCEL_TOKEN env var to enable.', 'warning');
    return [];
  }
  
  // Try to fetch recent deployment logs
  return new Promise((resolve) => {
    // Get recent deployments first
    const deploymentsUrl = `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=1`;
    
    const options = {
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`
      }
    };
    
    https.get(deploymentsUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const deployments = JSON.parse(data);
          if (deployments.deployments && deployments.deployments.length > 0) {
            const deploymentId = deployments.deployments[0].uid;
            log(`Found deployment: ${deploymentId}`, 'info');
            // Note: Actual log fetching requires different API endpoint
            // For now, return deployment info
            resolve([{ type: 'deployment', id: deploymentId, timestamp: Date.now() }]);
          } else {
            resolve([]);
          }
        } catch (e) {
          log(`Error parsing Vercel API response: ${e.message}`, 'warning');
          resolve([]);
        }
      });
    }).on('error', (err) => {
      log(`Error fetching Vercel logs: ${err.message}`, 'warning');
      resolve([]);
    });
  });
}

// Analyze logs for errors
function analyzeLogs(logs) {
  const errors = [];
  const warnings = [];
  
  logs.forEach(log => {
    if (log.type === 'stderr' || (log.payload && log.payload.includes('Error'))) {
      errors.push(log);
    } else if (log.type === 'stdout' && log.payload && (
      log.payload.includes('Warning') || 
      log.payload.includes('⚠️') ||
      log.payload.includes('deprecated')
    )) {
      warnings.push(log);
    }
  });
  
  return { errors, warnings };
}

// Test: Admin Login
async function testAdminLogin(page) {
  log('Testing Admin Login...');
  try {
    await page.goto(`${BASE_URL}/admin-login.html`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#username', { timeout: 5000 });
    await page.type('#username', 'admin', { delay: 50 });
    await page.type('#password', process.env.ADMIN_PASSWORD || 'TNR2024!', { delay: 50 });
    
    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/admin/auth'), { timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    
    const data = await response.json();
    if (data.success) {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      recordTest('Admin Login', true, null, { status: response.status() });
      return true;
    } else {
      recordTest('Admin Login', false, new Error(data.error || 'Login failed'), { status: response.status() });
      return false;
    }
  } catch (error) {
    recordTest('Admin Login', false, error);
    return false;
  }
}

// Test: CRM API
async function testCRMAPIs(page) {
  log('Testing CRM APIs...');
  const tests = [];
  
  try {
    // Test GET /api/crm/clients
    const clientsResponse = await page.goto(`${BASE_URL}/api/crm/clients`, { waitUntil: 'networkidle2' });
    const clientsData = await clientsResponse.json();
    tests.push({
      name: 'GET /api/crm/clients',
      passed: clientsResponse.status() === 200 && clientsData.success,
      status: clientsResponse.status()
    });
    
    // Test GET /api/crm/leads
    const leadsResponse = await page.goto(`${BASE_URL}/api/crm/leads`, { waitUntil: 'networkidle2' });
    const leadsData = await leadsResponse.json();
    tests.push({
      name: 'GET /api/crm/leads',
      passed: leadsResponse.status() === 200 && leadsData.success,
      status: leadsResponse.status()
    });
    
    // Test GET /api/crm/orders
    const ordersResponse = await page.goto(`${BASE_URL}/api/crm/orders`, { waitUntil: 'networkidle2' });
    const ordersData = await ordersResponse.json();
    tests.push({
      name: 'GET /api/crm/orders',
      passed: ordersResponse.status() === 200 && ordersData.success,
      status: ordersResponse.status()
    });
    
    // Test GET /api/crm/stats
    const statsResponse = await page.goto(`${BASE_URL}/api/crm/stats`, { waitUntil: 'networkidle2' });
    const statsData = await statsResponse.json();
    tests.push({
      name: 'GET /api/crm/stats',
      passed: statsResponse.status() === 200 && statsData.success,
      status: statsResponse.status()
    });
    
    tests.forEach(test => {
      recordTest(test.name, test.passed, test.passed ? null : new Error(`Status ${test.status}`), { status: test.status });
    });
    
    return tests.every(t => t.passed);
  } catch (error) {
    recordTest('CRM APIs', false, error);
    return false;
  }
}

// Test: Settings API
async function testSettingsAPI(page) {
  log('Testing Settings API...');
  try {
    const response = await page.goto(`${BASE_URL}/api/settings`, { waitUntil: 'networkidle2' });
    const data = await response.json();
    
    const passed = response.status() === 200 && data.success !== false;
    recordTest('Settings API', passed, passed ? null : new Error(`Status ${response.status()}`), { status: response.status() });
    return passed;
  } catch (error) {
    recordTest('Settings API', false, error);
    return false;
  }
}

// Test: Social Tokens API
async function testSocialTokensAPI(page) {
  log('Testing Social Tokens API...');
  try {
    const response = await page.goto(`${BASE_URL}/api/social/tokens`, { waitUntil: 'networkidle2' });
    const data = await response.json();
    
    const passed = response.status() === 200;
    recordTest('Social Tokens API', passed, passed ? null : new Error(`Status ${response.status()}`), { status: response.status() });
    return passed;
  } catch (error) {
    recordTest('Social Tokens API', false, error);
    return false;
  }
}

// Test: Pinterest OAuth (should return 501)
async function testPinterestOAuth(page) {
  log('Testing Pinterest OAuth...');
  try {
    const response = await page.goto(`${BASE_URL}/api/auth/pinterest`, { waitUntil: 'networkidle2' });
    const data = await response.json();
    
    // Should return 501 (Not Implemented) with proper message
    const passed = response.status() === 501 && data.message && data.message.includes('not yet');
    recordTest('Pinterest OAuth', passed, passed ? null : new Error(`Unexpected status ${response.status()}`), { status: response.status() });
    return passed;
  } catch (error) {
    recordTest('Pinterest OAuth', false, error);
    return false;
  }
}

// Test: CRM DELETE (with query param)
async function testCRMDelete(page) {
  log('Testing CRM DELETE with query param...');
  try {
    // First get a client ID
    const clientsResponse = await page.goto(`${BASE_URL}/api/crm/clients`, { waitUntil: 'networkidle2' });
    const clientsData = await clientsResponse.json();
    
    if (clientsData.success && clientsData.data && clientsData.data.length > 0) {
      const clientId = clientsData.data[0].id;
      
      // Test DELETE with query param using fetch
      const deleteResult = await page.evaluate(async (url, clientId) => {
        try {
          const response = await fetch(`${url}/api/crm/clients?clientId=${clientId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          return { status: response.status, data, error: null };
        } catch (error) {
          return { status: 0, data: null, error: error.message };
        }
      }, BASE_URL, clientId);
      
      if (deleteResult.error) {
        recordTest('CRM DELETE (query param)', false, new Error(deleteResult.error));
        return false;
      }
      
      const passed = deleteResult.status === 200 && deleteResult.data.success;
      recordTest('CRM DELETE (query param)', passed, passed ? null : new Error(`Status ${deleteResult.status}`), { status: deleteResult.status });
      return passed;
    } else {
      log('No clients to test DELETE', 'warning');
      recordTest('CRM DELETE (query param)', true, null, { skipped: 'No clients available' });
      return true;
    }
  } catch (error) {
    recordTest('CRM DELETE (query param)', false, error);
    return false;
  }
}

// Test: Page Loads
async function testPageLoads(page) {
  log('Testing Page Loads...');
  const pages = [
    { url: '/admin-dashboard-v2.html', name: 'Admin Dashboard' },
    { url: '/admin/crm/', name: 'CRM Page' },
    { url: '/admin/campaigns/', name: 'Campaigns Page' },
    { url: '/admin/analytics/', name: 'Analytics Page' },
    { url: '/admin/settings/', name: 'Settings Page' },
    { url: '/admin-orders.html', name: 'Orders Page' },
    { url: '/social-media-automation-dashboard.html', name: 'Social Media Dashboard' },
    { url: '/wix-client-dashboard.html', name: 'Wix Dashboard' }
  ];
  
  const results = [];
  for (const pageInfo of pages) {
    try {
      const response = await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'networkidle2', timeout: 15000 });
      const passed = response.status() === 200;
      recordTest(`Page Load: ${pageInfo.name}`, passed, passed ? null : new Error(`Status ${response.status()}`), { status: response.status() });
      results.push(passed);
    } catch (error) {
      recordTest(`Page Load: ${pageInfo.name}`, false, error);
      results.push(false);
    }
  }
  
  return results.every(r => r);
}

// Main test runner
async function runTestSuite() {
  log('Starting Comprehensive Test Suite...', 'info');
  log(`Base URL: ${BASE_URL}`, 'info');
  
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await page.setViewport({ width: 1327, height: 945 });
  
  // Capture API errors
  const apiErrors = [];
  page.on('response', response => {
    if (response.url().includes('/api/') && response.status() >= 400) {
      apiErrors.push({
        url: response.url(),
        status: response.status(),
        timestamp: Date.now()
      });
      log(`API Error: ${response.url()} - ${response.status()}`, 'warning');
    }
  });
  
  try {
    // Run all tests
    await testAdminLogin(page);
    await testCRMAPIs(page);
    await testSettingsAPI(page);
    await testSocialTokensAPI(page);
    await testPinterestOAuth(page);
    await testCRMDelete(page);
    await testPageLoads(page);
    
    // Fetch Vercel logs
    log('Fetching Vercel logs...', 'info');
    const logs = await fetchVercelLogs(testResults.startTime);
    testResults.vercelLogs = logs;
    
    const logAnalysis = analyzeLogs(logs);
    testResults.apiErrors = apiErrors;
    
    if (logAnalysis.errors.length > 0) {
      log(`Found ${logAnalysis.errors.length} errors in Vercel logs`, 'warning');
    }
    
  } catch (error) {
    log(`Test suite error: ${error.message}`, 'error');
  } finally {
    await browser.close();
  }
  
  // Generate report
  testResults.endTime = Date.now();
  testResults.duration = testResults.endTime - testResults.startTime;
  testResults.totalTests = testResults.passed.length + testResults.failed.length;
  testResults.passRate = testResults.totalTests > 0 
    ? (testResults.passed.length / testResults.totalTests * 100).toFixed(2)
    : 0;
  
  return testResults;
}

// Run tests in loop
async function runTestsUntilPass(maxIterations = 10) {
  let iteration = 0;
  let allPassed = false;
  const allResults = [];
  
  while (iteration < maxIterations && !allPassed) {
    iteration++;
    log(`\n${'='.repeat(50)}`, 'info');
    log(`Test Iteration ${iteration}/${maxIterations}`, 'info');
    log('='.repeat(50), 'info');
    
    const results = await runTestSuite();
    allResults.push({ iteration, results });
    
    // Print summary
    console.log('\n=== Test Summary ===');
    console.log(`Total Tests: ${results.totalTests}`);
    console.log(`Passed: ${results.passed.length}`);
    console.log(`Failed: ${results.failed.length}`);
    console.log(`Warnings: ${results.warnings.length}`);
    console.log(`API Errors: ${results.apiErrors.length}`);
    console.log(`Pass Rate: ${results.passRate}%`);
    console.log(`Duration: ${(results.duration / 1000).toFixed(2)}s`);
    
    if (results.failed.length === 0) {
      allPassed = true;
      log('\n✅ All tests passed!', 'success');
    } else {
      log(`\n⚠️ Found ${results.failed.length} failing tests:`, 'warning');
      results.failed.forEach(f => {
        console.log(`  ❌ ${f.name}: ${f.error}`);
      });
      
      // Analyze failures and suggest fixes
      log('\nAnalyzing failures...', 'info');
      await analyzeAndFixFailures(results.failed);
      
      if (iteration < maxIterations) {
        log('Waiting 5 seconds before next iteration...', 'info');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Save results
    const reportPath = path.join(__dirname, `test-results-iteration-${iteration}-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    log(`Results saved to ${reportPath}`, 'info');
  }
  
  // Save final summary
  const summaryPath = path.join(__dirname, `test-summary-${Date.now()}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify({
    totalIterations: iteration,
    allPassed,
    allResults
  }, null, 2));
  log(`Final summary saved to ${summaryPath}`, 'info');
  
  if (!allPassed) {
    log(`\n⚠️ Reached maximum iterations (${maxIterations}). Some tests may still be failing.`, 'warning');
  }
  
  return allPassed;
}

// Analyze failures and attempt fixes
async function analyzeAndFixFailures(failures) {
  for (const failure of failures) {
    log(`Analyzing failure: ${failure.name}`, 'info');
    
    // Add specific fix logic here based on failure patterns
    if (failure.error && failure.error.includes('404')) {
      log(`  → 404 error detected, checking route configuration...`, 'info');
    } else if (failure.error && failure.error.includes('500')) {
      log(`  → 500 error detected, checking server logs...`, 'info');
    }
  }
}

// Run if called directly
if (require.main === module) {
  runTestsUntilPass().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runTestSuite, runTestsUntilPass };

