// TNR Business Solutions - Admin Dashboard Analytics
// Real-time analytics integration for admin dashboard

class DashboardAnalytics {
  constructor() {
    this.updateInterval = 30000; // 30 seconds
    this.init();
  }

  init() {
    this.loadStats();
    this.loadRecentLeads();
    this.startAutoRefresh();
    this.setupEventHandlers();
  }

  async loadStats() {
    try {
      const response = await fetch('/api/dashboard/stats');
      const stats = await response.json();
      
      this.updateStatsDisplay(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      this.showError('Unable to load dashboard statistics');
    }
  }

  updateStatsDisplay(stats) {
    // Update visitor count
    const visitorsEl = document.getElementById('visitors-today');
    if (visitorsEl) {
      visitorsEl.textContent = stats.visitorsToday || 0;
      this.animateNumber(visitorsEl);
    }

    // Update form submissions
    const formsEl = document.getElementById('form-submissions');
    if (formsEl) {
      formsEl.textContent = `${stats.leadsToday || 0} new leads`;
    }

    // Update quote requests
    const quotesEl = document.getElementById('quote-requests');
    if (quotesEl) {
      quotesEl.textContent = `${stats.quotesRequested || 0} quotes`;
    }

    // Update GMB stats
    const gmbViewsEl = document.getElementById('gmb-views');
    if (gmbViewsEl) {
      gmbViewsEl.textContent = `Views: ${stats.gmbViews || 0}`;
    }

    const gmbActionsEl = document.getElementById('gmb-actions');
    if (gmbActionsEl) {
      gmbActionsEl.textContent = `Actions: ${stats.gmbActions || 0}`;
    }

    // Update conversion rate
    const conversionRate = stats.leadsToday > 0 
      ? ((stats.quotesRequested / stats.leadsToday) * 100).toFixed(1)
      : 0;
    
    const conversionEl = document.getElementById('conversion-rate');
    if (conversionEl) {
      conversionEl.textContent = `${conversionRate}%`;
    }
  }

  async loadRecentLeads() {
    try {
      const response = await fetch('/api/leads/recent');
      const leads = await response.json();
      
      this.displayLeads(leads);
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  }

  displayLeads(leads) {
    const tbody = document.getElementById('leads-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    leads.forEach(lead => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${this.formatTime(lead.timestamp)}</td>
        <td>${this.escapeHtml(lead.name)}</td>
        <td><span class="badge badge-${this.getLeadTypeBadge(lead.type)}">${lead.type}</span></td>
        <td>
          <button onclick="viewLead('${lead.id}')" class="btn-sm">View</button>
          <button onclick="contactLead('${lead.id}')" class="btn-sm btn-primary">Contact</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  getLeadTypeBadge(type) {
    const badges = {
      'contact': 'primary',
      'insurance': 'success',
      'quote': 'warning',
      'consultation': 'info'
    };
    return badges[type.toLowerCase()] || 'secondary';
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (diff < 86400000) { // Less than 24 hours
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  animateNumber(element) {
    element.classList.add('pulse-animation');
    setTimeout(() => element.classList.remove('pulse-animation'), 600);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  startAutoRefresh() {
    setInterval(() => {
      this.loadStats();
      this.loadRecentLeads();
    }, this.updateInterval);
  }

  setupEventHandlers() {
    // Export leads button
    const exportBtn = document.getElementById('export-leads-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportLeads());
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-stats-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadStats();
        this.loadRecentLeads();
      });
    }
  }

  async exportLeads() {
    try {
      const response = await fetch('/api/leads/export', {
        method: 'POST'
      });
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export leads:', error);
      alert('Failed to export leads. Please try again.');
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.dashboard-grid');
    if (container) {
      container.insertBefore(errorDiv, container.firstChild);
      setTimeout(() => errorDiv.remove(), 5000);
    }
  }
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DashboardAnalytics();
  });
} else {
  new DashboardAnalytics();
}

// Global functions for lead actions
window.viewLead = function(leadId) {
  window.location.href = `/admin-lead-detail.html?id=${leadId}`;
};

window.contactLead = function(leadId) {
  window.location.href = `/admin-lead-detail.html?id=${leadId}&action=contact`;
};
