# ✅ TNR Business Solutions - Quick Setup Checklist
**Date:** December 9, 2025  
**Purpose:** Quick reference for connecting all platforms

---

## 🚀 **Quick Start (5 Minutes Each)**

### **OAuth Platforms - Connect via Dashboard:**

1. **Facebook & Instagram** 📘📷
   - Go to: `https://www.tnrbusinesssolutions.com/platform-connections.html`
   - Click: "Connect Facebook"
   - Authorize: TNR Business Solutions Facebook Page
   - ✅ Instagram auto-connects if linked to Facebook Page

2. **LinkedIn** 💼
   - Go to: `https://www.tnrbusinesssolutions.com/platform-connections.html`
   - Click: "Connect LinkedIn"
   - Authorize: TNR Business Solutions Company Page

3. **Twitter/X** 🐦
   - Go to: `https://www.tnrbusinesssolutions.com/platform-connections.html`
   - Click: "Connect Twitter"
   - Authorize: TNR Business Solutions Twitter account

4. **Threads** 🧵
   - Go to: `https://www.tnrbusinesssolutions.com/platform-connections.html`
   - Click: "Connect Threads"
   - Authorize: Meta account (same as Facebook)

5. **Nextdoor** 🏘️
   - Go to: `https://www.tnrbusinesssolutions.com/platform-connections.html`
   - Click: "Connect Nextdoor"
   - Authorize: TNR Business Solutions Business account

---

## ⚙️ **API Key Platforms - Set in Vercel (15 Minutes Each)**

### **1. Google Analytics** 🔍

**Steps:**
1. Get Property ID from [Google Analytics](https://analytics.google.com/)
2. Go to [Google Cloud Console](https://console.cloud.google.com/)
3. Enable "Google Analytics Data API"
4. Create OAuth 2.0 credentials
5. Generate access token

**Set in Vercel:**
```
GOOGLE_ANALYTICS_PROPERTY_ID=your-property-id
GOOGLE_ANALYTICS_ACCESS_TOKEN=your-oauth-token
```

---

### **2. Facebook Pixel** 📊

**Steps:**
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Get Pixel ID (numeric)
3. Generate access token with `ads_read` permission
   - Use [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

**Set in Vercel:**
```
FACEBOOK_PIXEL_ID=your-pixel-id
FACEBOOK_PIXEL_ACCESS_TOKEN=your-access-token
```

---

### **3. Google Business Profile** 🏢

**Steps:**
1. Go to [Google Business Profile](https://business.google.com/)
2. Get Location ID
3. Go to [Google Cloud Console](https://console.cloud.google.com/)
4. Enable "Google My Business API"
5. Create OAuth 2.0 credentials
6. Generate access token

**Set in Vercel:**
```
GOOGLE_BUSINESS_LOCATION_ID=your-location-id
GOOGLE_BUSINESS_ACCESS_TOKEN=your-oauth-token
```

---

## ✅ **Verification**

After connecting each platform:

1. **Go to Analytics Dashboard:**
   - `https://www.tnrbusinesssolutions.com/admin/analytics/`

2. **Click "Refresh Platform Data"**

3. **Verify metrics appear** for connected platforms

---

## 📊 **Expected Results**

Once all platforms are connected, you should see:

- ✅ **Facebook**: Impressions, Reach, Engaged Users, Total Fans
- ✅ **Instagram**: Impressions, Reach, Profile Views
- ✅ **LinkedIn**: Followers, Impressions, Engagement, Shares
- ✅ **Twitter**: Tweets, Likes, Retweets, Impressions
- ✅ **Threads**: Impressions, Reach, Likes, Comments
- ✅ **Nextdoor**: Community engagement metrics
- ⚙️ **Google Analytics**: Users, Page Views, Sessions, Bounce Rate
- ⚙️ **Facebook Pixel**: Events, Page Views, Conversions
- ⚙️ **Google Business**: Queries, Views, Actions

---

## 🔄 **Auto-Refresh**

✅ **Configured:** Analytics refresh every **5 minutes** when:
- User is logged into admin dashboard
- Dashboard page is visible
- User is actively viewing

**Manual Refresh:** Click "🔄 Refresh" anytime

---

## 🆘 **Need Help?**

See full setup guide: `TNR_BUSINESS_SOLUTIONS_SETUP_GUIDE.md`

---

**Status:** Ready for Setup  
**Total Platforms:** 9 platforms  
**Auto-Refresh:** 5 minutes
