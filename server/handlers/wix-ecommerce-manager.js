/**
 * Wix E-commerce Management Module
 * Manages products, inventory, orders, and advanced filtering for Wix stores
 */

const { createWixClient } = require('./wix-api-client');

/**
 * Get all products with pagination
 * Uses real Wix Stores Products API
 */
async function getProducts(instanceId, options = {}) {
  try {
    const client = createWixClient(instanceId);
    
    // Use Wix Stores Products Query API
    // Reference: https://dev.wix.com/api/rest/wix-stores/catalog/products/query-products
    const requestBody = {
      query: {
        paging: {
          limit: options.limit || 50,
          offset: options.offset || 0
        }
      }
    };
    
    // Add filters if provided
    if (options.filters) {
      requestBody.query.filter = options.filters;
    }
    
    const response = await client.post('/stores/v1/products/query', requestBody);
    
    console.log(`✅ Retrieved ${response.products?.length || 0} products`);
    
    return {
      products: response.products || [],
      metadata: response.metadata || {},
      totalCount: response.metadata?.totalCount || 0
    };
    
  } catch (error) {
    console.error('❌ Error getting products:', error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please reconnect the Wix client.');
    } else if (error.response?.status === 403) {
      throw new Error('Permission denied. Make sure the app has "Manage Stores" permissions.');
    } else {
      throw new Error(`Failed to get products: ${error.message}`);
    }
  }
}

/**
 * Get product by ID
 */
async function getProduct(instanceId, productId) {
  try {
    const client = createWixClient(instanceId);
    
    const product = await client.get(`/stores/v1/products/${productId}`);
    
    console.log(`✅ Retrieved product: ${productId}`);
    return product;
    
  } catch (error) {
    console.error('❌ Error getting product:', error);
    throw error;
  }
}

/**
 * Create new product
 */
async function createProduct(instanceId, productData) {
  try {
    const client = createWixClient(instanceId);
    
    const product = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      costAndProfit: {
        cost: productData.cost,
        profit: productData.profit
      },
      weight: productData.weight,
      sku: productData.sku,
      visible: productData.visible !== false,
      productType: productData.productType || 'physical',
      media: {
        items: productData.images?.map((url, index) => ({
          mediaType: 'IMAGE',
          url: url,
          index: index
        })) || []
      },
      stock: {
        trackInventory: productData.trackInventory !== false,
        inStock: productData.inStock !== false,
        quantity: productData.quantity || 0
      },
      customTextFields: productData.customTextFields || [],
      productOptions: productData.variants || [],
      collections: productData.collections || [],
      brand: productData.brand,
      ribbon: productData.ribbon
    };
    
    const result = await client.post('/stores/v1/products', { product });
    
    console.log(`✅ Created product: ${result.product.id}`);
    return result.product;
    
  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }
}

/**
 * Update product
 */
async function updateProduct(instanceId, productId, updates) {
  try {
    const client = createWixClient(instanceId);
    
    const result = await client.patch(`/stores/v1/products/${productId}`, {
      product: updates
    });
    
    console.log(`✅ Updated product: ${productId}`);
    return result.product;
    
  } catch (error) {
    console.error('❌ Error updating product:', error);
    throw error;
  }
}

/**
 * Bulk update products
 */
async function bulkUpdateProducts(instanceId, productUpdates) {
  try {
    const results = [];
    
    for (const update of productUpdates) {
      try {
        const result = await updateProduct(instanceId, update.productId, update.data);
        results.push({ productId: update.productId, success: true, data: result });
      } catch (error) {
        results.push({ productId: update.productId, success: false, error: error.message });
      }
    }
    
    console.log(`✅ Bulk update completed: ${results.filter(r => r.success).length}/${results.length} successful`);
    return results;
    
  } catch (error) {
    console.error('❌ Error in bulk update:', error);
    throw error;
  }
}

/**
 * Delete product
 */
async function deleteProduct(instanceId, productId) {
  try {
    const client = createWixClient(instanceId);
    
    await client.delete(`/stores/v1/products/${productId}`);
    
    console.log(`✅ Deleted product: ${productId}`);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    throw error;
  }
}

/**
 * Update inventory for product
 */
async function updateInventory(instanceId, productId, variantId, quantity) {
  try {
    const client = createWixClient(instanceId);
    
    const updates = {
      inventoryItem: {
        quantity: quantity,
        variantId: variantId
      }
    };
    
    const result = await client.patch(`/stores/v1/inventory/products/${productId}`, updates);
    
    console.log(`✅ Updated inventory for product: ${productId}`);
    return result;
    
  } catch (error) {
    console.error('❌ Error updating inventory:', error);
    throw error;
  }
}

/**
 * Get product inventory
 */
async function getInventory(instanceId, productId) {
  try {
    const client = createWixClient(instanceId);
    
    const inventory = await client.get(`/stores/v1/inventory/products/${productId}`);
    
    console.log(`✅ Retrieved inventory for product: ${productId}`);
    return inventory;
    
  } catch (error) {
    console.error('❌ Error getting inventory:', error);
    throw error;
  }
}

/**
 * Get collections
 * Uses real Wix Stores Collections API
 */
async function getCollections(instanceId) {
  try {
    const client = createWixClient(instanceId);
    
    // Use Wix Stores Collections Query API
    // Reference: https://dev.wix.com/api/rest/wix-stores/catalog/collections/query-collections
    const requestBody = {
      query: {
        paging: {
          limit: 100,
          offset: 0
        }
      }
    };
    
    const response = await client.post('/stores/v1/collections/query', requestBody);
    
    console.log(`✅ Retrieved ${response.collections?.length || 0} collections`);
    
    return {
      collections: response.collections || [],
      metadata: response.metadata || {}
    };
    
  } catch (error) {
    console.error('❌ Error getting collections:', error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please reconnect the Wix client.');
    } else if (error.response?.status === 403) {
      throw new Error('Permission denied. Make sure the app has "Manage Stores" permissions.');
    } else {
      throw new Error(`Failed to get collections: ${error.message}`);
    }
  }
}

/**
 * Create advanced product filter
 * Uses real Wix Stores Query with filters
 */
async function createAdvancedFilter(instanceId, filterConfig) {
  try {
    const client = createWixClient(instanceId);
    
    // Build Wix filter query based on configuration
    // Reference: https://dev.wix.com/api/rest/wix-stores/catalog/products/query-products
    const filter = {};
    
    // Price range filter
    if (filterConfig.priceRange) {
      filter.price = {
        $gte: String(filterConfig.priceRange.min),
        $lte: String(filterConfig.priceRange.max)
      };
    }
    
    // Collection filter
    if (filterConfig.collections && filterConfig.collections.length > 0) {
      filter.collectionIds = {
        $hasSome: filterConfig.collections
      };
    }
    
    // In stock filter
    if (filterConfig.inStockOnly) {
      filter['stock.inStock'] = true;
    }
    
    // Brand filter
    if (filterConfig.brands && filterConfig.brands.length > 0) {
      filter.brand = {
        $in: filterConfig.brands
      };
    }
    
    const requestBody = {
      query: {
        filter: filter,
        paging: {
          limit: 50,
          offset: 0
        }
      }
    };
    
    // Add sorting if specified
    if (filterConfig.sort) {
      requestBody.query.sort = filterConfig.sort;
    }
    
    const response = await client.post('/stores/v1/products/query', requestBody);
    
    console.log(`✅ Advanced filter returned ${response.products?.length || 0} products`);
    
    return {
      products: response.products || [],
      metadata: response.metadata || {},
      totalCount: response.metadata?.totalCount || 0,
      appliedFilters: filterConfig
    };
    
  } catch (error) {
    console.error('❌ Error creating advanced filter:', error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please reconnect the Wix client.');
    } else if (error.response?.status === 403) {
      throw new Error('Permission denied. Make sure the app has "Manage Stores" permissions.');
    } else {
      throw new Error(`Failed to filter products: ${error.message}`);
    }
  }
}

/**
 * Get orders
 */
async function getOrders(instanceId, options = {}) {
  try {
    const client = createWixClient(instanceId);
    
    const params = {
      limit: options.limit || 100,
      offset: options.offset || 0
    };
    
    if (options.status) {
      params.status = options.status;
    }
    
    const orders = await client.get('/stores/v1/orders/query', { params });
    
    console.log(`✅ Retrieved ${orders.orders?.length || 0} orders`);
    return orders;
    
  } catch (error) {
    console.error('❌ Error getting orders:', error);
    throw error;
  }
}

/**
 * Update order status
 */
async function updateOrderStatus(instanceId, orderId, status) {
  try {
    const client = createWixClient(instanceId);
    
    const result = await client.patch(`/stores/v1/orders/${orderId}`, {
      order: {
        fulfillmentStatus: status
      }
    });
    
    console.log(`✅ Updated order ${orderId} status to: ${status}`);
    return result.order;
    
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
}

/**
 * Sync products to external platform
 */
async function syncProductsToExternal(instanceId, platform, productIds = []) {
  try {
    console.log(`🔄 Syncing ${productIds.length || 'all'} products to ${platform}`);
    
    // Get products to sync
    let products;
    if (productIds.length > 0) {
      products = await Promise.all(
        productIds.map(id => getProduct(instanceId, id))
      );
    } else {
      const allProducts = await getProducts(instanceId);
      products = allProducts.products || [];
    }
    
    // This would integrate with external platforms (Shopify, Amazon, etc.)
    // For now, return the products that would be synced
    console.log(`✅ Prepared ${products.length} products for ${platform} sync`);
    
    return {
      platform,
      productsCount: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price
      }))
    };
    
  } catch (error) {
    console.error('❌ Error syncing products:', error);
    throw error;
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  bulkUpdateProducts,
  deleteProduct,
  updateInventory,
  getInventory,
  getCollections,
  createAdvancedFilter,
  getOrders,
  updateOrderStatus,
  syncProductsToExternal
};

