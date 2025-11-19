/**
 * @fileoverview Analytics Feature JavaScript
 * @module admin/analytics/analytics
 * 
 * Handles:
 * - Loading and displaying analytics data
 * - Overview metrics (clients, leads, revenue, conversion rate)
 * - Lead sources breakdown
 * - Business types breakdown
 * - Recent activity tracking
 * 
 * Dependencies:
 * - admin/shared/utils.js (formatDate, etc.)
 */

// Load Analytics
async function loadAnalytics() {
    const analyticsContent = document.getElementById('analyticsContent');
    if (!analyticsContent) return;

    analyticsContent.innerHTML = '<div class="loading-state"><div class="loading-icon">📊</div><p>Loading analytics...</p></div>';

    try {
        const res = await fetch('/api/analytics?type=all');
        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to load analytics');
        }

        const analytics = data.analytics;
        renderAnalytics(analytics);

    } catch (error) {
        console.error('Error loading analytics:', error);
        analyticsContent.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <p class="error-title"><strong>Error loading analytics</strong></p>
                <p class="error-message">${error.message}</p>
                <button class="btn btn-primary" onclick="loadAnalytics()" style="margin-top: 1rem;">Try Again</button>
            </div>
        `;
    }
}

// Render Analytics Data
function renderAnalytics(analytics) {
    const analyticsContent = document.getElementById('analyticsContent');
    if (!analyticsContent) return;

    const overview = analytics.overview || {};
    const leadSources = analytics.leadSources || [];
    const businessTypes = analytics.businessTypes || [];
    const recentActivity = analytics.recentActivity || {};

    analyticsContent.innerHTML = `
        <!-- Overview Cards -->
        <div class="overview-grid">
            <div class="overview-card">
                <div class="overview-value">${overview.totalClients || 0}</div>
                <div class="overview-label">Total Clients</div>
                <div class="overview-subtext active">${overview.activeClients || 0} active</div>
            </div>
            <div class="overview-card">
                <div class="overview-value">${overview.totalLeads || 0}</div>
                <div class="overview-label">Total Leads</div>
                <div class="overview-subtext new">${overview.newLeads || 0} new</div>
            </div>
            <div class="overview-card">
                <div class="overview-value">${overview.conversionRate || 0}%</div>
                <div class="overview-label">Conversion Rate</div>
                <div class="overview-subtext info">Leads → Clients</div>
            </div>
            <div class="overview-card">
                <div class="overview-value">$${formatRevenue(overview.totalRevenue || 0)}</div>
                <div class="overview-label">Total Revenue</div>
                <div class="overview-subtext success">${overview.completedOrders || 0} orders</div>
            </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
            <!-- Lead Sources -->
            <div class="chart-card">
                <h3 class="chart-title">📊 Lead Sources</h3>
                ${leadSources.length > 0 ? `
                    <div>
                        ${leadSources.slice(0, 5).map(source => `
                            <div class="lead-source-item">
                                <div class="lead-source-info">
                                    <div class="lead-source-name">${escapeHtml(source.source || 'Unknown')}</div>
                                    <div class="lead-source-count">${source.count || 0} leads</div>
                                </div>
                                <div class="lead-source-percentage">${source.percentage || 0}%</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="empty-state">No lead sources tracked yet</p>'}
            </div>

            <!-- Business Types -->
            <div class="chart-card">
                <h3 class="chart-title">🏢 Business Types</h3>
                ${businessTypes.length > 0 ? `
                    <div>
                        ${businessTypes.slice(0, 5).map(type => `
                            <div class="business-type-item">
                                <div class="business-type-name">${escapeHtml(type.type || 'Unknown')}</div>
                                <div class="business-type-count">${type.count || 0}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="empty-state">No business types tracked yet</p>'}
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity-card">
            <h3 class="chart-title">📈 Recent Activity (Last 30 Days)</h3>
            <div class="recent-activity-grid">
                <div class="activity-stat">
                    <div class="activity-stat-value">${recentActivity.newClients || 0}</div>
                    <div class="activity-stat-label">New Clients</div>
                </div>
                <div class="activity-stat">
                    <div class="activity-stat-value">${recentActivity.newLeads || 0}</div>
                    <div class="activity-stat-label">New Leads</div>
                </div>
            </div>
        </div>
    `;
}

// Format Revenue
function formatRevenue(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toFixed(0);
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize Analytics
function initializeAnalytics() {
    console.log('📈 Initializing Analytics page...');
    loadAnalytics();
    
    // Auto-refresh every 5 minutes
    setInterval(() => {
        loadAnalytics();
    }, 5 * 60 * 1000);
}

// Export functions to global scope
window.loadAnalytics = loadAnalytics;
window.initializeAnalytics = initializeAnalytics;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAnalytics();
});

