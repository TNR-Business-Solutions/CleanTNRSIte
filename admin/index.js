/**
 * @fileoverview Main Admin Dashboard JavaScript
 * @module admin/index
 * 
 * Handles:
 * - Quick stats loading
 * - Dashboard initialization
 */

// Load Quick Stats
async function loadQuickStats() {
    try {
        const res = await fetch('/api/analytics?type=all');
        const data = await res.json();

        if (data.success && data.analytics) {
            const overview = data.analytics.overview || {};
            
            const clientsEl = document.getElementById('statClients');
            const leadsEl = document.getElementById('statLeads');
            const revenueEl = document.getElementById('statRevenue');
            const conversionEl = document.getElementById('statConversion');
            
            if (clientsEl) clientsEl.textContent = overview.totalClients || 0;
            if (leadsEl) leadsEl.textContent = overview.totalLeads || 0;
            if (revenueEl) revenueEl.textContent = formatRevenue(overview.totalRevenue || 0);
            if (conversionEl) conversionEl.textContent = (overview.conversionRate || 0) + '%';
        } else {
            // Fallback to localStorage if API fails
            if (window.tnrCRM && window.tnrCRM.getStats) {
                const stats = window.tnrCRM.getStats();
                const clientsEl = document.getElementById('statClients');
                const leadsEl = document.getElementById('statLeads');
                const revenueEl = document.getElementById('statRevenue');
                const conversionEl = document.getElementById('statConversion');
                
                if (clientsEl) clientsEl.textContent = stats.totalClients || 0;
                if (leadsEl) leadsEl.textContent = stats.newLeads || 0;
                if (revenueEl) revenueEl.textContent = formatRevenue(stats.totalRevenue || 0);
                if (conversionEl) {
                    const rate = stats.totalClients > 0 && stats.newLeads > 0 
                        ? Math.round((stats.totalClients / stats.newLeads) * 100) 
                        : 0;
                    conversionEl.textContent = rate + '%';
                }
            }
        }
    } catch (error) {
        console.error('Error loading quick stats:', error);
        // Fallback to localStorage
        if (window.tnrCRM && window.tnrCRM.getStats) {
            const stats = window.tnrCRM.getStats();
            const clientsEl = document.getElementById('statClients');
            const leadsEl = document.getElementById('statLeads');
            const revenueEl = document.getElementById('statRevenue');
            const conversionEl = document.getElementById('statConversion');
            
            if (clientsEl) clientsEl.textContent = stats.totalClients || 0;
            if (leadsEl) leadsEl.textContent = stats.newLeads || 0;
            if (revenueEl) revenueEl.textContent = formatRevenue(stats.totalRevenue || 0);
            if (conversionEl) {
                const rate = stats.totalClients > 0 && stats.newLeads > 0 
                    ? Math.round((stats.totalClients / stats.newLeads) * 100) 
                    : 0;
                conversionEl.textContent = rate + '%';
            }
        }
    }
}

// Format Revenue
function formatRevenue(amount) {
    if (amount >= 1000000) {
        return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + amount.toFixed(0);
}

// Initialize Dashboard
function initializeDashboard() {
    console.log('🎯 Initializing Admin Dashboard...');
    loadQuickStats();
    
    // Auto-refresh stats every 5 minutes
    setInterval(() => {
        loadQuickStats();
    }, 5 * 60 * 1000);
}

// Export functions
window.loadQuickStats = loadQuickStats;
window.initializeDashboard = initializeDashboard;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

