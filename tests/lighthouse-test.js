/**
 * Lighthouse Performance Testing
 * Tests page load performance, SEO, accessibility, and best practices
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

/**
 * Performance metrics thresholds
 */
const THRESHOLDS = {
  loadTime: 2000,      // 2 seconds
  timeToFirstByte: 500, // 500ms
  pageSize: 500,        // 500KB
  requests: 50          // 50 HTTP requests
};

/**
 * Test a single page
 */
async function testPage(pageName, path) {
  const results = {
    page: pageName,
    path,
    metrics: {},
    issues: [],
    score: 0
  };
  
  try {
    const startTime = performance.now();
    const response = await axios.get(`${BASE_URL}${path}`, {
      timeout: 10000,
      validateStatus: () => true
    });
    const loadTime = performance.now() - startTime;
    
    results.metrics.loadTime = loadTime;
    results.metrics.statusCode = response.status;
    results.metrics.contentLength = response.headers['content-length'] || 
                                    JSON.stringify(response.data || '').length;
    results.metrics.contentType = response.headers['content-type'];
    
    // Check if HTML
    if (response.data && typeof response.data === 'string') {
      const html = response.data;
      
      // SEO Checks
      const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(html);
      const hasMetaDescription = /<meta[^>]*name=["']description["'][^>]*>/i.test(html);
      const hasMetaViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);
      const hasH1 = /<h1[^>]*>/i.test(html);
      
      results.seo = {
        hasTitle,
        hasMetaDescription,
        hasMetaViewport,
        hasH1
      };
      
      // Performance checks
      const scriptCount = (html.match(/<script/gi) || []).length;
      const styleCount = (html.match(/<style/gi) || []).length;
      const imageCount = (html.match(/<img/gi) || []).length;
      
      results.metrics.scripts = scriptCount;
      results.metrics.styles = styleCount;
      results.metrics.images = imageCount;
      
      // Accessibility checks
      const hasAltOnImages = !html.match(/<img[^>]+(?!alt=)[^>]*>/i);
      const hasLangAttribute = /<html[^>]*lang=["'][^"']+["']/i.test(html);
      
      results.accessibility = {
        imagesHaveAlt: hasAltOnImages,
        hasLangAttribute
      };
      
      // Best practices
      const hasDoctype = /<!DOCTYPE/i.test(html);
      const hasCharset = /<meta[^>]*charset/i.test(html);
      
      results.bestPractices = {
        hasDoctype,
        hasCharset
      };
      
      // Calculate score
      let score = 100;
      if (loadTime > THRESHOLDS.loadTime) score -= 20;
      if (!hasTitle) score -= 10;
      if (!hasMetaDescription) score -= 10;
      if (!hasMetaViewport) score -= 5;
      if (!hasH1) score -= 5;
      if (scriptCount > 20) score -= 10;
      if (!hasLangAttribute) score -= 5;
      if (!hasDoctype) score -= 5;
      if (!hasCharset) score -= 5;
      
      results.score = Math.max(0, score);
    }
    
    // Check thresholds
    if (loadTime > THRESHOLDS.loadTime) {
      results.issues.push(`Load time ${loadTime.toFixed(2)}ms exceeds threshold of ${THRESHOLDS.loadTime}ms`);
    }
    
    if (results.metrics.contentLength > THRESHOLDS.pageSize * 1024) {
      results.issues.push(`Page size ${(results.metrics.contentLength / 1024).toFixed(2)}KB exceeds threshold of ${THRESHOLDS.pageSize}KB`);
    }
    
  } catch (error) {
    results.error = error.message;
    results.score = 0;
  }
  
  return results;
}

/**
 * Test all Wix manager pages
 */
async function testAllPages() {
  const pages = [
    { name: 'Wix Client Dashboard', path: '/wix-client-dashboard.html' },
    { name: 'Wix SEO Manager', path: '/wix-seo-manager.html' },
    { name: 'Wix E-commerce Manager', path: '/wix-ecommerce-manager.html' }
  ];
  
  console.log('🚀 LIGHTHOUSE PERFORMANCE TESTS\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const page of pages) {
    console.log(`\nTesting: ${page.name}...`);
    const result = await testPage(page.name, page.path);
    results.push(result);
    
    // Print results
    console.log(`  Load Time: ${result.metrics.loadTime?.toFixed(2) || 'N/A'}ms`);
    console.log(`  Status: ${result.metrics.statusCode || 'Error'}`);
    console.log(`  Score: ${result.score}/100`);
    
    if (result.seo) {
      console.log(`  SEO: Title=${result.seo.hasTitle ? '✅' : '❌'} Description=${result.seo.hasMetaDescription ? '✅' : '❌'} Viewport=${result.seo.hasMetaViewport ? '✅' : '❌'}`);
    }
    
    if (result.issues.length > 0) {
      console.log(`  Issues:`);
      result.issues.forEach(issue => console.log(`    - ${issue}`));
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const avgLoadTime = results.reduce((sum, r) => sum + (r.metrics.loadTime || 0), 0) / results.length;
  
  console.log(`Average Score: ${avgScore.toFixed(1)}/100`);
  console.log(`Average Load Time: ${avgLoadTime.toFixed(2)}ms`);
  console.log(`Pages Tested: ${results.length}`);
  
  return results;
}

// Run if executed directly
if (require.main === module) {
  testAllPages().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('❌ Test error:', error);
    process.exit(1);
  });
}

module.exports = { testPage, testAllPages };

