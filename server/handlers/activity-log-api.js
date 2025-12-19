/**
 * Activity Log API
 * Tracks and retrieves system activity for the admin dashboard
 */

const TNRDatabase = require("../../database");
const { setCorsHeaders, handleCorsPreflight } = require("./cors-utils");
const {
  sendErrorResponse,
  handleUnexpectedError,
  ERROR_CODES,
} = require("./error-handler");
const { verifyToken, extractToken } = require("./jwt-utils");

let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new TNRDatabase();
    await dbInstance.initialize();
    await ensureActivityLogTable();
  }
  return dbInstance;
}

async function ensureActivityLogTable() {
  const db = await getDatabase();

  // Use PostgreSQL-compatible syntax
  if (db.usePostgres) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        action TEXT NOT NULL,
        description TEXT,
        user TEXT,
        module TEXT,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } else {
    // SQLite syntax
    await db.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        action TEXT NOT NULL,
        description TEXT,
        user TEXT,
        module TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Create indexes
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(type)
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at)
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_activity_module ON activity_log(module)
  `);
}

// Log activity (can be called from other modules)
async function logActivity(
  type,
  action,
  description,
  user = "system",
  module = null,
  metadata = null
) {
  try {
    const db = await getDatabase();
    await db.query(
      `
      INSERT INTO activity_log (type, action, description, user, module, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        type,
        action,
        description,
        user,
        module,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw - activity logging should not break the app
  }
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  // JWT Authentication
  const token = extractToken(req);
  if (!token) {
    return res.writeHead(401) || res.end(JSON.stringify({
      success: false,
      error: "Authentication required",
      message: "No token provided"
    }));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.writeHead(401) || res.end(JSON.stringify({
      success: false,
      error: "Invalid token",
      message: "Token verification failed"
    }));
  }
  req.user = decoded;

  try {
    const db = await getDatabase();
    const method = req.method;

    // Parse query parameters from req.query (Vercel) or req.url
    const queryParams = req.query || {};
    const limit = parseInt(queryParams.limit) || 50;
    const offset = parseInt(queryParams.offset) || 0;
    const type = queryParams.type;
    const module = queryParams.module;

    // GET - List activities
    if (method === "GET") {
      let sql = "SELECT * FROM activity_log WHERE 1=1";
      const params = [];

      if (type) {
        sql += " AND type = ?";
        params.push(type);
      }

      if (module) {
        sql += " AND module = ?";
        params.push(module);
      }

      sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params.push(limit, offset);

      const result = await db.query(sql, params);
      const activities = (result || []).map((item) => ({
        id: item.id,
        type: item.type,
        action: item.action,
        description: item.description,
        user: item.user,
        module: item.module,
        metadata: item.metadata ? JSON.parse(item.metadata) : null,
        createdAt: item.created_at,
      }));

      return res.status(200).json({
        success: true,
        data: activities,
        count: activities.length,
      });
    }

    // POST - Log new activity
    if (method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const activityData = JSON.parse(body);

          if (!activityData.type || !activityData.action) {
            return sendErrorResponse(
              res,
              ERROR_CODES.VALIDATION_ERROR,
              "Type and action are required"
            );
          }

          await logActivity(
            activityData.type,
            activityData.action,
            activityData.description || null,
            activityData.user || "system",
            activityData.module || null,
            activityData.metadata || null
          );

          return res.status(200).json({
            success: true,
            message: "Activity logged successfully",
          });
        } catch (error) {
          return handleUnexpectedError(res, error, "Activity Log API");
        }
      });
      return;
    }

    return sendErrorResponse(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      "Method not allowed"
    );
  } catch (error) {
    return handleUnexpectedError(res, error, "Activity Log API");
  }
};

// Export logActivity for use in other modules
module.exports.logActivity = logActivity;
