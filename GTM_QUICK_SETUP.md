# ⚡ GTM Quick Setup - Fix "No Recent Data"
**Date:** January 27, 2026  
**Container:** GTM-WPL26J5C  
**Issue:** No Recent Data (No tags configured yet)

---

## ✅ **GTM is Installed - Now Set Up Tags**

The "No Recent Data" message is normal - GTM is installed but needs tags configured.

---

## 🚀 **Quick Setup (5 Minutes)**

### **Step 1: Get Your Facebook Pixel ID**

1. Go to: [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select: **Conversion Pixel** (your existing pixel)
3. Copy: **Pixel ID** (numeric, e.g., `123456789012345`)

---

### **Step 2: Create Facebook Pixel Tag in GTM**

1. **In Google Tag Manager:**
   - Click: **"Tags"** (left sidebar)
   - Click: **"New"** button

2. **Tag Configuration:**
   - **Tag Name:** `Facebook Pixel - PageView`
   - **Tag Type:** Click **"Custom HTML"**

3. **Paste This Code (Replace YOUR_PIXEL_ID):**
   ```html
   <!-- Facebook Pixel Code -->
   <script>
   !function(f,b,e,v,n,t,s)
   {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
   n.callMethod.apply(n,arguments):n.queue.push(arguments)};
   if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
   n.queue=[];t=b.createElement(e);t.async=!0;
   t.src=v;s=b.getElementsByTagName(e)[0];
   s.parentNode.insertBefore(t,s)}(window, document,'script',
   'https://connect.facebook.net/en_US/fbevents.js');
   fbq('init', 'YOUR_PIXEL_ID');
   fbq('track', 'PageView');
   </script>
   <noscript><img height="1" width="1" style="display:none"
   src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
   /></noscript>
   <!-- End Facebook Pixel Code -->
   ```

4. **Replace:** `YOUR_PIXEL_ID` with your actual Pixel ID

5. **Triggering:**
   - Click: **"Triggering"** section
   - Click: **"+"** to add trigger
   - Select: **"All Pages"** (or create new)
   - Click: **"Save"**

6. **Save Tag:**
   - Click: **"Save"** button

---

### **Step 3: Publish Container**

1. **In GTM:**
   - Click: **"Submit"** button (top right)
   - Version Name: `Initial Facebook Pixel Setup`
   - Version Description: `Added Facebook Pixel tag for PageView tracking`
   - Click: **"Publish"**

---

### **Step 4: Test**

1. **Visit Your Website:**
   - Go to: https://www.tnrbusinesssolutions.com
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

2. **Check Browser Console:**
   - Open: F12 → Console
   - Type: `fbq`
   - Should see: Facebook Pixel function

3. **Check GTM Dashboard:**
   - Wait: 5-10 minutes
   - Go to: GTM Dashboard
   - Should show: "Data has been received"

4. **Check Facebook Events Manager:**
   - Go to: [Facebook Events Manager](https://business.facebook.com/events_manager)
   - Click: **"Test Events"**
   - Visit your website
   - Should see: PageView events

---

## 🎯 **Step 5: Add More Events (Optional)**

### **Form Submission Event:**

1. **Create Trigger:**
   - GTM → **Triggers** → **New**
   - Trigger Type: **"Form Submission"**
   - Name: `Form Submit - Lead`
   - This trigger fires on: **All Forms**

2. **Create Tag:**
   - GTM → **Tags** → **New**
   - Tag Type: **"Custom HTML"**
   - Name: `Facebook Pixel - Lead`
   - Code:
   ```html
   <script>
   fbq('track', 'Lead');
   </script>
   ```
   - Trigger: **Form Submit - Lead**

3. **Publish:**
   - Click: **"Submit"** → **"Publish"**

---

## 📋 **Quick Checklist**

- [ ] Get Facebook Pixel ID from Events Manager
- [ ] Create Facebook Pixel tag in GTM
- [ ] Add Pixel ID to tag code
- [ ] Set trigger: All Pages
- [ ] Save tag
- [ ] Publish container
- [ ] Visit website to test
- [ ] Check GTM dashboard (wait 5-10 min)
- [ ] Verify events in Facebook Events Manager

---

## 🚨 **Troubleshooting**

### **Still "No Recent Data" After Setup:**

1. **Check Tags Are Published:**
   - GTM → Check if tags are published
   - Must click "Submit" → "Publish"

2. **Check Trigger:**
   - Verify trigger is set to "All Pages"
   - Check trigger is attached to tag

3. **Visit Website:**
   - Must visit website after publishing
   - GTM only tracks after tags are live

4. **Wait:**
   - GTM dashboard updates every 5-10 minutes
   - Don't expect instant data

---

## ✅ **After Setup Complete**

1. **Connect Conversions API:**
   - Go to: Facebook → Settings → Integrations
   - Connect: Google Tag Manager
   - Follow: Setup wizard

2. **Optimize Events:**
   - Add more event tags (Lead, Contact, etc.)
   - Set up custom triggers
   - Configure variables

---

**Status:** ⚙️ Ready to Create Tags  
**Next:** Create Facebook Pixel tag in GTM  
**Time:** ~5 minutes
