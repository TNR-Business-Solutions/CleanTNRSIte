const axios = require('axios');

const GRAPH_VERSION = 'v19.0';
const METRIC_DEFINITIONS = {
  page_reach: { key: 'reach', label: 'Reach (7 days)' },
  page_impressions: { key: 'impressions', label: 'Impressions' },
  page_post_engagements: { key: 'engagements', label: 'Post Engagements' },
  page_fan_adds_unique: { key: 'newFollowers', label: 'New Followers' }
};
const METRICS = Object.keys(METRIC_DEFINITIONS);

function normalizeValue(raw) {
  if (raw == null) return 0;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'object') {
    return Object.values(raw).reduce((sum, value) => sum + (Number(value) || 0), 0);
  }
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : 0;
}

function buildMetricSummary(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      total: 0,
      average: 0,
      latest: 0,
      previous: null,
      change: null,
      direction: 'flat',
      values: []
    };
  }

  const values = entries
    .filter(entry => entry && entry.end_time)
    .map(entry => ({
      date: entry.end_time,
      value: normalizeValue(entry.value)
    }))
    .filter(entry => Number.isFinite(entry.value));

  if (!values.length) {
    return {
      total: 0,
      average: 0,
      latest: 0,
      previous: null,
      change: null,
      direction: 'flat',
      values: []
    };
  }

  const total = values.reduce((sum, entry) => sum + entry.value, 0);
  const average = total / values.length;
  const latest = values[values.length - 1].value;
  const previous = values.length > 1 ? values[values.length - 2].value : null;
  let change = null;
  let direction = 'flat';

  if (previous !== null) {
    if (previous === 0) {
      change = latest === 0 ? 0 : 100;
    } else {
      change = ((latest - previous) / Math.abs(previous)) * 100;
    }
    change = Number(change.toFixed(1));
    if (latest > previous) direction = 'up';
    else if (latest < previous) direction = 'down';
  }

  return {
    total,
    average,
    latest,
    previous,
    change,
    direction,
    values
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  const { pageAccessToken, pageId, days = 7 } = req.body || {};

  if (!pageAccessToken) {
    return res.status(400).json({
      success: false,
      error: 'Missing page access token',
      message: 'Please provide a valid Facebook Page Access Token'
    });
  }

  try {
    let targetPageId = pageId;

    if (!targetPageId) {
      const pageInfoResponse = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me`, {
        params: {
          access_token: pageAccessToken,
          fields: 'id,name'
        },
        timeout: 10000
      });
      targetPageId = pageInfoResponse.data.id;
    }

    const now = new Date();
    const sinceDate = new Date(now);
    sinceDate.setDate(sinceDate.getDate() - (Number(days) > 1 ? Number(days) - 1 : 0));

    const since = Math.floor(sinceDate.setHours(0, 0, 0, 0) / 1000);
    const until = Math.floor(now.setHours(23, 59, 59, 999) / 1000);

    const [pageDetailsResponse, insightsResponse] = await Promise.all([
      axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${targetPageId}`, {
        params: {
          access_token: pageAccessToken,
          fields: 'id,name,category,fan_count,followers_count,picture{url},instagram_business_account'
        },
        timeout: 10000
      }),
      axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${targetPageId}/insights`, {
        params: {
          access_token: pageAccessToken,
          metric: METRICS.join(','),
          period: 'day',
          since,
          until
        },
        timeout: 10000
      })
    ]);

    const page = pageDetailsResponse.data || {};
    const insights = insightsResponse.data?.data || [];

    const metrics = {};
    const timeseries = {};

    insights.forEach(entry => {
      const definition = METRIC_DEFINITIONS[entry.name];
      if (!definition) return;

      const summary = buildMetricSummary(entry.values || []);
      metrics[definition.key] = {
        label: definition.label,
        total: summary.total,
        average: Number(summary.average.toFixed(1)),
        latest: summary.latest,
        previous: summary.previous,
        change: summary.change,
        direction: summary.direction
      };

      timeseries[definition.key] = summary.values.map(point => ({
        date: point.date,
        value: point.value
      }));
    });

    const reachTotal = metrics.reach?.total || 0;
    const engagementTotal = metrics.engagements?.total || 0;
    const engagementRate = reachTotal > 0
      ? Number(((engagementTotal / reachTotal) * 100).toFixed(2))
      : null;

    return res.status(200).json({
      success: true,
      fetchedAt: new Date().toISOString(),
      dateRange: {
        since: new Date(since * 1000).toISOString(),
        until: new Date(until * 1000).toISOString()
      },
      page: {
        id: page.id,
        name: page.name,
        category: page.category,
        fanCount: page.fan_count,
        followersCount: page.followers_count,
        pictureUrl: page.picture?.data?.url,
        hasInstagram: Boolean(page.instagram_business_account)
      },
      metrics,
      timeseries,
      engagementRate
    });
  } catch (error) {
    console.error('Facebook insights error:', error.message);
    console.error('Error details:', error.response?.data);

    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      return res.status(400).json({
        success: false,
        error: 'Facebook API Error',
        message: fbError.message || 'Failed to fetch Facebook insights',
        errorType: fbError.type,
        errorCode: fbError.code,
        details: fbError
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred while fetching insights'
    });
  }
};



