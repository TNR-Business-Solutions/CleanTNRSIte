/**
 * @fileoverview Email Campaigns Feature JavaScript
 * @module admin/campaigns/campaigns
 * 
 * Handles:
 * - Campaign creation and sending
 * - Audience selection and filtering
 * - Campaign preview and validation
 * 
 * Dependencies:
 * - admin/shared/utils.js (formatDate, closeModal, etc.)
 */

// Preview Campaign Audience
async function previewCampaignAudience() {
    const audienceType = document.getElementById('campaignAudienceType')?.value;
    if (!audienceType) {
        alert('Please select an audience type');
        return;
    }
    
    const params = new URLSearchParams();
    params.set('type', audienceType);
    
    const q = document.getElementById('campaignFilterQ')?.value.trim() || '';
    const status = document.getElementById('campaignFilterStatus')?.value.trim() || '';
    const businessType = document.getElementById('campaignFilterBusinessType')?.value.trim() || '';
    const source = document.getElementById('campaignFilterSource')?.value.trim() || '';
    const interest = document.getElementById('campaignFilterInterest')?.value.trim() || '';
    
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (businessType) params.set('businessType', businessType);
    if (source) params.set('source', source);
    if (interest) params.set('interest', interest);
    
    try {
        const res = await fetch('/api/campaigns/audience?' + params.toString());
        const data = await res.json();
        if (data.success) {
            const countDiv = document.getElementById('campaignAudienceCount');
            const countValue = document.getElementById('campaignAudienceCountValue');
            if (countDiv) countDiv.style.display = 'block';
            if (countValue) countValue.textContent = data.count || 0;
        } else {
            alert('Error: ' + (data.error || 'Failed to get audience count'));
        }
    } catch (e) {
        console.error('Error previewing audience:', e);
        alert('Error: ' + e.message);
    }
}

// Send Campaign
async function sendCampaign() {
    const subject = document.getElementById('campaignSubject')?.value.trim();
    const htmlContent = document.getElementById('campaignHtml')?.value.trim();
    const textContent = document.getElementById('campaignText')?.value.trim();
    const audienceType = document.getElementById('campaignAudienceType')?.value;
    
    if (!subject || !htmlContent) {
        alert('Please fill in subject and HTML content');
        return;
    }
    
    if (!audienceType) {
        alert('Please select an audience type');
        return;
    }
    
    const audienceFilters = {};
    const q = document.getElementById('campaignFilterQ')?.value.trim() || '';
    const status = document.getElementById('campaignFilterStatus')?.value.trim() || '';
    const businessType = document.getElementById('campaignFilterBusinessType')?.value.trim() || '';
    const source = document.getElementById('campaignFilterSource')?.value.trim() || '';
    const interest = document.getElementById('campaignFilterInterest')?.value.trim() || '';
    
    if (q) audienceFilters.q = q;
    if (status) audienceFilters.status = status;
    if (businessType) audienceFilters.businessType = businessType;
    if (source) audienceFilters.source = source;
    if (interest) audienceFilters.interest = interest;
    
    if (!confirm(`Are you sure you want to send this campaign? This will send emails using your SMTP provider.`)) {
        return;
    }
    
    const resultDiv = document.getElementById('campaignResult');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.className = 'campaign-result loading';
        resultDiv.innerHTML = '<div><strong>⏳ Sending campaign...</strong><br>Please wait while we send your emails.</div>';
    }
    
    try {
        const res = await fetch('/api/campaigns/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject,
                htmlContent,
                textContent: textContent || null,
                audienceFilters: Object.keys(audienceFilters).length > 0 ? audienceFilters : null,
                audienceType,
            })
        });
        
        const data = await res.json();
        if (resultDiv) {
            if (data.success) {
                resultDiv.className = 'campaign-result success';
                resultDiv.innerHTML = `
                    <div>
                        <strong>✅ Campaign Sent Successfully!</strong><br>
                        Sent: ${data.sent || 0} emails<br>
                        Failed: ${data.failed || 0} emails<br>
                        Total: ${data.total || 0} recipients
                        ${data.errors && data.errors.length > 0 ? '<br><small>Errors: ' + data.errors.length + ' (check console for details)</small>' : ''}
                    </div>
                `;
            } else {
                resultDiv.className = 'campaign-result error';
                resultDiv.innerHTML = `
                    <div>
                        <strong>❌ Campaign Failed:</strong> ${data.error || 'Unknown error'}
                    </div>
                `;
            }
        }
    } catch (e) {
        console.error('Error sending campaign:', e);
        if (resultDiv) {
            resultDiv.className = 'campaign-result error';
            resultDiv.innerHTML = `
                <div>
                    <strong>❌ Error:</strong> ${e.message}
                </div>
            `;
        }
    }
}

// Clear Campaign Form
function clearCampaignForm() {
    const subject = document.getElementById('campaignSubject');
    const htmlContent = document.getElementById('campaignHtml');
    const textContent = document.getElementById('campaignText');
    const filterQ = document.getElementById('campaignFilterQ');
    const filterStatus = document.getElementById('campaignFilterStatus');
    const filterBusinessType = document.getElementById('campaignFilterBusinessType');
    const filterSource = document.getElementById('campaignFilterSource');
    const filterInterest = document.getElementById('campaignFilterInterest');
    const audienceCount = document.getElementById('campaignAudienceCount');
    const resultDiv = document.getElementById('campaignResult');
    
    if (subject) subject.value = '';
    if (htmlContent) htmlContent.value = '';
    if (textContent) textContent.value = '';
    if (filterQ) filterQ.value = '';
    if (filterStatus) filterStatus.value = '';
    if (filterBusinessType) filterBusinessType.value = '';
    if (filterSource) filterSource.value = '';
    if (filterInterest) filterInterest.value = '';
    if (audienceCount) audienceCount.style.display = 'none';
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.className = '';
        resultDiv.innerHTML = '';
    }
}

// Toggle Interest Filter (only show for leads)
function toggleInterestFilter() {
    const audienceType = document.getElementById('campaignAudienceType')?.value;
    const interestContainer = document.getElementById('campaignFilterInterestContainer');
    
    if (interestContainer) {
        if (audienceType === 'leads') {
            interestContainer.style.display = 'block';
        } else {
            interestContainer.style.display = 'none';
            const interestInput = document.getElementById('campaignFilterInterest');
            if (interestInput) interestInput.value = '';
        }
    }
}

// Initialize Campaigns Page
function initializeCampaigns() {
    console.log('📧 Initializing Campaigns page...');
    
    // Set up audience type change listener
    const audienceTypeSelect = document.getElementById('campaignAudienceType');
    if (audienceTypeSelect) {
        audienceTypeSelect.addEventListener('change', toggleInterestFilter);
        // Initial toggle
        toggleInterestFilter();
    }
    
    // Add form validation
    const form = document.querySelector('.campaign-form-container');
    if (form) {
        const subjectInput = document.getElementById('campaignSubject');
        const htmlInput = document.getElementById('campaignHtml');
        
        if (subjectInput) {
            subjectInput.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.setCustomValidity('Subject is required');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
        
        if (htmlInput) {
            htmlInput.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.setCustomValidity('HTML content is required');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
    }
}

// Export functions to global scope
window.previewCampaignAudience = previewCampaignAudience;
window.sendCampaign = sendCampaign;
window.clearCampaignForm = clearCampaignForm;
window.toggleInterestFilter = toggleInterestFilter;
window.initializeCampaigns = initializeCampaigns;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCampaigns();
});

