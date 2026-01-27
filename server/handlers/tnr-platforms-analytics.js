/**
 * TNR Business Solutions - Platforms Analytics
 * Central tracking for all automation tools and reporting platforms.
 * Writes to activity_log (module = platform) so analytics and activity views
 * can filter and report by platform.
 */

let logActivityFn = null;

function getLogActivity() {
  if (!logActivityFn) {
    try {
      const activityLogApi = require("./activity-log-api");
      logActivityFn = activityLogApi.logActivity || (async () => {});
    } catch (e) {
      console.warn("tnr-platforms-analytics: activity-log-api not available", e.message);
      logActivityFn = async () => {};
    }
  }
  return logActivityFn;
}

/** Canonical platform IDs for TNR automation/reporting tools */
const PLATFORMS = Object.freeze({
  CRM: "CRM",
  Campaigns: "Campaigns",
  Social: "Social",
  Automation: "Automation",
  Forms: "Forms",
  Wix: "Wix",
  Analytics: "Analytics",
});

/**
 * Track an event from a TNR platform for activity log and reporting.
 * @param {string} platform - One of PLATFORMS (e.g. 'CRM', 'Campaigns', 'Social', 'Forms', 'Automation', 'Wix')
 * @param {string} action - Short action label (e.g. 'Campaign sent', 'Post published')
 * @param {string} description - Human-readable description for activity timeline
 * @param {object} [metadata] - Optional extra data (counts, ids, etc.)
 */
async function trackPlatformEvent(platform, action, description, metadata = null) {
  const logActivity = getLogActivity();
  const type = (action || "").toLowerCase().replace(/\s+/g, "_").slice(0, 64) || "platform_event";
  await logActivity(type, action, description || action, "system", platform, metadata);
}

module.exports = {
  PLATFORMS,
  trackPlatformEvent,
};
