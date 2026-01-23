// TNR Business Solutions - Admin API Client
// Handles all API calls to the CRM database

const API_BASE_URL = "/api/crm";

class TNRAdminAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem("adminSession");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/${endpoint}`;
    const defaultOptions = {
      method: "GET",
      headers: this.getAuthHeaders(),
    };

    const config = { ...defaultOptions, ...options };
    // Merge headers to ensure Authorization is included
    config.headers = { ...defaultOptions.headers, ...(options.headers || {}) };

    if (config.body && typeof config.body !== "string") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, get text to see what we got
          const text = await response.text();
          console.error(`API Error - Invalid JSON response (${endpoint}):`, text.substring(0, 500));
          throw new Error(`Invalid JSON response from server: ${response.status} ${response.statusText}`);
        }
      } else {
        // Not JSON - get text response
        const text = await response.text();
        console.error(`API Error - Non-JSON response (${endpoint}):`, text.substring(0, 500));
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || data.message || "API request failed");
      }
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Client Management
  async getClients() {
    return await this.request("clients");
  }

  async getClient(clientId) {
    return await this.request(`clients/${clientId}`);
  }

  async addClient(clientData) {
    return await this.request("clients", {
      method: "POST",
      body: clientData,
    });
  }

  async updateClient(clientId, updateData) {
    return await this.request("clients", {
      method: "PUT",
      body: { id: clientId, ...updateData },
    });
  }

  async deleteClient(clientId) {
    return await this.request(`clients/${clientId}`, {
      method: "DELETE",
    });
  }

  // Lead Management
  async getLeads() {
    return await this.request("leads");
  }

  async getLead(leadId) {
    return await this.request(`leads/${leadId}`);
  }

  async addLead(leadData) {
    return await this.request("leads", {
      method: "POST",
      body: leadData,
    });
  }

  async convertLeadToClient(leadId) {
    return await this.request("convert-lead", {
      method: "POST",
      body: { leadId },
    });
  }

  async deleteLead(leadId) {
    return await this.request(`leads/${leadId}`, {
      method: "DELETE",
    });
  }

  // Order Management
  async getOrders() {
    return await this.request("orders");
  }

  async addOrder(orderData) {
    return await this.request("orders", {
      method: "POST",
      body: orderData,
    });
  }

  async updateOrderStatus(orderId, status) {
    return await this.request("orders", {
      method: "PUT",
      body: { id: orderId, status },
    });
  }

  async deleteOrder(orderId) {
    return await this.request(`orders/${orderId}`, {
      method: "DELETE",
    });
  }

  // Statistics
  async getStats() {
    return await this.request("stats");
  }

  // Social Media Posts
  async getSocialPosts(status = null) {
    const endpoint = status ? `social-posts?status=${status}` : "social-posts";
    return await this.request(endpoint);
  }

  async saveSocialPost(postData) {
    return await this.request("social-posts", {
      method: "POST",
      body: postData,
    });
  }
}

// Make it available globally
window.TNRAdminAPI = TNRAdminAPI;
