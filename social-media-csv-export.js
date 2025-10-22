// Social Media CSV Export Functionality
// Compatible with Buffer, Hootsuite, Later, and other scheduling tools

class SocialMediaExporter {
  constructor() {
    this.scheduledPosts = [];
    this.platforms = {
      facebook: "Facebook",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      twitter: "Twitter",
    };
  }

  // Add a post to the export queue
  addPost(postData) {
    const post = {
      id: Date.now() + Math.random(),
      platform: postData.platform,
      content: postData.content,
      scheduledTime: postData.scheduledTime,
      client: postData.client || "TNR Business Solutions",
      hashtags: postData.hashtags || [],
      imageUrl: postData.imageUrl || "",
      linkUrl: postData.linkUrl || "",
      utmSource: postData.utmSource || postData.platform,
      utmMedium: postData.utmMedium || "social",
      utmCampaign: postData.utmCampaign || "automated",
      status: "scheduled",
    };

    this.scheduledPosts.push(post);
    return post.id;
  }

  // Generate CSV content for Buffer
  generateBufferCSV() {
    const headers = [
      "Text",
      "Scheduled Date",
      "Scheduled Time",
      "Profile",
      "Image URL",
      "Link URL",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
    ];

    const rows = this.scheduledPosts.map((post) => {
      const scheduledDate = new Date(post.scheduledTime);
      const date = scheduledDate.toLocaleDateString("en-US");
      const time = scheduledDate.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      return [
        `"${post.content.replace(/"/g, '""')}"`,
        date,
        time,
        this.getBufferProfileName(post.platform, post.client),
        post.imageUrl,
        post.linkUrl,
        post.utmSource,
        post.utmMedium,
        post.utmCampaign,
      ];
    });

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  // Generate CSV content for Hootsuite
  generateHootsuiteCSV() {
    const headers = [
      "Message",
      "Scheduled Date",
      "Scheduled Time",
      "Social Network",
      "Image URL",
      "Link URL",
    ];

    const rows = this.scheduledPosts.map((post) => {
      const scheduledDate = new Date(post.scheduledTime);
      const date = scheduledDate.toLocaleDateString("en-US");
      const time = scheduledDate.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      return [
        `"${post.content.replace(/"/g, '""')}"`,
        date,
        time,
        this.getHootsuiteNetworkName(post.platform),
        post.imageUrl,
        post.linkUrl,
      ];
    });

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  // Generate CSV content for Later
  generateLaterCSV() {
    const headers = [
      "Text",
      "Scheduled Date",
      "Scheduled Time",
      "Platform",
      "Image URL",
      "Link URL",
    ];

    const rows = this.scheduledPosts.map((post) => {
      const scheduledDate = new Date(post.scheduledTime);
      const date = scheduledDate.toLocaleDateString("en-US");
      const time = scheduledDate.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      return [
        `"${post.content.replace(/"/g, '""')}"`,
        date,
        time,
        this.platforms[post.platform],
        post.imageUrl,
        post.linkUrl,
      ];
    });

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  // Generate JSON for Zapier/Make webhooks
  generateWebhookJSON() {
    return {
      posts: this.scheduledPosts.map((post) => ({
        platform: post.platform,
        content: post.content,
        scheduled_time: post.scheduledTime,
        client: post.client,
        hashtags: post.hashtags,
        image_url: post.imageUrl,
        link_url: post.linkUrl,
        utm_source: post.utmSource,
        utm_medium: post.utmMedium,
        utm_campaign: post.utmCampaign,
      })),
    };
  }

  // Get Buffer profile name based on platform and client
  getBufferProfileName(platform, client) {
    const clientPrefix =
      client === "TNR Business Solutions" ? "TNR" : client.replace(/\s+/g, "");
    return `${clientPrefix}_${this.platforms[platform]}`;
  }

  // Get Hootsuite network name
  getHootsuiteNetworkName(platform) {
    const networkMap = {
      facebook: "Facebook",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      twitter: "Twitter",
    };
    return networkMap[platform] || platform;
  }

  // Download CSV file
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Download JSON file
  downloadJSON(jsonContent, filename) {
    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Export to Buffer
  exportToBuffer() {
    const csv = this.generateBufferCSV();
    const filename = `buffer_posts_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    this.downloadCSV(csv, filename);
  }

  // Export to Hootsuite
  exportToHootsuite() {
    const csv = this.generateHootsuiteCSV();
    const filename = `hootsuite_posts_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    this.downloadCSV(csv, filename);
  }

  // Export to Later
  exportToLater() {
    const csv = this.generateLaterCSV();
    const filename = `later_posts_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    this.downloadCSV(csv, filename);
  }

  // Export to Zapier/Make webhook
  exportToWebhook() {
    const json = this.generateWebhookJSON();
    const filename = `webhook_posts_${
      new Date().toISOString().split("T")[0]
    }.json`;
    this.downloadJSON(json, filename);
  }

  // Clear all scheduled posts
  clearPosts() {
    this.scheduledPosts = [];
  }

  // Get post count
  getPostCount() {
    return this.scheduledPosts.length;
  }

  // Get posts by platform
  getPostsByPlatform(platform) {
    return this.scheduledPosts.filter((post) => post.platform === platform);
  }

  // Get posts by client
  getPostsByClient(client) {
    return this.scheduledPosts.filter((post) => post.client === client);
  }
}

// Global exporter instance
window.socialMediaExporter = new SocialMediaExporter();

// Enhanced export functions for the dashboard
function exportToBuffer() {
  window.socialMediaExporter.exportToBuffer();
  alert(
    "Buffer CSV exported successfully! Import this file into Buffer to schedule your posts."
  );
}

function exportToHootsuite() {
  window.socialMediaExporter.exportToHootsuite();
  alert(
    "Hootsuite CSV exported successfully! Import this file into Hootsuite to schedule your posts."
  );
}

function exportToLater() {
  window.socialMediaExporter.exportToLater();
  alert(
    "Later CSV exported successfully! Import this file into Later to schedule your posts."
  );
}

function exportToWebhook() {
  window.socialMediaExporter.exportToWebhook();
  alert(
    "Webhook JSON exported successfully! Use this with Zapier or Make.com for automated posting."
  );
}

// Enhanced schedule post function
function schedulePost() {
  const platform = document.getElementById("schedulePlatform").value;
  const content = document.getElementById("scheduleContent").value;
  const dateTime = document.getElementById("scheduleDateTime").value;
  const client = document.getElementById("scheduleClient").value;

  if (!content || !dateTime) {
    alert("Please fill in all required fields");
    return;
  }

  // Add to exporter
  const postId = window.socialMediaExporter.addPost({
    platform: platform,
    content: content,
    scheduledTime: new Date(dateTime),
    client: client,
    hashtags: extractHashtags(content),
    utmSource: platform,
    utmMedium: "social",
    utmCampaign: "automated",
  });

  // Add to UI
  const scheduleItem = document.createElement("div");
  scheduleItem.className = "schedule-item";
  scheduleItem.innerHTML = `
        <div class="schedule-time">${new Date(dateTime).toLocaleString()}</div>
        <div class="schedule-content">${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        }: ${content.substring(0, 50)}...</div>
    `;

  document.getElementById("scheduledPosts").appendChild(scheduleItem);

  // Clear form
  document.getElementById("scheduleContent").value = "";
  document.getElementById("scheduleDateTime").value = "";

  alert(
    `Post scheduled successfully! Total posts: ${window.socialMediaExporter.getPostCount()}`
  );
}

// Extract hashtags from content
function extractHashtags(content) {
  const hashtagRegex = /#\w+/g;
  return content.match(hashtagRegex) || [];
}

// Generate sample posts for testing
function generateSamplePosts() {
  const samplePosts = [
    {
      platform: "facebook",
      content:
        "🚀 Ready to grow your SEO Services in Greensburg PA? Our expert team at TNR Business Solutions has helped 50+ local businesses achieve their goals! 💼\n\n✅ Professional SEO services\n✅ Proven results\n✅ Local expertise\n\n📞 Call (412) 499-2987 for a FREE consultation!\n\n#TNRBusinessSolutions #SEOServices #GreensburgPA #LocalBusiness",
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      client: "TNR Business Solutions",
    },
    {
      platform: "instagram",
      content:
        "🎉 SUCCESS STORY! We're thrilled to share how we helped Local Business increase their online visibility by 150%! 📈\n\nOur SEO strategies delivered:\n✅ 300% increase in organic traffic\n✅ 85% improvement in Google rankings\n✅ 200% boost in lead generation\n\nReady for your success story? Contact TNR Business Solutions today! 📞 (412) 499-2987\n\n#SuccessStory #TNRBusinessSolutions #SEOServices #GreensburgPA",
      scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      client: "TNR Business Solutions",
    },
    {
      platform: "linkedin",
      content:
        "💡 PRO TIP: Focus on local keywords to improve your Google rankings\n\nThis simple strategy can make a huge difference for your digital marketing business! 💼\n\nWant more expert tips? Follow TNR Business Solutions for daily insights! 📱\n\n#ProTip #TNRBusinessSolutions #DigitalMarketing #BusinessTips #GreensburgPA",
      scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      client: "TNR Business Solutions",
    },
  ];

  samplePosts.forEach((post) => {
    window.socialMediaExporter.addPost(post);
  });

  alert(
    `Generated ${samplePosts.length} sample posts! You can now export them to your preferred scheduler.`
  );
}
