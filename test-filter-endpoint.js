// Test filtering endpoint
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testFiltering() {
  console.log('Testing lead filtering endpoint...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/crm/leads?status=New&sort=createdAt&order=desc`);
    const result = await response.json();
    
    if (response.ok && result.success !== false) {
      console.log('✅ Filter endpoint works!');
      console.log(`   Found ${result.data ? result.data.length : 0} leads with status=New`);
      return true;
    } else {
      console.log('❌ Filter endpoint failed:', result.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Filter endpoint error:', error.message);
    return false;
  }
}

testFiltering();

