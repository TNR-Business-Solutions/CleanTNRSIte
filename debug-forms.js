const http = require("http");

// Test the specific failing forms with detailed logging
async function testSpecificForm(formName, data) {
  console.log(`\n🔍 Debugging ${formName} form...`);
  console.log("Data being sent:", JSON.stringify(data, null, 2));

  try {
    const postData = JSON.stringify(data);

    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/submit-form",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);

      let responseData = "";
      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        console.log("Response:", responseData);
        try {
          const result = JSON.parse(responseData);
          console.log("Parsed Result:", result);
        } catch (e) {
          console.log("Could not parse response as JSON");
        }
      });
    });

    req.on("error", (err) => {
      console.log("Request Error:", err.message);
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.log("Test Error:", error.message);
  }
}

// Test data for failing forms
const contactData = {
  firstName: "John",
  lastName: "Smith",
  email: "test@example.com",
  phone: "412-555-1234",
  businessName: "Test Business",
  serviceInterest: ["Digital Marketing", "Insurance Services"],
  message: "This is a test contact form submission from automated testing.",
};

const businessInsuranceData = {
  businessName: "Test Business LLC",
  businessType: "Retail",
  firstName: "Alice",
  lastName: "Wilson",
  email: "test@example.com",
  phone: "412-555-1234",
  employees: "5-10",
  annualRevenue: "500000",
  currentInsurance: "Yes",
  coverageNeeded: ["General Liability", "Property Insurance"],
};

const packagesData = {
  firstName: "Diana",
  lastName: "Prince",
  email: "test@example.com",
  phone: "412-555-1234",
  city: "Greensburg",
  state: "PA",
  zip: "15601",
  insuranceTypes: ["auto", "home", "business"],
  additionalInfo: "This is a test insurance inquiry from automated testing.",
};

// Test the failing forms
async function runDebugTests() {
  console.log("🔍 Debugging failing forms...");

  await testSpecificForm("Contact", contactData);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

  await testSpecificForm("Business Insurance", businessInsuranceData);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

  await testSpecificForm("Packages Insurance", packagesData);
}

runDebugTests().catch(console.error);
