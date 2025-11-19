// Real Social Media API Integration
// Connects to actual social media platforms and scheduling services

class SocialMediaAPI {
  constructor() {
    this.apiKeys = {
      buffer: null,
      hootsuite: null,
      later: null,
      facebook: null,
      instagram: null,
      linkedin: null,
      twitter: null,
    };

    this.isConfigured = false;
    this.connectedPlatforms = [];
  }

  // Initialize API connections
  async initialize() {
    try {
      // Load saved API keys from localStorage
      this.loadApiKeys();

      // Test connections
      await this.testConnections();

      this.isConfigured = true;
      return { success: true, message: "APIs initialized successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Load API keys from localStorage
  loadApiKeys() {
    const savedKeys = localStorage.getItem("socialMediaApiKeys");
    if (savedKeys) {
      this.apiKeys = { ...this.apiKeys, ...JSON.parse(savedKeys) };
    }
  }

  // Save API keys to localStorage
  saveApiKeys() {
    localStorage.setItem("socialMediaApiKeys", JSON.stringify(this.apiKeys));
  }

  // Test API connections
  async testConnections() {
    const results = {};

    for (const [platform, key] of Object.entries(this.apiKeys)) {
      if (key) {
        try {
          const result = await this.testConnection(platform, key);
          results[platform] = result;
          if (result.success) {
            this.connectedPlatforms.push(platform);
          }
        } catch (error) {
          results[platform] = { success: false, error: error.message };
        }
      }
    }

    return results;
  }

  // Test individual platform connection
  async testConnection(platform, apiKey) {
    switch (platform) {
      case "buffer":
        return await this.testBufferConnection(apiKey);
      case "hootsuite":
        return await this.testHootsuiteConnection(apiKey);
      case "facebook":
        return await this.testFacebookConnection(apiKey);
      case "instagram":
        return await this.testInstagramConnection(apiKey);
      case "linkedin":
        return await this.testLinkedInConnection(apiKey);
      case "twitter":
        return await this.testTwitterConnection(apiKey);
      default:
        return { success: false, error: "Unknown platform" };
    }
  }

  // Buffer API Integration
  async testBufferConnection(apiKey) {
    try {
      const response = await fetch("https://api.bufferapp.com/1/user.json", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data };
      } else {
        return { success: false, error: "Invalid API key" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Hootsuite API Integration
  async testHootsuiteConnection(apiKey) {
    try {
      const response = await fetch("https://platform.hootsuite.com/v1/me", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data };
      } else {
        return { success: false, error: "Invalid API key" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Facebook API Integration
  async testFacebookConnection(accessToken) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
      );

      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data };
      } else {
        return { success: false, error: "Invalid access token" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Instagram API Integration
  async testInstagramConnection(accessToken) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
      );

      if (response.ok) {
        const data = await response.json();
        return { success: true, accounts: data.data };
      } else {
        return { success: false, error: "Invalid access token" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // LinkedIn API Integration (via proxy server)
  async testLinkedInConnection(accessToken) {
    try {
      const response = await fetch("http://localhost:3002/api/linkedin/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token-placeholder",
        },
        body: JSON.stringify({ accessToken }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || "Connection failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          "Proxy server not running. Please start the LinkedIn proxy server.",
      };
    }
  }

  // Get LinkedIn user profile
  async getLinkedInProfile(accessToken) {
    try {
      const response = await fetch("https://api.linkedin.com/v2/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Failed to fetch LinkedIn profile");
      }
    } catch (error) {
      throw new Error(`LinkedIn profile error: ${error.message}`);
    }
  }

  // Twitter API Integration
  async testTwitterConnection(bearerToken) {
    try {
      const response = await fetch("https://api.twitter.com/2/users/me", {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data };
      } else {
        return { success: false, error: "Invalid bearer token" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Post to Buffer
  async postToBuffer(postData) {
    if (!this.apiKeys.buffer) {
      throw new Error("Buffer API key not configured");
    }

    const response = await fetch(
      "https://api.bufferapp.com/1/updates/create.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKeys.buffer}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: postData.content,
          profile_ids: [postData.profileId],
          scheduled_at: postData.scheduledTime,
          media: postData.media || {},
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to post to Buffer");
    }

    return await response.json();
  }

  // Post to Facebook
  async postToFacebook(postData) {
    if (!this.apiKeys.facebook) {
      throw new Error("Facebook access token not configured");
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postData.pageId}/feed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: postData.content,
          access_token: this.apiKeys.facebook,
          scheduled_publish_time: Math.floor(
            new Date(postData.scheduledTime).getTime() / 1000
          ),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to post to Facebook");
    }

    return await response.json();
  }

  // Post to LinkedIn using proxy server
  async postToLinkedIn(postData) {
    if (!this.apiKeys.linkedin) {
      throw new Error("LinkedIn access token not configured");
    }

    try {
      const response = await fetch("http://localhost:3002/api/linkedin/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token-placeholder",
        },
        body: JSON.stringify({
          accessToken: this.apiKeys.linkedin,
          content: postData.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        const errorData = await response.json();
        throw new Error(
          `Failed to post to LinkedIn: ${
            errorData.error || response.statusText
          }`
        );
      }
    } catch (error) {
      throw new Error(`LinkedIn posting error: ${error.message}`);
    }
  }

  // Post to Twitter
  async postToTwitter(postData) {
    if (!this.apiKeys.twitter) {
      throw new Error("Twitter bearer token not configured");
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKeys.twitter}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: postData.content,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to post to Twitter");
    }

    return await response.json();
  }

  // Schedule post across multiple platforms
  async schedulePost(postData) {
    const results = {};
    const errors = [];

    for (const platform of postData.platforms) {
      try {
        let result;
        switch (platform) {
          case "buffer":
            result = await this.postToBuffer(postData);
            break;
          case "facebook":
            result = await this.postToFacebook(postData);
            break;
          case "linkedin":
            result = await this.postToLinkedIn(postData);
            break;
          case "twitter":
            result = await this.postToTwitter(postData);
            break;
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }
        results[platform] = { success: true, data: result };
      } catch (error) {
        results[platform] = { success: false, error: error.message };
        errors.push(`${platform}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
    };
  }

  // Get analytics data
  async getAnalytics(platform, timeRange = "30d") {
    if (!this.apiKeys[platform]) {
      throw new Error(`${platform} API key not configured`);
    }

    // This would connect to actual analytics APIs
    // For now, return mock data
    return {
      platform,
      timeRange,
      metrics: {
        reach: Math.floor(Math.random() * 10000) + 1000,
        engagement: Math.floor(Math.random() * 1000) + 100,
        clicks: Math.floor(Math.random() * 500) + 50,
        shares: Math.floor(Math.random() * 200) + 20,
      },
    };
  }

  // Update API key
  updateApiKey(platform, apiKey) {
    this.apiKeys[platform] = apiKey;
    this.saveApiKeys();
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConfigured: this.isConfigured,
      connectedPlatforms: this.connectedPlatforms,
      totalPlatforms: Object.keys(this.apiKeys).length,
    };
  }
}

// Global API instance
window.socialMediaAPI = new SocialMediaAPI();

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  const result = await window.socialMediaAPI.initialize();
  console.log("Social Media API initialized:", result);

  // Update UI with connection status
  updateConnectionStatus();
});

// Update connection status in UI
function updateConnectionStatus() {
  const status = window.socialMediaAPI.getConnectionStatus();
  const statusElement = document.getElementById("connectionStatus");

  if (statusElement) {
    statusElement.innerHTML = `
            <div class="connection-status">
                <h4>API Connection Status</h4>
                <p>Configured: ${status.isConfigured ? "✅ Yes" : "❌ No"}</p>
                <p>Connected Platforms: ${status.connectedPlatforms.length}/${
      status.totalPlatforms
    }</p>
                <p>Platforms: ${
                  status.connectedPlatforms.join(", ") || "None"
                }</p>
            </div>
        `;
  }
}

// Enhanced schedule post function with real API calls
async function schedulePostReal() {
  const platform = document.getElementById("schedulePlatform").value;
  const content = document.getElementById("scheduleContent").value;
  const dateTime = document.getElementById("scheduleDateTime").value;
  const client = document.getElementById("scheduleClient").value;

  if (!content || !dateTime) {
    alert("Please fill in all required fields");
    return;
  }

  const postData = {
    platforms: [platform],
    content: content,
    scheduledTime: new Date(dateTime),
    client: client,
    hashtags: extractHashtags(content),
    utmSource: platform,
    utmMedium: "social",
    utmCampaign: "automated",
  };

  // Show loading state
  const button = document.querySelector('button[onclick="schedulePostReal()"]');
  const originalText = button.textContent;
  button.textContent = "Scheduling...";
  button.disabled = true;

  try {
    // Schedule the post
    const result = await window.socialMediaAPI.schedulePost(postData);

    if (result.success) {
      alert("Post scheduled successfully across all platforms!");

      // Add to UI
      const scheduleItem = document.createElement("div");
      scheduleItem.className = "schedule-item";
      scheduleItem.innerHTML = `
                <div class="schedule-time">${new Date(
                  dateTime
                ).toLocaleString()}</div>
                <div class="schedule-content">${
                  platform.charAt(0).toUpperCase() + platform.slice(1)
                }: ${content.substring(0, 50)}...</div>
                <div class="schedule-status">✅ Scheduled</div>
            `;

      document.getElementById("scheduledPosts").appendChild(scheduleItem);

      // Clear form
      document.getElementById("scheduleContent").value = "";
      document.getElementById("scheduleDateTime").value = "";
    } else {
      alert("Some platforms failed to schedule. Check console for details.");
      console.error("Scheduling errors:", result.errors);
    }
  } catch (error) {
    alert("Failed to schedule post: " + error.message);
    console.error("Scheduling error:", error);
  } finally {
    // Reset button
    button.textContent = originalText;
    button.disabled = false;
  }
}

// API Configuration Modal
function showApiConfig() {
  const modal = document.createElement("div");
  modal.className = "api-config-modal";
  modal.innerHTML = `
        <div class="modal-content">
            <h3>Configure API Keys</h3>
            <form id="apiConfigForm">
                <div class="form-group">
                    <label for="bufferKey">Buffer API Key</label>
                    <input type="password" id="bufferKey" placeholder="Enter Buffer API key">
                </div>
                <div class="form-group">
                    <label for="facebookKey">Facebook Access Token</label>
                    <input type="password" id="facebookKey" placeholder="Enter Facebook access token">
                </div>
                <div class="form-group">
                    <label for="linkedinKey">LinkedIn Access Token</label>
                    <input type="password" id="linkedinKey" placeholder="Enter LinkedIn access token">
                </div>
                <div class="form-group">
                    <label for="twitterKey">Twitter Bearer Token</label>
                    <input type="password" id="twitterKey" placeholder="Enter Twitter bearer token">
                </div>
                <div class="form-actions">
                    <button type="button" onclick="saveApiKeys()">Save Keys</button>
                    <button type="button" onclick="closeApiConfig()">Cancel</button>
                </div>
            </form>
        </div>
    `;

  document.body.appendChild(modal);
}

function saveApiKeys() {
  const bufferKey = document.getElementById("bufferKey").value;
  const facebookKey = document.getElementById("facebookKey").value;
  const linkedinKey = document.getElementById("linkedinKey").value;
  const twitterKey = document.getElementById("twitterKey").value;

  if (bufferKey) window.socialMediaAPI.updateApiKey("buffer", bufferKey);
  if (facebookKey) window.socialMediaAPI.updateApiKey("facebook", facebookKey);
  if (linkedinKey) window.socialMediaAPI.updateApiKey("linkedin", linkedinKey);
  if (twitterKey) window.socialMediaAPI.updateApiKey("twitter", twitterKey);

  alert("API keys saved! Testing connections...");
  window.socialMediaAPI.testConnections().then(() => {
    updateConnectionStatus();
    closeApiConfig();
  });
}

function closeApiConfig() {
  const modal = document.querySelector(".api-config-modal");
  if (modal) {
    modal.remove();
  }
}
