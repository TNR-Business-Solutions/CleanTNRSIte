// TNR Business Solutions - Dual Database Support
// Supports SQLite (local development) and Vercel Postgres (production)
// Auto-detects database type from environment variables

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Import Neon serverless driver (works with Vercel)
// Using Pool instead of neon() for better compatibility with dynamic SQL
let Pool, neonConfig;
try {
  const neonPackage = require("@neondatabase/serverless");
  Pool = neonPackage.Pool;
  neonConfig = neonPackage.neonConfig;
  console.log('✅ Neon serverless driver (Pool) loaded successfully v2');
} catch (e) {
  console.log('ℹ️ Neon driver not available (local development):', e.message);
  Pool = null;
  neonConfig = null;
}

class TNRDatabase {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, "tnr_database.db");
    this.usePostgres = !!process.env.POSTGRES_URL;
    this.postgres = null;
    
    // Debug: Log environment detection
    console.log('🔍 Database initialization:', {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      usePostgres: this.usePostgres,
      nodeEnv: process.env.NODE_ENV
    });
  }

  // Initialize database (auto-detects SQLite or Neon Postgres)
  async initialize() {
    if (this.usePostgres) {
      try {
        if (!Pool) {
          throw new Error('Neon Pool driver not available');
        }
        
        // Configure Neon to use fetch for WebSockets compatibility
        if (neonConfig) {
          neonConfig.fetchConnectionCache = true;
        }
        
        // Create Neon Pool client (compatible with standard pg Pool)
        // Pool.query() supports dynamic SQL strings
        this.postgres = new Pool({ connectionString: process.env.POSTGRES_URL });
        console.log("✅ Using Neon Postgres database (Pool)");
        await this.createTables();
        return;
      } catch (err) {
        console.error("❌ Postgres initialization error:", err);
        console.error("Falling back to SQLite");
        // Fall through to SQLite initialization below
        this.usePostgres = false;
      }
    }
    
    if (!this.usePostgres) {
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
      // Use Pool.query() method which accepts dynamic SQL and parameters
      try {
        // Pool.query() returns { rows: [], rowCount: N, ... }
        const result = await this.postgres.query(convertedSQL, convertedParams);
        
        // Return the rows array
        return result.rows || [];
      } catch (err) {
        console.error('❌ Neon query error:', err.message);
        console.error('   SQL:', convertedSQL.substring(0, 200));
        console.error('   Params:', convertedParams);
        console.error('   Full error:', err);
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
        // Use Pool.query() method
        const result = await this.postgres.query(convertedSQL, convertedParams);
        // Pool.query() returns { rowCount, rows, ... }
        const rowCount = result.rowCount || 0;
        return { lastID: null, changes: rowCount };
      } catch (err) {
        console.error('❌ Neon execute error:', err.message);
        console.error('   SQL:', convertedSQL.substring(0, 200));
        console.error('   Params:', convertedParams);
        console.error('   Full error:', err);
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

      // Activity timeline table
      `CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        entityType TEXT NOT NULL, -- 'client' or 'lead'
        entityId TEXT NOT NULL,
        activityType TEXT NOT NULL, -- 'call', 'email', 'meeting', 'note', 'status_change', 'workflow'
        title TEXT,
        description TEXT,
        userId TEXT,
        metadata TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Email templates table
      `CREATE TABLE IF NOT EXISTS email_templates (
        id TEXT PRIMARY KEY,
        templateName TEXT NOT NULL,
        subject TEXT NOT NULL,
        htmlContent TEXT NOT NULL,
        textContent TEXT,
        variables TEXT, -- JSON array of available variables
        category TEXT,
        isDefault INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

      // Wix tokens table
      `CREATE TABLE IF NOT EXISTS wix_tokens (
        instance_id TEXT PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TEXT,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Settings table
      // Note: PostgreSQL uses SERIAL instead of AUTOINCREMENT
      `CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        business_name TEXT,
        business_email TEXT,
        business_phone TEXT,
        business_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    if (this.usePostgres) {
      // Postgres: Use CREATE TABLE IF NOT EXISTS (similar syntax)
      // Using Pool.query() which accepts dynamic SQL strings
      
      for (const tableSQL of tables) {
        try {
          // Use Pool.query() method for dynamic SQL
          // This is compatible with standard pg Pool and works with string variables
          await this.postgres.query(tableSQL);
          console.log(`✅ Table created/verified:`, tableSQL.substring(7, 50) + "...");
        } catch (err) {
          // Ignore "already exists" errors (Postgres uses "relation already exists")
          const errorMsg = err.message.toLowerCase();
          if (!errorMsg.includes("already exists") && !errorMsg.includes("duplicate") && !errorMsg.includes("relation")) {
            console.error("❌ Error creating table:", err.message);
            console.error("   SQL:", tableSQL.substring(0, 200));
            console.error("   Full error:", err);
            throw err;
          } else {
            console.log("ℹ️  Table already exists (expected):", tableSQL.substring(0, 50) + "...");
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
    
    // Match the actual table column order (23 columns)
    const sql = `INSERT INTO clients (
      id, name, email, phone, company, website, industry, address, city, state, zip,
      services, status, joinDate, lastContact, notes, source,
      createdAt, updatedAt, businessType, businessName, businessAddress, interest
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    // Values in exact column order
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
      new Date().toISOString(), // createdAt
      new Date().toISOString(), // updatedAt
      clientData.businessType || null,
      clientData.businessName || clientData.company || null,
      clientData.businessAddress || clientData.address || null,
      clientData.interest || null,
    ];
    
    // Verify we have 23 values for 23 columns
    if (values.length !== 23) {
      console.error(`Value count mismatch: expected 23, got ${values.length}`);
      throw new Error(`Value count mismatch: expected 23, got ${values.length}`);
    }

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

  // ========== WIX TOKEN MANAGEMENT ==========
  async saveWixToken(tokenData) {
    const instanceId = tokenData.instanceId;
    if (!instanceId) {
      throw new Error('instanceId is required for Wix tokens');
    }

    // Check if token already exists
    const existing = await this.queryOne(
      "SELECT * FROM wix_tokens WHERE instance_id = ?",
      [instanceId]
    );

    const metadata = typeof tokenData.metadata === 'string' 
      ? tokenData.metadata 
      : JSON.stringify(tokenData.metadata || {});

    if (existing) {
      // Update existing token
      const sql = `UPDATE wix_tokens SET 
        access_token = ?,
        refresh_token = ?,
        expires_at = ?,
        metadata = ?,
        updated_at = ?
        WHERE instance_id = ?`;
      
      await this.execute(sql, [
        tokenData.accessToken,
        tokenData.refreshToken || null,
        tokenData.expiresAt ? new Date(tokenData.expiresAt).toISOString() : null,
        metadata,
        new Date().toISOString(),
        instanceId
      ]);
      console.log(`✅ Updated Wix token for instance: ${instanceId}`);
    } else {
      // Insert new token
      const sql = `INSERT INTO wix_tokens (
        instance_id, access_token, refresh_token, expires_at, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      await this.execute(sql, [
        instanceId,
        tokenData.accessToken,
        tokenData.refreshToken || null,
        tokenData.expiresAt ? new Date(tokenData.expiresAt).toISOString() : null,
        metadata,
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      console.log(`✅ Saved new Wix token for instance: ${instanceId}`);
    }

    return {
      instanceId,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: tokenData.expiresAt,
      metadata: tokenData.metadata
    };
  }

  async getWixToken(instanceId) {
    const row = await this.queryOne(
      "SELECT * FROM wix_tokens WHERE instance_id = ?",
      [instanceId]
    );
    
    if (!row) {
      return null;
    }

    return {
      instanceId: row.instance_id,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : row.metadata,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : null,
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : null
    };
  }

  async getAllWixTokens() {
    const rows = await this.query("SELECT * FROM wix_tokens ORDER BY created_at DESC");
    return rows.map(row => ({
      instanceId: row.instance_id,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : row.metadata,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : null,
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : null
    }));
  }

  async deleteWixToken(instanceId) {
    await this.execute("DELETE FROM wix_tokens WHERE instance_id = ?", [instanceId]);
    console.log(`✅ Deleted Wix token for instance: ${instanceId}`);
    return true;
  }

  // ========== WORKFLOW MANAGEMENT ==========
  async saveWorkflow(workflowData) {
    const workflowId = workflowData.id || `workflow-${Date.now()}`;
    const values = [
      workflowId,
      workflowData.workflowName,
      workflowData.workflowType,
      JSON.stringify(workflowData.trigger || {}),
      JSON.stringify(workflowData.actions || []),
      workflowData.isActive ? 1 : 0,
      workflowData.lastRun || null,
      workflowData.nextRun || null,
      JSON.stringify(workflowData.metadata || {}),
      new Date().toISOString(),
      new Date().toISOString(),
    ];

    // Check if workflow exists
    const existing = workflowData.id ? await this.getWorkflow(workflowData.id) : null;
    
    if (existing) {
      // Update existing workflow
      const sql = `UPDATE automation_workflows SET
        workflowName = ?, workflowType = ?, trigger = ?, actions = ?,
        isActive = ?, lastRun = ?, nextRun = ?, metadata = ?, updatedAt = ?
        WHERE id = ?`;
      await this.execute(sql, [
        workflowData.workflowName,
        workflowData.workflowType,
        JSON.stringify(workflowData.trigger || {}),
        JSON.stringify(workflowData.actions || []),
        workflowData.isActive ? 1 : 0,
        workflowData.lastRun || null,
        workflowData.nextRun || null,
        JSON.stringify(workflowData.metadata || {}),
        new Date().toISOString(),
        workflowData.id
      ]);
      return { id: workflowData.id, ...workflowData };
    } else {
      // Insert new workflow
      const sql = `INSERT INTO automation_workflows (
        id, workflowName, workflowType, trigger, actions, isActive,
        lastRun, nextRun, metadata, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await this.execute(sql, values);
      return { id: workflowId, ...workflowData };
    }

  }

  async getWorkflows(activeOnly = false) {
    let sql = "SELECT * FROM automation_workflows";
    const params = [];

    if (activeOnly) {
      sql += " WHERE isActive = 1";
    }

    sql += " ORDER BY createdAt DESC";

    const rows = await this.query(sql, params);
    return rows.map((row) => this.parseWorkflow(row));
  }

  async getWorkflow(workflowId) {
    const row = await this.queryOne("SELECT * FROM automation_workflows WHERE id = ?", [workflowId]);
    return row ? this.parseWorkflow(row) : null;
  }

  async updateWorkflowStatus(workflowId, isActive) {
    await this.execute(
      "UPDATE automation_workflows SET isActive = ?, updatedAt = ? WHERE id = ?",
      [isActive ? 1 : 0, new Date().toISOString(), workflowId]
    );
    return true;
  }

  async deleteWorkflow(workflowId) {
    await this.execute("DELETE FROM automation_workflows WHERE id = ?", [workflowId]);
    return true;
  }

  async updateWorkflowLastRun(workflowId, lastRun, nextRun = null) {
    await this.execute(
      "UPDATE automation_workflows SET lastRun = ?, nextRun = ?, updatedAt = ? WHERE id = ?",
      [lastRun, nextRun, new Date().toISOString(), workflowId]
    );
    return true;
  }

  parseWorkflow(row) {
    return {
      id: row.id,
      workflowName: row.workflowname || row.workflowName,
      workflowType: row.workflowtype || row.workflowType,
      trigger: typeof row.trigger === "string" ? JSON.parse(row.trigger || "{}") : row.trigger,
      actions: typeof row.actions === "string" ? JSON.parse(row.actions || "[]") : row.actions,
      isActive: row.isactive === 1 || row.isActive === 1,
      lastRun: row.lastrun || row.lastRun,
      nextRun: row.nextrun || row.nextRun,
      metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata || "{}") : row.metadata,
      createdAt: row.createdat || row.createdAt,
      updatedAt: row.updatedat || row.updatedAt,
    };
  }

  // ========== ACTIVITY MANAGEMENT ==========
  async addActivity(activityData) {
    const activityId = activityData.id || `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sql = `INSERT INTO activities (
      id, entityType, entityId, activityType, title, description, userId, metadata, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    await this.execute(sql, [
      activityId,
      activityData.entityType,
      activityData.entityId,
      activityData.activityType,
      activityData.title || null,
      activityData.description || null,
      activityData.userId || null,
      JSON.stringify(activityData.metadata || {}),
      new Date().toISOString()
    ]);
    
    return { id: activityId, ...activityData };
  }

  async getActivities(entityType, entityId) {
    const sql = `SELECT * FROM activities 
                 WHERE entityType = ? AND entityId = ? 
                 ORDER BY createdAt DESC`;
    const rows = await this.query(sql, [entityType, entityId]);
    return rows.map((row) => this.parseActivity(row));
  }

  async deleteActivity(activityId) {
    await this.execute("DELETE FROM activities WHERE id = ?", [activityId]);
    return true;
  }

  parseActivity(row) {
    return {
      id: row.id,
      entityType: row.entitytype || row.entityType,
      entityId: row.entityid || row.entityId,
      activityType: row.activitytype || row.activityType,
      title: row.title,
      description: row.description,
      userId: row.userid || row.userId,
      metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata || "{}") : row.metadata,
      createdAt: row.createdat || row.createdAt,
    };
  }

  // ========== EMAIL TEMPLATE MANAGEMENT ==========
  async saveEmailTemplate(templateData) {
    const templateId = templateData.id || `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if template exists
    const existing = templateData.id ? await this.getEmailTemplate(templateData.id) : null;
    
    if (existing) {
      // Update existing template
      const sql = `UPDATE email_templates SET
        templateName = ?, subject = ?, htmlContent = ?, textContent = ?,
        variables = ?, category = ?, isDefault = ?, updatedAt = ?
        WHERE id = ?`;
      await this.execute(sql, [
        templateData.templateName,
        templateData.subject,
        templateData.htmlContent,
        templateData.textContent || null,
        JSON.stringify(templateData.variables || []),
        templateData.category || null,
        templateData.isDefault ? 1 : 0,
        new Date().toISOString(),
        templateData.id
      ]);
      return { id: templateData.id, ...templateData };
    } else {
      // Insert new template
      const sql = `INSERT INTO email_templates (
        id, templateName, subject, htmlContent, textContent, variables, category, isDefault, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await this.execute(sql, [
        templateId,
        templateData.templateName,
        templateData.subject,
        templateData.htmlContent,
        templateData.textContent || null,
        JSON.stringify(templateData.variables || []),
        templateData.category || null,
        templateData.isDefault ? 1 : 0,
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      return { id: templateId, ...templateData };
    }
  }

  async getEmailTemplates(category = null) {
    let sql = "SELECT * FROM email_templates";
    const params = [];
    
    if (category) {
      sql += " WHERE category = ?";
      params.push(category);
    }
    
    sql += " ORDER BY createdAt DESC";
    
    const rows = await this.query(sql, params);
    return rows.map((row) => this.parseEmailTemplate(row));
  }

  async getEmailTemplate(templateId) {
    const row = await this.queryOne("SELECT * FROM email_templates WHERE id = ?", [templateId]);
    return row ? this.parseEmailTemplate(row) : null;
  }

  async deleteEmailTemplate(templateId) {
    await this.execute("DELETE FROM email_templates WHERE id = ?", [templateId]);
    return true;
  }

  parseEmailTemplate(row) {
    return {
      id: row.id,
      templateName: row.templatename || row.templateName,
      subject: row.subject,
      htmlContent: row.htmlcontent || row.htmlContent,
      textContent: row.textcontent || row.textContent,
      variables: typeof row.variables === "string" ? JSON.parse(row.variables || "[]") : row.variables,
      category: row.category,
      isDefault: row.isdefault === 1 || row.isDefault === 1,
      createdAt: row.createdat || row.createdAt,
      updatedAt: row.updatedat || row.updatedAt,
    };
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

