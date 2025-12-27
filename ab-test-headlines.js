/**
 * A/B Testing Framework for Headlines
 * Automatically tests different headline variations and tracks performance
 * Integrates with Google Analytics for conversion tracking
 */

class ABTestHeadlines {
  constructor(config) {
    this.testId = config.testId || 'headline_test_' + Date.now();
    this.variations = config.variations || [];
    this.targetElement = config.targetElement;
    this.conversionGoal = config.conversionGoal || 'form_submission';
    this.cookieName = 'ab_test_' + this.testId;
    this.cookieDuration = config.cookieDuration || 30; // days
    
    this.init();
  }

  init() {
    // Get or assign variation
    const variation = this.getVariation();
    
    // Apply the variation
    this.applyVariation(variation);
    
    // Track impression
    this.trackImpression(variation);
    
    // Set up conversion tracking
    this.setupConversionTracking(variation);
  }

  getVariation() {
    // Check if user already has an assigned variation
    let variation = this.getCookie(this.cookieName);
    
    if (!variation) {
      // Randomly assign a variation
      const randomIndex = Math.floor(Math.random() * this.variations.length);
      variation = this.variations[randomIndex];
      
      // Store in cookie
      this.setCookie(this.cookieName, JSON.stringify(variation), this.cookieDuration);
    } else {
      variation = JSON.parse(variation);
    }
    
    return variation;
  }

  applyVariation(variation) {
    const element = document.querySelector(this.targetElement);
    if (!element) {
      console.error('Target element not found:', this.targetElement);
      return;
    }

    // Apply headline text
    if (variation.headline) {
      const headline = element.querySelector('h1') || element.querySelector('h2');
      if (headline) {
        headline.textContent = variation.headline;
      }
    }

    // Apply subheadline text
    if (variation.subheadline) {
      const subheadline = element.querySelector('p') || element.querySelector('.subheadline');
      if (subheadline) {
        subheadline.textContent = variation.subheadline;
      }
    }

    // Apply CTA button text
    if (variation.ctaText) {
      const ctaButtons = element.querySelectorAll('.cta-button, .btn-primary');
      ctaButtons.forEach(btn => {
        btn.textContent = variation.ctaText;
      });
    }

    // Add variation class for CSS targeting
    element.classList.add('ab-variation-' + variation.id);
  }

  trackImpression(variation) {
    // Track in Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ab_test_impression', {
        'event_category': 'AB Testing',
        'event_label': this.testId,
        'variation_id': variation.id,
        'variation_name': variation.name
      });
    }

    // Track in local storage for reporting
    this.incrementCount('impressions', variation.id);
  }

  setupConversionTracking(variation) {
    // Listen for form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.tagName === 'FORM') {
        this.trackConversion(variation);
      }
    });

    // Listen for CTA button clicks
    document.querySelectorAll('.cta-button, .btn-primary, .btn-cta').forEach(btn => {
      btn.addEventListener('click', () => {
        this.trackInteraction(variation);
      });
    });

    // Custom conversion events
    window.addEventListener('ab_conversion', () => {
      this.trackConversion(variation);
    });
  }

  trackConversion(variation) {
    // Track in Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ab_test_conversion', {
        'event_category': 'AB Testing',
        'event_label': this.testId,
        'variation_id': variation.id,
        'variation_name': variation.name
      });
    }

    // Track in local storage
    this.incrementCount('conversions', variation.id);
  }

  trackInteraction(variation) {
    // Track CTA clicks
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ab_test_interaction', {
        'event_category': 'AB Testing',
        'event_label': this.testId,
        'variation_id': variation.id,
        'variation_name': variation.name
      });
    }

    this.incrementCount('interactions', variation.id);
  }

  incrementCount(type, variationId) {
    const key = `ab_test_${this.testId}_${type}`;
    let data = JSON.parse(localStorage.getItem(key) || '{}');
    data[variationId] = (data[variationId] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Cookie utilities
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
  }

  getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Static method to get test results
  static getTestResults(testId) {
    const impressions = JSON.parse(localStorage.getItem(`ab_test_${testId}_impressions`) || '{}');
    const conversions = JSON.parse(localStorage.getItem(`ab_test_${testId}_conversions`) || '{}');
    const interactions = JSON.parse(localStorage.getItem(`ab_test_${testId}_interactions`) || '{}');

    const results = {};
    Object.keys(impressions).forEach(variationId => {
      results[variationId] = {
        impressions: impressions[variationId] || 0,
        conversions: conversions[variationId] || 0,
        interactions: interactions[variationId] || 0,
        conversionRate: impressions[variationId] 
          ? ((conversions[variationId] || 0) / impressions[variationId] * 100).toFixed(2) + '%'
          : '0%',
        interactionRate: impressions[variationId]
          ? ((interactions[variationId] || 0) / impressions[variationId] * 100).toFixed(2) + '%'
          : '0%'
      };
    });

    return results;
  }

  // Static method to reset test data
  static resetTest(testId) {
    localStorage.removeItem(`ab_test_${testId}_impressions`);
    localStorage.removeItem(`ab_test_${testId}_conversions`);
    localStorage.removeItem(`ab_test_${testId}_interactions`);
    
    // Clear cookie
    document.cookie = `ab_test_${testId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ABTestHeadlines;
}
