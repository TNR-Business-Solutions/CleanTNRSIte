# Wix Automation App - Complete Setup & Testing Guide

## 📋 Overview

This is a comprehensive **Wix Multi-Client Automation Platform** that allows you to manage multiple Wix client sites from a single dashboard. It provides automation for:

- 🎯 **SEO Optimization** - Meta tags, sitemaps, structured data
- 🛒 **E-commerce Management** - Products, inventory, orders, advanced filtering
- 📱 **Social Media Integration** - Connect to your existing social media automation
- 🔄 **Multi-Platform Sync** - Sync products to Shopify, Amazon, etc.
- 📊 **Client Management** - Manage multiple Wix clients from one dashboard

## 🎯 Perfect For

- **Your Client:** www.shesallthatandmore.com (needs SEO upgrade & advanced filtering)
- **Future Clients:** Any business using Wix for e-commerce, bookings, restaurants, etc.
- **Your Business:** TNR Business Solutions automation services

---

## 🚀 Quick Start

### Step 1: Wix App Configuration (Already Done ✅)

Your Wix app is already created with:
- **App ID:** `9901133d-7490-4e6e-adfd-cb11615cc5e4`
- **App Secret:** `87fd621b-f3d2-4b2f-b085-2c4f00a17b97`
- **Permissions:** All necessary permissions have been added

### Step 2: Update Environment Variables

Add these to your `.env` file or Vercel environment variables:

```env
# Wix App Configuration
WIX_APP_ID=9901133d-7490-4e6e-adfd-cb11615cc5e4
WIX_APP_SECRET=87fd621b-f3d2-4b2f-b085-2c4f00a17b97
WIX_REDIRECT_URI=http://localhost:3000/api/auth/wix/callback

# For production (Vercel)
WIX_REDIRECT_URI=https://yourdomain.com/api/auth/wix/callback
```

### Step 3: Update Wix App Settings

1. **Go to:** https://dev.wix.com/apps/[your-app-id]/oauth
2. **Update Redirect URL to:**
   - Development: `http://localhost:3000/api/auth/wix/callback`
   - Production: `https://yourdomain.com/api/auth/wix/callback`

### Step 4: Start the Server

```bash
# Local development
cd server
npm install
npm start

# Or from root
npm start
```

The server will start on `http://localhost:3000`

### Step 5: Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000/wix-client-dashboard.html
```

---

## 🔗 Connecting Your First Client (www.shesallthatandmore.com)

### Option 1: Via Dashboard (Recommended)

1. Open: `http://localhost:3000/wix-client-dashboard.html`
2. Click **"Connect New Wix Client"**
3. Enter client identifier: `shesallthatandmore`
4. You'll be redirected to Wix OAuth
5. Log in with the Wix account that owns www.shesallthatandmore.com
6. Authorize the app
7. You'll be redirected back to the dashboard

### Option 2: Direct URL

Navigate directly to:
```
http://localhost:3000/api/auth/wix?clientId=shesallthatandmore
```

### After Connection

✅ The client will appear in your dashboard
✅ You can now manage SEO, products, and more
✅ The access token is automatically managed (never expires!)

---

## 📚 Feature Documentation

### 1. SEO Automation (`/wix-seo-manager.html`)

#### Available Functions:

- **SEO Audit**
  - Analyzes all pages for SEO issues
  - Checks title length (30-60 chars)
  - Checks description length (120-160 chars)
  - Identifies missing keywords

- **Site-wide SEO**
  - Update global site title, description, keywords
  - Applies to all pages as defaults

- **Auto-Optimize**
  - Automatically generates optimized SEO for pages
  - Based on page content and best practices

#### API Endpoints:

```javascript
// Run SEO audit
POST /api/wix
{
  "action": "auditSiteSEO",
  "instanceId": "your-instance-id"
}

// Update site SEO
POST /api/wix
{
  "action": "updateSiteSEO",
  "instanceId": "your-instance-id",
  "seoData": {
    "title": "Site Title",
    "description": "Site description...",
    "keywords": ["keyword1", "keyword2"]
  }
}

// Update page SEO
POST /api/wix
{
  "action": "updatePageSEO",
  "instanceId": "your-instance-id",
  "pageId": "page-id",
  "seoData": {
    "title": "Page Title",
    "description": "Page description...",
    "keywords": ["keyword1"]
  }
}
```

### 2. E-commerce Management (`/wix-ecommerce-manager.html`)

#### Available Functions:

- **Product Management**
  - View all products with images
  - Create new products
  - Update product details
  - Bulk update multiple products
  - Delete products

- **Advanced Filtering**
  - Filter by price range
  - Filter by collection
  - Filter by stock status
  - Filter by brand
  - Custom field filters

- **Inventory Management**
  - Update stock quantities
  - Track inventory across variants
  - Low stock alerts

- **Order Management**
  - View all orders
  - Update order status
  - Fulfillment tracking

#### API Endpoints:

```javascript
// Get all products
POST /api/wix
{
  "action": "getProducts",
  "instanceId": "your-instance-id",
  "options": {
    "limit": 100,
    "offset": 0
  }
}

// Create product
POST /api/wix
{
  "action": "createProduct",
  "instanceId": "your-instance-id",
  "productData": {
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "sku": "SKU123",
    "quantity": 100
  }
}

// Advanced filter
POST /api/wix
{
  "action": "createAdvancedFilter",
  "instanceId": "your-instance-id",
  "filterConfig": {
    "priceRange": { "min": 0, "max": 100 },
    "inStockOnly": true,
    "collections": ["collection-id"],
    "brands": ["Brand Name"]
  }
}

// Sync to external platform
POST /api/wix
{
  "action": "syncProductsToExternal",
  "instanceId": "your-instance-id",
  "platform": "shopify",
  "productIds": []  // empty = sync all
}
```

### 3. Client Management API

```javascript
// List all connected clients
GET /api/wix?action=listClients

// Get client details
POST /api/wix
{
  "action": "getClientDetails",
  "instanceId": "your-instance-id"
}
```

---

## 🧪 Testing Guide

### Test 1: Connect www.shesallthatandmore.com

1. Open dashboard
2. Click "Connect New Wix Client"
3. Enter: `shesallthatandmore`
4. Complete OAuth flow
5. Verify client appears in dashboard

### Test 2: Run SEO Audit

1. Go to SEO Manager
2. Select "shesallthatandmore" client
3. Click "Run Full SEO Audit"
4. Review results for issues

### Test 3: Update Site SEO

1. In SEO Manager, fill in:
   - Title: "She's All That And More - Boutique Shopping"
   - Description: "Discover unique fashion, accessories, and gifts at She's All That And More. Premium quality boutique items for every style."
   - Keywords: "boutique, fashion, accessories, gifts, women's clothing"
2. Click "Update Site SEO"
3. Verify success message

### Test 4: View Products

1. Go to E-commerce Manager
2. Select "shesallthatandmore" client
3. Products should load in grid view
4. Verify images, prices, and SKUs display correctly

### Test 5: Apply Advanced Filter

1. In E-commerce Manager
2. Set price range: $0 - $50
3. Select "In Stock Only"
4. Click "Apply Filters"
5. Verify filtered results

### Test 6: Multi-Platform Sync (Preparation)

1. Click "Sync to Shopify"
2. Review list of products to be synced
3. (Actual sync requires Shopify API setup)

---

## 📊 Database Structure (Current: In-Memory)

### Client Tokens

```javascript
{
  instanceId: "wix-instance-id",
  accessToken: "wix-access-token",
  refreshToken: "wix-refresh-token",
  expiresAt: timestamp,
  metadata: {
    clientId: "shesallthatandmore",
    instanceDetails: {...}
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### ⚠️ Important: Production Database

For production, replace the in-memory storage with PostgreSQL:

```javascript
// Replace Map with database queries
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Store token
await pool.query(
  'INSERT INTO wix_clients (instance_id, access_token, ...) VALUES ($1, $2, ...)',
  [instanceId, accessToken, ...]
);
```

---

## 🔧 Advanced Configuration

### Custom Permissions

The app already has extensive permissions. To add more:

1. Go to: https://dev.wix.com/apps/[your-app-id]/permissions
2. Select additional permission scopes
3. Save changes
4. Clients will be prompted to re-authorize

### Webhooks (Optional)

Set up webhooks to receive real-time updates:

1. Go to: https://dev.wix.com/apps/[your-app-id]/webhooks
2. Add webhook endpoint: `https://yourdomain.com/api/wix/webhooks`
3. Select events to monitor:
   - Product created/updated
   - Order created/updated
   - Inventory updated

---

## 🚀 Deployment to Vercel

### Step 1: Update Environment Variables

In Vercel dashboard, add:
```
WIX_APP_ID=9901133d-7490-4e6e-adfd-cb11615cc5e4
WIX_APP_SECRET=87fd621b-f3d2-4b2f-b085-2c4f00a17b97
WIX_REDIRECT_URI=https://yourdomain.com/api/auth/wix/callback
```

### Step 2: Update Wix App Redirect URI

Change redirect URI in Wix Dev Console to:
```
https://yourdomain.com/api/auth/wix/callback
```

### Step 3: Deploy

```bash
vercel --prod
```

---

## 📱 Client Installation Instructions

### For Your Clients (e.g., shesallthatandmore.com)

1. **Receive Installation Link**
   ```
   https://yourdomain.com/api/auth/wix?clientId=their-unique-id
   ```

2. **Click Link**
   - Opens Wix OAuth page
   - Shows requested permissions

3. **Authorize App**
   - Log in to Wix (if not already)
   - Click "Authorize"

4. **Done!**
   - App is installed
   - You can now manage their site

---

## 🎯 Client-Specific Setup: www.shesallthatandmore.com

### Priority Tasks:

1. **SEO Upgrade**
   ```javascript
   // Run audit first
   action: "auditSiteSEO"
   
   // Fix identified issues
   action: "bulkUpdatePagesSEO"
   
   // Add structured data for products
   // (automatically generated when products are updated)
   ```

2. **Advanced Product Filtering**
   ```javascript
   // Set up filters on their site
   // These work through the API you've built
   createAdvancedFilter({
     priceRange: { min: 0, max: 500 },
     collections: [...],
     brands: [...],
     inStockOnly: true
   })
   ```

3. **Multi-Platform Integration**
   ```javascript
   // Prepare for Shopify/Amazon sync
   syncProductsToExternal({
     platform: "shopify",
     productIds: [] // all products
   })
   ```

---

## 🐛 Troubleshooting

### Issue: "No tokens found for instance"
**Solution:** Client needs to reconnect via OAuth flow

### Issue: "Token refresh failed"
**Solution:** Client needs to re-authorize the app

### Issue: Wix API returns 401
**Solution:** Check that permissions are still granted in Wix

### Issue: Can't load products
**Solution:** Verify the store has products and permissions are correct

---

## 📚 Additional Resources

- **Wix Developers:** https://dev.wix.com/
- **Wix API Documentation:** https://dev.wix.com/api/rest/
- **Your Wix App Dashboard:** https://dev.wix.com/apps/
- **Wix Community:** https://www.wix.com/community/

---

## ✅ Next Steps

1. **Test locally with shesallthatandmore.com**
2. **Deploy to Vercel**
3. **Update Wix app redirect URI**
4. **Install on client sites**
5. **Implement automated SEO improvements**
6. **Set up advanced filtering**
7. **Plan multi-platform integrations**

---

## 🔒 Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Validate all input** - Sanitize user data
3. **Use HTTPS in production** - Wix requires HTTPS for OAuth
4. **Store tokens securely** - Use encrypted database in production
5. **Implement rate limiting** - Protect against API abuse
6. **Log all actions** - For audit trail and debugging

---

## 📞 Support

For issues or questions:
- Check Wix Dev Console logs
- Review server logs (`server/index.js`)
- Test API endpoints with Postman
- Consult Wix API documentation

---

**Built by TNR Business Solutions**
**Version:** 1.0
**Last Updated:** 2025-01-17

