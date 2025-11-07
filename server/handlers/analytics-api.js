// Analytics API
// Tracks and retrieves analytics data for campaigns, CRM, and email metrics

const TNRDatabase = require('../../database');
const { parseQuery, parseBody, sendJson } = require('./http-utils');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let db;
  try {
    db = new TNRDatabase();
    await db.initialize();
  } catch (dbError) {
    console.error('Database initialization error:', dbError);
    // Return empty analytics if database fails (SQLite doesn't work on Vercel)
    if (req.method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: {
          overview: {
            totalClients: 0,
            activeClients: 0,
            newLeads: 0,
            totalOrders: 0,
            conversionRate: 0
          },
          message: 'Database not available. Please configure POSTGRES_URL for production.'
        }
      });
    }
    return sendJson(res, 500, { success: false, error: 'Database unavailable' });
  }

  try {
    // GET - Get analytics data
    if (req.method === 'GET') {
      const query = parseQuery(req);
      const type = query.type || 'overview';
      const startDate = query.startDate;
      const endDate = query.endDate;

      let analytics = {};

      if (type === 'overview' || type === 'all') {
        // Get overall stats
        const stats = await db.getStats();
        const [clients, leads, orders] = await Promise.all([
          db.getClients(),
          db.getLeads(),
          db.getOrders()
        ]);

        // Calculate conversion rates
        const totalLeads = leads.length;
        const convertedLeads = clients.filter(c => c.source?.includes('Lead Conversion')).length;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : 0;

        // Lead source breakdown
        const leadSources = {};
        leads.forEach(lead => {
          const source = lead.source || 'Unknown';
          leadSources[source] = (leadSources[source] || 0) + 1;
        });

        // Business type breakdown
        const businessTypes = {};
        [...clients, ...leads].forEach(item => {
          const type = item.businessType || 'Unknown';
          businessTypes[type] = (businessTypes[type] || 0) + 1;
        });

        analytics = {
          overview: {
            totalClients: stats.totalClients,
            activeClients: stats.activeClients,
            newLeads: stats.newLeads,
            totalLeads: totalLeads,
            conversionRate: parseFloat(conversionRate),
            totalOrders: stats.totalOrders,
            completedOrders: stats.completedOrders,
            totalRevenue: stats.totalRevenue
          },
          leadSources: Object.entries(leadSources).map(([source, count]) => ({
            source,
            count,
            percentage: ((count / totalLeads) * 100).toFixed(1)
          })).sort((a, b) => b.count - a.count),
          businessTypes: Object.entries(businessTypes).map(([type, count]) => ({
            type,
            count
          })).sort((a, b) => b.count - a.count),
          recentActivity: {
            newClients: clients.filter(c => {
              const created = new Date(c.createdAt || c.createdat || Date.now());
              const daysAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
              return daysAgo <= 30;
            }).length,
            newLeads: leads.filter(l => {
              const created = new Date(l.createdAt || l.createdat || Date.now());
              const daysAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
              return daysAgo <= 30;
            }).length
          }
        };
      }

      if (type === 'email' || type === 'all') {
        // Email campaign analytics (would need campaign tracking table)
        // For now, return placeholder structure
        analytics.email = {
          totalSent: 0,
          totalOpened: 0,
          totalClicked: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          campaigns: []
        };
      }

      if (type === 'crm' || type === 'all') {
        // CRM activity analytics
        const [clients, leads] = await Promise.all([
          db.getClients(),
          db.getLeads()
        ]);

        // Status distribution
        const clientStatuses = {};
        clients.forEach(c => {
          const status = c.status || 'Unknown';
          clientStatuses[status] = (clientStatuses[status] || 0) + 1;
        });

        const leadStatuses = {};
        leads.forEach(l => {
          const status = l.status || 'Unknown';
          leadStatuses[status] = (leadStatuses[status] || 0) + 1;
        });

        analytics.crm = {
          clientStatusDistribution: Object.entries(clientStatuses).map(([status, count]) => ({
            status,
            count,
            percentage: ((count / clients.length) * 100).toFixed(1)
          })),
          leadStatusDistribution: Object.entries(leadStatuses).map(([status, count]) => ({
            status,
            count,
            percentage: ((count / leads.length) * 100).toFixed(1)
          }))
        };
      }

      sendJson(res, 200, {
        success: true,
        analytics: analytics
      });
      return;
    }

    // POST - Track an analytics event
    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { eventType, eventData, userId, sessionId, metadata } = body;

      if (!eventType) {
        sendJson(res, 400, {
          success: false,
          error: 'eventType is required'
        });
        return;
      }

      const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await db.execute(
        `INSERT INTO analytics (id, eventType, eventData, userId, sessionId, timestamp, metadata, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventId,
          eventType,
          JSON.stringify(eventData || {}),
          userId || null,
          sessionId || null,
          new Date().toISOString(),
          JSON.stringify(metadata || {}),
          new Date().toISOString()
        ]
      );

      sendJson(res, 200, {
        success: true,
        eventId: eventId,
        message: 'Event tracked successfully'
      });
      return;
    }

    sendJson(res, 405, {
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    sendJson(res, 500, {
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

