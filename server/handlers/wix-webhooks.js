/**
 * Wix Webhooks Handler
 * Processes webhook events from Wix
 */

const { getToken, saveToken } = require('./wix-token-manager');

// JWT for webhook verification (if using JWT-signed webhooks)
let jwt;
try {
  jwt = require('jsonwebtoken');
} catch (e) {
  console.warn('⚠️  jsonwebtoken not installed - JWT webhook verification disabled');
  jwt = null;
}

/**
 * Verify webhook JWT signature
 */
function verifyWebhookJWT(jwtToken, publicKey) {
  if (!jwt || !publicKey) {
    return null; // JWT verification not available
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(jwtToken, publicKey, {
      algorithms: ['RS256', 'HS256']
    });
    return decoded;
  } catch (error) {
    console.error('❌ JWT verification failed:', error.message);
    return null;
  }
}

/**
 * Parse webhook payload (handles both JWT and plain JSON formats)
 */
function parseWebhookPayload(rawBody, publicKey) {
  // Try JWT format first (Wix signed webhooks)
  if (publicKey && jwt) {
    try {
      console.log('🔐 Attempting JWT verification...');
      const decoded = verifyWebhookJWT(rawBody, publicKey);
      if (decoded && decoded.data) {
        console.log('✅ JWT verified successfully');
        
        // Parse the nested JSON strings
        const event = typeof decoded.data === 'string' 
          ? JSON.parse(decoded.data) 
          : decoded.data;
        
        const eventData = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data;

        console.log('📦 Parsed event:', {
          eventType: event.eventType,
          instanceId: event.instanceId || decoded.instanceId,
          hasData: !!eventData
        });

        return {
          eventType: event.eventType,
          instanceId: event.instanceId || decoded.instanceId,
          data: eventData,
          verified: true
        };
      } else {
        console.warn('⚠️  JWT decoded but no data field found');
      }
    } catch (e) {
      // JWT verification failed - log details but continue to try plain JSON
      console.log('⚠️  JWT verification failed, trying plain JSON format:', e.message);
      if (e.message.includes('invalid signature')) {
        console.error('❌ JWT signature invalid - check public key matches Wix Dashboard');
      } else if (e.message.includes('expired')) {
        console.error('❌ JWT token expired');
      }
    }
  } else if (!publicKey) {
    console.log('⚠️  No public key provided - skipping JWT verification');
  } else if (!jwt) {
    console.log('⚠️  jsonwebtoken package not available - skipping JWT verification');
  }

  // Try plain JSON format (for backward compatibility or if JWT verification failed)
  try {
    console.log('📄 Attempting plain JSON parsing...');
    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    console.log('✅ Plain JSON parsed successfully');
    return {
      eventType: event.eventType || event.type,
      instanceId: event.instanceId || event.metadata?.instanceId,
      data: event.data || event,
      verified: false
    };
  } catch (e) {
    throw new Error(`Failed to parse webhook payload as JWT or JSON: ${e.message}`);
  }
}

/**
 * Verify webhook signature (legacy method, kept for backward compatibility)
 */
function verifyWebhookSignature(req, secret) {
  // TODO: Implement webhook signature verification for non-JWT webhooks
  // Wix may provide signature in headers
  return true; // Placeholder
}

/**
 * Process webhook event
 */
async function processWebhookEvent(event) {
  const { eventType, instanceId, data } = event;

  console.log(`📥 Webhook received: ${eventType} for instance: ${instanceId}`);

  try {
    // Map Wix webhook event names to handlers
    switch (eventType) {
      // Site events
      case 'site.published':
      case 'Site properties updated':
        await handleSitePublished(instanceId, data);
        break;

      // Product events
      case 'store.product.created':
      case 'Product created':
      case 'Product changed':
      case 'store.product.updated':
        await handleProductChange(instanceId, 'store.product.updated', data);
        break;

      case 'Product deleted':
      case 'store.product.deleted':
        await handleProductDeleted(instanceId, data);
        break;

      // Product collection events
      case 'Product collection created':
      case 'Product collection changed':
      case 'Product collection deleted':
        await handleCollectionChange(instanceId, eventType, data);
        break;

      // Order events
      case 'store.order.created':
      case 'Order created':
      case 'New Order':
        await handleOrderChange(instanceId, 'store.order.created', data);
        break;

      case 'Order Updated':
      case 'store.order.updated':
        await handleOrderChange(instanceId, 'store.order.updated', data);
        break;

      case 'Order Paid':
      case 'Order Marked As Paid':
        await handleOrderPaid(instanceId, data);
        break;

      case 'Order Canceled':
      case 'Order Canceled':
        await handleOrderCanceled(instanceId, data);
        break;

      case 'Order Refunded':
        await handleOrderRefunded(instanceId, data);
        break;

      // App instance events
      case 'App Installed':
        await handleAppInstalled(instanceId, data);
        break;

      case 'App Removed':
        await handleAppRemoved(instanceId, data);
        break;

      // App Permission events (JWT format)
      case 'wix.devcenter.apps.v1.app_permission_created':
      case 'app.permission.created':
      case 'App Permission Created':
        await handleAppPermissionCreated(instanceId, data);
        break;

      case 'wix.devcenter.apps.v1.app_permission_updated':
      case 'app.permission.updated':
      case 'App Permission Updated':
        await handleAppPermissionUpdated(instanceId, data);
        break;

      case 'wix.devcenter.apps.v1.app_permission_deleted':
      case 'app.permission.deleted':
      case 'App Permission Deleted':
        await handleAppPermissionDeleted(instanceId, data);
        break;

      case 'Paid Plan Purchased':
        await handlePaidPlanPurchased(instanceId, data);
        break;

      case 'Paid Plan Auto Renewal Cancelled':
        await handlePaidPlanCancelled(instanceId, data);
        break;

      case 'Paid Plan Changed':
        await handlePaidPlanChanged(instanceId, data);
        break;

      // Page events
      case 'pages.page.created':
      case 'pages.page.updated':
        await handlePageChange(instanceId, eventType, data);
        break;

      // Blog events
      case 'Blog Post Created':
      case 'Post Updated':
      case 'Blog Post Deleted':
        await handleBlogPostChange(instanceId, eventType, data);
        break;

      // Blog Category events
      case 'blog.category.created':
      case 'Blog Category Created':
      case 'Category Created':
        await handleBlogCategoryCreated(instanceId, data);
        break;

      case 'blog.category.updated':
      case 'Blog Category Updated':
      case 'Category Updated':
        await handleBlogCategoryUpdated(instanceId, data);
        break;

      case 'blog.category.deleted':
      case 'Blog Category Deleted':
      case 'Category Deleted':
        await handleBlogCategoryDeleted(instanceId, data);
        break;

      // Form events
      case 'Form Submitted / Lead Generated':
      case 'Submission Created':
        await handleFormSubmitted(instanceId, data);
        break;

      // Contact events
      case 'Contact Created':
      case 'Contact Updated':
        await handleContactChange(instanceId, eventType, data);
        break;

      // Cart events
      case 'Cart created':
      case 'Cart abandoned':
        await handleCartEvent(instanceId, eventType, data);
        break;

      default:
        console.log(`⚠️  Unhandled webhook event: ${eventType}`);
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error(`❌ Error processing webhook ${eventType}:`, error);
    throw error;
  }
}

/**
 * Handle site published event
 */
async function handleSitePublished(instanceId, data) {
  console.log(`✅ Site published: ${instanceId}`);
  
  // Update token metadata
  const token = await getToken(instanceId);
  if (token) {
    token.metadata = {
      ...token.metadata,
      lastPublished: new Date().toISOString(),
      siteUrl: data.siteUrl || token.metadata.siteUrl
    };
    await saveToken(token);
  }

  // Trigger SEO audit
  // TODO: Queue SEO audit job
}

/**
 * Handle product changes
 */
async function handleProductChange(instanceId, eventType, data) {
  console.log(`📦 Product ${eventType}:`, data.productId);
  
  // Sync product to external systems
  // TODO: Implement product sync logic
  
  // Update SEO for product page
  if (eventType === 'store.product.created') {
    // TODO: Auto-optimize product SEO
  }
}

/**
 * Handle order changes
 */
async function handleOrderChange(instanceId, eventType, data) {
  console.log(`🛒 Order ${eventType}:`, data.orderId);
  
  // Update order status in external systems
  // TODO: Implement order sync logic
  
  // Send notifications
  if (eventType === 'store.order.created') {
    // TODO: Send order confirmation
  }
}

/**
 * Handle page changes
 */
async function handlePageChange(instanceId, eventType, data) {
  console.log(`📄 Page ${eventType}:`, data.pageId);
  
  // Auto-optimize page SEO
  if (eventType === 'pages.page.created' || eventType === 'pages.page.updated') {
    // TODO: Trigger SEO optimization
  }
}

/**
 * Handle product deletion
 */
async function handleProductDeleted(instanceId, data) {
  console.log(`🗑️  Product deleted:`, data.productId);
  
  // Clean up SEO data
  // TODO: Remove from sitemap, archive SEO data
}

/**
 * Handle collection changes
 */
async function handleCollectionChange(instanceId, eventType, data) {
  console.log(`📦 Collection ${eventType}:`, data.collectionId);
  
  // Sync collection data
  // TODO: Update collection SEO, sync to external systems
}

/**
 * Handle order paid
 */
async function handleOrderPaid(instanceId, data) {
  console.log(`💰 Order paid:`, data.orderId);
  
  // Trigger post-purchase automations
  // TODO: Send thank you emails, update customer records
}

/**
 * Handle order canceled
 */
async function handleOrderCanceled(instanceId, data) {
  console.log(`❌ Order canceled:`, data.orderId);
  
  // Handle cancellation
  // TODO: Update inventory, notify customer
}

/**
 * Handle order refunded
 */
async function handleOrderRefunded(instanceId, data) {
  console.log(`↩️  Order refunded:`, data.orderId);
  
  // Track refunds
  // TODO: Update financial records, restore inventory
}

/**
 * Handle app installed
 */
async function handleAppInstalled(instanceId, data) {
  console.log(`✅ App installed on site:`, instanceId);
  
  // Initialize app
  // TODO: Set up default settings, create initial data
}

/**
 * Handle app removed
 */
async function handleAppRemoved(instanceId, data) {
  console.log(`🗑️  App removed from site:`, instanceId);
  
  // Clean up
  // TODO: Archive data, remove webhooks
}

/**
 * Handle app permission created
 */
async function handleAppPermissionCreated(instanceId, data) {
  console.log(`🔐 App permission created:`, data.permissionId || data.id);
  
  const permissionData = {
    permissionId: data.permissionId || data.id,
    permissionName: data.permissionName || data.name,
    permissionType: data.permissionType || data.type,
    granted: data.granted !== false,
    instanceId: instanceId,
    createdAt: new Date().toISOString()
  };

  // Update app permissions in database
  const token = await getToken(instanceId);
  if (token) {
    token.metadata = {
      ...token.metadata,
      permissions: {
        ...(token.metadata.permissions || {}),
        [permissionData.permissionName]: permissionData
      },
      lastPermissionUpdate: new Date().toISOString()
    };
    await saveToken(token);
    console.log(`✅ Updated permissions for instance: ${instanceId}`);
  }

  console.log(`✅ Processed app permission creation:`, permissionData);
}

/**
 * Handle app permission updated
 */
async function handleAppPermissionUpdated(instanceId, data) {
  console.log(`🔐 App permission updated:`, data.permissionId || data.id);
  
  const permissionData = {
    permissionId: data.permissionId || data.id,
    permissionName: data.permissionName || data.name,
    permissionType: data.permissionType || data.type,
    granted: data.granted !== false,
    instanceId: instanceId,
    updatedAt: new Date().toISOString()
  };

  // Update app permissions in database
  const token = await getToken(instanceId);
  if (token) {
    token.metadata = {
      ...token.metadata,
      permissions: {
        ...(token.metadata.permissions || {}),
        [permissionData.permissionName]: permissionData
      },
      lastPermissionUpdate: new Date().toISOString()
    };
    await saveToken(token);
    console.log(`✅ Updated permissions for instance: ${instanceId}`);
  }

  console.log(`✅ Processed app permission update:`, permissionData);
}

/**
 * Handle app permission deleted
 */
async function handleAppPermissionDeleted(instanceId, data) {
  console.log(`🔐 App permission deleted:`, data.permissionId || data.id);
  
  const permissionData = {
    permissionId: data.permissionId || data.id,
    permissionName: data.permissionName || data.name,
    instanceId: instanceId,
    deletedAt: new Date().toISOString()
  };

  // Remove permission from database
  const token = await getToken(instanceId);
  if (token && token.metadata?.permissions) {
    delete token.metadata.permissions[permissionData.permissionName];
    token.metadata.lastPermissionUpdate = new Date().toISOString();
    await saveToken(token);
    console.log(`✅ Removed permission for instance: ${instanceId}`);
  }

  console.log(`✅ Processed app permission deletion:`, permissionData);
}

/**
 * Handle paid plan purchased
 */
async function handlePaidPlanPurchased(instanceId, data) {
  console.log(`💳 Paid plan purchased:`, data.planId);
  
  // Upgrade user
  const { getToken, saveToken } = require('./wix-token-manager');
  const token = await getToken(instanceId);
  if (token) {
    token.metadata = {
      ...token.metadata,
      hasPaidPlan: true,
      planId: data.planId,
      planPurchasedAt: new Date().toISOString()
    };
    await saveToken(token);
  }
}

/**
 * Handle paid plan cancelled
 */
async function handlePaidPlanCancelled(instanceId, data) {
  console.log(`❌ Paid plan cancelled:`, instanceId);
  
  // Downgrade user
  const { getToken, saveToken } = require('./wix-token-manager');
  const token = await getToken(instanceId);
  if (token) {
    token.metadata = {
      ...token.metadata,
      hasPaidPlan: false,
      planCancelledAt: new Date().toISOString()
    };
    await saveToken(token);
  }
}

/**
 * Handle paid plan changed
 */
async function handlePaidPlanChanged(instanceId, data) {
  console.log(`🔄 Paid plan changed:`, data.newPlanId);
  
  // Update plan
  const { getToken, saveToken } = require('./wix-token-manager');
  const token = await getToken(instanceId);
  if (token) {
    token.metadata = {
      ...token.metadata,
      planId: data.newPlanId,
      planChangedAt: new Date().toISOString()
    };
    await saveToken(token);
  }
}

/**
 * Handle blog post changes
 */
async function handleBlogPostChange(instanceId, eventType, data) {
  console.log(`📝 Blog post ${eventType}:`, data.postId);
  
  // Auto-optimize blog SEO
  // TODO: Generate meta descriptions, optimize titles
}

/**
 * Handle blog category created
 */
async function handleBlogCategoryCreated(instanceId, data) {
  console.log(`📂 Blog category created:`, data.categoryId || data.id);
  
  const categoryData = {
    categoryId: data.categoryId || data.id,
    name: data.name || data.title,
    slug: data.slug || data.urlSlug,
    description: data.description,
    createdAt: new Date().toISOString()
  };

  // Auto-optimize category SEO
  // TODO: Generate meta descriptions, optimize category page SEO
  
  console.log(`✅ Processed blog category creation:`, categoryData);
}

/**
 * Handle blog category updated
 */
async function handleBlogCategoryUpdated(instanceId, data) {
  console.log(`📂 Blog category updated:`, data.categoryId || data.id);
  
  const categoryData = {
    categoryId: data.categoryId || data.id,
    name: data.name || data.title,
    slug: data.slug || data.urlSlug,
    description: data.description,
    updatedAt: new Date().toISOString()
  };

  // Update category SEO
  // TODO: Refresh SEO metadata for category page
  
  console.log(`✅ Processed blog category update:`, categoryData);
}

/**
 * Handle blog category deleted
 */
async function handleBlogCategoryDeleted(instanceId, data) {
  console.log(`📂 Blog category deleted:`, data.categoryId || data.id);
  
  const categoryData = {
    categoryId: data.categoryId || data.id,
    deletedAt: new Date().toISOString()
  };

  // Clean up category SEO data
  // TODO: Archive SEO data, update sitemap
  
  console.log(`✅ Processed blog category deletion:`, categoryData);
}

/**
 * Handle form submissions
 */
async function handleFormSubmitted(instanceId, data) {
  console.log(`📋 Form submitted:`, data.formId, data.submissionId);
  
  // Capture leads
  // TODO: Add to CRM, send notifications
}

/**
 * Handle contact changes
 */
async function handleContactChange(instanceId, eventType, data) {
  console.log(`👤 Contact ${eventType}:`, data.contactId);
  
  // Sync contacts
  // TODO: Update CRM records, trigger workflows
}

/**
 * Handle cart events
 */
async function handleCartEvent(instanceId, eventType, data) {
  console.log(`🛒 Cart ${eventType}:`, data.cartId);
  
  // Track cart activity
  // TODO: Send cart recovery emails, analytics
}

/**
 * Webhook endpoint handler
 */
module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Read request body - Wix sends JWT tokens as text/plain
    // Vercel serverless functions: req.body may be undefined for non-JSON content types
    // We need to read the raw body from the request stream
    let rawBody = req.body;
    
    // Log request details for debugging
    console.log('📥 Webhook request received:', {
      method: req.method,
      contentType: req.headers['content-type'],
      bodyType: typeof rawBody,
      bodyLength: typeof rawBody === 'string' ? rawBody.length : 'N/A',
      hasBody: !!rawBody,
      url: req.url,
      path: req.url?.split('?')[0],
      route: 'wix/webhooks'
    });
    
    // Verify this is actually a webhook request (not a regular API call)
    if (req.query?.action || req.body?.action) {
      console.error('❌ Webhook endpoint received API request with action parameter');
      console.error('   This suggests routing issue - webhook should not have action parameter');
      return res.status(400).json({ 
        error: 'Invalid request format for webhook endpoint',
        hint: 'Webhooks do not use action parameters. Check routing configuration.'
      });
    }

    // For text/plain content (JWT tokens), Vercel doesn't auto-parse the body
    // We need to read it from the request stream if not already available
    if (!rawBody || (typeof rawBody === 'object' && Object.keys(rawBody).length === 0)) {
      // Read raw body from stream (for Vercel serverless functions)
      try {
        if (req.on && typeof req.on === 'function') {
          rawBody = await new Promise((resolve, reject) => {
            let bodyData = '';
            req.on('data', chunk => {
              bodyData += chunk.toString('utf8');
            });
            req.on('end', () => {
              resolve(bodyData || '');
            });
            req.on('error', reject);
          });
          console.log('📖 Read body from stream:', { length: rawBody.length });
        } else if (typeof req.body === 'string') {
          rawBody = req.body;
        } else {
          console.error('❌ Cannot read request body - no stream available');
          return res.status(400).json({ 
            error: 'Request body could not be read',
            contentType: req.headers['content-type'],
            bodyType: typeof req.body
          });
        }
      } catch (streamError) {
        console.error('❌ Error reading request body stream:', streamError);
        return res.status(400).json({ 
          error: 'Failed to read request body',
          message: streamError.message
        });
      }
    }

    // Convert to string if it's not already
    if (typeof rawBody !== 'string') {
      // If it's an object, it means Vercel parsed it as JSON (shouldn't happen for text/plain)
      if (typeof rawBody === 'object') {
        console.warn('⚠️  Body is an object instead of string - trying to convert');
        rawBody = JSON.stringify(rawBody);
      } else {
        rawBody = String(rawBody);
      }
    }

    // Ensure rawBody is not empty
    if (!rawBody || rawBody.trim().length === 0) {
      console.error('❌ Empty request body');
      return res.status(400).json({ 
        error: 'Request body is empty',
        contentType: req.headers['content-type']
      });
    }

    // Trim whitespace
    rawBody = rawBody.trim();
    
    console.log('✅ Body received:', { 
      length: rawBody.length, 
      preview: rawBody.substring(0, 100),
      isJWT: rawBody.startsWith('eyJ') || rawBody.includes('.')
    });

    // Get Wix public key for JWT verification (from environment variable)
    // Format should be the full PEM public key
    const wixPublicKey = process.env.WIX_WEBHOOK_PUBLIC_KEY || process.env.WIX_PUBLIC_KEY;
    
    if (!wixPublicKey) {
      console.warn('⚠️  WIX_WEBHOOK_PUBLIC_KEY not set - JWT verification will be skipped');
      console.warn('   Set WIX_WEBHOOK_PUBLIC_KEY environment variable in Vercel');
    }
    
    // Parse webhook payload (handles both JWT and plain JSON)
    let event;
    try {
      event = parseWebhookPayload(rawBody, wixPublicKey);
    } catch (error) {
      console.error('❌ Failed to parse webhook payload:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        rawBodyLength: rawBody.length,
        rawBodyPreview: rawBody.substring(0, 200),
        hasPublicKey: !!wixPublicKey
      });
      
      // Return error response that Wix can understand
      return res.status(400).json({ 
        error: 'Invalid webhook payload',
        message: error.message,
        hint: wixPublicKey ? 'JWT verification may have failed' : 'WIX_WEBHOOK_PUBLIC_KEY not configured'
      });
    }

    // Log received webhook for debugging
    console.log('📥 Received webhook:', {
      eventType: event.eventType,
      instanceId: event.instanceId,
      verified: event.verified,
      hasData: !!event.data
    });

    // Verify webhook signature (for non-JWT webhooks)
    if (!event.verified) {
      const webhookSecret = process.env.WIX_WEBHOOK_SECRET;
      if (webhookSecret && !verifyWebhookSignature(req, webhookSecret)) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const result = await processWebhookEvent(event);

    // Return success response (200 OK with empty body for Wix compatibility)
    res.status(200).send('OK');
    return;

  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

