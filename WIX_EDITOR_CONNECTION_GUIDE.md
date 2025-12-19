# Wix Editor Connection Guide
## Connect to Wix Studio Editor Programmatically

This guide shows you how to connect to the Wix Studio editor programmatically using OAuth, REST API, and CLI commands.

---

## 🎯 Overview

You can connect to Wix sites programmatically using:
1. **OAuth 2.0** - For authentication and authorization
2. **Wix REST API** - For managing site content, pages, products, etc.
3. **Wix CLI** - For command-line operations
4. **Velo** - For server-side code within Wix sites

---

## 📋 Prerequisites

1. ✅ Wix App created in [Wix Developers Center](https://dev.wix.com/)
2. ✅ App ID and App Secret configured
3. ✅ OAuth redirect URI set up
4. ✅ At least one Wix site connected via OAuth

---

## 🔐 Step 1: OAuth Connection

### Connect a Wix Site

**Via Dashboard:**
1. Go to: `http://localhost:3000/wix-client-dashboard.html`
2. Click "Connect New Wix Client"
3. Enter client identifier (e.g., `shesallthatandmore`)
4. Complete OAuth flow

**Via Direct URL:**
```
http://localhost:3000/api/auth/wix?clientId=shesallthatandmore
```

**Via CLI:**
```bash
node wix-cli-commands.js connect shesallthatandmore
```

### OAuth Flow Process

1. **Initiation:** User visits OAuth URL
2. **Authorization:** User authorizes app in Wix
3. **Callback:** Wix redirects with authorization code
4. **Token Exchange:** Server exchanges code for access token
5. **Storage:** Tokens stored securely (database + memory cache)

---

## 🛠️ Step 2: Using the Wix Editor Connector

### Initialize Connector

```javascript
const WixEditorConnector = require('./wix-editor-connector');

// Use instanceId from connected client
const connector = new WixEditorConnector(instanceId);
```

### Get Site Information

```javascript
const siteInfo = await connector.getSiteInfo();
console.log(siteInfo.site);
```

### List Pages

```javascript
const pages = await connector.listPages();
pages.pages.forEach(page => {
  console.log(page.title, page.id);
});
```

### Get Page Details

```javascript
const page = await connector.getPage(pageId);
console.log(page.page);
```

### Update Page Content

```javascript
const result = await connector.updatePage(pageId, {
  title: 'New Page Title',
  description: 'New description'
});
```

### List Products

```javascript
const products = await connector.listProducts({
  limit: 20,
  offset: 0
});
```

### Create Product

```javascript
const product = await connector.createProduct({
  name: 'New Product',
  price: 29.99,
  description: 'Product description',
  sku: 'PROD-001',
  inventory: {
    quantity: 100
  }
});
```

### Update Product

```javascript
const result = await connector.updateProduct(productId, {
  price: 39.99,
  inventory: {
    quantity: 50
  }
});
```

### Manage Collections

```javascript
// List collections
const collections = await connector.listCollections();

// Get collection items
const items = await connector.getCollectionItems(collectionId, {
  limit: 10
});

// Create collection item
const item = await connector.createCollectionItem(collectionId, {
  field1: 'value1',
  field2: 'value2'
});

// Update collection item
await connector.updateCollectionItem(collectionId, itemId, {
  field1: 'updated value'
});
```

### Blog Management

```javascript
// List blog posts
const posts = await connector.listBlogPosts({ limit: 10 });

// Create blog post
const post = await connector.createBlogPost({
  title: 'New Blog Post',
  content: 'Post content...',
  excerpt: 'Post excerpt'
});

// Update blog post
await connector.updateBlogPost(postId, {
  title: 'Updated Title'
});
```

### SEO Management

```javascript
// Get site SEO
const siteSEO = await connector.getSiteSEO();

// Update site SEO
await connector.updateSiteSEO({
  title: 'Site Title',
  description: 'Site Description',
  keywords: ['keyword1', 'keyword2']
});

// Get page SEO
const pageSEO = await connector.getPageSEO(pageId);

// Update page SEO
await connector.updatePageSEO(pageId, {
  title: 'Page Title',
  description: 'Page Description'
});
```

---

## 💻 Step 3: Using CLI Commands

### List Connected Clients

```bash
node wix-cli-commands.js list-clients
```

Output:
```
📋 Connected Wix Clients:
──────────────────────────────────────────────────

1. Client ID: shesallthatandmore
   Instance ID: abc123...
   Metasite ID: def456...
   Status: ✅ Active
   Created: 1/1/2025, 12:00:00 PM
   Expires: 1/1/2026, 12:00:00 PM
```

### Connect New Client

```bash
node wix-cli-commands.js connect shesallthatandmore
```

This will display the OAuth URL to visit.

### Get Site Information

```bash
node wix-cli-commands.js get-site <instanceId>
```

### List Pages

```bash
node wix-cli-commands.js list-pages <instanceId>
```

### List Products

```bash
node wix-cli-commands.js list-products <instanceId>
node wix-cli-commands.js list-products <instanceId> --limit=20
```

### Create Product

First, create a JSON file with product data:

**product-data.json:**
```json
{
  "name": "New Product",
  "price": 29.99,
  "description": "Product description",
  "sku": "PROD-001",
  "inventory": {
    "quantity": 100
  },
  "productOptions": {
    "options": [
      {
        "name": "Size",
        "choices": ["S", "M", "L", "XL"]
      },
      {
        "name": "Color",
        "choices": ["Red", "Blue", "Green"]
      }
    ]
  }
}
```

Then create the product:
```bash
node wix-cli-commands.js create-product <instanceId> product-data.json
```

---

## 🔧 Step 4: Building Site Content Programmatically

### Example: Build Site Based on Source

```javascript
const WixEditorConnector = require('./wix-editor-connector');

async function buildSiteFromSource(instanceId, sourceData) {
  const connector = new WixEditorConnector(instanceId);

  // 1. Update site SEO
  await connector.updateSiteSEO({
    title: sourceData.siteTitle,
    description: sourceData.siteDescription,
    keywords: sourceData.keywords
  });

  // 2. Create/Update pages
  for (const page of sourceData.pages) {
    const existingPages = await connector.listPages();
    const existingPage = existingPages.pages.find(p => p.url === page.url);
    
    if (existingPage) {
      await connector.updatePage(existingPage.id, {
        title: page.title,
        description: page.description
      });
    }
  }

  // 3. Import products
  for (const product of sourceData.products) {
    await connector.createProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      sku: product.sku,
      inventory: {
        quantity: product.stock
      }
    });
  }

  // 4. Create blog posts
  for (const post of sourceData.blogPosts) {
    await connector.createBlogPost({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt
    });
  }
}
```

---

## 📊 Step 5: Testing Connection

### Test Script

```javascript
const WixEditorConnector = require('./wix-editor-connector');

async function testConnection(instanceId) {
  const connector = new WixEditorConnector(instanceId);

  console.log('Testing connection...');

  // Test 1: Get site info
  const siteInfo = await connector.getSiteInfo();
  console.log('✅ Site Info:', siteInfo.success ? 'OK' : 'FAILED');

  // Test 2: List pages
  const pages = await connector.listPages();
  console.log('✅ List Pages:', pages.success ? `OK (${pages.pages.length} pages)` : 'FAILED');

  // Test 3: List products
  const products = await connector.listProducts({ limit: 5 });
  console.log('✅ List Products:', products.success ? `OK (${products.total} total)` : 'FAILED');

  // Test 4: Get collections
  const collections = await connector.listCollections();
  console.log('✅ List Collections:', collections.success ? `OK (${collections.collections.length} collections)` : 'FAILED');
}

// Run test
testConnection('your-instance-id');
```

---

## 🚀 Step 6: Complete Site Build Example

### Build "She's All That & More" Site

```javascript
const WixEditorConnector = require('./wix-editor-connector');
const fs = require('fs');

async function buildShesAllThatSite(instanceId) {
  const connector = new WixEditorConnector(instanceId);

  // Load source data
  const sourceData = JSON.parse(fs.readFileSync('shesallthatandmore-data.json', 'utf8'));

  console.log('🏗️  Building site...');

  // 1. Site SEO
  console.log('1. Setting site SEO...');
  await connector.updateSiteSEO({
    title: 'Shop Plus Size Fashion at She\'s All That & More',
    description: 'Trendy clothing for larger women',
    keywords: ['plus size', 'fashion', 'clothing', 'women']
  });

  // 2. Create product collections
  console.log('2. Creating products...');
  for (const product of sourceData.products) {
    await connector.createProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      sku: product.sku,
      inventory: { quantity: product.stock },
      productOptions: product.options
    });
  }

  // 3. Update pages
  console.log('3. Updating pages...');
  const pages = await connector.listPages();
  for (const pageData of sourceData.pages) {
    const page = pages.pages.find(p => p.title === pageData.title);
    if (page) {
      await connector.updatePage(page.id, {
        title: pageData.title,
        description: pageData.description
      });
      await connector.updatePageSEO(page.id, {
        title: pageData.seoTitle,
        description: pageData.seoDescription
      });
    }
  }

  console.log('✅ Site build complete!');
}

// Run build
buildShesAllThatSite('your-instance-id');
```

---

## 🔍 Troubleshooting

### Issue: "No tokens found for instance"

**Solution:**
1. Reconnect the client via OAuth
2. Check that instanceId is correct
3. Verify tokens in database

### Issue: "Token expired"

**Solution:**
- Tokens auto-refresh, but if expired:
  1. Reconnect via OAuth
  2. Or manually refresh token

### Issue: "Permission denied"

**Solution:**
1. Check app permissions in Wix Developers Center
2. Ensure required scopes are granted
3. Re-authorize the app

### Issue: "API endpoint not found"

**Solution:**
1. Verify API endpoint URL is correct
2. Check Wix API documentation for latest endpoints
3. Ensure instanceId is valid

---

## 📚 API Reference

### Available Endpoints

- **Sites API:** `/sites/v1/*`
- **Pages API:** `/pages/v1/*`
- **Stores API:** `/stores/v1/*`
- **Blog API:** `/blog/v1/*`
- **Data API:** `/wix-data/v2/*`

### Documentation

- [Wix REST API Docs](https://dev.wix.com/docs/rest/getting-started/introduction)
- [Wix OAuth Guide](https://dev.wix.com/docs/build-apps/develop-your-app/access/authentication/authenticate-using-oauth)
- [Wix CLI Docs](https://dev.wix.com/docs/build-apps/develop-your-app/access/authentication/authenticate-using-oauth)

---

## ✅ Next Steps

1. **Connect your Wix site** using OAuth
2. **Test the connection** with CLI commands
3. **Build site content** programmatically
4. **Automate updates** using scripts
5. **Monitor changes** via webhooks

---

**Last Updated:** January 2025

