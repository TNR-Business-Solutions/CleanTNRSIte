// TNR Business Solutions Email Handler
// Server-side email handling using SMTP

const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailHandler {
  constructor() {
    // Validate required environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error(
        "SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables."
      );
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendContactFormEmail(formData) {
    try {
      const mailOptions = {
        from: `"TNR Business Solutions Contact Form" <${process.env.SMTP_USER}>`,
        to: process.env.BUSINESS_EMAIL || "roy.turner@tnrbusinesssolutions.com",
        subject: `New Contact Form Submission from ${
          formData.name || "Unknown"
        }`,
        html: this.formatEmailHTML(formData),
        text: this.formatEmailText(formData),
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  formatEmailHTML(formData) {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c5530; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #2c5530; }
        .value { margin-left: 10px; }
        .footer { background: #2c5530; color: white; padding: 15px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>TNR Business Solutions Website</p>
        </div>
        <div class="content">
            <div class="field">
                <span class="label">Name:</span>
                <span class="value">${formData.name || "Not provided"}</span>
            </div>
            <div class="field">
                <span class="label">Email:</span>
                <span class="value">${formData.email || "Not provided"}</span>
            </div>
            <div class="field">
                <span class="label">Phone:</span>
                <span class="value">${formData.phone || "Not provided"}</span>
            </div>
            <div class="field">
                <span class="label">Company:</span>
                <span class="value">${formData.company || "Not provided"}</span>
            </div>
            <div class="field">
                <span class="label">Website:</span>
                <span class="value">${formData.website || "Not provided"}</span>
            </div>
            <div class="field">
                <span class="label">Industry:</span>
                <span class="value">${
                  formData.industry || "Not specified"
                }</span>
            </div>
            <div class="field">
                <span class="label">Services of Interest:</span>
                <span class="value">${
                  Array.isArray(formData.services)
                    ? formData.services.join(", ")
                    : formData.services || "Not specified"
                }</span>
            </div>
            <div class="field">
                <span class="label">Project Budget:</span>
                <span class="value">${formData.budget || "Not specified"}</span>
            </div>
            <div class="field">
                <span class="label">Project Timeline:</span>
                <span class="value">${
                  formData.timeline || "Not specified"
                }</span>
            </div>
            <div class="field">
                <span class="label">Preferred Contact Method:</span>
                <span class="value">${
                  formData.contactMethod || "Not specified"
                }</span>
            </div>
            <div class="field">
                <span class="label">Message:</span>
                <div class="value" style="margin-top: 10px; padding: 10px; background: white; border-left: 3px solid #2c5530;">
                    ${(formData.message || "No message provided").replace(
                      /\n/g,
                      "<br>"
                    )}
                </div>
            </div>
            ${
              formData.additionalInfo
                ? `
            <div class="field">
                <span class="label">Additional Information:</span>
                <div class="value" style="margin-top: 10px; padding: 10px; background: white; border-left: 3px solid #2c5530;">
                    ${formData.additionalInfo.replace(/\n/g, "<br>")}
                </div>
            </div>
            `
                : ""
            }
        </div>
        <div class="footer">
            <p>This email was sent from the TNR Business Solutions contact form.</p>
            <p>Submission Time: ${
              formData.submissionDate || new Date().toLocaleString()
            }</p>
            <p>Server Submission Time: ${
              formData.submissionDate || new Date().toLocaleString()
            }
Server Time: ${new Date().toLocaleString()}</p>
            <p>Reply directly to this email to respond to the customer.</p>
        </div>
    </div>
</body>
</html>
        `;
  }

  formatEmailText(formData) {
    return `
New Contact Form Submission

Name: ${formData.name || "Not provided"}
Email: ${formData.email || "Not provided"}
Phone: ${formData.phone || "Not provided"}
Company: ${formData.company || "Not provided"}
Website: ${formData.website || "Not provided"}
Industry: ${formData.industry || "Not specified"}

Services of Interest:
${
  Array.isArray(formData.services)
    ? formData.services.join("\n- ")
    : formData.services || "Not specified"
}

Project Budget: ${formData.budget || "Not specified"}
Project Timeline: ${formData.timeline || "Not specified"}
Preferred Contact Method: ${formData.contactMethod || "Not specified"}

Message:
${formData.message || "No message provided"}

${
  formData.additionalInfo
    ? `
Additional Information:
${formData.additionalInfo}
`
    : ""
}

---
This email was sent from the TNR Business Solutions contact form.
Submission Time: ${formData.submissionDate || new Date().toLocaleString()}
Server Time: ${new Date().toLocaleString()}
Reply directly to this email to respond to the customer.
        `.trim();
  }
}

module.exports = EmailHandler;
