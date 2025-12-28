/* global window, document, sessionStorage, setTimeout, alert, console, gtag, FormData, fetch */

// TNR Business Solutions - Exit Intent Popup
// Captures abandoning visitors with compelling offer

class ExitIntentPopup {
  constructor(options = {}) {
    this.options = {
      sensitivity: 20,
      timer: 1000,
      delay: 0,
      callback: this.showPopup.bind(this),
      ...options
    };
    
    this.triggered = false;
    this.init();
  }

  init() {
    // Check if user has already seen popup in this session
    if (sessionStorage.getItem('exitPopupShown')) {
      return;
    }

    // Don't show on admin pages
    if (globalThis.location?.pathname.includes('admin')) {
      return;
    }

    // Add mouse leave listener
    document.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
    
    // Create popup HTML
    this.createPopupHTML();
  }

  handleMouseLeave(e) {
    if (this.triggered) return;
    
    // Check if cursor is leaving from top of page
    if (e.clientY <= this.options.sensitivity) {
      this.triggered = true;
      
      setTimeout(() => {
        this.options.callback();
      }, this.options.delay);
    }
  }

  getPopupFormHTML() {
    return `
      <form id="exit-popup-form" class="exit-popup-form" onsubmit="submitExitPopupForm(event)">
        <input type="text" name="name" placeholder="Your Name" required>
        <input type="email" name="email" placeholder="Email Address" required>
        <input type="tel" name="phone" placeholder="Phone Number" required>
        
        <select name="interest" required>
          <option value="">What are you interested in?</option>
          <option value="insurance">Insurance Services</option>
          <option value="marketing">Digital Marketing</option>
          <option value="both">Both Services</option>
        </select>

        <button type="submit" class="exit-popup-submit">Get My Free Quote Now</button>
        
        <p class="exit-popup-privacy">
          🔒 Your information is secure. We'll never share it.
        </p>
      </form>
    `;
  }

  getPopupSuccessHTML() {
    return `
      <div id="exit-popup-success" class="exit-popup-success" style="display: none;">
        <div class="success-icon">✓</div>
        <h3>Thank You!</h3>
        <p>We'll contact you within 24 hours with your personalized quote.</p>
        <p>Check your email for immediate resources!</p>
      </div>
    `;
  }

  getPopupBenefitsHTML() {
    return `
      <div class="exit-popup-benefits">
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span>Free consultation ($200 value)</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span>No obligation quote in 2 minutes</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span>Local Greensburg PA experts</span>
        </div>
      </div>
    `;
  }

  createPopupHTML() {
    const formHTML = this.getPopupFormHTML();
    const successHTML = this.getPopupSuccessHTML();
    const benefitsHTML = this.getPopupBenefitsHTML();

    const popupHTML = `
      <div id="exit-popup-overlay" class="exit-popup-overlay" style="display: none;">
        <div class="exit-popup-container">
          <button class="exit-popup-close" onclick="closeExitPopup()">&times;</button>
          
          <div class="exit-popup-content">
            <div class="exit-popup-icon">⚠️</div>
            <h2>Wait! Don't Leave Without Your Free Quote</h2>
            <p class="exit-popup-subtitle">Get instant pricing on insurance & marketing services</p>
            
            ${benefitsHTML}
            ${formHTML}
            ${successHTML}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);
    this.addStyles();
  }

  showPopup() {
    const overlay = document.getElementById('exit-popup-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Mark as shown in session
      sessionStorage.setItem('exitPopupShown', 'true');
      
      // Track event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'exit_intent_shown', {
          'event_category': 'engagement'
        });
      }
    }
  }

  addStyles() {
    // Link to external CSS file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'exit-intent.css';
    document.head.appendChild(link);
  }
}

// Global functions
globalThis.closeExitPopup = function() {
  const overlay = document.getElementById('exit-popup-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
};

globalThis.submitExitPopupForm = async function(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Add source tracking
  data.source = 'exit_intent_popup';
  data.timestamp = new Date().toISOString();

  try {
    const response = await fetch('/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      // Hide form, show success
      form.style.display = 'none';
      document.getElementById('exit-popup-success').style.display = 'block';
      
      // Track conversion
      if (typeof gtag !== 'undefined') {
        gtag('event', 'exit_intent_conversion', {
          'event_category': 'lead_generation',
          'event_label': data.interest
        });
      }

      // Auto close after 5 seconds
      setTimeout(() => {
        globalThis.closeExitPopup();
      }, 5000);
    } else {
      alert('Something went wrong. Please try again or call us at (412) 499-2987');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    alert('Unable to submit form. Please call us at (412) 499-2987');
  }
};

// Initialize exit intent popup
function initializeExitIntent() {
  if (typeof window !== 'undefined') {
    globalThis.exitPopupInstance = new ExitIntentPopup();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExitIntent);
} else {
  initializeExitIntent();
