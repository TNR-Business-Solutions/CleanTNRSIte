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
    dbInstance = new TNRDatabase();
    await dbInstance.initialize();
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
    
    await db.saveWixToken(tokenData);
    return true;
  } catch (error) {
    console.error('❌ Could not save token to database:', error.message);
    console.error('   Error details:', error);
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
