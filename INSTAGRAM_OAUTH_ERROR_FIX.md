# 🚨 Instagram OAuth Error Fix
**Date:** January 27, 2026  
**Error:** `Invalid Request: Request parameters are invalid: Invalid platform app`  
**URL:** `instagram.com/oauth/authorize/first_party/error/`

---

## ⚠️ **The Problem**

You're seeing an Instagram OAuth error, but **Instagram doesn't have a separate OAuth flow**. Instagram Business Accounts connect through Facebook Pages, not directly.

---

## ✅ **The Solution**

### **DO NOT try to connect Instagram separately!**

**Instagram connects automatically when you:**
1. Connect your Facebook Page via Meta OAuth
2. Have Instagram Business Account linked to that Facebook Page

---

## 🎯 **Correct Process**

### **Step 1: Connect Instagram to Facebook Page**

1. **Go to Facebook Page Settings:**
   - Visit: https://www.facebook.com/TNRBusinessSolutions/settings/instagram
   - Or: Facebook → TNR Business Solutions Page → Settings → Instagram

2. **Connect Instagram Account:**
   - Click: **"Connect Account"**
   - Login to Instagram
   - Grant permissions
   - **Important:** Account must be **Business** or **Creator** (not Personal)

3. **Verify Connection:**
   - Should show: Instagram account connected
   - Username: `@tnrbusinesssolutions`

---

### **Step 2: Connect via Meta OAuth (NOT Instagram OAuth)**

1. **Go to Platform Connections:**
   - Visit: `/platform-connections.html`
   - Or: `https://www.tnrbusinesssolutions.com/platform-connections.html`

2. **Click: "Connect" on Meta/Facebook**
   - **NOT** Instagram separately
   - Use: **Meta/Facebook** connection

3. **Complete Facebook OAuth:**
   - Select: **TNR Business Solutions** Page
   - Grant permissions
   - Instagram will be detected automatically

---

## 🚨 **What NOT to Do**

### **❌ Don't Try These:**

1. **Don't click any "Connect Instagram" button separately**
   - Instagram doesn't have its own OAuth flow
   - It connects through Facebook Pages

2. **Don't use Instagram OAuth URLs:**
   - `instagram.com/oauth/authorize` - This is for Personal accounts only
   - Business accounts use Facebook Pages API

3. **Don't try to connect Instagram directly:**
   - There's no separate Instagram OAuth endpoint
   - Instagram Business = Facebook Page connection

---

## ✅ **What TO Do**

### **✅ Do These:**

1. **Connect Instagram to Facebook Page FIRST:**
   - Facebook Page Settings → Instagram → Connect Account

2. **Then connect via Meta OAuth:**
   - Platform Connections → Connect Meta/Facebook
   - Select Facebook Page
   - Instagram detected automatically

3. **Verify in Dashboard:**
   - Should show: `📷 Instagram: @tnrbusinesssolutions`

---

## 🔍 **Check Meta App Configuration**

### **Verify Instagram Products Enabled:**

1. **Go to Meta App Dashboard:**
   - Visit: https://developers.facebook.com/apps/2201740210361183/
   - App ID: `2201740210361183`

2. **Check Products:**
   - Should have: **Facebook Login** ✅
   - Should have: **Instagram Graph API** (if available)
   - Should have: **Instagram Basic Display** (optional, for Personal accounts)

3. **For Business Accounts:**
   - Instagram Business Accounts use **Facebook Pages API**
   - No separate Instagram OAuth needed
   - Instagram Graph API is optional

---

## 📋 **Quick Fix Checklist**

- [ ] Instagram connected to Facebook Page (check Page Settings)
- [ ] Instagram account is Business/Creator (not Personal)
- [ ] Use Meta/Facebook OAuth (NOT Instagram OAuth)
- [ ] Select correct Facebook Page during OAuth
- [ ] Instagram detected automatically after OAuth

---

## 🎯 **Action Items**

1. **Verify Instagram Connection:**
   - Go to: https://www.facebook.com/TNRBusinessSolutions/settings/instagram
   - Ensure Instagram is connected

2. **Connect via Meta OAuth:**
   - Go to: `/platform-connections.html`
   - Click: **"Connect"** on **Meta/Facebook** (NOT Instagram)
   - Complete OAuth flow
   - Instagram will be detected automatically

3. **If Error Persists:**
   - Check Meta App Dashboard
   - Verify Facebook Login product is enabled
   - Ensure redirect URI is correct

---

**Status:** ⚠️ Error Identified  
**Solution:** Use Meta/Facebook OAuth, NOT Instagram OAuth  
**Priority:** High
