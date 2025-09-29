const http = require("http");

// Test configuration
const BASE_URL = "http://localhost:5000";
const TEST_EMAIL = "test@example.com";
const TEST_PHONE = "412-555-1234";

// Test data for different forms
const testData = {
  contact: {
    firstName: "John",
    lastName: "Smith",
    email: TEST_EMAIL,
    phone: TEST_PHONE,
    businessName: "Test Business",
    serviceInterest: ["Digital Marketing", "Insurance Services"],
    message: "This is a test contact form submission from automated testing.",
  },
  autoInsurance: {
    firstName: "Jane",
    lastName: "Doe",
    email: TEST_EMAIL,
    phone: TEST_PHONE,
    vehicleYear: "2020",
    vehicleMake: "Toyota",
    vehicleModel: "Camry",
    coverageType: "Full Coverage",
    currentInsurance: "Yes",
    claimsHistory: "No",
    additionalDrivers: "No",
  },
  homeInsurance: {
    firstName: "Bob",
    lastName: "Johnson",
    email: TEST_EMAIL,
    phone: TEST_PHONE,
    propertyType: "Single Family Home",
    propertyValue: "250000",
    yearBuilt: "2010",
    squareFootage: "2000",
    currentInsurance: "Yes",
    claimsHistory: "No",
    securityFeatures: "Alarm System",
  },
  businessInsurance: {
    businessName: "Test Business LLC",
    businessType: "Retail",
    firstName: "Alice",
    lastName: "Wilson",
    email: TEST_EMAIL,
    phone: TEST_PHONE,
    employees: "5-10",
    annualRevenue: "500000",
    currentInsurance: "Yes",
    coverageNeeded: ["General Liability", "Property Insurance"],
  },
  lifeInsurance: {
    firstName: "Charlie",
    lastName: "Brown",
    email: TEST_EMAIL,
    phone: TEST_PHONE,
    age: "35",
    coverageAmount: "500000",
    coverageType: "Term Life",
    healthStatus: "Good",
    smoker: "No",
    occupation: "Office Worker",
  },
  packagesInsurance: {
    firstName: "Diana",
    lastName: "Prince",
    email: TEST_EMAIL,
    phone: TEST_PHONE,
    city: "Greensburg",
    state: "PA",
    zip: "15601",
    insuranceTypes: ["auto", "home", "business"],
    additionalInfo: "This is a test insurance inquiry from automated testing.",
  },
};

// Function to make HTTP requests
function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          data: responseData,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Function to test a specific form
async function testForm(formName, data) {
  console.log(`\n🧪 Testing ${formName} form...`);
  console.log(`📧 Test email: ${data.email}`);

  try {
    const response = await makeRequest("/submit-form", data);

    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      if (result.success) {
        console.log(`✅ ${formName} form submitted successfully!`);
        console.log(
          `📨 Email should be sent to: roy.turner@tnrbusinesssolutions.com`
        );
        return true;
      } else {
        console.log(`❌ ${formName} form failed: ${result.message}`);
        return false;
      }
    } else {
      console.log(
        `❌ ${formName} form failed with status: ${response.statusCode}`
      );
      console.log(`Response: ${response.data}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${formName} form error: ${error.message}`);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log("🚀 Starting comprehensive form testing...");
  console.log(
    "📧 All test emails will be sent to: roy.turner@tnrbusinesssolutions.com"
  );
  console.log("⏰ Please check your email for test submissions\n");

  const results = {};

  // Test each form
  results.contact = await testForm("Contact", testData.contact);
  results.autoInsurance = await testForm(
    "Auto Insurance",
    testData.autoInsurance
  );
  results.homeInsurance = await testForm(
    "Home Insurance",
    testData.homeInsurance
  );
  results.businessInsurance = await testForm(
    "Business Insurance",
    testData.businessInsurance
  );
  results.lifeInsurance = await testForm(
    "Life Insurance",
    testData.lifeInsurance
  );
  results.packagesInsurance = await testForm(
    "Packages Insurance Inquiry",
    testData.packagesInsurance
  );

  // Summary
  console.log("\n📊 TEST RESULTS SUMMARY:");
  console.log("========================");

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter((result) => result).length;

  Object.entries(results).forEach(([formName, passed]) => {
    console.log(
      `${passed ? "✅" : "❌"} ${formName}: ${passed ? "PASSED" : "FAILED"}`
    );
  });

  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All forms are working correctly!");
    console.log("📧 Please check your email for all test submissions.");
  } else {
    console.log("⚠️  Some forms failed. Please check the server logs.");
  }
}

// Run the tests
runAllTests().catch(console.error);
