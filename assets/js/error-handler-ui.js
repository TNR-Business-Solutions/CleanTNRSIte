// Client-side Error Handler UI
// Provides consistent error display and handling in the frontend

class ErrorHandlerUI {
  /**
   * Show error message to user
   * @param {string|Object} error - Error message or error object
   * @param {Object} options - Display options
   */
  static showError(error, options = {}) {
    const {
      title = "Error",
      duration = 5000,
      position = "top-right",
      showDetails = false,
      onClose = null,
    } = options;

    // Extract message from error object
    let message = error;
    let errorId = null;
    let helpText = null;
    let retryable = false;
    let action = null;
    let actionUrl = null;

    if (typeof error === "object") {
      message = error.message || error.error || "An unexpected error occurred";
      errorId = error.errorId;
      helpText = error.help;
      retryable = error.retryable;
      action = error.action;
      actionUrl = error.actionUrl;
    }

    // Create error notification
    const notification = this.createErrorNotification({
      title,
      message,
      errorId,
      helpText,
      retryable,
      action,
      actionUrl,
      showDetails,
      duration,
      position,
      onClose,
    });

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeError(notification);
      }, duration);
    }

    return notification;
  }

  /**
   * Create error notification element
   */
  static createErrorNotification(options) {
    const {
      title,
      message,
      errorId,
      helpText,
      retryable,
      action,
      actionUrl,
      position,
      onClose,
    } = options;

    const notification = document.createElement("div");
    notification.className = `error-notification error-notification-${position}`;
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "assertive");

    let actionButton = "";
    if (action === "reconnect" && actionUrl) {
      actionButton = `
        <button class="error-action-btn" onclick="window.location.href='${actionUrl}'">
          Reconnect Account
        </button>
      `;
    } else if (retryable) {
      actionButton = `
        <button class="error-retry-btn" onclick="location.reload()">
          Retry
        </button>
      `;
    }

    notification.innerHTML = `
      <div class="error-notification-content">
        <div class="error-notification-header">
          <span class="error-icon">❌</span>
          <h4 class="error-title">${this.escapeHtml(title)}</h4>
          <button class="error-close-btn" onclick="ErrorHandlerUI.removeError(this.closest('.error-notification'))" aria-label="Close">
            &times;
          </button>
        </div>
        <div class="error-message">${this.escapeHtml(message)}</div>
        ${
          helpText
            ? `<div class="error-help">${this.escapeHtml(helpText)}</div>`
            : ""
        }
        ${
          errorId
            ? `<div class="error-id">Error ID: <code>${errorId}</code></div>`
            : ""
        }
        ${
          actionButton ? `<div class="error-actions">${actionButton}</div>` : ""
        }
      </div>
    `;

    // Add close handler
    if (onClose) {
      notification.addEventListener("close", onClose);
    }

    return notification;
  }

  /**
   * Remove error notification
   */
  static removeError(notification) {
    if (!notification) return;

    notification.classList.add("hide");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Show success message
   */
  static showSuccess(message, options = {}) {
    const {
      title = "Success",
      duration = 3000,
      position = "top-right",
    } = options;

    const notification = document.createElement("div");
    notification.className = `success-notification success-notification-${position}`;
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "polite");

    notification.innerHTML = `
      <div class="success-notification-content">
        <div class="success-notification-header">
          <span class="success-icon">✅</span>
          <h4 class="success-title">${this.escapeHtml(title)}</h4>
          <button class="success-close-btn" onclick="ErrorHandlerUI.removeError(this.closest('.success-notification'))" aria-label="Close">
            &times;
          </button>
        </div>
        <div class="success-message">${this.escapeHtml(message)}</div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    if (duration > 0) {
      setTimeout(() => {
        this.removeError(notification);
      }, duration);
    }

    return notification;
  }

  /**
   * Handle API error response
   */
  static handleApiError(response, error) {
    // Try to parse error response
    if (response?.json) {
      response
        .json()
        .then((data) => {
          this.showError(data, {
            title: data.error || "API Error",
            showDetails: true,
            duration: 8000,
          });
        })
        .catch(() => {
          this.showError(error || "Network error occurred", {
            title: "Connection Error",
            retryable: true,
          });
        });
    } else {
      this.showError(error || "An unexpected error occurred", {
        title: "Error",
        retryable: true,
      });
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  static escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show loading state
   */
  static showLoading(message = "Loading...") {
    const loading = document.createElement("div");
    loading.className = "loading-overlay";
    loading.id = "error-handler-loading";
    loading.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-message">${this.escapeHtml(message)}</div>
      </div>
    `;
    document.body.appendChild(loading);
    return loading;
  }

  /**
   * Hide loading state
   */
  static hideLoading() {
    const loading = document.getElementById("error-handler-loading");
    if (loading) {
      loading.remove();
    }
  }
}

// Make available globally
if (typeof globalThis !== "undefined") {
  globalThis.ErrorHandlerUI = ErrorHandlerUI;
} else if (typeof window !== "undefined") {
  window.ErrorHandlerUI = ErrorHandlerUI;
}
