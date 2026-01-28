# 🔗 Meta Redirect URI Setup - CRITICAL
**App ID:** 2201740210361183  
**App Name:** TNR Social Automation

---

## ⚠️ **CRITICAL: Redirect URI Must Be Set**

The OAuth flow **will fail** if the redirect URI is not configured correctly in Meta App Dashboard.

---

## 📍 **Step-by-Step: Set Redirect URI**

### **1. Go to Meta App Dashboard**

**Direct Link:**
```
https://developers.facebook.com/apps/2201740210361183/fb-login/settings/
```

Or navigate:
1. Go to: https://developers.facebook.com/apps/
2. Select: **TNR Social Automation** (ID: 2201740210361183)
3. Click: **Facebook Login** in left sidebar
4. Click: **Settings** tab

---

### **2. Add Redirect URI**

**In "Valid OAuth Redirect URIs" section:**

**Add these URIs (one per line):**
```
https://www.tnrbusinesssolutions.com/api/auth/meta/callback
https://tnrbusinesssolutions.com/api/auth/meta/callback
```

**⚠️ IMPORTANT:**
- Must include `https://`
- Must match domain exactly
- Include both `www` and non-`www` versions
- Path must be: `/api/auth/meta/callback`

---

### **3. Add App Domain**

**In "App Domains" section (Settings → Basic):**

**Add:**
```
tnrbusinesssolutions.com
```

**Note:** Don't include `www` or `https://` in App Domain

---

### **4. Save Changes**

1. Click: **Save Changes** button
2. Wait for confirmation
3. Changes take effect immediately

---

## ✅ **Verify Redirect URI is Set**

### **Check 1: Visual Verification**
- Go to: Facebook Login → Settings
- Scroll to: "Valid OAuth Redirect URIs"
- Verify both URIs are listed:
  - ✅ `https://www.tnrbusinesssolutions.com/api/auth/meta/callback`
  - ✅ `https://tnrbusinesssolutions.com/api/auth/meta/callback`

### **Check 2: Test OAuth Flow**
1. Go to: `https://www.tnrbusinesssolutions.com/platform-connections.html`
2. Click: "Connect Facebook"
3. Should redirect to Facebook authorization page
4. After authorizing, should redirect back successfully
5. Should NOT show "redirect_uri_mismatch" error

---

## 🚨 **Common Errors**

### **Error: redirect_uri_mismatch**

**Cause:** Redirect URI not set or doesn't match exactly

**Solution:**
1. Check redirect URI in Meta App Dashboard
2. Ensure it matches exactly (including protocol, domain, path)
3. Add both `www` and non-`www` versions
4. Save changes
5. Try OAuth flow again

### **Error: Invalid redirect URI**

**Cause:** URI format incorrect

**Solution:**
- Must start with `https://`
- Must include full domain
- Must include path: `/api/auth/meta/callback`
- No trailing slash

---

## 📋 **Quick Checklist**

- [ ] Opened Meta App Dashboard
- [ ] Navigated to Facebook Login → Settings
- [ ] Added redirect URI: `https://www.tnrbusinesssolutions.com/api/auth/meta/callback`
- [ ] Added redirect URI: `https://tnrbusinesssolutions.com/api/auth/meta/callback`
- [ ] Added App Domain: `tnrbusinesssolutions.com`
- [ ] Saved changes
- [ ] Verified URIs appear in list
- [ ] Tested OAuth flow

---

## 🔍 **Current Configuration**

**App ID:** `2201740210361183`  
**App Name:** TNR Social Automation  
**Required Redirect URI:** `https://www.tnrbusinesssolutions.com/api/auth/meta/callback`  
**App Domain:** `tnrbusinesssolutions.com`

---

**Status:** ⚠️ **VERIFY THIS FIRST**  
**Priority:** Critical - OAuth won't work without this  
**Time:** 2 minutes
