// Posts Management API
// Handles GET requests for social media posts with filtering and pagination

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
      message: "No token provided",
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendJson(res, 401, {
      success: false,
      error: "Invalid token",
      message: "Token verification failed",
    });
  }
  req.user = decoded;

  try {
    const db = new TNRDatabase();
    await db.initialize();

    const query = parseQuery(req);

    // Parse filters
    const platform = query.platform || null;
    const status = query.status || null;
    const dateRange = query.dateRange || "this-month";
    const search = query.search || null;
    const limit = parseInt(query.limit) || 50;
    const offset = parseInt(query.offset) || 0;

    // Calculate date range
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month

    if (dateRange === "last-month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (dateRange === "last-7-days") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "last-30-days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "all") {
      startDate = new Date(0); // Beginning of time
    }

    const startDateISO = startDate.toISOString();

    // Build query
    let sql = `SELECT * FROM social_media_posts WHERE createdAt >= ?`;
    const params = [startDateISO];

    // Add filters
    if (platform) {
      sql += ` AND platform = ?`;
      params.push(platform);
    }

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (content LIKE ? OR clientName LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Order by most recent first
    sql += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query
    const posts = await db.query(sql, params);

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM social_media_posts WHERE createdAt >= ?`;
    const countParams = [startDateISO];

    if (platform) {
      countSql += ` AND platform = ?`;
      countParams.push(platform);
    }

    if (status) {
      countSql += ` AND status = ?`;
      countParams.push(status);
    }

    if (search) {
      countSql += ` AND (content LIKE ? OR clientName LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }

    const countResult = await db.query(countSql, countParams);
    const total = countResult && countResult[0] ? countResult[0].total : 0;

    // Parse metadata JSON if it exists
    const formattedPosts = posts.map((post) => {
      let metadata = {};
      try {
        if (post.metadata) {
          metadata =
            typeof post.metadata === "string"
              ? JSON.parse(post.metadata)
              : post.metadata;
        }
      } catch (e) {
        // Keep empty metadata if parsing fails
      }

      return {
        id: post.id,
        platform: post.platform,
        content: post.content,
        scheduledDate: post.scheduledDate,
        publishedDate: post.publishedDate,
        status: post.status,
        clientName: post.clientName,
        contentType: post.contentType,
        hashtags: post.hashtags,
        imageUrl: post.imageUrl,
        metadata: metadata,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        // Calculate engagement from metadata if available
        engagement: metadata.engagement || metadata.likes || 0,
        likes: metadata.likes || 0,
        comments: metadata.comments || 0,
        shares: metadata.shares || 0,
        url: metadata.url || null,
        error: metadata.error || null,
      };
    });

    return sendJson(res, 200, {
      success: true,
      data: formattedPosts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Posts API error:", error);
    return sendError(res, 500, "Failed to fetch posts");
  }
};
