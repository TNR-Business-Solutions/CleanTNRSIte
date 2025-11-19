/**
 * @fileoverview CRM Feature JavaScript
 * @module admin/crm/crm
 * 
 * Handles:
 * - Client management (CRUD operations)
 * - Lead management (view, convert, delete)
 * - Order management (CRUD operations)
 * - CSV import functionality
 * - Statistics updates
 * 
 * Dependencies:
 * - crm-data.js (TNRCRMData class)
 * - admin/shared/utils.js (formatDate, closeModal, etc.)
 */

// CRM Tab Switching
function showCrmTab(tabName) {
    const sections = document.querySelectorAll('.crm-content');
    sections.forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(tabName);
    if (target) {
        target.classList.add('active');
        console.log('✅ Switched to CRM tab:', tabName);
    }
    
    // Update tab buttons
    document.querySelectorAll('.crm-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Load data for the selected tab
    if (tabName === 'clients') {
        console.log('📋 Loading clients...');
        loadClients();
    } else if (tabName === 'leads') {
        loadLeads();
    } else if (tabName === 'orders') {
        loadOrders();
    }
}

// Initialize CRM
function initializeCRM() {
    console.log('📊 Initializing CRM...');
    
    // Ensure clients section is visible and active
    const clientsSection = document.getElementById('clients');
    if (clientsSection) {
        clientsSection.classList.add('active');
        console.log('✅ Clients section marked as active');
    }
    
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
    
    // Update statistics
    updateClientStats();
    
    // Load all CRM sections
    console.log('📋 Loading CRM data...');
    loadClients();
    loadLeads();
    loadOrders();
    
    // Set up periodic refresh every 5 seconds to catch new leads
    setInterval(function() {
        updateClientStats();
        loadLeads(); // Refresh leads display
    }, 5000);
}

// Load Clients
async function loadClients() {
    const clientsList = document.getElementById('clientsList');
    if (!clientsList) return;
    
    clientsList.innerHTML = '<div class="no-data">Loading clients...</div>';

    const params = new URLSearchParams();
    const q = (document.getElementById('clientsFilterQ')?.value || '').trim();
    const status = document.getElementById('clientsFilterStatus')?.value || '';
    const businessType = (document.getElementById('clientsFilterBusinessType')?.value || '').trim();
    const source = (document.getElementById('clientsFilterSource')?.value || '').trim();
    const sort = document.getElementById('clientsSort')?.value || 'createdAt';
    const order = document.getElementById('clientsOrder')?.value || 'desc';
    
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (businessType) params.set('businessType', businessType);
    if (source) params.set('source', source);
    params.set('sort', sort);
    params.set('order', order);

    let clients = [];
    try {
        const res = await fetch('/api/crm/clients?' + params.toString());
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
            clients = data.data || [];
            console.log('✅ Loaded', clients.length, 'clients');
        } else {
            console.error('❌ API error:', data.error);
            clientsList.innerHTML = `<div class="no-data">Error loading clients: ${data.error || 'Unknown error'}</div>`;
            return;
        }
    } catch (e) {
        console.error('❌ Error loading clients:', e);
        clientsList.innerHTML = `<div class="no-data">Error loading clients: ${e.message}</div>`;
        return;
    }

    if (!clients || clients.length === 0) {
        clientsList.innerHTML = '<div class="no-data">No clients found. Add your first client to get started!</div>';
        return;
    }

    console.log('📋 Rendering', clients.length, 'clients');
    try {
        clientsList.innerHTML = clients.map((client, index) => {
            // Parse services - handle both JSON string and array
            let services = [];
            try {
                if (typeof client.services === 'string') {
                    if (client.services.trim().startsWith('[') || client.services.trim().startsWith('{')) {
                        services = JSON.parse(client.services || '[]');
                    } else {
                        services = client.services.split(',').map(s => s.trim()).filter(s => s);
                    }
                } else if (Array.isArray(client.services)) {
                    services = client.services;
                }
            } catch (e) {
                services = client.services ? String(client.services).split(',').map(s => s.trim()).filter(s => s) : [];
            }
            
            const servicesDisplay = services.length > 0 ? services.join(', ') : 'No services listed';
            const clientName = (client.name || 'Unknown').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const clientId = (client.id || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            
            return `
            <div class="client-item">
                <div class="client-info">
                    <h4>${client.name || 'Unknown'}</h4>
                    <p>${client.industry || ''} | ${client.email ? `<a href="mailto:${client.email}">${client.email}</a>` : 'No email'} | ${client.phone ? `<a href="tel:${client.phone}">${client.phone}</a>` : 'No phone'}</p>
                    <p>Last Contact: ${formatDate(client.lastContact || client.lastcontact || '')} | Source: ${client.source || 'Unknown'}</p>
                    <p>Services: ${servicesDisplay}</p>
                    ${client.notes ? `<p style="color: rgba(255,255,255,0.6); font-size: 0.9em;">Notes: ${client.notes}</p>` : ''}
                </div>
                <div class="client-actions">
                    <div class="client-status status-${(client.status||'Active').toLowerCase()}">${client.status || 'Active'}</div>
                    <button class="btn-small" onclick="showActivityTimeline('client', '${clientId}', '${clientName}')">📋 Timeline</button>
                    <button class="btn-small" onclick="editClient('${clientId}')">Edit</button>
                    <button class="btn-small btn-danger" onclick="deleteClient('${clientId}')">Delete</button>
                </div>
            </div>
            `;
        }).join('');
        console.log('✅ Clients HTML rendered successfully');
    } catch (error) {
        console.error('❌ Error rendering clients:', error);
        clientsList.innerHTML = `<div class="no-data" style="color: red;">Error displaying clients: ${error.message}</div>`;
    }
}

// Load Leads
async function loadLeads() {
    const leadsList = document.getElementById('leadsList');
    if (!leadsList) return;
    
    leadsList.innerHTML = '<div class="no-data">Loading leads...</div>';

    const params = new URLSearchParams();
    const q = (document.getElementById('leadsFilterQ')?.value || '').trim();
    const status = document.getElementById('leadsFilterStatus')?.value || '';
    const businessType = (document.getElementById('leadsFilterBusinessType')?.value || '').trim();
    const source = (document.getElementById('leadsFilterSource')?.value || '').trim();
    const interest = (document.getElementById('leadsFilterInterest')?.value || '').trim();
    const sort = document.getElementById('leadsSort')?.value || 'createdAt';
    const order = document.getElementById('leadsOrder')?.value || 'desc';
    
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (businessType) params.set('businessType', businessType);
    if (source) params.set('source', source);
    if (interest) params.set('interest', interest);
    params.set('sort', sort);
    params.set('order', order);

    let leads = [];
    try {
        const res = await fetch('/api/crm/leads?' + params.toString());
        const data = await res.json();
        if (data.success) leads = data.data || [];
    } catch (e) {
        console.error('Error loading leads:', e);
    }

    if (!leads || leads.length === 0) {
        leadsList.innerHTML = '<div class="no-data">No leads found. Form submissions will appear here.</div>';
        return;
    }

    leadsList.innerHTML = leads.map(lead => {
        // Build comprehensive details display
        const details = [];
        
        // Basic info
        if (lead.company) details.push(`<strong>Company:</strong> ${lead.company}`);
        if (lead.industry) details.push(`<strong>Industry:</strong> ${lead.industry}`);
        if (lead.website) details.push(`<strong>Website:</strong> ${lead.website}`);
        if (lead.budget) details.push(`<strong>Budget:</strong> ${lead.budget}`);
        if (lead.timeline) details.push(`<strong>Timeline:</strong> ${lead.timeline}`);
        
        // Services
        const servicesText = Array.isArray(lead.services) ? lead.services.join(', ') : lead.services || 'Not specified';
        
        return `
        <div class="client-item" style="color: black; background: rgba(255,255,255,0.95);">
            <div class="client-info" style="color: black;">
                <h4 style="color: var(--tnr-navy);">${lead.name}</h4>
                <p style="color: #333;"><strong>Email:</strong> ${lead.email ? `<a href="mailto:${lead.email}">${lead.email}</a>` : ''} | <strong>Phone:</strong> ${lead.phone ? `<a href="tel:${lead.phone}">${lead.phone}</a>` : ''}</p>
                <p style="color: #333;"><strong>Services:</strong> ${servicesText}</p>
                <p style="color: #333;"><strong>Date:</strong> ${lead.submissionDate || formatDate(lead.submissionDateTime || lead.date)} | <strong>Source:</strong> ${lead.source}</p>
                <p style="color: #333;"><strong>Message:</strong> ${lead.message || 'No message'}</p>
                ${details.length > 0 ? `<div style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; font-size: 0.9em;">
                    <strong>Details:</strong><br>
                    <div>${details.join('<br>')}</div>
                </div>` : ''}
            </div>
            <div class="client-actions">
                <div class="client-status status-lead">${lead.status}</div>
                <button class="btn-small" onclick="showActivityTimeline('lead', '${lead.id}', '${lead.name}')">📋 Timeline</button>
                <button class="btn-small" onclick="convertLeadToClient('${lead.id}')">Convert to Client</button>
                <button class="btn-small btn-danger" onclick="deleteLead('${lead.id}')">Delete</button>
            </div>
        </div>
        `;
    }).join('');
}

// CSV Import Handler
(function attachCsvHandler(){
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachCsvHandler);
        return;
    }
    
    const input = document.getElementById('leadsCsvFile');
    if (!input) return;
    
    input.addEventListener('change', async function(){
        const file = this.files && this.files[0];
        if (!file) return;
        
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        const preview = lines.slice(0, Math.min(lines.length, 6)).join('\n');
        const ok = window.confirm('Preview first rows:\n\n' + preview + '\n\nProceed to import?');
        
        if (!ok) { 
            this.value = ''; 
            return; 
        }
        
        try {
            const res = await fetch('/api/crm/import-leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csv: text })
            });
            const data = await res.json();
            if (data.success) {
                alert('Imported ' + (data.createdCount || 0) + ' leads');
                loadLeads();
            } else {
                alert('Import failed: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Import error: ' + e.message);
        } finally {
            this.value = '';
        }
    });
})();

// Load Orders
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    // Try to load from API first, fallback to localStorage
    fetch('/api/crm/orders')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data) {
                displayOrders(data.data);
            } else {
                // Fallback to localStorage
                const orders = window.tnrCRM?.orders || [];
                displayOrders(orders);
            }
        })
        .catch(e => {
            console.error('Error loading orders from API:', e);
            const orders = window.tnrCRM?.orders || [];
            displayOrders(orders);
        });
}

function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="no-data">No orders found. Click "+ Add New Order" to create your first order.</div>';
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = new Date(a.orderDate || a.date || 0);
        const dateB = new Date(b.orderDate || b.date || 0);
        return dateB - dateA;
    });
    
    ordersList.innerHTML = sortedOrders.map(order => {
        const orderDate = order.orderDate || order.date || 'Not specified';
        const description = order.description || order.specialRequests || 'No description';
        const timeline = order.projectTimeline ? `Timeline: ${order.projectTimeline}` : '';
        const paymentMethod = order.paymentMethod ? `Payment: ${order.paymentMethod}` : '';
        
        return `
        <div class="client-item">
            <div class="client-info">
                <h4>${order.clientName || 'Unknown Client'}</h4>
                <p><strong>Service:</strong> ${order.service || 'Not specified'} ${order.industry ? `| Industry: ${order.industry}` : ''}</p>
                <p><strong>Amount:</strong> $${(order.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} | <strong>Status:</strong> ${order.status || 'Pending'}</p>
                <p><strong>Order Date:</strong> ${formatDate(orderDate)}</p>
                ${timeline ? `<p>${timeline}</p>` : ''}
                ${paymentMethod ? `<p>${paymentMethod}</p>` : ''}
                <p><strong>Description:</strong> ${description}</p>
            </div>
            <div class="client-actions">
                <div class="client-status status-${(order.status || 'pending').toLowerCase().replace(/\s+/g, '-')}">${order.status || 'Pending'}</div>
                <button class="btn-small" onclick="editOrder('${order.id}')">Edit</button>
                <button class="btn-small btn-danger" onclick="deleteOrder('${order.id}')">Delete</button>
            </div>
        </div>
        `;
    }).join('');
}

// Client Modals
function showAddClientModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Client</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="addClientForm">
                    <div class="form-group">
                        <label>Client Name *</label>
                        <input type="text" id="clientName" required>
                    </div>
                    <div class="form-group">
                        <label>Industry *</label>
                        <select id="clientIndustry" required>
                            <option value="">Select Industry</option>
                            <option value="Construction">Construction</option>
                            <option value="Legal Services">Legal Services</option>
                            <option value="E-commerce">E-commerce</option>
                            <option value="Food Service">Food Service</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Real Estate">Real Estate</option>
                            <option value="Retail">Retail</option>
                            <option value="Technology">Technology</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="clientEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" id="clientPhone">
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <textarea id="clientAddress" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Services</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" value="Web Design"> Web Design</label>
                            <label><input type="checkbox" value="SEO Services"> SEO Services</label>
                            <label><input type="checkbox" value="Social Media Management"> Social Media Management</label>
                            <label><input type="checkbox" value="Content Creation"> Content Creation</label>
                            <label><input type="checkbox" value="Paid Advertising"> Paid Advertising</label>
                            <label><input type="checkbox" value="Email Marketing"> Email Marketing</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea id="clientNotes" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Source</label>
                        <select id="clientSource">
                            <option value="Website Form">Website Form</option>
                            <option value="Referral">Referral</option>
                            <option value="Google Ads">Google Ads</option>
                            <option value="Facebook">Facebook</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Cold Call">Cold Call</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="saveNewClient()">Save Client</button>
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveNewClient() {
    const clientData = {
        name: document.getElementById('clientName').value,
        industry: document.getElementById('clientIndustry').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        address: document.getElementById('clientAddress').value,
        services: Array.from(document.querySelectorAll('#addClientForm input[type="checkbox"]:checked')).map(cb => cb.value),
        notes: document.getElementById('clientNotes').value,
        source: document.getElementById('clientSource').value
    };
    
    if (!clientData.name || !clientData.industry || !clientData.email) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Try API first, fallback to localStorage
    fetch('/api/crm/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            closeModal();
            loadClients();
            updateClientStats();
            alert('Client added successfully!');
        } else {
            // Fallback to localStorage
            if (window.tnrCRM && window.tnrCRM.addClient) {
                window.tnrCRM.addClient(clientData);
                closeModal();
                loadClients();
                updateClientStats();
                alert('Client added successfully!');
            } else {
                alert('Error: ' + (data.error || 'Failed to add client'));
            }
        }
    })
    .catch(e => {
        // Fallback to localStorage
        if (window.tnrCRM && window.tnrCRM.addClient) {
            window.tnrCRM.addClient(clientData);
            closeModal();
            loadClients();
            updateClientStats();
            alert('Client added successfully!');
        } else {
            alert('Error: ' + e.message);
        }
    });
}

function editClient(clientId) {
    // Try API first
    fetch(`/api/crm/clients?clientId=${clientId}`)
        .then(res => res.json())
        .then(data => {
            const client = data.success ? data.client : (window.tnrCRM?.getClient?.(clientId));
            if (!client) {
                alert('Client not found.');
                return;
            }
            showEditClientModal(clientId, client);
        })
        .catch(e => {
            const client = window.tnrCRM?.getClient?.(clientId);
            if (client) {
                showEditClientModal(clientId, client);
            } else {
                alert('Client not found.');
            }
        });
}

function showEditClientModal(clientId, client) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Client</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="editClientForm">
                    <div class="form-group">
                        <label>Client Name *</label>
                        <input type="text" id="editClientName" value="${(client.name || '').replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="form-group">
                        <label>Industry *</label>
                        <select id="editClientIndustry" required>
                            <option value="Construction" ${client.industry === 'Construction' ? 'selected' : ''}>Construction</option>
                            <option value="Legal Services" ${client.industry === 'Legal Services' ? 'selected' : ''}>Legal Services</option>
                            <option value="E-commerce" ${client.industry === 'E-commerce' ? 'selected' : ''}>E-commerce</option>
                            <option value="Food Service" ${client.industry === 'Food Service' ? 'selected' : ''}>Food Service</option>
                            <option value="Healthcare" ${client.industry === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                            <option value="Real Estate" ${client.industry === 'Real Estate' ? 'selected' : ''}>Real Estate</option>
                            <option value="Retail" ${client.industry === 'Retail' ? 'selected' : ''}>Retail</option>
                            <option value="Technology" ${client.industry === 'Technology' ? 'selected' : ''}>Technology</option>
                            <option value="Other" ${client.industry === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="editClientEmail" value="${(client.email || '').replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" id="editClientPhone" value="${(client.phone || '').replace(/"/g, '&quot;')}">
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <textarea id="editClientAddress" rows="3">${(client.address || '').replace(/"/g, '&quot;')}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="editClientStatus">
                            <option value="Active" ${client.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Inactive" ${client.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="Prospect" ${client.status === 'Prospect' ? 'selected' : ''}>Prospect</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Services</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" value="Web Design" ${(Array.isArray(client.services) ? client.services : []).includes('Web Design') ? 'checked' : ''}> Web Design</label>
                            <label><input type="checkbox" value="SEO Services" ${(Array.isArray(client.services) ? client.services : []).includes('SEO Services') ? 'checked' : ''}> SEO Services</label>
                            <label><input type="checkbox" value="Social Media Management" ${(Array.isArray(client.services) ? client.services : []).includes('Social Media Management') ? 'checked' : ''}> Social Media Management</label>
                            <label><input type="checkbox" value="Content Creation" ${(Array.isArray(client.services) ? client.services : []).includes('Content Creation') ? 'checked' : ''}> Content Creation</label>
                            <label><input type="checkbox" value="Paid Advertising" ${(Array.isArray(client.services) ? client.services : []).includes('Paid Advertising') ? 'checked' : ''}> Paid Advertising</label>
                            <label><input type="checkbox" value="Email Marketing" ${(Array.isArray(client.services) ? client.services : []).includes('Email Marketing') ? 'checked' : ''}> Email Marketing</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea id="editClientNotes" rows="3">${(client.notes || '').replace(/"/g, '&quot;')}</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="saveEditedClient('${clientId}')">Save Changes</button>
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveEditedClient(clientId) {
    const clientData = {
        name: document.getElementById('editClientName').value,
        industry: document.getElementById('editClientIndustry').value,
        email: document.getElementById('editClientEmail').value,
        phone: document.getElementById('editClientPhone').value,
        address: document.getElementById('editClientAddress').value,
        status: document.getElementById('editClientStatus').value,
        services: Array.from(document.querySelectorAll('#editClientForm input[type="checkbox"]:checked')).map(cb => cb.value),
        notes: document.getElementById('editClientNotes').value,
        lastContact: new Date().toISOString().split('T')[0]
    };
    
    if (!clientData.name || !clientData.industry || !clientData.email) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Try API first
    fetch(`/api/crm/clients?clientId=${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            closeModal();
            loadClients();
            updateClientStats();
            alert('Client updated successfully!');
        } else {
            // Fallback to localStorage
            if (window.tnrCRM && window.tnrCRM.updateClient) {
                window.tnrCRM.updateClient(clientId, clientData);
                closeModal();
                loadClients();
                updateClientStats();
                alert('Client updated successfully!');
            } else {
                alert('Error: ' + (data.error || 'Failed to update client'));
            }
        }
    })
    .catch(e => {
        // Fallback to localStorage
        if (window.tnrCRM && window.tnrCRM.updateClient) {
            window.tnrCRM.updateClient(clientId, clientData);
            closeModal();
            loadClients();
            updateClientStats();
            alert('Client updated successfully!');
        } else {
            alert('Error: ' + e.message);
        }
    });
}

function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client?')) {
        return;
    }
    
    // Try API first
    fetch(`/api/crm/clients?clientId=${clientId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadClients();
            updateClientStats();
            alert('Client deleted successfully!');
        } else {
            // Fallback to localStorage
            if (window.tnrCRM && window.tnrCRM.deleteClient) {
                window.tnrCRM.deleteClient(clientId);
                loadClients();
                updateClientStats();
                alert('Client deleted successfully!');
            } else {
                alert('Error: ' + (data.error || 'Failed to delete client'));
            }
        }
    })
    .catch(e => {
        // Fallback to localStorage
        if (window.tnrCRM && window.tnrCRM.deleteClient) {
            window.tnrCRM.deleteClient(clientId);
            loadClients();
            updateClientStats();
            alert('Client deleted successfully!');
        } else {
            alert('Error: ' + e.message);
        }
    });
}

// Lead Functions
function convertLeadToClient(leadId) {
    fetch(`/api/crm/leads/convert?leadId=${leadId}`, {
        method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadLeads();
            loadClients();
            updateClientStats();
            alert('Lead converted to client successfully!');
        } else {
            // Fallback to localStorage
            if (window.tnrCRM && window.tnrCRM.convertLeadToClient) {
                const client = window.tnrCRM.convertLeadToClient(leadId);
                if (client) {
                    loadLeads();
                    loadClients();
                    updateClientStats();
                    alert('Lead converted to client successfully!');
                } else {
                    alert('Error: Failed to convert lead');
                }
            } else {
                alert('Error: ' + (data.error || 'Failed to convert lead'));
            }
        }
    })
    .catch(e => {
        // Fallback to localStorage
        if (window.tnrCRM && window.tnrCRM.convertLeadToClient) {
            const client = window.tnrCRM.convertLeadToClient(leadId);
            if (client) {
                loadLeads();
                loadClients();
                updateClientStats();
                alert('Lead converted to client successfully!');
            } else {
                alert('Error: Failed to convert lead');
            }
        } else {
            alert('Error: ' + e.message);
        }
    });
}

function deleteLead(leadId) {
    if (!confirm('Are you sure you want to delete this lead?')) {
        return;
    }
    
    fetch(`/api/crm/leads?leadId=${leadId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadLeads();
            updateClientStats();
            alert('Lead deleted successfully!');
        } else {
            // Fallback to localStorage
            if (window.tnrCRM && window.tnrCRM.leads) {
                window.tnrCRM.leads = window.tnrCRM.leads.filter(l => l.id !== leadId);
                if (window.tnrCRM.saveToStorage) {
                    window.tnrCRM.saveToStorage();
                }
                loadLeads();
                updateClientStats();
                alert('Lead deleted successfully!');
            } else {
                alert('Error: ' + (data.error || 'Failed to delete lead'));
            }
        }
    })
    .catch(e => {
        // Fallback to localStorage
        if (window.tnrCRM && window.tnrCRM.leads) {
            window.tnrCRM.leads = window.tnrCRM.leads.filter(l => l.id !== leadId);
            if (window.tnrCRM.saveToStorage) {
                window.tnrCRM.saveToStorage();
            }
            loadLeads();
            updateClientStats();
            alert('Lead deleted successfully!');
        } else {
            alert('Error: ' + e.message);
        }
    });
}

// Order Functions
function showAddOrderModal() {
    // Load clients first
    const clients = window.tnrCRM?.clients || [];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3>Add New Order</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="addOrderForm">
                    <div class="form-group">
                        <label>Client Type *</label>
                        <select id="clientType" required onchange="toggleClientFields()">
                            <option value="">Select Client Type</option>
                            <option value="existing">Existing Client</option>
                            <option value="new">New Client</option>
                        </select>
                    </div>
                    
                    <div id="existingClientSection" style="display: none;">
                        <div class="form-group">
                            <label>Select Client *</label>
                            <select id="existingClientId">
                                <option value="">Choose a client...</option>
                                ${clients.map(client => `<option value="${client.id}" data-name="${(client.name || '').replace(/"/g, '&quot;')}" data-email="${(client.email || '').replace(/"/g, '&quot;')}" data-phone="${(client.phone || '').replace(/"/g, '&quot;')}">${client.name} - ${client.email || 'No email'}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div id="newClientSection" style="display: none;">
                        <h4 style="color: var(--tnr-primary); margin-bottom: 1rem;">New Client Information</h4>
                        <div class="form-group">
                            <label>Client Name *</label>
                            <input type="text" id="newClientName" placeholder="Enter client name">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="newClientEmail" placeholder="client@example.com">
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" id="newClientPhone" placeholder="(412) 555-1234">
                        </div>
                        <div class="form-group">
                            <label>Company</label>
                            <input type="text" id="newClientCompany" placeholder="Company name (if applicable)">
                        </div>
                    </div>
                    
                    <hr style="margin: 1.5rem 0;">
                    
                    <h4 style="color: var(--tnr-primary); margin-bottom: 1rem;">Order Details</h4>
                    
                    <div class="form-group">
                        <label>Service/Product *</label>
                        <select id="orderService" required>
                            <option value="">Select Service</option>
                            <option value="Web Design">Web Design</option>
                            <option value="SEO Services">SEO Services</option>
                            <option value="Social Media Management">Social Media Management</option>
                            <option value="Content Creation">Content Creation</option>
                            <option value="Paid Advertising">Paid Advertising</option>
                            <option value="Email Marketing">Email Marketing</option>
                            <option value="Insurance - Auto">Insurance - Auto</option>
                            <option value="Insurance - Home">Insurance - Home</option>
                            <option value="Insurance - Business">Insurance - Business</option>
                            <option value="Insurance - Life">Insurance - Life</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="customServiceGroup" style="display: none;">
                        <label>Custom Service Name</label>
                        <input type="text" id="customService" placeholder="Enter service name">
                    </div>
                    
                    <div class="form-group">
                        <label>Order Amount *</label>
                        <div style="display: flex; align-items: center;">
                            <span style="margin-right: 0.5rem; font-size: 1.2rem;">$</span>
                            <input type="number" id="orderAmount" step="0.01" min="0" placeholder="0.00" required style="flex: 1;">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Order Status *</label>
                        <select id="orderStatus" required>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Order Description</label>
                        <textarea id="orderDescription" rows="3" placeholder="Describe the order details..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Project Timeline</label>
                        <select id="orderTimeline">
                            <option value="">Select Timeline</option>
                            <option value="ASAP">ASAP</option>
                            <option value="1 Week">1 Week</option>
                            <option value="2 Weeks">2 Weeks</option>
                            <option value="1 Month">1 Month</option>
                            <option value="2-3 Months">2-3 Months</option>
                            <option value="3-6 Months">3-6 Months</option>
                            <option value="Ongoing">Ongoing</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Payment Method</label>
                        <select id="paymentMethod">
                            <option value="">Select Payment Method</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Check">Check</option>
                            <option value="Cash">Cash</option>
                            <option value="Payment Plan">Payment Plan</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Special Requests / Notes</label>
                        <textarea id="specialRequests" rows="3" placeholder="Any special requests..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="saveNewOrder()">Save Order</button>
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add change listener for service dropdown
    setTimeout(() => {
        const serviceSelect = document.getElementById('orderService');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', function() {
                const customGroup = document.getElementById('customServiceGroup');
                if (this.value === 'Other') {
                    customGroup.style.display = 'block';
                    document.getElementById('customService').required = true;
                } else {
                    customGroup.style.display = 'none';
                    document.getElementById('customService').required = false;
                }
            });
        }
    }, 100);
}

function toggleClientFields() {
    const clientType = document.getElementById('clientType')?.value;
    const existingSection = document.getElementById('existingClientSection');
    const newSection = document.getElementById('newClientSection');
    const existingSelect = document.getElementById('existingClientId');
    
    if (clientType === 'existing') {
        if (existingSection) existingSection.style.display = 'block';
        if (newSection) newSection.style.display = 'none';
        if (existingSelect) existingSelect.required = true;
        const newClientName = document.getElementById('newClientName');
        if (newClientName) newClientName.required = false;
    } else if (clientType === 'new') {
        if (existingSection) existingSection.style.display = 'none';
        if (newSection) newSection.style.display = 'block';
        if (existingSelect) existingSelect.required = false;
        const newClientName = document.getElementById('newClientName');
        if (newClientName) newClientName.required = true;
    } else {
        if (existingSection) existingSection.style.display = 'none';
        if (newSection) newSection.style.display = 'none';
        if (existingSelect) existingSelect.required = false;
        const newClientName = document.getElementById('newClientName');
        if (newClientName) newClientName.required = false;
    }
}

function saveNewOrder() {
    const clientType = document.getElementById('clientType')?.value;
    
    if (!clientType) {
        alert('Please select a client type.');
        return;
    }
    
    let clientName = '';
    let clientId = null;
    let clientEmail = '';
    let clientPhone = '';
    
    if (clientType === 'existing') {
        const selectedOption = document.getElementById('existingClientId')?.options[document.getElementById('existingClientId')?.selectedIndex];
        if (!selectedOption || !selectedOption.value) {
            alert('Please select a client.');
            return;
        }
        clientId = selectedOption.value;
        clientName = selectedOption.getAttribute('data-name') || '';
        clientEmail = selectedOption.getAttribute('data-email') || '';
        clientPhone = selectedOption.getAttribute('data-phone') || '';
    } else {
        clientName = document.getElementById('newClientName')?.value.trim();
        if (!clientName) {
            alert('Please enter the client name.');
            return;
        }
        clientEmail = document.getElementById('newClientEmail')?.value.trim() || '';
        clientPhone = document.getElementById('newClientPhone')?.value.trim() || '';
        const clientCompany = document.getElementById('newClientCompany')?.value.trim() || '';
        
        // Create new client first
        if (window.tnrCRM && window.tnrCRM.addClient) {
            const newClient = window.tnrCRM.addClient({
                name: clientName,
                email: clientEmail,
                phone: clientPhone,
                company: clientCompany,
                industry: 'Not specified',
                services: [],
                status: 'Active',
                source: 'Manual Entry'
            });
            clientId = newClient?.id;
        }
    }
    
    const service = document.getElementById('orderService')?.value;
    const customService = document.getElementById('customService')?.value;
    const finalService = (service === 'Other' && customService) ? customService : service;
    
    if (!finalService) {
        alert('Please select or enter a service.');
        return;
    }
    
    const amount = parseFloat(document.getElementById('orderAmount')?.value);
    if (!amount || amount <= 0) {
        alert('Please enter a valid order amount.');
        return;
    }
    
    const orderData = {
        clientName: clientName,
        clientId: clientId,
        service: finalService,
        amount: amount,
        status: document.getElementById('orderStatus')?.value || 'Pending',
        description: document.getElementById('orderDescription')?.value.trim() || '',
        projectTimeline: document.getElementById('orderTimeline')?.value || null,
        paymentMethod: document.getElementById('paymentMethod')?.value || null,
        specialRequests: document.getElementById('specialRequests')?.value.trim() || null,
        customerInfo: {
            name: clientName,
            email: clientEmail,
            phone: clientPhone
        },
        industry: 'General',
        orderDate: new Date().toISOString().split('T')[0]
    };
    
    // Try API first
    fetch('/api/crm/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            closeModal();
            loadOrders();
            updateClientStats();
            alert(`Order added successfully!`);
        } else {
            // Fallback to localStorage
            if (window.tnrCRM && window.tnrCRM.addOrder) {
                window.tnrCRM.addOrder(orderData);
                closeModal();
                loadOrders();
                updateClientStats();
                alert(`Order added successfully!`);
            } else {
                alert('Error: ' + (data.error || 'Failed to add order'));
            }
        }
    })
    .catch(e => {
        // Fallback to localStorage
        if (window.tnrCRM && window.tnrCRM.addOrder) {
            window.tnrCRM.addOrder(orderData);
            closeModal();
            loadOrders();
            updateClientStats();
            alert(`Order added successfully!`);
        } else {
            alert('Error: ' + e.message);
        }
    });
}

function editOrder(orderId) {
    // Try API first
    fetch(`/api/crm/orders?orderId=${orderId}`)
        .then(res => res.json())
        .then(data => {
            const order = data.success ? data.order : ((window.tnrCRM?.orders || []).find(o => o.id === orderId));
            if (!order) {
                alert('Order not found.');
                return;
            }
            showEditOrderModal(orderId, order);
        })
        .catch(e => {
            const order = (window.tnrCRM?.orders || []).find(o => o.id === orderId);
            if (order) {
                showEditOrderModal(orderId, order);
            } else {
                alert('Order not found.');
            }
        });
}

function showEditOrderModal(orderId, order) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3>Edit Order</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="editOrderForm">
                    <div class="form-group">
                        <label>Client</label>
                        <input type="text" value="${(order.clientName || '').replace(/"/g, '&quot;')}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Service/Product *</label>
                        <input type="text" id="editOrderService" value="${(order.service || '').replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="form-group">
                        <label>Order Amount *</label>
                        <div style="display: flex; align-items: center;">
                            <span style="margin-right: 0.5rem; font-size: 1.2rem;">$</span>
                            <input type="number" id="editOrderAmount" step="0.01" min="0" value="${order.amount || 0}" required style="flex: 1;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Order Status *</label>
                        <select id="editOrderStatus" required>
                            ${['Pending','Confirmed','In Progress','Completed','Cancelled'].map(s => 
                                `<option value="${s}" ${((order.status||'')===s)?'selected':''}>${s}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Order Description</label>
                        <textarea id="editOrderDescription" rows="3">${(order.description || '').replace(/"/g, '&quot;')}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Project Timeline</label>
                        <input type="text" id="editOrderTimeline" value="${(order.projectTimeline || '').replace(/"/g, '&quot;')}">
                    </div>
                    <div class="form-group">
                        <label>Payment Method</label>
                        <input type="text" id="editOrderPaymentMethod" value="${(order.paymentMethod || '').replace(/"/g, '&quot;')}">
                    </div>
                    <div class="form-group">
                        <label>Special Requests / Notes</label>
                        <textarea id="editOrderSpecialRequests" rows="3">${(order.specialRequests || '').replace(/"/g, '&quot;')}</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="saveEditedOrder('${orderId}')">Save Changes</button>
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveEditedOrder(orderId) {
    const update = {
        service: document.getElementById('editOrderService')?.value.trim(),
        amount: parseFloat(document.getElementById('editOrderAmount')?.value),
        status: document.getElementById('editOrderStatus')?.value,
        description: document.getElementById('editOrderDescription')?.value.trim(),
        projectTimeline: document.getElementById('editOrderTimeline')?.value.trim() || null,
        paymentMethod: document.getElementById('editOrderPaymentMethod')?.value.trim() || null,
        specialRequests: document.getElementById('editOrderSpecialRequests')?.value.trim() || null,
    };

    if (!update.service) {
        alert('Please enter a service.');
        return;
    }
    if (isNaN(update.amount) || update.amount <= 0) {
        alert('Please enter a valid order amount.');
        return;
    }

    // Try API first
    fetch(`/api/crm/orders?orderId=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            closeModal();
            loadOrders();
            updateClientStats();
            alert('Order updated successfully!');
        } else {
            // Fallback to localStorage
            if (window.tnrCRM && window.tnrCRM.updateOrder) {
                window.tnrCRM.updateOrder(orderId, update);
                closeModal();
                loadOrders();
                updateClientStats();
                alert('Order updated successfully!');
            } else {
                alert('Error: ' + (data.error || 'Failed to update order'));
            }
        }
    })
    .catch(e => {
        // Fallback to localStorage
        if (window.tnrCRM && window.tnrCRM.updateOrder) {
            window.tnrCRM.updateOrder(orderId, update);
            closeModal();
            loadOrders();
            updateClientStats();
            alert('Order updated successfully!');
        } else {
            alert('Error: ' + e.message);
        }
    });
}

function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) {
        return;
    }
    
    // Try API first
    fetch(`/api/crm/orders?orderId=${orderId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadOrders();
            updateClientStats();
            alert('Order deleted successfully!');
        } else {
            // Fallback to localStorage
            if (window.tnrCRM && window.tnrCRM.orders) {
                window.tnrCRM.orders = window.tnrCRM.orders.filter(o => o.id !== orderId);
                if (window.tnrCRM.saveToStorage) {
                    window.tnrCRM.saveToStorage();
                }
                loadOrders();
                updateClientStats();
                alert('Order deleted successfully!');
            } else {
                alert('Error: ' + (data.error || 'Failed to delete order'));
            }
        }
    })
    .catch(e => {
        // Fallback to localStorage
        if (window.tnrCRM && window.tnrCRM.orders) {
            window.tnrCRM.orders = window.tnrCRM.orders.filter(o => o.id !== orderId);
            if (window.tnrCRM.saveToStorage) {
                window.tnrCRM.saveToStorage();
            }
            loadOrders();
            updateClientStats();
            alert('Order deleted successfully!');
        } else {
            alert('Error: ' + e.message);
        }
    });
}

// Update Client Statistics
function updateClientStats() {
    // Try to get stats from API first
    fetch('/api/crm/stats')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.stats) {
                const stats = data.stats;
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
            } else {
                // Fallback to localStorage
                if (window.tnrCRM && window.tnrCRM.getStats) {
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
                }
            }
        })
        .catch(e => {
            // Fallback to localStorage
            if (window.tnrCRM && window.tnrCRM.getStats) {
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
            }
        });
}

// Export functions to global scope
window.showCrmTab = showCrmTab;
window.initializeCRM = initializeCRM;
window.loadClients = loadClients;
window.loadLeads = loadLeads;
window.loadOrders = loadOrders;
window.updateClientStats = updateClientStats;
window.showAddClientModal = showAddClientModal;
window.saveNewClient = saveNewClient;
window.editClient = editClient;
window.saveEditedClient = saveEditedClient;
window.deleteClient = deleteClient;
window.convertLeadToClient = convertLeadToClient;
window.deleteLead = deleteLead;
window.showAddOrderModal = showAddOrderModal;
window.toggleClientFields = toggleClientFields;
window.saveNewOrder = saveNewOrder;
window.editOrder = editOrder;
window.saveEditedOrder = saveEditedOrder;
window.deleteOrder = deleteOrder;

