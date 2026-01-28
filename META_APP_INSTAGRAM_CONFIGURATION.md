# 🔧 Meta App Instagram Configuration Fix
**Date:** January 27, 2026  
**Error:** `Invalid platform app` from Instagram OAuth  
**App ID:** 2201740210361183

---

## 🚨 **The Error Explained**

The error `instagram.com/oauth/authorize/first_party/error/?message=Invalid%20Request%3A%20Request%20parameters%20are%20invalid%3A%20Invalid%20platform%20app` means:

- Meta App doesn't have Instagram products properly configured
- OR Instagram Graph API is not enabled/approved
- OR App is trying to use Instagram OAuth directly (which doesn't work for Business accounts)

---

## ✅ **The Fix**

### **Step 1: Verify Meta App Configuration**

1. **Go to Meta App Dashboard:**
   - Visit: https://developers.facebook.com/apps/2201740210361183/
   - App: **TNR Social Automation**

2. **Check Products Section:**
   - Look for: **"Products"** in left sidebar
   - Should have: **Facebook Login** ✅
   - Optional: **Instagram Graph API** (for advanced features)

---

### **Step 2: Enable Instagram Graph API (If Needed)**

**Note:** For basic Instagram posting through Facebook Pages, you DON'T need Instagram Graph API. But if you want advanced features:

1. **Add Instagram Graph API Product:**
   - Go to: Products → **"+ Add Product"**
   - Find: **"Instagram Graph API"**
   - Click: **"Set Up"**

2. **Configure Instagram Graph API:**
   - **Valid OAuth Redirect URIs:**
     - `https://www.tnrbusinesssolutions.com/api/auth/meta/callback`
     - `https://tnrbusinesssolutions.com/api/auth/meta/callback`

3. **Request Permissions:**
   - `instagram_basic` - Basic Instagram access
   - `instagram_content_publish` - Post to Instagram
   - `pages_show_list` - List Facebook Pages
   - `pages_read_engagement` - Read engagement

4. **Submit for Review:**
   - Go to: **App Review → Permissions and Features**
   - Submit permissions for review
   - Wait for approval

---

### **Step 3: Verify Facebook Login Configuration**

**This is the MOST IMPORTANT:**

1. **Go to Facebook Login Settings:**
   - Visit: https://developers.facebook.com/apps/2201740210361183/fb-login/settings/

2. **Check Valid OAuth Redirect URIs:**
   - Should include:
     - `https://www.tnrbusinesssolutions.com/api/auth/meta/callback`
     - `https://tnrbusinesssolutions.com/api/auth/meta/callback`

3. **Check App Domains:**
   - Should include: `tnrbusinesssolutions.com`

---

### **Step 4: Verify App Mode**

1. **Check App Mode:**
   - Go to: App Dashboard → Settings → Basic
   - **App Mode:** Should be **"Live"** (not Development)
   - If Development → Switch to Live mode

2. **Check App Status:**
   - Should show: **"Live"** status
   - All required fields filled

---

## 🎯 **For Instagram Business Accounts**

### **Important:** Instagram Business Accounts DON'T need Instagram OAuth!

**They work through:**
- ✅ Facebook Pages API
- ✅ Facebook Login product
- ✅ Instagram connected to Facebook Page

**You DON'T need:**
- ❌ Instagram Basic Display API (for Personal accounts)
- ❌ Separate Instagram OAuth flow
- ❌ Instagram Graph API (optional, for advanced features)

---

## ✅ **Correct Connection Process**

### **1. Connect Instagram to Facebook Page:**

1. Go to: https://www.facebook.com/TNRBusinessSolutions/settings/instagram
2. Click: **"Connect Account"**
3. Login to Instagram
4. Verify connection

### **2. Connect via Meta OAuth:**

1. Go to: `/platform-connections.html`
2. Click: **"Connect"** on **Meta/Facebook**
3. Complete Facebook OAuth
4. Select: **TNR Business Solutions** Page
5. Instagram detected automatically

---

## 🚨 **If Error Persists**

### **Check 1: Meta App Products**

- Go to: App Dashboard → Products
- Ensure: **Facebook Login** is enabled
- Optional: **Instagram Graph API** (if you want advanced features)

### **Check 2: App Review Status**

- Go to: App Review → Permissions and Features
- Check: Are permissions approved?
- If pending → Wait for approval

### **Check 3: Redirect URIs**

- Go to: Facebook Login → Settings
- Verify: Redirect URIs are correct
- Must match exactly: `https://www.tnrbusinesssolutions.com/api/auth/meta/callback`

### **Check 4: App Mode**

- Go to: Settings → Basic
- Check: App Mode is **"Live"**
- If Development → Switch to Live

---

## 📋 **Quick Fix Checklist**

- [ ] Facebook Login product enabled ✅
- [ ] Redirect URIs configured correctly ✅
- [ ] App Domains set correctly ✅
- [ ] App Mode is "Live" ✅
- [ ] Instagram connected to Facebook Page ✅
- [ ] Use Meta/Facebook OAuth (NOT Instagram OAuth) ✅

---

## ✅ **Action Items**

1. **Verify Meta App Configuration:**
   - Check Facebook Login product
   - Verify redirect URIs
   - Check app mode

2. **Connect Instagram to Facebook Page:**
   - Go to Facebook Page Settings → Instagram
   - Connect Instagram account

3. **Connect via Meta OAuth:**
   - Use Meta/Facebook connection
   - NOT Instagram separately
   - Instagram will be detected automatically

---

**Status:** ⚠️ Meta App Configuration Issue  
**Solution:** Verify Meta App settings, use Facebook OAuth  
**Priority:** High
