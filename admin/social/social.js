/**
 * @fileoverview Social Media Feature JavaScript
 * @module admin/social/social
 * 
 * Handles:
 * - Social media token management
 * - Token testing and deletion
 * - Account connection
 * 
 * Dependencies:
 * - admin/shared/utils.js (formatDate, closeModal, etc.)
 */

// Load Social Media Tokens
async function loadSocialTokens() {
    const tokensList = document.getElementById('tokensList');
    if (!tokensList) return;

    tokensList.innerHTML = '<div class="loading-state"><div class="loading-icon">⏳</div><p>Loading tokens...</p></div>';

    try {
        const res = await fetch('/api/social/tokens');
        const data = await res.json();

        if (!data.success || !data.tokens || data.tokens.length === 0) {
            tokensList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔗</div>
                    <p class="empty-state-title"><strong>No connected accounts</strong></p>
                    <p class="empty-state-description">Connect your social media accounts to get started with automated posting.</p>
                    <div class="empty-state-actions">
                        <a href="/api/auth/meta" class="btn btn-facebook">📘 Connect Facebook/Instagram</a>
                        <a href="/api/auth/linkedin" class="btn btn-linkedin">💼 Connect LinkedIn</a>
                        <a href="/api/auth/twitter" class="btn btn-twitter">🐦 Connect X (Twitter)</a>
                    </div>
                </div>
            `;
            return;
        }

        tokensList.innerHTML = data.tokens.map(token => {
            const platformIcon = 
                token.platform === 'facebook' ? '📘' : 
                token.platform === 'instagram' ? '📷' : 
                token.platform === 'linkedin' ? '💼' : 
                token.platform === 'twitter' ? '🐦' : 
                '🔗';
            
            const platformName = token.page_name || token.platform.charAt(0).toUpperCase() + token.platform.slice(1);
            
            let platformDetails = '';
            if (token.platform === 'instagram' && token.instagram_username) {
                platformDetails = `@${token.instagram_username}`;
            } else if (token.platform === 'twitter' && token.page_name) {
                platformDetails = token.page_name.split('@')[1] || token.page_name;
            } else {
                platformDetails = token.page_id || 'Account';
            }
            
            const tokenId = (token.id || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const safePlatformName = (platformName || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            
            return `
                <div class="token-card">
                    <div class="token-card-header">
                        <div class="token-info">
                            <div class="token-platform-header">
                                <span class="token-platform-icon">${platformIcon}</span>
                                <div>
                                    <h4 class="token-platform-name">${platformName}</h4>
                                    <p class="token-platform-details">${platformDetails}</p>
                                </div>
                            </div>
                            ${token.instagram_account_id && token.platform === 'instagram' ? `
                                <div class="token-instagram-id">
                                    <strong>Instagram ID:</strong> ${token.instagram_account_id}
                                </div>
                            ` : ''}
                        </div>
                        <div class="token-actions-buttons">
                            <button class="btn-small" onclick="testToken('${tokenId}', '${token.platform}')" style="background: #28a745; color: white;">🧪 Test</button>
                            <button class="btn-small btn-danger" onclick="deleteToken('${tokenId}', '${safePlatformName}')">🗑️ Delete</button>
                        </div>
                    </div>
                    <div class="token-details-grid">
                        <div class="token-detail-item">
                            <strong>Platform:</strong> ${token.platform}
                        </div>
                        <div class="token-detail-item">
                            <strong>Token Status:</strong> 
                            <span class="${token.has_token ? 'token-status-valid' : 'token-status-invalid'}">
                                ${token.has_token ? '✅ Valid' : '❌ Missing'}
                            </span>
                        </div>
                        <div class="token-detail-item">
                            <strong>Expires:</strong> ${token.expires_at ? new Date(token.expires_at).toLocaleDateString() : 'Never'}
                        </div>
                        <div class="token-detail-item">
                            <strong>Added:</strong> ${token.created_at ? new Date(token.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading tokens:', error);
        tokensList.innerHTML = `
            <div class="error-state">
                <div class="error-state-icon">❌</div>
                <p class="error-state-title"><strong>Error loading tokens</strong></p>
                <p class="error-state-message">${error.message}</p>
                <button class="btn" onclick="loadSocialTokens()" style="margin-top: 1rem;">Try Again</button>
            </div>
        `;
    }
}

// Test Token
async function testToken(tokenId, platform) {
    const button = event?.target;
    if (button) {
        const originalText = button.textContent;
        button.textContent = 'Testing...';
        button.disabled = true;

        try {
            const res = await fetch('/api/social/tokens?action=test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenId, platform })
            });

            const data = await res.json();
            
            if (data.success && data.valid) {
                alert(`✅ Token is valid!\n\n${data.message || 'Connection successful'}`);
            } else {
                alert(`❌ Token is invalid or expired.\n\n${data.error || data.message || 'Please reconnect your account.'}`);
            }
        } catch (error) {
            console.error('Error testing token:', error);
            alert(`❌ Error testing token: ${error.message}`);
        } finally {
            if (button) {
                button.textContent = originalText;
                button.disabled = false;
            }
        }
    }
}

// Delete Token
async function deleteToken(tokenId, tokenName) {
    if (!confirm(`Are you sure you want to delete the token for "${tokenName}"?\n\nYou will need to reconnect to post to this account.`)) {
        return;
    }

    try {
        const res = await fetch(`/api/social/tokens?tokenId=${tokenId}`, {
            method: 'DELETE'
        });

        const data = await res.json();
        
        if (data.success) {
            alert('✅ Token deleted successfully');
            loadSocialTokens(); // Refresh the list
        } else {
            alert(`❌ Error: ${data.error || 'Failed to delete token'}`);
        }
    } catch (error) {
        console.error('Error deleting token:', error);
        alert(`❌ Error deleting token: ${error.message}`);
    }
}

// Connect Social Accounts
function connectSocialAccounts() {
    alert('Social account connection wizard will open. Connect your Facebook, Instagram, LinkedIn, and Twitter accounts for seamless automation.');
}

// Open Scheduler
function openScheduler() {
    alert('Post scheduler will open. Schedule your content across all platforms with optimal timing for maximum engagement.');
}

// Initialize Social Media Page
function initializeSocial() {
    console.log('📱 Initializing Social Media page...');
    loadSocialTokens();
}

// Export functions to global scope
window.loadSocialTokens = loadSocialTokens;
window.testToken = testToken;
window.deleteToken = deleteToken;
window.connectSocialAccounts = connectSocialAccounts;
window.openScheduler = openScheduler;
window.initializeSocial = initializeSocial;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSocial();
});

