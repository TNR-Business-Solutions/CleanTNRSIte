/**
 * Social Proof Notification System
 * Displays real-time notifications of user actions to build trust
 * Creates FOMO (Fear of Missing Out) effect
 */

class SocialProofNotifications {
  constructor(config = {}) {
    this.notifications = config.notifications || this.getDefaultNotifications();
    this.displayInterval = config.displayInterval || 8000; // 8 seconds
    this.displayDuration = config.displayDuration || 5000; // 5 seconds
    this.position = config.position || 'bottom-left'; // bottom-left, bottom-right, top-left, top-right
    this.maxNotifications = config.maxNotifications || 1;
    this.enabled = config.enabled !== false;
    
    this.activeNotifications = [];
    this.notificationQueue = [];
    this.notificationIndex = 0;
    
    if (this.enabled) {
      this.init();
    }
  }

  init() {
    // Create container
    this.createContainer();
    
    // Start showing notifications
    this.startNotificationCycle();
    
    // Track actual conversions
    this.trackRealConversions();
  }

  getDefaultNotifications() {
    return [
      {
        icon: '🎯',
        message: 'Someone from Pittsburgh just requested a quote',
        time: '2 minutes ago',
        type: 'conversion'
      },
      {
        icon: '✅',
        message: 'John from Greensburg secured business insurance',
        time: '5 minutes ago',
        type: 'success'
      },
      {
        icon: '📞',
        message: '3 people are viewing this page right now',
        time: 'Just now',
        type: 'activity'
      },
      {
        icon: '💼',
        message: 'Sarah from Westmoreland County started a consultation',
        time: '8 minutes ago',
        type: 'conversion'
      },
      {
        icon: '⭐',
        message: 'Mike left a 5-star review',
        time: '12 minutes ago',
        type: 'review'
      },
      {
        icon: '🚀',
        message: 'Local business owner downloaded our free checklist',
        time: '15 minutes ago',
        type: 'download'
      },
      {
        icon: '📊',
        message: 'Business in Greensburg increased traffic by 45%',
        time: '20 minutes ago',
        type: 'result'
      },
      {
        icon: '🔥',
        message: '12 quotes requested this week',
        time: 'This week',
        type: 'stats'
      }
    ];
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'social-proof-container';
    this.container.className = `social-proof-container ${this.position}`;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .social-proof-container {
        position: fixed;
        z-index: 9998;
        max-width: 350px;
        pointer-events: none;
      }
      
      .social-proof-container.bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .social-proof-container.bottom-right {
        bottom: 20px;
        right: 20px;
      }
      
      .social-proof-container.top-left {
        top: 20px;
        left: 20px;
      }
      
      .social-proof-container.top-right {
        top: 20px;
        right: 20px;
      }
      
      .social-proof-notification {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 12px 16px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.4s ease-out;
        pointer-events: auto;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .social-proof-notification:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }
      
      .social-proof-notification.slide-out {
        animation: slideOut 0.4s ease-out forwards;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-100%);
          opacity: 0;
        }
      }
      
      .social-proof-container.bottom-right .social-proof-notification,
      .social-proof-container.top-right .social-proof-notification {
        animation: slideInRight 0.4s ease-out;
      }
      
      .social-proof-container.bottom-right .social-proof-notification.slide-out,
      .social-proof-container.top-right .social-proof-notification.slide-out {
        animation: slideOutRight 0.4s ease-out forwards;
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .social-proof-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      
      .social-proof-content {
        flex: 1;
      }
      
      .social-proof-message {
        color: #333;
        font-size: 14px;
        font-weight: 500;
        margin: 0 0 4px 0;
        line-height: 1.4;
      }
      
      .social-proof-time {
        color: #666;
        font-size: 12px;
        margin: 0;
      }
      
      .social-proof-close {
        color: #999;
        font-size: 18px;
        cursor: pointer;
        flex-shrink: 0;
        line-height: 1;
        transition: color 0.2s;
      }
      
      .social-proof-close:hover {
        color: #333;
      }
      
      @media (max-width: 768px) {
        .social-proof-container {
          max-width: calc(100% - 40px);
          left: 20px !important;
          right: 20px !important;
        }
        
        .social-proof-notification {
          font-size: 13px;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(this.container);
  }

  startNotificationCycle() {
    // Show first notification after a short delay
    setTimeout(() => {
      this.showNextNotification();
    }, 3000);
    
    // Set up interval for subsequent notifications
    this.intervalId = setInterval(() => {
      this.showNextNotification();
    }, this.displayInterval);
  }

  showNextNotification() {
    if (this.activeNotifications.length >= this.maxNotifications) {
      return;
    }

    const notification = this.notifications[this.notificationIndex];
    this.notificationIndex = (this.notificationIndex + 1) % this.notifications.length;

    this.displayNotification(notification);
  }

  displayNotification(data) {
    const notificationEl = document.createElement('div');
    notificationEl.className = 'social-proof-notification';
    notificationEl.innerHTML = `
      <div class="social-proof-icon">${data.icon}</div>
      <div class="social-proof-content">
        <p class="social-proof-message">${data.message}</p>
        <p class="social-proof-time">${data.time}</p>
      </div>
      <div class="social-proof-close">×</div>
    `;

    // Add to active notifications
    this.activeNotifications.push(notificationEl);
    this.container.appendChild(notificationEl);

    // Close button
    const closeBtn = notificationEl.querySelector('.social-proof-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideNotification(notificationEl);
    });

    // Click to dismiss
    notificationEl.addEventListener('click', () => {
      this.hideNotification(notificationEl);
    });

    // Auto-hide after duration
    setTimeout(() => {
      this.hideNotification(notificationEl);
    }, this.displayDuration);

    // Track notification impression
    if (typeof gtag !== 'undefined') {
      gtag('event', 'social_proof_shown', {
        'event_category': 'engagement',
        'event_label': data.type
      });
    }
  }

  hideNotification(notificationEl) {
    if (!notificationEl || !notificationEl.parentNode) return;

    notificationEl.classList.add('slide-out');
    
    setTimeout(() => {
      if (notificationEl.parentNode) {
        notificationEl.remove();
      }
      const index = this.activeNotifications.indexOf(notificationEl);
      if (index > -1) {
        this.activeNotifications.splice(index, 1);
      }
    }, 400);
  }

  trackRealConversions() {
    // Listen for actual form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.tagName === 'FORM') {
        // Add a real conversion notification
        setTimeout(() => {
          this.displayNotification({
            icon: '🎉',
            message: 'Someone just submitted a form!',
            time: 'Just now',
            type: 'real-conversion'
          });
        }, 2000);
      }
    });
  }

  // Public methods
  addNotification(notification) {
    this.notifications.push(notification);
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  resume() {
    this.startNotificationCycle();
  }

  destroy() {
    this.pause();
    if (this.container && this.container.parentNode) {
      this.container.remove();
    }
    this.activeNotifications = [];
  }
}

// Auto-initialize if not disabled
if (typeof window !== 'undefined' && !window.disableSocialProof) {
  document.addEventListener('DOMContentLoaded', () => {
    window.socialProofNotifications = new SocialProofNotifications({
      position: 'bottom-left',
      displayInterval: 10000, // 10 seconds
      displayDuration: 6000 // 6 seconds
    });
  });
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialProofNotifications;
}
