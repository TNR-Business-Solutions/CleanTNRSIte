/**
 * Wix Token Manager
 * Manages persistent token storage
 */

const fs = require('fs');
const path = require('path');
const TOKENS_FILE = path.join(__dirname, '..', 'wix-tokens.json');

/**
 * Load tokens from persistent storage
 */
function loadTokens(clientTokensDB) {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const data = fs.readFileSync(TOKENS_FILE, 'utf8');
      const tokens = JSON.parse(data);
      for (const [instanceId, tokenData] of Object.entries(tokens)) {
        clientTokensDB.set(instanceId, tokenData);
      }
      console.log(`✅ Loaded ${clientTokensDB.size} client token(s) from persistent storage`);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('⚠️  Could not load tokens from file:', error.message);
    return false;
  }
}

/**
 * Save tokens to persistent storage
 */
function saveTokens(clientTokensDB) {
  try {
    const tokens = {};
    for (const [instanceId, tokenData] of clientTokensDB.entries()) {
      tokens[instanceId] = tokenData;
    }
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Could not save tokens to file:', error.message);
    return false;
  }
}

module.exports = {
  loadTokens,
  saveTokens,
  TOKENS_FILE
};

