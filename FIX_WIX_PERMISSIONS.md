# 🔧 Fix: Missing Wix Store Permissions

## ❌ The Error:

```
Permission WIX_STORES.READ_PRODUCTS is required
```

**This means:** Your Wix app needs the "Read Products" permission to access store products.

---

## ✅ SOLUTION: Add Missing Permissions

### **Step 1: Go to Wix Developer Console**

1. **Open:** https://dev.wix.com/apps/
2. **Click on your app:** "TNRBusinessSolutions AUTOTOOL"
3. **Click:** "Permissions" in the left menu

### **Step 2: Add Required Permissions**

**Find and enable these permissions:**

#### **Required for Products:**
- ✅ **Wix Stores** → **Read Products** 
  - Permission: `WIX_STORES.READ_PRODUCTS`
  - This allows reading product data

- ✅ **Wix Stores** → **Read Stores - all read permissions**
  - This includes read access to products, orders, etc.

#### **Required for Full Functionality:**
- ✅ **Wix Stores** → **Manage Stores - all permissions**
  - This gives full access (read + write)

### **Step 3: Save Permissions**

1. **Click "Save"** at the bottom
2. **Wait for confirmation** that permissions are saved

### **Step 4: Reconnect Your Client**

**After adding permissions, you MUST reconnect:**

1. **Go to dashboard:**
   ```
   http://localhost:3000/wix-client-dashboard.html
   ```

2. **Click "Connect New Wix Client"** again

3. **Enter:** `shesallthatandmore`

4. **Complete OAuth** - Wix will now request the new permissions

5. **Authorize** - Grant the new permissions

6. **Done!** Now the app has the required permissions

---

## 📋 Complete Permission List

**For full functionality, make sure these are enabled:**

### **Stores Permissions:**
- ✅ Read Products (`WIX_STORES.READ_PRODUCTS`)
- ✅ Read Stores - all read permissions
- ✅ Manage Stores - all permissions (for updates)

### **Already Have (from your list):**
- ✅ Manage Stores - all permissions
- ✅ Read Stores - all read permissions
- ✅ Manage Products
- ✅ Read Products
- ✅ Manage Orders
- ✅ Read Orders

**But the specific `WIX_STORES.READ_PRODUCTS` might need to be explicitly enabled.**

---

## 🔍 How to Check Current Permissions

1. **Go to:** https://dev.wix.com/apps/9901133d-7490-4e6e-adfd-cb11615cc5e4/permissions
2. **Search for:** "Read Products" or "WIX_STORES"
3. **Verify** it's checked/enabled

---

## ⚠️ Important Notes

1. **Permissions are per-app** - Each Wix app has its own permissions
2. **Reconnection required** - After adding permissions, clients must reconnect
3. **Permission scope** - Some permissions are nested (e.g., "all permissions" includes read)
4. **Check both** - Check both "Read" and "Manage" sections

---

## 🚀 After Adding Permissions

### **Test It:**

1. **Reconnect client** (see Step 4 above)
2. **Run SEO audit** - Should work now!
3. **Get products** - Should work now!
4. **Check server logs** - Should see successful API calls

---

## 📊 Expected Result

**After adding permissions and reconnecting:**

```
✅ Retrieved X REAL products from Wix
✅ SEO Audit completed: X products analyzed
✅ All API calls successful
```

---

## 🆘 If Still Not Working

1. **Double-check permissions** are saved in Wix console
2. **Make sure you reconnected** after adding permissions
3. **Check server logs** for specific permission errors
4. **Try disconnecting and reconnecting** the client

---

**Add the "Read Products" permission in Wix Developer Console, then reconnect your client!** 🚀

