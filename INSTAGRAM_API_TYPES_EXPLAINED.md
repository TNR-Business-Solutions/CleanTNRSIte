# Instagram API Types - Explained

## 📚 Overview
Instagram offers different APIs for different purposes. This document explains the differences and when to use each.

## 🔍 Instagram API Types

### 1. **Instagram Publishing API** (Your Own Account)
**Purpose:** Post content to YOUR OWN Instagram Business/Creator account

**What it does:**
- Post photos and videos to your Instagram feed
- Post stories
- Manage comments
- Get insights about YOUR account

**Requirements:**
- Your Instagram account must be Business or Creator (not Personal)
- Instagram account must be connected to a Facebook Page
- Facebook Page Access Token (never expires)

**Current Implementation:**
- ✅ Implemented in `server/handlers/post-to-instagram.js`
- ✅ Uses Facebook Page Access Token
- ✅ Posts to your connected Instagram account

**API Endpoint:**
```
POST https://graph.facebook.com/v19.0/{instagram-account-id}/media
```

---

### 2. **Instagram Insights API** (Your Own Account)
**Purpose:** Get metrics and analytics about YOUR OWN Instagram account

**What it does:**
- Get impressions, reach, profile views
- Get engagement metrics
- Get follower counts
- Get website clicks

**Requirements:**
- Your Instagram account must be Business or Creator
- Instagram account must be connected to Facebook Page
- Facebook Page Access Token with insights permissions

**Current Implementation:**
- ✅ Implemented in `server/handlers/get-insights.js`
- ✅ Uses Instagram Business Account ID (not Facebook Page ID)
- ✅ Returns metrics for your own account

**API Endpoint:**
```
GET https://graph.facebook.com/v19.0/{instagram-account-id}/insights
```

**Valid Metrics:**
- `impressions` - Account impressions
- `reach` - Account reach
- `profile_views` - Profile views (may require permissions)
- `website_clicks` - Website clicks (may require permissions)

---

### 3. **Instagram Business Discovery API** (Other Accounts)
**Purpose:** Get public information about OTHER Instagram Business accounts (competitors, clients, etc.)

**What it does:**
- Get follower counts of other accounts
- Get media counts of other accounts
- Get basic metrics (likes, comments) on other accounts' posts
- Analyze competitor accounts

**Requirements:**
- YOUR Instagram account must be Business or Creator
- You need YOUR Instagram User Access Token
- The target account must be public and Business/Creator

**Current Implementation:**
- ❌ NOT YET IMPLEMENTED
- Can be added if needed for competitor analysis

**API Endpoint:**
```
GET https://graph.facebook.com/v19.0/{YOUR-INSTAGRAM-ACCOUNT-ID}?fields=business_discovery.username(COMPETITOR-USERNAME){followers_count,media_count,media}
```

**Example Use Cases:**
- Analyze competitor accounts
- Monitor client accounts
- Track industry trends
- Compare follower growth

---

## 🎯 Which API Should You Use?

### For Your Own Account:
- **Posting Content:** Use Instagram Publishing API (already implemented)
- **Getting Metrics:** Use Instagram Insights API (already implemented)
- **Connection:** Connect via Facebook OAuth (already implemented)

### For Other Accounts:
- **Getting Public Info:** Use Instagram Business Discovery API (can be implemented)
- **Analyzing Competitors:** Use Instagram Business Discovery API (can be implemented)

---

## 🔗 How to Connect Your Instagram Account

### Current Setup (For Your Own Account):

1. **Convert Instagram to Business/Creator**
   - Instagram Settings → Account → Switch to Professional Account
   - Choose "Business" or "Creator"

2. **Connect Instagram to Facebook Page**
   - Facebook Page Settings → Instagram → Connect Account
   - Log in to your Instagram account
   - Authorize the connection

3. **Connect via TNR Dashboard**
   - Go to `/social-media-automation-dashboard.html`
   - Click "🔗 Connect Facebook/Instagram"
   - Complete OAuth flow
   - Grant permissions: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`

4. **Verify Connection**
   - Check dashboard connection status
   - Should show: ✅ Connected to: [Facebook Page]
   - Should show: 📷 Instagram: @[Your Instagram Username]

---

## 💡 Business Discovery API - Implementation

If you want to analyze OTHER Instagram accounts (competitors, clients), we can implement Business Discovery API.

### What It Would Do:
- Enter a competitor's Instagram username
- Get their follower count
- Get their media count
- Get their recent posts' engagement metrics
- Compare with your account

### Implementation Requirements:
- Need YOUR Instagram User Access Token (different from Page Token)
- Your account must be Business or Creator
- Target accounts must be public Business/Creator accounts

### Would You Like This Feature?
If you want competitor analysis functionality, I can implement:
- Business Discovery API handler
- Dashboard UI for entering competitor usernames
- Comparison charts and metrics
- Competitor monitoring dashboard

---

## 📋 Current Status

### ✅ Implemented:
- Instagram Publishing API (post to your account)
- Instagram Insights API (metrics for your account)
- Facebook OAuth connection
- Token management
- Error handling

### ❌ Not Yet Implemented:
- Instagram Business Discovery API (analyze other accounts)
- Competitor analysis features
- Media-level insights (individual post metrics)

---

## 🆘 Need Help?

If you're trying to connect YOUR Instagram account:
1. Follow the connection guide: `INSTAGRAM_CONNECTION_GUIDE.md`
2. Make sure your account is Business/Creator
3. Connect Instagram to Facebook Page
4. Reconnect via OAuth in dashboard

If you want to analyze OTHER accounts:
- We can implement Business Discovery API
- This requires additional setup
- Let me know if you want this feature!

---

**Last Updated:** 2025-01-12
**API Version:** Facebook Graph API v19.0

