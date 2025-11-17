/**
 * Wix Verification Module
 * Verifies that changes were actually applied to Wix
 */

const { createWixClient } = require('./wix-api-client');

/**
 * Verify product was updated
 */
async function verifyProductUpdate(instanceId, productId, expectedChanges) {
  try {
    const client = createWixClient(instanceId);
    
    // Fetch the product from Wix
    const product = await client.get(`/stores/v1/products/${productId}`);
    
    const verification = {
      productId,
      verified: true,
      mismatches: []
    };
    
    // Check each expected change
    for (const [key, expectedValue] of Object.entries(expectedChanges)) {
      const actualValue = product.product?.[key];
      
      if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
        verification.verified = false;
        verification.mismatches.push({
          field: key,
          expected: expectedValue,
          actual: actualValue
        });
      }
    }
    
    if (verification.verified) {
      console.log(`✅ VERIFICATION PASSED: Product ${productId} matches expected changes`);
    } else {
      console.log(`⚠️ VERIFICATION FAILED: Product ${productId} has mismatches`);
      console.log(`   Mismatches:`, verification.mismatches);
    }
    
    return verification;
    
  } catch (error) {
    console.error(`❌ Verification failed:`, error.message);
    return {
      productId,
      verified: false,
      error: error.message
    };
  }
}

/**
 * Get change summary for display
 */
async function getChangeSummary(instanceId) {
  try {
    const { getRecentChanges } = require('./wix-api-logger');
    const changes = getRecentChanges(100);
    
    // Filter changes for this instance
    const instanceChanges = changes.filter(c => c.instanceId === instanceId);
    
    return {
      totalChanges: instanceChanges.length,
      changes: instanceChanges.map(c => ({
        timestamp: c.timestamp,
        operation: c.operation,
        entityType: c.entityType,
        entityId: c.entityId,
        changes: c.changes
      }))
    };
    
  } catch (error) {
    console.error(`❌ Failed to get change summary:`, error.message);
    return {
      totalChanges: 0,
      changes: []
    };
  }
}

module.exports = {
  verifyProductUpdate,
  getChangeSummary
};

