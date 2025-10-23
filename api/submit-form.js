// Vercel Serverless Function for Form Submissions
const nodemailer = require("nodemailer");

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "roy.turner@tnrbusinesssolutions.com",
    pass: process.env.SMTP_PASS,
  },
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const formData = req.body;

    console.log("📥 Serverless function received form data:", formData);

    // Format email content with ALL form data
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <h3>TNR Business Solutions Website</h3>
      
      <h4>Form Details:</h4>
      <ul>
        ${Object.entries(formData)
          .filter(([key, value]) => value && value !== "" && value !== "Not provided" && value !== "Not specified")
          .map(([key, value]) => {
            const displayKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .replace(/\b\w/g, l => l.toUpperCase());
            
            if (Array.isArray(value)) {
              return `<li><strong>${displayKey}:</strong> ${value.join(", ")}</li>`;
            } else if (typeof value === 'object') {
              return `<li><strong>${displayKey}:</strong> ${JSON.stringify(value)}</li>`;
            } else {
              return `<li><strong>${displayKey}:</strong> ${value}</li>`;
            }
          })
          .join('')}
      </ul>
      
      <hr>
      <p><small>This email was sent from the TNR Business Solutions contact form (Updated Template).</small></p>
      <p><small>Submission Time: ${new Date().toLocaleString()}</small></p>
      <p><small>Server Time: ${new Date().toLocaleString()}</small></p>
    `;

    // Send email
    const businessEmail =
      process.env.BUSINESS_EMAIL || "roy.turner@tnrbusinesssolutions.com";
    const mailOptions = {
      from: `"TNR Business Solutions Contact Form" <${businessEmail}>`,
      to: businessEmail,
      replyTo: formData.email,
      subject: `New Contact Form Submission from ${formData.name}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("📧 Email sent successfully:", info.messageId);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Form submitted successfully",
      emailSent: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("❌ Error processing form:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process form submission",
      error: error.message,
    });
  }
};
