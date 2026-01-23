// TNR Business Solutions - CRM API Endpoints
// Handles all database operations for the admin dashboard

const TNRDatabase = require("../../database");
const { URL } = require("url");
const { sendErrorResponse, handleUnexpectedError, ERROR_CODES } = require("./error-handler");
const { verifyToken, extractToken } = require("./jwt-utils");
const Logger = require("../utils/logger");
// Workflow executor is optional - only used for automation features
let workflowExecutor;
try {
  workflowExecutor = require("../workflow-executor");
} catch (e) {
  // Optional feature - no logging needed
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

// Import activity logging
let logActivity;
try {
  const activityLog = require("./activity-log-api");
  logActivity = activityLog.logActivity;
} catch (e) {
  // Optional feature - no logging needed
  logActivity = async () => {}; // No-op if not available
}

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

    // JWT Authentication
    const token = extractToken(req);
    if (!token) {
      setCorsHeaders(res, origin);
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        error: "Authentication required",
        message: "No token provided"
      }));
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      setCorsHeaders(res, origin);
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        error: "Invalid token",
        message: "Token verification failed"
      }));
      return;
    }
    req.user = decoded;

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
        Logger.error("URL parse error:", e.message);
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

    Logger.debug("CRM API Request", { method: req.method, fullPath, path, queryParams: allQueryParams });

    try {
      db = await getDatabase();
    } catch (e) {
      Logger.error("Database initialization error in CRM API:", e.message);
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
      Logger.warn("Using fallback database (empty data)");
    }
    if (req.method === "GET") {
      try {
      if (path === "clients" || path === "") {
        let clients;
        try {
          clients = await db.getClients();
        } catch (dbError) {
          Logger.error("Error fetching clients:", dbError.message);
          setCorsHeaders(res, origin);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            success: false, 
            error: "Database error",
            message: dbError.message || "Failed to fetch clients"
          }));
          return;
        }
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
        setCorsHeaders(res, origin);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: clients }));
        Logger.debug("Clients returned:", clients.length);
      } else if (path.startsWith("clients/")) {
        try {
          const id = path.replace("clients/", "");
          const client = await db.getClient(id);
          setCorsHeaders(res, origin);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, data: client }));
        } catch (dbError) {
          Logger.error("Error fetching client:", dbError.message);
          setCorsHeaders(res, origin);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            success: false, 
            error: "Database error",
            message: dbError.message || "Failed to fetch client"
          }));
        }
      } else if (path.startsWith("leads/")) {
        try {
          const id = path.replace("leads/", "");
          const lead = await db.getLead(id);
          setCorsHeaders(res, origin);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, data: lead }));
        } catch (dbError) {
          Logger.error("Error fetching lead:", dbError.message);
          setCorsHeaders(res, origin);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            success: false, 
            error: "Database error",
            message: dbError.message || "Failed to fetch lead"
          }));
        }
      } else if (path === "leads") {
        try {
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

          setCorsHeaders(res, origin);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, data: leads }));
        } catch (dbError) {
          Logger.error("Error fetching leads:", dbError.message);
          setCorsHeaders(res, origin);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            success: false, 
            error: "Database error",
            message: dbError.message || "Failed to fetch leads"
          }));
        }
      } else if (path === "orders") {
        try {
          const orders = await db.getOrders();
          setCorsHeaders(res, origin);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, data: orders }));
        } catch (dbError) {
          Logger.error("Error fetching orders:", dbError.message);
          setCorsHeaders(res, origin);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            success: false, 
            error: "Database error",
            message: dbError.message || "Failed to fetch orders"
          }));
        }
      } else if (path === "stats") {
        try {
          const stats = await db.getStats();
          setCorsHeaders(res, origin);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, data: stats }));
        } catch (dbError) {
          Logger.error("Error fetching stats:", dbError.message);
          setCorsHeaders(res, origin);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            success: false, 
            error: "Database error",
            message: dbError.message || "Failed to fetch stats"
          }));
        }
      } else if (path === "social-posts") {
        try {
          const status = parsedUrl
            ? parsedUrl.searchParams.get("status") || null
            : null;
          const posts = await db.getSocialPosts(status);
          setCorsHeaders(res, origin);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, data: posts }));
        } catch (dbError) {
          Logger.error("Error fetching social posts:", dbError.message);
          setCorsHeaders(res, origin);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            success: false, 
            error: "Database error",
            message: dbError.message || "Failed to fetch social posts"
          }));
        }
      } else {
        setCorsHeaders(res, origin);
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Endpoint not found" })
        );
      }
      } catch (getError) {
        Logger.error("GET request error:", getError.message);
        Logger.error("GET request error stack:", getError.stack);
        if (!res.headersSent) {
          setCorsHeaders(res, origin);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            success: false, 
            error: "Internal server error",
            message: getError.message || "Failed to process GET request"
          }));
        }
      }
    } else if (req.method === "POST") {
      Logger.debug("POST request received", { fullPath, path });
      
      // Handle body parsing - Vercel may pre-parse, or we need to read from stream
      const parseBody = async () => {
        // Check if body is already parsed (Vercel/serverless)
        if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
          Logger.debug("Using pre-parsed body from req.body");
          return req.body;
        } else if (typeof req.body === "string") {
          try {
            Logger.debug("Parsing req.body string");
            return JSON.parse(req.body);
          } catch (e) {
            // Will read from stream below
          }
        }
        
        // Read from stream if not pre-parsed
        return new Promise((resolve, reject) => {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            try {
              Logger.debug("POST body received from stream", { length: body.length });
              const data = body.trim() ? JSON.parse(body) : {};
              resolve(data);
            } catch (parseError) {
              reject(parseError);
            }
          });
          req.on("error", reject);
        });
      };

      try {
        const data = await parseBody();
        Logger.debug("POST data parsed successfully");

          if (path === "clients") {
            const client = await db.addClient(data);

            // Log activity
            await logActivity('client', 'Created', `New client added: ${client.name || client.email}`, 'system', 'CRM', { clientId: client.id });

            // Send welcome email to new client (non-blocking)
            try {
              // Ensure .env is loaded
              require("dotenv").config();

              const EmailHandler = require("../../email-handler");
              const emailHandler = new EmailHandler();

              Logger.info("Sending welcome email to:", client.email);
              Logger.debug(
                "📧 Sending notification to:",
                process.env.BUSINESS_EMAIL ||
                  "Roy.Turner@tnrbusinesssolutions.com"
              );

              emailHandler
                .sendWelcomeEmail(client)
                .then((result) => {
                  if (result.success) {
                    Logger.success("Welcome email sent successfully!", { message: result.message });
                  } else {
                    Logger.error("Failed to send welcome email:", result.error);
                  }
                })
                .catch((err) => {
                  Logger.error("Error sending welcome email:", err.message);
                  Logger.error("Stack:", err.stack);
                });
            } catch (emailError) {
              Logger.error("Failed to initialize email handler:", emailError.message);
              Logger.error("Stack:", emailError.stack);
              Logger.warn("Make sure SMTP_USER and SMTP_PASS are set in .env file");
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

              // Log activity
              await logActivity('lead', 'Created', `New lead added: ${lead.name || lead.email}`, 'system', 'CRM', { leadId: lead.id, source: lead.source });

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

              // Log activity
              await logActivity('lead', 'Imported', `Lead imported from CSV: ${lead.name || lead.email}`, 'system', 'CRM', { leadId: lead.id, source: lead.source });

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
          setCorsHeaders(res);
          res.writeHead(400, { "Content-Type": "application/json" });
          handleUnexpectedError(res, error, 'CRM API');
        }
      } catch (error) {
        console.error("❌ POST body parsing error:", error.message);
        console.error("❌ POST body parsing error stack:", error.stack);
        setCorsHeaders(res, origin);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          success: false, 
          error: "Invalid request body",
          message: error.message 
        }));
      }
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

            // Log activity
            await logActivity('client', 'Updated', `Client updated: ${client.name || client.email}`, 'system', 'CRM', { clientId: client.id, changes: Object.keys(data) });

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
            const client = await db.getClient(id);
            await db.deleteClient(id);
            
            // Log activity
            await logActivity('client', 'Deleted', `Client deleted: ${client?.name || client?.email || id}`, 'system', 'CRM', { clientId: id });
            
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: "Client deleted successfully" }));
          } else if (resourceType === "leads") {
            const lead = await db.getLead(id);
            await db.deleteLead(id);
            
            // Log activity
            await logActivity('lead', 'Deleted', `Lead deleted: ${lead?.name || lead?.email || id}`, 'system', 'CRM', { leadId: id });
            
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
    console.error("❌ API Error stack:", error.stack);
    if (!res.headersSent) {
      const origin = req.headers.origin || req.headers.referer;
      setCorsHeaders(res, origin);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ 
        success: false, 
        error: "Internal server error",
        message: error.message 
      }));
    }
  }
};
