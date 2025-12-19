// Post to Facebook - Vercel Serverless Function
// Creates a post on a Facebook Page using the Page Access Token from database

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
    // Parse request body if it's a string (Vercel sometimes sends unparsed body)
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
      pageAccessToken,
      message,
      pageId,
      imageUrl,
      useDatabaseToken = true,
      scheduledTime,
      clientName,
    } = body || {};

    // Try to get token from database first, fallback to request body
    let accessToken = pageAccessToken;
    let targetPageId = pageId;

    if (useDatabaseToken) {
      try {
        const db = new TNRDatabase();
        await db.initialize();

        // Get Facebook token from database
        const token = await db.getSocialMediaToken("facebook", pageId || null);

        if (token && token.access_token) {
          accessToken = token.access_token;
          if (!targetPageId && token.page_id) {
            targetPageId = token.page_id;
          }
          console.log(
            "✅ Using token from database for page:",
            token.page_name || token.page_id
          );
        } else {
          console.log(
            "⚠️ No token found in database, using provided token or falling back"
          );
        }
      } catch (dbError) {
        console.warn(
          "⚠️ Database error, using provided token:",
          dbError.message
        );
        // Continue with provided token if database fails
      }
    }

    // Validate required fields
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Missing page access token",
        message:
          "Please provide a valid Facebook Page Access Token or connect your account via OAuth",
        help: "Connect your Facebook account at /api/auth/meta or provide pageAccessToken in request",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Missing message",
        message: "Please provide post content",
      });
    }

    // If pageId not provided, get it from the token
    if (!targetPageId) {
      // Get page info from token
      const pageInfoResponse = await axios.get(
        "https://graph.facebook.com/v19.0/me",
        {
          params: {
            access_token: accessToken,
            fields: "id,name",
          },
          timeout: 10000,
        }
      );

      targetPageId = pageInfoResponse.data.id;
      console.log(
        "Auto-detected Page ID:",
        targetPageId,
        "Name:",
        pageInfoResponse.data.name
      );
    }

    // Create the post (with or without image)
    let postResponse;

    if (imageUrl) {
      // Post with image using /photos endpoint
      console.log("Creating Facebook photo post...");

      // Build post data
      const photoData = {
        url: imageUrl,
        caption: message,
        access_token: accessToken,
      };

      // Add scheduling if scheduledTime is provided
      if (scheduledTime) {
        const scheduledDate = new Date(scheduledTime);
        const now = new Date();
        const minScheduledTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

        if (scheduledDate > minScheduledTime) {
          const scheduledTimestamp = Math.floor(scheduledDate.getTime() / 1000);
          photoData.scheduled_publish_time = scheduledTimestamp;
          console.log(
            `📅 Photo post scheduled for: ${scheduledDate.toLocaleString()}`
          );
        } else {
          console.warn(
            "⚠️ Scheduled time must be at least 10 minutes in the future. Posting immediately."
          );
        }
      }

      postResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${targetPageId}/photos`,
        photoData,
        {
          timeout: 15000,
        }
      );
    } else {
      // Text-only post using /feed endpoint
      console.log("Creating Facebook text post...");

      // Build post data
      const postData = {
        message: message,
        access_token: accessToken,
      };

      // Add scheduling if scheduledTime is provided (must be at least 10 minutes in future)
      if (scheduledTime) {
        const scheduledDate = new Date(scheduledTime);
        const now = new Date();
        const minScheduledTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

        if (scheduledDate > minScheduledTime) {
          // Convert to Unix timestamp (seconds)
          const scheduledTimestamp = Math.floor(scheduledDate.getTime() / 1000);
          postData.scheduled_publish_time = scheduledTimestamp;
          console.log(
            `📅 Post scheduled for: ${scheduledDate.toLocaleString()}`
          );
        } else {
          console.warn(
            "⚠️ Scheduled time must be at least 10 minutes in the future. Posting immediately."
          );
        }
      }

      postResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${targetPageId}/feed`,
        postData,
        {
          timeout: 15000,
        }
      );
    }

    console.log("Post created successfully:", postResponse.data);

    // Save to database if clientName provided
    if (clientName) {
      try {
        const db = new TNRDatabase();
        await db.initialize();

        const postId = `post-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const postData = {
          id: postId,
          platform: "facebook",
          content: message,
          status: scheduledTime ? "scheduled" : "published",
          scheduledDate: scheduledTime || null,
          publishedDate: scheduledTime ? null : new Date().toISOString(),
          clientName: clientName,
          metadata: JSON.stringify({
            postId: postResponse.data.id,
            pageId: targetPageId,
            url: `https://www.facebook.com/${postResponse.data.id.replace(
              "_",
              "/posts/"
            )}`,
            scheduled: !!scheduledTime,
          }),
        };

        await db.query(
          `INSERT INTO social_media_posts (id, platform, content, status, scheduledDate, publishedDate, clientName, metadata, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            postData.id,
            postData.platform,
            postData.content,
            postData.status,
            postData.scheduledDate,
            postData.publishedDate,
            postData.clientName,
            postData.metadata,
            new Date().toISOString(),
            new Date().toISOString(),
          ]
        );

        console.log("✅ Post saved to database for client:", clientName);
      } catch (dbError) {
        console.warn("⚠️ Could not save post to database:", dbError.message);
        // Continue - post was still published to Facebook
      }
    }

    // Return success response
    const isScheduled = scheduledTime && new Date(scheduledTime) > new Date();
    return res.status(200).json({
      success: true,
      message: isScheduled
        ? `Post scheduled for ${new Date(scheduledTime).toLocaleString()}!`
        : "Post published to Facebook successfully!",
      postId: postResponse.data.id,
      postUrl: `https://www.facebook.com/${postResponse.data.id.replace(
        "_",
        "/posts/"
      )}`,
      scheduled: isScheduled,
      scheduledTime: scheduledTime || null,
      clientName: clientName || null,
      data: postResponse.data,
    });
  } catch (error) {
    console.error("Facebook posting error:", error.message);
    console.error("Error details:", error.response?.data);

    // Handle specific error cases
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;

      // Provide actionable error messages
      let userMessage = fbError.message || "Failed to post to Facebook";
      let action = "retry";
      let actionUrl = null;

      // Handle specific error codes
      if (fbError.code === 200 || fbError.type === "OAuthException") {
        userMessage =
          "❌ Permissions Error: Your Facebook account needs to be reconnected with the correct permissions.";
        action = "reconnect";
        actionUrl = "/api/auth/meta";
      } else if (fbError.code === 190) {
        userMessage =
          "❌ Token Expired: Please reconnect your Facebook account.";
        action = "reconnect";
        actionUrl = "/api/auth/meta";
      } else if (fbError.code === 100) {
        userMessage =
          "❌ Invalid Parameters: Please check your post content and try again.";
      } else if (fbError.code === 368) {
        userMessage =
          "❌ Page Access: You don't have permission to post on this Page. Please ensure you're a Page admin or editor.";
        action = "check_page_role";
      }

      return res.status(400).json({
        success: false,
        error: "Facebook API Error",
        message: userMessage,
        originalMessage: fbError.message,
        errorType: fbError.type,
        errorCode: fbError.code,
        action: action,
        actionUrl: actionUrl,
        help:
          action === "reconnect"
            ? 'Click the "Reconnect Facebook" button to grant the required permissions'
            : "Please check your Facebook Page settings and permissions",
        details: fbError,
      });
    }

    // Use centralized error handler for generic errors
    const errorResponse = ErrorHandler.handleError(error, {
      endpoint: "/api/social/post-to-facebook",
      method: "POST",
    });

    ErrorHandler.sendErrorResponse(res, errorResponse);
  }
};
