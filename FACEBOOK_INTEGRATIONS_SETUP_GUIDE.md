# 🔗 Facebook Integrations Setup Guide
**Date:** January 27, 2026  
**Current Status:** Meta Pixel Connected ✅  
**Recommendation:** Connect Conversions API via Google Tag Manager

---

## ✅ **Current Status**

- ✅ **Meta Pixel:** Connected
- ✅ **Datasets:** Conversion Pixel (1)
- ⚠️ **Conversions API:** Not Connected (Recommended)

---

## 🎯 **Priority 1: Connect Conversions API via Google Tag Manager**

**Why:** Facebook recommends this to lower your cost per result by **22.2%** on average.

### **Step 1: Set Up Google Tag Manager**

1. **Go to Google Tag Manager:**
   - Visit: https://tagmanager.google.com/
   - Create a container for your website (if you don't have one)
   - Get your Container ID (format: `GTM-XXXXXXX`)

2. **Install GTM on Your Website:**
   - Copy the GTM container code
   - Add it to your website's `<head>` section
   - Or use the GTM integration if your platform supports it

---

### **Step 2: Connect Conversions API via GTM**

1. **In Facebook Business Suite:**
   - Go to: **Settings → Integrations**
   - Find: **Google Tag Manager** (under "Tag management")
   - Click: **"Connect"** or **"Set Up"**

2. **Follow the Setup Wizard:**
   - Select your Pixel: **Conversion Pixel** (the one you already have)
   - Choose: **Conversions API Gateway** integration
   - Connect your Google Tag Manager account
   - Authorize permissions

3. **Configure in GTM:**
   - Facebook will provide configuration instructions
   - Add Facebook Conversions API tag in GTM
   - Set up triggers for events (PageView, Purchase, Lead, etc.)

---

### **Step 3: Verify Connection**

1. **Test Events:**
   - Visit your website
   - Perform test actions (view page, submit form, etc.)
   - Check Facebook Events Manager → Test Events
   - Should see events coming through both Pixel and Conversions API

2. **Check Integration Status:**
   - Go back to: **Settings → Integrations**
   - Should show: **Google Tag Manager** as **Connected**
   - Should show: **Conversions API** as **Active**

---

## 📊 **Priority 2: Verify Facebook Pixel Setup**

### **Check Current Pixel Configuration:**

1. **Get Your Pixel ID:**
   - Go to: [Facebook Events Manager](https://business.facebook.com/events_manager)
   - Select: **Conversion Pixel**
   - Copy: **Pixel ID** (numeric, e.g., `123456789012345`)

2. **Verify Pixel is Installed:**
   - Check your website source code
   - Look for: `fbq('init', 'YOUR_PIXEL_ID')`
   - Or check browser console for Pixel events

3. **Set Environment Variables (if needed for analytics):**
   ```
   FACEBOOK_PIXEL_ID=your-pixel-id
   FACEBOOK_PIXEL_ACCESS_TOKEN=your-access-token
   ```
   
   **To get Access Token:**
   - Go to: [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Select your app
   - Generate token with `ads_read` permission

---

## 🔍 **Priority 3: Other Useful Integrations**

### **Google Analytics Integration** (Recommended)

**Why:** Track website events and send them to Facebook for better ad optimization.

**Steps:**
1. In Facebook Integrations, find: **Google Analytics**
2. Click: **"Connect"**
3. Authorize Google Analytics account
4. Select: Your GA4 property
5. Map events: PageView, Purchase, Lead, etc.

**Benefits:**
- Better event tracking
- Improved ad optimization
- Cross-platform analytics

---

### **HubSpot Integration** (If Using HubSpot CRM)

**Why:** Sync leads and customer data between HubSpot and Facebook.

**Steps:**
1. In Facebook Integrations, find: **HubSpot**
2. Click: **"Connect"**
3. Authorize HubSpot account
4. Configure data sync settings

**Benefits:**
- Automatic lead sync
- Better customer matching
- Improved ad targeting

---

### **Salesforce Integration** (If Using Salesforce CRM)

**Why:** Sync CRM data for better ad targeting and customer matching.

**Steps:**
1. In Facebook Integrations, find: **Salesforce**
2. Click: **"Connect"**
3. Authorize Salesforce account
4. Configure data sync

**Benefits:**
- CRM data sync
- Better customer matching
- Improved ad performance

---

## 📋 **Quick Setup Checklist**

### **Conversions API (Priority 1):**
- [ ] Google Tag Manager container created
- [ ] GTM installed on website
- [ ] Conversions API connected via GTM
- [ ] Test events verified
- [ ] Integration shows as "Connected"

### **Facebook Pixel (Priority 2):**
- [ ] Pixel ID confirmed
- [ ] Pixel installed on website
- [ ] Events firing correctly
- [ ] Access token generated (for analytics)
- [ ] Environment variables set (if needed)

### **Other Integrations (Priority 3):**
- [ ] Google Analytics connected (if using GA)
- [ ] CRM integration connected (if using HubSpot/Salesforce)
- [ ] Data sync configured
- [ ] Events mapped correctly

---

## 🎯 **Expected Results**

### **After Conversions API Setup:**
- ✅ Events sent via both Pixel and Conversions API
- ✅ Better ad optimization
- ✅ Lower cost per result (up to 22.2% improvement)
- ✅ More accurate event tracking
- ✅ Better customer matching

### **After Full Integration:**
- ✅ All website events tracked
- ✅ CRM data synced
- ✅ Better ad targeting
- ✅ Improved ROI on ads

---

## 🚨 **Important Notes**

### **Conversions API Benefits:**
1. **More Reliable:** Works even when cookies are blocked
2. **Better Data:** Server-side events are more accurate
3. **Lower Costs:** Facebook recommendation shows 22.2% improvement
4. **Better Matching:** Improved customer matching for ads

### **Pixel vs Conversions API:**
- **Pixel:** Client-side tracking (browser-based)
- **Conversions API:** Server-side tracking (more reliable)
- **Best Practice:** Use both together for maximum accuracy

---

## ✅ **Action Items**

1. **Set Up Conversions API (Do This First):**
   - Connect Google Tag Manager
   - Configure Conversions API Gateway
   - Test events
   - Verify connection

2. **Verify Pixel Setup:**
   - Confirm Pixel ID
   - Check Pixel installation
   - Generate access token (if needed)
   - Set environment variables

3. **Connect Other Integrations:**
   - Google Analytics (if using)
   - CRM integration (if using HubSpot/Salesforce)
   - Configure data sync

---

**Status:** Meta Pixel Connected ✅  
**Next:** Connect Conversions API via Google Tag Manager  
**Priority:** High (22.2% cost improvement)
