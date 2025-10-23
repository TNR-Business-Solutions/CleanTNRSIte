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

    // Format email content
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <h3>TNR Business Solutions Website</h3>
      
      <p><strong>Name:</strong> ${formData.name || "Not provided"}</p>
      <p><strong>Email:</strong> ${formData.email || "Not provided"}</p>
      <p><strong>Phone:</strong> ${formData.phone || "Not provided"}</p>
      <p><strong>Company:</strong> ${formData.company || "Not provided"}</p>
      <p><strong>Website:</strong> ${formData.website || "Not provided"}</p>
      <p><strong>Industry:</strong> ${formData.industry || "Not specified"}</p>
      
      <p><strong>Services of Interest:</strong> ${
        Array.isArray(formData.services)
          ? formData.services.join(", ")
          : formData.services || "Not specified"
      }</p>
      <p><strong>Project Budget:</strong> ${
        formData.budget || "Not specified"
      }</p>
      <p><strong>Project Timeline:</strong> ${
        formData.timeline || "Not specified"
      }</p>
      <p><strong>Preferred Contact Method:</strong> ${
        formData.contactMethod || "Not specified"
      }</p>
      
      ${
        formData.insuranceType
          ? `<p><strong>Insurance Type:</strong> ${formData.insuranceType}</p>`
          : ""
      }
      ${
        formData.coverageNeeds
          ? `<p><strong>Coverage Needs:</strong> ${formData.coverageNeeds}</p>`
          : ""
      }
      ${
        formData.currentInsurance
          ? `<p><strong>Current Insurance:</strong> ${formData.currentInsurance}</p>`
          : ""
      }
      
      ${
        formData.position
          ? `<p><strong>Position:</strong> ${formData.position}</p>`
          : ""
      }
      
      <p><strong>Message:</strong><br>${formData.message || "No message"}</p>
      ${
        formData.additionalInfo
          ? `<p><strong>Additional Information:</strong><br>${formData.additionalInfo}</p>`
          : ""
      }
      
      <hr>
      <p><small>This email was sent from the TNR Business Solutions contact form.</small></p>
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
