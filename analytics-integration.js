// TNR Business Solutions - Analytics Integration
// This script integrates all analytics and monitoring components

class TNRAnalytics {
  constructor() {
    this.config = {
      googleAnalytics: {
        enabled: true,
        measurementId: 'G-XXXXXXXXXX'
      },
      performance: {
        enabled: true
      },
      errorTracking: {
        enabled: true
      },
      userBehavior: {
        enabled: true
      }
    };
    
    this.init();
  }
  
  init() {
    // Initialize Google Analytics
    if (this.config.googleAnalytics.enabled) {
      this.initGoogleAnalytics();
    }
    
    // Initialize performance monitoring
    if (this.config.performance.enabled) {
      this.initPerformanceMonitoring();
    }
    
    // Initialize error tracking
    if (this.config.errorTracking.enabled) {
      this.initErrorTracking();
    }
    
    // Initialize user behavior tracking
    if (this.config.userBehavior.enabled) {
      this.initUserBehaviorTracking();
    }
  }
  
  initGoogleAnalytics() {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalytics.measurementId}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', this.config.googleAnalytics.measurementId);
    
    window.gtag = gtag;
  }
  
  initPerformanceMonitoring() {
    // Performance monitoring will be handled by the performance script
    console.log('Performance monitoring initialized');
  }
  
  initErrorTracking() {
    // Error tracking will be handled by the error tracking script
    console.log('Error tracking initialized');
  }
  
  initUserBehaviorTracking() {
    // User behavior tracking will be handled by the behavior tracking script
    console.log('User behavior tracking initialized');
  }
  
  // Track custom events
  trackEvent(eventName, parameters = {}) {
    if (window.gtag) {
      gtag('event', eventName, parameters);
    }
  }
  
  // Track form submissions
  trackFormSubmission(formType, formData) {
    this.trackEvent('form_submit', {
      event_category: 'Form',
      event_label: formType,
      value: 1,
      business_type: formData.businessType || 'unknown',
      service_interest: formData.services ? formData.services.join(',') : 'unknown',
      lead_source: formData.source || 'website'
    });
  }
  
  // Track button clicks
  trackButtonClick(buttonText, buttonLocation) {
    this.trackEvent('button_click', {
      event_category: 'Button',
      event_label: buttonText,
      button_location: buttonLocation,
      value: 1
    });
  }
  
  // Track page views
  trackPageView(pageName, pageCategory) {
    this.trackEvent('page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_category: pageCategory,
      business_type: 'digital_marketing_insurance'
    });
  }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.tnrAnalytics = new TNRAnalytics();
});

// Export for use in other scripts
window.TNRAnalytics = TNRAnalytics;