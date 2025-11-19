/**
 * @fileoverview Shared Admin Dashboard Utilities
 * @module admin/shared/utils
 * 
 * Common utility functions used across all admin dashboard features
 */

/**
 * Format a date string to a readable format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        return date.toLocaleDateString();
    } catch (e) {
        return dateString;
    }
}

/**
 * Close any open modal
 */
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Show activity timeline for an entity
 * @param {string} entityType - Type of entity ('client', 'lead', 'order')
 * @param {string} entityId - ID of the entity
 * @param {string} entityName - Name of the entity
 */
async function showActivityTimeline(entityType, entityId, entityName) {
    // TODO: Implement activity timeline
    alert(`Activity timeline for ${entityType}: ${entityName} (ID: ${entityId})\n\nThis feature will show all activities related to this ${entityType}.`);
}

/**
 * Initialize CRM system
 */
function initializeCRM() {
    console.log('📊 Initializing CRM...');
    
    // Ensure CRM is available
    if (!window.tnrCRM) {
        if (typeof TNRCRMData !== 'undefined') {
            window.tnrCRM = new TNRCRMData();
        } else {
            console.error('❌ TNRCRMData not available. Make sure crm-data.js is loaded.');
            return;
        }
    }
    
    // Load data from storage
    if (window.tnrCRM.loadFromStorage) {
        window.tnrCRM.loadFromStorage();
    }
    
    console.log('✅ CRM initialized');
}

/**
 * Update client statistics
 */
function updateClientStats() {
    if (!window.tnrCRM || !window.tnrCRM.getStats) {
        return;
    }
    
    try {
        const stats = window.tnrCRM.getStats();
        
        const totalClientsEl = document.getElementById('totalClients');
        const activeClientsEl = document.getElementById('activeClients');
        const newLeadsEl = document.getElementById('newLeads');
        const totalOrdersEl = document.getElementById('totalOrders');
        const totalRevenueEl = document.getElementById('totalRevenue');
        
        if (totalClientsEl) totalClientsEl.textContent = stats.totalClients || 0;
        if (activeClientsEl) activeClientsEl.textContent = stats.activeClients || 0;
        if (newLeadsEl) newLeadsEl.textContent = stats.newLeads || 0;
        if (totalOrdersEl) totalOrdersEl.textContent = stats.totalOrders || 0;
        if (totalRevenueEl) totalRevenueEl.textContent = '$' + (stats.totalRevenue || 0).toLocaleString();
    } catch (e) {
        console.error('Error updating client stats:', e);
    }
}

// Export functions to global scope for use in HTML
window.formatDate = formatDate;
window.closeModal = closeModal;
window.showActivityTimeline = showActivityTimeline;
window.initializeCRM = initializeCRM;
window.updateClientStats = updateClientStats;

