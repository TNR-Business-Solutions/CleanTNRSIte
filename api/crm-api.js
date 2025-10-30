// TNR Business Solutions - CRM API Endpoints
// Handles all database operations for the admin dashboard

const TNRDatabase = require("../database");

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

  try {
    if (req.method === "GET") {
      if (path === "clients" || path === "") {
        const clients = await db.getClients();
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
        const leads = await db.getLeads();
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
        const status = url.searchParams.get("status") || null;
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
