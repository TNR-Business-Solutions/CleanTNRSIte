// Admin Requests Handler
// Handles password reset requests and new user requests from admin-login.html

const { setCorsHeaders, handleCorsPreflight } = require("./cors-utils");
const { sendErrorResponse, handleUnexpectedError, ERROR_CODES } = require("./error-handler");
const EmailHandler = require("../../email-handler");

module.exports = async (req, res) => {
  // Handle CORS
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  // Only accept POST requests
  if (req.method !== "POST") {
    return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, "Method not allowed. Only POST requests are accepted.", {
      method: req.method,
      allowed: ['POST']
    });
  }

  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const { type } = data;

        if (!type) {
          return sendErrorResponse(res, ERROR_CODES.MISSING_FIELD, "Request type is required.", {
            field: 'type'
          });
        }

        let emailHandler;
        try {
          emailHandler = new EmailHandler();
        } catch (error) {
          console.error("Email handler initialization error:", error);
          return sendErrorResponse(res, ERROR_CODES.INTERNAL_ERROR, "Email service is not configured. Please check SMTP settings.", {
            error: error.message
          });
        }

        const businessEmail = process.env.BUSINESS_EMAIL || "Roy.Turner@tnrbusinesssolutions.com";

        if (type === "forgot_password_request") {
          // Password reset request
          const { email, username, reason, timestamp } = data;

          const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c5530; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; padding: 10px; background: white; border-left: 3px solid #2c5530; }
        .label { font-weight: bold; color: #2c5530; }
        .footer { background: #2c5530; color: white; padding: 15px; text-align: center; font-size: 12px; }
        .action-button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔐 Password Reset Request</h2>
            <p>TNR Business Solutions Admin Dashboard</p>
        </div>
        <div class="content">
            <p><strong>Action Required:</strong> A password reset has been requested for the admin dashboard.</p>
            
            <div class="field">
                <span class="label">Username:</span> ${username || 'Not provided'}
            </div>
            <div class="field">
                <span class="label">Email:</span> ${email || 'Not provided'}
            </div>
            <div class="field">
                <span class="label">Request Time:</span> ${timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}
            </div>
            <div class="field">
                <span class="label">Reason:</span>
                <p style="margin-top: 10px;">${reason || 'No reason provided'}</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Verify the user's identity</li>
                <li>Generate a new password hash</li>
                <li>Update the ADMIN_PASSWORD_HASH or EMPLOYEE_PASSWORD_HASH environment variable in Vercel</li>
                <li>Notify the user of the new password</li>
            </ol>
            
            <p style="margin-top: 20px;">
                <a href="https://vercel.com/dashboard" class="action-button">Go to Vercel Dashboard</a>
            </p>
        </div>
        <div class="footer">
            <p>This is an automated notification from the TNR Business Solutions admin dashboard.</p>
            <p>Request ID: ${Date.now()}</p>
        </div>
    </div>
</body>
</html>
          `;

          const emailText = `
Password Reset Request

A password reset has been requested for the admin dashboard.

Username: ${username || 'Not provided'}
Email: ${email || 'Not provided'}
Request Time: ${timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}
Reason: ${reason || 'No reason provided'}

Next Steps:
1. Verify the user's identity
2. Generate a new password hash
3. Update the ADMIN_PASSWORD_HASH or EMPLOYEE_PASSWORD_HASH environment variable in Vercel
4. Notify the user of the new password

This is an automated notification from the TNR Business Solutions admin dashboard.
          `;

          try {
            await emailHandler.transporter.sendMail({
              from: `"TNR Business Solutions Admin" <${process.env.SMTP_USER}>`,
              to: businessEmail,
              subject: `🔐 Password Reset Request - ${username || email || 'Unknown User'}`,
              html: emailHTML,
              text: emailText,
            });

            console.log("✅ Password reset request email sent to:", businessEmail);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              success: true,
              message: "Password reset request submitted successfully. You will be notified via email."
            }));
          } catch (emailError) {
            console.error("❌ Error sending password reset email:", emailError);
            return sendErrorResponse(res, ERROR_CODES.EXTERNAL_API_ERROR, "Failed to send email notification.", {
              error: emailError.message
            });
          }

        } else if (type === "new_user_request") {
          // New user request
          const { name, email, phone, role, reason, timestamp } = data;

          const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c5530; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; padding: 10px; background: white; border-left: 3px solid #2c5530; }
        .label { font-weight: bold; color: #2c5530; }
        .footer { background: #2c5530; color: white; padding: 15px; text-align: center; font-size: 12px; }
        .action-button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>👤 New User Access Request</h2>
            <p>TNR Business Solutions Admin Dashboard</p>
        </div>
        <div class="content">
            <p><strong>Action Required:</strong> A new user has requested access to the admin dashboard.</p>
            
            <div class="field">
                <span class="label">Full Name:</span> ${name || 'Not provided'}
            </div>
            <div class="field">
                <span class="label">Email:</span> ${email || 'Not provided'}
            </div>
            <div class="field">
                <span class="label">Phone:</span> ${phone || 'Not provided'}
            </div>
            <div class="field">
                <span class="label">Requested Role:</span> ${role || 'Not specified'}
            </div>
            <div class="field">
                <span class="label">Request Time:</span> ${timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}
            </div>
            <div class="field">
                <span class="label">Reason for Access:</span>
                <p style="margin-top: 10px;">${reason || 'No reason provided'}</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Review the user's request and reason</li>
                <li>Verify their identity and need for access</li>
                <li>If approved, create credentials:
                    <ul>
                        <li>Set EMPLOYEE_USERNAME environment variable (if different from admin)</li>
                        <li>Have user log in once to generate password hash</li>
                        <li>Add EMPLOYEE_PASSWORD_HASH to Vercel environment variables</li>
                    </ul>
                </li>
                <li>Notify the user of their access credentials</li>
            </ol>
            
            <p style="margin-top: 20px;">
                <a href="https://vercel.com/dashboard" class="action-button">Go to Vercel Dashboard</a>
            </p>
        </div>
        <div class="footer">
            <p>This is an automated notification from the TNR Business Solutions admin dashboard.</p>
            <p>Request ID: ${Date.now()}</p>
        </div>
    </div>
</body>
</html>
          `;

          const emailText = `
New User Access Request

A new user has requested access to the admin dashboard.

Full Name: ${name || 'Not provided'}
Email: ${email || 'Not provided'}
Phone: ${phone || 'Not provided'}
Requested Role: ${role || 'Not specified'}
Request Time: ${timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}
Reason for Access: ${reason || 'No reason provided'}

Next Steps:
1. Review the user's request and reason
2. Verify their identity and need for access
3. If approved, create credentials and add to Vercel environment variables
4. Notify the user of their access credentials

This is an automated notification from the TNR Business Solutions admin dashboard.
          `;

          try {
            await emailHandler.transporter.sendMail({
              from: `"TNR Business Solutions Admin" <${process.env.SMTP_USER}>`,
              to: businessEmail,
              subject: `👤 New User Access Request - ${name || email || 'Unknown User'}`,
              html: emailHTML,
              text: emailText,
            });

            console.log("✅ New user request email sent to:", businessEmail);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              success: true,
              message: "New user request submitted successfully. You will be notified via email."
            }));
          } catch (emailError) {
            console.error("❌ Error sending new user request email:", emailError);
            return sendErrorResponse(res, ERROR_CODES.EXTERNAL_API_ERROR, "Failed to send email notification.", {
              error: emailError.message
            });
          }

        } else {
          return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, "Invalid request type.", {
            type,
            allowed: ['forgot_password_request', 'new_user_request']
          });
        }

      } catch (parseError) {
        console.error("❌ Error parsing request body:", parseError);
        return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, "Invalid request format. JSON expected.", {
          error: parseError.message
        });
      }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Admin Requests');
  }
};

