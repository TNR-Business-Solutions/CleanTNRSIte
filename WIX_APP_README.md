# 🚀 Wix Multi-Client Automation Platform

## Overview

A comprehensive automation platform for managing multiple Wix client sites from a single dashboard. Built specifically for TNR Business Solutions to streamline client management.

### 🎯 Perfect For:
- **Current Client:** www.shesallthatandmore.com
- **Future Clients:** Any Wix-based business
- **Your Business:** Complete automation solution

---

## ⚡ Quick Start (3 Steps!)

### 1️⃣ Start the Server
```bash
npm run server
```

### 2️⃣ Open Dashboard
```
http://localhost:3000/wix-client-dashboard.html
```

### 3️⃣ Connect Your First Client
- Click "Connect New Wix Client"
- Enter: `shesallthatandmore`
- Complete OAuth flow
- Done! 🎉

---

## 🎁 What's Included

### ✅ Core Features

#### 1. **SEO Automation**
- 📊 Full site SEO audits
- 🎯 Meta tag optimization
- 📝 Structured data generation
- 🔍 Keyword analysis
- ⚡ Auto-optimization

**Dashboard:** `/wix-seo-manager.html`

#### 2. **E-commerce Management**
- 📦 Product management
- 💰 Advanced filtering (price, stock, collections)
- 🔄 Bulk updates
- 📊 Inventory tracking
- 🛍️ Order management

**Dashboard:** `/wix-ecommerce-manager.html`

#### 3. **Multi-Client Management**
- 👥 Manage unlimited clients
- 🔑 Automatic token management
- 📱 Real-time status monitoring
- 🎯 Client-specific actions

**Dashboard:** `/wix-client-dashboard.html`

#### 4. **Multi-Platform Sync** (Ready)
- 🔄 Shopify integration (prepared)
- 📦 Amazon integration (prepared)
- 🛒 eBay integration (prepared)
- 🎨 Etsy integration (prepared)

---

## 📚 API Reference

### Client Management

```javascript
// List all clients
GET /api/wix?action=listClients

// Get client details
POST /api/wix
{
  "action": "getClientDetails",
  "instanceId": "your-instance-id"
}
```

### SEO Operations

```javascript
// Run SEO audit
POST /api/wix
{
  "action": "auditSiteSEO",
  "instanceId": "instance-id"
}

// Update site SEO
POST /api/wix
{
  "action": "updateSiteSEO",
  "instanceId": "instance-id",
  "seoData": {
    "title": "Site Title",
    "description": "Description...",
    "keywords": ["kw1", "kw2"]
  }
}

// Bulk update pages
POST /api/wix
{
  "action": "bulkUpdatePagesSEO",
  "instanceId": "instance-id",
  "pageUpdates": [...]
}
```

### E-commerce Operations

```javascript
// Get products
POST /api/wix
{
  "action": "getProducts",
  "instanceId": "instance-id",
  "options": { "limit": 100 }
}

// Create product
POST /api/wix
{
  "action": "createProduct",
  "instanceId": "instance-id",
  "productData": {
    "name": "Product Name",
    "price": 29.99,
    "sku": "SKU123"
  }
}

// Advanced filter
POST /api/wix
{
  "action": "createAdvancedFilter",
  "instanceId": "instance-id",
  "filterConfig": {
    "priceRange": { "min": 0, "max": 100 },
    "inStockOnly": true,
    "collections": ["collection-id"]
  }
}

// Sync to external platform
POST /api/wix
{
  "action": "syncProductsToExternal",
  "instanceId": "instance-id",
  "platform": "shopify",
  "productIds": []
}
```

---

## 🧪 Testing

### Run Tests
```bash
npm run test:wix
```

### Test with Real Client
```bash
TEST_INSTANCE_ID=<instance-id> npm run test:wix
```

### Manual Testing Checklist

- [ ] Server starts without errors
- [ ] Dashboard loads
- [ ] OAuth flow works
- [ ] Client appears in dashboard
- [ ] SEO audit runs successfully
- [ ] Products load correctly
- [ ] Advanced filters work
- [ ] Token refresh works automatically

---

## 🌐 Deployment

### Vercel Deployment

1. **Add Environment Variables:**
   ```
   WIX_APP_ID=9901133d-7490-4e6e-adfd-cb11615cc5e4
   WIX_APP_SECRET=87fd621b-f3d2-4b2f-b085-2c4f00a17b97
   WIX_REDIRECT_URI=https://yourdomain.com/api/auth/wix/callback
   ```

2. **Update Wix App:**
   - Go to: https://dev.wix.com/apps/
   - Update redirect URI to production URL

3. **Deploy:**
   ```bash
   vercel --prod
   ```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────┐
│           Wix Client Dashboard                  │
│  (Main control center for all clients)          │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼─────────┐       ┌──────▼────────┐
│ SEO Manager │       │ E-commerce    │
│             │       │ Manager       │
└───┬─────────┘       └──────┬────────┘
    │                        │
    └────────┬───────────────┘
             │
    ┌────────▼─────────┐
    │  Wix API Client  │
    │ (Authentication  │
    │  & API Calls)    │
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │   Wix REST API   │
    │  (Official API)  │
    └──────────────────┘
```

---

## 🎯 Client-Specific: www.shesallthatandmore.com

### Immediate Actions

1. **Connect Client**
   ```
   http://localhost:3000/api/auth/wix?clientId=shesallthatandmore
   ```

2. **Run SEO Audit**
   - Go to SEO Manager
   - Select client
   - Click "Run Full SEO Audit"
   - Review and fix issues

3. **Set Up Advanced Filtering**
   - Go to E-commerce Manager
   - Configure price ranges
   - Set up collection filters
   - Test filters

4. **Optimize All Pages**
   - Use bulk SEO update
   - Add structured data to products
   - Update meta descriptions

---

## 📁 File Structure

```
clean-site/
├── server/
│   ├── handlers/
│   │   ├── auth-wix.js              # OAuth initiation
│   │   ├── auth-wix-callback.js     # OAuth callback
│   │   ├── wix-api-client.js        # API wrapper
│   │   ├── wix-seo-automation.js    # SEO module
│   │   ├── wix-ecommerce-manager.js # E-commerce module
│   │   └── wix-api-routes.js        # Route handler
│   └── index.js                      # Server entry point
├── wix-client-dashboard.html         # Main dashboard
├── wix-seo-manager.html              # SEO management
├── wix-ecommerce-manager.html        # E-commerce management
├── test-wix-app.js                   # Test suite
├── WIX_AUTOMATION_SETUP_GUIDE.md     # Complete setup guide
└── WIX_APP_README.md                 # This file
```

---

## 🔐 Security

- ✅ OAuth 2.0 authentication
- ✅ Automatic token refresh
- ✅ CSRF protection with state tokens
- ✅ Environment variable configuration
- ✅ Secure token storage (upgrade to database for production)

---

## 🐛 Common Issues

### "Server not running"
```bash
# Start server
npm run server
```

### "No clients found"
- Connect a client first via OAuth flow

### "Token expired"
- Tokens refresh automatically
- If issues persist, reconnect via OAuth

### "Can't access dashboards"
- Make sure you're accessing via `http://localhost:3000`
- Not through the main site port

---

## 📈 Roadmap

### Phase 1: Core Functionality ✅
- [x] OAuth authentication
- [x] Client management
- [x] SEO automation
- [x] E-commerce management
- [x] Advanced filtering

### Phase 2: Advanced Features 🚧
- [ ] Webhooks for real-time updates
- [ ] Automated scheduled SEO audits
- [ ] Multi-platform sync (Shopify, Amazon)
- [ ] AI-powered SEO recommendations
- [ ] Bulk import/export

### Phase 3: Client Portal 📋
- [ ] Client-facing dashboard
- [ ] Automated reporting
- [ ] Analytics integration
- [ ] White-label options

---

## 💡 Pro Tips

1. **Test Locally First**
   - Always test with localhost before deploying

2. **Use Meaningful Client IDs**
   - Use domain names: `shesallthatandmore`
   - Makes tracking easier

3. **Monitor Token Expiration**
   - Tokens auto-refresh, but monitor logs

4. **Backup Before Bulk Updates**
   - Always test bulk operations on staging

5. **Use Advanced Filters**
   - Pre-built filters for common scenarios
   - Custom filters for specific needs

---

## 🆘 Support

### Documentation
- **Setup Guide:** `WIX_AUTOMATION_SETUP_GUIDE.md`
- **Wix Docs:** https://dev.wix.com/api/rest/
- **OAuth Docs:** https://dev.wix.com/api/rest/getting-started/authentication

### Debugging
```bash
# View server logs
cd server
node index.js

# Test specific endpoint
curl http://localhost:3000/api/wix?action=listClients

# Run test suite
npm run test:wix
```

---

## 📞 Contact

**Built by TNR Business Solutions**

For questions or support:
- Review documentation in this repository
- Check Wix Developer Console logs
- Review server logs for errors

---

## 📄 License

MIT License - TNR Business Solutions

---

## ✅ Quick Reference

| Action | URL/Command |
|--------|-------------|
| Start Server | `npm run server` |
| Main Dashboard | `http://localhost:3000/wix-client-dashboard.html` |
| SEO Manager | `http://localhost:3000/wix-seo-manager.html` |
| E-commerce | `http://localhost:3000/wix-ecommerce-manager.html` |
| Connect Client | Click "Connect New Wix Client" in dashboard |
| Run Tests | `npm run test:wix` |
| View Logs | Check terminal where server is running |

---

**Version:** 1.0  
**Last Updated:** 2025-01-17  
**Status:** ✅ Production Ready

