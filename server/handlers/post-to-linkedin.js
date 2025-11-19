// Post to LinkedIn - Vercel Serverless Function
// Creates a post on LinkedIn using the access token from database

const axios = require("axios");
const TNRDatabase = require("../../database");

module.exports = async (req, res) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      message: "This endpoint only accepts POST requests",
    });
  }

  try {
    const { accessToken, content, useDatabaseToken = true, userId } = req.body;

    // Try to get token from database first, fallback to request body
    let token = accessToken;

    let linkedinToken = null;
    let storedUserId = null;

    if (useDatabaseToken) {
      try {
        const db = new TNRDatabase();
        await db.initialize();

        // Get LinkedIn token from database (first available)
        const tokens = await db.getSocialMediaTokens("linkedin");
        linkedinToken = tokens[0];

        if (linkedinToken && linkedinToken.access_token) {
          token = linkedinToken.access_token;
          // Get stored user ID (page_id or user_id) to construct URN
          storedUserId = linkedinToken.page_id || linkedinToken.user_id;
          console.log(
            "✅ Using token from database for LinkedIn user:",
            linkedinToken.page_name || linkedinToken.user_id
          );
          console.log("📋 Stored user ID:", storedUserId);
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
    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Missing access token",
        message:
          "Please provide a valid LinkedIn Access Token or connect your account via OAuth",
        help: "Connect your LinkedIn account at /api/auth/linkedin or provide accessToken in request",
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Missing content",
        message: "Please provide post content",
      });
    }

    // LinkedIn requires UGC (User Generated Content) Posts API v2
    // Create UGC Post
    console.log("Creating LinkedIn post...");

    // Step 1: Get user's LinkedIn URN (unique resource name)
    // LinkedIn UGC Posts API requires the author URN
    // Since we don't have profile scope, we'll try multiple approaches
    let userUrn = null;
    
    // Priority 1: Use userId from request body (manual input)
    if (userId && !userId.startsWith("linkedin_user_")) {
      userUrn = `urn:li:person:${userId}`;
      console.log("✅ Using user ID from request:", userUrn);
    } else if (storedUserId && !storedUserId.startsWith("linkedin_user_")) {
      // We have a real LinkedIn user ID stored, use it directly
      userUrn = `urn:li:person:${storedUserId}`;
      console.log("✅ Using stored user ID to construct URN:", userUrn);
    } else {
      // Try to get user ID from token introspection or profile API
      let userId = null;

      // Approach 1: Try token introspection (if available)
      try {
        console.log("Attempting token introspection...");
        // LinkedIn doesn't have a standard token introspection endpoint, skip this
      } catch (introspectionError) {
        console.log("Token introspection not available");
      }

      // Approach 2: Try to fetch profile (may fail without profile scope)
      try {
        console.log(
          "⚠️ No stored user ID found, attempting to fetch profile..."
        );
        const profileResponse = await axios.get(
          "https://api.linkedin.com/v2/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Restli-Protocol-Version": "2.0.0",
            },
            timeout: 10000,
          }
        );

        if (
          profileResponse.data &&
          (profileResponse.data.id || profileResponse.data.sub)
        ) {
          userId = profileResponse.data.id || profileResponse.data.sub;
          console.log("✅ Successfully fetched profile, user ID:", userId);

          // Update database with the user ID for future use
          if (linkedinToken && linkedinToken.id && userId) {
            try {
              const db = new TNRDatabase();
              await db.initialize();
              await db.execute(
                "UPDATE social_media_tokens SET user_id = ?, page_id = ? WHERE id = ?",
                [userId, userId, linkedinToken.id]
              );
              console.log("✅ Updated database with user ID");
            } catch (updateError) {
              console.warn(
                "⚠️ Could not update database with user ID:",
                updateError.message
              );
            }
          }
        } else {
          throw new Error("Profile response missing user ID");
        }
      } catch (profileError) {
        // Profile fetch failed (likely due to missing profile scope)
        console.warn("⚠️ Profile fetch failed:", profileError.message);
        if (profileError.response) {
          console.warn("Profile error status:", profileError.response.status);
          console.warn(
            "Profile error data:",
            JSON.stringify(profileError.response.data, null, 2)
          );
        }
      }

      // Construct URN from user ID
      if (userId) {
        userUrn = `urn:li:person:${userId}`;
        console.log("✅ Constructed URN from user ID:", userUrn);
      } else if (storedUserId) {
        // Use fallback (may not work)
        userUrn = `urn:li:person:${storedUserId}`;
        console.log("⚠️ Using fallback user ID (may not work):", userUrn);
      } else {
        // Last resort: throw error with helpful message
        throw new Error(
          "Unable to determine LinkedIn user ID. " +
            "Please reconnect your LinkedIn account. " +
            "The LinkedIn app may need additional permissions configured in LinkedIn Developer Portal."
        );
      }
    }

    // Step 2: Create UGC Post
    // LinkedIn requires specific format for UGC posts
    const ugcPost = {
      author: userUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    console.log("Creating UGC post with:", {
      author: userUrn,
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + "...",
    });

    const postResponse = await axios.post(
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

    console.log("Post created successfully:", postResponse.data);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Post published to LinkedIn successfully!",
      postId: postResponse.data.id,
      postUrl: `https://www.linkedin.com/feed/update/${postResponse.data.id}`,
      data: postResponse.data,
    });
  } catch (error) {
    console.error("LinkedIn posting error:", error.message);
    console.error(
      "Error details:",
      JSON.stringify(error.response?.data, null, 2)
    );
    console.error("Error status:", error.response?.status);
    console.error("Error headers:", error.response?.headers);
    console.error("Request config:", {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data ? JSON.parse(error.config.data) : null,
    });
    console.error("User URN used:", userUrn || "NOT DEFINED");
    console.error("Stored user ID:", storedUserId || "NOT DEFINED");
    console.error("Error stack:", error.stack);

    // Handle specific error cases
    if (error.response?.data) {
      const linkedinError = error.response.data;

      // Check if it's a user ID/URN issue
      if (
        error.message &&
        error.message.includes("Unable to determine LinkedIn user ID")
      ) {
        return res.status(400).json({
          success: false,
          error: "LinkedIn User ID Missing",
          message:
            "Unable to determine your LinkedIn user ID. Please reconnect your LinkedIn account.",
          help: {
            title: "How to Fix This",
            steps: [
              "1. Go to the Social Media Automation Dashboard",
              '2. Click "💼 Connect LinkedIn" button',
              "3. Complete the OAuth authorization flow",
              "4. This will refresh your token and save your user ID",
              "5. Try posting again",
            ],
          },
          errorType: linkedinError.errorCode,
          details: linkedinError,
        });
      }

      // Extract more detailed error information
      const errorMessage =
        linkedinError.message ||
        linkedinError.errorDetails ||
        linkedinError.error?.message ||
        linkedinError.error ||
        (typeof linkedinError === "string"
          ? linkedinError
          : JSON.stringify(linkedinError));

      // Check for specific error codes
      const statusCode = error.response?.status || 400;
      let helpMessage = null;

      if (statusCode === 422) {
        helpMessage = {
          title: "Invalid Request Format",
          steps: [
            "1. The UGC post format may be incorrect",
            "2. The user URN may be invalid",
            "3. Please reconnect your LinkedIn account to get a fresh token",
            "4. Check that your LinkedIn app has the correct permissions in LinkedIn Developer Portal",
          ],
        };
      } else if (statusCode === 403) {
        helpMessage = {
          title: "Permission Denied",
          steps: [
            "1. Your LinkedIn app may not have the required permissions",
            "2. Go to LinkedIn Developer Portal and verify w_member_social scope is approved",
            "3. Reconnect your LinkedIn account",
            "4. Check that your app is in the correct status (Live or Development)",
          ],
        };
      }

      return res.status(statusCode).json({
        success: false,
        error: "LinkedIn API Error",
        message: errorMessage,
        errorType: linkedinError.errorCode || linkedinError.error?.errorCode,
        errorCode: linkedinError.errorCode,
        statusCode: statusCode,
        help: helpMessage,
        fullError: linkedinError,
        details: linkedinError,
      });
    }

    // Handle non-API errors (like missing user ID)
    if (
      error.message &&
      error.message.includes("Unable to determine LinkedIn user ID")
    ) {
      return res.status(400).json({
        success: false,
        error: "LinkedIn User ID Missing",
        message: error.message,
        help: {
          title: "How to Fix This",
          steps: [
            "1. Go to the Social Media Automation Dashboard",
            '2. Click "💼 Connect LinkedIn" button',
            "3. Complete the OAuth authorization flow",
            "4. This will refresh your token and save your user ID",
            "5. Try posting again",
          ],
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message || "An unexpected error occurred",
    });
  }
};
