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
    if (window.location.pathname.includes('admin')) {
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

  createPopupHTML() {
    const popupHTML = `
      <div id="exit-popup-overlay" class="exit-popup-overlay" style="display: none;">
        <div class="exit-popup-container">
          <button class="exit-popup-close" onclick="closeExitPopup()">&times;</button>
          
          <div class="exit-popup-content">
            <div class="exit-popup-icon">⚠️</div>
            <h2>Wait! Don't Leave Without Your Free Quote</h2>
            <p class="exit-popup-subtitle">Get instant pricing on insurance & marketing services</p>
            
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

            <div id="exit-popup-success" class="exit-popup-success" style="display: none;">
              <div class="success-icon">✓</div>
              <h3>Thank You!</h3>
              <p>We'll contact you within 24 hours with your personalized quote.</p>
              <p>Check your email for immediate resources!</p>
            </div>
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
    const styles = `
      <style>
        .exit-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-in;
        }

        .exit-popup-container {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease-out;
        }

        .exit-popup-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          font-size: 32px;
          cursor: pointer;
          color: #666;
          line-height: 1;
          z-index: 1;
          transition: color 0.2s;
        }

        .exit-popup-close:hover {
          color: #000;
        }

        .exit-popup-content {
          padding: 40px;
          text-align: center;
        }

        .exit-popup-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .exit-popup-content h2 {
          font-size: 28px;
          color: #2c5530;
          margin-bottom: 10px;
          line-height: 1.3;
        }

        .exit-popup-subtitle {
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
        }

        .exit-popup-benefits {
          text-align: left;
          margin: 30px auto;
          max-width: 400px;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          font-size: 16px;
        }

        .benefit-icon {
          color: #2c5530;
          font-weight: bold;
          margin-right: 12px;
          font-size: 20px;
        }

        .exit-popup-form {
          max-width: 400px;
          margin: 0 auto;
        }

        .exit-popup-form input,
        .exit-popup-form select {
          width: 100%;
          padding: 14px;
          margin-bottom: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .exit-popup-form input:focus,
        .exit-popup-form select:focus {
          outline: none;
          border-color: #2c5530;
        }

        .exit-popup-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .exit-popup-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        }

        .exit-popup-privacy {
          font-size: 14px;
          color: #999;
          margin-top: 15px;
        }

        .exit-popup-success {
          padding: 40px 20px;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #2c5530;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          margin: 0 auto 20px;
        }

        .exit-popup-success h3 {
          color: #2c5530;
          margin-bottom: 15px;
        }

        .exit-popup-success p {
          color: #666;
          line-height: 1.6;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(50px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .exit-popup-content {
            padding: 30px 20px;
          }

          .exit-popup-content h2 {
            font-size: 24px;
          }

          .exit-popup-subtitle {
            font-size: 16px;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }
}

// Global functions
window.closeExitPopup = function() {
  const overlay = document.getElementById('exit-popup-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
};

window.submitExitPopupForm = async function(event) {
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
        window.closeExitPopup();
      }, 5000);
    } else {
      alert('Something went wrong. Please try again or call us at (412) 499-2987');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    alert('Unable to submit form. Please call us at (412) 499-2987');
  }
};

// Initialize exit intent
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ExitIntentPopup();
  });
} else {
  new ExitIntentPopup();
}
