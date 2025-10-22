// TNR Business Solutions Email Service
// This service handles sending emails for form submissions

class TNREmailService {
  constructor() {
    this.businessEmail = "roy.turner@tnrbusinesssolutions.com";
    this.businessPhone = "412-499-2987";
    this.businessAddress = "418 Concord Avenue, Greensburg, PA 15601";
  }

  async sendContactFormEmail(formData) {
    try {
      // Format the email data
      const emailData = {
        service_id: this.serviceId,
        template_id: this.templateId,
        user_id: this.publicKey,
        template_params: {
          from_name: formData.name || "Unknown",
          from_email: formData.email || "No email provided",
          phone: formData.phone || "No phone provided",
          company: formData.company || "No company provided",
          website: formData.website || "No website provided",
          industry: formData.industry || "Not specified",
          services: Array.isArray(formData.services)
            ? formData.services.join(", ")
            : formData.services || "Not specified",
          message: formData.message || "No message provided",
          to_email: "roy.turner@tnrbusinesssolutions.com",
          subject: `New Contact Form Submission from ${
            formData.name || "Unknown"
          }`,
          reply_to: formData.email || "roy.turner@tnrbusinesssolutions.com",
        },
      };

      // Send email using EmailJS
      const response = await fetch(this.emailEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        // Email sent successfully
        return { success: true, message: "Email sent successfully" };
      } else {
        // Email sending failed
        return { success: false, message: "Failed to send email" };
      }
    } catch (error) {
      // Email service error occurred
      return {
        success: false,
        message: "Email service error: " + error.message,
      };
    }
  }

  // Fallback method using a simple email service
  async sendEmailFallback(formData) {
    try {
      // Create email content
      const emailContent = this.formatEmailContent(formData);

      // For now, we'll use a simple mailto link as fallback
      const subject = encodeURIComponent(
        `New Contact Form Submission from ${formData.name || "Unknown"}`
      );
      const body = encodeURIComponent(emailContent);
      const mailtoLink = `mailto:roy.turner@tnrbusinesssolutions.com?subject=${subject}&body=${body}`;

      // Open email client
      window.open(mailtoLink);

      return { success: true, message: "Email client opened" };
    } catch (error) {
      // Email fallback error occurred
      return {
        success: false,
        message: "Email fallback error: " + error.message,
      };
    }
  }

  formatEmailContent(formData) {
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

Message:
${formData.message || "No message provided"}

---
This email was sent from the TNR Business Solutions contact form.
Time: ${new Date().toLocaleString()}
        `.trim();
  }

  // Method to send email using a webhook service (like Zapier, IFTTT, or custom endpoint)
  async sendWebhookEmail(formData) {
    try {
      const webhookData = {
        to: "roy.turner@tnrbusinesssolutions.com",
        subject: `New Contact Form Submission from ${
          formData.name || "Unknown"
        }`,
        content: this.formatEmailContent(formData),
        formData: formData,
        timestamp: new Date().toISOString(),
      };

      // This would be your actual webhook URL
      const webhookUrl =
        "https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/";

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        // Webhook email sent successfully
        return { success: true, message: "Email sent via webhook" };
      } else {
        // Webhook email failed
        return { success: false, message: "Webhook email failed" };
      }
    } catch (error) {
      // Webhook email error occurred
      return {
        success: false,
        message: "Webhook email error: " + error.message,
      };
    }
  }

  // Main method to send email (tries multiple methods)
  async sendEmail(formData) {
    // Try EmailJS first
    let result = await this.sendEmailFallback(formData);

    if (result.success) {
      return result;
    }

    // If EmailJS fails, try webhook
    result = await this.sendWebhookEmail(formData);

    if (result.success) {
      return result;
    }

    // If all else fails, use fallback
    return await this.sendEmailFallback(formData);
  }
}

// Initialize email service
window.tnrEmailService = new TNREmailService();
