/**
 * Comprehensive Test Runner
 * Runs all Wix automation tests in sequence
 */

const { runAllTests } = require('./wix-flowthrough-test');
const { testAllPages } = require('./lighthouse-test');

async function runComprehensiveTests() {
  console.log('🧪 WIX AUTOMATION - COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(60));
  console.log('Starting all test suites...\n');
  
  try {
    // Run flowthrough tests
    console.log('\n📋 Running Flowthrough Tests...');
    await runAllTests();
    
    // Run Lighthouse tests
    console.log('\n🚀 Running Lighthouse Performance Tests...');
    await testAllPages();
    
    console.log('\n✅ All tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runComprehensiveTests();
}

module.exports = { runComprehensiveTests };

