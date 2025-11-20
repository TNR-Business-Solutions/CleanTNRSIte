/**
 * Wix Token Manager
 * Manages persistent token storage using database (Postgres/SQLite)
 * Works in both local development and serverless environments
 */

const TNRDatabase = require('../../database');

// Global database instance (lazy initialized)
let dbInstance = null;

/**
 * Get or initialize database instance
 */
async function getDatabase() {
  if (!dbInstance) {
    console.log('🔧 Initializing database connection...');
    console.log('   POSTGRES_URL:', process.env.POSTGRES_URL ? 'Set' : 'Not set');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    dbInstance = new TNRDatabase();
    
    try {
      await dbInstance.initialize();
      console.log('✅ Database initialized successfully');
      console.log('   Using:', dbInstance.usePostgres ? 'Neon Postgres' : 'SQLite');
    } catch (initError) {
      console.error('❌ Database initialization failed:', initError.message);
      console.error('   Stack:', initError.stack);
      throw initError;
    }
  }
  return dbInstance;
}

/**
 * Load tokens from database into the in-memory Map
 * This maintains backward compatibility with existing code that uses clientTokensDB Map
 */
async function loadTokens(clientTokensDB) {
  try {
    const db = await getDatabase();
    
    // Ensure tables are created first
    try {
      await db.createTables();
    } catch (tableError) {
      // Table might already exist, that's okay
      if (!tableError.message.includes('already exists')) {
        console.warn('⚠️  Table creation warning:', tableError.message);
      }
    }
    
    const tokens = await db.getAllWixTokens();
    
    for (const token of tokens) {
      // Convert database format to Map format
      clientTokensDB.set(token.instanceId, {
        instanceId: token.instanceId,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: token.expiresAt || Date.now() + (10 * 365 * 24 * 60 * 60 * 1000), // Default 10 years if not set
        metadata: token.metadata || {},
        createdAt: token.createdAt || Date.now(),
        updatedAt: token.updatedAt || Date.now()
      });
    }
    
    console.log(`✅ Loaded ${tokens.length} Wix token(s) from database`);
    return tokens.length > 0;
  } catch (error) {
    console.warn('⚠️  Could not load tokens from database:', error.message);
    return false;
  }
}

/**
 * Save tokens to database
 * This saves all tokens from the in-memory Map to the database
 */
async function saveTokens(clientTokensDB) {
  try {
    const db = await getDatabase();
    let savedCount = 0;
    
    // Save each token from the Map to the database
    for (const [instanceId, tokenData] of clientTokensDB.entries()) {
      try {
        await db.saveWixToken({
          instanceId: tokenData.instanceId || instanceId,
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken || null,
          expiresAt: tokenData.expiresAt || null,
          metadata: tokenData.metadata || {}
        });
        savedCount++;
      } catch (error) {
        console.error(`❌ Error saving token for instance ${instanceId}:`, error.message);
      }
    }
    
    console.log(`✅ Saved ${savedCount} Wix token(s) to database`);
    return savedCount > 0;
  } catch (error) {
    console.error('❌ Could not save tokens to database:', error.message);
    return false;
  }
}

/**
 * Save a single token to database
 */
async function saveToken(tokenData) {
  try {
    console.log('💾 Attempting to save Wix token to database...');
    console.log('   Instance ID:', tokenData.instanceId);
    console.log('   Has access token:', !!tokenData.accessToken);
    console.log('   Database type:', process.env.POSTGRES_URL ? 'Neon Postgres' : 'SQLite');
    
    const db = await getDatabase();
    
    // Verify database is initialized
    if (!db) {
      throw new Error('Database instance is null');
    }
    
    // Check if using Postgres
    if (db.usePostgres && !db.postgres) {
      throw new Error('Postgres connection not established');
    }
    
    // Ensure tables are created (in case this is first run)
    try {
      console.log('🔧 Ensuring database tables exist...');
      await db.createTables();
      console.log('✅ Database tables verified');
    } catch (tableError) {
      // Table might already exist, that's okay
      if (!tableError.message.includes('already exists') && !tableError.message.includes('duplicate')) {
        console.error('⚠️  Table creation error:', tableError.message);
        console.error('   Stack:', tableError.stack);
        // Don't throw - try to save anyway in case tables exist
      } else {
        console.log('ℹ️  Tables already exist (expected)');
      }
    }
    
    // Save the token
    console.log('💾 Saving token to database...');
    const result = await db.saveWixToken(tokenData);
    console.log('✅ Token saved successfully:', {
      instanceId: result.instanceId,
      hasAccessToken: !!result.accessToken
    });
    
    // Verify it was saved by reading it back
    try {
      const verifyToken = await db.getWixToken(tokenData.instanceId);
      if (verifyToken && verifyToken.accessToken) {
        console.log('✅ Token verification: Successfully read back from database');
      } else {
        console.warn('⚠️  Token verification: Could not read token back from database');
      }
    } catch (verifyError) {
      console.warn('⚠️  Could not verify token save:', verifyError.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ CRITICAL: Could not save token to database');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    console.error('   Token data:', {
      instanceId: tokenData.instanceId,
      hasAccessToken: !!tokenData.accessToken,
      hasRefreshToken: !!tokenData.refreshToken
    });
    console.error('   Environment:', {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    });
    return false;
  }
}

/**
 * Get a single token from database
 */
async function getToken(instanceId) {
  try {
    const db = await getDatabase();
    
    // Ensure tables are created (in case this is first run)
    try {
      await db.createTables();
    } catch (tableError) {
      // Table might already exist, that's okay
      if (!tableError.message.includes('already exists')) {
        console.warn('⚠️  Table creation warning:', tableError.message);
      }
    }
    
    return await db.getWixToken(instanceId);
  } catch (error) {
    console.error('❌ Could not get token from database:', error.message);
    return null;
  }
}

/**
 * Delete a token from database
 */
async function deleteToken(instanceId) {
  try {
    const db = await getDatabase();
    await db.deleteWixToken(instanceId);
    return true;
  } catch (error) {
    console.error('❌ Could not delete token from database:', error.message);
    return false;
  }
}

module.exports = {
  loadTokens,
  saveTokens,
  saveToken,
  getToken,
  deleteToken
};
