/**
 * Wix API Routes Handler
 * Central router for all Wix automation endpoints
 */

const seoModule = require('./wix-seo-automation');
const ecommerceModule = require('./wix-ecommerce-manager');
const realUpdates = require('./wix-real-updates');
const verification = require('./wix-verification');
const keywordsModule = require('./wix-seo-keywords');
const { clientTokensDB } = require('./wix-api-client');

/**
 * Handle Wix API requests
 */
module.exports = async (req, res) => {
  try {
    // Support both POST body and GET query parameters
    const action = req.body?.action || req.query?.action;
    const instanceId = req.body?.instanceId || req.query?.instanceId;
    
    console.log(`🎯 Wix API Request received`);
    console.log(`   Method: ${req.method}`);
    console.log(`   Action: ${action || 'MISSING'}`);
    console.log(`   Instance ID: ${instanceId || 'N/A'}`);
    console.log(`   Body keys: ${req.body ? Object.keys(req.body).join(', ') : 'none'}`);
    console.log(`   Query keys: ${req.query ? Object.keys(req.query).join(', ') : 'none'}`);
    
    if (!action) {
      console.error('❌ Missing action parameter');
      return res.status(400).json({ error: 'Missing action parameter' });
    }
    
    if (!instanceId && !['listClients', 'getClients', 'getChangeSummary'].includes(action)) {
      console.error(`❌ Missing instanceId for action: ${action}`);
      return res.status(400).json({ error: `Missing instanceId parameter for action: ${action}` });
    }
    
    let result;
    
    // Client Management Actions
    if (action === 'listClients' || action === 'getClients') {
      const clients = Array.from(clientTokensDB.entries()).map(([id, data]) => ({
        instanceId: id,
        clientId: data.metadata?.clientId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        hasValidToken: data.expiresAt > Date.now()
      }));
      return res.json({ success: true, clients });
    }
    
    if (action === 'getClientDetails') {
      // Try to get from in-memory cache first
      let clientData = clientTokensDB.get(instanceId);
      
      // If not in memory, try loading from database
      if (!clientData) {
        console.log(`🔍 Client data not in memory, checking database for instance: ${instanceId}`);
        try {
          const tokenManager = require('./wix-token-manager');
          const dbToken = await tokenManager.getToken(instanceId);
          
          if (dbToken) {
            // Convert database format to Map format
            clientData = {
              instanceId: dbToken.instanceId,
              accessToken: dbToken.accessToken,
              refreshToken: dbToken.refreshToken,
              expiresAt: dbToken.expiresAt || Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
              metadata: dbToken.metadata || {},
              createdAt: dbToken.createdAt || Date.now(),
              updatedAt: dbToken.updatedAt || Date.now(),
            };
            
            // Cache in memory
            clientTokensDB.set(instanceId, clientData);
            console.log(`✅ Loaded client data from database`);
          }
        } catch (error) {
          console.error(`❌ Error loading client data from database:`, error.message);
        }
      }
      
      if (!clientData) {
        return res.status(404).json({ error: 'Client not found. Please reconnect the Wix client.' });
      }
      
      // Use metasite ID from metadata if available
      const actualInstanceId = clientData.metadata?.metasiteId || instanceId;
      
      return res.json({
        success: true,
        client: {
          instanceId: actualInstanceId,
          originalInstanceId: instanceId,
          clientId: clientData.metadata?.clientId,
          createdAt: clientData.createdAt,
          updatedAt: clientData.updatedAt,
          expiresAt: clientData.expiresAt,
          hasValidToken: clientData.expiresAt > Date.now(),
          instanceDetails: clientData.metadata?.instanceDetails,
          metadataMetasiteId: clientData.metadata?.metasiteId || 'N/A'
        }
      });
    }
    
    // SEO Actions
    if (action === 'getSiteSEO') {
      result = await seoModule.getSiteSEO(instanceId);
    } else if (action === 'updateSiteSEO') {
      result = await seoModule.updateSiteSEO(instanceId, req.body.seoData);
    } else if (action === 'getPageSEO') {
      result = await seoModule.getPageSEO(instanceId, req.body.pageId);
    } else if (action === 'updatePageSEO') {
      result = await seoModule.updatePageSEO(instanceId, req.body.pageId, req.body.seoData);
    } else if (action === 'bulkUpdatePagesSEO') {
      result = await seoModule.bulkUpdatePagesSEO(instanceId, req.body.pageUpdates);
    } else if (action === 'auditSiteSEO') {
      result = await seoModule.auditSiteSEO(instanceId);
    } else if (action === 'autoOptimizeSEO') {
      result = await seoModule.autoOptimizeSEO(instanceId, req.body.pageId);
    } else if (action === 'getSitemapData') {
      result = await seoModule.getSitemapData(instanceId);
    } else if (action === 'getKeywordSuggestions') {
      result = await keywordsModule.getKeywordSuggestions(instanceId, req.body.params || {});
      // Update quota usage
      await keywordsModule.updateQuotaUsage(instanceId, 1);
    } else if (action === 'getQuotaInfo') {
      result = await keywordsModule.getQuotaInfo(instanceId);
    } else if (action === 'trackPageView') {
      // Track page view from embedded script
      result = { success: true, message: 'Page view tracked' };
      console.log('📊 Page view tracked:', req.body.pageData);
    } else if (action === 'trackSEOMetrics') {
      // Track SEO metrics from embedded script
      result = { success: true, message: 'SEO metrics tracked' };
      console.log('📈 SEO metrics tracked:', req.body.metrics);
    } else if (action === 'trackWebVital') {
      // Track Web Vitals from embedded script
      result = { success: true, message: 'Web Vital tracked' };
      console.log('⚡ Web Vital tracked:', req.body.metric, req.body.value);
    } else if (action === 'trackEvent') {
      // Track custom events from embedded script
      result = { success: true, message: 'Event tracked' };
      console.log('🎯 Event tracked:', req.body.eventName, req.body.eventData);
    }
    
    // E-commerce Actions
    else if (action === 'getProducts') {
      result = await ecommerceModule.getProducts(instanceId, req.body.options);
    } else if (action === 'getProduct') {
      result = await ecommerceModule.getProduct(instanceId, req.body.productId);
    } else if (action === 'createProduct') {
      result = await ecommerceModule.createProduct(instanceId, req.body.productData);
    } else if (action === 'updateProduct') {
      result = await ecommerceModule.updateProduct(instanceId, req.body.productId, req.body.updates);
    } else if (action === 'bulkUpdateProducts') {
      result = await ecommerceModule.bulkUpdateProducts(instanceId, req.body.productUpdates);
    } else if (action === 'deleteProduct') {
      result = await ecommerceModule.deleteProduct(instanceId, req.body.productId);
    } else if (action === 'updateInventory') {
      result = await ecommerceModule.updateInventory(instanceId, req.body.productId, req.body.variantId, req.body.quantity);
    } else if (action === 'getInventory') {
      result = await ecommerceModule.getInventory(instanceId, req.body.productId);
    } else if (action === 'getCollections') {
      result = await ecommerceModule.getCollections(instanceId);
    } else if (action === 'createAdvancedFilter') {
      result = await ecommerceModule.createAdvancedFilter(instanceId, req.body.filterConfig);
    } else if (action === 'getOrders') {
      result = await ecommerceModule.getOrders(instanceId, req.body.options);
    } else if (action === 'updateOrderStatus') {
      result = await ecommerceModule.updateOrderStatus(instanceId, req.body.orderId, req.body.status);
    } else if (action === 'syncProductsToExternal') {
      result = await ecommerceModule.syncProductsToExternal(instanceId, req.body.platform, req.body.productIds);
    }
    
    // Real Update Actions (actually modify Wix data)
    else if (action === 'updateProductReal') {
      result = await realUpdates.updateProductReal(instanceId, req.body.productId, req.body.updates);
    } else if (action === 'updateProductSEO') {
      result = await realUpdates.updateProductSEO(instanceId, req.body.productId, req.body.seoData);
    } else if (action === 'bulkUpdateProductsReal') {
      result = await realUpdates.bulkUpdateProductsReal(instanceId, req.body.updates);
    } else if (action === 'updateInventoryReal') {
      result = await realUpdates.updateInventoryReal(instanceId, req.body.productId, req.body.variantId, req.body.quantity);
    }
    
    // Verification Actions
    else if (action === 'verifyProductUpdate') {
      if (!instanceId) {
        return res.status(400).json({ error: 'Missing instanceId parameter' });
      }
      result = await verification.verifyProductUpdate(instanceId, req.body.productId, req.body.expectedChanges);
    } else if (action === 'getChangeSummary') {
      // getChangeSummary can work without instanceId (shows all changes)
      result = await verification.getChangeSummary(instanceId || req.body.instanceId || null);
    }
    
    else {
      console.error(`❌ Unknown action: ${action}`);
      return res.status(400).json({ error: `Unknown action: ${action}` });
    }
    
    if (result === undefined) {
      console.warn(`⚠️  Action ${action} completed but returned undefined`);
      result = { message: 'Action completed but no data returned' };
    }
    
    console.log(`✅ Action ${action} completed successfully`);
    res.json({ success: true, data: result });
    
  } catch (error) {
    console.error('❌ Wix API Route Error:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || null,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

