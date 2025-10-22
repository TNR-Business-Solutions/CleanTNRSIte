// TNR Business Solutions - Production Form Testing Script
// This script tests all forms and email functionality before production deployment

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Test configuration
const TEST_CONFIG = {
  baseUrl: "http://localhost:5000",
  testEmail: "test@tnrbusinesssolutions.com",
  testPhone: "412-555-0123",
  testName: "Test User",
  testCompany: "Test Company",
  testMessage: "This is a test message from the production testing script.",
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
};

// Utility function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          };
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

// Test individual form
async function testForm(formName, formData, endpoint = "/submit-form") {
  const testId = `test-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  console.log(`\n🧪 Testing ${formName}...`);

  try {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: endpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(JSON.stringify(formData)),
      },
    };

    const result = await makeRequest(options, JSON.stringify(formData));

    if (result.statusCode === 200) {
      const response = JSON.parse(result.body);
      if (response.success) {
        console.log(`✅ ${formName} - PASSED`);
        testResults.passed++;
        testResults.details.push({
          test: formName,
          status: "PASSED",
          response: response,
        });
        return true;
      } else {
        console.log(`❌ ${formName} - FAILED: ${response.message}`);
        testResults.failed++;
        testResults.details.push({
          test: formName,
          status: "FAILED",
          error: response.message,
        });
        return false;
      }
    } else {
      console.log(`❌ ${formName} - FAILED: HTTP ${result.statusCode}`);
      testResults.failed++;
      testResults.details.push({
        test: formName,
        status: "FAILED",
        error: `HTTP ${result.statusCode}`,
      });
      return false;
    }
  } catch (error) {
    console.log(`❌ ${formName} - ERROR: ${error.message}`);
    testResults.failed++;
    testResults.details.push({
      test: formName,
      status: "ERROR",
      error: error.message,
    });
    return false;
  } finally {
    testResults.total++;
  }
}

// Test contact form
async function testContactForm() {
  const formData = {
    name: TEST_CONFIG.testName,
    email: TEST_CONFIG.testEmail,
    phone: TEST_CONFIG.testPhone,
    company: TEST_CONFIG.testCompany,
    message: TEST_CONFIG.testMessage,
    source: "Contact Form",
    date: new Date().toISOString().split("T")[0],
    status: "New",
  };

  return await testForm("Contact Form", formData);
}

// Test insurance inquiry form
async function testInsuranceInquiry() {
  const formData = {
    name: TEST_CONFIG.testName,
    email: TEST_CONFIG.testEmail,
    phone: TEST_CONFIG.testPhone,
    company: TEST_CONFIG.testCompany,
    insuranceTypes: ["Auto Insurance", "Home Insurance"],
    coverageAmount: "$100,000",
    message: "I need insurance quotes for my business.",
    source: "Insurance Inquiry",
    date: new Date().toISOString().split("T")[0],
    status: "New",
  };

  return await testForm("Insurance Inquiry", formData);
}

// Test service inquiry form
async function testServiceInquiry() {
  const formData = {
    name: TEST_CONFIG.testName,
    email: TEST_CONFIG.testEmail,
    phone: TEST_CONFIG.testPhone,
    company: TEST_CONFIG.testCompany,
    services: ["Web Design", "SEO Services"],
    budget: "$5,000",
    timeline: "3 months",
    message: "I need help with my website and SEO.",
    source: "Service Inquiry",
    date: new Date().toISOString().split("T")[0],
    status: "New",
  };

  return await testForm("Service Inquiry", formData);
}

// Test quote request form
async function testQuoteRequest() {
  const formData = {
    name: TEST_CONFIG.testName,
    email: TEST_CONFIG.testEmail,
    phone: TEST_CONFIG.testPhone,
    company: TEST_CONFIG.testCompany,
    services: ["Paid Advertising", "Social Media Management"],
    budget: "$2,000",
    timeline: "1 month",
    message: "I need a quote for digital marketing services.",
    source: "Quote Request",
    date: new Date().toISOString().split("T")[0],
    status: "New",
  };

  return await testForm("Quote Request", formData);
}

// Test newsletter signup
async function testNewsletterSignup() {
  const formData = {
    name: TEST_CONFIG.testName,
    email: TEST_CONFIG.testEmail,
    message: "Newsletter signup",
    services: ["Email Marketing"],
    source: "Newsletter Signup",
    date: new Date().toISOString().split("T")[0],
    status: "New",
  };

  return await testForm("Newsletter Signup", formData);
}

// Test cart functionality
async function testCartOperations() {
  console.log("\n🛒 Testing Cart Operations...");

  try {
    // Test add to cart
    const addToCartData = {
      sessionId: "test-session-123",
      serviceId: "basic-website",
      quantity: 1,
    };

    const addResult = await testForm("Add to Cart", addToCartData, "/cart/add");

    // Test get cart
    const getCartOptions = {
      hostname: "localhost",
      port: 5000,
      path: "/cart?sessionId=test-session-123",
      method: "GET",
    };

    const getResult = await makeRequest(getCartOptions);

    if (getResult.statusCode === 200) {
      const cartData = JSON.parse(getResult.body);
      if (cartData.success && cartData.cart) {
        console.log("✅ Get Cart - PASSED");
        testResults.passed++;
      } else {
        console.log("❌ Get Cart - FAILED");
        testResults.failed++;
      }
    } else {
      console.log("❌ Get Cart - FAILED");
      testResults.failed++;
    }

    testResults.total++;
    return addResult;
  } catch (error) {
    console.log(`❌ Cart Operations - ERROR: ${error.message}`);
    testResults.failed++;
    testResults.total++;
    return false;
  }
}

// Test checkout process
async function testCheckout() {
  const checkoutData = {
    sessionId: "test-session-123",
    customerInfo: {
      firstName: TEST_CONFIG.testName.split(" ")[0],
      lastName: TEST_CONFIG.testName.split(" ")[1] || "User",
      email: TEST_CONFIG.testEmail,
      phone: TEST_CONFIG.testPhone,
      company: TEST_CONFIG.testCompany,
    },
    paymentInfo: {
      method: "Credit Card",
      cardNumber: "4111111111111111",
      expiryDate: "12/25",
      cvv: "123",
    },
    cart: [
      {
        id: "basic-website",
        name: "Basic Website Package",
        price: 300,
        quantity: 1,
      },
    ],
  };

  return await testForm("Checkout Process", checkoutData, "/checkout");
}

// Test server health
async function testServerHealth() {
  console.log("\n🏥 Testing Server Health...");

  try {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/",
      method: "GET",
    };

    const result = await makeRequest(options);

    if (result.statusCode === 200) {
      console.log("✅ Server Health - PASSED");
      testResults.passed++;
      testResults.details.push({
        test: "Server Health",
        status: "PASSED",
        response: "Server responding correctly",
      });
    } else {
      console.log(`❌ Server Health - FAILED: HTTP ${result.statusCode}`);
      testResults.failed++;
      testResults.details.push({
        test: "Server Health",
        status: "FAILED",
        error: `HTTP ${result.statusCode}`,
      });
    }
  } catch (error) {
    console.log(`❌ Server Health - ERROR: ${error.message}`);
    testResults.failed++;
    testResults.details.push({
      test: "Server Health",
      status: "ERROR",
      error: error.message,
    });
  } finally {
    testResults.total++;
  }
}

// Generate test report
function generateTestReport() {
  console.log("\n📊 TEST REPORT");
  console.log("==============");
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(
    `Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(
      1
    )}%`
  );

  if (testResults.failed > 0) {
    console.log("\n❌ FAILED TESTS:");
    testResults.details
      .filter((test) => test.status !== "PASSED")
      .forEach((test) => {
        console.log(`- ${test.test}: ${test.error || test.status}`);
      });
  }

  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.total) * 100).toFixed(1),
    },
    details: testResults.details,
  };

  fs.writeFileSync("test-report.json", JSON.stringify(reportData, null, 2));
  console.log("\n📄 Detailed report saved to test-report.json");

  return testResults.failed === 0;
}

// Main test runner
async function runAllTests() {
  console.log("🚀 TNR Business Solutions - Production Form Testing");
  console.log("==================================================");
  console.log("Testing all forms and email functionality...\n");

  // Run all tests
  await testServerHealth();
  await testContactForm();
  await testInsuranceInquiry();
  await testServiceInquiry();
  await testQuoteRequest();
  await testNewsletterSignup();
  await testCartOperations();
  await testCheckout();

  // Generate report
  const allTestsPassed = generateTestReport();

  if (allTestsPassed) {
    console.log("\n🎉 ALL TESTS PASSED! Ready for production deployment.");
    process.exit(0);
  } else {
    console.log(
      "\n⚠️  SOME TESTS FAILED! Please fix issues before deployment."
    );
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error("Test runner error:", error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testForm,
  testContactForm,
  testInsuranceInquiry,
  testServiceInquiry,
  testQuoteRequest,
  testNewsletterSignup,
  testCartOperations,
  testCheckout,
  testServerHealth,
};
