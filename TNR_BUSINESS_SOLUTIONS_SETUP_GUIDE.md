# 🚀 TNR Business Solutions - Complete Platform Setup Guide
**Date:** December 9, 2025  
**Purpose:** Connect all TNR Business Solutions profiles to automation and analytics tools

---

## 📋 **Platform Connection Checklist**

### ✅ **Already Configured (OAuth)**
These platforms use OAuth and are automatically detected:

- [ ] **Facebook** - TNR Business Solutions Page
- [ ] **Instagram** - @tnrbusinesssolutions
- [ ] **LinkedIn** - TNR Business Solutions Company Page
- [ ] **Twitter/X** - TNR Business Solutions Account
- [ ] **Threads** - TNR Business Solutions Account
- [ ] **Nextdoor** - TNR Business Solutions Business Profile

### ⚙️ **Requires Manual Configuration**
These platforms need environment variables or API keys:

- [ ] **Google Analytics** - GA4 Property
- [ ] **Facebook Pixel** - Pixel ID
- [ ] **Google Business Profile** - Location ID

---

## 🔧 **Step-by-Step Setup Instructions**

### **1. Facebook & Instagram** 📘📷

**Current Status:** ✅ OAuth Flow Available

**To Connect:**
1. Go to Admin Dashboard → Social Media → Platform Connections
2. Click "Connect Facebook"
3. Authorize TNR Business Solutions Facebook Page
4. Instagram will automatically connect if linked to Facebook Page

**Verify Connection:**
- Check that Facebook Page token is saved
- Verify Instagram Business Account ID is captured
- Test by posting to Facebook/Instagram from dashboard

**Required Permissions:**
- `pages_manage_posts` - Post to Facebook
- `pages_read_engagement` - Read analytics
- `pages_show_list` - List pages

**Profile Details:**
- **Facebook Page:** TNR Business Solutions
- **Instagram:** @tnrbusinesssolutions
- **Page ID:** (Captured automatically during OAuth)

---

### **2. LinkedIn** 💼

**Current Status:** ✅ OAuth Flow Available

**To Connect:**
1. Go to Admin Dashboard → Social Media → Platform Connections
2. Click "Connect LinkedIn"
3. Authorize with LinkedIn account that manages TNR Business Solutions Company Page
4. Grant required permissions

**Verify Connection:**
- Check that LinkedIn access token is saved
- Verify organization ID is captured
- Test by posting to LinkedIn from dashboard

**Required Permissions:**
- `w_member_social` - Post content
- `r_organization_social` - Read company data
- `openid`, `profile` - User identification

**Profile Details:**
- **Company:** TNR Business Solutions
- **Organization ID:** (Captured automatically during OAuth)

---

### **3. Twitter/X** 🐦

**Current Status:** ✅ OAuth Flow Available

**To Connect:**
1. Go to Admin Dashboard → Social Media → Platform Connections
2. Click "Connect Twitter/X"
3. Authorize TNR Business Solutions Twitter account
4. Grant required permissions

**Verify Connection:**
- Check that Twitter access token is saved
- Verify user ID is captured
- Test by posting to Twitter from dashboard

**Required Permissions:**
- `tweet.read` - Read tweets
- `tweet.write` - Post tweets
- `users.read` - Read user data
- `offline.access` - Refresh token

**Profile Details:**
- **Twitter Handle:** @tnrbusinesssolutions (or your actual handle)
- **User ID:** (Captured automatically during OAuth)

---

### **4. Threads** 🧵

**Current Status:** ✅ OAuth Flow Available (Meta Platform)

**To Connect:**
1. Go to Admin Dashboard → Social Media → Platform Connections
2. Click "Connect Threads"
3. Authorize with Meta account (same as Facebook)
4. Threads uses Meta's API

**Verify Connection:**
- Check that Threads access token is saved
- Verify thread ID is captured
- Test by posting to Threads from dashboard

**Profile Details:**
- **Threads Account:** TNR Business Solutions
- **Thread ID:** (Captured automatically during OAuth)

---

### **5. Nextdoor** 🏘️

**Current Status:** ✅ OAuth Flow Available

**To Connect:**
1. Go to Admin Dashboard → Social Media → Platform Connections
2. Click "Connect Nextdoor"
3. Authorize TNR Business Solutions Nextdoor Business account
4. Grant required permissions

**Verify Connection:**
- Check that Nextdoor access token is saved
- Verify user ID is captured
- Test by posting to Nextdoor from dashboard

**Profile Details:**
- **Business Name:** TNR Business Solutions
- **User ID:** (Captured automatically during OAuth)

---

### **6. Google Analytics** 🔍

**Current Status:** ⚙️ Requires Manual Setup

**To Connect:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create or select GA4 property for TNR Business Solutions website
3. Get your Property ID (format: `123456789`)
4. Go to [Google Cloud Console](https://console.cloud.google.com/)
5. Create a project or use existing
6. Enable "Google Analytics Data API"
7. Create OAuth 2.0 credentials
8. Generate access token

**Set Environment Variables in Vercel:**
```
GOOGLE_ANALYTICS_PROPERTY_ID=your-property-id
GOOGLE_ANALYTICS_ACCESS_TOKEN=your-oauth-token
```

**Verify Connection:**
- Go to Analytics Dashboard
- Click "Refresh Platform Data"
- Check that Google Analytics metrics appear

**Profile Details:**
- **Property:** TNR Business Solutions Website
- **Property ID:** (Get from GA4 admin)

---

### **7. Facebook Pixel** 📊

**Current Status:** ⚙️ Requires Manual Setup

**To Connect:**
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select or create Pixel for TNR Business Solutions
3. Get your Pixel ID (numeric, e.g., `123456789012345`)
4. Generate access token with `ads_read` permission
   - Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Select your app
   - Generate token with `ads_read` permission

**Set Environment Variables in Vercel:**
```
FACEBOOK_PIXEL_ID=your-pixel-id
FACEBOOK_PIXEL_ACCESS_TOKEN=your-access-token
```

**Verify Connection:**
- Go to Analytics Dashboard
- Click "Refresh Platform Data"
- Check that Facebook Pixel metrics appear

**Profile Details:**
- **Pixel Name:** TNR Business Solutions Pixel
- **Pixel ID:** (Get from Events Manager)

---

### **8. Google Business Profile** 🏢

**Current Status:** ⚙️ Requires Manual Setup

**To Connect:**
1. Go to [Google Business Profile](https://business.google.com/)
2. Select TNR Business Solutions location
3. Get your Location ID
   - In Google Business Profile Manager, the Location ID is in the URL or API
4. Go to [Google Cloud Console](https://console.cloud.google.com/)
5. Enable "Google My Business API"
6. Create OAuth 2.0 credentials
7. Generate access token with Business Profile access

**Set Environment Variables in Vercel:**
```
GOOGLE_BUSINESS_LOCATION_ID=your-location-id
GOOGLE_BUSINESS_ACCESS_TOKEN=your-oauth-token
```

**Verify Connection:**
- Go to Analytics Dashboard
- Click "Refresh Platform Data"
- Check that Google Business metrics appear

**Profile Details:**
- **Business Name:** TNR Business Solutions
- **Location ID:** (Get from Business Profile Manager)

---

## 🔄 **Auto-Refresh Configuration**

**Current Setting:** ✅ **5 Minutes** (when dashboard is active)

The analytics dashboard automatically refreshes every 5 minutes when:
- ✅ User is logged into admin dashboard
- ✅ Dashboard page is visible (not in background tab)
- ✅ User is actively viewing the analytics page
- ✅ Page visibility API detects user is viewing the page

**Features:**
- Only refreshes when page is visible (saves resources)
- Automatically refreshes when user returns to tab
- Manual refresh available anytime via "🔄 Refresh" button
- Platform-specific refresh via "🔄 Refresh Platform Data" button

**Manual Refresh:**
- Click "🔄 Refresh" button anytime
- Click "🔄 Refresh Platform Data" for platform-specific data

---

## ✅ **Verification Steps**

### **1. Check OAuth Connections**
1. Go to Admin Dashboard → Social Media → Platform Connections
2. Verify all platforms show "Connected" status
3. Test each platform by posting a test message

### **2. Check Analytics Data**
1. Go to Admin Dashboard → Analytics
2. Click "Refresh Platform Data"
3. Verify metrics appear for each connected platform:
   - Facebook: Impressions, Reach, Engaged Users
   - Instagram: Impressions, Reach, Profile Views
   - LinkedIn: Followers, Impressions, Engagement
   - Twitter: Tweets, Likes, Retweets, Impressions
   - Threads: Impressions, Reach, Likes, Comments
   - Nextdoor: Community engagement metrics
   - Google Analytics: Users, Page Views, Sessions
   - Facebook Pixel: Events, Page Views, Conversions
   - Google Business: Queries, Views, Actions

### **3. Test Automation**
1. Go to Social Media Automation Dashboard
2. Create a test post
3. Select multiple platforms
4. Verify post publishes to all selected platforms

---

## 🚨 **Troubleshooting**

### **OAuth Not Working**
- Clear browser cache and cookies
- Re-authorize the platform
- Check that redirect URIs match in platform developer console
- Verify environment variables are set correctly

### **Analytics Not Showing**
- Click "Refresh Platform Data" button
- Check browser console for errors
- Verify API tokens are valid and not expired
- Check Vercel logs for API errors

### **Platform Not Appearing**
- Verify platform is connected via OAuth
- Check that tokens are saved in database
- Ensure environment variables are set (for Google Analytics, Pixel, Business Profile)

---

## 📊 **Current Connection Status**

To check current status:
1. Go to Admin Dashboard → Analytics
2. Click "Refresh Platform Data"
3. Review which platforms show data

**Expected Platforms:**
- ✅ Facebook (if OAuth connected)
- ✅ Instagram (if connected to Facebook Page)
- ✅ LinkedIn (if OAuth connected)
- ✅ Twitter/X (if OAuth connected)
- ✅ Threads (if OAuth connected)
- ✅ Nextdoor (if OAuth connected)
- ⚙️ Google Analytics (if environment variables set)
- ⚙️ Facebook Pixel (if environment variables set)
- ⚙️ Google Business Profile (if environment variables set)

## 🎯 **Quick Connection Checklist for TNR Business Solutions**

### **OAuth Platforms (Connect via Dashboard):**
1. [ ] **Facebook** → Go to `/platform-connections.html` → Click "Connect Facebook"
2. [ ] **Instagram** → Automatically connects when Facebook is connected (if Instagram Business Account is linked)
3. [ ] **LinkedIn** → Go to `/platform-connections.html` → Click "Connect LinkedIn"
4. [ ] **Twitter/X** → Go to `/platform-connections.html` → Click "Connect Twitter"
5. [ ] **Threads** → Go to `/platform-connections.html` → Click "Connect Threads"
6. [ ] **Nextdoor** → Go to `/platform-connections.html` → Click "Connect Nextdoor"

### **API Key Platforms (Set Environment Variables in Vercel):**
1. [ ] **Google Analytics**
   - Get Property ID from GA4
   - Get OAuth token from Google Cloud Console
   - Set: `GOOGLE_ANALYTICS_PROPERTY_ID` and `GOOGLE_ANALYTICS_ACCESS_TOKEN`

2. [ ] **Facebook Pixel**
   - Get Pixel ID from Events Manager
   - Get access token with `ads_read` permission
   - Set: `FACEBOOK_PIXEL_ID` and `FACEBOOK_PIXEL_ACCESS_TOKEN`

3. [ ] **Google Business Profile**
   - Get Location ID from Business Profile Manager
   - Get OAuth token from Google Cloud Console
   - Set: `GOOGLE_BUSINESS_LOCATION_ID` and `GOOGLE_BUSINESS_ACCESS_TOKEN`

## 🔗 **Direct Connection URLs**

**Production (Vercel):**
- Facebook/Instagram: `https://www.tnrbusinesssolutions.com/auth/meta`
- LinkedIn: `https://www.tnrbusinesssolutions.com/auth/linkedin`
- Twitter/X: `https://www.tnrbusinesssolutions.com/auth/twitter`
- Threads: `https://www.tnrbusinesssolutions.com/auth/threads`
- Nextdoor: `https://www.tnrbusinesssolutions.com/auth/nextdoor`

**Or use the Platform Connections page:**
- `https://www.tnrbusinesssolutions.com/platform-connections.html`

---

## 🎯 **Quick Setup Summary**

### **For OAuth Platforms (5 minutes each):**
1. Go to Platform Connections page
2. Click "Connect [Platform]"
3. Authorize with TNR Business Solutions account
4. Done!

### **For API Key Platforms (15 minutes each):**
1. Get API credentials from platform
2. Set environment variables in Vercel
3. Redeploy or wait for next deployment
4. Test in Analytics Dashboard

---

## 📞 **Support**

If you need help with setup:
1. Check platform-specific documentation in `/docs` folder
2. Review Vercel logs for error messages
3. Verify all environment variables are set correctly
4. Test each platform connection individually

---

**Last Updated:** December 9, 2025  
**Auto-Refresh Interval:** 5 minutes (when dashboard active)  
**Total Platforms:** 9 platforms supported
