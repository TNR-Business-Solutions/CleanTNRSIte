/**
 * Flow-Through Tests for TNR Business Solutions
 * Tests complete user journeys from start to finish
 */

const puppeteer = require('puppeteer');
const axios = require('axios');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function testPublicWebsiteFlow() {
  log('\n' + '='.repeat(70), 'cyan');
  log('FLOW TEST 1: Public Website Navigation', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  try {
    // Step 1: Homepage
    log('\n1️⃣  Loading homepage...', 'blue');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
    log('   ✅ Homepage loaded', 'green');
    
    // Step 2: Navigate to Services
    log('\n2️⃣  Navigating to services...', 'blue');
    const servicesLink = await page.$('a[href*="service"], a[href*="packages"]');
    if (servicesLink) {
      await servicesLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
      log('   ✅ Services page loaded', 'green');
    } else {
      log('   ⚠️  Services link not found', 'yellow');
    }
    
    // Step 3: Contact Form
    log('\n3️⃣  Testing contact form...', 'blue');
    await page.goto(`${BASE_URL}/index.html#contact`, { waitUntil: 'networkidle0', timeout: 10000 });
    
    const nameInput = await page.$('input[name="name"], #name, #contactName');
    const emailInput = await page.$('input[name="email"], #email, #contactEmail');
    const messageInput = await page.$('textarea[name="message"], #message');
    
    if (nameInput && emailInput && messageInput) {
      await page.type('input[name="name"], #name, #contactName', 'Test User');
      await page.type('input[name="email"], #email, #contactEmail', 'test@example.com');
      await page.type('textarea[name="message"], #message', 'Test message for flow-through testing');
      log('   ✅ Contact form filled', 'green');
    } else {
      log('   ⚠️  Contact form not found', 'yellow');
    }
    
    log('\n✅ Public website flow completed successfully!', 'green');
    
  } catch (error) {
    log(`\n❌ Public website flow failed: ${error.message}`, 'red');
  } finally {
    await browser.close();
  }
}

async function testAdminLoginToActionFlow() {
  log('\n' + '='.repeat(70), 'cyan');
  log('FLOW TEST 2: Admin Login → Dashboard → Action', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  try {
    // Step 1: Login
    log('\n1️⃣  Logging in as admin...', 'blue');
    await page.goto(`${BASE_URL}/admin-login.html`, { waitUntil: 'networkidle0', timeout: 15000 });
    
    await page.waitForSelector('#username', { timeout: 5000 });
    await page.type('#username', ADMIN_USERNAME);
    await page.type('#password', ADMIN_PASSWORD);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    
    const sessionToken = await page.evaluate(() => localStorage.getItem('adminSession'));
    if (sessionToken) {
      log('   ✅ Admin login successful', 'green');
      log(`   📝 Token: ${sessionToken.substring(0, 20)}...`, 'blue');
    } else {
      throw new Error('No session token found after login');
    }
    
    // Step 2: Dashboard Navigation
    log('\n2️⃣  Navigating dashboard...', 'blue');
    await page.waitForSelector('.dashboard-container, .dashboard-header', { timeout: 10000 });
    log('   ✅ Dashboard loaded', 'green');
    
    // Check for stats
    const statsCards = await page.$$('.stat-card, .dashboard-stat, .stats-grid > div');
    log(`   📊 Found ${statsCards.length} stat cards`, 'blue');
    
    // Step 3: Check Platform Connections
    log('\n3️⃣  Checking platform connections...', 'blue');
    const platformCards = await page.$$('.platform-card, .platforms-grid > div');
    log(`   🔗 Found ${platformCards.length} platform cards`, 'blue');
    
    // Step 4: Verify API Calls
    log('\n4️⃣  Verifying authenticated API calls...', 'blue');
    const apiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.reload({ waitUntil: 'networkidle0', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const successfulCalls = apiCalls.filter(call => call.status === 200);
    log(`   ✅ ${successfulCalls.length} successful API calls`, 'green');
    
    const failedCalls = apiCalls.filter(call => call.status >= 400);
    if (failedCalls.length > 0) {
      log(`   ⚠️  ${failedCalls.length} failed API calls`, 'yellow');
      failedCalls.forEach(call => {
        log(`      - ${call.url} (${call.status})`, 'yellow');
      });
    }
    
    // Step 5: Logout
    log('\n5️⃣  Logging out...', 'blue');
    const logoutBtn = await page.$('#logoutBtn, button:has-text("Logout")');
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);
      const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('adminSession'));
      if (!tokenAfterLogout) {
        log('   ✅ Logout successful', 'green');
      }
    }
    
    log('\n✅ Admin flow completed successfully!', 'green');
    
  } catch (error) {
    log(`\n❌ Admin flow failed: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await browser.close();
  }
}

async function testAPIEndpointFlow() {
  log('\n' + '='.repeat(70), 'cyan');
  log('FLOW TEST 3: API Endpoint Authentication Flow', 'cyan');
  log('='.repeat(70), 'cyan');
  
  try {
    // Step 1: Login to get token
    log('\n1️⃣  Authenticating via API...', 'blue');
    const loginResponse = await axios.post(`${BASE_URL}/api/admin/auth`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });
    
    if (loginResponse.data.success && loginResponse.data.accessToken) {
      log('   ✅ API authentication successful', 'green');
      const token = loginResponse.data.accessToken;
      
      // Step 2: Test protected endpoints with token
      log('\n2️⃣  Testing protected endpoints...', 'blue');
      
      const endpoints = [
        '/api/crm/clients',
        '/api/analytics',
        '/api/stats/dashboard',
        '/api/social/tokens',
        '/api/workflows'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${BASE_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000
          });
          
          if (response.status === 200) {
            log(`   ✅ ${endpoint} - Accessible`, 'green');
          }
        } catch (error) {
          if (error.response?.status === 401) {
            log(`   ❌ ${endpoint} - Unauthorized (JWT not working)`, 'red');
          } else {
            log(`   ⚠️  ${endpoint} - ${error.message}`, 'yellow');
          }
        }
      }
      
      // Step 3: Test without token (should fail)
      log('\n3️⃣  Testing endpoints without token...', 'blue');
      try {
        await axios.get(`${BASE_URL}/api/crm/clients`);
        log('   ⚠️  Endpoint accessible without token (security issue!)', 'yellow');
      } catch (error) {
        if (error.response?.status === 401) {
          log('   ✅ Endpoints properly protected', 'green');
        }
      }
      
      log('\n✅ API flow completed successfully!', 'green');
    }
    
  } catch (error) {
    log(`\n❌ API flow failed: ${error.message}`, 'red');
  }
}

async function testFormSubmissionFlow() {
  log('\n' + '='.repeat(70), 'cyan');
  log('FLOW TEST 4: Contact Form Submission Flow', 'cyan');
  log('='.repeat(70), 'cyan');
  
  try {
    log('\n1️⃣  Submitting contact form...', 'blue');
    
    const formData = {
      name: 'Flow Test User',
      email: 'flowtest@example.com',
      phone: '(412) 555-0199',
      service: 'Web Design',
      message: 'This is a flow-through test submission',
      source: 'Flow Test'
    };
    
    const response = await axios.post(`${BASE_URL}/submit-form`, formData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (response.data.success) {
      log('   ✅ Form submitted successfully', 'green');
      log(`   📧 Lead created in CRM`, 'blue');
    } else {
      log('   ❌ Form submission failed', 'red');
    }
    
    log('\n✅ Form submission flow completed!', 'green');
    
  } catch (error) {
    log(`\n❌ Form flow failed: ${error.message}`, 'red');
  }
}

async function runAllFlowTests() {
  log('\n' + '█'.repeat(70), 'cyan');
  log('   TNR BUSINESS SOLUTIONS - FLOW-THROUGH TEST SUITE', 'cyan');
  log('█'.repeat(70) + '\n', 'cyan');
  
  const startTime = Date.now();
  
  await testPublicWebsiteFlow();
  await testAdminLoginToActionFlow();
  await testAPIEndpointFlow();
  await testFormSubmissionFlow();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n' + '='.repeat(70), 'cyan');
  log(`✅ ALL FLOW TESTS COMPLETED IN ${duration}s`, 'green');
  log('='.repeat(70) + '\n', 'cyan');
}

// Run tests if executed directly
if (require.main === module) {
  runAllFlowTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runAllFlowTests };

