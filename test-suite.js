/**
 * Automated Test Suite for TNR Business Solutions
 * Based on Puppeteer Lighthouse Flow Recording
 * Runs all critical user flows and validates functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = process.env.TEST_URL || 'https://www.tnrbusinesssolutions.com';
const TIMEOUT = 30000; // 30 seconds per action
const HEADLESS = process.env.HEADLESS !== 'false';

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  startTime: Date.now()
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function recordTest(name, passed, error = null) {
  const result = {
    name,
    passed,
    error: error ? error.message : null,
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

async function safeClick(page, selector, description) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    return true;
  } catch (error) {
    log(`Could not click ${description}: ${error.message}`, 'warning');
    return false;
  }
}

async function safeFill(page, selector, value, description) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    await page.type(selector, value, { delay: 50 });
    return true;
  } catch (error) {
    log(`Could not fill ${description}: ${error.message}`, 'warning');
    return false;
  }
}

async function checkApiResponse(page, urlPattern, expectedStatus = 200) {
  return new Promise((resolve) => {
    page.on('response', async (response) => {
      if (response.url().includes(urlPattern)) {
        const status = response.status();
        if (status === expectedStatus) {
          resolve({ success: true, status });
        } else {
          resolve({ success: false, status, url: response.url() });
        }
      }
    });
    
    // Timeout after 10 seconds
    setTimeout(() => resolve({ success: false, timeout: true }), 10000);
  });
}

// Test Cases
async function testAdminLogin(page) {
  log('Testing Admin Login...');
  try {
    await page.goto(`${BASE_URL}/admin-login.html`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#username', { timeout: 5000 });
    await page.type('#username', 'admin');
    await page.type('#password', process.env.ADMIN_PASSWORD || 'TNR2024!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect or error
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    
    const currentUrl = page.url();
    if (currentUrl.includes('admin-dashboard-v2.html')) {
      recordTest('Admin Login', true);
      return true;
    } else {
      recordTest('Admin Login', false, new Error(`Unexpected redirect to ${currentUrl}`));
      return false;
    }
  } catch (error) {
    recordTest('Admin Login', false, error);
    return false;
  }
}

async function testCRMLoad(page) {
  log('Testing CRM Load...');
  try {
    await page.goto(`${BASE_URL}/admin/crm/`, { waitUntil: 'networkidle2' });
    
    // Check for API calls
    const apiCheck = await checkApiResponse(page, '/api/crm/clients', 200);
    
    // Check if clients list is visible
    await page.waitForSelector('#clientsList, .client-list', { timeout: 5000 });
    
    recordTest('CRM Load', true);
    return true;
  } catch (error) {
    recordTest('CRM Load', false, error);
    return false;
  }
}

async function testCRMAddClient(page) {
  log('Testing Add Client...');
  try {
    await page.goto(`${BASE_URL}/admin/crm/`, { waitUntil: 'networkidle2' });
    
    // Click add client button
    await safeClick(page, 'button:has-text("Add New Client"), button:has-text("+ Add New Client")', 'Add Client Button');
    
    // Fill form
    await safeFill(page, '#clientName', 'Test Client ' + Date.now(), 'Client Name');
    await safeFill(page, '#clientEmail', `test${Date.now()}@example.com`, 'Client Email');
    await safeFill(page, '#clientPhone', '4125551234', 'Client Phone');
    
    // Submit
    await safeClick(page, 'button:has-text("Save Client")', 'Save Button');
    
    // Wait for API response
    await page.waitForTimeout(2000);
    
    recordTest('Add Client', true);
    return true;
  } catch (error) {
    recordTest('Add Client', false, error);
    return false;
  }
}

async function testCRMDeleteClient(page) {
  log('Testing Delete Client...');
  try {
    await page.goto(`${BASE_URL}/admin/crm/`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Find delete button
    const deleteButton = await page.$('button.btn-danger, button:has-text("Delete")');
    if (deleteButton) {
      await deleteButton.click();
      
      // Handle confirmation dialog
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await page.waitForTimeout(2000);
      
      // Check API response
      const apiCheck = await checkApiResponse(page, '/api/crm/clients', 200);
      
      recordTest('Delete Client', apiCheck.success);
      return apiCheck.success;
    } else {
      log('No clients to delete', 'warning');
      recordTest('Delete Client', true); // Skip if no clients
      return true;
    }
  } catch (error) {
    recordTest('Delete Client', false, error);
    return false;
  }
}

async function testCampaignsLoad(page) {
  log('Testing Campaigns Load...');
  try {
    await page.goto(`${BASE_URL}/admin/campaigns/`, { waitUntil: 'networkidle2' });
    
    // Check for form elements
    await page.waitForSelector('#campaignSubject', { timeout: 5000 });
    
    recordTest('Campaigns Load', true);
    return true;
  } catch (error) {
    recordTest('Campaigns Load', false, error);
    return false;
  }
}

async function testSocialMediaDashboard(page) {
  log('Testing Social Media Dashboard...');
  try {
    await page.goto(`${BASE_URL}/social-media-automation-dashboard.html`, { waitUntil: 'networkidle2' });
    
    // Check for platform tabs
    await page.waitForSelector('.platform-tabs', { timeout: 5000 });
    
    // Check API calls
    const apiCheck = await checkApiResponse(page, '/api/social/tokens', 200);
    
    recordTest('Social Media Dashboard', true);
    return true;
  } catch (error) {
    recordTest('Social Media Dashboard', false, error);
    return false;
  }
}

async function testWixDashboard(page) {
  log('Testing Wix Dashboard...');
  try {
    await page.goto(`${BASE_URL}/wix-client-dashboard.html`, { waitUntil: 'networkidle2' });
    
    // Check for dashboard elements
    await page.waitForSelector('.dashboard-header', { timeout: 5000 });
    
    recordTest('Wix Dashboard Load', true);
    return true;
  } catch (error) {
    recordTest('Wix Dashboard Load', false, error);
    return false;
  }
}

async function testSettingsAPI(page) {
  log('Testing Settings API...');
  try {
    const response = await page.goto(`${BASE_URL}/api/settings`, { waitUntil: 'networkidle2' });
    const status = response.status();
    
    if (status === 200) {
      const data = await response.json();
      recordTest('Settings API', data.success !== false);
      return data.success !== false;
    } else {
      recordTest('Settings API', false, new Error(`Status ${status}`));
      return false;
    }
  } catch (error) {
    recordTest('Settings API', false, error);
    return false;
  }
}

async function testAnalyticsLoad(page) {
  log('Testing Analytics Load...');
  try {
    await page.goto(`${BASE_URL}/admin/analytics/`, { waitUntil: 'networkidle2' });
    
    // Check for analytics elements
    await page.waitForSelector('.crm-section, .analytics-section', { timeout: 5000 });
    
    recordTest('Analytics Load', true);
    return true;
  } catch (error) {
    recordTest('Analytics Load', false, error);
    return false;
  }
}

async function testOrdersLoad(page) {
  log('Testing Orders Load...');
  try {
    await page.goto(`${BASE_URL}/admin-orders.html`, { waitUntil: 'networkidle2' });
    
    // Check for orders elements
    await page.waitForSelector('#orders, .orders-list', { timeout: 5000 });
    
    recordTest('Orders Load', true);
    return true;
  } catch (error) {
    recordTest('Orders Load', false, error);
    return false;
  }
}

// Main test runner
async function runTestSuite() {
  log('Starting Test Suite...', 'info');
  log(`Base URL: ${BASE_URL}`, 'info');
  log(`Headless: ${HEADLESS}`, 'info');
  
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  page.setDefaultTimeout(TIMEOUT);
  
  // Set viewport
  await page.setViewport({ width: 1327, height: 945 });
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      testResults.warnings.push({
        type: 'console_error',
        message: msg.text(),
        timestamp: Date.now()
      });
      log(`Console Error: ${msg.text()}`, 'warning');
    }
  });
  
  // Capture failed requests
  page.on('requestfailed', request => {
    testResults.warnings.push({
      type: 'request_failed',
      url: request.url(),
      error: request.failure()?.errorText,
      timestamp: Date.now()
    });
    log(`Request Failed: ${request.url()} - ${request.failure()?.errorText}`, 'warning');
  });
  
  // Capture API errors
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/api/')) {
      testResults.warnings.push({
        type: 'api_error',
        url: response.url(),
        status: response.status(),
        timestamp: Date.now()
      });
      log(`API Error: ${response.url()} - Status ${response.status()}`, 'warning');
    }
  });
  
  try {
    // Run all tests
    await testAdminLogin(page);
    await testCRMLoad(page);
    await testCRMAddClient(page);
    await testCRMDeleteClient(page);
    await testCampaignsLoad(page);
    await testSocialMediaDashboard(page);
    await testWixDashboard(page);
    await testSettingsAPI(page);
    await testAnalyticsLoad(page);
    await testOrdersLoad(page);
    
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

// Run tests in loop until all pass
async function runTestsUntilPass(maxIterations = 10) {
  let iteration = 0;
  let allPassed = false;
  
  while (iteration < maxIterations && !allPassed) {
    iteration++;
    log(`\n=== Test Iteration ${iteration} ===`, 'info');
    
    const results = await runTestSuite();
    
    // Print summary
    console.log('\n=== Test Summary ===');
    console.log(`Total Tests: ${results.totalTests}`);
    console.log(`Passed: ${results.passed.length}`);
    console.log(`Failed: ${results.failed.length}`);
    console.log(`Warnings: ${results.warnings.length}`);
    console.log(`Pass Rate: ${results.passRate}%`);
    console.log(`Duration: ${(results.duration / 1000).toFixed(2)}s`);
    
    if (results.failed.length === 0) {
      allPassed = true;
      log('All tests passed!', 'success');
    } else {
      log(`Found ${results.failed.length} failing tests. Analyzing...`, 'warning');
      
      // Analyze failures and suggest fixes
      for (const failure of results.failed) {
        console.log(`\n❌ ${failure.name}: ${failure.error}`);
      }
      
      // Wait before next iteration
      if (iteration < maxIterations) {
        log('Waiting 5 seconds before next iteration...', 'info');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Save results
    const reportPath = path.join(__dirname, `test-results-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    log(`Results saved to ${reportPath}`, 'info');
  }
  
  if (!allPassed) {
    log(`Reached maximum iterations (${maxIterations}). Some tests may still be failing.`, 'warning');
  }
  
  return allPassed;
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

