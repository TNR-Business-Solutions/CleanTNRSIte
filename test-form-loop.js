// Automated Form Submission Test Loop
// This script runs tests repeatedly until all issues are resolved

const { runTests } = require('./test-form-submission');

const MAX_ITERATIONS = 10;
const DELAY_BETWEEN_TESTS = 2000; // 2 seconds

let iteration = 0;
let allTestsPassed = false;

async function runTestLoop() {
  console.log('\n🔄 Starting Automated Form Submission Test Loop...');
  console.log(`   Maximum iterations: ${MAX_ITERATIONS}`);
  console.log(`   Delay between tests: ${DELAY_BETWEEN_TESTS}ms\n`);
  
  while (iteration < MAX_ITERATIONS && !allTestsPassed) {
    iteration++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Iteration ${iteration} of ${MAX_ITERATIONS}`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
      const result = await runTests();
      
      if (result.success) {
        allTestsPassed = true;
        console.log('\n✅ All tests passed! Form submission is working correctly.');
        console.log('   Exiting test loop...\n');
        break;
      } else {
        console.log(`\n⚠️  Iteration ${iteration} failed. Waiting ${DELAY_BETWEEN_TESTS}ms before retry...`);
        
        if (iteration < MAX_ITERATIONS) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_TESTS));
        } else {
          console.log('\n❌ Maximum iterations reached. Some tests are still failing.');
          console.log('   Please review the errors above and fix the issues manually.\n');
        }
      }
    } catch (error) {
      console.error(`\n❌ Test iteration ${iteration} crashed:`, error.message);
      
      if (iteration < MAX_ITERATIONS) {
        console.log(`   Waiting ${DELAY_BETWEEN_TESTS}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_TESTS));
      } else {
        console.log('\n❌ Maximum iterations reached. Test suite crashed.');
        process.exit(1);
      }
    }
  }
  
  if (allTestsPassed) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run the test loop
if (require.main === module) {
  runTestLoop().catch(error => {
    console.error('Fatal error in test loop:', error);
    process.exit(1);
  });
}

module.exports = { runTestLoop };

