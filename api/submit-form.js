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

    // Determine if this is a career application
    const isCareerApplication = formData.source === "Career Application" || 
                                formData.position || 
                                formData.experience;

    // Format subject line
    let subject = `New Contact Form Submission from ${formData.name || formData.firstName || 'Unknown'}`;
    if (isCareerApplication) {
      subject = `New Career Application - ${formData.position || 'Position Not Specified'}`;
    }

    // Format email content with ALL form data
    let emailHtml = `
      <h2>${isCareerApplication ? 'New Career Application' : 'New Contact Form Submission'}</h2>
      <h3>TNR Business Solutions Website</h3>
      
      <h4>Form Details:</h4>
      <ul>
        ${Object.entries(formData)
          .filter(([key, value]) => {
            // Filter out empty values and metadata fields
            if (!value || value === "" || value === "Not provided" || value === "Not specified") return false;
            // Skip internal metadata fields
            if (['source', 'status', 'date', 'convertedToLead', 'id', 'timestamp', 'submissionDate', 'submissionDateTime'].includes(key)) return false;
            return true;
          })
          .map(([key, value]) => {
            const displayKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .replace(/\b\w/g, l => l.toUpperCase());
            
            // Special formatting for career application fields
            if (key === 'firstName' && formData.lastName) {
              return `<li><strong>Full Name:</strong> ${value} ${formData.lastName || ''}</li>`;
            }
            if (key === 'lastName' && formData.firstName) {
              return ''; // Already included in firstName line
            }
            if (key === 'currentCompany') {
              return `<li><strong>Current Company:</strong> ${value}</li>`;
            }
            if (key === 'resume' || key === 'resumeFileName') {
              const fileSize = formData.resumeFileSize ? ` (${(formData.resumeFileSize / 1024).toFixed(2)} KB)` : '';
              return `<li><strong>Resume:</strong> ${value}${fileSize}</li>`;
            }
            if (key === 'coverLetter' || key === 'coverLetterFileName') {
              const fileSize = formData.coverLetterFileSize ? ` (${(formData.coverLetterFileSize / 1024).toFixed(2)} KB)` : '';
              return `<li><strong>Cover Letter:</strong> ${value}${fileSize}</li>`;
            }
            // Skip file metadata fields (already displayed with filename)
            if (key.includes('FileSize') || key.includes('FileType')) {
              return '';
            }
            
            if (Array.isArray(value)) {
              return `<li><strong>${displayKey}:</strong> ${value.join(", ")}</li>`;
            } else if (typeof value === 'object') {
              return `<li><strong>${displayKey}:</strong> ${JSON.stringify(value)}</li>`;
            } else {
              return `<li><strong>${displayKey}:</strong> ${value}</li>`;
            }
          })
          .filter(html => html !== '') // Remove empty strings
          .join('')}
      </ul>
    `;

    // Add attachments note for career applications
    if (isCareerApplication && (formData.resumeFileName || formData.coverLetterFileName)) {
      emailHtml += `
        <hr>
        <h4>File Attachments:</h4>
        <ul>
          ${formData.resumeFileName ? `<li><strong>Resume:</strong> ${formData.resumeFileName}${formData.resumeFileSize ? ` (${(formData.resumeFileSize / 1024).toFixed(2)} KB)` : ''}</li>` : ''}
          ${formData.coverLetterFileName ? `<li><strong>Cover Letter:</strong> ${formData.coverLetterFileName}${formData.coverLetterFileSize ? ` (${(formData.coverLetterFileSize / 1024).toFixed(2)} KB)` : ''}</li>` : ''}
        </ul>
        <p><em>Note: File attachments were submitted with this application. Please check your CRM or contact the applicant directly to request the files if needed.</em></p>
      `;
    }

    emailHtml += `
      <hr>
      <p><small>This email was sent from the TNR Business Solutions ${isCareerApplication ? 'career application' : 'contact'} form.</small></p>
      <p><small>Submission Time: ${new Date().toLocaleString()}</small></p>
    `;

    // Send email
    const businessEmail =
      process.env.BUSINESS_EMAIL || "roy.turner@tnrbusinesssolutions.com";
    const mailOptions = {
      from: `"TNR Business Solutions Contact Form" <${businessEmail}>`,
      to: businessEmail,
      replyTo: formData.email,
      subject: subject,
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
