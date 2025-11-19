/**
 * Wix Real Updates Module
 * Actually modifies Wix site data - NO DEMO DATA
 * All changes are real and visible in Wix
 */

const { createWixClient } = require('./wix-api-client');
const { logChange } = require('./wix-api-logger');

/**
 * Update product - REAL UPDATE
 * Changes are immediately visible in Wix
 */
async function updateProductReal(instanceId, productId, updates) {
  try {
    const client = createWixClient(instanceId);
    
    // First, get current product data
    const currentProduct = await client.get(`/stores/v1/products/${productId}`);
    
    console.log(`\n🔄 UPDATING PRODUCT: ${productId}`);
    console.log(`   Current Name: ${currentProduct.product?.name || 'N/A'}`);
    console.log(`   Updates to apply:`, JSON.stringify(updates, null, 2));
    
    // Prepare update payload
    const updatePayload = {
      product: {
        ...updates
      }
    };
    
    // Make the actual update
    const response = await client.patch(`/stores/v1/products/${productId}`, updatePayload);
    
    // Log the change
    logChange('UPDATE_PRODUCT', instanceId, {
      entityType: 'PRODUCT',
      entityId: productId,
      changes: updates,
      before: currentProduct.product,
      after: response.product
    });
    
    console.log(`✅ PRODUCT UPDATED SUCCESSFULLY`);
    console.log(`   New Name: ${response.product?.name || 'N/A'}`);
    console.log(`   View in Wix: https://www.wix.com/my-account/site-selector/?siteId=${instanceId}&appSection=Store`);
    
    return {
      success: true,
      product: response.product,
      changes: updates,
      message: `Product "${response.product?.name}" has been updated in Wix. Changes are live now.`
    };
    
  } catch (error) {
    console.error(`❌ Failed to update product ${productId}:`, error.message);
    throw error;
  }
}

/**
 * Update product SEO - REAL UPDATE
 */
async function updateProductSEO(instanceId, productId, seoData) {
  try {
    const client = createWixClient(instanceId);
    
    // Get current product
    const currentProduct = await client.get(`/stores/v1/products/${productId}`);
    
    console.log(`\n🔄 UPDATING PRODUCT SEO: ${productId}`);
    console.log(`   Product: ${currentProduct.product?.name || 'N/A'}`);
    console.log(`   SEO Updates:`, JSON.stringify(seoData, null, 2));
    
    // Update product with SEO data
    const updatePayload = {
      product: {
        seoData: {
          title: seoData.title,
          description: seoData.description,
          keywords: seoData.keywords || []
        }
      }
    };
    
    const response = await client.patch(`/stores/v1/products/${productId}`, updatePayload);
    
    // Log the change
    logChange('UPDATE_PRODUCT_SEO', instanceId, {
      entityType: 'PRODUCT_SEO',
      entityId: productId,
      changes: seoData,
      before: currentProduct.product?.seoData,
      after: response.product?.seoData
    });
    
    console.log(`✅ PRODUCT SEO UPDATED`);
    console.log(`   New SEO Title: ${response.product?.seoData?.title || 'N/A'}`);
    console.log(`   Changes are live in Wix now!`);
    
    return {
      success: true,
      product: response.product,
      seoData: response.product?.seoData,
      message: `SEO for "${response.product?.name}" has been updated. Check Wix to see changes.`
    };
    
  } catch (error) {
    console.error(`❌ Failed to update product SEO:`, error.message);
    throw error;
  }
}

/**
 * Bulk update products - REAL UPDATES
 */
async function bulkUpdateProductsReal(instanceId, updates) {
  const results = [];
  
  console.log(`\n🔄 BULK UPDATING ${updates.length} PRODUCTS`);
  
  for (const update of updates) {
    try {
      const result = await updateProductReal(instanceId, update.productId, update.data);
      results.push({
        productId: update.productId,
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        productId: update.productId,
        success: false,
        error: error.message
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n✅ BULK UPDATE COMPLETE: ${successCount}/${updates.length} successful`);
  
  return {
    total: updates.length,
    successful: successCount,
    failed: updates.length - successCount,
    results
  };
}

/**
 * Update inventory - REAL UPDATE
 */
async function updateInventoryReal(instanceId, productId, variantId, quantity) {
  try {
    const client = createWixClient(instanceId);
    
    // Get current inventory
    const currentInventory = await client.get(`/stores/v1/inventory/products/${productId}`);
    
    console.log(`\n🔄 UPDATING INVENTORY`);
    console.log(`   Product ID: ${productId}`);
    console.log(`   Variant ID: ${variantId}`);
    console.log(`   Current Quantity: ${currentInventory.inventoryItem?.quantity || 0}`);
    console.log(`   New Quantity: ${quantity}`);
    
    // Update inventory
    const updatePayload = {
      inventoryItem: {
        quantity: quantity,
        variantId: variantId
      }
    };
    
    const response = await client.patch(`/stores/v1/inventory/products/${productId}`, updatePayload);
    
    // Log the change
    logChange('UPDATE_INVENTORY', instanceId, {
      entityType: 'INVENTORY',
      entityId: productId,
      changes: { variantId, quantity },
      before: { quantity: currentInventory.inventoryItem?.quantity },
      after: { quantity: response.inventoryItem?.quantity }
    });
    
    console.log(`✅ INVENTORY UPDATED`);
    console.log(`   New Quantity: ${response.inventoryItem?.quantity}`);
    console.log(`   Changes are live in Wix now!`);
    
    return {
      success: true,
      inventoryItem: response.inventoryItem,
      message: `Inventory updated to ${quantity} units. Check Wix store to verify.`
    };
    
  } catch (error) {
    console.error(`❌ Failed to update inventory:`, error.message);
    throw error;
  }
}

module.exports = {
  updateProductReal,
  updateProductSEO,
  bulkUpdateProductsReal,
  updateInventoryReal
};

