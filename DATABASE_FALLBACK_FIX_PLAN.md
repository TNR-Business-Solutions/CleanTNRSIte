# 🔧 Database Fallback Issue - Fix Plan
**Date:** December 9, 2025  
**Status:** ⚠️ Critical Issue - Needs Immediate Attention  
**Priority:** 🔴 **CRITICAL**

---

## 📊 **Problem Summary**

### The Issue:
The database falls back to SQLite on Vercel when Neon Postgres initialization fails. This causes:
- **Data loss** - SQLite can't write on Vercel's read-only filesystem
- **Token persistence failures** - Tokens appear to save but are lost
- **Wix integration failures** - "No tokens found" errors
- **CRM data loss** - Leads, clients, orders not persisting

### Root Cause:
When Neon Postgres initialization fails (for any reason), the code falls back to SQLite. However:
- Vercel's filesystem is **read-only** and **ephemeral**
- SQLite requires write access to create/update database files
- Data written to SQLite is lost when the serverless function ends

---

## 🔍 **Current Code Analysis**

### Location: `database.js`

#### Current Behavior (Lines 40-120):
```javascript
async initialize() {
  const isVercel = !!process.env.VERCEL;
  const isProduction = process.env.NODE_ENV === 'production' || isVercel;

  if (this.usePostgres) {
    try {
      // Initialize Neon Postgres
      this.postgres = new Pool({
        connectionString: process.env.POSTGRES_URL,
      });
      await this.createTables();
      return;
    } catch (err) {
      // ⚠️ PROBLEM: Falls back to SQLite even on Vercel
      if (isProduction) {
        throw new Error(...); // ✅ Good - throws error
      }
      // ❌ BAD: Falls back to SQLite in development
      console.warn("⚠️  Falling back to SQLite (local development only)");
      this.usePostgres = false;
    }
  }

  if (!this.usePostgres) {
    if (isProduction) {
      throw new Error("SQLite cannot be used on Vercel/production");
    }
    // SQLite initialization...
  }
}
```

### ✅ **Good News:**
The code **already has protection** against SQLite fallback on Vercel (lines 83-88, 99-103). It throws an error instead of falling back.

### ⚠️ **The Real Problem:**
The issue is that **Neon Postgres initialization is failing silently** or the error is being caught somewhere else, causing the fallback to trigger before the production check.

---

## 🔍 **Why Neon Might Be Failing**

### Potential Causes:

1. **Missing Environment Variable**
   - `POSTGRES_URL` not set in Vercel
   - `POSTGRES_URL` set incorrectly
   - Connection string format wrong

2. **Neon Driver Issues**
   - Driver not loaded correctly
   - Version incompatibility
   - Pool initialization failing

3. **Table Creation Failures**
   - SQL syntax incompatible with Neon
   - Permissions issues
   - Connection timeout

4. **Network/Connection Issues**
   - Neon region mismatch
   - Firewall blocking connection
   - SSL/TLS configuration

---

## 🔧 **Fix Strategy**

### Phase 1: Enhanced Error Logging & Diagnostics ✅

**Goal:** Understand exactly why Neon is failing

**Changes Needed:**
1. Add comprehensive error logging
2. Add connection health check
3. Add diagnostic endpoint
4. Log environment variable status (without exposing secrets)

### Phase 2: Fix Neon Initialization Issues ✅

**Goal:** Ensure Neon Postgres initializes correctly

**Changes Needed:**
1. Verify `POSTGRES_URL` format
2. Test Neon Pool connection
3. Fix any SQL syntax issues
4. Add retry logic for transient failures

### Phase 3: Remove SQLite Fallback (Production) ✅

**Goal:** Prevent any possibility of SQLite fallback on Vercel

**Changes Needed:**
1. Remove SQLite fallback code path for production
2. Fail fast with clear error messages
3. Add health check endpoint

### Phase 4: Add Monitoring & Alerts ✅

**Goal:** Detect database issues early

**Changes Needed:**
1. Add database health check endpoint
2. Log database type on every request
3. Alert on SQLite fallback attempts

---

## 📝 **Detailed Fix Plan**

### Step 1: Add Enhanced Error Logging

**File:** `database.js`

**Changes:**
```javascript
async initialize() {
  const isVercel = !!process.env.VERCEL;
  const isProduction = process.env.NODE_ENV === 'production' || isVercel;

  // Log environment status (without exposing secrets)
  console.log("🔍 Database Init:", {
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    postgresUrlLength: process.env.POSTGRES_URL?.length || 0,
    isVercel,
    isProduction,
    nodeEnv: process.env.NODE_ENV
  });

  if (this.usePostgres) {
    try {
      // Validate POSTGRES_URL exists
      if (!process.env.POSTGRES_URL) {
        throw new Error("POSTGRES_URL environment variable is not set");
      }

      // Validate POSTGRES_URL format
      if (!process.env.POSTGRES_URL.startsWith('postgresql://') && 
          !process.env.POSTGRES_URL.startsWith('postgres://')) {
        throw new Error("POSTGRES_URL must start with postgresql:// or postgres://");
      }

      // Initialize Neon Pool
      console.log("🔄 Initializing Neon Postgres Pool...");
      this.postgres = new Pool({
        connectionString: process.env.POSTGRES_URL,
      });

      // Test connection before creating tables
      console.log("🔄 Testing Neon connection...");
      await this.postgres.query('SELECT 1 as test');
      console.log("✅ Neon connection test successful");

      // Create tables
      console.log("🔄 Creating database tables...");
      await this.createTables();
      console.log("✅ Database tables created successfully");
      
      return;
    } catch (err) {
      // Enhanced error logging
      console.error("❌ Postgres initialization FAILED:", {
        message: err.message,
        code: err.code,
        stack: err.stack?.split('\n').slice(0, 5).join('\n'),
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        postgresUrlPrefix: process.env.POSTGRES_URL?.substring(0, 20) + '...',
        isVercel,
        isProduction
      });

      // On Vercel/production, NEVER fall back to SQLite
      if (isProduction) {
        const errorMsg = `🚨 CRITICAL: Postgres initialization failed on production. ` +
          `Error: ${err.message}. ` +
          `SQLite fallback is NOT available on Vercel. ` +
          `Please check POSTGRES_URL environment variable in Vercel dashboard.`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Only fall back to SQLite in local development
      console.warn("⚠️  Falling back to SQLite (local development only)");
      this.usePostgres = false;
    }
  }

  // SQLite path - only for local development
  if (!this.usePostgres) {
    if (isProduction) {
      throw new Error(
        "SQLite cannot be used on Vercel/production. " +
        "Please set POSTGRES_URL environment variable for production deployment."
      );
    }
    // ... SQLite initialization
  }
}
```

### Step 2: Add Database Health Check Endpoint

**File:** `api/db-health.js` (new file)

**Purpose:** Diagnostic endpoint to check database status

```javascript
const TNRDatabase = require('../database');

module.exports = async (req, res) => {
  try {
    const db = new TNRDatabase();
    
    // Get database info without initializing
    const info = {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      postgresUrlLength: process.env.POSTGRES_URL?.length || 0,
      isVercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
      databaseType: 'unknown'
    };

    // Try to initialize and get type
    try {
      await db.initialize();
      info.databaseType = db.usePostgres ? 'Neon Postgres' : 'SQLite';
      info.status = 'connected';
      
      // Test query
      if (db.usePostgres) {
        const result = await db.postgres.query('SELECT NOW() as current_time');
        info.testQuery = 'success';
        info.currentTime = result.rows[0]?.current_time;
      }
    } catch (initError) {
      info.status = 'failed';
      info.error = initError.message;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      database: info
    }, null, 2));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: error.message
    }));
  }
};
```

### Step 3: Fix createTables() Method

**File:** `database.js`

**Check for:**
- SQL syntax compatibility with Neon
- Proper error handling
- Transaction support

**Common Issues:**
- `AUTOINCREMENT` vs `SERIAL` (already fixed per previous reports)
- Missing column migrations
- Table creation order dependencies

### Step 4: Verify Vercel Environment Variables

**Check in Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Verify `POSTGRES_URL` is set
3. Verify format: `postgresql://user:password@host/database?sslmode=require`
4. Check if variable is available in Production environment

---

## 🧪 **Testing Plan**

### Test 1: Local Development
```bash
# Should use SQLite (no POSTGRES_URL)
node -e "require('./database.js')"
# Expected: "✅ Using SQLite database (local development)"
```

### Test 2: Local with POSTGRES_URL
```bash
# Set POSTGRES_URL
export POSTGRES_URL="postgresql://..."
node -e "require('./database.js')"
# Expected: "✅ Using Neon Postgres database (Pool)"
```

### Test 3: Vercel Deployment
1. Deploy to Vercel
2. Check logs for database initialization
3. Call `/api/db-health` endpoint
4. Verify: `databaseType: "Neon Postgres"`
5. Verify: No "Falling back to SQLite" messages

### Test 4: Error Handling
1. Temporarily break `POSTGRES_URL` in Vercel
2. Deploy and test
3. Verify: Error thrown (not SQLite fallback)
4. Verify: Clear error message in logs

---

## 📋 **Checklist**

### Immediate Actions:
- [ ] Add enhanced error logging to `database.js`
- [ ] Create `/api/db-health` diagnostic endpoint
- [ ] Verify `POSTGRES_URL` in Vercel dashboard
- [ ] Test database initialization locally
- [ ] Deploy and check Vercel logs

### Verification:
- [ ] No "Falling back to SQLite" in production logs
- [ ] `/api/db-health` shows "Neon Postgres"
- [ ] Database operations succeed
- [ ] Tokens persist across function invocations

### Long-term:
- [ ] Remove SQLite dependency (optional, for production)
- [ ] Add database connection pooling monitoring
- [ ] Set up alerts for database failures

---

## 🚨 **Critical Notes**

1. **NEVER allow SQLite fallback on Vercel** - The code already prevents this, but we need to ensure Neon never fails
2. **Fail fast** - If Neon fails, throw error immediately (don't try to recover)
3. **Clear error messages** - Help diagnose the root cause
4. **Monitor logs** - Watch for any SQLite fallback attempts

---

## 📊 **Expected Outcomes**

### Success Criteria:
- ✅ Neon Postgres initializes successfully on Vercel
- ✅ No SQLite fallback messages in logs
- ✅ Database operations succeed
- ✅ Tokens persist across invocations
- ✅ `/api/db-health` shows healthy status

### Failure Indicators:
- ❌ "Falling back to SQLite" in logs
- ❌ "SQLITE_READONLY" errors
- ❌ Data not persisting
- ❌ "No tokens found" errors

---

## 🔗 **Related Files**

- `database.js` - Main database abstraction
- `WIX_STATUS_AND_PLAN.md` - Previous investigation
- `SQLITE_REMOVAL_PLAN.md` - Removal strategy
- `server/handlers/wix-token-manager.js` - Token persistence

---

## 📝 **Next Steps**

1. **Review this plan** - Confirm approach
2. **Implement enhanced logging** - Add diagnostic information
3. **Create health check endpoint** - For monitoring
4. **Test locally** - Verify changes work
5. **Deploy to Vercel** - Test in production
6. **Monitor logs** - Verify no SQLite fallback
7. **Verify data persistence** - Test token saving

---

**Status:** Ready for Implementation  
**Estimated Time:** 1-2 hours  
**Priority:** 🔴 **CRITICAL**
