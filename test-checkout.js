const http = require("http");

// Test checkout functionality
async function testCheckout() {
  console.log("🧪 Testing Checkout Functionality...");

  // Test data
  const testCart = [
    {
      id: "basic-website",
      name: "Basic Website Package",
      price: 300,
      quantity: 1,
    },
    {
      id: "seo-optimization",
      name: "SEO Optimization",
      price: 200,
      quantity: 2,
    },
  ];

  const customerInfo = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "412-555-1234",
    company: "Test Company LLC",
    address: "123 Main Street",
    city: "Greensburg",
    state: "PA",
    zip: "15601",
    country: "United States",
    projectTimeline: "asap",
    specialRequests: "This is a test order for checkout functionality testing.",
  };

  const paymentInfo = {
    method: "credit-card",
  };

  const checkoutData = {
    sessionId: "test_session_" + Date.now(),
    customerInfo: customerInfo,
    paymentInfo: paymentInfo,
    cart: testCart,
  };

  try {
    console.log("📦 Test Cart:");
    testCart.forEach((item) => {
      console.log(
        `  - ${item.name}: $${item.price} x ${item.quantity} = $${(
          item.price * item.quantity
        ).toFixed(2)}`
      );
    });

    const total = testCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    console.log(`  Total: $${total.toFixed(2)}`);

    console.log("\n👤 Customer Info:");
    console.log(`  Name: ${customerInfo.firstName} ${customerInfo.lastName}`);
    console.log(`  Email: ${customerInfo.email}`);
    console.log(`  Phone: ${customerInfo.phone}`);
    console.log(`  Company: ${customerInfo.company}`);

    console.log("\n💳 Payment Method:", paymentInfo.method);

    console.log("\n🚀 Processing checkout...");

    const response = await makeRequest("/checkout", checkoutData);

    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);

      if (result.success) {
        console.log("✅ Checkout successful!");
        console.log(`📧 Order Number: ${result.orderNumber}`);
        console.log(`📨 Confirmation email sent to: ${customerInfo.email}`);
        console.log(
          `📨 Business notification sent to: roy.turner@tnrbusinesssolutions.com`
        );

        console.log("\n📋 Order Details:");
        console.log(`  Status: ${result.order.status}`);
        console.log(`  Payment Method: ${result.order.paymentMethod}`);
        console.log(`  Created: ${result.order.createdAt}`);
        console.log(`  Total: $${result.order.total.toFixed(2)}`);

        console.log("\n🎉 Checkout test completed successfully!");
        console.log(
          "📧 Please check both email addresses for confirmation emails."
        );
      } else {
        console.log("❌ Checkout failed:", result.message);
      }
    } else {
      console.log("❌ Server error:", response.statusCode);
      console.log("Response:", response.data);
    }
  } catch (error) {
    console.log("❌ Test error:", error.message);
  }
}

// Helper function to make HTTP requests
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

// Run the test
testCheckout();
