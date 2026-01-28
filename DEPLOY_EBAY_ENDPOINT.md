# 🚀 eBay Notification Endpoint - Deployment Guide

**Date:** January 27, 2026  
**Endpoint:** `/ebay/notifications/marketplace-deletion`  
**Verification Token:** `TNR-Cards-2026-woowreDVxpwAmvzZ2LE2DOOx`  
**Status:** ✅ Ready to Deploy

---

## 📋 **Quick Overview**

This endpoint handles eBay marketplace deletion notifications and other webhook events. It's integrated into your existing Node.js/Vercel deployment.

**Two Options Available:**
1. ✅ **Node.js Version (Recommended)** - Integrated with your Vercel deployment
2. 🔧 **Flask Version** - Standalone Python app (see below)

---

## ✅ **Option 1: Node.js Integration (Recommended for Vercel)**

### **What's Included:**
- ✅ `server/handlers/ebay-notifications-api.js` - Node.js handler
- ✅ Route added to `api/[...all].js`
- ✅ Vercel rewrite configured in `vercel.json`

### **Deployment Steps:**

#### **1. Add Environment Variable (Optional)**
If you want to use a different verification token, add to Vercel:

**Vercel Dashboard → Settings → Environment Variables:**
- **Key:** `EBAY_VERIFICATION_TOKEN`
- **Value:** `TNR-Cards-2026-woowreDVxpwAmvzZ2LE2DOOx`
- **Environment:** All (Production, Preview, Development)

**Note:** If not set, it defaults to the token above.

#### **2. Deploy to Vercel**
```bash
# Commit changes
git add .
git commit -m "Add eBay notification endpoint"
git push origin main

# Or deploy directly
vercel --prod
```

#### **3. Verify Endpoint**
After deployment, test the endpoint:

```bash
# Test GET (verification)
curl "https://www.tnrbusinesssolutions.com/ebay/notifications/marketplace-deletion?challenge=test123&verificationToken=TNR-Cards-2026-woowreDVxpwAmvzZ2LE2DOOx"

# Should return: test123
```

#### **4. Configure in eBay Developer Portal**
1. **Go to:** eBay Developer Portal → Your App → Webhooks
2. **Add Webhook:**
   - **URL:** `https://www.tnrbusinesssolutions.com/ebay/notifications/marketplace-deletion`
   - **Verification Token:** `TNR-Cards-2026-woowreDVxpwAmvzZ2LE2DOOx`
   - **Events:** Select "Marketplace Account Deletion" and other events you need
3. **Save** - eBay will verify the endpoint automatically

---

## 🔧 **Option 2: Standalone Flask App (Alternative)**

If you prefer a standalone Flask app (not integrated with Vercel), use this:

### **Files Created:**
- `ebay_notification_endpoint.py` - Standalone Flask app

### **Deployment Steps:**

#### **1. Upload to Server**
Upload `ebay_notification_endpoint.py` to your server (not Vercel):
- Can be on a separate server
- Can be on a subdomain
- Can be on the same domain but different port

#### **2. Install Dependencies**
```bash
pip install flask gunicorn
```

#### **3. Set Environment Variable**
```bash
export EBAY_VERIFICATION_TOKEN="TNR-Cards-2026-woowreDVxpwAmvzZ2LE2DOOx"
```

#### **4. Run Flask App**
```bash
# Development
python ebay_notification_endpoint.py

# Production (with Gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 ebay_notification_endpoint:app
```

#### **5. Configure Reverse Proxy (if needed)**
If running on a different port, configure nginx/Apache to proxy:
```
https://www.tnrbusinesssolutions.com/ebay/notifications/marketplace-deletion
→ http://localhost:5000/ebay/notifications/marketplace-deletion
```

---

## 📊 **Endpoint Details**

### **URL:**
```
https://www.tnrbusinesssolutions.com/ebay/notifications/marketplace-deletion
```

### **Methods Supported:**
- ✅ **GET** - Webhook verification (challenge-response)
- ✅ **POST** - Receive notifications

### **Verification (GET):**
eBay sends a GET request with:
- `challenge` - Random string to echo back
- `verificationToken` - Token to verify

**Response:** Returns the `challenge` string (eBay requirement)

### **Notifications (POST):**
eBay sends POST requests with JSON payload:
```json
{
  "eventType": "MARKETPLACE_ACCOUNT_DELETION",
  "timestamp": "2026-01-27T12:00:00Z",
  "data": {
    "userId": "user123",
    "marketplaceId": "EBAY_US"
  }
}
```

**Response:** Always returns `200 OK` (eBay requirement)

---

## 🔍 **Supported Notification Types**

The endpoint handles these eBay notification types:

1. ✅ **MARKETPLACE_ACCOUNT_DELETION** - User deleted marketplace account
2. ✅ **ORDER_CREATED** - New order placed
3. ✅ **ORDER_UPDATED** - Order status changed
4. ✅ **INVENTORY_UPDATED** - Inventory levels changed
5. ✅ **Other types** - Logged but not processed (can be extended)

---

## 🛠️ **Customization**

### **Add Business Logic:**
Edit `server/handlers/ebay-notifications-api.js`:

```javascript
async function handleMarketplaceDeletion(notification) {
  // Add your logic here:
  // - Remove user from database
  // - Cancel subscriptions
  // - Send email notification
  // - Update CRM
}
```

### **Add More Notification Handlers:**
Add new cases in the switch statement:
```javascript
case "NEW_NOTIFICATION_TYPE":
  await handleNewNotificationType(notification);
  break;
```

---

## ✅ **Verification Checklist**

After deployment:

- [ ] Endpoint responds to GET requests
- [ ] Challenge-response verification works
- [ ] eBay webhook verification succeeds
- [ ] POST notifications are received
- [ ] Notifications are logged correctly
- [ ] Business logic executes (if added)

---

## 🐛 **Troubleshooting**

### **Issue: 401 Unauthorized**
- **Cause:** Verification token mismatch
- **Fix:** Check `EBAY_VERIFICATION_TOKEN` environment variable matches eBay portal

### **Issue: 404 Not Found**
- **Cause:** Route not configured
- **Fix:** Verify `vercel.json` rewrite is correct and deployed

### **Issue: Notifications Not Received**
- **Cause:** Webhook not configured in eBay portal
- **Fix:** Verify webhook URL and token in eBay Developer Portal

### **Issue: Challenge Not Returned**
- **Cause:** GET handler not working
- **Fix:** Check logs for errors, verify route is correct

---

## 📝 **Logs**

The endpoint logs all requests:
- ✅ Verification attempts
- ✅ Notification receipts
- ✅ Processing status
- ✅ Errors

**View Logs:**
- **Vercel:** Dashboard → Logs
- **Local:** Console output

---

## 🔐 **Security Notes**

- ✅ Verification token prevents unauthorized access
- ✅ CORS headers configured
- ✅ Error handling prevents information leakage
- ✅ Always returns 200 OK to prevent retries

---

## 📚 **References**

- [eBay Developer Portal](https://developer.ebay.com/)
- [eBay Webhook Documentation](https://developer.ebay.com/api-docs/static/notifications-overview.html)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

**Status:** ✅ **Ready to Deploy**  
**Recommended:** Use Node.js version (Option 1) for seamless Vercel integration
