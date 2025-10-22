// Test the actual contact form submission
const http = require("http");

// Simulate a real form submission with all the fields
const formData = {
  name: "John Smith",
  email: "john.smith@example.com",
  phone: "412-555-1234",
  company: "Smith Construction",
  website: "www.smithconstruction.com",
  industry: "Construction",
  services: ["Web Design", "SEO Services"],
  budget: "5000-10000",
  timeline: "3-months",
  message:
    "We need a new website and SEO services for our construction business. We're looking to expand our online presence and get more leads.",
  additionalInfo:
    "We have 20 employees and have been in business for 15 years.",
  contactMethod: "phone",
  source: "Contact Form",
  date: new Date().toISOString().split("T")[0],
  status: "New",
};

console.log("Testing real contact form submission...");
console.log("Form data:", formData);

const postData = JSON.stringify(formData);

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
  console.log(`\nServer Response Status: ${res.statusCode}`);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Server Response:", data);

    if (res.statusCode === 200) {
      console.log("\n✅ Form submission successful!");
      console.log(
        "📧 Email should be sent to roy.turner@tnrbusinesssolutions.com"
      );
      console.log("📊 Lead should be created in CRM");

      // Now check if we can access the admin dashboard
      console.log("\n🔍 Checking admin dashboard...");
      const adminReq = http.request(
        {
          hostname: "localhost",
          port: 5000,
          path: "/admin-dashboard.html",
          method: "GET",
        },
        (adminRes) => {
          console.log(`Admin dashboard status: ${adminRes.statusCode}`);
          if (adminRes.statusCode === 200) {
            console.log("✅ Admin dashboard accessible");
            console.log(
              "📋 Check http://localhost:5000/admin-dashboard.html to see the lead"
            );
          }
        }
      );
      adminReq.end();
    } else {
      console.log("\n❌ Form submission failed");
    }
  });
});

req.on("error", (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.write(postData);
req.end();
