// Messages Management API
// Handles GET requests for messages from WhatsApp, Instagram, Facebook Messenger, etc.

const TNRDatabase = require("../../database");
const { parseQuery, sendJson, sendError } = require("./http-utils");
const { setCorsHeaders, handleCorsPreflight } = require("./cors-utils");
const { verifyToken, extractToken } = require("./jwt-utils");

module.exports = async (req, res) => {
  // Handle CORS
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  if (req.method !== "GET") {
    return sendError(res, 405, "Method not allowed");
  }

  // JWT Authentication
  const token = extractToken(req);
  if (!token) {
    return sendJson(res, 401, {
      success: false,
      error: "Authentication required",
      message: "No token provided"
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendJson(res, 401, {
      success: false,
      error: "Invalid token",
      message: "Token verification failed"
    });
  }
  req.user = decoded;

  try {
    const db = new TNRDatabase();
    await db.initialize();

    const query = parseQuery(req);

    // Parse filters
    const platform = query.platform || null;
    const direction = query.direction || null;
    const status = query.status || null;
    const search = query.search || null;
    const limit = parseInt(query.limit) || 50;
    const offset = parseInt(query.offset) || 0;

    // Check if messages table exists, if not, use form_submissions as fallback
    let messages = [];
    let total = 0;

    try {
      // Try to query messages table
      let sql = `SELECT * FROM messages WHERE 1=1`;
      const params = [];

      // Add filters
      if (platform) {
        sql += ` AND platform = ?`;
        params.push(platform);
      }

      if (direction) {
        sql += ` AND direction = ?`;
        params.push(direction);
      }

      if (status) {
        sql += ` AND status = ?`;
        params.push(status);
      }

      if (search) {
        sql += ` AND (content LIKE ? OR "from" LIKE ? OR "to" LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      // Order by most recent first
      sql += ` ORDER BY timestamp DESC, createdAt DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      messages = await db.query(sql, params);

      // Get total count
      let countSql = `SELECT COUNT(*) as total FROM messages WHERE 1=1`;
      const countParams = [];

      if (platform) {
        countSql += ` AND platform = ?`;
        countParams.push(platform);
      }

      if (direction) {
        countSql += ` AND direction = ?`;
        countParams.push(direction);
      }

      if (status) {
        countSql += ` AND status = ?`;
        countParams.push(status);
      }

      if (search) {
        countSql += ` AND (content LIKE ? OR "from" LIKE ? OR "to" LIKE ?)`;
        const searchPattern = `%${search}%`;
        countParams.push(searchPattern, searchPattern, searchPattern);
      }

      const countResult = await db.query(countSql, countParams);
      total = countResult && countResult[0] ? countResult[0].total : 0;
    } catch (error) {
      // If messages table doesn't exist, use form_submissions as fallback
      console.log(
        "Messages table not found, using form_submissions as fallback"
      );

      let sql = `SELECT 
        id,
        name as "from",
        email as "to",
        message as content,
        phone,
        'Website Form' as platform,
        'incoming' as direction,
        status,
        submissionDate as timestamp,
        createdAt
      FROM form_submissions WHERE 1=1`;
      const params = [];

      if (search) {
        sql += ` AND (message LIKE ? OR name LIKE ? OR email LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      // Only show incoming for form submissions
      if (direction && direction !== "incoming") {
        messages = [];
        total = 0;
      } else {
        sql += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        messages = await db.query(sql, params);

        // Get total count
        let countSql = `SELECT COUNT(*) as total FROM form_submissions WHERE 1=1`;
        const countParams = [];

        if (search) {
          countSql += ` AND (message LIKE ? OR name LIKE ? OR email LIKE ?)`;
          const searchPattern = `%${search}%`;
          countParams.push(searchPattern, searchPattern, searchPattern);
        }

        const countResult = await db.query(countSql, countParams);
        total = countResult && countResult[0] ? countResult[0].total : 0;
      }
    }

    // Format messages
    const formattedMessages = messages.map((msg) => {
      return {
        id: msg.id,
        platform: msg.platform || "unknown",
        direction: msg.direction || "incoming",
        from: msg.from || msg.name || "Unknown",
        to: msg.to || msg.email || "Unknown",
        content: msg.content || msg.message || msg.text || msg.body || "",
        status: msg.status || "unread",
        timestamp: msg.timestamp || msg.createdAt || msg.created_at,
        messageId: msg.messageId || msg.id,
        phone: msg.phone || null,
        email: msg.email || null,
      };
    });

    return sendJson(res, 200, {
      success: true,
      data: formattedMessages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Messages API error:", error);
    return sendError(res, 500, "Failed to fetch messages");
  }
};
