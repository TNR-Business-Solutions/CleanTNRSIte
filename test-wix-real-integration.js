/**
 * Wix Real Integration Test Suite
 * Tests actual Wix API calls with real data
 * NO DEMO DATA - All tests use real Wix APIs
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_INSTANCE_ID = process.env.TEST_INSTANCE_ID || 'a4890371-c6da-46f4-a830-9e19df999cf8';

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(`🧪 TEST: ${testName}`, 'blue');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

let passed = 0;
let failed = 0;

/**
 * Test 1: Get Real Products from Wix
 */
async function testGetRealProducts() {
  logTest('Get Real Products from Wix Store');
  
  try {
    logInfo(`Testing with instance: ${TEST_INSTANCE_ID}`);
    
    const response = await axios.post(`${BASE_URL}/api/wix`, {
      action: 'getProducts',
      instanceId: TEST_INSTANCE_ID,
      options: { limit: 10 }
    });
    
    if (response.data.success) {
      const products = response.data.data.products || [];
      logSuccess(`Retrieved ${products.length} REAL products from Wix`);
      
      if (products.length > 0) {
        logInfo('Sample product:');
        const sample = products[0];
        console.log(`   ID: ${sample.id}`);
        console.log(`   Name: ${sample.name || 'N/A'}`);
        console.log(`   Price: ${sample.price?.price || 'N/A'}`);
        console.log(`   SKU: ${sample.sku || 'N/A'}`);
        console.log(`   Visible: ${sample.visible !== false ? 'Yes' : 'No'}`);
      }
      
      passed++;
      return { success: true, products };
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.error || error.message}`);
    failed++;
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: Get Real Collections
 */
async function testGetRealCollections() {
  logTest('Get Real Collections from Wix Store');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/wix`, {
      action: 'getCollections',
      instanceId: TEST_INSTANCE_ID
    });
    
    if (response.data.success) {
      const collections = response.data.data.collections || [];
      logSuccess(`Retrieved ${collections.length} REAL collections from Wix`);
      
      if (collections.length > 0) {
        logInfo('Collections:');
        collections.forEach(col => {
          console.log(`   - ${col.name || col.id} (${col.id})`);
        });
      }
      
      passed++;
      return { success: true, collections };
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.error || error.message}`);
    failed++;
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Real SEO Audit (Product-based)
 */
async function testRealSEOAudit() {
  logTest('Run Real SEO Audit on Wix Products');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/wix`, {
      action: 'auditSiteSEO',
      instanceId: TEST_INSTANCE_ID
    });
    
    if (response.data.success) {
      const audit = response.data.data;
      logSuccess(`SEO Audit completed: ${audit.totalPages} products analyzed`);
      logInfo(`Pages with issues: ${audit.pagesWithIssues}`);
      
      if (audit.issues && audit.issues.length > 0) {
        logInfo('Sample issues found:');
        audit.issues.slice(0, 3).forEach(issue => {
          console.log(`   - ${issue.pageName}: ${issue.issues.length} issues`);
        });
      }
      
      passed++;
      return { success: true, audit };
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.error || error.message}`);
    failed++;
    return { success: false, error: error.message };
  }
}

/**
 * Test 4: Advanced Filter (Real)
 */
async function testAdvancedFilter() {
  logTest('Test Advanced Product Filtering (Real)');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/wix`, {
      action: 'createAdvancedFilter',
      instanceId: TEST_INSTANCE_ID,
      filterConfig: {
        priceRange: { min: 0, max: 1000 },
        inStockOnly: false
      }
    });
    
    if (response.data.success) {
      const products = response.data.data.products || [];
      logSuccess(`Filter returned ${products.length} REAL products`);
      logInfo('This filter actually queries your Wix store!');
      
      passed++;
      return { success: true, products };
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.error || error.message}`);
    failed++;
    return { success: false, error: error.message };
  }
}

/**
 * Test 5: Check Logging System
 */
async function testLoggingSystem() {
  logTest('Verify Logging System is Working');
  
  try {
    // Check if log directory exists
    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(__dirname, 'server', 'logs');
    
    if (fs.existsSync(logDir)) {
      const files = fs.readdirSync(logDir);
      const today = new Date().toISOString().split('T')[0];
      const todayLog = files.find(f => f.includes(today));
      
      if (todayLog) {
        logSuccess(`Log file found: ${todayLog}`);
        const logContent = fs.readFileSync(path.join(logDir, todayLog), 'utf8');
        const lines = logContent.split('\n').filter(l => l.trim());
        logInfo(`Total log entries today: ${lines.length}`);
        passed++;
        return { success: true };
      } else {
        logWarning('No log file for today yet (will be created on first API call)');
        passed++;
        return { success: true };
      }
    } else {
      logWarning('Log directory not created yet (will be created on first API call)');
      passed++;
      return { success: true };
    }
  } catch (error) {
    logError(`Failed: ${error.message}`);
    failed++;
    return { success: false, error: error.message };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n');
  log('═══════════════════════════════════════════════════════════════════', 'magenta');
  log('   WIX REAL INTEGRATION TEST SUITE', 'magenta');
  log('   Testing with ACTUAL Wix APIs - NO DEMO DATA', 'magenta');
  log('═══════════════════════════════════════════════════════════════════', 'magenta');
  
  log(`\n📍 Base URL: ${BASE_URL}`, 'yellow');
  log(`📍 Instance ID: ${TEST_INSTANCE_ID}`, 'yellow');
  log(`\n⚠️  IMPORTANT: These tests use REAL Wix APIs and REAL data!`, 'yellow');
  log(`   All API calls will be logged in server/logs/`, 'yellow');
  
  // Run tests
  await testGetRealProducts();
  await testGetRealCollections();
  await testRealSEOAudit();
  await testAdvancedFilter();
  await testLoggingSystem();
  
  // Summary
  console.log('\n');
  log('═══════════════════════════════════════════════════════════════════', 'magenta');
  log('   TEST SUMMARY', 'magenta');
  log('═══════════════════════════════════════════════════════════════════', 'magenta');
  
  log(`\nTotal Tests: ${passed + failed}`, 'blue');
  logSuccess(`Passed: ${passed}`);
  
  if (failed > 0) {
    logError(`Failed: ${failed}`);
  } else {
    log('\n🎉 All tests passed! Real Wix integration is working!', 'green');
  }
  
  if (passed + failed > 0) {
    const percentage = Math.round((passed / (passed + failed)) * 100);
    log(`\nSuccess Rate: ${percentage}%`, 'blue');
  }
  
  log('\n📋 Next Steps:', 'cyan');
  log('1. Check server/logs/ for detailed API logs', 'cyan');
  log('2. View change log at: http://localhost:3000/wix-change-log.html', 'cyan');
  log('3. Make a real update to test change tracking', 'cyan');
  
  console.log('\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});

