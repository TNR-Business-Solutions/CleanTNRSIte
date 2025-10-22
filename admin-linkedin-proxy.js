// Admin-Only LinkedIn API Proxy Server
// Handles CORS issues by proxying requests to LinkedIn API
// Only accessible from admin dashboard

const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3002; // Different port for admin-only access

// Middleware
app.use(cors());
app.use(express.json());

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Admin authentication required",
    });
  }

  // In production, verify the JWT token here
  // For now, we'll just check if it's a valid admin session
  const token = authHeader.substring(7);
  if (token === "admin-token-placeholder") {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: "Invalid admin token",
    });
  }
};

// LinkedIn API Proxy Endpoints (Admin Only)
app.post("/api/linkedin/test", authenticateAdmin, async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Access token is required",
      });
    }

    // Test LinkedIn connection
    const response = await fetch("https://api.linkedin.com/v2/people/~", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      res.json({
        success: true,
        user: data,
      });
    } else {
      const errorData = await response.json();
      res.status(400).json({
        success: false,
        error: errorData.message || "Invalid access token",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/linkedin/post", authenticateAdmin, async (req, res) => {
  try {
    const { accessToken, content } = req.body;

    if (!accessToken || !content) {
      return res.status(400).json({
        success: false,
        error: "Access token and content are required",
      });
    }

    // Get user profile first
    const profileResponse = await fetch(
      "https://api.linkedin.com/v2/people/~",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!profileResponse.ok) {
      throw new Error("Failed to get user profile");
    }

    const profile = await profileResponse.json();
    const personUrn = `urn:li:person:${profile.id}`;

    // Create LinkedIn post
    const postResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: personUrn,
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
      }),
    });

    if (postResponse.ok) {
      const postData = await postResponse.json();
      res.json({
        success: true,
        data: postData,
      });
    } else {
      const errorData = await postResponse.json();
      res.status(400).json({
        success: false,
        error: errorData.message || "Failed to create post",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check endpoint (Admin Only)
app.get("/api/health", authenticateAdmin, (req, res) => {
  res.json({ status: "OK", service: "Admin LinkedIn Proxy" });
});

app.listen(PORT, () => {
  console.log(`🔐 Admin LinkedIn Proxy Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Test endpoint: http://localhost:${PORT}/api/linkedin/test`);
  console.log(`⚠️  This server requires admin authentication!`);
});
