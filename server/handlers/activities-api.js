// Activities API
// Handles activity timeline operations for clients and leads

const TNRDatabase = require('../../database');
const { parseQuery, parseBody, sendJson } = require('./http-utils');
const { verifyToken, extractToken } = require('./jwt-utils');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
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

  const db = new TNRDatabase();
  await db.initialize();

  try {
    // GET - Get activities for an entity
    if (req.method === 'GET') {
      const query = parseQuery(req);
      const entityType = query.entityType; // 'client' or 'lead'
      const entityId = query.entityId;

      if (!entityType || !entityId) {
        sendJson(res, 400, {
          success: false,
          error: 'entityType and entityId are required'
        });
        return;
      }

      const activities = await db.getActivities(entityType, entityId);

      sendJson(res, 200, {
        success: true,
        activities: activities
      });
      return;
    }

    // POST - Add new activity
    if (req.method === 'POST') {
      const activityData = await parseBody(req);

      if (!activityData.entityType || !activityData.entityId || !activityData.activityType) {
        sendJson(res, 400, {
          success: false,
          error: 'entityType, entityId, and activityType are required'
        });
        return;
      }

      const activity = await db.addActivity(activityData);

      sendJson(res, 200, {
        success: true,
        activity: activity,
        message: 'Activity added successfully'
      });
      return;
    }

    // DELETE - Remove activity
    if (req.method === 'DELETE') {
      const query = parseQuery(req);
      const { activityId } = query;

      if (!activityId) {
        sendJson(res, 400, {
          success: false,
          error: 'activityId is required'
        });
        return;
      }

      await db.deleteActivity(activityId);

      sendJson(res, 200, {
        success: true,
        message: 'Activity deleted successfully'
      });
      return;
    }

    sendJson(res, 405, {
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Activities API error:', error);
    sendJson(res, 500, {
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

