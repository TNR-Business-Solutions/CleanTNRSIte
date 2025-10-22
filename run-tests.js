#!/usr/bin/env node

// TNR Business Solutions - Test Runner
// Simple script to run production tests

const { runAllTests } = require("./test-production-forms.js");

console.log("🧪 Starting TNR Business Solutions Production Tests...\n");

// Check if server is running
const http = require("http");

function checkServer() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/",
        method: "GET",
      },
      (res) => {
        resolve(true);
      }
    );

    req.on("error", () => {
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log("🔍 Checking if server is running on localhost:5000...");

  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ Server is not running!");
    console.log("Please start the server first:");
    console.log("  npm start");
    console.log("  or");
    console.log("  node serve-clean.js");
    process.exit(1);
  }

  console.log("✅ Server is running. Starting tests...\n");

  try {
    await runAllTests();
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
}

main();
