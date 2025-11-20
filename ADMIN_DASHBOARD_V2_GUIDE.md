# Admin Dashboard V2 - Complete Guide

## 🎯 Overview

Your new comprehensive admin dashboard provides a central control panel for managing all 8 social media platform integrations, monitoring activity, and quickly accessing configuration tools.

**Access:** `https://www.tnrbusinesssolutions.com/admin-dashboard-v2.html`

---

## 📊 Dashboard Features

### 1. **Stats Overview (Top Section)**
Real-time metrics displayed in cards:

- **🌐 Platforms Connected:** 8 total platforms
- **📝 Posts This Month:** Track content publishing
- **💬 Messages Processed:** WhatsApp + Instagram DMs
- **📊 Analytics Events:** SEO tracking and monitoring
- **🔔 Active Webhooks:** 5 live webhook endpoints

### 2. **Platform Cards (Main Section)**

Each platform has a dedicated card showing:
- **Connection Status:** 
  - ✅ Connected (green)
  - ⏳ Pending Config (orange)
  - ❌ Disconnected (red)
- **Key Features List**
- **Quick Action Buttons:**
  - 🔧 Manage
  - 🧪 Test
  - 🔗 Connect
  - ⚙️ Configure

---

## 🌐 Platform Details

### **1. Wix** 🏢
**Status:** ✓ Connected

**Features:**
- SEO Automation
- E-commerce Manager
- Blog Category Webhooks
- Editor Add-on
- SEO Keywords Extension

**Actions:**
- **Manage:** Opens Wix Client Dashboard
- **Test:** Tests webhook connectivity

---

### **2. Meta/Facebook** 📘
**Status:** ✓ Connected

**Features:**
- Page Events
- Messaging Webhooks
- Ad Management
- Lead Capture

**Actions:**
- **Manage:** Opens social media dashboard
- **Test:** Verifies webhook endpoint

---

### **3. Threads** 🧵
**Status:** ⏳ Pending Configuration

**Features:**
- Post Text Content
- Post Images
- OAuth Authentication
- 60-day Long-lived Tokens

**Actions:**
- **Connect:** Opens Threads setup guide
- **OAuth:** Initiates authentication flow

**Setup Required:**
1. Add environment variables to Vercel
2. Configure redirect URL in Meta Dashboard
3. Test connection at `/api/auth/threads`

---

### **4. WhatsApp Business** 💬
**Status:** ⏳ Pending Configuration

**Features:**
- Send/Receive Messages
- Template Messages
- Status Tracking
- 90-Day Free Trial

**Actions:**
- **Configure:** Opens setup guide
- **Test:** Sends test message (template)

**Test Function:**
- Click "Test" button
- Enter phone number (digits only)
- Sends "hello_world" template message

---

### **5. Instagram Business** 📸
**Status:** ⏳ Pending Configuration

**Features:**
- Comment Management
- Direct Messages
- Story Insights
- Mention Tracking

**Actions:**
- **Configure:** Opens setup guide
- **Test:** Tests webhook endpoint

**Setup Required:**
1. Accept Instagram Tester invitation
2. Add environment variables
3. Configure webhook in Meta Dashboard
4. Publish app (for production)

---

### **6. LinkedIn** 💼
**Status:** ✓ OAuth Ready

**Features:**
- Profile Access
- Company Pages
- Post to Feed
- OAuth 2.0

**Actions:**
- **Connect:** Initiates OAuth flow
- **Manage:** Opens social media dashboard

---

### **7. Twitter/X** 🐦
**Status:** ✓ OAuth Ready

**Features:**
- Post Tweets
- Timeline Access
- Profile Management
- OAuth 2.0

**Actions:**
- **Connect:** Initiates OAuth flow
- **Manage:** Opens social media dashboard

---

### **8. Pinterest** 📌
**Status:** ✓ OAuth Ready

**Features:**
- Create Pins
- Board Management
- Profile Access
- OAuth 2.0

**Actions:**
- **Connect:** Initiates OAuth flow
- **Manage:** Opens social media dashboard

---

## ⚡ Quick Actions Panel

One-click access to common tasks:

### **📚 View Setup Guides**
Opens comprehensive integration summary with all configuration instructions

### **🚀 Vercel Dashboard**
Direct link to Vercel deployment and logs

### **🧪 Test All Webhooks**
Runs connectivity tests on all 5 webhook endpoints:
- Wix
- Meta
- WhatsApp
- Instagram

Results displayed in popup:
```
Webhook Test Results:

wix: ✅
meta: ✅
whatsapp: ✅
instagram: ✅
```

### **📋 View Logs**
Opens Vercel logs for debugging and monitoring

### **🏢 Wix Dashboard**
Direct access to Wix client management

### **📱 Social Media Hub**
Opens full social media automation dashboard

---

## 📊 Recent Activity Feed

Bottom section shows chronological activity:

- **Platform deployments**
- **Integration additions**
- **Configuration updates**
- **Webhook events**
- **System changes**

Each item shows:
- Activity type icon
- Description
- Timestamp

---

## 🧪 Testing Features

### **Individual Webhook Test**
Click "Test" button on any platform card:

1. Sends GET request to webhook endpoint
2. Checks response status
3. Displays result:
   - ✅ Webhook responding
   - ⚠️ Webhook error (shows status code)
   - ❌ Webhook failed (shows error)

### **Test All Webhooks**
Quick action button that tests all webhooks simultaneously:

```javascript
// Tests these endpoints:
- /api/wix/webhooks
- /api/meta/webhooks
- /api/whatsapp/webhooks
- /api/instagram/webhooks
```

### **WhatsApp Test Message**
"Test" button on WhatsApp card:

1. Prompts for phone number
2. Sends "hello_world" template
3. Shows success/error message

**Usage:**
```javascript
fetch('/api/send/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '1234567890',
    type: 'template',
    templateName: 'hello_world',
    languageCode: 'en_US'
  })
});
```

---

## 🎨 Visual Indicators

### **Status Badges**
- 🟢 **Connected:** Fully configured and working
- 🟠 **Pending Config:** Needs environment variables/setup
- 🔴 **Disconnected:** Not configured

### **Platform Color Coding**
Each platform card has a colored top border:
- **Wix:** Blue (#0C6EFC)
- **Meta:** Facebook Blue (#1877F2)
- **Threads:** Black (#000000)
- **WhatsApp:** Green (#25D366)
- **Instagram:** Pink (#E4405F)
- **LinkedIn:** Blue (#0077B5)
- **Twitter:** Light Blue (#1DA1F2)
- **Pinterest:** Red (#E60023)

---

## 🔄 Auto-Refresh Features

### **Live Clock**
Header timestamp updates every second

### **Manual Refresh**
Click "🔄 Refresh" button to reload dashboard

### **Stats Auto-Update**
Stats cards will auto-update when connected to backend API (coming soon)

---

## 📱 Mobile Responsive

Dashboard fully responsive for:
- **Desktop:** Full grid layout
- **Tablet:** 2-column grid
- **Mobile:** Single column, touch-optimized buttons

---

## 🚀 Getting Started Workflow

### **Step 1: Review Platform Status**
Check which platforms need configuration (orange badges)

### **Step 2: Configure Pending Platforms**
Click "Configure" or "Connect" buttons on orange-badged platforms

Priority order:
1. **WhatsApp** (if you need messaging)
2. **Instagram** (if you need comment management)
3. **Threads** (if you want posting capability)

### **Step 3: Test Webhooks**
Click "Test All Webhooks" to verify connectivity

### **Step 4: Connect OAuth Platforms**
Click "Connect" on LinkedIn, Twitter, Pinterest as needed

### **Step 5: Monitor Activity**
Check "Recent Activity" feed for updates

---

## 🔧 Configuration Links

All setup guides accessible from dashboard:

| Platform | Guide |
|----------|-------|
| Wix | [WIX_WEBHOOKS_SETUP.md](WIX_WEBHOOKS_SETUP.md) |
| Meta | [META_WEBHOOKS_SETUP.md](META_WEBHOOKS_SETUP.md) |
| Threads | [THREADS_API_SETUP.md](THREADS_API_SETUP.md) |
| WhatsApp | [WHATSAPP_API_SETUP.md](WHATSAPP_API_SETUP.md) |
| Instagram | [INSTAGRAM_API_SETUP.md](INSTAGRAM_API_SETUP.md) |
| **All Platforms** | [SOCIAL_MEDIA_INTEGRATIONS_SUMMARY.md](SOCIAL_MEDIA_INTEGRATIONS_SUMMARY.md) |

---

## 🆘 Troubleshooting

### **"Test failed" for webhook**
**Solution:**
1. Check environment variables in Vercel
2. Verify webhook URL in platform dashboard
3. Check Vercel logs for errors
4. Ensure app is deployed

### **"Pending Config" won't change to "Connected"**
**Solution:**
1. Add required environment variables
2. Configure webhook in platform dashboard
3. Refresh dashboard
4. Test webhook connectivity

### **Stats showing "0"**
**Solution:**
- Stats will populate once backend API is connected
- Currently showing placeholder values
- Real data coming soon

### **Quick actions not working**
**Solution:**
1. Check browser console for errors
2. Ensure you're logged in
3. Verify Vercel deployment is complete
4. Clear browser cache and reload

---

## 🎯 Next Steps

### **Immediate:**
1. ✅ Review all platform statuses
2. ✅ Configure pending platforms (WhatsApp, Instagram, Threads)
3. ✅ Test all webhooks
4. ✅ Connect OAuth platforms as needed

### **Short Term:**
1. ⬜ Connect backend API for real-time stats
2. ⬜ Add activity feed data from database
3. ⬜ Implement message queue monitoring
4. ⬜ Add error tracking dashboard

### **Long Term:**
1. ⬜ Add analytics visualizations
2. ⬜ Implement automated reporting
3. ⬜ Create custom workflows
4. ⬜ Add multi-user support

---

## 📈 Dashboard Metrics (Coming Soon)

Future features being developed:

- **Real-time metrics** from all platforms
- **Performance graphs** (posts, engagement, reach)
- **Webhook event history** with filtering
- **Error tracking** and alerts
- **Custom date ranges** for analytics
- **Export data** to CSV/PDF
- **Scheduled reports** via email

---

## 🔐 Security Features

- ✅ All webhook endpoints use signature verification
- ✅ OAuth tokens stored securely in database
- ✅ Environment variables never exposed
- ✅ HTTPS required for all connections
- ✅ Activity logging for audit trail

---

**Dashboard Version:** 2.0  
**Last Updated:** November 20, 2024  
**Status:** Live and ready to use!

Access your dashboard at:
```
https://www.tnrbusinesssolutions.com/admin-dashboard-v2.html
```

