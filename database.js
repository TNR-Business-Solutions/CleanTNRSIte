// TNR Business Solutions - Database Setup
// SQLite database for persistent data storage

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

class TNRDatabase {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, "tnr_database.db");
  }

  // Initialize database
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error("❌ Database initialization error:", err);
          reject(err);
        } else {
          console.log("✅ Database initialized successfully");
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  // Create all necessary tables
  async createTables() {
    const tables = [
      // Clients table
      `CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        website TEXT,
        industry TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        services TEXT,
        status TEXT DEFAULT 'Active',
        joinDate TEXT,
        lastContact TEXT,
        notes TEXT,
        source TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Leads table
      `CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        website TEXT,
        industry TEXT,
        services TEXT,
        budget TEXT,
        timeline TEXT,
        message TEXT,
        additionalInfo TEXT,
        contactMethod TEXT,
        source TEXT DEFAULT 'Website Form',
        status TEXT DEFAULT 'New',
        date TEXT,
        submissionDate TEXT,
        submissionDateTime TEXT,
        originalSubmissionId TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zipCode TEXT,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        orderNumber TEXT UNIQUE NOT NULL,
        clientName TEXT NOT NULL,
        clientId TEXT,
        customerInfo TEXT,
        items TEXT,
        amount REAL,
        status TEXT DEFAULT 'Pending',
        orderDate TEXT,
        description TEXT,
        projectTimeline TEXT,
        specialRequests TEXT,
        invoiceNumber TEXT,
        paymentMethod TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Form submissions table
      `CREATE TABLE IF NOT EXISTS form_submissions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        industry TEXT,
        website TEXT,
        message TEXT,
        source TEXT DEFAULT 'Website Form',
        status TEXT DEFAULT 'New',
        convertedToLead INTEGER DEFAULT 0,
        submissionDate TEXT,
        additionalData TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Social media posts table
      `CREATE TABLE IF NOT EXISTS social_media_posts (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        content TEXT NOT NULL,
        scheduledDate TEXT,
        publishedDate TEXT,
        status TEXT DEFAULT 'draft',
        clientName TEXT,
        contentType TEXT,
        hashtags TEXT,
        imageUrl TEXT,
        metadata TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Automation workflows table
      `CREATE TABLE IF NOT EXISTS automation_workflows (
        id TEXT PRIMARY KEY,
        workflowName TEXT NOT NULL,
        workflowType TEXT NOT NULL,
        trigger TEXT,
        actions TEXT,
        isActive INTEGER DEFAULT 1,
        lastRun TEXT,
        nextRun TEXT,
        metadata TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Analytics table
      `CREATE TABLE IF NOT EXISTS analytics (
        id TEXT PRIMARY KEY,
        eventType TEXT NOT NULL,
        eventData TEXT,
        userId TEXT,
        sessionId TEXT,
        timestamp TEXT,
        metadata TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    return new Promise((resolve, reject) => {
      let completed = 0;
      const total = tables.length;

      tables.forEach((sql) => {
        this.db.run(sql, (err) => {
          if (err) {
            console.error("❌ Error creating table:", err.message);
            reject(err);
          } else {
            completed++;
            if (completed === total) {
              console.log("✅ All database tables created successfully");
              resolve();
            }
          }
        });
      });
    });
  }

  // Client management methods
  async addClient(clientData) {
    return new Promise((resolve, reject) => {
      const clientId = `client-${Date.now()}`;
      const sql = `INSERT INTO clients (
        id, name, email, phone, company, website, industry, address, city, state, zip,
        services, status, joinDate, lastContact, notes, source, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        clientId,
        clientData.name,
        clientData.email || null,
        clientData.phone || null,
        clientData.company || null,
        clientData.website || null,
        clientData.industry || null,
        clientData.address || null,
        clientData.city || null,
        clientData.state || null,
        clientData.zip || null,
        JSON.stringify(clientData.services || []),
        clientData.status || "Active",
        clientData.joinDate || new Date().toISOString().split("T")[0],
        clientData.lastContact || new Date().toISOString().split("T")[0],
        clientData.notes || null,
        clientData.source || "Manual Entry",
        new Date().toISOString(),
        new Date().toISOString(),
      ];

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: clientId, ...clientData });
        }
      });
    });
  }

  async getClients() {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM clients ORDER BY createdAt DESC",
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row) => this.parseClient(row)));
          }
        }
      );
    });
  }

  async getClient(clientId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM clients WHERE id = ?",
        [clientId],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(this.parseClient(row));
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async updateClient(clientId, updateData) {
    return new Promise((resolve, reject) => {
      const setParts = [];
      const values = [];

      if (updateData.name) {
        setParts.push("name = ?");
        values.push(updateData.name);
      }
      if (updateData.email) {
        setParts.push("email = ?");
        values.push(updateData.email);
      }
      if (updateData.phone) {
        setParts.push("phone = ?");
        values.push(updateData.phone);
      }
      if (updateData.status) {
        setParts.push("status = ?");
        values.push(updateData.status);
      }
      if (updateData.lastContact) {
        setParts.push("lastContact = ?");
        values.push(updateData.lastContact);
      }

      setParts.push("updatedAt = ?");
      values.push(new Date().toISOString());
      values.push(clientId);

      const sql = `UPDATE clients SET ${setParts.join(", ")} WHERE id = ?`;

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: clientId, ...updateData });
        }
      });
    });
  }

  async deleteClient(clientId) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM clients WHERE id = ?", [clientId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Lead management methods
  async addLead(leadData) {
    return new Promise((resolve, reject) => {
      const leadId = `lead-${Date.now()}`;
      const sql = `INSERT INTO leads (
        id, name, email, phone, company, website, industry, services, budget, timeline,
        message, additionalInfo, contactMethod, source, status, date, submissionDate,
        submissionDateTime, originalSubmissionId, address, city, state, zipCode, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        leadId,
        leadData.name,
        leadData.email || null,
        leadData.phone || null,
        leadData.company || null,
        leadData.website || null,
        leadData.industry || null,
        JSON.stringify(leadData.services || []),
        leadData.budget || null,
        leadData.timeline || null,
        leadData.message || null,
        leadData.additionalInfo || null,
        leadData.contactMethod || null,
        leadData.source || "Website Form",
        leadData.status || "New",
        leadData.date || new Date().toISOString().split("T")[0],
        leadData.submissionDate || null,
        leadData.submissionDateTime || null,
        leadData.originalSubmissionId || null,
        leadData.address || null,
        leadData.city || null,
        leadData.state || null,
        leadData.zipCode || null,
        leadData.notes || null,
        new Date().toISOString(),
        new Date().toISOString(),
      ];

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: leadId, ...leadData });
        }
      });
    });
  }

  async getLeads() {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM leads ORDER BY createdAt DESC",
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row) => this.parseLead(row)));
          }
        }
      );
    });
  }

  async convertLeadToClient(leadId) {
    return new Promise(async (resolve, reject) => {
      try {
        const lead = await this.getLead(leadId);
        if (!lead) {
          reject(new Error("Lead not found"));
          return;
        }

        const clientData = {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          industry: lead.industry,
          company: lead.company,
          website: lead.website,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          zip: lead.zipCode,
          services: lead.services,
          notes: lead.message,
          source: lead.source || "Lead Conversion",
        };

        const client = await this.addClient(clientData);
        await this.deleteLead(leadId);
        resolve(client);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getLead(leadId) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM leads WHERE id = ?", [leadId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(this.parseLead(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  async deleteLead(leadId) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM leads WHERE id = ?", [leadId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Order management methods
  async addOrder(orderData) {
    return new Promise((resolve, reject) => {
      const orderId = `order-${Date.now()}`;
      const sql = `INSERT INTO orders (
        id, orderNumber, clientName, clientId, customerInfo, items, amount,
        status, orderDate, description, projectTimeline, specialRequests,
        invoiceNumber, paymentMethod, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        orderId,
        orderData.orderNumber || `TNR-${Date.now()}`,
        orderData.clientName,
        orderData.clientId || null,
        JSON.stringify(orderData.customerInfo || {}),
        JSON.stringify(orderData.items || []),
        orderData.amount || 0,
        orderData.status || "Pending",
        orderData.orderDate || new Date().toISOString().split("T")[0],
        orderData.description || null,
        orderData.projectTimeline || null,
        orderData.specialRequests || null,
        orderData.invoiceNumber || null,
        orderData.paymentMethod || null,
        new Date().toISOString(),
        new Date().toISOString(),
      ];

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: orderId, ...orderData });
        }
      });
    });
  }

  async getOrders() {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM orders ORDER BY createdAt DESC",
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row) => this.parseOrder(row)));
          }
        }
      );
    });
  }

  async updateOrderStatus(orderId, status) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?`;
      this.db.run(sql, [status, new Date().toISOString(), orderId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  async deleteOrder(orderId) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM orders WHERE id = ?", [orderId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Social media automation methods
  async saveSocialPost(postData) {
    return new Promise((resolve, reject) => {
      const postId = postData.id || `post-${Date.now()}`;
      const sql = `INSERT INTO social_media_posts (
        id, platform, content, scheduledDate, publishedDate, status,
        clientName, contentType, hashtags, imageUrl, metadata, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        postId,
        postData.platform,
        postData.content,
        postData.scheduledDate || null,
        postData.publishedDate || null,
        postData.status || "draft",
        postData.clientName || null,
        postData.contentType || null,
        postData.hashtags || null,
        postData.imageUrl || null,
        JSON.stringify(postData.metadata || {}),
        new Date().toISOString(),
        new Date().toISOString(),
      ];

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: postId, ...postData });
        }
      });
    });
  }

  async getSocialPosts(status = null) {
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM social_media_posts ORDER BY createdAt DESC";
      if (status) {
        sql =
          "SELECT * FROM social_media_posts WHERE status = ? ORDER BY createdAt DESC";
      }

      this.db.all(sql, status ? [status] : [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map((row) => this.parseSocialPost(row)));
        }
      });
    });
  }

  // Statistics methods
  async getStats() {
    const [clients, leads, orders] = await Promise.all([
      this.getClients(),
      this.getLeads(),
      this.getOrders(),
    ]);

    return {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === "Active").length,
      newLeads: leads.filter((l) => l.status === "New").length,
      totalOrders: orders.length,
      completedOrders: orders.filter((o) => o.status === "completed").length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0),
    };
  }

  // Helper methods to parse data
  parseClient(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      website: row.website,
      industry: row.industry,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      services: JSON.parse(row.services || "[]"),
      status: row.status,
      joinDate: row.joinDate,
      lastContact: row.lastContact,
      notes: row.notes,
      source: row.source,
    };
  }

  parseLead(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      website: row.website,
      industry: row.industry,
      services: JSON.parse(row.services || "[]"),
      budget: row.budget,
      timeline: row.timeline,
      message: row.message,
      additionalInfo: row.additionalInfo,
      contactMethod: row.contactMethod,
      source: row.source,
      status: row.status,
      date: row.date,
      submissionDate: row.submissionDate,
      submissionDateTime: row.submissionDateTime,
      originalSubmissionId: row.originalSubmissionId,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zipCode,
      notes: row.notes,
    };
  }

  parseOrder(row) {
    return {
      id: row.id,
      orderNumber: row.orderNumber,
      clientName: row.clientName,
      clientId: row.clientId,
      customerInfo: JSON.parse(row.customerInfo || "{}"),
      items: JSON.parse(row.items || "[]"),
      amount: row.amount,
      status: row.status,
      orderDate: row.orderDate,
      description: row.description,
      projectTimeline: row.projectTimeline,
      specialRequests: row.specialRequests,
      invoiceNumber: row.invoiceNumber,
      paymentMethod: row.paymentMethod,
    };
  }

  parseSocialPost(row) {
    return {
      id: row.id,
      platform: row.platform,
      content: row.content,
      scheduledDate: row.scheduledDate,
      publishedDate: row.publishedDate,
      status: row.status,
      clientName: row.clientName,
      contentType: row.contentType,
      hashtags: row.hashtags,
      imageUrl: row.imageUrl,
      metadata: JSON.parse(row.metadata || "{}"),
    };
  }

  // Close database connection
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log("✅ Database connection closed");
            resolve();
          }
        });
      }
    });
  }
}

module.exports = TNRDatabase;
