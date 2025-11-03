// TNR Business Solutions - CRM API Endpoints
// Handles all database operations for the admin dashboard

const TNRDatabase = require("../database");
const { URL } = require("url");

// Initialize database connection
let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new TNRDatabase();
    await dbInstance.initialize();
  }
  return dbInstance;
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

// CRM API Handler
module.exports = async function crmApiHandler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const db = await getDatabase();
  let fullPath = req.url;
  // Extract the path after /api/crm/
  const match = fullPath.match(/\/api\/crm\/(.*)/);
  const path = match ? match[1] : "";
  const parsedUrl = (() => {
    try {
      // Provide a base to satisfy WHATWG URL on Node
      return new URL(fullPath, "http://localhost");
    } catch (e) {
      return null;
    }
  })();

  try {
    if (req.method === "GET") {
      if (path === "clients" || path === "") {
        let clients = await db.getClients();
        if (parsedUrl) {
          const q = (parsedUrl.searchParams.get("q") || "").toLowerCase();
          const status = parsedUrl.searchParams.get("status");
          const businessType = parsedUrl.searchParams.get("businessType");
          const source = parsedUrl.searchParams.get("source");
          const sort = parsedUrl.searchParams.get("sort") || "createdAt";
          const order = (parsedUrl.searchParams.get("order") || "desc").toLowerCase();

          if (q) {
            clients = clients.filter((c) =>
              [c.name, c.email, c.phone, c.company, c.industry, c.businessType, c.source]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
            );
          }
          if (status) clients = clients.filter((c) => c.status === status);
          if (businessType) clients = clients.filter((c) => (c.businessType || "") === businessType);
          if (source) clients = clients.filter((c) => (c.source || "") === source);

          clients.sort((a, b) => {
            const av = a[sort] ?? "";
            const bv = b[sort] ?? "";
            if (av < bv) return order === "asc" ? -1 : 1;
            if (av > bv) return order === "asc" ? 1 : -1;
            return 0;
          });
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: clients }));
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
        let leads = await db.getLeads();
        if (parsedUrl) {
          const q = (parsedUrl.searchParams.get("q") || "").toLowerCase();
          const status = parsedUrl.searchParams.get("status");
          const businessType = parsedUrl.searchParams.get("businessType");
          const source = parsedUrl.searchParams.get("source");
          const interest = parsedUrl.searchParams.get("interest");
          const sort = parsedUrl.searchParams.get("sort") || "createdAt";
          const order = (parsedUrl.searchParams.get("order") || "desc").toLowerCase();

          if (q) {
            leads = leads.filter((l) =>
              [l.name, l.email, l.phone, l.company, l.industry, l.businessType, l.source, l.interest]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
            );
          }
          if (status) leads = leads.filter((l) => l.status === status);
          if (businessType) leads = leads.filter((l) => (l.businessType || "") === businessType);
          if (source) leads = leads.filter((l) => (l.source || "") === source);
          if (interest) leads = leads.filter((l) => (l.interest || "") === interest);

          leads.sort((a, b) => {
            const av = a[sort] ?? "";
            const bv = b[sort] ?? "";
            if (av < bv) return order === "asc" ? -1 : 1;
            if (av > bv) return order === "asc" ? 1 : -1;
            return 0;
          });
        }
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
        const status = parsedUrl ? parsedUrl.searchParams.get("status") || null : null;
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
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const data = JSON.parse(body);

          if (path === "clients") {
            const client = await db.addClient(data);
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: client }));
          } else if (path === "leads") {
            const lead = await db.addLead(data);
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: lead }));
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
                JSON.stringify({ success: false, error: "CSV must include header and at least one row" })
              );
            }
            const headers = lines[0].split(delimiter).map((h) => h.trim());
            const required = ["firstName","lastName","phone","email","businessType","businessName","businessAddress","source","interest","notes"];
            // Proceed even if some are missing; map what we can
            const created = [];
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(delimiter).map((c) => c.trim());
              const row = Object.fromEntries(headers.map((h, idx) => [h, cols[idx] ?? ""]));
              const name = [row.firstName || "", row.lastName || ""].join(" ").trim() || row.name || row.businessName || "";
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
            }
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, createdCount: created.length }));
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, error: "Endpoint not found" })
            );
          }
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: error.message }));
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
            const client = await db.updateClient(data.id, data);
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
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });
    } else if (req.method === "DELETE") {
      if (path.startsWith("clients/")) {
        const id = path.replace("clients/", "");
        await db.deleteClient(id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } else if (path.startsWith("leads/")) {
        const id = path.replace("leads/", "");
        await db.deleteLead(id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } else if (path.startsWith("orders/")) {
        const id = path.replace("orders/", "");
        await db.deleteOrder(id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
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
    console.error("❌ API Error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: error.message }));
  }
};
