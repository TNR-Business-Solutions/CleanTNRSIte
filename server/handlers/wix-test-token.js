/**
 * Wix Token Diagnostic Tool
 * Tests database connection and token persistence
 */

const TNRDatabase = require('../../database');

module.exports = async (req, res) => {
  const logs = [];
  
  function log(message, data = null) {
    const entry = data ? `${message}: ${JSON.stringify(data, null, 2)}` : message;
    logs.push(entry);
    console.log(entry);
  }
  
  try {
    log('=== WIX TOKEN DIAGNOSTIC ===');
    log('Environment Check', {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Test 1: Initialize database
    log('\n📊 Test 1: Initialize Database');
    const db = new TNRDatabase();
    await db.initialize();
    log('✅ Database initialized', {
      usePostgres: db.usePostgres,
      hasPostgresConnection: !!db.postgres,
      hasSqliteConnection: !!db.db
    });
    
    // Test 2: Create tables
    log('\n📊 Test 2: Create Tables');
    try {
      await db.createTables();
      log('✅ Tables created successfully');
    } catch (tableError) {
      if (tableError.message.includes('already exists')) {
        log('ℹ️  Tables already exist (expected)');
      } else {
        log('❌ Table creation failed', {
          error: tableError.message,
          stack: tableError.stack
        });
      }
    }
    
    // Test 3: List all tokens
    log('\n📊 Test 3: List All Tokens');
    const tokens = await db.getAllWixTokens();
    log(`Found ${tokens.length} token(s)`, tokens.map(t => ({
      instanceId: t.instanceId,
      hasAccessToken: !!t.accessToken,
      accessTokenPreview: t.accessToken ? t.accessToken.substring(0, 30) + '...' : 'none',
      expiresAt: t.expiresAt ? new Date(t.expiresAt).toISOString() : 'never',
      metadata: t.metadata
    })));
    
    // Test 4: Check for specific instance if provided
    const { instanceId } = req.query;
    if (instanceId) {
      log('\n📊 Test 4: Get Specific Token', { instanceId });
      const token = await db.getWixToken(instanceId);
      if (token) {
        log('✅ Token found', {
          instanceId: token.instanceId,
          hasAccessToken: !!token.accessToken,
          accessTokenLength: token.accessToken?.length || 0,
          accessTokenPreview: token.accessToken ? token.accessToken.substring(0, 50) + '...' : 'none',
          hasRefreshToken: !!token.refreshToken,
          expiresAt: token.expiresAt ? new Date(token.expiresAt).toISOString() : 'never',
          metadata: token.metadata
        });
      } else {
        log('❌ Token not found for instance:', instanceId);
      }
    }
    
    log('\n✅ All diagnostics completed successfully');
    
    res.status(200).json({
      success: true,
      message: 'Diagnostic completed',
      logs,
      summary: {
        database: db.usePostgres ? 'Neon Postgres' : 'SQLite',
        tokensFound: tokens.length,
        environment: {
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          nodeEnv: process.env.NODE_ENV
        }
      }
    });
    
  } catch (error) {
    log('\n❌ Diagnostic failed', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      logs
    });
  }
};
