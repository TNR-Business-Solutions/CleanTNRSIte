// Post to Multiple Platforms Simultaneously
// Handles posting to multiple social media platforms in parallel

const axios = require("axios");
const TNRDatabase = require("../../database");
const ErrorHandler = require("../utils/error-handler");

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      message: "This endpoint only accepts POST requests",
    });
  }

  try {
    // Parse request body
    let body = req.body;
    if (typeof req.body === "string") {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid JSON",
          message: "Request body must be valid JSON",
        });
      }
    }

    const {
      platforms, // Array: ["facebook", "instagram", "linkedin", "twitter"]
      message,
      imageUrl,
      scheduledTime,
      clientName,
      pageId, // For Facebook/Instagram (optional, will use first connected if not provided)
      useDatabaseToken = true,
    } = body || {};

    // Validate required fields
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Missing platforms",
        message: "Please provide an array of platforms to post to",
        help: 'Example: ["facebook", "instagram", "linkedin", "twitter"]',
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Missing message",
        message: "Please provide post content",
      });
    }

    // Validate platform names
    const validPlatforms = ["facebook", "instagram", "linkedin", "twitter"];
    const invalidPlatforms = platforms.filter(
      (p) => !validPlatforms.includes(p.toLowerCase())
    );

    if (invalidPlatforms.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid platforms",
        message: `Invalid platform(s): ${invalidPlatforms.join(", ")}`,
        help: `Supported platforms: ${validPlatforms.join(", ")}`,
      });
    }

    // Normalize platform names
    const normalizedPlatforms = platforms.map((p) => p.toLowerCase());

    console.log(
      `📤 Posting to ${
        normalizedPlatforms.length
      } platform(s): ${normalizedPlatforms.join(", ")}`
    );

    // Prepare post data for each platform
    const postData = {
      message: message.trim(),
      imageUrl: imageUrl || null,
      scheduledTime: scheduledTime || null,
      clientName: clientName || null,
      pageId: pageId || null,
      useDatabaseToken: useDatabaseToken,
    };

    // Post to all platforms simultaneously using Promise.allSettled
    // This ensures all platforms are attempted even if some fail
    const postingPromises = normalizedPlatforms.map(async (platform) => {
      try {
        console.log(`📤 Posting to ${platform}...`);

        // Get token from database
        const db = new TNRDatabase();
        await db.initialize();

        let result;

        switch (platform) {
          case "facebook": {
            const token = await db.getSocialMediaToken(
              "facebook",
              pageId || null
            );
            if (!token || !token.access_token) {
              throw new Error(
                "No Facebook token found. Please connect Facebook first."
              );
            }

            const targetPageId = pageId || token.page_id;
            let accessToken = token.access_token;

            // Build post data
            const fbPostData = {
              message: message,
              access_token: accessToken,
            };

            // Add scheduling
            if (scheduledTime) {
              const scheduledDate = new Date(scheduledTime);
              const now = new Date();
              const minTime = new Date(now.getTime() + 10 * 60 * 1000);
              if (scheduledDate > minTime) {
                fbPostData.scheduled_publish_time = Math.floor(
                  scheduledDate.getTime() / 1000
                );
              }
            }

            // Post with or without image
            if (imageUrl) {
              const response = await axios.post(
                `https://graph.facebook.com/v19.0/${targetPageId}/photos`,
                {
                  url: imageUrl,
                  caption: message,
                  access_token: accessToken,
                  ...(fbPostData.scheduled_publish_time && {
                    scheduled_publish_time: fbPostData.scheduled_publish_time,
                  }),
                },
                { timeout: 15000 }
              );
              result = {
                postId: response.data.id,
                postUrl: `https://www.facebook.com/${response.data.id.replace(
                  "_",
                  "/posts/"
                )}`,
              };
            } else {
              const response = await axios.post(
                `https://graph.facebook.com/v19.0/${targetPageId}/feed`,
                fbPostData,
                { timeout: 15000 }
              );
              result = {
                postId: response.data.id,
                postUrl: `https://www.facebook.com/${response.data.id.replace(
                  "_",
                  "/posts/"
                )}`,
              };
            }
            break;
          }

          case "instagram": {
            // Instagram uses Facebook page token
            const fbToken = await db.getSocialMediaToken(
              "facebook",
              pageId || null
            );
            if (!fbToken || !fbToken.access_token) {
              throw new Error(
                "No Facebook token found. Instagram requires Facebook connection."
              );
            }

            const accessToken = fbToken.access_token;
            let instagramAccountId = fbToken.instagram_account_id;

            // Get Instagram account ID if not stored
            if (!instagramAccountId) {
              const pageResponse = await axios.get(
                "https://graph.facebook.com/v19.0/me",
                {
                  params: {
                    fields: "instagram_business_account",
                    access_token: accessToken,
                  },
                  timeout: 10000,
                }
              );
              if (!pageResponse.data.instagram_business_account) {
                throw new Error(
                  "No Instagram Business Account connected to this Facebook Page."
                );
              }
              instagramAccountId =
                pageResponse.data.instagram_business_account.id;
            }

            // Instagram requires image
            if (!imageUrl) {
              throw new Error("Instagram posts require an image URL.");
            }

            // Create media container
            const containerResponse = await axios.post(
              `https://graph.facebook.com/v19.0/${instagramAccountId}/media`,
              {
                image_url: imageUrl,
                caption: message,
                access_token: accessToken,
              },
              { timeout: 15000 }
            );

            // Publish container
            const publishResponse = await axios.post(
              `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`,
              {
                creation_id: containerResponse.data.id,
                access_token: accessToken,
              },
              { timeout: 15000 }
            );

            result = {
              postId: publishResponse.data.id,
              url: `https://www.instagram.com/p/${publishResponse.data.id}/`,
            };
            break;
          }

          case "linkedin": {
            const tokens = await db.getSocialMediaTokens("linkedin");
            const linkedinToken = tokens[0];
            if (!linkedinToken || !linkedinToken.access_token) {
              throw new Error(
                "No LinkedIn token found. Please connect LinkedIn first."
              );
            }

            const token = linkedinToken.access_token;
            const userId = linkedinToken.page_id || linkedinToken.user_id;
            if (!userId) {
              throw new Error(
                "LinkedIn user ID not found. Please reconnect LinkedIn."
              );
            }

            const userUrn = `urn:li:person:${userId}`;

            // LinkedIn UGC Post
            const ugcPost = {
              author: userUrn,
              lifecycleState: "PUBLISHED",
              specificContent: {
                "com.linkedin.ugc.ShareContent": {
                  shareCommentary: {
                    text: message,
                  },
                  shareMediaCategory: "NONE",
                },
              },
              visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
              },
            };

            const response = await axios.post(
              "https://api.linkedin.com/v2/ugcPosts",
              ugcPost,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                  "X-Restli-Protocol-Version": "2.0.0",
                },
                timeout: 15000,
              }
            );

            result = {
              postId: response.data.id,
              postUrl: `https://www.linkedin.com/feed/update/${response.data.id}`,
            };
            break;
          }

          case "twitter": {
            const tokens = await db.getSocialMediaTokens("twitter");
            const twitterToken = tokens[0];
            if (!twitterToken || !twitterToken.access_token) {
              throw new Error(
                "No Twitter token found. Please connect Twitter first."
              );
            }

            const token = twitterToken.access_token;

            // Twitter character limit
            if (message.length > 280) {
              throw new Error(
                `Tweet too long: ${message.length} characters (max 280)`
              );
            }

            const response = await axios.post(
              "https://api.twitter.com/2/tweets",
              { text: message },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                timeout: 15000,
              }
            );

            const tweetId = response.data.data.id;
            result = {
              tweetId: tweetId,
              tweetUrl: `https://twitter.com/i/web/status/${tweetId}`,
            };
            break;
          }

          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }

        return {
          platform,
          success: true,
          data: result,
        };
      } catch (error) {
        console.error(`❌ Error posting to ${platform}:`, error.message);
        return {
          platform,
          success: false,
          error: error.message,
          errorDetails: error.response?.data || error.stack,
        };
      }
    });

    // Wait for all posts to complete (whether success or failure)
    const results = await Promise.allSettled(postingPromises);

    // Process results
    const platformResults = {};
    const successes = [];
    const failures = [];

    results.forEach((result, index) => {
      const platform = normalizedPlatforms[index];
      if (result.status === "fulfilled") {
        platformResults[platform] = result.value;
        if (result.value.success) {
          successes.push(platform);
        } else {
          failures.push({
            platform,
            error: result.value.error,
          });
        }
      } else {
        platformResults[platform] = {
          success: false,
          error: result.reason?.message || "Unknown error",
        };
        failures.push({
          platform,
          error: result.reason?.message || "Unknown error",
        });
      }
    });

    // Save to database if at least one platform succeeded
    if (successes.length > 0 && clientName) {
      try {
        const db = new TNRDatabase();
        await db.initialize();

        // Save one record per successful platform
        for (const platform of successes) {
          const postId = `post-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 11)}`;
          const result = platformResults[platform];

          await db.query(
            `INSERT INTO social_media_posts (id, platform, content, status, scheduledDate, publishedDate, clientName, metadata, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              postId,
              platform,
              message.trim(),
              scheduledTime ? "scheduled" : "published",
              scheduledTime || null,
              scheduledTime ? null : new Date().toISOString(),
              clientName,
              JSON.stringify({
                postId:
                  result.data?.postId ||
                  result.data?.tweetId ||
                  result.data?.id ||
                  null,
                platforms: normalizedPlatforms,
                success: true,
                scheduled: !!scheduledTime,
                url:
                  result.data?.postUrl ||
                  result.data?.tweetUrl ||
                  result.data?.url ||
                  result.data?.data?.url ||
                  null,
              }),
              new Date().toISOString(),
              new Date().toISOString(),
            ]
          );
        }

        console.log(
          `✅ Saved ${successes.length} post(s) to database for client: ${clientName}`
        );
      } catch (dbError) {
        console.warn("⚠️ Could not save posts to database:", dbError.message);
        // Continue - posts were still published to platforms
      }
    }

    // Determine overall success
    const allSucceeded = failures.length === 0;
    const someSucceeded = successes.length > 0;

    // Return comprehensive results
    return res.status(allSucceeded ? 200 : someSucceeded ? 207 : 400).json({
      success: someSucceeded,
      message: allSucceeded
        ? `Post published to all ${successes.length} platform(s) successfully!`
        : someSucceeded
        ? `Post published to ${successes.length} platform(s), ${failures.length} failed`
        : "Failed to post to any platform",
      platforms: normalizedPlatforms,
      results: platformResults,
      successes: successes,
      failures: failures,
      scheduled: !!scheduledTime,
      scheduledTime: scheduledTime || null,
      clientName: clientName || null,
    });
  } catch (error) {
    console.error("Multi-platform posting error:", error.message);
    console.error("Error details:", error.stack);

    // Use centralized error handler
    const errorResponse = ErrorHandler.handleError(error, {
      endpoint: "/api/social/post-to-multiple-platforms",
      method: "POST",
    });

    ErrorHandler.sendErrorResponse(res, errorResponse);
  }
};
