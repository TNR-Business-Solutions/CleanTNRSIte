// Analytics Events API
// Handles GET requests for analytics events with filtering and pagination

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
    const eventType = query.eventType || query.type || null;
    const dateRange = query.dateRange || "today";
    const page = query.page || null;
    const search = query.search || null;
    const limit = parseInt(query.limit) || 50;
    const offset = parseInt(query.offset) || 0;

    // Calculate date range
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today

    if (dateRange === "last-7-days") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "last-30-days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "this-month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === "all") {
      startDate = new Date(0); // Beginning of time
    }

    const startDateISO = startDate.toISOString();

    // Build query
    let sql = `SELECT * FROM analytics WHERE createdAt >= ?`;
    const params = [startDateISO];

    // Add filters
    if (eventType) {
      sql += ` AND eventType = ?`;
      params.push(eventType);
    }

    if (search) {
      sql += ` AND (eventData LIKE ? OR eventType LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Order by most recent first
    sql += ` ORDER BY timestamp DESC, createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query
    const events = await db.query(sql, params);

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM analytics WHERE createdAt >= ?`;
    const countParams = [startDateISO];

    if (eventType) {
      countSql += ` AND eventType = ?`;
      countParams.push(eventType);
    }

    if (search) {
      countSql += ` AND (eventData LIKE ? OR eventType LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }

    const countResult = await db.query(countSql, countParams);
    const total = countResult && countResult[0] ? countResult[0].total : 0;

    // Parse event data JSON if it exists
    const formattedEvents = events.map((event) => {
      let eventData = {};
      let metadata = {};

      try {
        if (event.eventData) {
          eventData =
            typeof event.eventData === "string"
              ? JSON.parse(event.eventData)
              : event.eventData;
        }
        if (event.metadata) {
          metadata =
            typeof event.metadata === "string"
              ? JSON.parse(event.metadata)
              : event.metadata;
        }
      } catch (e) {
        // Keep empty objects if parsing fails
      }

      // Extract page from eventData or metadata
      const pageUrl = eventData.page || eventData.url || metadata.page || null;

      return {
        id: event.id,
        eventType: event.eventType,
        description:
          eventData.description ||
          eventData.name ||
          event.eventType ||
          "Analytics event",
        page: pageUrl,
        userId: event.userId,
        sessionId: event.sessionId,
        timestamp: event.timestamp || event.createdAt,
        value: eventData.value || metadata.value || null,
        eventData: eventData,
        metadata: metadata,
        createdAt: event.createdAt,
      };
    });

    // Filter by page if specified (client-side filter since page is in JSON)
    let filteredEvents = formattedEvents;
    if (page) {
      filteredEvents = formattedEvents.filter(
        (e) => e.page && e.page.toLowerCase().includes(page.toLowerCase())
      );
    }

    return sendJson(res, 200, {
      success: true,
      data: filteredEvents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Analytics Events API error:", error);
    return sendError(res, 500, "Failed to fetch analytics events");
  }
};
