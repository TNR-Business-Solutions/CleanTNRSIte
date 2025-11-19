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

// Process form submission and send email
async function processFormSubmission(formData, res) {
  try {
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
            if (key.includes('FileSize') || key.includes('FileType') || key.includes('FileBase64')) {
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
      const attachedFiles = [];
      if (formData.resumeFileBase64 && formData.resumeFileName) {
        attachedFiles.push(`<li><strong>✅ Resume:</strong> ${formData.resumeFileName}${formData.resumeFileSize ? ` (${(formData.resumeFileSize / 1024).toFixed(2)} KB) - ATTACHED TO EMAIL` : ' - ATTACHED TO EMAIL'}</li>`);
      } else if (formData.resumeFileName) {
        attachedFiles.push(`<li><strong>⚠️ Resume:</strong> ${formData.resumeFileName} - File upload failed</li>`);
      }
      if (formData.coverLetterFileBase64 && formData.coverLetterFileName) {
        attachedFiles.push(`<li><strong>✅ Cover Letter:</strong> ${formData.coverLetterFileName}${formData.coverLetterFileSize ? ` (${(formData.coverLetterFileSize / 1024).toFixed(2)} KB) - ATTACHED TO EMAIL` : ' - ATTACHED TO EMAIL'}</li>`);
      } else if (formData.coverLetterFileName) {
        attachedFiles.push(`<li><strong>⚠️ Cover Letter:</strong> ${formData.coverLetterFileName} - File upload failed</li>`);
      }
      
      if (attachedFiles.length > 0) {
        emailHtml += `
          <hr>
          <h4>File Attachments (Attached to this email):</h4>
          <ul>
            ${attachedFiles.join('')}
          </ul>
          <p><em>✅ These files are attached to this email and can be downloaded directly.</em></p>
        `;
      }
    }

    emailHtml += `
      <hr>
      <p><small>This email was sent from the TNR Business Solutions ${isCareerApplication ? 'career application' : 'contact'} form.</small></p>
      <p><small>Submission Time: ${new Date().toLocaleString()}</small></p>
    `;

    // Prepare email attachments
    const attachments = [];
    
    // Add resume as attachment if present
    if (formData.resumeFileBase64 && formData.resumeFileName) {
      try {
        attachments.push({
          filename: formData.resumeFileName,
          content: Buffer.from(formData.resumeFileBase64, 'base64'),
          contentType: formData.resumeFileType || 'application/pdf',
        });
        console.log("✅ Resume attached:", formData.resumeFileName);
      } catch (error) {
        console.error("❌ Error attaching resume:", error);
      }
    }

    // Add cover letter as attachment if present
    if (formData.coverLetterFileBase64 && formData.coverLetterFileName) {
      try {
        attachments.push({
          filename: formData.coverLetterFileName,
          content: Buffer.from(formData.coverLetterFileBase64, 'base64'),
          contentType: formData.coverLetterFileType || 'application/pdf',
        });
        console.log("✅ Cover letter attached:", formData.coverLetterFileName);
      } catch (error) {
        console.error("❌ Error attaching cover letter:", error);
      }
    }

    // Send email
    const businessEmail =
      process.env.BUSINESS_EMAIL || "roy.turner@tnrbusinesssolutions.com";
    const mailOptions = {
      from: `"TNR Business Solutions Contact Form" <${businessEmail}>`,
      to: businessEmail,
      replyTo: formData.email,
      subject: subject,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
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
}

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
    // Handle request body - Vercel may pre-parse or we need to read stream
    let formData = {};
    
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      formData = req.body;
    } else if (typeof req.body === 'string') {
      try {
        formData = JSON.parse(req.body);
      } catch (e) {
        // Will read from stream below
      }
    }
    
    // If body not parsed, read from stream
    if (!formData || Object.keys(formData).length === 0) {
      return new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            formData = body.trim() ? JSON.parse(body) : {};
            await processFormSubmission(formData, res);
            resolve();
          } catch (parseError) {
            console.error("❌ Error parsing form data:", parseError);
            return res.status(400).json({
              success: false,
              message: "Invalid form data",
              error: parseError.message,
            });
          }
        });
        req.on('error', (error) => {
          console.error("❌ Request stream error:", error);
          return res.status(500).json({
            success: false,
            message: "Request error",
            error: error.message,
          });
        });
      });
    }
    
    // Process the form submission
    await processFormSubmission(formData, res);
    
  } catch (error) {
    console.error("❌ Error in submit-form handler:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process form submission",
      error: error.message,
    });
  }
};
