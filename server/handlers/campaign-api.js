// TNR Business Solutions - Email Campaign API
// Handles email marketing campaigns with rate-limited sending

const TNRDatabase = require("../../database");
const EmailHandler = require("../../email-handler");
const { URL } = require("url");

// Initialize database connection
let dbInstance = null;
let emailHandlerInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new TNRDatabase();
    await dbInstance.initialize();
  }
  return dbInstance;
}

function getEmailHandler() {
  if (!emailHandlerInstance) {
    emailHandlerInstance = new EmailHandler();
  }
  return emailHandlerInstance;
}

// CORS headers helper
function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// Rate-limited email sender pool
class EmailPool {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxConcurrent = 10;
    this.msgPerSec = 1; // Conservative: 1 email per second
    this.active = 0;
    this.lastSendTime = 0;
  }

  async send(mailOptions) {
    return new Promise((resolve, reject) => {
      this.queue.push({ mailOptions, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (
      this.processing ||
      this.queue.length === 0 ||
      this.active >= this.maxConcurrent
    ) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.active < this.maxConcurrent) {
      const now = Date.now();
      const timeSinceLastSend = now - this.lastSendTime;
      const minInterval = 1000 / this.msgPerSec; // 1000ms for 1/sec

      if (timeSinceLastSend < minInterval) {
        await new Promise((resolve) =>
          setTimeout(resolve, minInterval - timeSinceLastSend)
        );
      }

      const { mailOptions, resolve, reject } = this.queue.shift();
      this.active++;
      this.lastSendTime = Date.now();

      getEmailHandler()
        .transporter.sendMail(mailOptions)
        .then((result) => {
          this.active--;
          resolve({ success: true, messageId: result.messageId });
          this.processQueue(); // Continue processing
        })
        .catch((error) => {
          this.active--;
          reject(error);
          this.processQueue(); // Continue processing even on error
        });
    }

    this.processing = false;
  }
}

const emailPool = new EmailPool();

// Campaign API Handler
module.exports = async function campaignApiHandler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  let db;
  let fullPath = req.url;
  const match = fullPath.match(/\/api\/campaigns\/(.*)/);
  const path = match ? match[1] : "";

  const parsedUrl = (() => {
    try {
      return new URL(fullPath, "http://localhost");
    } catch (e) {
      return null;
    }
  })();

  try {
    try {
      db = await getDatabase();
    } catch (e) {
      // Fallback for serverless without sqlite
      db = {
        getClients: async () => [],
        getLeads: async () => [],
      };
    }
    if (req.method === "GET") {
      if (path === "" || path === "list") {
        // Get all campaigns (simplified - could query DB for stored campaigns)
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: [] }));
      } else if (path.startsWith("audience")) {
        // Get audience count based on filters
        const q = parsedUrl ? parsedUrl.searchParams.get("q") || "" : "";
        const status = parsedUrl
          ? parsedUrl.searchParams.get("status") || ""
          : "";
        const businessType = parsedUrl
          ? parsedUrl.searchParams.get("businessType") || ""
          : "";
        const source = parsedUrl
          ? parsedUrl.searchParams.get("source") || ""
          : "";
        const interest = parsedUrl
          ? parsedUrl.searchParams.get("interest") || ""
          : "";
        const audienceType = parsedUrl
          ? parsedUrl.searchParams.get("type") || "leads"
          : "leads";

        let recipients = [];
        if (audienceType === "clients") {
          recipients = await db.getClients();
        } else {
          recipients = await db.getLeads();
        }

        // Apply filters
        if (q) {
          recipients = recipients.filter((r) =>
            [
              r.name,
              r.email,
              r.phone,
              r.company,
              r.industry,
              r.businessType,
              r.source,
              r.interest,
            ]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q.toLowerCase()))
          );
        }
        if (status)
          recipients = recipients.filter((r) => (r.status || "") === status);
        if (businessType)
          recipients = recipients.filter(
            (r) => (r.businessType || "") === businessType
          );
        if (source)
          recipients = recipients.filter((r) => (r.source || "") === source);
        if (interest && audienceType === "leads") {
          recipients = recipients.filter(
            (r) => (r.interest || "") === interest
          );
        }

        // Filter out invalid emails
        recipients = recipients.filter((r) => r.email && r.email.includes("@"));

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            count: recipients.length,
            recipients: recipients.map((r) => ({
              id: r.id,
              name: r.name,
              email: r.email,
            })),
          })
        );
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Endpoint not found" })
        );
      }
    } else if (req.method === "POST") {
      if (path === "send") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const data = JSON.parse(body);
            const {
              subject,
              htmlContent,
              textContent,
              audienceFilters,
              audienceType = "leads",
            } = data;

            if (!subject || !htmlContent) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(
                JSON.stringify({
                  success: false,
                  error: "Subject and HTML content required",
                })
              );
            }

            // Get recipients based on filters
            let recipients = [];
            if (audienceType === "clients") {
              recipients = await db.getClients();
            } else {
              recipients = await db.getLeads();
            }

            // Apply filters
            if (audienceFilters) {
              if (audienceFilters.q) {
                recipients = recipients.filter((r) =>
                  [
                    r.name,
                    r.email,
                    r.phone,
                    r.company,
                    r.industry,
                    r.businessType,
                    r.source,
                    r.interest,
                  ]
                    .filter(Boolean)
                    .some((v) =>
                      String(v)
                        .toLowerCase()
                        .includes(audienceFilters.q.toLowerCase())
                    )
                );
              }
              if (audienceFilters.status) {
                recipients = recipients.filter(
                  (r) => (r.status || "") === audienceFilters.status
                );
              }
              if (audienceFilters.businessType) {
                recipients = recipients.filter(
                  (r) => (r.businessType || "") === audienceFilters.businessType
                );
              }
              if (audienceFilters.source) {
                recipients = recipients.filter(
                  (r) => (r.source || "") === audienceFilters.source
                );
              }
              if (audienceFilters.interest) {
                recipients = recipients.filter(
                  (r) => (r.interest || "") === audienceFilters.interest
                );
              }
            }

            // Filter valid emails only
            recipients = recipients.filter(
              (r) => r.email && r.email.includes("@")
            );

            if (recipients.length === 0) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(
                JSON.stringify({
                  success: false,
                  error: "No valid recipients found",
                })
              );
            }

            // Personalize and send emails with rate limiting
            const results = { sent: 0, failed: 0, errors: [] };
            const sendPromises = recipients.map(async (recipient) => {
              // Personalize content
              let personalizedHtml = htmlContent;
              let personalizedText =
                textContent || htmlContent.replace(/<[^>]*>/g, "");

              // Replace variables
              personalizedHtml = personalizedHtml.replace(
                /\{\{name\}\}/g,
                recipient.name || ""
              );
              personalizedHtml = personalizedHtml.replace(
                /\{\{email\}\}/g,
                recipient.email || ""
              );
              personalizedHtml = personalizedHtml.replace(
                /\{\{company\}\}/g,
                recipient.company || recipient.businessName || ""
              );
              personalizedText = personalizedText.replace(
                /\{\{name\}\}/g,
                recipient.name || ""
              );
              personalizedText = personalizedText.replace(
                /\{\{email\}\}/g,
                recipient.email || ""
              );
              personalizedText = personalizedText.replace(
                /\{\{company\}\}/g,
                recipient.company || recipient.businessName || ""
              );

              const mailOptions = {
                from: `"TNR Business Solutions" <${
                  process.env.SMTP_USER || "roy.turner@tnrbusinesssolutions.com"
                }>`,
                to: recipient.email,
                subject: subject
                  .replace(/\{\{name\}\}/g, recipient.name || "")
                  .replace(
                    /\{\{company\}\}/g,
                    recipient.company || recipient.businessName || ""
                  ),
                html: personalizedHtml,
                text: personalizedText,
                replyTo:
                  process.env.SMTP_USER ||
                  "roy.turner@tnrbusinesssolutions.com",
              };

              try {
                await emailPool.send(mailOptions);
                results.sent++;
              } catch (error) {
                results.failed++;
                results.errors.push({
                  email: recipient.email,
                  error: error.message,
                });
              }
            });

            // Wait for all emails to be queued and processed
            await Promise.all(sendPromises);

            // Wait a bit for queue to finish
            await new Promise((resolve) => setTimeout(resolve, 2000));

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: true,
                sent: results.sent,
                failed: results.failed,
                total: recipients.length,
                errors: results.errors.slice(0, 10), // Limit error details
              })
            );
          } catch (error) {
            console.error("Campaign send error:", error);
            if (!res.headersSent) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: error.message }));
            }
          }
        });
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Endpoint not found" })
        );
      }
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "Method not allowed" }));
    }
  } catch (error) {
    console.error("❌ Campaign API Error:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  }
};
