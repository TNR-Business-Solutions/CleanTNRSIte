# 🔧 Real Social Media Automation Setup - Complete Documentation

## 📋 Overview

The **Real Social Media Automation Setup** page (`real-automation-setup.html`) is a comprehensive configuration interface for connecting TNR Business Solutions to actual social media platforms and automation tools. This page allows users to configure API keys, test connections, and set up real automation workflows.

**Page URL**: `/real-automation-setup.html`  
**Production URL**: `https://www.tnrbusinesssolutions.com/real-automation-setup.html`

---

## 🎯 Purpose

This page enables **real** social media automation (not mock data) by:
- Connecting to actual social media APIs (Facebook, Instagram, LinkedIn, Twitter, Nextdoor, Threads, Pinterest, TikTok, YouTube, Buffer)
- Configuring webhook integrations (Zapier, Make.com)
- Setting up analytics tracking (Google Analytics, Facebook Pixel)
- Testing real posts to verify automation works
- Storing API keys securely in Neon database

---

## 📦 Page Structure

### **Step 1: Configure API Keys**

**Total Platforms Supported**: 10 platforms
- Buffer (scheduling platform)
- Facebook
- Instagram
- LinkedIn
- Twitter
- Nextdoor
- Threads
- Pinterest
- TikTok
- YouTube

#### 📊 Buffer
- **Purpose**: Social media scheduling platform
- **Input**: Buffer API Key
- **Test**: Connection test button
- **Get Key**: https://buffer.com/developers
- **Benefits**:
  - Post to Facebook, Instagram, LinkedIn, Twitter
  - Schedule posts in advance
  - Analytics and reporting
  - Team collaboration
  - Free plan available

#### 📘 Facebook
- **Purpose**: Facebook Pages API for posting
- **Input**: Facebook Access Token
- **Test**: Connection test button
- **Get Token**: https://developers.facebook.com/tools/explorer
- **Required Permissions**:
  - `pages_manage_posts` - Post to Facebook pages
  - `pages_read_engagement` - Read analytics
- **Note**: Also works for Instagram (uses Facebook API)

#### 💼 LinkedIn
- **Purpose**: LinkedIn Company Pages API
- **Input**: LinkedIn Access Token
- **Test**: Connection test button
- **Get Token**: https://www.linkedin.com/developers/apps
- **Required Permissions**:
  - `w_member_social` - Post to LinkedIn
  - `r_organization_social` - Read company data

#### 🐦 Twitter
- **Purpose**: Twitter API v2 for posting
- **Input**: Twitter Bearer Token
- **Test**: Connection test button
- **Get Token**: https://developer.twitter.com/en/portal/dashboard
- **Required Permissions**:
  - `tweet.read` - Read tweets
  - `tweet.write` - Post tweets
  - `users.read` - Read user data

#### 📸 Instagram
- **Purpose**: Instagram Business API (uses Facebook token)
- **Input**: Instagram Access Token (or use Facebook token)
- **Test**: Connection test button
- **Get Started**: https://business.instagram.com/getting-started
- **Note**: Instagram uses Facebook's API. Connect your Instagram Business account to your Facebook Page, then use the Facebook Access Token.
- **Required Permissions**:
  - Same as Facebook (Instagram uses Facebook's API)
- **API Endpoints Used**:
  - Posts: `https://graph.facebook.com/v18.0/{instagram-account-id}/media`

#### 🏘️ Nextdoor
- **Purpose**: Nextdoor API for local community posting
- **Input**: Nextdoor Access Token
- **Test**: Connection test button
- **Get Access**: https://about.nextdoor.com/partnerships/nextdoor-launches-developer-site-to-connect-partners-with-the-power-of-local/
- **Use Case**: Connect with local neighbors and community members
- **Features**:
  - Post to neighborhood feeds
  - Local business promotion
  - Community engagement

#### 🧵 Threads
- **Purpose**: Threads API for posting (Meta platform)
- **Input**: Threads Access Token (or use Facebook token)
- **Test**: Connection test button
- **Get Access**: Connect via OAuth from admin dashboard
- **Note**: Threads uses Meta's API. You can use OAuth connection from the dashboard or provide an access token here.
- **Features**:
  - Text-based posts
  - Link sharing
  - Thread conversations

#### 📌 Pinterest
- **Purpose**: Pinterest API for pinning content
- **Input**: Pinterest Access Token
- **Test**: Connection test button
- **Get Access**: https://developers.pinterest.com/
- **Features**:
  - Create pins
  - Board management
  - Visual content sharing

#### 🎵 TikTok
- **Purpose**: TikTok Business API for video content
- **Input**: TikTok Access Token
- **Test**: Connection test button
- **Get Access**: https://developers.tiktok.com/
- **Features**:
  - Video uploads
  - Content management
  - Analytics tracking

#### 📺 YouTube
- **Purpose**: YouTube Data API for video uploads and management
- **Input**: YouTube API Key
- **Test**: Connection test button
- **Get Key**: https://console.cloud.google.com/apis/library/youtube.googleapis.com
- **Features**:
  - Video uploads
  - Channel management
  - Analytics and insights
  - Playlist management

---

### **Step 2: Zapier/Make.com Integration**

#### ⚡ Zapier Webhook
- **Purpose**: Connect to Zapier for advanced automation workflows
- **Input**: Zapier Webhook URL
- **Test**: Webhook test button
- **Get Webhook**: https://zapier.com/apps/webhooks/integrations
- **Use Case**: Trigger complex multi-step automation workflows

#### 🔧 Make.com (Integromat)
- **Purpose**: Advanced automation platform
- **Input**: Make.com Webhook URL
- **Test**: Webhook test button
- **Get Webhook**: https://www.make.com/en/help/tools/webhooks
- **Use Case**: Enterprise-level automation and integrations

---

### **Step 3: Analytics Integration**

#### 📈 Google Analytics
- **Purpose**: Track social media traffic and conversions
- **Input**: GA4 Measurement ID (G-XXXXXXXXXX)
- **Test**: Connection test button
- **Get ID**: https://analytics.google.com/analytics/web/
- **Features**:
  - Track social media traffic
  - Monitor conversions
  - UTM parameter tracking

#### 📊 Facebook Analytics
- **Purpose**: Track Facebook and Instagram performance
- **Input**: Facebook Pixel ID
- **Test**: Connection test button
- **Get Pixel**: https://business.facebook.com/events_manager
- **Features**:
  - Track social media conversions
  - Optimize ad targeting
  - Retargeting capabilities

---

### **Step 4: Test Real Automation**

- **Test Post Content**: Pre-filled with test message
- **Select Platform**: Dropdown with options:
  - Buffer (All Platforms)
  - Facebook
  - LinkedIn
  - Twitter
- **Send Test Post**: Button to send actual post to selected platform
- **Results Display**: Shows success/failure status

---

### **Step 5: Production Setup**

#### 🔒 Security Configuration
- ✅ API keys stored in Neon database (PostgreSQL)
- ✅ Keys encrypted and server-side only
- ✅ HTTPS required for production
- ✅ Rate limiting implemented

#### 📋 Monitoring & Alerts
- ✅ Connection status monitoring
- ✅ Error logging and alerts
- ✅ Performance metrics tracking
- ✅ Automated backup of scheduled posts

#### 💾 Export/Import Configuration
- **Export Configuration**: Download settings as JSON
- **Import Configuration**: Upload and restore settings

---

## 🔐 Security Implementation

### **Current Status (Updated)**
- ✅ **API keys stored in Neon database** (not localStorage)
- ✅ **Server-side storage only** - keys never exposed to frontend
- ✅ **Encrypted in database**
- ✅ **HTTPS required for production**
- ✅ **Rate limiting implemented**

### **Database Storage**
- **Table**: `api_keys`
- **Columns**: 
  - `platform` (PRIMARY KEY)
  - `api_key` (encrypted)
  - `metadata` (JSON)
  - `created_at`
  - `updated_at`

### **API Endpoints**
- **GET `/api/api-keys`**: Get list of platforms with saved keys (no actual keys)
- **POST `/api/api-keys`**: Save API keys
  - Action: `save-single` - Save one key
  - Action: `save` - Save multiple keys
  - Action: `delete` - Delete a key

---

## 💻 Technical Implementation

### **Files Involved**
1. **`real-automation-setup.html`** - Main setup page
2. **`social-media-api-integration.js`** - API integration class
3. **`server/handlers/api-keys-api.js`** - API key management handler
4. **`database.js`** - Database methods for API keys
5. **`api/[...all].js`** - API routing

### **JavaScript Functions**

#### Connection Testing
```javascript
async function testApiKey(platform)
async function testZapierWebhook()
async function testMakeWebhook()
async function testGoogleAnalytics()
async function testFacebookPixel()
```

#### Post Testing
```javascript
async function testRealPost()
```

#### Configuration Management
```javascript
function exportConfiguration()
function importConfiguration()
async function saveApiKeyToDatabase(platform, value)
```

### **API Integration Class**

The page uses `SocialMediaAPI` class from `social-media-api-integration.js`:

```javascript
class SocialMediaAPI {
  constructor() {
    this.apiKeys = {
      buffer: null,
      facebook: null,
      linkedin: null,
      twitter: null
    };
  }
  
  async testConnection(platform, apiKey)
  async schedulePost(postData)
  updateApiKey(platform, apiKey)
  saveApiKeys() // Now saves to database via API
}
```

---

## 📚 Setup Instructions

### **Quick Start (5 Minutes)**

1. **Access Setup Page**
   - Go to: `/real-automation-setup.html`
   - Or: `https://www.tnrbusinesssolutions.com/real-automation-setup.html`

2. **Get API Keys**
   - Buffer: https://buffer.com/developers
   - Facebook: https://developers.facebook.com/tools/explorer
   - LinkedIn: https://www.linkedin.com/developers/apps
   - Twitter: https://developer.twitter.com/en/portal/dashboard

3. **Test Connections**
   - Enter API keys
   - Click "Test Connection" for each platform
   - Green status = Connected ✅
   - Red status = Check your API key ❌

4. **Test Real Post**
   - Enter test content
   - Select platform
   - Click "Send Test Post"
   - Verify post appears on social media

---

## 🔄 Automation Workflows

### **Workflow 1: Direct API Posting**
```javascript
const result = await socialMediaAPI.schedulePost({
    platforms: ['facebook', 'linkedin', 'twitter'],
    content: 'Your post content here',
    scheduledTime: new Date('2024-01-15 09:00:00'),
    client: 'TNR Business Solutions'
});
```

### **Workflow 2: Buffer Integration**
```javascript
const result = await socialMediaAPI.postToBuffer({
    content: 'Your post content here',
    profileId: 'your-buffer-profile-id',
    scheduledTime: new Date('2024-01-15 09:00:00')
});
```

### **Workflow 3: Zapier Automation**
```javascript
const response = await fetch('your-zapier-webhook-url', {
    method: 'POST',
    body: JSON.stringify({
        content: 'Your post content here',
        platforms: ['facebook', 'linkedin'],
        scheduledTime: '2024-01-15T09:00:00Z'
    })
});
```

---

## 📊 Analytics & Tracking

### **UTM Parameters**
All posts automatically include:
- `utm_source` = platform name
- `utm_medium` = social
- `utm_campaign` = automated

### **Google Analytics Integration**
- Track social media traffic
- Monitor conversions
- Analyze user behavior

### **Facebook Pixel Integration**
- Track social media conversions
- Optimize ad targeting
- Retargeting capabilities

---

## 🔒 Rate Limiting

### **Platform Limits**
- **Facebook**: 200 posts per hour
- **Instagram**: 25 posts per hour (via Facebook API)
- **LinkedIn**: 100 posts per day
- **Twitter**: 300 posts per 15 minutes
- **Nextdoor**: Varies by neighborhood
- **Threads**: Uses Meta API limits
- **Pinterest**: 200 pins per day
- **TikTok**: 10 videos per day (Business API)
- **YouTube**: 6 uploads per day (default quota)
- **Buffer**: 10 posts per hour (free plan)

### **Implementation**
- Automatic retry on failures
- Exponential backoff
- Error logging and alerts

---

## 🚀 Production Deployment

### **Environment Variables**
```bash
# .env file (for server-side use)
BUFFER_API_KEY=your_buffer_key
FACEBOOK_ACCESS_TOKEN=your_facebook_token
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
TWITTER_BEARER_TOKEN=your_twitter_token
```

### **Database Setup**
- Uses Neon PostgreSQL database
- Table `api_keys` created automatically
- Keys encrypted and stored server-side

---

## 🧪 Testing

### **Test 1: API Connections**
1. Go to setup page
2. Enter API keys
3. Click "Test Connection"
4. Verify green status for all platforms

### **Test 2: Real Post**
1. Go to dashboard
2. Create test post
3. Click "Send Test Post"
4. Check your social media accounts

### **Test 3: Analytics**
1. Post test content
2. Check Google Analytics
3. Verify UTM tracking
4. Monitor Facebook Pixel events

---

## 🔧 Troubleshooting

### **Common Issues**

**Issue**: "Invalid API key"
- **Solution**: 
  - Check API key format
  - Verify permissions
  - Regenerate key if needed

**Issue**: "Rate limit exceeded"
- **Solution**:
  - Wait for rate limit reset
  - Implement exponential backoff
  - Upgrade to higher tier plan

**Issue**: "Post failed to publish"
- **Solution**:
  - Check content guidelines
  - Verify account permissions
  - Test with simpler content

**Issue**: "Connection failed"
- **Solution**:
  - Verify API key is correct
  - Check network connectivity
  - Ensure platform API is operational

---

## 📈 Success Metrics

### **Month 1 Goals**
- ✅ All platforms connected
- ✅ 50+ posts scheduled
- ✅ Analytics tracking working
- ✅ Zero failed posts

### **Month 3 Goals**
- ✅ 500+ posts scheduled
- ✅ 10+ clients onboarded
- ✅ Automated reporting
- ✅ 95%+ success rate

### **Month 6 Goals**
- ✅ 2000+ posts scheduled
- ✅ 50+ clients onboarded
- ✅ Advanced automation workflows
- ✅ 99%+ success rate

---

## 📞 Support & Resources

### **TNR Business Solutions Support**
- **Email**: Roy.Turner@tnrbusinesssolutions.com
- **Phone**: (412) 499-2987
- **Website**: https://tnrbusinesssolutions.com

### **Platform Support**
- **Buffer**: https://buffer.com/help
- **Facebook**: https://developers.facebook.com/support
- **LinkedIn**: https://www.linkedin.com/help/linkedin
- **Twitter**: https://developer.twitter.com/en/support

### **Documentation**
- **API Setup Guide**: `api-setup-guide.md`
- **Social Media Setup Guide**: `TNR_SOCIAL_MEDIA_SETUP_GUIDE.md`
- **API Keys Database Setup**: `API_KEYS_DATABASE_SETUP.md`

---

## 📝 Recent Changes

### **2024 Updates**
1. ✅ **API Keys Moved to Database** - Keys now stored in Neon PostgreSQL instead of localStorage
2. ✅ **Security Improvements** - Server-side storage, encryption, HTTPS required
3. ✅ **Auto-Migration** - Existing localStorage keys automatically migrated to database
4. ✅ **Connection Status** - Shows which platforms have keys saved
5. ✅ **Fixed Auth Links** - Updated `/auth/meta` to `/api/auth/meta`

---

## 🎯 Best Practices

### **Content Strategy**
- Post consistently across all platforms
- Use platform-specific formatting
- Include relevant hashtags
- Engage with comments and messages

### **Technical Best Practices**
- Test connections regularly
- Monitor API rate limits
- Keep tokens secure (now in database)
- Backup settings regularly (export configuration)

### **Business Growth**
- Track which content performs best
- A/B test different approaches
- Analyze engagement metrics
- Optimize posting times

---

## 📋 Checklist

### **Initial Setup**
- [ ] Get API keys for all platforms
- [ ] Enter keys in setup page
- [ ] Test all connections
- [ ] Verify green status indicators
- [ ] Send test post to each platform
- [ ] Configure analytics (GA4, Facebook Pixel)
- [ ] Set up webhooks (Zapier, Make.com)
- [ ] Export configuration as backup

### **Ongoing Maintenance**
- [ ] Monitor connection status weekly
- [ ] Check for API key expiration
- [ ] Review error logs
- [ ] Update keys if needed
- [ ] Test connections monthly
- [ ] Backup configuration regularly

---

## 🔗 Related Files

- `real-automation-setup.html` - Main setup page
- `social-media-api-integration.js` - API integration class
- `api-setup-guide.md` - Complete setup guide
- `TNR_SOCIAL_MEDIA_SETUP_GUIDE.md` - Social media setup guide
- `API_KEYS_DATABASE_SETUP.md` - Database storage documentation
- `server/handlers/api-keys-api.js` - API key management handler
- `database.js` - Database methods for API keys

---

**Last Updated**: November 2024  
**Status**: ✅ Production Ready  
**Security**: ✅ API Keys Stored in Neon Database

