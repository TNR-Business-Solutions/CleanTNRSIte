# Wix Webhooks Setup Guide

## 🎯 Recommended Webhooks for Your App

Based on your SEO automation and e-commerce management features, here are the essential webhooks to configure:

---

## ⭐ **HIGH PRIORITY - Core Functionality**

### **1. Stores - Product Management**

**Product Created**
- **Event:** `Product created`
- **Why:** Auto-optimize SEO when new products are added
- **Use Case:** Generate meta descriptions, optimize product titles

**Product Updated**
- **Event:** `Product changed`
- **Why:** Re-optimize SEO when products are modified
- **Use Case:** Update SEO when product details change

**Product Deleted**
- **Event:** `Product deleted`
- **Why:** Clean up SEO data when products are removed
- **Use Case:** Remove from sitemap, archive SEO data

**Product Collection Created/Updated/Deleted**
- **Events:** 
  - `Product collection created`
  - `Product collection changed`
  - `Product collection deleted`
- **Why:** Sync collections for SEO and organization
- **Use Case:** Update collection SEO, sync to external systems

**Inventory Variants Changed**
- **Event:** `Inventory variants changed`
- **Why:** Track inventory changes for analytics
- **Use Case:** Monitor stock levels, update product availability

---

### **2. Stores - Order Management**

**Order Created**
- **Event:** `Order created`
- **Why:** Track new orders for analytics and automation
- **Use Case:** Send order confirmations, update analytics

**Order Updated**
- **Event:** `Order Updated`
- **Why:** Track order status changes
- **Use Case:** Update fulfillment status, sync to external systems

**Order Paid**
- **Event:** `Order Paid`
- **Why:** Trigger post-purchase automations
- **Use Case:** Send thank you emails, update customer records

**Order Canceled**
- **Event:** `Order Canceled`
- **Why:** Handle cancellations
- **Use Case:** Update inventory, notify customer

**Order Refunded**
- **Event:** `Order Refunded`
- **Why:** Track refunds for analytics
- **Use Case:** Update financial records, restore inventory

---

### **3. App Instance - Subscription Management**

**App Installed**
- **Event:** `App Installed`
- **Why:** Initialize app when user installs
- **Use Case:** Set up default settings, create initial data

**App Removed**
- **Event:** `App Removed`
- **Why:** Clean up when app is uninstalled
- **Use Case:** Archive data, remove webhooks

**Paid Plan Purchased**
- **Event:** `Paid Plan Purchased`
- **Why:** Upgrade user to paid plan
- **Use Case:** Increase quota limits, enable premium features

**Paid Plan Auto Renewal Cancelled**
- **Event:** `Paid Plan Auto Renewal Cancelled`
- **Why:** Handle subscription cancellations
- **Use Case:** Reduce quota, notify user

**Paid Plan Changed**
- **Event:** `Paid Plan Changed`
- **Why:** Handle plan upgrades/downgrades
- **Use Case:** Update features, adjust quotas

---

## 🔶 **MEDIUM PRIORITY - Enhanced Features**

### **4. Site Content**

**Site Properties Updated**
- **Event:** `Site properties updated`
- **Why:** Track site-wide changes
- **Use Case:** Update SEO settings, sync site data

**Blog Post Created/Updated/Deleted**
- **Events:**
  - `Blog Post Created`
  - `Post Updated`
  - `Blog Post Deleted`
- **Why:** Auto-optimize blog SEO
- **Use Case:** Generate meta descriptions, optimize titles

---

### **5. Forms & Leads**

**Form Submitted / Lead Generated**
- **Event:** `Form Submitted / Lead Generated`
- **Why:** Capture new leads automatically
- **Use Case:** Add to CRM, send notifications

**Submission Created**
- **Event:** `Submission Created`
- **Why:** Track all form submissions
- **Use Case:** Analytics, lead scoring

---

### **6. Members & Contacts**

**Contact Created**
- **Event:** `Contact Created`
- **Why:** Track new contacts
- **Use Case:** Add to CRM, segment for marketing

**Contact Updated**
- **Event:** `Contact Updated`
- **Why:** Sync contact changes
- **Use Case:** Update CRM records, trigger workflows

**Member Created/Updated**
- **Events:**
  - `Member Created`
  - `Member Updated`
- **Why:** Track member activity
- **Use Case:** Member analytics, personalization

---

## 🔷 **LOW PRIORITY - Nice to Have**

### **7. Cart & Checkout**

**Cart Created**
- **Event:** `Cart created`
- **Why:** Track cart abandonment
- **Use Case:** Send cart recovery emails

**Cart Abandoned**
- **Event:** `Cart abandoned`
- **Why:** Recover abandoned carts
- **Use Case:** Send reminder emails, offer discounts

**Checkout Created/Updated**
- **Events:**
  - `Checkout Created`
  - `Checkout Updated`
- **Why:** Track checkout process
- **Use Case:** Analytics, conversion optimization

---

## 📋 **Quick Setup Checklist**

### **Phase 1: Essential (Set Up First)**
- [ ] Product created
- [ ] Product changed
- [ ] Product deleted
- [ ] Order created
- [ ] Order Updated
- [ ] App Installed
- [ ] App Removed
- [ ] Paid Plan Purchased

### **Phase 2: Important (Add Next)**
- [ ] Order Paid
- [ ] Order Canceled
- [ ] Product collection created
- [ ] Product collection changed
- [ ] Site properties updated
- [ ] Form Submitted / Lead Generated

### **Phase 3: Enhanced (Add Later)**
- [ ] Blog Post Created
- [ ] Contact Created
- [ ] Cart abandoned
- [ ] Inventory variants changed

---

## 🔧 **Webhook Configuration**

### **Webhook URL:**
```
https://www.tnrbusinesssolutions.com/api/wix/webhooks
```

### **For Each Webhook:**
1. Click **"Create webhook"**
2. Select the event from the list
3. Enter webhook URL: `https://www.tnrbusinesssolutions.com/api/wix/webhooks`
4. Click **"Save"**

---

## 📝 **Implementation Notes**

### **Webhook Handler Already Created:**
- ✅ `server/handlers/wix-webhooks.js` - Handles all webhook events
- ✅ `api/[...all].js` - Routes webhooks to handler

### **Supported Events:**
The handler currently supports:
- `site.published`
- `store.product.created`
- `store.product.updated`
- `store.order.created`
- `store.order.updated`
- `pages.page.created`
- `pages.page.updated`

### **To Add More Events:**
Edit `server/handlers/wix-webhooks.js` and add cases in the `processWebhookEvent` function.

---

## 🚀 **Recommended Setup Order**

1. **Start with Product & Order webhooks** - Core e-commerce functionality
2. **Add App Instance webhooks** - Subscription management
3. **Add Site Content webhooks** - SEO automation
4. **Add Forms & Contacts** - Lead management
5. **Add Cart & Checkout** - Conversion optimization

---

## 🔍 **Testing Webhooks**

### **Test Webhook Endpoint:**
```bash
curl -X POST https://www.tnrbusinesssolutions.com/api/wix/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "store.product.created",
    "instanceId": "test-instance-id",
    "data": {
      "productId": "test-product-id"
    }
  }'
```

### **Check Logs:**
- Vercel logs will show webhook events
- Look for `📥 Webhook received:` messages
- Verify events are being processed

---

## ⚠️ **Important Notes**

1. **Webhook Security:**
   - Wix may send webhook signatures
   - Verify signatures in production
   - Add `WIX_WEBHOOK_SECRET` to environment variables

2. **Rate Limiting:**
   - Wix may send multiple events rapidly
   - Implement queuing for high-volume events
   - Use database for event deduplication

3. **Error Handling:**
   - Webhooks should return 200 OK quickly
   - Process events asynchronously
   - Log errors for debugging

4. **Idempotency:**
   - Same event may be sent multiple times
   - Check event IDs to prevent duplicates
   - Store processed event IDs in database

---

## 📚 **Next Steps**

1. ✅ **Configure webhooks in Wix Dashboard** - Start with Phase 1 events
2. ✅ **Test webhook endpoint** - Verify events are received
3. ✅ **Monitor logs** - Check Vercel logs for webhook activity
4. ✅ **Add more events** - Gradually add Phase 2 and 3 events
5. ✅ **Implement business logic** - Add automation for each event type

---

## 🔗 **Related Files**

- `server/handlers/wix-webhooks.js` - Webhook event processor
- `api/[...all].js` - Webhook routing
- `WIX_EXTENSIONS_RECOMMENDATIONS.md` - Extension setup guide

