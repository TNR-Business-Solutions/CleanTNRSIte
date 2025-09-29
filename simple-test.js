const http = require("http");

// Simple test with just one form
const testData = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  phone: "412-555-1234",
  message: "Simple test message",
};

const postData = JSON.stringify(testData);

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

console.log("🧪 Testing simple contact form...");
console.log("Data:", postData);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);

  let responseData = "";
  res.on("data", (chunk) => {
    responseData += chunk;
  });

  res.on("end", () => {
    console.log("Response:", responseData);
  });
});

req.on("error", (err) => {
  console.log("Error:", err.message);
});

req.write(postData);
req.end();
