/**
 * TNR SEO & Analytics Embedded Script
 * Provides SEO tracking, analytics, and automation features for Wix sites
 *
 * Script Type: Functional
 * Placement: HTML Head
 */

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    apiBaseUrl: "https://www.tnrbusinesssolutions.com/api/wix",
    instanceId: window.wixBiSession?.instanceId || null,
    siteId: window.wixBiSession?.msId || null,
    debug: false,
  };

  // Logging utility
  function log(message, data) {
    // Only log in debug mode (disabled in production)
    if (CONFIG.debug) {
      console.log("[TNR SEO]", message, data || "");
    }
  }

  // Get instance ID from Wix context
  function getInstanceId() {
    // Try multiple methods to get instance ID
    if (CONFIG.instanceId) return CONFIG.instanceId;
    if (window.wixBiSession?.instanceId) return window.wixBiSession.instanceId;
    if (window.wix?.site?.instanceId) return window.wix.site.instanceId;

    // Try to get from meta tag
    const metaTag = document.querySelector('meta[name="wix-instance-id"]');
    if (metaTag) return metaTag.getAttribute("content");

    // Try to get from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("instanceId")) return urlParams.get("instanceId");

    return null;
  }

  // Track page view for SEO analytics
  function trackPageView() {
    const instanceId = getInstanceId();
    if (!instanceId) {
      log("No instance ID found, skipping page view tracking");
      return;
    }

    const pageData = {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    // Send to analytics API (non-blocking)
    if ("sendBeacon" in navigator) {
      const data = JSON.stringify({
        action: "trackPageView",
        instanceId: instanceId,
        pageData: pageData,
      });
      navigator.sendBeacon(`${CONFIG.apiBaseUrl}?action=trackPageView`, data);
    } else {
      // Fallback to fetch
      fetch(`${CONFIG.apiBaseUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trackPageView",
          instanceId: instanceId,
          pageData: pageData,
        }),
        keepalive: true,
      }).catch((err) => log("Error tracking page view", err));
    }

    log("Page view tracked", pageData);
  }

  // Auto-optimize SEO meta tags
  function optimizeSEOTags() {
    const instanceId = getInstanceId();
    if (!instanceId) return;

    // Check if meta description exists
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }

    // Check if meta description is empty or too short
    const currentDesc = metaDesc.getAttribute("content") || "";
    if (!currentDesc || currentDesc.length < 50) {
      // Generate description from page content
      const pageText = document.body.innerText || "";
      const generatedDesc = pageText.substring(0, 155).trim() + "...";
      metaDesc.setAttribute("content", generatedDesc);
      log("Auto-generated meta description", generatedDesc);
    }

    // Ensure Open Graph tags exist
    ensureOpenGraphTags();
  }

  // Add Open Graph tags for better social sharing
  function ensureOpenGraphTags() {
    const ogTags = {
      "og:title": document.title,
      "og:description":
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "",
      "og:url": window.location.href,
      "og:type": "website",
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      if (!content) return;

      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });
  }

  // Track SEO performance metrics
  function trackSEOMetrics() {
    const instanceId = getInstanceId();
    if (!instanceId) return;

    const metrics = {
      pageLoadTime:
        performance.timing.loadEventEnd - performance.timing.navigationStart,
      domContentLoaded:
        performance.timing.domContentLoadedEventEnd -
        performance.timing.navigationStart,
      firstPaint:
        performance
          .getEntriesByType("paint")
          .find((entry) => entry.name === "first-paint")?.startTime || 0,
      metaTitleLength: document.title.length,
      metaDescLength:
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content")?.length || 0,
      headingCount: {
        h1: document.querySelectorAll("h1").length,
        h2: document.querySelectorAll("h2").length,
        h3: document.querySelectorAll("h3").length,
      },
      imageCount: document.querySelectorAll("img").length,
      linkCount: document.querySelectorAll("a").length,
    };

    // Send metrics (non-blocking)
    if ("sendBeacon" in navigator) {
      const data = JSON.stringify({
        action: "trackSEOMetrics",
        instanceId: instanceId,
        metrics: metrics,
      });
      navigator.sendBeacon(`${CONFIG.apiBaseUrl}?action=trackSEOMetrics`, data);
    }

    log("SEO metrics tracked", metrics);
  }

  // Monitor Core Web Vitals
  function trackWebVitals() {
    // Largest Contentful Paint (LCP)
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];

          const instanceId = getInstanceId();
          if (instanceId && lastEntry) {
            const data = JSON.stringify({
              action: "trackWebVital",
              instanceId: instanceId,
              metric: "LCP",
              value: lastEntry.renderTime || lastEntry.loadTime,
              url: window.location.href,
            });

            if ("sendBeacon" in navigator) {
              navigator.sendBeacon(
                `${CONFIG.apiBaseUrl}?action=trackWebVital`,
                data
              );
            }
          }
        });

        observer.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch (e) {
        log("Web Vitals tracking error", e);
      }
    }
  }

  // Initialize when DOM is ready
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
      return;
    }

    log("TNR SEO Script initialized");

    // Run optimizations
    optimizeSEOTags();

    // Track analytics
    trackPageView();
    trackSEOMetrics();
    trackWebVitals();

    // Track page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        // Send final metrics before page unload
        trackSEOMetrics();
      }
    });
  }

  // Start initialization
  init();

  // Expose API for external use
  window.TNRSEO = {
    trackEvent: function (eventName, eventData) {
      const instanceId = getInstanceId();
      if (!instanceId) return;

      const data = JSON.stringify({
        action: "trackEvent",
        instanceId: instanceId,
        eventName: eventName,
        eventData: eventData || {},
        timestamp: new Date().toISOString(),
      });

      if ("sendBeacon" in navigator) {
        navigator.sendBeacon(`${CONFIG.apiBaseUrl}?action=trackEvent`, data);
      } else {
        fetch(`${CONFIG.apiBaseUrl}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: data,
          keepalive: true,
        }).catch((err) => log("Error tracking event", err));
      }
    },
    getInstanceId: getInstanceId,
    config: CONFIG,
  };
})();
