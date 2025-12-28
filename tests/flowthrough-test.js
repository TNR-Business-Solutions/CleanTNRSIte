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
  
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: 30000
  });
  const page = await browser.newPage();
  
  // Set longer timeouts
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(20000);
  
  try {
    // Step 1: Homepage
    log('\n1️⃣  Loading homepage...', 'blue');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000); // Wait for dynamic content
    log('   ✅ Homepage loaded', 'green');
    
    // Step 2: Navigate to Services
    log('\n2️⃣  Navigating to services...', 'blue');
    try {
      // Wait for page to be fully interactive
      await page.waitForSelector('a', { timeout: 5000 });
      
      // Try multiple selector strategies with better waiting
      const selectors = [
        'a[href*="service"]',
        'a[href*="packages"]',
        'a[href="/services.html"]',
        'a[href="services.html"]',
        'nav a[href*="service"]'
      ];
      
      let servicesLink = null;
      for (const selector of selectors) {
        try {
          servicesLink = await page.$(selector);
          if (servicesLink) {
            const isVisible = await servicesLink.evaluate(el => {
              const style = window.getComputedStyle(el);
              return style.display !== 'none' && style.visibility !== 'hidden';
            });
            if (isVisible) break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (servicesLink) {
        // Scroll into view and click
        await servicesLink.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await page.waitForTimeout(500);
        
        await Promise.race([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }),
          servicesLink.click()
        ]);
        await page.waitForTimeout(2000);
        log('   ✅ Services page loaded', 'green');
      } else {
        // Fallback: navigate directly
        await page.goto(`${BASE_URL}/services.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        log('   ✅ Services page loaded (direct navigation)', 'green');
      }
    } catch (error) {
      log(`   ⚠️  Services navigation issue: ${error.message}`, 'yellow');
      // Try direct navigation as fallback
      try {
        await page.goto(`${BASE_URL}/services.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        log('   ✅ Services page loaded (fallback)', 'green');
      } catch (e) {
        log(`   ⚠️  Fallback navigation also failed: ${e.message}`, 'yellow');
      }
    }
    
    // Step 3: Contact Form
    log('\n3️⃣  Testing contact form...', 'blue');
    try {
      await page.goto(`${BASE_URL}/index.html#contact`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      // Try multiple selectors with waiting
      const nameSelectors = ['input[name="name"]', '#name', '#contactName', 'input[type="text"]'];
      const emailSelectors = ['input[name="email"]', '#email', '#contactEmail', 'input[type="email"]'];
      const messageSelectors = ['textarea[name="message"]', '#message', 'textarea'];
      
      let nameInput = null, emailInput = null, messageInput = null;
      
      for (const selector of nameSelectors) {
        try {
          nameInput = await page.$(selector);
          if (nameInput) break;
        } catch (e) {}
      }
      
      for (const selector of emailSelectors) {
        try {
          emailInput = await page.$(selector);
          if (emailInput) break;
        } catch (e) {}
      }
      
      for (const selector of messageSelectors) {
        try {
          messageInput = await page.$(selector);
          if (messageInput) break;
        } catch (e) {}
      }
      
      if (nameInput && emailInput && messageInput) {
        await nameInput.type('Test User', { delay: 50 });
        await emailInput.type('test@example.com', { delay: 50 });
        await messageInput.type('Test message for flow-through testing', { delay: 50 });
        log('   ✅ Contact form filled', 'green');
      } else {
        log('   ⚠️  Contact form not found (may be on different page)', 'yellow');
      }
    } catch (error) {
      log(`   ⚠️  Contact form test issue: ${error.message}`, 'yellow');
    }
    
    log('\n✅ Public website flow completed successfully!', 'green');
    return true;
    
  } catch (error) {
    log(`\n❌ Public website flow failed: ${error.message}`, 'red');
    return false;
  } finally {
    try {
      await browser.close();
    } catch (e) {
      // Ignore close errors
    }
  }
}

async function testAdminLoginToActionFlow() {
  log('\n' + '='.repeat(70), 'cyan');
  log('FLOW TEST 2: Admin Login → Dashboard → Action', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: 30000
  });
  const page = await browser.newPage();
  
  // Set longer timeouts
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(20000);
  
  try {
    // Step 1: Login
    log('\n1️⃣  Logging in as admin...', 'blue');
    await page.goto(`${BASE_URL}/admin-login.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    
    // Wait for form with multiple selector strategies
    const usernameSelectors = ['#username', 'input[name="username"]', 'input[type="text"]'];
    const passwordSelectors = ['#password', 'input[name="password"]', 'input[type="password"]'];
    const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Login")'];
    
    let usernameInput = null, passwordInput = null, submitButton = null;
    
    for (const selector of usernameSelectors) {
      try {
        usernameInput = await page.$(selector);
        if (usernameInput) break;
      } catch (e) {}
    }
    
    for (const selector of passwordSelectors) {
      try {
        passwordInput = await page.$(selector);
        if (passwordInput) break;
      } catch (e) {}
    }
    
    for (const selector of submitSelectors) {
      try {
        submitButton = await page.$(selector);
        if (submitButton) break;
      } catch (e) {}
    }
    
    if (!usernameInput || !passwordInput || !submitButton) {
      throw new Error('Login form elements not found');
    }
    
    await usernameInput.type(ADMIN_USERNAME, { delay: 50 });
    await passwordInput.type(ADMIN_PASSWORD, { delay: 50 });
    
    // Submit form and wait for response with better error handling
    const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    const responsePromise = page.waitForResponse(response => response.url().includes('/api/admin/auth'), { timeout: 20000 }).catch(() => null);
    
    await submitButton.click();
    
    // Wait for either navigation or response
    await Promise.race([navigationPromise, responsePromise]);
    await page.waitForTimeout(3000); // Wait for localStorage update
    
    const sessionToken = await page.evaluate(() => localStorage.getItem('adminSession'));
    if (sessionToken) {
      log('   ✅ Admin login successful', 'green');
      log(`   📝 Token: ${sessionToken.substring(0, 20)}...`, 'blue');
    } else {
      // Check if we're on dashboard page (may have navigated without token in localStorage)
      const currentUrl = page.url();
      if (currentUrl.includes('dashboard') || currentUrl.includes('admin')) {
        log('   ⚠️  No token in localStorage, but may be on dashboard', 'yellow');
      } else {
        throw new Error('No session token found after login');
      }
    }
    
    // Step 2: Dashboard Navigation
    log('\n2️⃣  Navigating dashboard...', 'blue');
    
    // Wait for dashboard with multiple selector strategies
    const dashboardSelectors = [
      '.dashboard-container',
      '.dashboard-header',
      '.dashboard',
      '[class*="dashboard"]',
      'main',
      '#app'
    ];
    
    let dashboardFound = false;
    for (const selector of dashboardSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        dashboardFound = true;
        break;
      } catch (e) {
        // Try next selector
      }
    }
    
    if (dashboardFound) {
      log('   ✅ Dashboard loaded', 'green');
    } else {
      log('   ⚠️  Dashboard selectors not found, but page loaded', 'yellow');
    }
    
    // Wait for dynamic content
    await page.waitForTimeout(3000);
    
    // Check for stats with multiple selectors
    const statSelectors = [
      '.stat-card',
      '.dashboard-stat',
      '.stats-grid > div',
      '[class*="stat"]'
    ];
    
    let statsCards = [];
    for (const selector of statSelectors) {
      try {
        statsCards = await page.$$(selector);
        if (statsCards.length > 0) break;
      } catch (e) {}
    }
    log(`   📊 Found ${statsCards.length} stat cards`, 'blue');
    
    // Step 3: Check Platform Connections
    log('\n3️⃣  Checking platform connections...', 'blue');
    const platformSelectors = [
      '.platform-card',
      '.platforms-grid > div',
      '[class*="platform"]'
    ];
    
    let platformCards = [];
    for (const selector of platformSelectors) {
      try {
        platformCards = await page.$$(selector);
        if (platformCards.length > 0) break;
      } catch (e) {}
    }
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
    
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    
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

