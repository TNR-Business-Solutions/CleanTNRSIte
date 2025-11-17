# ✅ Wix Permission Checklist

## 🔍 Required Permissions for Full Functionality

### **For Reading Products (Current Issue):**
- [ ] **Wix Stores** → **Read Products** 
  - Permission ID: `WIX_STORES.READ_PRODUCTS`
  - **STATUS:** ❌ MISSING (This is causing the 403 error)

### **For Managing Products:**
- [ ] **Wix Stores** → **Manage Products**
  - Permission ID: `WIX_STORES.MANAGE_PRODUCTS`
  - **STATUS:** ✅ Should already have this

### **For Full Store Access:**
- [ ] **Wix Stores** → **Manage Stores - all permissions**
  - Includes: Read + Write access to products, orders, inventory
  - **STATUS:** ✅ Should already have this

---

## 📋 How to Add Missing Permission

### **Step 1: Open Permissions Page**
```
https://dev.wix.com/apps/9901133d-7490-4e6e-adfd-cb11615cc5e4/permissions
```

### **Step 2: Find "Wix Stores" Section**

Look for:
```
Wix Stores
├── Manage Stores - all permissions ✅ (you have this)
├── Read Stores - all read permissions ✅ (you have this)
├── Read Products ❌ (ADD THIS ONE!)
└── Manage Products ✅ (you have this)
```

### **Step 3: Enable "Read Products"**

1. **Find** "Read Products" permission
2. **Check the box** to enable it
3. **Click "Save"** at bottom of page

### **Step 4: Reconnect Client**

**CRITICAL:** After adding permissions, you MUST reconnect:

1. Go to: `http://localhost:3000/wix-client-dashboard.html`
2. Click "Connect New Wix Client"
3. Enter: `shesallthatandmore`
4. Complete OAuth (Wix will request new permissions)
5. Authorize the app

---

## 🎯 Quick Fix Steps

1. ✅ Go to Wix Developer Console → Permissions
2. ✅ Enable "Read Products" permission
3. ✅ Save permissions
4. ✅ Reconnect client in dashboard
5. ✅ Test SEO audit again

---

## 📊 Permission Status

**From your permission list, you have:**
- ✅ Manage Stores - all permissions
- ✅ Read Stores - all read permissions  
- ✅ Manage Products
- ✅ Read Products (should be there, but might need explicit enable)

**The error suggests the specific `WIX_STORES.READ_PRODUCTS` scope isn't active.**

---

## 🔍 Verify Permissions Are Active

**After adding and reconnecting, check server logs:**

**Should see:**
```
✅ Retrieved X products from Wix
✅ SEO Audit completed
```

**Should NOT see:**
```
❌ Permission WIX_STORES.READ_PRODUCTS is required
```

---

**Add the "Read Products" permission and reconnect!** 🚀

