// Test Form Submission Flow
// This script tests the complete form submission process

const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Test data
const testFormData = {
  name: "Test User",
  email: "test@example.com",
  phone: "412-555-0123",
  company: "Test Company",
  website: "www.testcompany.com",
  industry: "Technology",
  services: ["Web Design", "SEO Services"],
  budget: "5000-10000",
  timeline: "1-month",
  message: "This is a test form submission to verify all data is being captured and saved correctly.",
  additionalInfo: "Additional test information",
  contactMethod: "email",
  source: "Contact Form",
  status: "New",
  date: new Date().toISOString().split("T")[0],
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Submit form to /submit-form endpoint
async function testFormSubmission() {
  return new Promise((resolve, reject) => {
    log('\n📝 Test 1: Submitting form to /submit-form endpoint...', 'cyan');
    
    const data = JSON.stringify(testFormData);
    
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/submit-form',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          
          if (res.statusCode === 200 && result.success) {
            log('✅ Form submitted successfully!', 'green');
            log(`   Email sent: ${result.emailSent ? 'Yes' : 'No'}`, result.emailSent ? 'green' : 'yellow');
            resolve({ success: true, result });
          } else {
            log(`❌ Form submission failed: ${result.message || 'Unknown error'}`, 'red');
            reject(new Error(result.message || 'Form submission failed'));
          }
        } catch (error) {
          log(`❌ Failed to parse response: ${error.message}`, 'red');
          log(`   Response: ${responseBody}`, 'yellow');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ Request failed: ${error.message}`, 'red');
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Test 2: Create lead via /api/crm/leads endpoint
async function testLeadCreation() {
  return new Promise((resolve, reject) => {
    log('\n📝 Test 2: Creating lead via /api/crm/leads endpoint...', 'cyan');
    
    const data = JSON.stringify(testFormData);
    
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/crm/leads',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          
          if (res.statusCode === 201 && result.success && result.data) {
            log('✅ Lead created successfully!', 'green');
            log(`   Lead ID: ${result.data.id}`, 'cyan');
            log(`   Lead Name: ${result.data.name}`, 'cyan');
            log(`   Lead Email: ${result.data.email}`, 'cyan');
            resolve({ success: true, lead: result.data });
          } else {
            log(`❌ Lead creation failed: ${result.error || 'Unknown error'}`, 'red');
            log(`   Response: ${JSON.stringify(result, null, 2)}`, 'yellow');
            reject(new Error(result.error || 'Lead creation failed'));
          }
        } catch (error) {
          log(`❌ Failed to parse response: ${error.message}`, 'red');
          log(`   Response: ${responseBody}`, 'yellow');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ Request failed: ${error.message}`, 'red');
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Test 3: Retrieve leads to verify data was saved
async function testRetrieveLeads() {
  return new Promise((resolve, reject) => {
    log('\n📝 Test 3: Retrieving leads to verify data was saved...', 'cyan');
    
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/crm/leads',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          
          if (res.statusCode === 200 && result.success && Array.isArray(result.data)) {
            log(`✅ Retrieved ${result.data.length} leads`, 'green');
            
            // Find our test lead
            const testLead = result.data.find(lead => 
              lead.email === testFormData.email || 
              lead.name === testFormData.name
            );
            
            if (testLead) {
              log('✅ Test lead found in database!', 'green');
              log(`   ID: ${testLead.id}`, 'cyan');
              log(`   Name: ${testLead.name}`, 'cyan');
              log(`   Email: ${testLead.email}`, 'cyan');
              log(`   Phone: ${testLead.phone || 'N/A'}`, 'cyan');
              log(`   Company: ${testLead.company || 'N/A'}`, 'cyan');
              
              // Verify all fields are present
              const missingFields = [];
              const fieldsToCheck = ['name', 'email', 'phone', 'company', 'website', 'industry', 'message'];
              fieldsToCheck.forEach(field => {
                if (!testLead[field] && testFormData[field]) {
                  missingFields.push(field);
                }
              });
              
              if (missingFields.length > 0) {
                log(`⚠️  Missing fields: ${missingFields.join(', ')}`, 'yellow');
              } else {
                log('✅ All form fields are present!', 'green');
              }
              
              resolve({ success: true, lead: testLead, allLeads: result.data });
            } else {
              log('⚠️  Test lead not found in retrieved leads', 'yellow');
              log(`   Looking for email: ${testFormData.email}`, 'yellow');
              log(`   Total leads: ${result.data.length}`, 'yellow');
              resolve({ success: true, lead: null, allLeads: result.data });
            }
          } else {
            log(`❌ Failed to retrieve leads: ${result.error || 'Unknown error'}`, 'red');
            reject(new Error(result.error || 'Failed to retrieve leads'));
          }
        } catch (error) {
          log(`❌ Failed to parse response: ${error.message}`, 'red');
          log(`   Response: ${responseBody}`, 'yellow');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ Request failed: ${error.message}`, 'red');
      reject(error);
    });

    req.end();
  });
}

// Test 4: Verify server is running
async function testServerHealth() {
  return new Promise((resolve, reject) => {
    log('\n📝 Test 0: Checking if server is running...', 'cyan');
    
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      log(`✅ Server is running (Status: ${res.statusCode})`, 'green');
      resolve({ success: true, statusCode: res.statusCode });
    });

    req.on('error', (error) => {
      log(`❌ Server is not running: ${error.message}`, 'red');
      log(`   Make sure to start the server with: npm start`, 'yellow');
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      log(`❌ Server request timed out`, 'red');
      reject(new Error('Server request timed out'));
    });

    req.end();
  });
}

// Main test function
async function runTests() {
  log('\n🚀 Starting Form Submission Tests...', 'blue');
  log('='.repeat(60), 'blue');
  
  const results = {
    serverHealth: false,
    formSubmission: false,
    leadCreation: false,
    dataRetrieval: false,
    allFieldsPresent: false,
  };
  
  let testLead = null;
  
  try {
    // Test 0: Check server health
    try {
      await testServerHealth();
      results.serverHealth = true;
    } catch (error) {
      log('\n❌ Server health check failed. Please start the server first.', 'red');
      process.exit(1);
    }
    
    // Test 1: Submit form
    try {
      await testFormSubmission();
      results.formSubmission = true;
    } catch (error) {
      log(`\n⚠️  Form submission test failed: ${error.message}`, 'yellow');
    }
    
    // Test 2: Create lead
    try {
      const leadResult = await testLeadCreation();
      results.leadCreation = true;
      testLead = leadResult.lead;
    } catch (error) {
      log(`\n⚠️  Lead creation test failed: ${error.message}`, 'yellow');
    }
    
    // Test 3: Retrieve leads
    try {
      const retrieveResult = await testRetrieveLeads();
      results.dataRetrieval = true;
      
      if (retrieveResult.lead) {
        results.allFieldsPresent = true;
        testLead = retrieveResult.lead;
      }
    } catch (error) {
      log(`\n⚠️  Data retrieval test failed: ${error.message}`, 'yellow');
    }
    
    // Summary
    log('\n' + '='.repeat(60), 'blue');
    log('📊 Test Results Summary:', 'blue');
    log('='.repeat(60), 'blue');
    
    const testNames = {
      serverHealth: 'Server Health',
      formSubmission: 'Form Submission',
      leadCreation: 'Lead Creation',
      dataRetrieval: 'Data Retrieval',
      allFieldsPresent: 'All Fields Present',
    };
    
    Object.keys(results).forEach(key => {
      const status = results[key] ? '✅ PASS' : '❌ FAIL';
      const color = results[key] ? 'green' : 'red';
      log(`   ${testNames[key] || key}: ${status}`, color);
    });
    
    const allPassed = Object.values(results).every(v => v);
    
    if (allPassed) {
      log('\n✅ All tests passed! Form submission is working correctly.', 'green');
    } else {
      log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
    }
    
    return { success: allPassed, results, testLead };
    
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    log(`   Stack: ${error.stack}`, 'yellow');
    return { success: false, error: error.message };
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests().then(result => {
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testFormSubmission, testLeadCreation, testRetrieveLeads };

