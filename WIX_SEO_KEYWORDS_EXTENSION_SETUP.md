# Wix SEO Keywords Suggestions Extension Setup Guide

## 📋 JSON Configuration

Copy and paste this JSON into the Wix Developer Dashboard:

```json
{
  "baseUri": "https://www.tnrbusinesssolutions.com/api/wix/seo-keywords",
  "upgradeUrl": "https://www.tnrbusinesssolutions.com/packages.html",
  "supportedCountryCodes": [
    "US",
    "CA",
    "GB",
    "AU",
    "NZ",
    "IE"
  ],
  "quotaEnabled": true,
  "landingPageUrl": "https://www.tnrbusinesssolutions.com/seo-services.html",
  "componentName": "TNR SEO Keywords"
}
```

---

## 🔧 Configuration Details

### **baseUri** (Required)
```
https://www.tnrbusinesssolutions.com/api/wix/seo-keywords
```
- Base URL where Wix will send API requests
- Handles keyword suggestions and quota management

### **upgradeUrl** (Optional)
```
https://www.tnrbusinesssolutions.com/packages.html
```
- URL where users can purchase a paid plan
- Shown when quota is exceeded and `paidPlan: false`

### **supportedCountryCodes** (Required)
```
["US", "CA", "GB", "AU", "NZ", "IE"]
```
- List of 2-letter country codes you support
- Currently supports: United States, Canada, United Kingdom, Australia, New Zealand, Ireland

### **quotaEnabled** (Required)
```
true
```
- Enables quota limits for keyword suggestions
- Free plan: 100 suggestions/month
- Paid plan: 10,000 suggestions/month

### **landingPageUrl** (Required)
```
https://www.tnrbusinesssolutions.com/seo-services.html
```
- Your website's landing page for the SEO service

### **componentName** (Optional)
```
TNR SEO Keywords
```
- Unique name for this extension component

---

## 🚀 How It Works

### 1. **Keyword Suggestions Endpoint**
Wix calls: `GET /api/wix/seo-keywords?instanceId=xxx&pageId=xxx&countryCode=US`

**Response:**
```json
{
  "keywords": [
    {
      "keyword": "digital marketing",
      "searchVolume": 500,
      "competition": "medium",
      "relevance": "high",
      "source": "title"
    }
  ],
  "quota": {
    "used": 45,
    "limit": 100,
    "remaining": 55,
    "paidPlan": false
  },
  "metadata": {
    "pageId": "abc123",
    "countryCode": "US",
    "language": "en",
    "generatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. **Quota Management**
- Tracks usage per instance ID
- Stored in token metadata
- Automatically updated with each request
- Returns 403 when quota exceeded

### 3. **Keyword Generation**
- Analyzes page title and content
- Extracts relevant keywords
- Provides search volume estimates
- Suggests competition levels
- Filters by country code

---

## 📝 Setup Steps

### Step 1: Add Extension Configuration
1. Go to Wix Developer Dashboard
2. Navigate to **Extensions** → **SEO Keywords Suggestions**
3. Paste the JSON configuration above
4. Click **Save**

### Step 2: Deploy API Endpoint
The endpoint is already created at:
- `api/wix/seo-keywords.js` - Handles keyword requests
- `server/handlers/wix-seo-keywords.js` - Business logic

### Step 3: Test the Extension
1. Go to a Wix site with your app installed
2. Open the Wix Editor
3. Navigate to a page
4. Look for keyword suggestions in the SEO panel
5. Test keyword generation

---

## 🔍 API Endpoints

### **GET /api/wix/seo-keywords**
Get keyword suggestions for a page.

**Query Parameters:**
- `instanceId` (required) - Wix instance ID
- `pageId` (optional) - Page ID to analyze
- `pageTitle` (optional) - Page title
- `countryCode` (optional) - Country code (default: US)
- `language` (optional) - Language code (default: en)
- `maxResults` (optional) - Max suggestions (default: 10)

**Response:**
- `keywords` - Array of keyword suggestions
- `quota` - Quota information
- `metadata` - Request metadata

---

## 💰 Quota System

### **Free Plan**
- 100 keyword suggestions per month
- Basic keyword extraction
- Standard relevance scoring

### **Paid Plan**
- 10,000 keyword suggestions per month
- Advanced keyword research
- Competition analysis
- Search volume data
- Priority support

### **Upgrade Flow**
When quota is exceeded:
1. User sees "Quota exceeded" message
2. Link to upgrade page is provided
3. After upgrade, quota resets
4. User can continue using the service

---

## 🎯 Features

✅ **Smart Keyword Extraction**
- Analyzes page title and content
- Extracts relevant terms
- Filters by frequency and relevance

✅ **Country-Specific Suggestions**
- Supports multiple countries
- Location-based keyword suggestions
- Local SEO optimization

✅ **Quota Management**
- Tracks usage per site
- Prevents abuse
- Enables monetization

✅ **Real-Time Analysis**
- Instant keyword suggestions
- No external API dependencies
- Fast response times

---

## 🧪 Testing

### Test Keyword Suggestions
```bash
curl "https://www.tnrbusinesssolutions.com/api/wix/seo-keywords?instanceId=YOUR_INSTANCE_ID&pageId=YOUR_PAGE_ID&countryCode=US"
```

### Test Quota Info
```bash
curl "https://www.tnrbusinesssolutions.com/api/wix?action=getQuotaInfo&instanceId=YOUR_INSTANCE_ID"
```

---

## 🚨 Troubleshooting

### "Invalid instance ID" Error
- User needs to reconnect Wix site
- Token may have expired
- Check database for token

### "Quota exceeded" Error
- User has reached free plan limit
- Direct to upgrade page
- Or wait for monthly reset

### No Keywords Returned
- Check page has content
- Verify pageId is correct
- Check country code is supported

---

## 📚 Next Steps

1. **Submit Extension** - Submit to Wix for review
2. **Monitor Usage** - Track quota usage in database
3. **Add More Countries** - Expand supported countries
4. **Enhance Algorithm** - Improve keyword extraction
5. **Add Analytics** - Track which keywords are used

---

## 🔗 Related Files

- `api/wix/seo-keywords.js` - API endpoint handler
- `server/handlers/wix-seo-keywords.js` - Business logic
- `server/handlers/wix-api-routes.js` - Route integration
- `WIX_SEO_KEYWORDS_EXTENSION_CONFIG.json` - Configuration file

---

## 📞 Support

For issues or questions:
- Check Vercel logs for errors
- Verify instance ID is correct
- Ensure all permissions are set
- Review quota status in database

