# 🔗 Connect All Platforms - Complete Guide
**Date:** January 27, 2026  
**Goal:** Connect TNR Business Solutions to all platforms automatically

---

## 📋 **Platform Connection Order**

1. ✅ **Meta (Facebook & Instagram)** - Fix Instagram detection
2. ⚙️ **Twitter/X** - Connect via OAuth
3. ⚙️ **LinkedIn** - Connect via OAuth
4. ⚙️ **Nextdoor** - Connect via OAuth
5. ⚙️ **Threads** - Connect via Meta OAuth

---

## 🎯 **Step 1: Meta (Facebook & Instagram)**

### **Current Issue:**
- ✅ Facebook connected
- ❌ Instagram not detected (showing "No Instagram connected")

### **Fix Instagram Detection:**

#### **A. Ensure Instagram is Connected to Facebook Page**

1. **Go to Facebook Page Settings:**
   - Visit: https://www.facebook.com/TNRBusinessSolutions/settings/
   - Or: Facebook → TNR Business Solutions Page → Settings

2. **Navigate to Instagram Section:**
   - Click: **Instagram** in left sidebar
   - Check if Instagram account is connected

3. **If Not Connected:**
   - Click: **Connect Account**
   - Login to Instagram
   - Grant permissions
   - **Important:** Instagram account must be **Business** or **Creator** (not Personal)

4. **Verify Connection:**
   - Should show: Instagram account connected
   - Username: `@tnrbusinesssolutions`

#### **B. Re-run OAuth Flow**

1. **Go to Platform Connections:**
   - Visit: `https://www.tnrbusinesssolutions.com/platform-connections.html`

2. **Disconnect Facebook (if needed):**
   - Click: "Disconnect" or remove existing token
   - This ensures fresh connection

3. **Connect Facebook Again:**
   - Click: "Connect Facebook"
   - Complete OAuth flow
   - **Important:** Make sure to select the correct Facebook Page
   - Grant all permissions

4. **Verify Instagram Detection:**
   - After OAuth completes, check success page
   - Should show: `📷 Instagram: @tnrbusinesssolutions`
   - If not, Instagram isn't connected to Facebook Page

#### **C. Test Connection**

1. **Go to Social Media Dashboard:**
   - Visit: `/social-media-automation-dashboard.html`

2. **Check Status:**
   - Should show: `✅ Connected to: TNR Business Solutions`
   - Should show: `📷 Instagram: @tnrbusinesssolutions`

3. **Test Posting:**
   - Create test post with image
   - Post to Instagram
   - Verify post appears on Instagram

---

## 🎯 **Step 2: Twitter/X**

### **Prerequisites:**

1. **Get Twitter App Credentials:**
   - Go to: [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create app or use existing
   - Get:
     - Client ID
     - Client Secret
     - OAuth 2.0 credentials

2. **Set Environment Variables in Vercel:**
   ```
   TWITTER_CLIENT_ID=your_client_id
   TWITTER_CLIENT_SECRET=your_client_secret
   TWITTER_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/twitter/callback
   ```

3. **Configure Twitter App:**
   - Set redirect URI: `https://www.tnrbusinesssolutions.com/api/auth/twitter/callback`
   - Set app permissions: **Read and Write**
   - Enable OAuth 2.0

### **Connect:**

1. **Go to Platform Connections:**
   - Visit: `/platform-connections.html`

2. **Click: "Connect Twitter/X"**

3. **Complete OAuth Flow:**
   - Authorize app
   - Grant permissions
   - Redirects back to dashboard

4. **Verify Connection:**
   - Check dashboard shows: `✅ Connected to Twitter/X`
   - Test posting to Twitter

---

## 🎯 **Step 3: LinkedIn**

### **Prerequisites:**

1. **Get LinkedIn App Credentials:**
   - Go to: [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
   - Create app or use existing
   - Get:
     - Client ID
     - Client Secret

2. **Set Environment Variables in Vercel:**
   ```
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   LINKEDIN_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback
   ```

3. **Configure LinkedIn App:**
   - Set redirect URI: `https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback`
   - Request permissions:
     - `w_member_social` - Post content
     - `r_organization_social` - Read company data
     - `openid`, `profile` - User identification

### **Connect:**

1. **Go to Platform Connections:**
   - Visit: `/platform-connections.html`

2. **Click: "Connect LinkedIn"**

3. **Complete OAuth Flow:**
   - Authorize app
   - Grant permissions
   - Redirects back to dashboard

4. **Verify Connection:**
   - Check dashboard shows: `✅ Connected to LinkedIn`
   - Test posting to LinkedIn

---

## 🎯 **Step 4: Nextdoor**

### **Prerequisites:**

1. **Get Nextdoor App Credentials:**
   - Go to: [Nextdoor Developer Portal](https://developer.nextdoor.com/)
   - Create app or use existing
   - Get OAuth credentials

2. **Set Environment Variables in Vercel:**
   ```
   NEXTDOOR_CLIENT_ID=your_client_id
   NEXTDOOR_CLIENT_SECRET=your_client_secret
   NEXTDOOR_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/nextdoor/callback
   ```

3. **Configure Nextdoor App:**
   - Set redirect URI: `https://www.tnrbusinesssolutions.com/api/auth/nextdoor/callback`
   - Request permissions: `read`, `write`

### **Connect:**

1. **Go to Platform Connections:**
   - Visit: `/platform-connections.html`

2. **Click: "Connect Nextdoor"**

3. **Complete OAuth Flow:**
   - Authorize app
   - Grant permissions
   - Redirects back to dashboard

4. **Verify Connection:**
   - Check dashboard shows: `✅ Connected to Nextdoor`
   - Test posting to Nextdoor

---

## 🎯 **Step 5: Threads**

### **Prerequisites:**

1. **Threads App Already Configured:**
   - Threads App ID: `1453925242353888`
   - Uses Meta OAuth (same as Facebook/Instagram)

2. **Verify Threads App:**
   - Go to: Meta App Dashboard
   - Check: Threads app is configured
   - Verify: Threads display name is set

### **Connect:**

1. **Go to Platform Connections:**
   - Visit: `/platform-connections.html`

2. **Click: "Connect Threads"**

3. **Complete OAuth Flow:**
   - Uses Meta OAuth
   - Authorize app
   - Grant permissions

4. **Verify Connection:**
   - Check dashboard shows: `✅ Connected to Threads`
   - Test posting to Threads

---

## ✅ **Verification Checklist**

After connecting each platform:

- [ ] OAuth flow completes successfully
- [ ] Tokens saved to database
- [ ] Connection status shows "✅ Connected"
- [ ] Test posting works
- [ ] Analytics data appears (if applicable)

---

## 🚨 **Troubleshooting**

### **Instagram Not Detected:**

**Solution:**
1. Verify Instagram is connected to Facebook Page
2. Ensure Instagram account is Business/Creator (not Personal)
3. Re-run OAuth flow after connecting Instagram
4. Check Vercel logs for errors

### **OAuth Flow Fails:**

**Check:**
1. Redirect URI matches exactly in platform app settings
2. Environment variables are set in Vercel
3. App permissions are approved
4. App is in Live mode (not Development)

### **Tokens Not Saving:**

**Check:**
1. Database connection (PostgreSQL)
2. Vercel logs for database errors
3. Token format is correct
4. API endpoint is working

---

## 📊 **Expected Results**

After connecting all platforms:

- ✅ **Facebook:** Connected, posting works
- ✅ **Instagram:** Connected, posting works
- ✅ **Twitter/X:** Connected, posting works
- ✅ **LinkedIn:** Connected, posting works
- ✅ **Nextdoor:** Connected, posting works
- ✅ **Threads:** Connected, posting works

---

**Status:** Ready to connect  
**Next:** Start with Step 1 - Fix Instagram detection  
**Priority:** High
