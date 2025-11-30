// TNR Business Solutions - CRM API Endpoints
// Handles all database operations for the admin dashboard

const TNRDatabase = require("../../database");
const { URL } = require("url");
const { sendErrorResponse, handleUnexpectedError, ERROR_CODES } = require("./error-handler");
// Workflow executor is optional - only used for automation features
let workflowExecutor;
try {
  workflowExecutor = require("../workflow-executor");
} catch (e) {
  console.log("Workflow executor not loaded (optional feature)");
  workflowExecutor = null;
}

// Initialize database connection
let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new TNRDatabase();
    await dbInstance.initialize();
  }
  return dbInstance;
}

// Import CORS utilities
const { setCorsHeaders, handleCorsPreflight } = require("./cors-utils");

// CRM API Handler
module.exports = async function crmApiHandler(req, res) {
  try {
    // Handle CORS preflight
    const origin = req.headers.origin || req.headers.referer;
    if (handleCorsPreflight(req, res)) {
      return;
    }
    
    // Set CORS headers
    setCorsHeaders(res, origin);

    let db;
    let fullPath = req.url;
    
    // Also check req.query if available (Vercel provides this)
    const queryFromReq = req.query || {};

    const parsedUrl = (() => {
      try {
        // Provide a base to satisfy WHATWG URL on Node
        // If fullPath doesn't start with /, it might be relative
        const urlToParse = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
        return new URL(urlToParse, "http://localhost");
      } catch (e) {
        console.error("URL parse error:", e);
        return null;
      }
    })();

    // Extract the path after /api/crm/ (remove query string)
    const pathWithoutQuery = parsedUrl
      ? parsedUrl.pathname.replace(/^\/api\/crm\//, "")
      : "";
    const match = fullPath.match(/\/api\/crm\/([^?]*)/);
    const path = match ? match[1] : pathWithoutQuery;

    // Combine query params from URL and req.query
    const urlQueryParams = parsedUrl ? Object.fromEntries(parsedUrl.searchParams) : {};
    const allQueryParams = { ...urlQueryParams, ...queryFromReq };

    console.log("📋 CRM API Request:", req.method, fullPath, "Path:", path);
    console.log("📋 Query params from URL:", urlQueryParams);
    console.log("📋 Query params from req.query:", queryFromReq);
    console.log("📋 Combined query params:", allQueryParams);

    try {
      db = await getDatabase();
    } catch (e) {
      // Fallback in serverless where sqlite may be unavailable
      db = {
        getClients: async () => [],
        getClient: async () => null,
        addClient: async (c) => ({ id: `client-${Date.now()}`, ...c }),
        updateClient: async (id, data) => ({ id, ...data }),
        deleteClient: async () => true,
        getLeads: async () => [],
        getLead: async () => null,
        addLead: async (l) => ({ id: `lead-${Date.now()}`, ...l }),
        deleteLead: async () => true,
        convertLeadToClient: async () => null,
        getOrders: async () => [],
        saveSocialPost: async (p) => ({ id: `post-${Date.now()}`, ...p }),
        getSocialPosts: async () => [],
        getStats: async () => ({
          totalClients: 0,
          activeClients: 0,
          newLeads: 0,
          totalOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
        }),
      };
    }
    if (req.method === "GET") {
      if (path === "clients" || path === "") {
        let clients = await db.getClients();
        if (parsedUrl) {
          const q = (parsedUrl.searchParams.get("q") || "").toLowerCase();
          const status = parsedUrl.searchParams.get("status");
          const businessType = parsedUrl.searchParams.get("businessType");
          const source = parsedUrl.searchParams.get("source");
          const sort = parsedUrl.searchParams.get("sort") || "createdAt";
          const order = (
            parsedUrl.searchParams.get("order") || "desc"
          ).toLowerCase();

          if (q) {
            clients = clients.filter((c) =>
              [
                c.name,
                c.email,
                c.phone,
                c.company,
                c.industry,
                c.businessType,
                c.source,
              ]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
            );
          }
          if (status) clients = clients.filter((c) => c.status === status);
          if (businessType)
            clients = clients.filter(
              (c) => (c.businessType || "") === businessType
            );
          if (source)
            clients = clients.filter((c) => (c.source || "") === source);

          clients.sort((a, b) => {
            const av = a[sort] ?? "";
            const bv = b[sort] ?? "";
            if (av < bv) return order === "asc" ? -1 : 1;
            if (av > bv) return order === "asc" ? 1 : -1;
            return 0;
          });
        }
        setCorsHeaders(res);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: clients }));
        console.log("✅ Clients returned:", clients.length);
      } else if (path.startsWith("clients/")) {
        const id = path.replace("clients/", "");
        const client = await db.getClient(id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: client }));
      } else if (path.startsWith("leads/")) {
        const id = path.replace("leads/", "");
        const lead = await db.getLead(id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: lead }));
      } else if (path === "leads") {
        // Parse filter parameters from URL
        const filter = {};
        if (parsedUrl) {
          const q = parsedUrl.searchParams.get("q");
          const status = parsedUrl.searchParams.get("status");
          const businessType = parsedUrl.searchParams.get("businessType");
          const source = parsedUrl.searchParams.get("source");
          const interest = parsedUrl.searchParams.get("interest");
          const sort = parsedUrl.searchParams.get("sort") || "createdAt";
          const order = parsedUrl.searchParams.get("order") || "desc";

          if (q) filter.q = q;
          if (status) filter.status = status;
          if (businessType) filter.businessType = businessType;
          if (source) filter.source = source;
          if (interest) filter.interest = interest;
          filter.sort = sort;
          filter.order = order;
        }

        // Get leads with filters (SQL-level filtering for better performance)
        const leads = await db.getLeads(filter);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: leads }));
      } else if (path === "orders") {
        const orders = await db.getOrders();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: orders }));
      } else if (path === "stats") {
        const stats = await db.getStats();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: stats }));
      } else if (path === "social-posts") {
        const status = parsedUrl
          ? parsedUrl.searchParams.get("status") || null
          : null;
        const posts = await db.getSocialPosts(status);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: posts }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Endpoint not found" })
        );
      }
    } else if (req.method === "POST") {
      console.log("📥 POST request received:", fullPath);
      console.log("📥 POST path:", path);
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        console.log("📥 POST body received, length:", body.length);
        try {
          const data = JSON.parse(body);
          console.log("📥 POST data parsed successfully");

          if (path === "clients") {
            const client = await db.addClient(data);

            // Send welcome email to new client (non-blocking)
            try {
              // Ensure .env is loaded
              require("dotenv").config();

              const EmailHandler = require("../../email-handler");
              const emailHandler = new EmailHandler();

              console.log("📧 Sending welcome email to:", client.email);
              console.log(
                "📧 Sending notification to:",
                process.env.BUSINESS_EMAIL ||
                  "Roy.Turner@TNRBusinessSolutions.com"
              );

              emailHandler
                .sendWelcomeEmail(client)
                .then((result) => {
                  if (result.success) {
                    console.log("✅ Welcome email sent successfully!");
                    console.log("   Message:", result.message);
                  } else {
                    console.error(
                      "❌ Failed to send welcome email:",
                      result.error
                    );
                  }
                })
                .catch((err) => {
                  console.error("❌ Error sending welcome email:", err.message);
                  console.error("   Stack:", err.stack);
                });
            } catch (emailError) {
              console.error(
                "❌ Failed to initialize email handler:",
                emailError.message
              );
              console.error("   Stack:", emailError.stack);
              console.error(
                "   Make sure SMTP_USER and SMTP_PASS are set in .env file"
              );
            }

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: client }));
          } else if (path === "leads") {
            console.log("📥 POST /api/crm/leads - Creating new lead");
            console.log(
              "📋 Lead data received:",
              JSON.stringify(data, null, 2)
            );

            try {
              const lead = await db.addLead(data);
              console.log(
                "✅ Lead created successfully:",
                lead.id,
                "-",
                lead.name || lead.email
              );

              // Trigger workflows for new lead
              try {
                await workflowExecutor.initialize();
                await workflowExecutor.processNewLead(lead);
              } catch (wfError) {
                console.warn(
                  "Workflow execution error (non-blocking):",
                  wfError.message
                );
              }

              setCorsHeaders(res);
              res.writeHead(201, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true, data: lead }));
              console.log("✅ Lead creation response sent successfully");
            } catch (leadError) {
              console.error("❌ Error creating lead:", leadError.message);
              console.error("❌ Error stack:", leadError.stack);
              setCorsHeaders(res);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ success: false, error: leadError.message })
              );
            }
          } else if (path === "orders") {
            const order = await db.addOrder(data);
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: order }));
          } else if (path === "convert-lead") {
            const client = await db.convertLeadToClient(data.leadId);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: client }));
          } else if (path === "social-posts") {
            const post = await db.saveSocialPost(data);
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: post }));
          } else if (path === "import-leads") {
            // Simple CSV import (expects body.csv as string and optional delimiter)
            const csv = data.csv;
            if (!csv || typeof csv !== "string") {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(
                JSON.stringify({ success: false, error: "csv string required" })
              );
            }
            const delimiter = data.delimiter || ",";
            const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
            if (lines.length < 2) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(
                JSON.stringify({
                  success: false,
                  error: "CSV must include header and at least one row",
                })
              );
            }
            const headers = lines[0].split(delimiter).map((h) => h.trim());
            const required = [
              "firstName",
              "lastName",
              "phone",
              "email",
              "businessType",
              "businessName",
              "businessAddress",
              "source",
              "interest",
              "notes",
            ];
            // Proceed even if some are missing; map what we can
            const created = [];
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(delimiter).map((c) => c.trim());
              const row = Object.fromEntries(
                headers.map((h, idx) => [h, cols[idx] ?? ""])
              );
              const name =
                [row.firstName || "", row.lastName || ""].join(" ").trim() ||
                row.name ||
                row.businessName ||
                "";
              const leadPayload = {
                name,
                email: row.email || null,
                phone: row.phone || null,
                company: row.businessName || null,
                website: row.website || null,
                industry: row.businessType || null,
                address: row.businessAddress || null,
                source: row.source || "Imported CSV",
                notes: row.notes || null,
                interest: row.interest || null,
                businessType: row.businessType || null,
                businessName: row.businessName || null,
                businessAddress: row.businessAddress || null,
              };
              const lead = await db.addLead(leadPayload);
              created.push(lead);

              // Trigger workflows for new lead (non-blocking)
              try {
                await workflowExecutor.initialize();
                await workflowExecutor.processNewLead(lead);
              } catch (wfError) {
                console.warn(
                  "Workflow execution error for imported lead (non-blocking):",
                  wfError.message
                );
              }
            }
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: true, createdCount: created.length })
            );
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, error: "Endpoint not found" })
            );
          }
        } catch (error) {
          console.error("❌ POST request error:", error.message);
          console.error("❌ POST request error stack:", error.stack);
          console.error("❌ POST body was:", body.substring(0, 500));
          setCorsHeaders(res);
          res.writeHead(400, { "Content-Type": "application/json" });
          handleUnexpectedError(res, error, 'CRM API');
        }
      });
    } else if (req.method === "PUT") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const data = JSON.parse(body);

          if (path === "clients") {
            // Get old client data to detect status changes
            const oldClient = await db.getClient(data.id);
            const oldStatus = oldClient?.status;

            const client = await db.updateClient(data.id, data);

            // Trigger workflows if status changed
            if (data.status && oldStatus && data.status !== oldStatus) {
              try {
                await workflowExecutor.initialize();
                await workflowExecutor.processStatusChange(
                  client,
                  oldStatus,
                  data.status,
                  "client"
                );
              } catch (wfError) {
                console.warn(
                  "Workflow execution error (non-blocking):",
                  wfError.message
                );
              }
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: client }));
          } else if (path === "orders") {
            if (data.status) {
              await db.updateOrderStatus(data.id, data.status);
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true }));
            } else {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ success: false, error: "Status required" })
              );
            }
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, error: "Endpoint not found" })
            );
          }
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          handleUnexpectedError(res, error, 'CRM API');
        }
      });
    } else if (req.method === "DELETE") {
      // Handle DELETE requests - support both path-based and query parameter IDs
      // Use combined query params (from URL and req.query)
      const queryParams = allQueryParams;
      let id = null;
      let resourceType = null;
      
      // Check path-based first
      if (path.startsWith("clients/")) {
        id = path.replace("clients/", "");
        resourceType = "clients";
      } else if (path.startsWith("leads/")) {
        id = path.replace("leads/", "");
        resourceType = "leads";
      } else if (path.startsWith("orders/")) {
        id = path.replace("orders/", "");
        resourceType = "orders";
      }
      // Then check query parameters
      else if (path === "clients" && queryParams.clientId) {
        id = queryParams.clientId;
        resourceType = "clients";
      } else if (path === "leads" && queryParams.leadId) {
        id = queryParams.leadId;
        resourceType = "leads";
      } else if (path === "orders" && queryParams.orderId) {
        id = queryParams.orderId;
        resourceType = "orders";
      }
      
      if (id && resourceType) {
        setCorsHeaders(res, origin);
        try {
          if (resourceType === "clients") {
            await db.deleteClient(id);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: "Client deleted successfully" }));
          } else if (resourceType === "leads") {
            await db.deleteLead(id);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: "Lead deleted successfully" }));
          } else if (resourceType === "orders") {
            await db.deleteOrder(id);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: "Order deleted successfully" }));
          }
        } catch (deleteError) {
          console.error("❌ Delete error:", deleteError);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: deleteError.message }));
        }
      } else {
        setCorsHeaders(res, origin);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ 
            success: false, 
            error: "ID is required for DELETE operation",
            details: { path, queryParams, parsedUrl: parsedUrl ? parsedUrl.toString() : null }
          })
        );
      }
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "Method not allowed" }));
    }
  } catch (error) {
    console.error("❌ API Error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: error.message }));
  }
};
