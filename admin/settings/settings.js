/**
 * @fileoverview Settings Feature JavaScript
 * @module admin/settings/settings
 * 
 * Handles:
 * - Loading and saving settings
 * - Resetting settings to defaults
 */

// Load Settings
async function loadSettings() {
    try {
        // Try to load from API
        const res = await fetch('/api/settings');
        const data = await res.json();
        
        if (data.success && data.settings) {
            const settings = data.settings;
            const nameInput = document.getElementById('businessName');
            const emailInput = document.getElementById('businessEmail');
            const phoneInput = document.getElementById('businessPhone');
            const addressInput = document.getElementById('businessAddress');
            
            if (nameInput) nameInput.value = settings.businessName || '';
            if (emailInput) emailInput.value = settings.businessEmail || '';
            if (phoneInput) phoneInput.value = settings.businessPhone || '';
            if (addressInput) addressInput.value = settings.businessAddress || '';
        } else {
            // Fallback to localStorage
            const stored = localStorage.getItem('tnr_settings');
            if (stored) {
                const settings = JSON.parse(stored);
                const nameInput = document.getElementById('businessName');
                const emailInput = document.getElementById('businessEmail');
                const phoneInput = document.getElementById('businessPhone');
                const addressInput = document.getElementById('businessAddress');
                
                if (nameInput) nameInput.value = settings.businessName || '';
                if (emailInput) emailInput.value = settings.businessEmail || '';
                if (phoneInput) phoneInput.value = settings.businessPhone || '';
                if (addressInput) addressInput.value = settings.businessAddress || '';
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem('tnr_settings');
        if (stored) {
            const settings = JSON.parse(stored);
            const nameInput = document.getElementById('businessName');
            const emailInput = document.getElementById('businessEmail');
            const phoneInput = document.getElementById('businessPhone');
            const addressInput = document.getElementById('businessAddress');
            
            if (nameInput) nameInput.value = settings.businessName || '';
            if (emailInput) emailInput.value = settings.businessEmail || '';
            if (phoneInput) phoneInput.value = settings.businessPhone || '';
            if (addressInput) addressInput.value = settings.businessAddress || '';
        }
    }
}

// Save Settings
async function saveSettings() {
    const businessName = document.getElementById('businessName')?.value.trim();
    const businessEmail = document.getElementById('businessEmail')?.value.trim();
    const businessPhone = document.getElementById('businessPhone')?.value.trim();
    const businessAddress = document.getElementById('businessAddress')?.value.trim();
    
    if (!businessName || !businessEmail) {
        alert('Please fill in business name and email.');
        return;
    }
    
    const settings = {
        businessName,
        businessEmail,
        businessPhone,
        businessAddress
    };
    
    try {
        // Try to save to API
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        const data = await res.json();
        
        if (data.success) {
            // Also save to localStorage as backup
            localStorage.setItem('tnr_settings', JSON.stringify(settings));
            alert('✅ Settings saved successfully!');
        } else {
            // Fallback to localStorage
            localStorage.setItem('tnr_settings', JSON.stringify(settings));
            alert('✅ Settings saved to local storage!');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        // Fallback to localStorage
        localStorage.setItem('tnr_settings', JSON.stringify(settings));
        alert('✅ Settings saved to local storage!');
    }
}

// Reset Settings
function resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to default?')) {
        return;
    }
    
    const defaultSettings = {
        businessName: 'TNR Business Solutions',
        businessEmail: 'roy.turner@tnrbusinesssolutions.com',
        businessPhone: '(412) 499-2987',
        businessAddress: '418 Concord Avenue, Greensburg, PA 15601'
    };
    
    const nameInput = document.getElementById('businessName');
    const emailInput = document.getElementById('businessEmail');
    const phoneInput = document.getElementById('businessPhone');
    const addressInput = document.getElementById('businessAddress');
    
    if (nameInput) nameInput.value = defaultSettings.businessName;
    if (emailInput) emailInput.value = defaultSettings.businessEmail;
    if (phoneInput) phoneInput.value = defaultSettings.businessPhone;
    if (addressInput) addressInput.value = defaultSettings.businessAddress;
    
    localStorage.setItem('tnr_settings', JSON.stringify(defaultSettings));
    alert('✅ Settings have been reset to default values.');
}

// Initialize Settings
function initializeSettings() {
    console.log('⚙️ Initializing Settings page...');
    loadSettings();
}

// Export functions
window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.initializeSettings = initializeSettings;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
});

