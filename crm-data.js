// TNR Business Solutions CRM Data
// This file contains real client data and form submissions

class TNRCRMData {
  constructor() {
    this.clients = this.loadClients();
    this.leads = this.loadLeads();
    this.orders = this.loadOrders();
    this.formSubmissions = this.loadFormSubmissions();

    // Check for new form submissions and convert them to leads
    this.checkForNewSubmissions();

    // Initialize notification system
    this.initializeNotifications();
  }

  loadClients() {
    // Real TNR Business Solutions clients (if any exist)
    // For now, we'll start with an empty array and add test data
    return [
      // Test client for each industry
      {
        id: "client-001",
        name: "Test Construction Company",
        industry: "Construction",
        email: "test@construction.com",
        phone: "(412) 555-0101",
        address: "123 Main St, Greensburg, PA 15601",
        status: "Active",
        joinDate: "2024-01-15",
        lastContact: "2024-12-15",
        services: ["Web Design", "SEO Services"],
        notes: "Test client for construction industry",
        source: "Website Form",
      },
      {
        id: "client-002",
        name: "Test Law Firm",
        industry: "Legal Services",
        email: "test@lawfirm.com",
        phone: "(412) 555-0102",
        address: "456 Oak Ave, Greensburg, PA 15601",
        status: "Active",
        joinDate: "2024-02-20",
        lastContact: "2024-12-10",
        services: ["Social Media Management", "Content Creation"],
        notes: "Test client for legal services industry",
        source: "Referral",
      },
      {
        id: "client-003",
        name: "Test E-commerce Store",
        industry: "E-commerce",
        email: "test@estore.com",
        phone: "(412) 555-0103",
        address: "789 Pine St, Greensburg, PA 15601",
        status: "Active",
        joinDate: "2024-03-10",
        lastContact: "2024-12-05",
        services: ["Paid Advertising", "Email Marketing"],
        notes: "Test client for e-commerce industry",
        source: "Google Ads",
      },
      {
        id: "client-004",
        name: "Test Restaurant",
        industry: "Food Service",
        email: "test@restaurant.com",
        phone: "(412) 555-0104",
        address: "321 Market St, Greensburg, PA 15601",
        status: "Active",
        joinDate: "2024-04-05",
        lastContact: "2024-12-01",
        services: ["Social Media Management", "Local SEO"],
        notes: "Test client for restaurant industry",
        source: "Facebook",
      },
      {
        id: "client-005",
        name: "Test Medical Practice",
        industry: "Healthcare",
        email: "test@medical.com",
        phone: "(412) 555-0105",
        address: "654 Health Dr, Greensburg, PA 15601",
        status: "Active",
        joinDate: "2024-05-12",
        lastContact: "2024-11-28",
        services: ["Web Design", "Local SEO"],
        notes: "Test client for healthcare industry",
        source: "Website Form",
      },
    ];
  }

  loadLeads() {
    // Real leads from form submissions
    return [
      // These would be populated from actual form submissions
    ];
  }

  loadOrders() {
    // Test orders for each industry
    return [
      {
        id: "order-001",
        clientId: "client-001",
        clientName: "Test Construction Company",
        industry: "Construction",
        service: "Web Design & SEO Package",
        amount: 2500,
        status: "Completed",
        orderDate: "2024-01-15",
        completionDate: "2024-02-15",
        description:
          "Complete website redesign with SEO optimization for construction company",
      },
      {
        id: "order-002",
        clientId: "client-002",
        clientName: "Test Law Firm",
        industry: "Legal Services",
        service: "Social Media Management",
        amount: 1200,
        status: "In Progress",
        orderDate: "2024-02-20",
        completionDate: null,
        description: "Monthly social media management for law firm",
      },
      {
        id: "order-003",
        clientId: "client-003",
        clientName: "Test E-commerce Store",
        industry: "E-commerce",
        service: "Paid Advertising Campaign",
        amount: 3000,
        status: "Completed",
        orderDate: "2024-03-10",
        completionDate: "2024-04-10",
        description:
          "Google Ads and Facebook advertising campaign for online store",
      },
      {
        id: "order-004",
        clientId: "client-004",
        clientName: "Test Restaurant",
        industry: "Food Service",
        service: "Local SEO & Social Media",
        amount: 1800,
        status: "In Progress",
        orderDate: "2024-04-05",
        completionDate: null,
        description:
          "Local SEO optimization and social media management for restaurant",
      },
      {
        id: "order-005",
        clientId: "client-005",
        clientName: "Test Medical Practice",
        industry: "Healthcare",
        service: "Website Design & Local SEO",
        amount: 2200,
        status: "Completed",
        orderDate: "2024-05-12",
        completionDate: "2024-06-12",
        description:
          "Professional website design with local SEO for medical practice",
      },
    ];
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
    const newClient = {
      id: "client-" + Date.now(),
      ...clientData,
      joinDate: new Date().toISOString().split("T")[0],
      lastContact: new Date().toISOString().split("T")[0],
      status: "Active",
    };
    this.clients.push(newClient);
    this.saveToStorage();
    return newClient;
  }

  updateClient(clientId, updateData) {
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
    this.clients = this.clients.filter((c) => c.id !== clientId);
    this.saveToStorage();
  }

  getClient(clientId) {
    return this.clients.find((c) => c.id === clientId);
  }

  // Lead Management Methods
  addLead(leadData) {
    const newLead = {
      id: "lead-" + Date.now(),
      ...leadData,
      date: new Date().toISOString().split("T")[0],
      status: "New",
    };
    this.leads.push(newLead);
    console.log(
      `Added lead to CRM: ${newLead.id} - ${newLead.name} (${newLead.email})`
    );
    this.saveToStorage();
    return newLead;
  }

  convertLeadToClient(leadId) {
    const lead = this.leads.find((l) => l.id === leadId);
    if (lead) {
      const client = this.addClient({
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
    const newOrder = {
      id: "order-" + Date.now(),
      ...orderData,
      orderDate: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    this.orders.push(newOrder);
    this.saveToStorage();
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
      newLeads: this.leads.filter((l) => l.status === "New").length,
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

// Initialize CRM data
window.tnrCRM = new TNRCRMData();
