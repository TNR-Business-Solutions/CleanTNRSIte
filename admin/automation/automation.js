/**
 * @fileoverview Automation Workflows Feature JavaScript
 * @module admin/automation/automation
 * 
 * Handles:
 * - Workflow creation and management
 * - Trigger configuration
 * - Action configuration
 * - Workflow activation/deactivation
 */

let workflowActions = [];
let editingWorkflowId = null;

// Load Workflows
async function loadWorkflows() {
    const workflowsList = document.getElementById('workflowsList');
    if (!workflowsList) return;

    workflowsList.innerHTML = '<div class="loading-state"><div class="loading-icon">🤖</div><p>Loading workflows...</p></div>';

    try {
        const res = await fetch('/api/workflows');
        const data = await res.json();

        if (!data.success || !data.workflows || data.workflows.length === 0) {
            workflowsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🤖</div>
                    <p><strong>No workflows created yet</strong></p>
                    <p style="margin-bottom: 1.5rem;">Create your first automation workflow to get started.</p>
                    <button class="btn btn-primary" onclick="showCreateWorkflowModal()">Create Workflow</button>
                </div>
            `;
            return;
        }

        workflowsList.innerHTML = data.workflows.map(workflow => {
            const workflowId = (workflow.id || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const workflowName = (workflow.workflowName || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            
            return `
                <div class="workflow-card">
                    <div class="workflow-card-header">
                        <div class="workflow-info">
                            <div class="workflow-title-row">
                                <span class="workflow-icon">🤖</span>
                                <div>
                                    <h4 class="workflow-name">${workflow.workflowName || 'Unnamed'}</h4>
                                    <p class="workflow-type">Type: ${workflow.workflowType || 'Custom'}</p>
                                </div>
                            </div>
                            <div class="workflow-details">
                                <strong>Trigger:</strong> ${formatTrigger(workflow.trigger)}<br/>
                                <strong>Actions:</strong> ${workflow.actions?.length || 0} action(s)
                            </div>
                        </div>
                        <div class="workflow-actions">
                            <button class="btn-small" onclick="toggleWorkflow('${workflowId}', ${!workflow.isActive})" style="background: ${workflow.isActive ? '#28a745' : '#6c757d'}; color: white;">
                                ${workflow.isActive ? '✅ Active' : '⏸️ Inactive'}
                            </button>
                            <button class="btn-small" onclick="editWorkflow('${workflowId}')" style="background: #007bff; color: white;">✏️ Edit</button>
                            <button class="btn-small btn-danger" onclick="deleteWorkflow('${workflowId}', '${workflowName}')">🗑️ Delete</button>
                        </div>
                    </div>
                    <div class="workflow-stats">
                        <div><strong>Status:</strong> <span style="color: ${workflow.isActive ? '#28a745' : '#dc3545'}">${workflow.isActive ? '✅ Active' : '⏸️ Inactive'}</span></div>
                        <div><strong>Last Run:</strong> ${workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : 'Never'}</div>
                        <div><strong>Next Run:</strong> ${workflow.nextRun ? new Date(workflow.nextRun).toLocaleString() : 'N/A'}</div>
                        <div><strong>Created:</strong> ${workflow.createdAt ? new Date(workflow.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading workflows:', error);
        workflowsList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <p><strong>Error loading workflows</strong></p>
                <p style="font-size: 0.875rem;">${error.message}</p>
                <button class="btn btn-primary" onclick="loadWorkflows()" style="margin-top: 1rem;">Try Again</button>
            </div>
        `;
    }
}

// Format Trigger
function formatTrigger(trigger) {
    if (!trigger || !trigger.type) return 'Not configured';
    const types = {
        'new_lead': 'New Lead Created',
        'lead_status_change': 'Lead Status Changed',
        'client_status_change': 'Client Status Changed',
        'date_based': 'Date-Based'
    };
    return types[trigger.type] || trigger.type;
}

// Show Create Workflow Modal
function showCreateWorkflowModal() {
    editingWorkflowId = null;
    workflowActions = [];
    const modal = document.getElementById('workflowModal');
    const nameInput = document.getElementById('workflowName');
    const triggerSelect = document.getElementById('workflowTriggerType');
    const triggerFields = document.getElementById('triggerFields');
    const actionsList = document.getElementById('workflowActions');
    
    if (modal) modal.classList.add('active');
    if (nameInput) nameInput.value = '';
    if (triggerSelect) triggerSelect.value = '';
    if (triggerFields) triggerFields.style.display = 'none';
    if (actionsList) actionsList.innerHTML = '';
}

// Close Workflow Modal
function closeWorkflowModal() {
    const modal = document.getElementById('workflowModal');
    if (modal) modal.classList.remove('active');
}

// Update Trigger Fields
function updateTriggerFields() {
    const triggerType = document.getElementById('workflowTriggerType')?.value;
    const triggerFields = document.getElementById('triggerFields');
    
    if (!triggerFields) return;
    
    if (!triggerType) {
        triggerFields.style.display = 'none';
        return;
    }
    
    triggerFields.style.display = 'block';
    
    switch(triggerType) {
        case 'lead_status_change':
            triggerFields.innerHTML = `
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">From Status</label>
                <select id="triggerFromStatus" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="">Any Status</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                </select>
                <label style="display: block; margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 600;">To Status</label>
                <select id="triggerToStatus" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="">Any Status</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                </select>
            `;
            break;
        case 'date_based':
            triggerFields.innerHTML = `
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Trigger After</label>
                <input type="number" id="triggerDays" placeholder="Number of days" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" />
                <label style="display: block; margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 600;">Based On</label>
                <select id="triggerDateField" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="createdAt">Lead/Client Created Date</option>
                    <option value="lastContact">Last Contact Date</option>
                </select>
            `;
            break;
        default:
            triggerFields.innerHTML = '<p style="color: #666; font-size: 0.875rem;">This trigger will fire automatically when the event occurs.</p>';
    }
}

// Add Workflow Action
function addWorkflowAction() {
    const actionId = `action-${Date.now()}`;
    workflowActions.push({ id: actionId, type: '', config: {} });
    renderActions();
}

// Remove Workflow Action
function removeWorkflowAction(actionId) {
    workflowActions = workflowActions.filter(a => a.id !== actionId);
    renderActions();
}

// Render Actions
function renderActions() {
    const container = document.getElementById('workflowActions');
    if (!container) return;
    
    if (workflowActions.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">No actions added yet. Click "+ Add Action" to add one.</p>';
        return;
    }
    
    container.innerHTML = workflowActions.map((action, index) => {
        const actionId = (action.id || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        return `
            <div class="action-item">
                <div class="action-item-header">
                    <strong>Action ${index + 1}</strong>
                    <button onclick="removeWorkflowAction('${actionId}')" style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">Remove</button>
                </div>
                <select onchange="updateActionConfig('${actionId}', this.value)" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="">Select Action Type...</option>
                    <option value="send_email" ${action.type === 'send_email' ? 'selected' : ''}>Send Email</option>
                    <option value="update_status" ${action.type === 'update_status' ? 'selected' : ''}>Update Status</option>
                    <option value="add_note" ${action.type === 'add_note' ? 'selected' : ''}>Add Note</option>
                </select>
                <div id="actionConfig-${actionId}" class="action-config">
                    ${renderActionConfig(action)}
                </div>
            </div>
        `;
    }).join('');
}

// Update Action Config
function updateActionConfig(actionId, actionType) {
    const action = workflowActions.find(a => a.id === actionId);
    if (action) {
        action.type = actionType;
        action.config = {};
        renderActions();
    }
}

// Render Action Config
function renderActionConfig(action) {
    if (!action.type) return '';
    
    const actionId = (action.id || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    
    switch(action.type) {
        case 'send_email':
            return `
                <label style="display: block; margin-top: 0.75rem; margin-bottom: 0.5rem; font-size: 0.875rem;">Email Subject</label>
                <input type="text" id="emailSubject-${actionId}" placeholder="Welcome Email" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem;" />
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem;">Email Content</label>
                <textarea id="emailContent-${actionId}" rows="4" placeholder="Use {{name}} and {{company}} for personalization" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            `;
        case 'update_status':
            return `
                <label style="display: block; margin-top: 0.75rem; margin-bottom: 0.5rem; font-size: 0.875rem;">New Status</label>
                <select id="newStatus-${actionId}" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Active">Active</option>
                </select>
            `;
        case 'add_note':
            return `
                <label style="display: block; margin-top: 0.75rem; margin-bottom: 0.5rem; font-size: 0.875rem;">Note Content</label>
                <textarea id="noteContent-${actionId}" rows="3" placeholder="Automated note from workflow" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            `;
        default:
            return '';
    }
}

// Save Workflow
async function saveWorkflow() {
    const workflowName = document.getElementById('workflowName')?.value.trim();
    const triggerType = document.getElementById('workflowTriggerType')?.value;
    
    if (!workflowName || !triggerType) {
        alert('Please fill in workflow name and select a trigger type.');
        return;
    }
    
    if (workflowActions.length === 0) {
        alert('Please add at least one action to the workflow.');
        return;
    }
    
    // Build trigger object
    const trigger = { type: triggerType };
    if (triggerType === 'lead_status_change') {
        trigger.fromStatus = document.getElementById('triggerFromStatus')?.value || '';
        trigger.toStatus = document.getElementById('triggerToStatus')?.value || '';
    } else if (triggerType === 'date_based') {
        trigger.days = parseInt(document.getElementById('triggerDays')?.value || 0);
        trigger.dateField = document.getElementById('triggerDateField')?.value || 'createdAt';
    }
    
    // Build actions array with configs
    const actions = workflowActions.map(action => {
        const config = { ...action.config };
        const actionId = action.id;
        if (action.type === 'send_email') {
            config.subject = document.getElementById(`emailSubject-${actionId}`)?.value || '';
            config.content = document.getElementById(`emailContent-${actionId}`)?.value || '';
        } else if (action.type === 'update_status') {
            config.status = document.getElementById(`newStatus-${actionId}`)?.value || '';
        } else if (action.type === 'add_note') {
            config.note = document.getElementById(`noteContent-${actionId}`)?.value || '';
        }
        return { type: action.type, config };
    });
    
    const workflowData = {
        id: editingWorkflowId,
        workflowName,
        workflowType: triggerType,
        trigger,
        actions,
        isActive: true
    };
    
    try {
        const method = editingWorkflowId ? 'PUT' : 'POST';
        const res = await fetch('/api/workflows', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workflowData)
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert('✅ Workflow saved successfully!');
            closeWorkflowModal();
            loadWorkflows();
        } else {
            alert(`❌ Error: ${data.error || 'Failed to save workflow'}`);
        }
    } catch (error) {
        console.error('Error saving workflow:', error);
        alert(`❌ Error saving workflow: ${error.message}`);
    }
}

// Toggle Workflow
async function toggleWorkflow(workflowId, isActive) {
    try {
        const res = await fetch('/api/workflows', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflowId, isActive })
        });
        
        const data = await res.json();
        
        if (data.success) {
            loadWorkflows();
        } else {
            alert(`❌ Error: ${data.error || 'Failed to update workflow'}`);
        }
    } catch (error) {
        console.error('Error toggling workflow:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Delete Workflow
async function deleteWorkflow(workflowId, workflowName) {
    if (!confirm(`Are you sure you want to delete the workflow "${workflowName}"?`)) {
        return;
    }
    
    try {
        const res = await fetch(`/api/workflows?workflowId=${workflowId}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert('✅ Workflow deleted successfully');
            loadWorkflows();
        } else {
            alert(`❌ Error: ${data.error || 'Failed to delete workflow'}`);
        }
    } catch (error) {
        console.error('Error deleting workflow:', error);
        alert(`❌ Error deleting workflow: ${error.message}`);
    }
}

// Edit Workflow
async function editWorkflow(workflowId) {
    try {
        const res = await fetch('/api/workflows');
        const data = await res.json();
        
        if (!data.success) {
            alert('Error loading workflow');
            return;
        }
        
        const workflow = data.workflows.find(w => w.id === workflowId);
        if (!workflow) {
            alert('Workflow not found');
            return;
        }
        
        editingWorkflowId = workflowId;
        workflowActions = (workflow.actions || []).map((action, index) => ({
            id: `action-${Date.now()}-${index}`,
            type: action.type,
            config: action.config || {}
        }));
        
        const nameInput = document.getElementById('workflowName');
        const triggerSelect = document.getElementById('workflowTriggerType');
        const modal = document.getElementById('workflowModal');
        
        if (nameInput) nameInput.value = workflow.workflowName || '';
        if (triggerSelect) {
            triggerSelect.value = workflow.trigger?.type || '';
            updateTriggerFields();
        }
        if (modal) modal.classList.add('active');
        
        renderActions();
        
    } catch (error) {
        console.error('Error editing workflow:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Initialize Automation
function initializeAutomation() {
    console.log('🤖 Initializing Automation page...');
    loadWorkflows();
}

// Export functions
window.loadWorkflows = loadWorkflows;
window.showCreateWorkflowModal = showCreateWorkflowModal;
window.closeWorkflowModal = closeWorkflowModal;
window.updateTriggerFields = updateTriggerFields;
window.addWorkflowAction = addWorkflowAction;
window.removeWorkflowAction = removeWorkflowAction;
window.updateActionConfig = updateActionConfig;
window.saveWorkflow = saveWorkflow;
window.toggleWorkflow = toggleWorkflow;
window.deleteWorkflow = deleteWorkflow;
window.editWorkflow = editWorkflow;
window.initializeAutomation = initializeAutomation;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAutomation();
});

