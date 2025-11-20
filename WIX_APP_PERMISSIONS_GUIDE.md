# Wix App Permissions & Extensions Setup Guide

## 🎯 Required Permissions for Your Wix App

Your app needs specific permissions to access Wix APIs for SEO automation and e-commerce management. Here's what you need to configure in your Wix Developer Dashboard.

---

## 📋 Step-by-Step Setup

### 1. Access Wix Developer Dashboard

1. Go to: https://dev.wix.com/dashboard
2. Sign in with your Wix account
3. Select your app (App ID: `9901133d-7490-4e6e-adfd-cb11615cc5e4`)

### 2. Navigate to Permissions/Scopes

1. In your app dashboard, go to **Settings** → **OAuth** or **Permissions**
2. Look for **OAuth Scopes** or **API Permissions** section

---

## ✅ Required Permissions/Scopes

Add these permissions to your Wix app:

### **E-commerce (Wix Stores) Permissions**

These are **REQUIRED** for:
- Product management
- Inventory management
- Order management
- Collection management
- SEO audit (uses products API)

**Required Scopes:**
```
wix.stores.manage_products
wix.stores.manage_inventory
wix.stores.manage_orders
wix.stores.read_products
wix.stores.read_inventory
wix.stores.read_orders
```

**Or in Wix Dashboard, look for:**
- ✅ **Manage Stores** - Full access to store operations
- ✅ **Read Stores** - Read store data
- ✅ **Manage Products** - Create, update, delete products
- ✅ **Manage Inventory** - Update inventory levels
- ✅ **Manage Orders** - Update order status

### **Site Management Permissions**

These are **REQUIRED** for:
- SEO settings management
- Site-wide SEO updates
- Page SEO management

**Required Scopes:**
```
wix.sites.manage_site
wix.sites.read_site
wix.pages.manage_pages
wix.pages.read_pages
```

**Or in Wix Dashboard, look for:**
- ✅ **Manage Site** - Update site settings
- ✅ **Read Site** - Read site information
- ✅ **Manage Pages** - Update page SEO settings
- ✅ **Read Pages** - Read page data

---

## 🔍 How to Add Permissions in Wix Developer Dashboard

### Method 1: OAuth Scopes (Recommended)

1. Go to your app: https://dev.wix.com/dashboard
2. Click on your app name
3. Navigate to **Settings** → **OAuth**
4. Under **OAuth Scopes**, click **Add Scope**
5. Add each scope listed above
6. Click **Save**

### Method 2: App Permissions

1. Go to your app dashboard
2. Navigate to **Settings** → **Permissions** or **API Access**
3. Enable the following:
   - ✅ **Wix Stores** - Full access
   - ✅ **Wix Sites** - Full access
   - ✅ **Wix Pages** - Full access

---

## 🚨 Common Issues & Solutions

### Issue: "No Metasite Context" Error

**Cause:** Missing permissions or incorrect scope configuration

**Solution:**
1. Verify all permissions are added in Wix Developer Dashboard
2. Reconnect the Wix client after adding permissions
3. The app needs to be reinstalled on the site after permission changes

### Issue: "Permission Denied" Error

**Cause:** App doesn't have required permissions

**Solution:**
1. Check that all scopes are added
2. Make sure the app is reinstalled on the Wix site
3. Verify the app has "Manage Stores" permission

### Issue: "Authentication Failed"

**Cause:** Token expired or invalid

**Solution:**
1. Reconnect the Wix client
2. This will generate a new token with updated permissions

---

## 📝 API Endpoints Used by Your App

Your app uses these Wix REST API endpoints:

### Stores API
- `POST /stores/v1/products/query` - Query products
- `GET /stores/v1/products/{productId}` - Get product
- `POST /stores/v1/products` - Create product
- `PATCH /stores/v1/products/{productId}` - Update product
- `DELETE /stores/v1/products/{productId}` - Delete product
- `GET /stores/v1/inventory/products/{productId}` - Get inventory
- `PATCH /stores/v1/inventory/products/{productId}` - Update inventory
- `GET /stores/v1/collections/query` - Query collections
- `GET /stores/v1/orders/query` - Query orders
- `PATCH /stores/v1/orders/{orderId}` - Update order

### Sites API
- `GET /v1/sites/site` - Get site data
- `PATCH /v1/sites/site` - Update site SEO

### Pages API
- `GET /v1/pages` - List pages
- `GET /v1/pages/{pageId}` - Get page data
- `PATCH /v1/pages/{pageId}` - Update page SEO

---

## ✅ Verification Checklist

After adding permissions:

- [ ] All required scopes are added in Wix Developer Dashboard
- [ ] App is reinstalled on the Wix site (required after permission changes)
- [ ] Reconnected the Wix client in your dashboard
- [ ] Tested SEO audit - should work without "No Metasite Context" error
- [ ] Tested product loading - should load products successfully
- [ ] Tested collections - should load collections successfully

---

## 🔄 After Adding Permissions

**IMPORTANT:** After adding new permissions:

1. **Reinstall the app** on your Wix site:
   - Go to your Wix site
   - Navigate to Settings → Apps
   - Remove the app
   - Reinstall it (this applies new permissions)

2. **Reconnect in your dashboard**:
   - Go to: `http://localhost:3000/wix-client-dashboard.html` (or your live URL)
   - Click "Disconnect" for the client
   - Click "Connect New Wix Client" again
   - Complete OAuth flow

3. **Test the functionality**:
   - Try running SEO audit
   - Try loading products
   - Verify no "No Metasite Context" errors

---

## 📚 Additional Resources

- **Wix Developer Docs**: https://dev.wix.com/api/rest
- **Wix Stores API**: https://dev.wix.com/api/rest/wix-stores
- **Wix Sites API**: https://dev.wix.com/api/rest/wix-sites
- **OAuth Scopes Reference**: https://dev.wix.com/api/rest/authentication/oauth-scopes

---

## 🆘 Need Help?

If you're still getting errors after adding permissions:

1. Check Vercel logs for detailed error messages
2. Verify the instance ID format (should be UUID)
3. Check that tokens are being saved to database
4. Verify POSTGRES_URL is set correctly in Vercel

The "No Metasite Context" error should be resolved once:
- ✅ All permissions are added
- ✅ App is reinstalled on Wix site
- ✅ Client is reconnected with new permissions

