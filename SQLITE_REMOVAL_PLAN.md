# SQLite Removal Plan

## Current Status

**SQLite is ONLY used as a fallback** when the Neon PostgreSQL database fails to initialize. It's not actually needed for production.

## What Depends on SQLite?

### 1. **database.js** (Primary Location)
- **Purpose**: Dual database support (SQLite for local dev, Neon for production)
- **Usage**: Fallback mechanism when `POSTGRES_URL` is not set or Neon fails
- **Line**: 5, 56-71, 404-450

### 2. **package.json**
- **Dependency**: `sqlite3` npm package
- **Only needed**: If keeping local development fallback

## Root Cause: Neon Driver Syntax Error

The reason SQLite keeps being used (even in production) is this error:
```
❌ Error creating table: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options)
```

**Location**: `database.js` line 388
**Previous Code**: `await this.postgres(tableSQL, [], {})`
**Fixed Code**: `await this.postgres(tableSQL)`

## Removal Plan

### ✅ Step 1: Fix Neon Syntax (DONE)
- Changed line 388 to remove extra parameters
- Neon driver should now initialize correctly

### Step 2: Test Neon Connection
```bash
# Deploy to Vercel and test
git add .
git commit -m "Fix: Neon database driver syntax for table creation"
git push origin main
```

### Step 3: Verify No Fallback
- Check Vercel logs for "✅ Using Neon Postgres database"
- Should NOT see "Falling back to SQLite"
- Should NOT see "SQLITE_READONLY" errors

### Step 4: Remove SQLite (Optional)
Once Neon is confirmed working, you can:

**A. Remove SQLite Package**
```json
// package.json
"dependencies": {
  - "sqlite3": "^5.1.6"  // Remove this line
}
```

**B. Simplify database.js**
- Remove lines 5 (sqlite3 require)
- Remove lines 56-71 (SQLite initialization)
- Remove lines 404-450 (SQLite createTables)
- Remove all SQLite-specific code paths

**C. Or Keep SQLite for Local Dev**
- Useful if you want to develop without Neon credentials
- No harm in keeping it as optional fallback

## Why SQLite Appeared in Production

```
Environment: { hasPostgresUrl: true, hasDatabaseUrl: true, nodeEnv: 'devolopment' }
❌ Error creating table: [Neon syntax error]
Falling back to SQLite
❌ CRITICAL: Could not save token to database
Error message: SQLITE_READONLY: attempt to write a readonly database
```

**The Problem**:
1. Neon failed due to syntax error
2. Code fell back to SQLite
3. Vercel serverless = read-only filesystem
4. SQLite can't write to disk → tokens not saved
5. API calls fail with "No Metasite Context"

## Expected Behavior After Fix

```
Environment: { hasPostgresUrl: true, hasDatabaseUrl: true, nodeEnv: 'production' }
✅ Using Neon Postgres database
✅ All database tables created successfully
✅ Token saved to database for instance: a4890371-c6da-46f4-a830-9e19df999cf8
```

## Recommendation

**Keep SQLite for now** until we confirm Neon is 100% working in production. Once confirmed:
- Remove SQLite package to reduce bundle size
- Simplify `database.js` to Neon-only
- Remove local `tnr_database.db` file from .gitignore

## Testing Commands

```powershell
# 1. Commit and push the Neon fix
git add database.js
git commit -m "Fix: Neon serverless driver syntax for CREATE TABLE"
git push origin main

# 2. Wait for Vercel deployment (~1 minute)

# 3. Run OAuth to test token persistence
Start-Process "https://www.tnrbusinesssolutions.com/api/auth/wix"

# 4. Check Vercel logs for success
# Should see: ✅ Using Neon Postgres database
# Should NOT see: Falling back to SQLite
```

## Files That Reference SQLite

1. `database.js` - Main dual database implementation
2. `package.json` - SQLite dependency
3. `.gitignore` - Excludes `tnr_database.db`
4. `server/start-server.ps1` - No direct reference
5. `start-test-loop.ps1` - No direct reference

## Summary

**SQLite Dependencies**: Minimal (only `database.js` and `package.json`)
**Can Be Removed**: Yes, once Neon is confirmed working
**Should Be Removed Now**: No, wait for confirmation
**Impact of Removal**: ~5MB smaller bundle, cleaner code

The Neon syntax fix is now deployed. Let's test it!

