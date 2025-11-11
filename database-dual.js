// TNR Business Solutions - Dual Database Support
// Supports SQLite (local development) and Vercel Postgres (production)
// Auto-detects database type from environment variables

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
let postgres; // Lazy-loaded for Vercel Postgres

class TNRDatabase {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, "tnr_database.db");
    this.usePostgres = !!process.env.POSTGRES_URL;
    this.postgres = null;
  }

  // Initialize database (auto-detects SQLite or Postgres)
  async initialize() {
    if (this.usePostgres) {
      try {
        // Lazy load @vercel/postgres only when needed
        if (!postgres) {
          postgres = require("@vercel/postgres");
        }
        // @vercel/postgres exports { sql } where sql is a tagged template function
        // Use sql.unsafe() for parameterized queries
        this.postgres = postgres.sql || postgres;
        console.log("✅ Using Vercel Postgres database");
        await this.createTables();
        return;
      } catch (err) {
        console.error("❌ Postgres initialization error:", err);
        throw err;
      }
    } else {
      // SQLite for local development
      return new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(this.dbPath, (err) => {
          if (err) {
            console.error("❌ Database initialization error:", err);
            reject(err);
          } else {
            console.log("✅ Using SQLite database (local development)");
            this.createTables()
              .then(() => resolve())
              .catch(reject);
          }
        });
      });
    }
  }

  // Convert SQL with ? placeholders to Postgres format
  // For @vercel/postgres, we use tagged template literals: sql`SELECT * FROM table WHERE id = ${value}`
  // But we'll convert ? to use the template literal approach
  convertSQL(sql, params = []) {
    if (!this.usePostgres) return { sql, params };
    
    // @vercel/postgres uses tagged template literals, but also supports sql.query() with $1, $2
    // For compatibility, convert ? to $1, $2 format for query() method
    let paramIndex = 1;
    const convertedSQL = sql.replace(/\?/g, () => `$${paramIndex++}`);
    return { sql: convertedSQL, params };
  }

  // Unified query executor
  async query(sql, params = []) {
    if (this.usePostgres) {
      const { sql: convertedSQL, params: convertedParams } = this.convertSQL(sql, params);
      // @vercel/postgres uses sql.unsafe() for raw queries with $1, $2 placeholders
      try {
        if (this.postgres && this.postgres.unsafe) {
          const result = await this.postgres.unsafe(convertedSQL, convertedParams);
          return result.rows || [];
        } else {
          // Fallback: try as direct function call
          const result = await this.postgres(convertedSQL, ...convertedParams);
          return result.rows || result || [];
        }
      } catch (err) {
        console.error('Postgres query error:', err);
        throw err;
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    }
  }

  // Unified query executor (single row)
  async queryOne(sql, params = []) {
    if (this.usePostgres) {
      const rows = await this.query(sql, params);
      return rows[0] || null;
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    }
  }

  // Unified execute (INSERT/UPDATE/DELETE)
  async execute(sql, params = []) {
    if (this.usePostgres) {
      const { sql: convertedSQL, params: convertedParams } = this.convertSQL(sql, params);
      try {
        let result;
        if (this.postgres && this.postgres.unsafe) {
          result = await this.postgres.unsafe(convertedSQL, convertedParams);
        } else {
          result = await this.postgres(convertedSQL, ...convertedParams);
        }
        return { lastID: null, changes: result.rowCount || result.count || 0 };
      } catch (err) {
        console.error('Postgres execute error:', err);
        throw err;
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
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
        businessType TEXT,
        businessName TEXT,
        businessAddress TEXT,
        interest TEXT,
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
        businessType TEXT,
        businessName TEXT,
        businessAddress TEXT,
        interest TEXT,
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

      // Social media tokens table (NEW)
      `CREATE TABLE IF NOT EXISTS social_media_tokens (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        page_id TEXT,
        access_token TEXT NOT NULL,
        token_type TEXT DEFAULT 'Bearer',
        expires_at TEXT,
        refresh_token TEXT,
        user_id TEXT,
        page_name TEXT,
        instagram_account_id TEXT,
        instagram_username TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    if (this.usePostgres) {
      // Postgres: Use CREATE TABLE IF NOT EXISTS (similar syntax)
      for (const sql of tables) {
        try {
          await this.postgres.query(sql);
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes("already exists")) {
            console.error("❌ Error creating table:", err.message);
            throw err;
          }
        }
      }
      console.log("✅ All database tables created successfully");
    } else {
      // SQLite
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
  }

  // ========== CLIENT MANAGEMENT ==========
  async addClient(clientData) {
    const clientId = `client-${Date.now()}`;
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
      clientData.businessType || null,
      clientData.businessName || clientData.company || null,
      clientData.businessAddress || clientData.address || null,
      clientData.interest || null,
      new Date().toISOString(),
      new Date().toISOString(),
    ];

    const sql = `INSERT INTO clients (
      id, name, email, phone, company, website, industry, address, city, state, zip,
      services, status, joinDate, lastContact, notes, source,
      businessType, businessName, businessAddress, interest,
      createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await this.execute(sql, values);
    return { id: clientId, ...clientData };
  }

  async getClients(filter = {}) {
    let sql = "SELECT * FROM clients WHERE 1=1";
    const params = [];

    if (filter.q) {
      sql += " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)";
      const search = `%${filter.q}%`;
      params.push(search, search, search);
    }
    if (filter.status) {
      sql += " AND status = ?";
      params.push(filter.status);
    }
    if (filter.businessType) {
      sql += " AND businessType = ?";
      params.push(filter.businessType);
    }
    if (filter.source) {
      sql += " AND source = ?";
      params.push(filter.source);
    }

    const orderBy = filter.sort || "createdAt";
    const order = filter.order === "asc" ? "ASC" : "DESC";
    sql += ` ORDER BY ${orderBy} ${order}`;

    const rows = await this.query(sql, params);
    return rows.map((row) => this.parseClient(row));
  }

  async getClient(clientId) {
    const row = await this.queryOne("SELECT * FROM clients WHERE id = ?", [clientId]);
    return row ? this.parseClient(row) : null;
  }

  async updateClient(clientId, updateData) {
    const setParts = [];
    const values = [];

    Object.keys(updateData).forEach((key) => {
      if (key !== "id" && updateData[key] !== undefined) {
        setParts.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    setParts.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(clientId);

    const sql = `UPDATE clients SET ${setParts.join(", ")} WHERE id = ?`;
    await this.execute(sql, values);
    return { id: clientId, ...updateData };
  }

  async deleteClient(clientId) {
    await this.execute("DELETE FROM clients WHERE id = ?", [clientId]);
    return true;
  }

  // ========== LEAD MANAGEMENT ==========
  async addLead(leadData) {
    const leadId = `lead-${Date.now()}`;
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
      leadData.businessType || null,
      leadData.businessName || leadData.company || null,
      leadData.businessAddress || leadData.address || null,
      leadData.interest || null,
      new Date().toISOString(),
      new Date().toISOString(),
    ];

    const sql = `INSERT INTO leads (
      id, name, email, phone, company, website, industry, services, budget, timeline,
      message, additionalInfo, contactMethod, source, status, date, submissionDate,
      submissionDateTime, originalSubmissionId, address, city, state, zipCode, notes,
      businessType, businessName, businessAddress, interest,
      createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await this.execute(sql, values);
    return { id: leadId, ...leadData };
  }

  async getLeads(filter = {}) {
    let sql = "SELECT * FROM leads WHERE 1=1";
    const params = [];

    if (filter.q) {
      sql += " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)";
      const search = `%${filter.q}%`;
      params.push(search, search, search);
    }
    if (filter.status) {
      sql += " AND status = ?";
      params.push(filter.status);
    }
    if (filter.businessType) {
      sql += " AND businessType = ?";
      params.push(filter.businessType);
    }
    if (filter.source) {
      sql += " AND source = ?";
      params.push(filter.source);
    }
    if (filter.interest) {
      sql += " AND interest = ?";
      params.push(filter.interest);
    }

    const orderBy = filter.sort || "createdAt";
    const order = filter.order === "asc" ? "ASC" : "DESC";
    sql += ` ORDER BY ${orderBy} ${order}`;

    const rows = await this.query(sql, params);
    return rows.map((row) => this.parseLead(row));
  }

  async getLead(leadId) {
    const row = await this.queryOne("SELECT * FROM leads WHERE id = ?", [leadId]);
    return row ? this.parseLead(row) : null;
  }

  async convertLeadToClient(leadId) {
    const lead = await this.getLead(leadId);
    if (!lead) throw new Error("Lead not found");

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
      businessType: lead.businessType,
      businessName: lead.businessName,
      businessAddress: lead.businessAddress,
      interest: lead.interest,
    };

    const client = await this.addClient(clientData);
    await this.deleteLead(leadId);
    return client;
  }

  async deleteLead(leadId) {
    await this.execute("DELETE FROM leads WHERE id = ?", [leadId]);
    return true;
  }

  // ========== ORDER MANAGEMENT ==========
  async addOrder(orderData) {
    const orderId = `order-${Date.now()}`;
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

    const sql = `INSERT INTO orders (
      id, orderNumber, clientName, clientId, customerInfo, items, amount,
      status, orderDate, description, projectTimeline, specialRequests,
      invoiceNumber, paymentMethod, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await this.execute(sql, values);
    return { id: orderId, ...orderData };
  }

  async getOrders() {
    const rows = await this.query("SELECT * FROM orders ORDER BY createdAt DESC");
    return rows.map((row) => this.parseOrder(row));
  }

  async updateOrderStatus(orderId, status) {
    await this.execute("UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?", [
      status,
      new Date().toISOString(),
      orderId,
    ]);
    return true;
  }

  async deleteOrder(orderId) {
    await this.execute("DELETE FROM orders WHERE id = ?", [orderId]);
    return true;
  }

  // ========== SOCIAL MEDIA TOKEN MANAGEMENT ==========
  async saveSocialMediaToken(tokenData) {
    const tokenId = tokenData.id || `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const values = [
      tokenId,
      tokenData.platform,
      tokenData.page_id || null,
      tokenData.access_token,
      tokenData.token_type || "Bearer",
      tokenData.expires_at || null,
      tokenData.refresh_token || null,
      tokenData.user_id || null,
      tokenData.page_name || null,
      tokenData.instagram_account_id || null,
      tokenData.instagram_username || null,
      new Date().toISOString(),
      new Date().toISOString(),
    ];

    // Check if token exists (by platform and page_id combination)
    if (tokenData.page_id) {
      const existing = await this.queryOne(
        "SELECT * FROM social_media_tokens WHERE platform = ? AND page_id = ?",
        [tokenData.platform, tokenData.page_id]
      );
      if (existing) {
        // Update existing token
        const sql = `UPDATE social_media_tokens SET 
          access_token = ?, token_type = ?, expires_at = ?, refresh_token = ?,
          user_id = ?, page_name = ?, instagram_account_id = ?, instagram_username = ?,
          updated_at = ? WHERE platform = ? AND page_id = ?`;
        await this.execute(sql, [
          tokenData.access_token,
          tokenData.token_type || "Bearer",
          tokenData.expires_at || null,
          tokenData.refresh_token || null,
          tokenData.user_id || null,
          tokenData.page_name || null,
          tokenData.instagram_account_id || null,
          tokenData.instagram_username || null,
          new Date().toISOString(),
          tokenData.platform,
          tokenData.page_id,
        ]);
        return { id: existing.id, ...tokenData };
      }
    }

    const sql = `INSERT INTO social_media_tokens (
      id, platform, page_id, access_token, token_type, expires_at, refresh_token,
      user_id, page_name, instagram_account_id, instagram_username,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await this.execute(sql, values);
    return { id: tokenId, ...tokenData };
  }

  async getSocialMediaTokens(platform = null) {
    let sql = "SELECT * FROM social_media_tokens";
    const params = [];

    if (platform) {
      sql += " WHERE platform = ?";
      params.push(platform);
    }

    sql += " ORDER BY created_at DESC";

    const rows = await this.query(sql, params);
    return rows.map((row) => this.parseToken(row));
  }

  async getSocialMediaToken(platform, pageId = null) {
    let sql = "SELECT * FROM social_media_tokens WHERE platform = ?";
    const params = [platform];

    if (pageId) {
      sql += " AND page_id = ?";
      params.push(pageId);
    } else {
      // Get the first token for this platform if no page_id specified
      sql += " ORDER BY created_at DESC LIMIT 1";
    }

    const row = await this.queryOne(sql, params);
    return row ? this.parseToken(row) : null;
  }

  async deleteSocialMediaToken(tokenId) {
    await this.execute("DELETE FROM social_media_tokens WHERE id = ?", [tokenId]);
    return true;
  }

  // ========== STATISTICS ==========
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

  // ========== PARSERS ==========
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
      services: typeof row.services === "string" ? JSON.parse(row.services || "[]") : row.services,
      status: row.status,
      joinDate: row.joindate || row.joinDate,
      lastContact: row.lastcontact || row.lastContact,
      notes: row.notes,
      source: row.source,
      businessType: row.businesstype || row.businessType,
      businessName: row.businessname || row.businessName,
      businessAddress: row.businessaddress || row.businessAddress,
      interest: row.interest,
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
      services: typeof row.services === "string" ? JSON.parse(row.services || "[]") : row.services,
      budget: row.budget,
      timeline: row.timeline,
      message: row.message,
      additionalInfo: row.additionalinfo || row.additionalInfo,
      contactMethod: row.contactmethod || row.contactMethod,
      source: row.source,
      status: row.status,
      date: row.date,
      submissionDate: row.submissiondate || row.submissionDate,
      submissionDateTime: row.submissiondatetime || row.submissionDateTime,
      originalSubmissionId: row.originalsubmissionid || row.originalSubmissionId,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zipcode || row.zipCode,
      notes: row.notes,
      businessType: row.businesstype || row.businessType,
      businessName: row.businessname || row.businessName,
      businessAddress: row.businessaddress || row.businessAddress,
      interest: row.interest,
    };
  }

  parseOrder(row) {
    return {
      id: row.id,
      orderNumber: row.ordernumber || row.orderNumber,
      clientName: row.clientname || row.clientName,
      clientId: row.clientid || row.clientId,
      customerInfo: typeof row.customerinfo === "string" ? JSON.parse(row.customerinfo || "{}") : row.customerinfo || row.customerInfo,
      items: typeof row.items === "string" ? JSON.parse(row.items || "[]") : row.items,
      amount: row.amount,
      status: row.status,
      orderDate: row.orderdate || row.orderDate,
      description: row.description,
      projectTimeline: row.projecttimeline || row.projectTimeline,
      specialRequests: row.specialrequests || row.specialRequests,
      invoiceNumber: row.invoicenumber || row.invoiceNumber,
      paymentMethod: row.paymentmethod || row.paymentMethod,
    };
  }

  parseToken(row) {
    return {
      id: row.id,
      platform: row.platform,
      page_id: row.page_id,
      access_token: row.access_token,
      token_type: row.token_type || row.token_type,
      expires_at: row.expires_at,
      refresh_token: row.refresh_token,
      user_id: row.user_id,
      page_name: row.page_name,
      instagram_account_id: row.instagram_account_id,
      instagram_username: row.instagram_username,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  // Close database connection
  close() {
    if (this.usePostgres) {
      // Postgres connections are managed by Vercel
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        if (this.db) {
          this.db.close((err) => {
            if (err) reject(err);
            else {
              console.log("✅ Database connection closed");
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    }
  }
}

module.exports = TNRDatabase;

