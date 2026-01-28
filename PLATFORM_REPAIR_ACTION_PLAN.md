# 🔧 Platform Repair Action Plan
**Date:** January 27, 2026  
**Goal:** Fully repair all platform connections in order

---

## 📋 **Platform Priority Order**

1. ✅ **Meta (Facebook & Instagram)** - Currently working, needs verification
2. ⚙️ **LinkedIn** - OAuth ready, needs connection
3. ⚙️ **Twitter/X** - OAuth ready, needs connection
4. ⚙️ **Threads** - Meta platform, needs setup
5. ⚙️ **Nextdoor** - OAuth ready, needs connection
6. ⚙️ **Google Analytics** - API key setup required
7. ⚙️ **Facebook Pixel** - API key setup required
8. ⚙️ **Google Business Profile** - API key setup required

---

## 🎯 **Step 1: Meta (Facebook & Instagram) - VERIFY & FIX**

### **Current Status:**
- ✅ App installed: TNR Social Automation (ID: 2201740210361183)
- ✅ Business verified
- ✅ App in Live mode
- ⚠️ Need to verify redirect URI
- ⚠️ Need to verify Instagram connection

### **Action Items:**

#### **A. Verify Meta App Settings**

1. **Check Redirect URI:**
   - Go to: [Meta App Dashboard](https://developers.facebook.com/apps/2201740210361183/fb-login/settings/)
   - Navigate to: **Facebook Login → Settings**
   - Verify redirect URI exists:
     ```
     https://www.tnrbusinesssolutions.com/api/auth/meta/callback
     ```
   - If missing, add it

2. **Verify Permissions:**
   - Go to: **App Review → Permissions and Features**
   - Ensure approved:
     - `pages_manage_posts`
     - `pages_read_engagement`
     - `pages_show_list`
     - `pages_manage_metadata`

3. **Check Instagram Connection:**
   - Go to: [Facebook Page Settings](https://www.facebook.com/TNRBusinessSolutions/settings/)
   - Navigate to: **Instagram** section
   - Verify Instagram Business Account is connected
   - If not connected:
     - Click "Connect Account"
     - Follow prompts
     - Ensure account is Business/Creator (not Personal)

#### **B. Verify Vercel Environment Variables**

1. **Check Variables:**
   - Go to: [Vercel Dashboard](https://vercel.com/tnr-business-solutions-projects/tnr-business-solutions/settings/environment-variables)
   - Verify:
     ```
     META_APP_ID=2201740210361183
     META_APP_SECRET=your_secret_here
     META_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/meta/callback
     ```
   - If missing, add them
   - Ensure set for **Production** environment

#### **C. Test OAuth Flow**

1. **Test Connection:**
   - Go to: `https://www.tnrbusinesssolutions.com/platform-connections.html`
   - Click: "Connect Facebook"
   - Complete OAuth flow
   - Verify success page shows:
     - ✅ Facebook Page connected
     - ✅ Instagram account detected (if connected)

2. **Verify Token Storage:**
   - Go to: `https://www.tnrbusinesssolutions.com/social-media-automation-dashboard.html`
   - Check console for:
     - `✅ Authentication token found`
     - `✅ Connected to: TNR Business Solutions`
     - `📷 Instagram: @tnrbusinesssolutions` (if connected)

3. **Test Posting:**
   - Create test post
   - Post to Facebook → Verify success
   - Post to Instagram → Verify success (if connected)

---

## 🎯 **Step 2: LinkedIn - CONNECT**

### **Current Status:**
- ✅ OAuth flow implemented
- ⚠️ Needs connection

### **Action Items:**

1. **Get LinkedIn App Credentials:**
   - Go to: [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
   - Create app or use existing
   - Get:
     - Client ID
     - Client Secret
     - Redirect URI: `https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback`

2. **Set Environment Variables:**
   ```
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   LINKEDIN_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback
   ```

3. **Test Connection:**
   - Go to: `/platform-connections.html`
   - Click: "Connect LinkedIn"
   - Complete OAuth flow
   - Verify tokens saved

---

## 🎯 **Step 3: Twitter/X - CONNECT**

### **Current Status:**
- ✅ OAuth flow implemented
- ⚠️ Needs connection

### **Action Items:**

1. **Get Twitter App Credentials:**
   - Go to: [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create app or use existing
   - Get:
     - API Key
     - API Secret
     - Bearer Token
     - OAuth 2.0 credentials

2. **Set Environment Variables:**
   ```
   TWITTER_CLIENT_ID=your_client_id
   TWITTER_CLIENT_SECRET=your_client_secret
   TWITTER_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/twitter/callback
   ```

3. **Test Connection:**
   - Go to: `/platform-connections.html`
   - Click: "Connect Twitter"
   - Complete OAuth flow
   - Verify tokens saved

---

## 🎯 **Step 4: Threads - SETUP**

### **Current Status:**
- ✅ Threads App ID: 1453925242353888
- ⚠️ Needs Meta integration

### **Action Items:**

1. **Verify Threads App:**
   - Go to: Meta App Dashboard
   - Check: Threads app ID is configured
   - Verify: Threads display name is set

2. **Add Threads Permissions:**
   - Request Threads-specific permissions
   - Complete app review if needed

3. **Test Connection:**
   - Use Meta OAuth flow
   - Verify Threads account detected
   - Test posting to Threads

---

## 🎯 **Step 5: Nextdoor - CONNECT**

### **Current Status:**
- ✅ OAuth flow implemented
- ⚠️ Needs connection

### **Action Items:**

1. **Get Nextdoor App Credentials:**
   - Go to: [Nextdoor Developer Portal](https://developer.nextdoor.com/)
   - Create app or use existing
   - Get OAuth credentials

2. **Set Environment Variables:**
   ```
   NEXTDOOR_CLIENT_ID=your_client_id
   NEXTDOOR_CLIENT_SECRET=your_client_secret
   NEXTDOOR_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/nextdoor/callback
   ```

3. **Test Connection:**
   - Go to: `/platform-connections.html`
   - Click: "Connect Nextdoor"
   - Complete OAuth flow
   - Verify tokens saved

---

## 🎯 **Step 6: Google Analytics - SETUP**

### **Current Status:**
- ⚙️ Requires API key setup

### **Action Items:**

1. **Get GA4 Property ID:**
   - Go to: [Google Analytics](https://analytics.google.com/)
   - Select GA4 property
   - Get Property ID (format: `123456789`)

2. **Get OAuth Token:**
   - Go to: [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Google Analytics Data API"
   - Create OAuth 2.0 credentials
   - Generate access token

3. **Set Environment Variables:**
   ```
   GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id
   GOOGLE_ANALYTICS_ACCESS_TOKEN=your_oauth_token
   ```

4. **Test Analytics:**
   - Go to: `/admin/analytics/`
   - Click: "Refresh Platform Data"
   - Verify Google Analytics metrics appear

---

## 🎯 **Step 7: Facebook Pixel - SETUP**

### **Current Status:**
- ⚙️ Requires API key setup

### **Action Items:**

1. **Get Pixel ID:**
   - Go to: [Facebook Events Manager](https://business.facebook.com/events_manager)
   - Select or create Pixel
   - Get Pixel ID (numeric)

2. **Get Access Token:**
   - Go to: [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Generate token with `ads_read` permission

3. **Set Environment Variables:**
   ```
   FACEBOOK_PIXEL_ID=your_pixel_id
   FACEBOOK_PIXEL_ACCESS_TOKEN=your_access_token
   ```

4. **Test Analytics:**
   - Go to: `/admin/analytics/`
   - Click: "Refresh Platform Data"
   - Verify Facebook Pixel metrics appear

---

## 🎯 **Step 8: Google Business Profile - SETUP**

### **Current Status:**
- ⚙️ Requires API key setup

### **Action Items:**

1. **Get Location ID:**
   - Go to: [Google Business Profile](https://business.google.com/)
   - Select location
   - Get Location ID

2. **Get OAuth Token:**
   - Go to: [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Google My Business API"
   - Create OAuth 2.0 credentials
   - Generate access token

3. **Set Environment Variables:**
   ```
   GOOGLE_BUSINESS_LOCATION_ID=your_location_id
   GOOGLE_BUSINESS_ACCESS_TOKEN=your_oauth_token
   ```

4. **Test Analytics:**
   - Go to: `/admin/analytics/`
   - Click: "Refresh Platform Data"
   - Verify Google Business metrics appear

---

## ✅ **Verification Checklist**

After completing each platform:

- [ ] OAuth flow completes successfully
- [ ] Tokens saved to database
- [ ] Connection status shows "Connected"
- [ ] Test posting works
- [ ] Analytics data appears (for analytics platforms)

---

## 📊 **Progress Tracking**

- [ ] **Step 1:** Meta (Facebook & Instagram) - VERIFY
- [ ] **Step 2:** LinkedIn - CONNECT
- [ ] **Step 3:** Twitter/X - CONNECT
- [ ] **Step 4:** Threads - SETUP
- [ ] **Step 5:** Nextdoor - CONNECT
- [ ] **Step 6:** Google Analytics - SETUP
- [ ] **Step 7:** Facebook Pixel - SETUP
- [ ] **Step 8:** Google Business Profile - SETUP

---

**Status:** Ready to begin  
**Next:** Start with Step 1 - Meta verification  
**Priority:** High
