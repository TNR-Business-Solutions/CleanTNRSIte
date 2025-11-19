const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

// Create transporter for sending emails
const createTransporter = () => {
  // Validate required environment variables
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      "SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables."
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Format form data for email
const formatFormData = (formData) => {
  let emailBody = "";

  for (const [key, value] of Object.entries(formData)) {
    if (value !== null && value !== undefined && value !== "") {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

      if (Array.isArray(value)) {
        emailBody += `${label}: ${value.join(", ")}\n`;
      } else if (typeof value === "string" && value.trim() !== "") {
        emailBody += `${label}: ${value}\n`;
      } else if (typeof value !== "string") {
        emailBody += `${label}: ${value}\n`;
      }
    }
  }

  return emailBody;
};

// Send email notification
const sendEmail = async (formData, formType, subject) => {
  try {
    const transporter = createTransporter();
    const emailBody = formatFormData(formData);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.BUSINESS_EMAIL,
      subject: subject,
      text: `
New ${formType} Form Submission

${emailBody}

---
This email was sent from the TNR Business Solutions website contact form.
      `,
      html: `
        <h2>New ${formType} Form Submission</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          ${emailBody
            .split("\n")
            .map((line) =>
              line
                ? `<p><strong>${line.split(":")[0]}:</strong> ${line
                    .split(":")
                    .slice(1)
                    .join(":")
                    .trim()}</p>`
                : ""
            )
            .join("")}
        </div>
        <hr>
        <p><em>This email was sent from the TNR Business Solutions website contact form.</em></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    return { success: false, message: "Failed to send email", error: error.message };
  }
};

// Handle different form types
const handleFormSubmission = async (req, res) => {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const formData = JSON.parse(body);

      let formType = "Contact";
      let subject = "New Contact Form Submission";

      // Determine form type based on the data
      if (formData.insuranceTypes) {
        formType = "Insurance Inquiry";
        subject = "New Insurance Inquiry";
      } else if (formData.businessName) {
        formType = "Business Insurance Quote";
        subject = "New Business Insurance Quote Request";
      } else if (formData.vehicleYear) {
        formType = "Auto Insurance Quote";
        subject = "New Auto Insurance Quote Request";
      } else if (formData.propertyType) {
        formType = "Home Insurance Quote";
        subject = "New Home Insurance Quote Request";
      } else if (formData.coverageAmount) {
        formType = "Life Insurance Quote";
        subject = "New Life Insurance Quote Request";
      }

      const result = await sendEmail(formData, formType, subject);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ success: false, message: "Internal server error" })
    );
  }
};

module.exports = { handleFormSubmission };
