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

  // Send welcome email to new client
  async sendWelcomeEmail(clientData) {
    try {
      const clientName = clientData.name || clientData.company || "Valued Client";
      const services = Array.isArray(clientData.services) 
        ? clientData.services 
        : (clientData.services ? [clientData.services] : []);

      const welcomeEmailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #2c5530 0%, #1a3a1f 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .message-box { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .services-list { background: #f0f7f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5530; }
        .services-list ul { margin: 10px 0; padding-left: 20px; }
        .services-list li { margin: 8px 0; color: #2c5530; font-weight: 500; }
        .signature { background: white; padding: 25px; border-radius: 8px; margin-top: 20px; border-top: 3px solid #2c5530; }
        .signature p { margin: 5px 0; }
        .signature .name { font-weight: bold; font-size: 16px; color: #2c5530; }
        .footer { background: #2c5530; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .cta-button { display: inline-block; background: #2c5530; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to TNR Business Solutions!</h1>
        </div>
        <div class="content">
            <div class="message-box">
                <p>Hi ${clientName.split(' ')[0]},</p>
                
                <p>I wanted to personally reach out and welcome you to TNR Business Solutions. I'm thrilled that you've chosen us to help grow your business and achieve your goals.</p>
                
                <p>As someone who's built this business from the ground up, I know how important it is to have a partner who truly understands your vision and works alongside you to make it happen. That's exactly what we're here to do.</p>
                
                <p>We're committed to providing you with exceptional service and results that make a real difference for your business. Whether it's improving your online presence, reaching more customers, or streamlining your operations, we're here to help you succeed.</p>
                
                ${services.length > 0 ? `
                <div class="services-list">
                    <p style="margin-top: 0; font-weight: bold; color: #2c5530;">Your Services with Us:</p>
                    <ul>
                        ${services.map(service => `<li>${service}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <p>Over the next few days, you can expect to hear from me or a member of my team as we begin working on your projects. We'll make sure you're kept in the loop every step of the way.</p>
                
                <p>In the meantime, if you have any questions, concerns, or ideas you'd like to discuss, please don't hesitate to reach out. I'm always just a phone call or email away.</p>
                
                <p>Thank you for trusting TNR Business Solutions with your business. I'm genuinely excited about what we're going to accomplish together.</p>
                
                <p>Best regards,</p>
            </div>
            
            <div class="signature">
                <p class="name">Roy A. Turner</p>
                <p>President</p>
                <p>TNR Business Solutions</p>
                <p>C: 412-499-2987</p>
                <p>Roy.Turner@TNRBusinessSolutions.com</p>
                <p>Www.TNRBusinessSolutions.com</p>
            </div>
        </div>
        <div class="footer">
            <p>This email was sent to ${clientData.email || 'your email address'}</p>
            <p>TNR Business Solutions | 418 Concord Avenue, Greensburg, PA 15601</p>
        </div>
    </div>
</body>
</html>
      `;

      const welcomeEmailText = `
Welcome to TNR Business Solutions!

Hi ${clientName.split(' ')[0]},

I wanted to personally reach out and welcome you to TNR Business Solutions. I'm thrilled that you've chosen us to help grow your business and achieve your goals.

As someone who's built this business from the ground up, I know how important it is to have a partner who truly understands your vision and works alongside you to make it happen. That's exactly what we're here to do.

We're committed to providing you with exceptional service and results that make a real difference for your business. Whether it's improving your online presence, reaching more customers, or streamlining your operations, we're here to help you succeed.

${services.length > 0 ? `Your Services with Us:\n${services.map(s => `- ${s}`).join('\n')}\n\n` : ''}

Over the next few days, you can expect to hear from me or a member of my team as we begin working on your projects. We'll make sure you're kept in the loop every step of the way.

In the meantime, if you have any questions, concerns, or ideas you'd like to discuss, please don't hesitate to reach out. I'm always just a phone call or email away.

Thank you for trusting TNR Business Solutions with your business. I'm genuinely excited about what we're going to accomplish together.

Best regards,

Roy A. Turner
President
TNR Business Solutions
C: 412-499-2987
Roy.Turner@TNRBusinessSolutions.com
Www.TNRBusinessSolutions.com
      `;

      // Send welcome email to client
      const clientEmailOptions = {
        from: `"Roy Turner - TNR Business Solutions" <${process.env.SMTP_USER}>`,
        to: clientData.email,
        subject: `Welcome to TNR Business Solutions - Let's Grow Your Business Together`,
        html: welcomeEmailHTML,
        text: welcomeEmailText,
      };

      await this.transporter.sendMail(clientEmailOptions);

      // Send notification email to Roy
      const notificationEmailOptions = {
        from: `"TNR Business Solutions CRM" <${process.env.SMTP_USER}>`,
        to: process.env.BUSINESS_EMAIL || "Roy.Turner@TNRBusinessSolutions.com",
        subject: `New Client Added: ${clientName}`,
        html: `
          <h2>New Client Added to CRM</h2>
          <p><strong>Client Name:</strong> ${clientName}</p>
          <p><strong>Email:</strong> ${clientData.email || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${clientData.phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${clientData.company || clientData.businessName || 'Not provided'}</p>
          <p><strong>Services:</strong> ${services.join(', ') || 'Not specified'}</p>
          <p><strong>Status:</strong> ${clientData.status || 'Active'}</p>
          <p><strong>Source:</strong> ${clientData.source || 'Manual Entry'}</p>
          ${clientData.notes ? `<p><strong>Notes:</strong> ${clientData.notes}</p>` : ''}
          <hr>
          <p><em>A welcome email has been automatically sent to the client.</em></p>
          <p><em>Client ID: ${clientData.id}</em></p>
        `,
        text: `
New Client Added to CRM

Client Name: ${clientName}
Email: ${clientData.email || 'Not provided'}
Phone: ${clientData.phone || 'Not provided'}
Company: ${clientData.company || clientData.businessName || 'Not provided'}
Services: ${services.join(', ') || 'Not specified'}
Status: ${clientData.status || 'Active'}
Source: ${clientData.source || 'Manual Entry'}
${clientData.notes ? `Notes: ${clientData.notes}` : ''}

A welcome email has been automatically sent to the client.
Client ID: ${clientData.id}
        `,
      };

      await this.transporter.sendMail(notificationEmailOptions);

      return { 
        success: true, 
        message: "Welcome email sent to client and notification sent to business email" 
      };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

module.exports = EmailHandler;
