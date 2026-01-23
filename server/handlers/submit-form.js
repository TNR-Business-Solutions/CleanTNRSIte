// Vercel Serverless Function for Form Submissions
const nodemailer = require("nodemailer");
const { setCorsHeaders, handleCorsPreflight } = require("./cors-utils");
const { rateLimiter } = require("./rate-limiter");
const { sendJson } = require("./http-utils");
const TNRDatabase = require("../../database");

// Initialize database instance
let dbInstance = null;
async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new TNRDatabase();
    await dbInstance.initialize();
  }
  return dbInstance;
}

// Apply rate limiting to form submissions
const formRateLimiter = rateLimiter('forms');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "Roy.Turner@tnrbusinesssolutions.com",
    pass: process.env.SMTP_PASS,
  },
});

// Process form submission and send email
async function processFormSubmission(formData, res) {
  let leadCreated = false;
  let leadId = null;
  
  try {
    console.log("📥 Serverless function received form data:", formData);
    
    // Create lead in database (before sending email)
    try {
      const db = await getDatabase();
      const leadData = {
        name: formData.name || formData.firstName || "Unknown",
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        email: formData.email || null,
        phone: formData.phone || null,
        company: formData.company || formData.businessName || null,
        website: formData.website || null,
        industry: formData.industry || null,
        services: Array.isArray(formData.services) ? formData.services : (formData.services ? [formData.services] : []),
        budget: formData.budget || null,
        timeline: formData.timeline || null,
        message: formData.message || formData.description || null,
        additionalInfo: formData.additionalInfo || null,
        contactMethod: formData.contactMethod || formData.preferredContact || null,
        source: formData.source || "Website Form",
        status: "New",
        address: formData.address || formData.businessAddress || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        businessType: formData.businessType || null,
        businessName: formData.businessName || formData.company || null,
        businessAddress: formData.businessAddress || formData.address || null,
        interest: formData.interest || null,
        notes: formData.notes || null,
      };
      
      const lead = await db.addLead(leadData);
      leadCreated = true;
      leadId = lead.id;
      console.log("✅ Lead created in database:", lead.id, "-", lead.name || lead.email);
    } catch (dbError) {
      console.error("❌ Error creating lead in database:", dbError.message);
      console.error("❌ Database error stack:", dbError.stack);
      // Don't fail the whole request if database fails - still send email
    }

    // Normalize email and name fields - handle arrays by taking first value
    if (Array.isArray(formData.email)) {
      formData.email = formData.email[0] || "";
    }
    if (Array.isArray(formData.name)) {
      formData.name = formData.name[0] || "";
    }

    // Determine if this is a career application
    const isCareerApplication =
      formData.source === "Career Application" ||
      formData.position ||
      formData.experience;

    // Format subject line
    let subject = `New Contact Form Submission from ${
      formData.name || formData.firstName || "Unknown"
    }`;
    if (isCareerApplication) {
      subject = `New Career Application - ${
        formData.position || "Position Not Specified"
      }`;
    }

    // Format email content with ALL form data
    let emailHtml = `
      <h2>${
        isCareerApplication
          ? "New Career Application"
          : "New Contact Form Submission"
      }</h2>
      <h3>TNR Business Solutions Website</h3>
      
      <h4>Form Details:</h4>
      <ul>
        ${Object.entries(formData)
          .filter(([key, value]) => {
            // Filter out empty values and metadata fields
            if (
              !value ||
              value === "" ||
              value === "Not provided" ||
              value === "Not specified"
            )
              return false;
            // Skip internal metadata fields
            if (
              [
                "source",
                "status",
                "date",
                "convertedToLead",
                "id",
                "timestamp",
                "submissionDate",
                "submissionDateTime",
              ].includes(key)
            )
              return false;
            return true;
          })
          .map(([key, value]) => {
            const displayKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/\b\w/g, (l) => l.toUpperCase());

            // Special formatting for career application fields
            if (key === "firstName" && formData.lastName) {
              return `<li><strong>Full Name:</strong> ${value} ${
                formData.lastName || ""
              }</li>`;
            }
            if (key === "lastName" && formData.firstName) {
              return ""; // Already included in firstName line
            }
            if (key === "currentCompany") {
              return `<li><strong>Current Company:</strong> ${value}</li>`;
            }
            if (key === "resume" || key === "resumeFileName") {
              const fileSize = formData.resumeFileSize
                ? ` (${(formData.resumeFileSize / 1024).toFixed(2)} KB)`
                : "";
              return `<li><strong>Resume:</strong> ${value}${fileSize}</li>`;
            }
            if (key === "coverLetter" || key === "coverLetterFileName") {
              const fileSize = formData.coverLetterFileSize
                ? ` (${(formData.coverLetterFileSize / 1024).toFixed(2)} KB)`
                : "";
              return `<li><strong>Cover Letter:</strong> ${value}${fileSize}</li>`;
            }
            // Skip file metadata fields (already displayed with filename)
            if (
              key.includes("FileSize") ||
              key.includes("FileType") ||
              key.includes("FileBase64")
            ) {
              return "";
            }

            if (Array.isArray(value)) {
              return `<li><strong>${displayKey}:</strong> ${value.join(
                ", "
              )}</li>`;
            } else if (typeof value === "object") {
              return `<li><strong>${displayKey}:</strong> ${JSON.stringify(
                value
              )}</li>`;
            } else {
              return `<li><strong>${displayKey}:</strong> ${value}</li>`;
            }
          })
          .filter((html) => html !== "") // Remove empty strings
          .join("")}
      </ul>
    `;

    // Add attachments note for career applications
    if (
      isCareerApplication &&
      (formData.resumeFileName || formData.coverLetterFileName)
    ) {
      const attachedFiles = [];
      if (formData.resumeFileBase64 && formData.resumeFileName) {
        attachedFiles.push(
          `<li><strong>✅ Resume:</strong> ${formData.resumeFileName}${
            formData.resumeFileSize
              ? ` (${(formData.resumeFileSize / 1024).toFixed(
                  2
                )} KB) - ATTACHED TO EMAIL`
              : " - ATTACHED TO EMAIL"
          }</li>`
        );
      } else if (formData.resumeFileName) {
        attachedFiles.push(
          `<li><strong>⚠️ Resume:</strong> ${formData.resumeFileName} - File upload failed</li>`
        );
      }
      if (formData.coverLetterFileBase64 && formData.coverLetterFileName) {
        attachedFiles.push(
          `<li><strong>✅ Cover Letter:</strong> ${
            formData.coverLetterFileName
          }${
            formData.coverLetterFileSize
              ? ` (${(formData.coverLetterFileSize / 1024).toFixed(
                  2
                )} KB) - ATTACHED TO EMAIL`
              : " - ATTACHED TO EMAIL"
          }</li>`
        );
      } else if (formData.coverLetterFileName) {
        attachedFiles.push(
          `<li><strong>⚠️ Cover Letter:</strong> ${formData.coverLetterFileName} - File upload failed</li>`
        );
      }

      if (attachedFiles.length > 0) {
        emailHtml += `
          <hr>
          <h4>File Attachments (Attached to this email):</h4>
          <ul>
            ${attachedFiles.join("")}
          </ul>
          <p><em>✅ These files are attached to this email and can be downloaded directly.</em></p>
        `;
      }
    }

    emailHtml += `
      <hr>
      <p><small>This email was sent from the TNR Business Solutions ${
        isCareerApplication ? "career application" : "contact"
      } form.</small></p>
      <p><small>Submission Time: ${new Date().toLocaleString()}</small></p>
    `;

    // Prepare email attachments
    const attachments = [];

    // Add resume as attachment if present
    if (formData.resumeFileBase64 && formData.resumeFileName) {
      try {
        attachments.push({
          filename: formData.resumeFileName,
          content: Buffer.from(formData.resumeFileBase64, "base64"),
          contentType: formData.resumeFileType || "application/pdf",
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
          content: Buffer.from(formData.coverLetterFileBase64, "base64"),
          contentType: formData.coverLetterFileType || "application/pdf",
        });
        console.log("✅ Cover letter attached:", formData.coverLetterFileName);
      } catch (error) {
        console.error("❌ Error attaching cover letter:", error);
      }
    }

    // Send emails - both to business and customer confirmation
    const businessEmail =
      process.env.BUSINESS_EMAIL || "Roy.Turner@tnrbusinesssolutions.com";

    // Customer confirmation email HTML
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4a5d23, #2c5530); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .thank-you { font-size: 24px; color: #2c5530; margin-bottom: 20px; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { background: #2c5530; color: white; padding: 20px; text-align: center; font-size: 12px; margin-top: 20px; border-radius: 8px; }
          .btn { display: inline-block; padding: 12px 24px; background: #f59e0b; color: #1a1a1a; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Thank You for Contacting Us!</h1>
            <p style="margin: 10px 0 0 0;">TNR Business Solutions</p>
          </div>
          <div class="content">
            <div class="thank-you">We've received your inquiry!</div>
            
            <p>Dear ${
              formData.name || formData.firstName || "Valued Customer"
            },</p>
            
            <p>Thank you for reaching out to TNR Business Solutions. We've successfully received your ${
              isCareerApplication ? "career application" : "contact form"
            } submission and are excited to help you with your business needs.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #2c5530;">What Happens Next?</h3>
              <ul>
                <li>Our team will review your submission within 24 hours</li>
                <li>We'll contact you using your preferred method to discuss your needs</li>
                <li>We'll provide a customized solution tailored to your business</li>
              </ul>
            </div>
            
            <p><strong>Submission Summary:</strong></p>
            <ul>
              ${
                formData.email
                  ? `<li><strong>Email:</strong> ${formData.email}</li>`
                  : ""
              }
              ${
                formData.phone
                  ? `<li><strong>Phone:</strong> ${formData.phone}</li>`
                  : ""
              }
              ${
                formData.company
                  ? `<li><strong>Company:</strong> ${formData.company}</li>`
                  : ""
              }
              ${
                formData.message
                  ? `<li><strong>Your Message:</strong> ${formData.message.substring(
                      0,
                      200
                    )}${formData.message.length > 200 ? "..." : ""}</li>`
                  : ""
              }
            </ul>
            
            <p>If you have any immediate questions, please don't hesitate to contact us directly:</p>
            <ul>
              <li><strong>Phone:</strong> <a href="tel:4124992987">(412) 499-2987</a></li>
              <li><strong>Email:</strong> <a href="mailto:Roy.Turner@tnrbusinesssolutions.com">Roy.Turner@tnrbusinesssolutions.com</a></li>
              <li><strong>Address:</strong> 418 Concord Avenue, Greensburg, PA 15601</li>
            </ul>
            
            <p>We look forward to working with you!</p>
            
            <p>Best regards,<br>
            <strong>TNR Business Solutions Team</strong></p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">TNR Business Solutions</p>
            <p style="margin: 5px 0;">418 Concord Avenue, Greensburg, PA 15601</p>
            <p style="margin: 5px 0;">Phone: (412) 499-2987 | Email: Roy.Turner@tnrbusinesssolutions.com</p>
            <p style="margin: 10px 0 0 0; font-size: 10px;">This is an automated confirmation email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Business notification email
    const businessMailOptions = {
      from: `"TNR Business Solutions Contact Form" <${businessEmail}>`,
      to: businessEmail,
      replyTo: formData.email,
      subject: subject,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Customer confirmation email (only if email is provided)
    let customerEmailSent = false;
    let customerMessageId = null;

    if (
      formData.email &&
      typeof formData.email === "string" &&
      formData.email.includes("@")
    ) {
      try {
        const customerMailOptions = {
          from: `"TNR Business Solutions" <${businessEmail}>`,
          to: formData.email,
          replyTo: businessEmail,
          subject: `Thank You for Contacting TNR Business Solutions${
            isCareerApplication ? " - Application Received" : ""
          }`,
          html: customerEmailHtml,
        };

        const customerInfo = await transporter.sendMail(customerMailOptions);
        customerEmailSent = true;
        customerMessageId = customerInfo.messageId;
        console.log(
          "✅ Customer confirmation email sent successfully:",
          customerMessageId
        );
      } catch (customerEmailError) {
        console.error(
          "❌ Error sending customer confirmation email:",
          customerEmailError
        );
        // Don't fail the whole request if customer email fails
      }
    } else {
      console.warn(
        "⚠️ No valid customer email provided, skipping confirmation email"
      );
    }

    // Send business email
    const info = await transporter.sendMail(businessMailOptions);

    console.log("📧 Business email sent successfully:", info.messageId);

    // Return success response
    return sendJson(res, 200, {
      success: true,
      message: "Form submitted successfully",
      emailSent: true,
      messageId: info.messageId,
      customerEmailSent: customerEmailSent,
      customerMessageId: customerMessageId,
      leadCreated: leadCreated,
      leadId: leadId,
    });
  } catch (error) {
    console.error("❌ Error processing form:", error);
    return sendJson(res, 500, {
      success: false,
      message: "Failed to process form submission",
      error: error.message,
    });
  }
}

module.exports = async (req, res) => {
  // Handle CORS
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);
  
  // Apply rate limiting
  return new Promise((resolve) => {
    formRateLimiter(req, res, async () => {
      try {
        // Only accept POST requests
        if (req.method !== "POST") {
          sendJson(res, 405, { success: false, message: "Method not allowed" });
          resolve();
          return;
        }

        // Handle request body - Vercel may pre-parse or we need to read stream
        let formData = {};

        if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
          formData = req.body;
        } else if (typeof req.body === "string") {
          try {
            formData = JSON.parse(req.body);
          } catch (e) {
            // Will read from stream below
          }
        }

        // If body not parsed, read from stream
        if (!formData || Object.keys(formData).length === 0) {
          await new Promise((streamResolve) => {
            let body = "";
            req.on("data", (chunk) => {
              body += chunk.toString();
            });
            req.on("end", async () => {
              try {
                formData = body.trim() ? JSON.parse(body) : {};
                await processFormSubmission(formData, res);
                resolve();
                streamResolve();
              } catch (parseError) {
                console.error("❌ Error parsing form data:", parseError);
                sendJson(res, 400, {
                  success: false,
                  message: "Invalid form data",
                  error: parseError.message,
                });
                resolve();
                streamResolve();
              }
            });
            req.on("error", (error) => {
              console.error("❌ Request stream error:", error);
              sendJson(res, 500, {
                success: false,
                message: "Request error",
                error: error.message,
              });
              resolve();
              streamResolve();
            });
          });
        } else {
          // Process the form submission
          await processFormSubmission(formData, res);
          resolve();
        }
      } catch (error) {
        console.error("❌ Error in submit-form handler:", error);
        sendJson(res, 500, {
          success: false,
          message: "Failed to process form submission",
          error: error.message,
        });
        resolve();
      }
    });
  });
};
