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

// Chart instances storage
let chartInstances = {};

// Render Analytics Data
function renderAnalytics(analytics) {
    const analyticsContent = document.getElementById('analyticsContent');
    if (!analyticsContent) return;

    const overview = analytics.overview || {};
    const leadSources = analytics.leadSources || [];
    const businessTypes = analytics.businessTypes || [];
    const recentActivity = analytics.recentActivity || {};
    const revenueTrend = analytics.revenueTrend || [];
    const conversionFunnel = analytics.conversionFunnel || {};

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
            <!-- Revenue Trend Chart -->
            <div class="chart-card full-width">
                <div class="chart-header">
                    <h3 class="chart-title">📈 Revenue Trend</h3>
                    <button class="btn btn-small btn-secondary" onclick="exportChart('revenue')">📥 Export</button>
                </div>
                <canvas id="revenueChart" style="max-height: 300px;"></canvas>
            </div>

            <!-- Lead Sources Chart -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title">📊 Lead Sources</h3>
                    <button class="btn btn-small btn-secondary" onclick="exportChart('leadSources')">📥 Export</button>
                </div>
                <canvas id="leadSourcesChart" style="max-height: 250px;"></canvas>
            </div>

            <!-- Business Types Chart -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title">🏢 Business Types</h3>
                    <button class="btn btn-small btn-secondary" onclick="exportChart('businessTypes')">📥 Export</button>
                </div>
                <canvas id="businessTypesChart" style="max-height: 250px;"></canvas>
            </div>

            <!-- Conversion Funnel -->
            <div class="chart-card full-width">
                <div class="chart-header">
                    <h3 class="chart-title">🔄 Conversion Funnel</h3>
                    <button class="btn btn-small btn-secondary" onclick="exportChart('conversionFunnel')">📥 Export</button>
                </div>
                <canvas id="conversionFunnelChart" style="max-height: 300px;"></canvas>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity-card">
            <div class="chart-header">
                <h3 class="chart-title">📈 Recent Activity (Last 30 Days)</h3>
                <button class="btn btn-primary" onclick="exportReport()">📥 Export Full Report</button>
            </div>
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

    // Render charts after DOM is updated
    setTimeout(() => {
        renderRevenueChart(revenueTrend);
        renderLeadSourcesChart(leadSources);
        renderBusinessTypesChart(businessTypes);
        renderConversionFunnelChart(conversionFunnel);
    }, 100);
}

// Render Revenue Trend Chart
function renderRevenueChart(revenueTrend) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartInstances.revenue) {
        chartInstances.revenue.destroy();
    }

    const labels = revenueTrend.map(item => item.date || item.month || 'Unknown');
    const data = revenueTrend.map(item => item.revenue || 0);

    chartInstances.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: data,
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + formatRevenue(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + formatRevenue(value);
                        }
                    }
                }
            }
        }
    });
}

// Render Lead Sources Chart
function renderLeadSourcesChart(leadSources) {
    const ctx = document.getElementById('leadSourcesChart');
    if (!ctx) return;

    if (chartInstances.leadSources) {
        chartInstances.leadSources.destroy();
    }

    if (leadSources.length === 0) {
        ctx.parentElement.innerHTML = '<p class="empty-state">No lead sources tracked yet</p>';
        return;
    }

    const labels = leadSources.map(s => s.source || 'Unknown');
    const data = leadSources.map(s => s.count || 0);
    const colors = generateColors(leadSources.length);

    chartInstances.leadSources = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} leads (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render Business Types Chart
function renderBusinessTypesChart(businessTypes) {
    const ctx = document.getElementById('businessTypesChart');
    if (!ctx) return;

    if (chartInstances.businessTypes) {
        chartInstances.businessTypes.destroy();
    }

    if (businessTypes.length === 0) {
        ctx.parentElement.innerHTML = '<p class="empty-state">No business types tracked yet</p>';
        return;
    }

    const labels = businessTypes.map(t => t.type || 'Unknown');
    const data = businessTypes.map(t => t.count || 0);
    const colors = generateColors(businessTypes.length);

    chartInstances.businessTypes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Render Conversion Funnel Chart
function renderConversionFunnelChart(conversionFunnel) {
    const ctx = document.getElementById('conversionFunnelChart');
    if (!ctx) return;

    if (chartInstances.conversionFunnel) {
        chartInstances.conversionFunnel.destroy();
    }

    const stages = conversionFunnel.stages || ['Leads', 'Contacted', 'Qualified', 'Proposal', 'Closed'];
    const values = conversionFunnel.values || [0, 0, 0, 0, 0];

    chartInstances.conversionFunnel = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: stages,
            datasets: [{
                label: 'Count',
                data: values,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgb(102, 126, 234)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Generate colors for charts
function generateColors(count) {
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(40, 167, 69, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(220, 53, 69, 0.8)',
        'rgba(23, 162, 184, 0.8)',
        'rgba(108, 117, 125, 0.8)',
        'rgba(255, 87, 34, 0.8)',
        'rgba(156, 39, 176, 0.8)'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

// Export chart as image
function exportChart(chartName) {
    const chart = chartInstances[chartName];
    if (!chart) {
        alert('Chart not available');
        return;
    }

    const url = chart.toBase64Image();
    const link = document.createElement('a');
    link.download = `${chartName}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = url;
    link.click();
}

// Export full report
function exportReport() {
    // Create a comprehensive report
    const report = {
        generatedAt: new Date().toISOString(),
        overview: {},
        charts: {}
    };

    // Get current analytics data
    fetch('/api/analytics?type=all')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                report.overview = data.analytics.overview;
                report.leadSources = data.analytics.leadSources;
                report.businessTypes = data.analytics.businessTypes;
                
                // Convert to CSV
                const csv = convertToCSV(report);
                downloadCSV(csv, `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
            }
        })
        .catch(error => {
            console.error('Error exporting report:', error);
            alert('Error exporting report. Please try again.');
        });
}

// Convert report to CSV
function convertToCSV(report) {
    let csv = 'TNR Business Solutions - Analytics Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    csv += 'Overview\n';
    csv += `Total Clients,${report.overview.totalClients || 0}\n`;
    csv += `Active Clients,${report.overview.activeClients || 0}\n`;
    csv += `Total Leads,${report.overview.totalLeads || 0}\n`;
    csv += `New Leads,${report.overview.newLeads || 0}\n`;
    csv += `Total Revenue,$${report.overview.totalRevenue || 0}\n`;
    csv += `Conversion Rate,${report.overview.conversionRate || 0}%\n\n`;
    
    csv += 'Lead Sources\n';
    csv += 'Source,Count,Percentage\n';
    (report.leadSources || []).forEach(source => {
        csv += `${source.source || 'Unknown'},${source.count || 0},${source.percentage || 0}%\n`;
    });
    
    csv += '\nBusiness Types\n';
    csv += 'Type,Count\n';
    (report.businessTypes || []).forEach(type => {
        csv += `${type.type || 'Unknown'},${type.count || 0}\n`;
    });
    
    return csv;
}

// Download CSV
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
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

