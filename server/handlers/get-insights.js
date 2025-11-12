const axios = require('axios');

const GRAPH_VERSION = 'v19.0';

// Facebook Page metrics (for Facebook Pages)
const FACEBOOK_PAGE_METRICS = {
  page_impressions: { key: 'impressions', label: 'Impressions' },
  page_impressions_unique: { key: 'reach', label: 'Reach (Unique Users)' },
  page_engaged_users: { key: 'engagements', label: 'Engaged Users' },
  page_fans: { key: 'fanCount', label: 'Total Fans' }
};

// Instagram Business Account metrics (different from Facebook Page metrics)
// Note: Instagram insights metrics must be requested for the Instagram Business Account ID, not the Facebook Page ID
// Valid Instagram metrics for account-level insights (v19.0):
// - impressions: Account impressions
// - reach: Account reach
// Note: profile_views and website_clicks may require additional permissions or may not be available
// Only use the most basic metrics that are universally available
const INSTAGRAM_METRICS = {
  impressions: { key: 'impressions', label: 'Impressions' },
  reach: { key: 'reach', label: 'Reach (Unique Users)' }
};

// Fallback metrics if primary ones fail
const FACEBOOK_FALLBACK_METRICS = ['page_impressions', 'page_impressions_unique'];
const INSTAGRAM_FALLBACK_METRICS = ['impressions']; // Use only impressions as fallback for Instagram

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

  const { pageAccessToken, pageId, days = 7, platform = 'facebook' } = req.body || {};

  if (!pageAccessToken) {
    return res.status(400).json({
      success: false,
      error: 'Missing page access token',
      message: 'Please provide a valid Facebook Page Access Token'
    });
  }

  try {
    let targetPageId = pageId;
    let isInstagram = false;
    let instagramAccountId = null;
    let facebookPageId = null;

    // Step 1: Get Facebook Page info first to check for Instagram connection
    console.log('Fetching Facebook Page info...');
    const pageInfoResponse = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me`, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,name,category,fan_count,followers_count,picture{url},instagram_business_account'
      },
      timeout: 10000
    }).catch(async (error) => {
      // If /me fails, try using pageId if provided
      if (targetPageId) {
        try {
          return await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${targetPageId}`, {
            params: {
              access_token: pageAccessToken,
              fields: 'id,name,category,fan_count,followers_count,picture{url},instagram_business_account'
            },
            timeout: 10000
          });
        } catch (pageError) {
          throw error; // Throw original error
        }
      }
      throw error;
    });

    const pageInfo = pageInfoResponse.data;
    facebookPageId = pageInfo.id;
    
    // Step 2: Check if Instagram Business Account is connected
    if (pageInfo.instagram_business_account) {
      instagramAccountId = pageInfo.instagram_business_account.id;
      console.log('✅ Found Instagram Business Account:', instagramAccountId);
      
      // Determine which platform to fetch insights for
      if (platform === 'instagram') {
        // Explicitly requested Instagram insights
        isInstagram = true;
        targetPageId = instagramAccountId; // Use Instagram account ID for insights
        console.log('📷 Fetching Instagram insights for account:', instagramAccountId);
      } else if (platform === 'facebook') {
        // Explicitly requested Facebook insights
        isInstagram = false;
        targetPageId = facebookPageId;
        console.log('📘 Fetching Facebook Page insights for page:', facebookPageId);
      } else {
        // Default to Facebook if platform not specified
        isInstagram = false;
        targetPageId = facebookPageId;
        console.log('📘 Defaulting to Facebook Page insights for page:', facebookPageId);
      }
    } else {
      // No Instagram account connected
      if (platform === 'instagram') {
        return res.status(400).json({
          success: false,
          error: 'No Instagram Business Account',
          message: 'This Facebook Page does not have an Instagram Business Account connected.',
          help: [
            '1. Go to your Facebook Page Settings → Instagram',
            '2. Connect your Instagram Business or Creator account',
            '3. Make sure your Instagram account is Business or Creator (not Personal)',
            '4. Reconnect via OAuth after connecting Instagram'
          ],
          facebookPageId: facebookPageId
        });
      }
      // Fetch Facebook Page insights
      isInstagram = false;
      targetPageId = facebookPageId || targetPageId;
      console.log('📘 No Instagram connected, fetching Facebook Page insights for page:', targetPageId);
    }

    // Step 3: If pageId was explicitly provided, verify it matches our detection
    if (pageId && pageId !== targetPageId && pageId !== facebookPageId && pageId !== instagramAccountId) {
      console.log('⚠️ Provided pageId does not match detected accounts, checking if it\'s an Instagram account...');
      try {
        const accountCheck = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}`, {
          params: {
            access_token: pageAccessToken,
            fields: 'id,username,name,profile_picture_url,followers_count'
          },
          timeout: 10000
        });
        
        // If it has a username field, it's an Instagram account
        if (accountCheck.data.username) {
          isInstagram = true;
          targetPageId = pageId;
          instagramAccountId = pageId;
          console.log('✅ Detected Instagram account from provided pageId:', pageId);
        } else {
          // It's a Facebook Page
          isInstagram = false;
          targetPageId = pageId;
          facebookPageId = pageId;
          console.log('✅ Detected Facebook Page from provided pageId:', pageId);
        }
      } catch (checkError) {
        console.warn('⚠️ Could not verify provided pageId:', checkError.message);
        // Continue with our detected account
      }
    }
    
    console.log('🎯 Final configuration:', {
      isInstagram,
      targetPageId,
      facebookPageId,
      instagramAccountId,
      platform
    });

    const now = new Date();
    const sinceDate = new Date(now);
    sinceDate.setDate(sinceDate.getDate() - (Number(days) > 1 ? Number(days) - 1 : 0));

    const since = Math.floor(sinceDate.setHours(0, 0, 0, 0) / 1000);
    const until = Math.floor(now.setHours(23, 59, 59, 999) / 1000);

    // Choose metrics based on account type
    const METRIC_DEFINITIONS = isInstagram ? INSTAGRAM_METRICS : FACEBOOK_PAGE_METRICS;
    const METRICS = Object.keys(METRIC_DEFINITIONS);
    const FALLBACK_METRICS = isInstagram ? INSTAGRAM_FALLBACK_METRICS : FACEBOOK_FALLBACK_METRICS;

    // Fetch account details and insights
    let pageDetailsResponse;
    let insightsResponse;

    try {
      if (isInstagram) {
        // For Instagram, get account info
        pageDetailsResponse = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${targetPageId}`, {
          params: {
            access_token: pageAccessToken,
            fields: 'id,username,name,profile_picture_url,followers_count'
          },
          timeout: 10000
        });
      } else {
        // For Facebook Pages
        pageDetailsResponse = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${targetPageId}`, {
          params: {
            access_token: pageAccessToken,
            fields: 'id,name,category,fan_count,followers_count,picture{url},instagram_business_account'
          },
          timeout: 10000
        });
      }

      // Fetch insights - use correct account ID and metrics
      console.log(`📊 Fetching insights for ${isInstagram ? 'Instagram' : 'Facebook'} account:`, targetPageId);
      console.log(`📊 Using metrics:`, METRICS.join(', '));
      
      insightsResponse = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${targetPageId}/insights`, {
        params: {
          access_token: pageAccessToken,
          metric: METRICS.join(','),
          period: isInstagram ? 'day' : 'day', // Both use 'day' period
          since,
          until
        },
        timeout: 10000
      }).catch(async (error) => {
        // If insights fail due to invalid metrics, try with fallback set
        const errorMsg = error.response?.data?.error?.message || error.message;
        const errorCode = error.response?.data?.error?.code;
        console.log('❌ Primary metrics failed:', errorMsg);
        console.log('   Error code:', errorCode);
        console.log('   Account ID:', targetPageId);
        console.log('   Is Instagram:', isInstagram);
        console.log('   Metrics attempted:', METRICS.join(', '));
        
        // For Instagram, if basic metrics fail, try with minimal metrics
        if (isInstagram && FALLBACK_METRICS.length > 0) {
          console.log('🔄 Trying fallback metrics for Instagram:', FALLBACK_METRICS.join(', '));
          try {
            return await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${targetPageId}/insights`, {
              params: {
                access_token: pageAccessToken,
                metric: FALLBACK_METRICS.join(','),
                period: 'day',
                since,
                until
              },
              timeout: 10000
            });
          } catch (fallbackError) {
            const fallbackMsg = fallbackError.response?.data?.error?.message || fallbackError.message;
            console.warn('❌ Fallback metrics also failed:', fallbackMsg);
            
            // If it's a permissions error or invalid metric error, return empty insights
            if (fallbackError.response?.data?.error?.code === 100 || 
                fallbackError.response?.data?.error?.code === 200) {
              console.warn('⚠️ Instagram insights not available (may require additional permissions or account setup)');
              return { data: { data: [] } };
            }
            throw fallbackError;
          }
        }
        
        // For Facebook, try fallback metrics
        if (!isInstagram && FALLBACK_METRICS.length > 0) {
          console.log('🔄 Trying fallback metrics for Facebook:', FALLBACK_METRICS.join(', '));
          try {
            return await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${targetPageId}/insights`, {
              params: {
                access_token: pageAccessToken,
                metric: FALLBACK_METRICS.join(','),
                period: 'day',
                since,
                until
              },
              timeout: 10000
            });
          } catch (fallbackError) {
            console.warn('❌ Fallback metrics also failed, returning empty insights');
            return { data: { data: [] } };
          }
        }
        
        // If no fallback available or fallback also failed, return empty insights
        console.warn('⚠️ Returning empty insights due to API error');
        return { data: { data: [] } };
      });
    } catch (fetchError) {
      console.error('Error fetching account details or insights:', fetchError.message);
      throw fetchError;
    }

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
    const impressionsTotal = metrics.impressions?.total || 0;
    const engagementTotal = metrics.engagements?.total || 0;
    const engagementRate = reachTotal > 0
      ? Number(((engagementTotal / reachTotal) * 100).toFixed(2))
      : null;

    // Add new followers calculation
    let newFollowers = 0;
    if (isInstagram) {
      // For Instagram, we don't have fan_count history easily, so set to 0
      const currentFollowers = page.followers_count || 0;
      newFollowers = 0; // Instagram API doesn't provide historical follower data easily
    } else {
      // For Facebook Pages
      const currentFans = page.fan_count || 0;
      const previousFans = metrics.fanCount?.previous || currentFans;
      newFollowers = Math.max(0, currentFans - previousFans);
    }

    // Add new followers to metrics if not already there
    if (!metrics.newFollowers && !isInstagram) {
      metrics.newFollowers = {
        label: 'New Followers',
        total: newFollowers,
        average: Number((newFollowers / days).toFixed(1)),
        latest: newFollowers,
        previous: 0,
        change: newFollowers > 0 ? 100 : 0,
        direction: newFollowers > 0 ? 'up' : 'flat'
      };
    }

    return res.status(200).json({
      success: true,
      fetchedAt: new Date().toISOString(),
      dateRange: {
        since: new Date(since * 1000).toISOString(),
        until: new Date(until * 1000).toISOString()
      },
      platform: isInstagram ? 'instagram' : 'facebook',
      page: isInstagram ? {
        id: page.id,
        name: page.name || page.username,
        username: page.username,
        followersCount: page.followers_count,
        pictureUrl: page.profile_picture_url,
        isInstagram: true
      } : {
        id: page.id,
        name: page.name,
        category: page.category,
        fanCount: page.fan_count,
        followersCount: page.followers_count,
        pictureUrl: page.picture?.data?.url,
        hasInstagram: Boolean(page.instagram_business_account),
        isInstagram: false
      },
      metrics,
      timeseries,
      engagementRate,
      newFollowers: isInstagram ? 0 : newFollowers
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



