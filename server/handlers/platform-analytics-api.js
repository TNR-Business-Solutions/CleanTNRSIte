// Platform Analytics API
// Fetches and aggregates analytics from Google, Facebook, Instagram, X (Twitter), and Nextdoor
// for TNR Business Solutions profiles

const TNRDatabase = require("../../database");
const { parseQuery, parseBody, sendJson } = require("./http-utils");
const { verifyToken, extractToken } = require("./jwt-utils");
const { setCorsHeaders } = require("./cors-utils");
const Logger = require("../utils/logger");
const axios = require("axios");

// Initialize database connection
let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new TNRDatabase();
    await dbInstance.initialize();
  }
  return dbInstance;
}

// Ensure platform_analytics table exists
async function ensurePlatformAnalyticsTable(db) {
  try {
    if (db.usePostgres) {
      // PostgreSQL syntax
      await db.query(`
        CREATE TABLE IF NOT EXISTS platform_analytics (
          id TEXT PRIMARY KEY,
          platform TEXT NOT NULL,
          platformAccountId TEXT,
          accountName TEXT,
          metricType TEXT NOT NULL,
          metricValue REAL,
          metricData TEXT,
          dateRange TEXT,
          fetchedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(platform, platformAccountId, metricType, dateRange)
        )
      `);
    } else {
      // SQLite syntax
      await db.query(`
        CREATE TABLE IF NOT EXISTS platform_analytics (
          id TEXT PRIMARY KEY,
          platform TEXT NOT NULL,
          platformAccountId TEXT,
          accountName TEXT,
          metricType TEXT NOT NULL,
          metricValue REAL,
          metricData TEXT,
          dateRange TEXT,
          fetchedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(platform, platformAccountId, metricType, dateRange)
        )
      `);
    }
  } catch (error) {
    Logger.error("Error creating platform_analytics table:", error);
  }
}

// Fetch Facebook/Instagram Analytics
async function fetchFacebookAnalytics(accessToken, pageId, instagramAccountId) {
  const GRAPH_VERSION = "v19.0";
  const metrics = {
    facebook: {
      page_impressions: "Impressions",
      page_impressions_unique: "Reach",
      page_engaged_users: "Engaged Users",
      page_fans: "Total Fans",
    },
    instagram: {
      impressions: "Impressions",
      reach: "Reach",
      profile_views: "Profile Views",
    },
  };

  const results = {
    facebook: {},
    instagram: {},
  };

  try {
    // Fetch Facebook Page insights
    if (pageId) {
      const fbResponse = await axios.get(
        `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/insights`,
        {
          params: {
            access_token: accessToken,
            metric: Object.keys(metrics.facebook).join(","),
            period: "day",
            since: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
            until: Math.floor(Date.now() / 1000),
          },
          timeout: 10000,
        }
      );

      if (fbResponse.data && fbResponse.data.data) {
        fbResponse.data.data.forEach((metric) => {
          const key = metrics.facebook[metric.name] || metric.name;
          const total = metric.values
            ? metric.values.reduce((sum, v) => sum + (v.value || 0), 0)
            : 0;
          results.facebook[key] = {
            total,
            latest: metric.values?.[metric.values.length - 1]?.value || 0,
            trend: metric.values || [],
          };
        });
      }
    }

    // Fetch Instagram insights
    if (instagramAccountId) {
      const igResponse = await axios.get(
        `https://graph.facebook.com/${GRAPH_VERSION}/${instagramAccountId}/insights`,
        {
          params: {
            access_token: accessToken,
            metric: Object.keys(metrics.instagram).join(","),
            period: "day",
            since: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
            until: Math.floor(Date.now() / 1000),
          },
          timeout: 10000,
        }
      );

      if (igResponse.data && igResponse.data.data) {
        igResponse.data.data.forEach((metric) => {
          const key = metrics.instagram[metric.name] || metric.name;
          const total = metric.values
            ? metric.values.reduce((sum, v) => sum + (v.value || 0), 0)
            : 0;
          results.instagram[key] = {
            total,
            latest: metric.values?.[metric.values.length - 1]?.value || 0,
            trend: metric.values || [],
          };
        });
      }
    }
  } catch (error) {
    Logger.error("Error fetching Facebook/Instagram analytics:", error.message);
  }

  return results;
}

// Fetch Twitter/X Analytics
async function fetchTwitterAnalytics(accessToken, userId) {
  const results = {};

  try {
    // Twitter API v2 analytics endpoint
    // Note: Twitter Analytics API requires specific permissions
    const response = await axios.get(
      `https://api.twitter.com/2/users/${userId}/tweets`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          max_results: 100,
          "tweet.fields": "public_metrics,created_at",
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.data) {
      const tweets = response.data.data;
      const metrics = {
        totalTweets: tweets.length,
        totalLikes: 0,
        totalRetweets: 0,
        totalReplies: 0,
        totalImpressions: 0,
      };

      tweets.forEach((tweet) => {
        if (tweet.public_metrics) {
          metrics.totalLikes += tweet.public_metrics.like_count || 0;
          metrics.totalRetweets += tweet.public_metrics.retweet_count || 0;
          metrics.totalReplies += tweet.public_metrics.reply_count || 0;
          metrics.totalImpressions += tweet.public_metrics.impression_count || 0;
        }
      });

      results.metrics = metrics;
      results.tweets = tweets.slice(0, 10); // Last 10 tweets
    }
  } catch (error) {
    Logger.error("Error fetching Twitter analytics:", error.message);
  }

  return results;
}

// Fetch Nextdoor Analytics
async function fetchNextdoorAnalytics(accessToken) {
  const results = {};

  try {
    // Nextdoor API analytics endpoint
    // Note: Nextdoor API structure may vary - adjust based on their documentation
    const response = await axios.get(
      `https://api.nextdoor.com/v1/analytics`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      }
    );

    if (response.data) {
      results.metrics = response.data;
    }
  } catch (error) {
    Logger.error("Error fetching Nextdoor analytics:", error.message);
    // Nextdoor API might not be fully available yet
    results.error = "Nextdoor analytics API not fully implemented";
  }

  return results;
}

// Fetch Facebook Pixel Analytics
async function fetchFacebookPixelAnalytics(pixelId, accessToken) {
  const results = {};
  const GRAPH_VERSION = "v19.0";

  try {
    // Facebook Events Manager API - Get Pixel events and insights
    // Note: Requires access token with ads_read permission
    const response = await axios.get(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`,
      {
        params: {
          access_token: accessToken,
          since: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
          until: Math.floor(Date.now() / 1000),
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.data) {
      const events = response.data.data;
      const metrics = {
        totalEvents: events.length,
        pageViews: 0,
        purchases: 0,
        leads: 0,
        addToCart: 0,
        initiateCheckout: 0,
        completeRegistration: 0,
      };

      events.forEach((event) => {
        const eventName = (event.event_name || "").toLowerCase();
        if (eventName === "pageview") metrics.pageViews++;
        else if (eventName === "purchase") metrics.purchases++;
        else if (eventName === "lead") metrics.leads++;
        else if (eventName === "addtocart") metrics.addToCart++;
        else if (eventName === "initiatecheckout") metrics.initiateCheckout++;
        else if (eventName === "completeregistration") metrics.completeRegistration++;
      });

      results.metrics = metrics;
      results.events = events.slice(0, 50); // Last 50 events
    }

    // Also fetch pixel insights if available
    try {
      const insightsResponse = await axios.get(
        `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/insights`,
        {
          params: {
            access_token: accessToken,
            metric: "pixel_events",
            period: "day",
            since: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
            until: Math.floor(Date.now() / 1000),
          },
          timeout: 10000,
        }
      );

      if (insightsResponse.data && insightsResponse.data.data) {
        results.insights = insightsResponse.data.data;
      }
    } catch (insightsError) {
      Logger.warn("Pixel insights not available:", insightsError.message);
    }
  } catch (error) {
    Logger.error("Error fetching Facebook Pixel analytics:", error.message);
    results.error = error.message;
  }

  return results;
}

// Fetch Google Business Profile Analytics
async function fetchGoogleBusinessAnalytics(locationId, accessToken) {
  const results = {};

  try {
    // Google My Business API v4 - Get location insights
    const response = await axios.get(
      `https://mybusinessaccountmanagement.googleapis.com/v1/accounts/{accountId}/locations/${locationId}/reportInsights`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          locationNames: `locations/${locationId}`,
          basicRequest: {
            metricRequests: [
              { metric: "QUERIES_DIRECT" },
              { metric: "QUERIES_INDIRECT" },
              { metric: "VIEWS_MAPS" },
              { metric: "VIEWS_SEARCH" },
              { metric: "ACTIONS_WEBSITE" },
              { metric: "ACTIONS_PHONE" },
              { metric: "ACTIONS_DRIVING_DIRECTIONS" },
            ],
            timeRange: {
              startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date().toISOString(),
            },
          },
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.locationMetrics) {
      const metrics = {
        directQueries: 0,
        indirectQueries: 0,
        mapViews: 0,
        searchViews: 0,
        websiteActions: 0,
        phoneActions: 0,
        drivingDirections: 0,
      };

      response.data.locationMetrics.forEach((metric) => {
        if (metric.metric === "QUERIES_DIRECT") metrics.directQueries = metric.metricValue?.value || 0;
        else if (metric.metric === "QUERIES_INDIRECT") metrics.indirectQueries = metric.metricValue?.value || 0;
        else if (metric.metric === "VIEWS_MAPS") metrics.mapViews = metric.metricValue?.value || 0;
        else if (metric.metric === "VIEWS_SEARCH") metrics.searchViews = metric.metricValue?.value || 0;
        else if (metric.metric === "ACTIONS_WEBSITE") metrics.websiteActions = metric.metricValue?.value || 0;
        else if (metric.metric === "ACTIONS_PHONE") metrics.phoneActions = metric.metricValue?.value || 0;
        else if (metric.metric === "ACTIONS_DRIVING_DIRECTIONS") metrics.drivingDirections = metric.metricValue?.value || 0;
      });

      results.metrics = metrics;
    }
  } catch (error) {
    Logger.error("Error fetching Google Business analytics:", error.message);
    results.error = error.message;
  }

  return results;
}

// Fetch Threads Analytics
async function fetchThreadsAnalytics(accessToken, threadId) {
  const results = {};
  const GRAPH_VERSION = "v19.0";

  try {
    // Threads uses Meta Graph API (similar to Instagram)
    // Get thread insights if available
    const response = await axios.get(
      `https://graph.facebook.com/${GRAPH_VERSION}/${threadId}/insights`,
      {
        params: {
          access_token: accessToken,
          metric: "impressions,reach,likes,comments,shares",
          period: "day",
          since: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
          until: Math.floor(Date.now() / 1000),
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.data) {
      const insights = {};
      response.data.data.forEach((metric) => {
        const total = metric.values
          ? metric.values.reduce((sum, v) => sum + (v.value || 0), 0)
          : 0;
        insights[metric.name] = {
          total,
          latest: metric.values?.[metric.values.length - 1]?.value || 0,
          trend: metric.values || [],
        };
      });

      results.metrics = insights;
    }

    // Also get thread info
    try {
      const threadInfo = await axios.get(
        `https://graph.facebook.com/${GRAPH_VERSION}/${threadId}`,
        {
          params: {
            access_token: accessToken,
            fields: "id,thread_type,text,like_count,reply_count,repost_count",
          },
          timeout: 10000,
        }
      );

      if (threadInfo.data) {
        results.threadInfo = threadInfo.data;
      }
    } catch (infoError) {
      Logger.warn("Thread info not available:", infoError.message);
    }
  } catch (error) {
    Logger.error("Error fetching Threads analytics:", error.message);
    results.error = error.message;
  }

  return results;
}

// Fetch LinkedIn Analytics
async function fetchLinkedInAnalytics(accessToken, organizationId) {
  const results = {};

  try {
    // LinkedIn Analytics API - Get organization page analytics
    // Note: Requires organization admin access
    const response = await axios.get(
      `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: "organizationalEntity",
          organizationalEntity: `urn:li:organization:${organizationId}`,
          timeGranularity: "DAILY",
          startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
          endTime: Date.now(),
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.elements) {
      const metrics = {
        totalFollowers: 0,
        newFollowers: 0,
        organicFollowers: 0,
        paidFollowers: 0,
        impressions: 0,
        clicks: 0,
        engagement: 0,
      };

      response.data.elements.forEach((element) => {
        if (element.followerCounts) {
          element.followerCounts.forEach((count) => {
            if (count.followerType === "ORGANIC") {
              metrics.organicFollowers += count.followerCounts?.[0]?.followerCountsByAssociationType?.[0]?.followerCount || 0;
            } else if (count.followerType === "PAID") {
              metrics.paidFollowers += count.followerCounts?.[0]?.followerCountsByAssociationType?.[0]?.followerCount || 0;
            }
            metrics.totalFollowers += count.followerCounts?.[0]?.followerCountsByAssociationType?.[0]?.followerCount || 0;
          });
        }
      });

      results.metrics = metrics;
    }

    // Also fetch page statistics
    try {
      const pageStats = await axios.get(
        `https://api.linkedin.com/v2/organizationalEntityShareStatistics`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            q: "organizationalEntity",
            organizationalEntity: `urn:li:organization:${organizationId}`,
            timeGranularity: "DAILY",
            startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
            endTime: Date.now(),
          },
          timeout: 10000,
        }
      );

      if (pageStats.data && pageStats.data.elements) {
        const shareMetrics = {
          totalShares: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalEngagement: 0,
        };

        pageStats.data.elements.forEach((element) => {
          shareMetrics.totalShares += element.shareCount || 0;
          shareMetrics.totalImpressions += element.impressionCount || 0;
          shareMetrics.totalClicks += element.clickCount || 0;
          shareMetrics.totalEngagement += element.engagement || 0;
        });

        results.shareMetrics = shareMetrics;
      }
    } catch (shareError) {
      Logger.warn("LinkedIn share statistics not available:", shareError.message);
    }
  } catch (error) {
    Logger.error("Error fetching LinkedIn analytics:", error.message);
    results.error = error.message;
  }

  return results;
}

// Fetch Google Analytics data
async function fetchGoogleAnalytics(propertyId, accessToken) {
  const results = {};

  try {
    // Google Analytics Data API v1
    // Note: Requires Google Analytics 4 property ID and OAuth token
    const response = await axios.post(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        dateRanges: [
          {
            startDate: "30daysAgo",
            endDate: "today",
          },
        ],
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "sessions" },
          { name: "bounceRate" },
        ],
        dimensions: [{ name: "date" }],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.rows) {
      const metrics = {
        totalUsers: 0,
        totalPageViews: 0,
        totalSessions: 0,
        averageBounceRate: 0,
        dailyData: [],
      };

      response.data.rows.forEach((row) => {
        const date = row.dimensionValues[0].value;
        const users = parseInt(row.metricValues[0].value || 0);
        const pageViews = parseInt(row.metricValues[1].value || 0);
        const sessions = parseInt(row.metricValues[2].value || 0);
        const bounceRate = parseFloat(row.metricValues[3].value || 0);

        metrics.totalUsers += users;
        metrics.totalPageViews += pageViews;
        metrics.totalSessions += sessions;
        metrics.averageBounceRate += bounceRate;

        metrics.dailyData.push({
          date,
          users,
          pageViews,
          sessions,
          bounceRate,
        });
      });

      metrics.averageBounceRate =
        metrics.dailyData.length > 0
          ? metrics.averageBounceRate / metrics.dailyData.length
          : 0;

      results.metrics = metrics;
    }
  } catch (error) {
    Logger.error("Error fetching Google Analytics:", error.message);
    results.error = error.message;
  }

  return results;
}

// Save analytics to database
async function savePlatformAnalytics(db, platform, accountId, accountName, analytics) {
  const dateRange = "30days";
  const fetchedAt = new Date().toISOString();

  for (const [metricType, metricData] of Object.entries(analytics)) {
    const id = `analytics-${platform}-${accountId}-${metricType}-${Date.now()}`;
    
    try {
      // Use upsert syntax compatible with both SQLite and PostgreSQL
      if (db.usePostgres) {
        // PostgreSQL: Use ON CONFLICT
        await db.query(
          `INSERT INTO platform_analytics 
           (id, platform, platformAccountId, accountName, metricType, metricValue, metricData, dateRange, fetchedAt, createdAt)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (platform, platformAccountId, metricType, dateRange) 
           DO UPDATE SET metricValue = $6, metricData = $7, fetchedAt = $9`,
          [
            id,
            platform,
            accountId,
            accountName,
            metricType,
            typeof metricData === "object" && metricData.total !== undefined
              ? metricData.total
              : typeof metricData === "number"
              ? metricData
              : 0,
            JSON.stringify(metricData),
            dateRange,
            fetchedAt,
            fetchedAt,
          ]
        );
      } else {
        // SQLite: Use INSERT OR REPLACE
        await db.query(
          `INSERT OR REPLACE INTO platform_analytics 
           (id, platform, platformAccountId, accountName, metricType, metricValue, metricData, dateRange, fetchedAt, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            platform,
            accountId,
            accountName,
            metricType,
            typeof metricData === "object" && metricData.total !== undefined
              ? metricData.total
              : typeof metricData === "number"
              ? metricData
              : 0,
            JSON.stringify(metricData),
            dateRange,
            fetchedAt,
            fetchedAt,
          ]
        );
      }
    } catch (error) {
      Logger.error(`Error saving ${platform} analytics:`, error);
    }
  }
}

// Main handler
module.exports = async (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  setCorsHeaders(res, origin);

  if (req.method === "OPTIONS") {
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
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendJson(res, 401, {
      success: false,
      error: "Invalid token",
    });
  }

  try {
    const db = await getDatabase();
    await ensurePlatformAnalyticsTable(db);

    // GET - Fetch and return platform analytics
    if (req.method === "GET") {
      const query = parseQuery(req);
      const platform = query.platform; // Optional: filter by platform
      const action = query.action || "fetch"; // "fetch" or "get"

      if (action === "fetch") {
        // Fetch fresh analytics from all connected platforms
        const tokens = await db.getSocialMediaTokens();
        const allAnalytics = {
          facebook: {},
          instagram: {},
          twitter: {},
          nextdoor: {},
          google: {},
          facebookPixel: {},
          googleBusiness: {},
          threads: {},
          linkedin: {},
        };

        // Fetch from each platform
        for (const token of tokens) {
          try {
            if (token.platform === "facebook" && token.access_token) {
              const analytics = await fetchFacebookAnalytics(
                token.access_token,
                token.page_id,
                token.instagram_account_id
              );
              allAnalytics.facebook = analytics.facebook;
              allAnalytics.instagram = analytics.instagram;

              // Save to database
              if (token.page_id) {
                await savePlatformAnalytics(
                  db,
                  "facebook",
                  token.page_id,
                  token.page_name || "Facebook Page",
                  analytics.facebook
                );
              }
              if (token.instagram_account_id) {
                await savePlatformAnalytics(
                  db,
                  "instagram",
                  token.instagram_account_id,
                  token.instagram_username || "Instagram Account",
                  analytics.instagram
                );
              }
            } else if (token.platform === "twitter" && token.access_token) {
              const analytics = await fetchTwitterAnalytics(
                token.access_token,
                token.user_id
              );
              allAnalytics.twitter = analytics;

              if (token.user_id) {
                await savePlatformAnalytics(
                  db,
                  "twitter",
                  token.user_id,
                  "Twitter Account",
                  analytics.metrics || {}
                );
              }
            } else if (token.platform === "nextdoor" && token.access_token) {
              const analytics = await fetchNextdoorAnalytics(token.access_token);
              allAnalytics.nextdoor = analytics;

              if (token.user_id) {
                await savePlatformAnalytics(
                  db,
                  "nextdoor",
                  token.user_id,
                  "Nextdoor Account",
                  analytics.metrics || {}
                );
              }
            } else if (token.platform === "linkedin" && token.access_token) {
              const analytics = await fetchLinkedInAnalytics(
                token.access_token,
                token.user_id || token.organization_id
              );
              allAnalytics.linkedin = analytics;

              if (token.user_id || token.organization_id) {
                await savePlatformAnalytics(
                  db,
                  "linkedin",
                  token.user_id || token.organization_id,
                  "LinkedIn Account",
                  { ...analytics.metrics, ...analytics.shareMetrics }
                );
              }
            } else if (token.platform === "threads" && token.access_token) {
              const analytics = await fetchThreadsAnalytics(
                token.access_token,
                token.thread_id || token.user_id
              );
              allAnalytics.threads = analytics;

              if (token.thread_id || token.user_id) {
                await savePlatformAnalytics(
                  db,
                  "threads",
                  token.thread_id || token.user_id,
                  "Threads Account",
                  analytics.metrics || {}
                );
              }
            }
          } catch (error) {
            Logger.error(`Error fetching ${token.platform} analytics:`, error);
          }
        }

        // Fetch Facebook Pixel analytics if configured
        const pixelId = process.env.FACEBOOK_PIXEL_ID;
        const pixelAccessToken = process.env.FACEBOOK_PIXEL_ACCESS_TOKEN || tokens.find(t => t.platform === "facebook")?.access_token;
        if (pixelId && pixelAccessToken) {
          try {
            const pixelAnalytics = await fetchFacebookPixelAnalytics(pixelId, pixelAccessToken);
            allAnalytics.facebookPixel = pixelAnalytics;

            await savePlatformAnalytics(
              db,
              "facebookPixel",
              pixelId,
              "Facebook Pixel",
              pixelAnalytics.metrics || {}
            );
          } catch (error) {
            Logger.error("Error fetching Facebook Pixel analytics:", error);
          }
        }

        // Fetch Google Business Profile analytics if configured
        const googleBusinessLocationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;
        const googleBusinessAccessToken = process.env.GOOGLE_BUSINESS_ACCESS_TOKEN;
        if (googleBusinessLocationId && googleBusinessAccessToken) {
          try {
            const googleBusinessAnalytics = await fetchGoogleBusinessAnalytics(
              googleBusinessLocationId,
              googleBusinessAccessToken
            );
            allAnalytics.googleBusiness = googleBusinessAnalytics;

            await savePlatformAnalytics(
              db,
              "googleBusiness",
              googleBusinessLocationId,
              "Google Business Profile",
              googleBusinessAnalytics.metrics || {}
            );
          } catch (error) {
            Logger.error("Error fetching Google Business analytics:", error);
          }
        }

        // Google Analytics (if configured)
        const googlePropertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
        const googleAccessToken = process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN;
        if (googlePropertyId && googleAccessToken) {
          const googleAnalytics = await fetchGoogleAnalytics(
            googlePropertyId,
            googleAccessToken
          );
          allAnalytics.google = googleAnalytics;

          await savePlatformAnalytics(
            db,
            "google",
            googlePropertyId,
            "Google Analytics",
            googleAnalytics.metrics || {}
          );
        }

        return sendJson(res, 200, {
          success: true,
          analytics: allAnalytics,
          fetchedAt: new Date().toISOString(),
        });
      } else {
        // Get stored analytics from database
        let sql = `SELECT * FROM platform_analytics WHERE 1=1`;
        const params = [];

        if (platform) {
          sql += ` AND platform = ?`;
          params.push(platform);
        }

        sql += ` ORDER BY fetchedAt DESC LIMIT 1000`;

        const storedAnalytics = await db.query(sql, params);

        // Group by platform
        const grouped = {};
        storedAnalytics.forEach((row) => {
          if (!grouped[row.platform]) {
            grouped[row.platform] = {};
          }
          grouped[row.platform][row.metricType] = {
            value: row.metricValue,
            data: JSON.parse(row.metricData || "{}"),
            fetchedAt: row.fetchedAt,
          };
        });

        return sendJson(res, 200, {
          success: true,
          analytics: grouped,
          source: "database",
        });
      }
    }

    // POST - Manually trigger analytics fetch for specific platform
    if (req.method === "POST") {
      const body = await parseBody(req);
      const { platform, accessToken, accountId, accountName } = body;

      if (!platform) {
        return sendJson(res, 400, {
          success: false,
          error: "Platform is required",
        });
      }

      let analytics = {};

      switch (platform.toLowerCase()) {
        case "facebook":
        case "instagram":
          if (!accessToken || !accountId) {
            return sendJson(res, 400, {
              success: false,
              error: "accessToken and accountId are required for Facebook/Instagram",
            });
          }
          analytics = await fetchFacebookAnalytics(accessToken, accountId, null);
          break;

        case "twitter":
        case "x":
          if (!accessToken || !accountId) {
            return sendJson(res, 400, {
              success: false,
              error: "accessToken and accountId are required for Twitter",
            });
          }
          analytics = await fetchTwitterAnalytics(accessToken, accountId);
          break;

        case "nextdoor":
          if (!accessToken) {
            return sendJson(res, 400, {
              success: false,
              error: "accessToken is required for Nextdoor",
            });
          }
          analytics = await fetchNextdoorAnalytics(accessToken);
          break;

        case "google":
          if (!accessToken || !accountId) {
            return sendJson(res, 400, {
              success: false,
              error: "accessToken and propertyId are required for Google Analytics",
            });
          }
          analytics = await fetchGoogleAnalytics(accountId, accessToken);
          break;

        case "facebookPixel":
        case "pixel":
          if (!accessToken || !accountId) {
            return sendJson(res, 400, {
              success: false,
              error: "accessToken and pixelId are required for Facebook Pixel",
            });
          }
          analytics = await fetchFacebookPixelAnalytics(accountId, accessToken);
          break;

        case "googleBusiness":
        case "googleMyBusiness":
          if (!accessToken || !accountId) {
            return sendJson(res, 400, {
              success: false,
              error: "accessToken and locationId are required for Google Business",
            });
          }
          analytics = await fetchGoogleBusinessAnalytics(accountId, accessToken);
          break;

        case "threads":
          if (!accessToken || !accountId) {
            return sendJson(res, 400, {
              success: false,
              error: "accessToken and threadId are required for Threads",
            });
          }
          analytics = await fetchThreadsAnalytics(accessToken, accountId);
          break;

        case "linkedin":
          if (!accessToken || !accountId) {
            return sendJson(res, 400, {
              success: false,
              error: "accessToken and organizationId are required for LinkedIn",
            });
          }
          analytics = await fetchLinkedInAnalytics(accessToken, accountId);
          break;

        default:
          return sendJson(res, 400, {
            success: false,
            error: `Unsupported platform: ${platform}`,
          });
      }

      // Save to database
      if (accountId) {
        await savePlatformAnalytics(
          db,
          platform.toLowerCase(),
          accountId,
          accountName || `${platform} Account`,
          analytics.metrics || analytics
        );
      }

      return sendJson(res, 200, {
        success: true,
        platform: platform.toLowerCase(),
        analytics,
        saved: true,
      });
    }

    return sendJson(res, 405, {
      success: false,
      error: "Method not allowed",
    });
  } catch (error) {
    Logger.error("Platform Analytics API error:", error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || "Internal server error",
    });
  }
};
