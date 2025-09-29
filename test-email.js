const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("🔧 Testing email configuration...");
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "***hidden***" : "NOT SET");
console.log("BUSINESS_EMAIL:", process.env.BUSINESS_EMAIL);

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test email sending
async function testEmail() {
  try {
    console.log("\n📧 Sending test email...");

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.BUSINESS_EMAIL,
      subject: "TNR Business Solutions - Email Test",
      text: "This is a test email to verify the email configuration is working correctly.",
      html: "<h2>Email Test Successful!</h2><p>This is a test email to verify the email configuration is working correctly.</p>",
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    console.log("Message ID:", result.messageId);
    console.log("📧 Check your email at:", process.env.BUSINESS_EMAIL);
  } catch (error) {
    console.log("❌ Email sending failed:");
    console.log("Error:", error.message);

    if (error.code === "EAUTH") {
      console.log("\n🔑 Authentication failed. Please check:");
      console.log("1. Gmail app password is correct");
      console.log("2. 2-Factor Authentication is enabled");
      console.log("3. App password was generated correctly");
    } else if (error.code === "ECONNECTION") {
      console.log("\n🌐 Connection failed. Please check:");
      console.log("1. Internet connection");
      console.log("2. Gmail SMTP settings");
    }
  }
}

testEmail();
