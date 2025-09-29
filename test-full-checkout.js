const http = require("http");

// Test full checkout functionality with packages and a la carte items
async function testFullCheckout() {
  console.log("🧪 Testing Full Checkout Flow...");

  // Test cart with both packages and a la carte items
  const testCart = [
    {
      id: "basic-website",
      name: "Basic Website Package",
      price: 300,
      quantity: 1,
      category: "Digital Marketing",
      description:
        "Professional website with 5 pages, mobile responsive design, and basic SEO",
    },
    {
      id: "seo-optimization",
      name: "SEO Optimization",
      price: 200,
      quantity: 1,
      category: "A La Carte",
      description: "Comprehensive SEO audit and optimization for your website",
    },
    {
      id: "content-creation",
      name: "Content Creation",
      price: 100,
      quantity: 2,
      category: "A La Carte",
      description: "Professional content creation for your marketing needs",
    },
  ];

  const customerInfo = {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    phone: "412-555-9876",
    company: "Johnson Marketing LLC",
    address: "456 Business Avenue",
    city: "Greensburg",
    state: "PA",
    zip: "15601",
    country: "United States",
    projectTimeline: "1-month",
    specialRequests:
      "Need help with our new business launch. Looking for a complete digital presence.",
  };

  const paymentInfo = {
    method: "credit-card",
  };

  const checkoutData = {
    sessionId: "test_full_session_" + Date.now(),
    customerInfo: customerInfo,
    paymentInfo: paymentInfo,
    cart: testCart,
  };

  try {
    console.log("📦 Test Cart Contents:");
    console.log("====================");
    testCart.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   Category: ${item.category}`);
      console.log(
        `   Price: $${item.price} x ${item.quantity} = $${(
          item.price * item.quantity
        ).toFixed(2)}`
      );
      console.log(`   Description: ${item.description}`);
      console.log("");
    });

    const subtotal = testCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    console.log("💰 Order Summary:");
    console.log("=================");
    console.log(`Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`Tax (8%): $${tax.toFixed(2)}`);
    console.log(`Total: $${total.toFixed(2)}`);
    console.log("");

    console.log("👤 Customer Information:");
    console.log("=======================");
    console.log(`Name: ${customerInfo.firstName} ${customerInfo.lastName}`);
    console.log(`Email: ${customerInfo.email}`);
    console.log(`Phone: ${customerInfo.phone}`);
    console.log(`Company: ${customerInfo.company}`);
    console.log(
      `Address: ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`
    );
    console.log(`Timeline: ${customerInfo.projectTimeline}`);
    console.log(`Special Requests: ${customerInfo.specialRequests}`);
    console.log("");

    console.log("💳 Payment Method:", paymentInfo.method);
    console.log("");

    console.log("🚀 Processing checkout...");
    console.log("=========================");

    const response = await makeRequest("/checkout", checkoutData);

    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);

      if (result.success) {
        console.log("✅ CHECKOUT SUCCESSFUL!");
        console.log("======================");
        console.log(`📧 Order Number: ${result.orderNumber}`);
        console.log(`📨 Customer Email: ${customerInfo.email}`);
        console.log(`📨 Business Email: roy.turner@tnrbusinesssolutions.com`);
        console.log("");

        console.log("📋 Order Details:");
        console.log("=================");
        console.log(`Status: ${result.order.status}`);
        console.log(`Payment Method: ${result.order.paymentMethod}`);
        console.log(
          `Order Date: ${new Date(result.order.createdAt).toLocaleString()}`
        );
        console.log(`Total Amount: $${result.order.total.toFixed(2)}`);
        console.log("");

        console.log("📦 Items Ordered:");
        result.order.items.forEach((item, index) => {
          console.log(
            `${index + 1}. ${item.name} - $${item.price.toFixed(2)} x ${
              item.quantity
            }`
          );
        });
        console.log("");

        console.log("🎉 FULL CHECKOUT TEST COMPLETED SUCCESSFULLY!");
        console.log("=============================================");
        console.log(
          "📧 Please check both email addresses for confirmation emails."
        );
        console.log(
          "📧 Customer should receive order confirmation with details."
        );
        console.log(
          "📧 Business should receive notification to contact customer."
        );
        console.log("");
        console.log("✅ All systems working correctly!");
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
testFullCheckout();
