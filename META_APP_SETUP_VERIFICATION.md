# 🔧 Meta App Setup Verification Guide
**Date:** January 27, 2026  
**App:** TNR Social Automation  
**App ID:** 2201740210361183

---

## ✅ **Current Status**

- ✅ App installed on Facebook
- ✅ App installed on Instagram  
- ✅ Business verified
- ✅ App in Live mode
- ✅ Data access renewal complete

---

## 🔍 **Required Meta App Settings**

### **1. Basic App Settings**

**App ID:** `2201740210361183` ✅  
**App Name:** TNR Social Automation ✅  
**Contact Email:** Roy.Turner@tnrbusinesssolutions.com ✅  
**Privacy Policy:** https://www.tnrbusinesssolutions.com/privacy-policy.html ✅  
**Terms of Service:** https://www.tnrbusinesssolutions.com/terms-conditions.html ✅  
**Data Deletion:** https://www.tnrbusinesssolutions.com/data-deletion.html ✅

---

### **2. OAuth Redirect URIs** ⚠️ **CRITICAL**

**Required Redirect URI:**
```
https://www.tnrbusinesssolutions.com/api/auth/meta/callback
```

**To Set in Meta App Dashboard:**
1. Go to: **Settings → Basic**
2. Scroll to: **App Domains**
3. Add domain: `tnrbusinesssolutions.com`
4. Go to: **Facebook Login → Settings**
5. Add **Valid OAuth Redirect URIs:**
   - `https://www.tnrbusinesssolutions.com/api/auth/meta/callback`
   - `https://tnrbusinesssolutions.com/api/auth/meta/callback` (without www)

**⚠️ IMPORTANT:** The redirect URI must match EXACTLY, including:
- Protocol (`https://`)
- Domain (`www.tnrbusinesssolutions.com`)
- Path (`/api/auth/meta/callback`)

---

### **3. Required Permissions**

**Current Permissions Requested:**
- ✅ `pages_manage_posts` - Create, edit and delete posts on Pages
- ✅ `pages_read_engagement` - Read engagement data on Pages
- ✅ `pages_show_list` - Access the list of Pages a person manages
- ✅ `pages_manage_metadata` - Manage Page settings

**To Verify:**
1. Go to: **App Review → Permissions and Features**
2. Ensure all permissions are approved
3. If any are pending, submit for review

---

### **4. Instagram Business Account Connection**

**Requirements:**
- ✅ Instagram account must be Business or Creator (not Personal)
- ✅ Instagram account must be connected to Facebook Page
- ✅ Facebook Page must have Instagram Business Account linked

**To Connect:**
1. Go to Facebook Page Settings
2. Navigate to: **Instagram** section
3. Click: **Connect Account**
4. Follow prompts to connect Instagram Business Account
5. Grant necessary permissions

**Verify Connection:**
- Go to: **Page Settings → Instagram**
- Should show: Instagram account connected
- Username should appear: `@tnrbusinesssolutions`

---

### **5. API Version**

**Current:** v19.0 ✅  
**Status:** Latest stable version

**To Verify:**
1. Go to: **Settings → Advanced**
2. Check: **Upgrade API version**
3. Ensure: `v19.0` is selected for all calls

---

### **6. App Mode**

**Current:** Live Mode ✅  
**Status:** App is live and accessible

**Note:** App was switched to live mode on Jan 27, 2026

---

## 🔐 **Environment Variables (Vercel)**

**Required Variables:**

```bash
META_APP_ID=2201740210361183
META_APP_SECRET=your_app_secret_here
META_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/meta/callback
```

**To Set in Vercel:**
1. Go to: Vercel Dashboard → Project Settings
2. Navigate to: **Environment Variables**
3. Add each variable above
4. Ensure they're set for **Production** environment
5. Redeploy after adding variables

---

## ✅ **Verification Checklist**

### **Step 1: Verify Redirect URI**
- [ ] Go to Meta App Dashboard
- [ ] Navigate to: **Facebook Login → Settings**
- [ ] Verify redirect URI is listed:
  - `https://www.tnrbusinesssolutions.com/api/auth/meta/callback`
- [ ] If missing, add it

### **Step 2: Verify Permissions**
- [ ] Go to: **App Review → Permissions and Features**
- [ ] Check all required permissions are approved:
  - [ ] `pages_manage_posts`
  - [ ] `pages_read_engagement`
  - [ ] `pages_show_list`
  - [ ] `pages_manage_metadata`

### **Step 3: Verify Instagram Connection**
- [ ] Go to Facebook Page Settings
- [ ] Check Instagram section
- [ ] Verify Instagram Business Account is connected
- [ ] Note Instagram username: `@tnrbusinesssolutions`

### **Step 4: Verify Environment Variables**
- [ ] Check Vercel environment variables
- [ ] Verify `META_APP_ID` is set
- [ ] Verify `META_APP_SECRET` is set
- [ ] Verify `META_REDIRECT_URI` is set (optional, defaults work)

### **Step 5: Test OAuth Flow**
- [ ] Go to: `/platform-connections.html`
- [ ] Click: "Connect Facebook"
- [ ] Complete OAuth flow
- [ ] Verify tokens are saved
- [ ] Check Instagram is detected

---

## 🧪 **Testing OAuth Connection**

### **Test 1: Initiate OAuth**
1. Visit: `https://www.tnrbusinesssolutions.com/api/auth/meta`
2. Should redirect to Facebook authorization page
3. Should request permissions listed above

### **Test 2: Complete OAuth**
1. Authorize the app on Facebook
2. Should redirect back to callback URL
3. Should show success page with tokens
4. Tokens should be saved to database

### **Test 3: Verify Token Storage**
1. Go to: `/social-media-automation-dashboard.html`
2. Check console for: `✅ Authentication token found`
3. Check for: `✅ Connected to: TNR Business Solutions`
4. Check for: `📷 Instagram: @tnrbusinesssolutions`

### **Test 4: Test Posting**
1. Create a test post
2. Select Facebook platform
3. Click "Post to Facebook"
4. Verify post appears on Facebook Page

### **Test 5: Test Instagram Posting**
1. Create a test post with image
2. Select Instagram platform
3. Click "Post to Instagram"
4. Verify post appears on Instagram account

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Redirect URI Mismatch**
**Error:** `redirect_uri_mismatch`

**Solution:**
- Verify redirect URI in Meta App Dashboard matches exactly
- Check for trailing slashes
- Ensure protocol is `https://`
- Check domain matches (with/without www)

### **Issue 2: Permissions Not Granted**
**Error:** `insufficient_permissions`

**Solution:**
- Re-authorize the app
- Ensure all permissions are requested
- Check App Review status

### **Issue 3: Instagram Not Detected**
**Error:** `No Instagram Business Account connected`

**Solution:**
- Verify Instagram account is Business/Creator (not Personal)
- Connect Instagram to Facebook Page in Page Settings
- Re-run OAuth flow after connecting

### **Issue 4: Token Expired**
**Error:** `Invalid access token`

**Solution:**
- Page tokens don't expire, but user tokens do
- Re-run OAuth flow to get fresh tokens
- Ensure long-lived token exchange is working

---

## 📊 **Expected OAuth Flow**

1. **User clicks "Connect Facebook"**
   - Redirects to: `https://www.facebook.com/v19.0/dialog/oauth?...`
   - Requests permissions: `pages_manage_posts`, `pages_read_engagement`, etc.

2. **User authorizes app**
   - Facebook redirects to: `https://www.tnrbusinesssolutions.com/api/auth/meta/callback?code=...`

3. **Backend exchanges code for token**
   - Exchanges authorization code for short-lived token
   - Exchanges short-lived token for long-lived token (60 days)
   - Fetches user's Facebook Pages
   - Fetches Instagram Business Account for each page

4. **Tokens saved to database**
   - Page access tokens saved (never expire)
   - Instagram account IDs saved
   - User redirected to success page

5. **Dashboard loads tokens**
   - Dashboard fetches tokens from database
   - Displays connection status
   - Shows Instagram account if connected

---

## ✅ **Next Steps**

1. **Verify Redirect URI** in Meta App Dashboard
2. **Check Permissions** are approved
3. **Connect Instagram** to Facebook Page (if not already)
4. **Set Environment Variables** in Vercel
5. **Test OAuth Flow** end-to-end
6. **Test Posting** to both Facebook and Instagram

---

**Status:** ✅ **App Configured**  
**Next:** Verify redirect URI and test OAuth flow  
**Priority:** High - Required for Facebook/Instagram posting
