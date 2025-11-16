// TNR Business Solutions CRM Data
// This file contains real client data and form submissions
// Now with API support for persistent storage

class TNRCRMData {
  constructor() {
    this.api = null;
    this.useAPI = false;
    this.clients = [];
    this.leads = [];
    this.orders = [];
    this.formSubmissions = [];

    // Try to initialize API first, fall back to localStorage
    this.initialize();

    // Check for new form submissions and convert them to leads
    this.checkForNewSubmissions();

    // Initialize notification system
    this.initializeNotifications();
  }

  initialize() {
    try {
      if (typeof TNRAdminAPI !== "undefined") {
        this.api = new TNRAdminAPI();
        this.useAPI = true;
        console.log("✅ Using API for data storage");
        // Load from API asynchronously
        this.loadFromAPI().catch((err) => {
          console.error("Failed to load from API:", err);
          this.loadFromLocalStorage();
        });
      } else {
        console.log("⚠️ API not available, using localStorage");
        this.loadFromLocalStorage();
      }
    } catch (error) {
      console.error("❌ API initialization failed:", error);
      this.useAPI = false;
      this.loadFromLocalStorage();
    }
  }

  async loadFromAPI() {
    if (!this.api) return;

    const [clients, leads, orders] = await Promise.all([
      this.api.getClients().catch(() => []),
      this.api.getLeads().catch(() => []),
      this.api.getOrders().catch(() => []),
    ]);

    this.clients = clients;
    this.leads = leads;
    this.orders = orders;
    console.log("✅ Data loaded from API");
  }

  loadFromLocalStorage() {
    this.clients = this.loadClients();
    this.leads = this.loadLeads();
    this.orders = this.loadOrders();
    this.formSubmissions = this.loadFormSubmissions();
  }

  loadClients() {
    // Load clients from localStorage, or start with empty array
    const stored = localStorage.getItem("tnr_crm_clients");
    return stored ? JSON.parse(stored) : [];
  }

  loadLeads() {
    // Load leads from localStorage
    const stored = localStorage.getItem("tnr_crm_leads");
    return stored ? JSON.parse(stored) : [];
  }

  loadOrders() {
    // Load orders from localStorage
    const stored = localStorage.getItem("tnr_crm_orders");
    return stored ? JSON.parse(stored) : [];
  }

  loadFormSubmissions() {
    // Form submissions are now directly converted to leads
    // This method is kept for backward compatibility
    return [];
  }

  checkForNewSubmissions() {
    // Check localStorage for new form submissions and convert them to leads
    const storedSubmissions = localStorage.getItem("tnr_form_submissions");
    if (storedSubmissions) {
      const submissions = JSON.parse(storedSubmissions);
      this.autoConvertSubmissionsToLeads(submissions);
    }
  }

  autoConvertSubmissionsToLeads(submissions) {
    // Convert form submissions to leads if they haven't been converted yet
    let convertedCount = 0;

    console.log(
      `Processing ${submissions.length} submissions for lead conversion`
    );

    submissions.forEach((submission) => {
      if (!submission.convertedToLead) {
        console.log(
          `Converting submission: ${submission.name} (${submission.email})`
        );

        const leadData = {
          name: submission.name || "Unknown",
          email: submission.email || "",
          phone: submission.phone || "",
          company: submission.company || "",
          website: submission.website || "",
          industry: submission.industry || "Not specified",
          services: Array.isArray(submission.services)
            ? submission.services
            : [submission.services || "Not specified"],
          budget: submission.budget || "",
          timeline: submission.timeline || "",
          message: submission.message || "",
          additionalInfo: submission.additionalInfo || "",
          contactMethod: submission.contactMethod || "",
          source: submission.source || "Website Form",
          status: "New",
          submissionDate:
            submission.submissionDate ||
            submission.timestamp ||
            new Date().toLocaleString(),
          submissionDateTime:
            submission.submissionDateTime ||
            submission.timestamp ||
            new Date().toISOString(),
          originalSubmissionId: submission.id,
        };

        // Add as lead
        const newLead = this.addLead(leadData);
        convertedCount++;
        console.log(`Created lead: ${newLead.id} for ${newLead.name}`);

        // Mark submission as converted
        submission.convertedToLead = true;
      } else {
        console.log(
          `Submission already converted: ${submission.name} (${submission.email})`
        );
      }
    });

    // Save updated submissions
    if (submissions.length > 0) {
      localStorage.setItem("tnr_form_submissions", JSON.stringify(submissions));
    }

    // Save updated leads
    this.saveToStorage();

    console.log(
      `Auto-conversion completed: ${convertedCount} new leads created`
    );
    return convertedCount;
  }

  // Client Management Methods
  addClient(clientData) {
    return this.addClientAsync(clientData);
  }

  async addClientAsync(clientData) {
    const newClient = {
      id: "client-" + Date.now(),
      ...clientData,
      joinDate: new Date().toISOString().split("T")[0],
      lastContact: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    if (this.useAPI && this.api) {
      try {
        const savedClient = await this.api.addClient(newClient);
        this.clients.push(savedClient);
        return savedClient;
      } catch (error) {
        console.error("Failed to save client to API:", error);
      }
    }

    // Fallback to localStorage
    this.clients.push(newClient);
    this.saveToStorage();
    return newClient;
  }

  updateClient(clientId, updateData) {
    return this.updateClientAsync(clientId, updateData);
  }

  async updateClientAsync(clientId, updateData) {
    if (this.useAPI && this.api) {
      try {
        const updatedClient = await this.api.updateClient(clientId, updateData);
        const index = this.clients.findIndex((c) => c.id === clientId);
        if (index !== -1) {
          this.clients[index] = updatedClient;
        }
        return updatedClient;
      } catch (error) {
        console.error("Failed to update client via API:", error);
      }
    }

    // Fallback to localStorage
    const clientIndex = this.clients.findIndex((c) => c.id === clientId);
    if (clientIndex !== -1) {
      this.clients[clientIndex] = {
        ...this.clients[clientIndex],
        ...updateData,
      };
      this.saveToStorage();
      return this.clients[clientIndex];
    }
    return null;
  }

  deleteClient(clientId) {
    return this.deleteClientAsync(clientId);
  }

  async deleteClientAsync(clientId) {
    if (this.useAPI && this.api) {
      try {
        await this.api.deleteClient(clientId);
        this.clients = this.clients.filter((c) => c.id !== clientId);
        return true;
      } catch (error) {
        console.error("Failed to delete client via API:", error);
      }
    }

    // Fallback to localStorage
    this.clients = this.clients.filter((c) => c.id !== clientId);
    this.saveToStorage();
  }

  getClient(clientId) {
    return this.clients.find((c) => c.id === clientId);
  }

  // Lead Management Methods
  addLead(leadData) {
    return this.addLeadAsync(leadData);
  }

  async addLeadAsync(leadData) {
    const newLead = {
      id: "lead-" + Date.now(),
      ...leadData,
      date: new Date().toISOString().split("T")[0],
      status: "New",
    };

    if (this.useAPI && this.api) {
      try {
        const savedLead = await this.api.addLead(newLead);
        this.leads.push(savedLead);
        console.log(
          `Added lead to CRM (API): ${savedLead.id} - ${savedLead.name} (${savedLead.email})`
        );
        return savedLead;
      } catch (error) {
        console.error("Failed to save lead to API:", error);
      }
    }

    // Fallback to localStorage
    this.leads.push(newLead);
    console.log(
      `Added lead to CRM: ${newLead.id} - ${newLead.name} (${newLead.email})`
    );
    this.saveToStorage();
    return newLead;
  }

  convertLeadToClient(leadId) {
    return this.convertLeadToClientAsync(leadId);
  }

  async convertLeadToClientAsync(leadId) {
    if (this.useAPI && this.api) {
      try {
        const client = await this.api.convertLeadToClient(leadId);
        this.leads = this.leads.filter((l) => l.id !== leadId);
        this.clients.push(client);
        return client;
      } catch (error) {
        console.error("Failed to convert lead via API:", error);
      }
    }

    // Fallback to localStorage
    const lead = this.leads.find((l) => l.id === leadId);
    if (lead) {
      const client = await this.addClient({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        industry: lead.industry,
        address: lead.address || "",
        services: lead.services || [],
        notes: lead.notes || "",
        source: lead.source || "Lead Conversion",
      });
      this.leads = this.leads.filter((l) => l.id !== leadId);
      this.saveToStorage();
      return client;
    }
    return null;
  }

  // Order Management Methods
  addOrder(orderData) {
    return this.addOrderAsync(orderData);
  }

  async addOrderAsync(orderData) {
    const newOrder = {
      id: "order-" + Date.now(),
      ...orderData,
      orderDate: new Date().toISOString().split("T")[0],
      status: orderData.status || "Pending",
      orderNumber: orderData.orderNumber || `TNR-${Date.now()}`,
      clientName: orderData.clientName || orderData.client || "Unknown",
      clientId: orderData.clientId || null,
      customerInfo: typeof orderData.customerInfo === 'string' 
        ? orderData.customerInfo 
        : JSON.stringify(orderData.customerInfo || {}),
      items: typeof orderData.items === 'string'
        ? orderData.items
        : JSON.stringify(orderData.items || (orderData.services ? (typeof orderData.services === 'string' ? orderData.services : orderData.services) : [])),
      amount: parseFloat(orderData.amount || orderData.total || 0),
      description: orderData.description || null,
      projectTimeline: orderData.projectTimeline || orderData.timeline || null,
      specialRequests: orderData.specialRequests || null,
      invoiceNumber: orderData.invoiceNumber || null,
      paymentMethod: orderData.paymentMethod || null,
    };

    if (this.useAPI && this.api) {
      try {
        const savedOrder = await this.api.addOrder(newOrder);
        this.orders.push(savedOrder);
        console.log(`✅ Order saved to database (API): ${savedOrder.id} - ${savedOrder.orderNumber}`);
        return savedOrder;
      } catch (error) {
        console.error("Failed to save order to API:", error);
      }
    }

    // Fallback to localStorage
    this.orders.push(newOrder);
    this.saveToStorage();
    console.log(`✅ Order saved to localStorage (fallback): ${newOrder.id} - ${newOrder.orderNumber}`);
    return newOrder;
  }

  updateOrder(orderId, updateData) {
    const orderIndex = this.orders.findIndex((o) => o.id === orderId);
    if (orderIndex !== -1) {
      this.orders[orderIndex] = { ...this.orders[orderIndex], ...updateData };
      this.saveToStorage();
      return this.orders[orderIndex];
    }
    return null;
  }

  // Statistics Methods
  getStats() {
    return {
      totalClients: this.clients.length,
      activeClients: this.clients.filter((c) => c.status === "Active").length,
      newLeads: this.leads.filter(
        (l) => l.status === "New" || l.status === "Viewed"
      ).length,
      totalOrders: this.orders.length,
      completedOrders: this.orders.filter((o) => o.status === "Completed")
        .length,
      pendingOrders: this.orders.filter((o) => o.status === "Pending").length,
      inProgressOrders: this.orders.filter((o) => o.status === "In Progress")
        .length,
      totalRevenue: this.orders.reduce((sum, o) => sum + (o.amount || 0), 0),
    };
  }

  // Storage Methods
  saveToStorage() {
    localStorage.setItem("tnr_crm_clients", JSON.stringify(this.clients));
    localStorage.setItem("tnr_crm_leads", JSON.stringify(this.leads));
    localStorage.setItem("tnr_crm_orders", JSON.stringify(this.orders));
    localStorage.setItem(
      "tnr_crm_form_submissions",
      JSON.stringify(this.formSubmissions)
    );
  }

  loadFromStorage() {
    const clients = localStorage.getItem("tnr_crm_clients");
    const leads = localStorage.getItem("tnr_crm_leads");
    const orders = localStorage.getItem("tnr_crm_orders");
    const formSubmissions = localStorage.getItem("tnr_crm_form_submissions");

    if (clients) this.clients = JSON.parse(clients);
    if (leads) this.leads = JSON.parse(leads);
    if (orders) this.orders = JSON.parse(orders);
    if (formSubmissions) this.formSubmissions = JSON.parse(formSubmissions);
  }

  // Notification System Methods
  initializeNotifications() {
    // Add CSS for notification bubble if not already added
    this.addNotificationCSS();

    // Update notification count
    this.updateNotificationCount();

    // Set up periodic checks for new leads
    setInterval(() => {
      this.updateNotificationCount();
    }, 5000); // Check every 5 seconds
  }

  addNotificationCSS() {
    if (
      typeof document === "undefined" ||
      document.getElementById("crm-notification-css")
    )
      return;

    const style = document.createElement("style");
    style.id = "crm-notification-css";
    style.textContent = `
      .crm-notification-bubble {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff4444;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        z-index: 1000;
        animation: pulse 2s infinite;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      .crm-notification-bubble.hidden {
        display: none;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .crm-button-container {
        position: relative;
        display: inline-block;
      }
    `;
    document.head.appendChild(style);
  }

  updateNotificationCount() {
    // Count new leads (status = "New")
    const newLeadsCount = this.leads.filter(
      (lead) => lead.status === "New"
    ).length;

    // Skip DOM operations if document is not available (e.g., in Node.js)
    if (typeof document === "undefined") return;

    // Find all CRM buttons and update their notification bubbles
    const crmButtons = document.querySelectorAll(
      'a[href*="admin-dashboard"], a[href*="crm"], .crm-button'
    );

    crmButtons.forEach((button) => {
      // Wrap button in container if not already wrapped
      if (!button.parentElement.classList.contains("crm-button-container")) {
        const container = document.createElement("div");
        container.className = "crm-button-container";
        button.parentNode.insertBefore(container, button);
        container.appendChild(button);
      }

      // Add or update notification bubble
      let bubble = button.parentElement.querySelector(
        ".crm-notification-bubble"
      );
      if (!bubble) {
        bubble = document.createElement("div");
        bubble.className = "crm-notification-bubble";
        button.parentElement.appendChild(bubble);
      }

      if (newLeadsCount > 0) {
        bubble.textContent =
          newLeadsCount > 99 ? "99+" : newLeadsCount.toString();
        bubble.classList.remove("hidden");
      } else {
        bubble.classList.add("hidden");
      }
    });
  }

  // Mark leads as viewed (remove from notification count)
  markLeadsAsViewed() {
    this.leads.forEach((lead) => {
      if (lead.status === "New") {
        lead.status = "Viewed";
      }
    });
    this.saveToStorage();
    this.updateNotificationCount();
  }

  // Form Integration Methods
  processFormSubmission(formData) {
    // This method would be called when a form is submitted on the website
    const lead = this.addLead({
      name: formData.name || "Unknown",
      email: formData.email || "",
      phone: formData.phone || "",
      industry: formData.industry || "General",
      message: formData.message || "",
      source: "Website Form",
      services: formData.services || [],
    });

    // Update notification count after adding new lead
    this.updateNotificationCount();

    return lead;
  }
}

// Make it available globally
window.TNRCRMData = TNRCRMData;

// Initialize CRM data when DOM is ready
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      console.log("📊 Initializing CRM system...");
      window.tnrCRM = new TNRCRMData();
      console.log("✅ CRM system initialized");
    });
  } else {
    console.log("📊 Initializing CRM system...");
    window.tnrCRM = new TNRCRMData();
    console.log("✅ CRM system initialized");
  }
}
