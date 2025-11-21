/**
 * Comprehensive Wix SEO Testing
 * Tests SEO audit and auto-optimize features
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://www.tnrbusinesssolutions.com';
const INSTANCE_ID = 'a4890371-c6da-46f4-a830-9e19df999cf8'; // shesallthatandmore.com

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: { total: 0, passed: 0, failed: 0 }
};

function recordTest(name, status, details) {
  results.tests.push({ name, status, details, timestamp: new Date().toISOString() });
  results.summary.total++;
  if (status === 'PASS') results.summary.passed++;
  else results.summary.failed++;
  
  const symbol = status === 'PASS' ? '✅' : '❌';
  const color = status === 'PASS' ? 'green' : 'red';
  log(`${symbol} ${name}`, color);
  if (details) log(`   ${details}`, color);
}

async function testWixConnection() {
  logSection('🔗 WIX CONNECTION TEST');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/wix`, {
      action: 'getClientDetails',
      instanceId: INSTANCE_ID
    }, {
      timeout: 10000
    });
    
    if (response.data.success && response.data.client) {
      recordTest('Wix client connection', 'PASS', `Instance ID: ${response.data.client.instanceId}`);
      log(`   Created: ${new Date(response.data.client.createdAt).toLocaleString()}`, 'blue');
      log(`   Token valid: ${response.data.client.hasValidToken}`, 'blue');
      log(`   Expires: ${new Date(response.data.client.expiresAt).toLocaleString()}`, 'blue');
      return true;
    } else {
      recordTest('Wix client connection', 'FAIL', 'No client data returned');
      return false;
    }
  } catch (error) {
    recordTest('Wix client connection', 'FAIL', error.response?.data?.error || error.message);
    return false;
  }
}

async function testSEOAudit() {
  logSection('📊 SEO AUDIT TEST');
  
  log('Running full SEO audit...', 'yellow');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/wix`, {
      action: 'auditSiteSEO',
      instanceId: INSTANCE_ID
    }, {
      timeout: 30000 // 30 seconds for audit
    });
    
    if (response.data.success && response.data.data) {
      const audit = response.data.data;
      recordTest('SEO Audit execution', 'PASS', `Analyzed ${audit.totalPages} pages`);
      
      log(`\n   📈 Audit Results:`, 'cyan');
      log(`   Total Pages: ${audit.totalPages}`, 'blue');
      log(`   Pages with Issues: ${audit.pagesWithIssues}`, audit.pagesWithIssues > 0 ? 'yellow' : 'green');
      log(`   Audit Type: ${audit.auditType || 'Product SEO'}`, 'blue');
      
      if (audit.message) {
        log(`   Message: ${audit.message}`, 'cyan');
      }
      
      if (audit.issues && audit.issues.length > 0) {
        log(`\n   🔍 Issues Found:`, 'yellow');
        audit.issues.slice(0, 3).forEach((issue, index) => {
          log(`   ${index + 1}. ${issue.pageName}`, 'magenta');
          issue.issues.slice(0, 2).forEach(i => {
            log(`      - ${i}`, 'yellow');
          });
        });
        if (audit.issues.length > 3) {
          log(`   ... and ${audit.issues.length - 3} more`, 'yellow');
        }
      } else {
        log(`   ✅ No SEO issues found!`, 'green');
      }
      
      return { success: true, audit };
    } else {
      recordTest('SEO Audit execution', 'FAIL', response.data.error || 'No audit data returned');
      return { success: false };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    recordTest('SEO Audit execution', 'FAIL', errorMsg);
    
    // Show detailed error for debugging
    if (error.response?.data) {
      log(`\n   Error Details:`, 'red');
      log(`   ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    
    return { success: false, error: errorMsg };
  }
}

async function testAutoOptimizeSEO() {
  logSection('⚡ AUTO-OPTIMIZE SEO TEST');
  
  log('Running auto-optimize for all pages...', 'yellow');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/wix`, {
      action: 'autoOptimizeSEO',
      instanceId: INSTANCE_ID
    }, {
      timeout: 60000 // 60 seconds for optimization
    });
    
    if (response.data.success && response.data.data) {
      const result = response.data.data;
      recordTest('Auto-Optimize SEO execution', 'PASS', `Optimized ${result.pagesOptimized || 0} pages`);
      
      log(`\n   🎯 Optimization Results:`, 'cyan');
      log(`   Pages Optimized: ${result.pagesOptimized || 0}`, 'green');
      log(`   Total Updates: ${result.totalUpdates || 0}`, 'blue');
      
      if (result.optimizations && result.optimizations.length > 0) {
        log(`\n   📝 Optimizations Applied:`, 'green');
        result.optimizations.slice(0, 5).forEach((opt, index) => {
          log(`   ${index + 1}. ${opt.pageName || opt.productName}`, 'magenta');
          if (opt.changes) {
            opt.changes.slice(0, 2).forEach(change => {
              log(`      ✓ ${change}`, 'green');
            });
          }
        });
        if (result.optimizations.length > 5) {
          log(`   ... and ${result.optimizations.length - 5} more`, 'yellow');
        }
      }
      
      if (result.message) {
        log(`\n   ${result.message}`, 'cyan');
      }
      
      return { success: true, result };
    } else {
      recordTest('Auto-Optimize SEO execution', 'FAIL', response.data.error || 'No optimization data returned');
      return { success: false };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    recordTest('Auto-Optimize SEO execution', 'FAIL', errorMsg);
    
    if (error.response?.data) {
      log(`\n   Error Details:`, 'red');
      log(`   ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    
    return { success: false, error: errorMsg };
  }
}

async function testSiteSEOUpdate() {
  logSection('🌐 SITE-WIDE SEO UPDATE TEST');
  
  log('Testing site-wide SEO settings update...', 'yellow');
  
  try {
    const seoData = {
      title: 'She\'s All That & More - Premium Products',
      description: 'Discover unique, high-quality products at She\'s All That & More. Shop our curated collection.',
      keywords: ['premium products', 'unique gifts', 'quality items', 'online shopping']
    };
    
    const response = await axios.post(`${BASE_URL}/api/wix`, {
      action: 'updateSiteSEO',
      instanceId: INSTANCE_ID,
      seoData
    }, {
      timeout: 15000
    });
    
    if (response.data.success) {
      recordTest('Site-wide SEO update', 'PASS', 'SEO settings updated successfully');
      log(`   Title: ${seoData.title}`, 'blue');
      log(`   Description: ${seoData.description.substring(0, 50)}...`, 'blue');
      log(`   Keywords: ${seoData.keywords.length} keywords`, 'blue');
      return { success: true };
    } else {
      recordTest('Site-wide SEO update', 'FAIL', response.data.error || 'Update failed');
      return { success: false };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    recordTest('Site-wide SEO update', 'FAIL', errorMsg);
    return { success: false, error: errorMsg };
  }
}

async function testProductSEO() {
  logSection('📦 PRODUCT SEO TEST');
  
  log('Testing product-specific SEO optimization...', 'yellow');
  
  try {
    // First, get products
    const productsResponse = await axios.post(`${BASE_URL}/api/wix`, {
      action: 'getProducts',
      instanceId: INSTANCE_ID
    }, {
      timeout: 15000
    });
    
    if (productsResponse.data.success && productsResponse.data.data.products) {
      const products = productsResponse.data.data.products;
      recordTest('Get products for SEO', 'PASS', `Found ${products.length} products`);
      
      if (products.length > 0) {
        const firstProduct = products[0];
        log(`   Testing with: ${firstProduct.name}`, 'cyan');
        log(`   Product ID: ${firstProduct.id}`, 'blue');
        
        // Check current SEO status
        log(`\n   Current SEO Status:`, 'yellow');
        log(`   Name length: ${firstProduct.name?.length || 0} characters`, 'blue');
        log(`   Description: ${firstProduct.description ? 'Yes' : 'No'}`, firstProduct.description ? 'green' : 'red');
        log(`   Images: ${firstProduct.media?.items?.length || 0}`, 'blue');
        
        return { success: true, productCount: products.length };
      } else {
        recordTest('Product SEO check', 'FAIL', 'No products found');
        return { success: false };
      }
    } else {
      recordTest('Get products for SEO', 'FAIL', 'Could not retrieve products');
      return { success: false };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    recordTest('Product SEO test', 'FAIL', errorMsg);
    return { success: false, error: errorMsg };
  }
}

async function generateSEOReport(auditResult, optimizeResult) {
  logSection('📄 SEO REPORT GENERATION');
  
  const report = {
    timestamp: new Date().toISOString(),
    site: 'shesallthatandmore.com',
    instanceId: INSTANCE_ID,
    audit: auditResult.success ? auditResult.audit : null,
    optimization: optimizeResult.success ? optimizeResult.result : null,
    summary: {
      totalTests: results.summary.total,
      passed: results.summary.passed,
      failed: results.summary.failed,
      successRate: Math.round((results.summary.passed / results.summary.total) * 100)
    }
  };
  
  const filename = `seo-report-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(report, null, 2));
  
  log(`✅ SEO Report saved: ${filename}`, 'green');
  log(`   Total Tests: ${report.summary.totalTests}`, 'blue');
  log(`   Success Rate: ${report.summary.successRate}%`, report.summary.successRate > 80 ? 'green' : 'yellow');
  
  return report;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🎯 COMPREHENSIVE WIX SEO TESTING', 'cyan');
  log('='.repeat(80), 'cyan');
  log(`\n📍 Testing: ${BASE_URL}`, 'blue');
  log(`🏢 Site: shesallthatandmore.com`, 'blue');
  log(`⏰ Started: ${new Date().toLocaleString()}\n`, 'blue');
  
  try {
    // Step 1: Test connection
    const connected = await testWixConnection();
    if (!connected) {
      log('\n❌ Cannot proceed without Wix connection. Please complete OAuth:', 'red');
      log(`   ${BASE_URL}/api/auth/wix\n`, 'yellow');
      process.exit(1);
    }
    
    // Step 2: Test SEO Audit
    const auditResult = await testSEOAudit();
    
    // Step 3: Test Product SEO
    await testProductSEO();
    
    // Step 4: Test Auto-Optimize
    const optimizeResult = await testAutoOptimizeSEO();
    
    // Step 5: Test Site-wide SEO Update
    await testSiteSEOUpdate();
    
    // Generate Report
    await generateSEOReport(auditResult, optimizeResult);
    
    // Final Summary
    logSection('📊 FINAL TEST SUMMARY');
    log(`Total Tests: ${results.summary.total}`, 'blue');
    log(`✅ Passed: ${results.summary.passed}`, 'green');
    log(`❌ Failed: ${results.summary.failed}`, 'red');
    
    const successRate = Math.round((results.summary.passed / results.summary.total) * 100);
    log(`\nSuccess Rate: ${successRate}%`, successRate > 80 ? 'green' : 'yellow');
    
    // Save detailed results
    fs.writeFileSync('wix-seo-test-results.json', JSON.stringify(results, null, 2));
    log(`\n📄 Detailed results saved to: wix-seo-test-results.json`, 'blue');
    
    // Next steps
    logSection('🎯 NEXT STEPS');
    
    if (results.summary.failed === 0) {
      log('🎉 All tests passed! Your Wix SEO automation is working perfectly!', 'green');
      log('\nYou can now:', 'cyan');
      log('  ✅ Use the SEO Manager for client sites', 'green');
      log('  ✅ Run automated SEO audits', 'green');
      log('  ✅ Auto-optimize SEO for products', 'green');
      log('  ✅ Manage site-wide SEO settings', 'green');
    } else {
      log('⚠️  Some tests failed. Review the errors above.', 'yellow');
      log('\nCommon issues:', 'cyan');
      log('  - OAuth token expired: Reconnect at /api/auth/wix', 'yellow');
      log('  - Permission issues: Check Wix app permissions', 'yellow');
      log('  - API errors: Check Vercel logs for details', 'yellow');
      log(`\nReconnect: ${BASE_URL}/api/auth/wix`, 'blue');
    }
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

