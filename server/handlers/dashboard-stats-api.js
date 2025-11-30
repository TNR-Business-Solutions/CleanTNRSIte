/**
 * Dashboard Statistics API
 * Provides real-time statistics for the admin dashboard
 */

const TNRDatabase = require('../../database');
const { setCorsHeaders, handleCorsPreflight } = require('./cors-utils');
const { sendErrorResponse, handleUnexpectedError, ERROR_CODES } = require('./error-handler');

let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new TNRDatabase();
    await dbInstance.initialize();
  }
  return dbInstance;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  if (req.method !== 'GET') {
    return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Method not allowed. Only GET requests are accepted.');
  }

  try {
    const db = await getDatabase();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get CRM stats
    const clients = await db.getClients({});
    const leads = await db.getLeads({});
    const orders = await db.getOrders({});

    // Filter by date
    const clientsThisMonth = clients.filter(c => {
      const createdAt = new Date(c.createdAt || c.created_at);
      return createdAt >= startOfMonth;
    });

    const leadsThisMonth = leads.filter(l => {
      const createdAt = new Date(l.createdAt || l.created_at);
      return createdAt >= startOfMonth;
    });

    const ordersThisMonth = orders.filter(o => {
      const createdAt = new Date(o.createdAt || o.created_at);
      return createdAt >= startOfMonth;
    });

    // Calculate revenue
    const totalRevenue = orders.reduce((sum, o) => {
      const amount = parseFloat(o.total || o.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const revenueThisMonth = ordersThisMonth.reduce((sum, o) => {
      const amount = parseFloat(o.total || o.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Get active clients (status = 'Active' or 'active')
    const activeClients = clients.filter(c => {
      const status = (c.status || '').toLowerCase();
      return status === 'active' || status === 'client';
    });

    // Get new leads (status = 'New' or 'new' or created today)
    const newLeads = leads.filter(l => {
      const status = (l.status || '').toLowerCase();
      const createdAt = new Date(l.createdAt || l.created_at);
      return status === 'new' || createdAt >= startOfDay;
    });

    // Calculate conversion rate
    const conversionRate = clients.length > 0 && leads.length > 0
      ? ((clients.length / (clients.length + leads.length)) * 100).toFixed(1)
      : '0.0';

    // Get social media tokens count
    let platformsConnected = 0;
    try {
      const tokens = await db.query('SELECT DISTINCT platform FROM social_media_tokens WHERE access_token IS NOT NULL');
      platformsConnected = tokens ? tokens.length : 0;
    } catch (e) {
      // Table might not exist yet
      platformsConnected = 0;
    }

    // Get campaign stats (if campaigns table exists)
    let campaignsSent = 0;
    let emailsSent = 0;
    try {
      const campaignStats = await db.query(`
        SELECT COUNT(*) as total_campaigns, SUM(recipient_count) as total_emails
        FROM campaigns
        WHERE status = 'sent' AND created_at >= ?
      `, [startOfMonth.toISOString()]);
      
      if (campaignStats && campaignStats.length > 0) {
        campaignsSent = campaignStats[0].total_campaigns || 0;
        emailsSent = campaignStats[0].total_emails || 0;
      }
    } catch (e) {
      // Table might not exist yet
    }

    // Get activity count (if activity_log table exists)
    let recentActivityCount = 0;
    try {
      const activityCount = await db.query(`
        SELECT COUNT(*) as count
        FROM activity_log
        WHERE created_at >= ?
      `, [startOfDay.toISOString()]);
      
      if (activityCount && activityCount.length > 0) {
        recentActivityCount = activityCount[0].count || 0;
      }
    } catch (e) {
      // Table might not exist yet
    }

    const stats = {
      crm: {
        totalClients: clients.length,
        activeClients: activeClients.length,
        totalLeads: leads.length,
        newLeads: newLeads.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        clientsThisMonth: clientsThisMonth.length,
        leadsThisMonth: leadsThisMonth.length,
        ordersThisMonth: ordersThisMonth.length,
        revenueThisMonth: revenueThisMonth,
        conversionRate: conversionRate
      },
      social: {
        platformsConnected: platformsConnected,
        postsThisMonth: 0, // TODO: Track posts
        messagesProcessed: 0, // TODO: Track messages
        analyticsEvents: 0 // TODO: Track analytics
      },
      campaigns: {
        campaignsSent: campaignsSent,
        emailsSent: emailsSent,
        openRate: 0, // TODO: Track opens
        clickRate: 0 // TODO: Track clicks
      },
      activity: {
        recentActivityCount: recentActivityCount,
        lastUpdated: now.toISOString()
      }
    };

    return res.status(200).json({
      success: true,
      data: stats,
      timestamp: now.toISOString()
    });

  } catch (error) {
    return handleUnexpectedError(res, error, 'Dashboard Stats API');
  }
};

