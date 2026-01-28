# ✅ GTM Facebook Pixel Setup - Ready to Add
**Date:** January 27, 2026  
**Container:** GTM-WPL26J5C  
**Pixel ID:** 2616872782026337  
**Status:** Ready to add tag

---

## 🚀 **Quick Setup (2 Minutes)**

### **Step 1: Create Facebook Pixel Tag in GTM**

1. **Go to Google Tag Manager:**
   - Visit: https://tagmanager.google.com/
   - Select container: **GTM-WPL26J5C**

2. **Create New Tag:**
   - Click: **"Tags"** (left sidebar)
   - Click: **"New"** button

3. **Tag Configuration:**
   - **Tag Name:** `Facebook Pixel - PageView`
   - **Tag Type:** Click **"Custom HTML"**

4. **Paste This Code (Your Pixel ID is already included):**
   ```html
   <!-- Meta Pixel Code -->
   <script>
   !function(f,b,e,v,n,t,s)
   {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
   n.callMethod.apply(n,arguments):n.queue.push(arguments)};
   if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
   n.queue=[];t=b.createElement(e);t.async=!0;
   t.src=v;s=b.getElementsByTagName(e)[0];
   s.parentNode.insertBefore(t,s)}(window, document,'script',
   'https://connect.facebook.net/en_US/fbevents.js');
   fbq('init', '2616872782026337');
   fbq('track', 'PageView');
   </script>
   <noscript><img height="1" width="1" style="display:none"
   src="https://www.facebook.com/tr?id=2616872782026337&ev=PageView&noscript=1"
   /></noscript>
   <!-- End Meta Pixel Code -->
   ```

5. **Set Trigger:**
   - Click: **"Triggering"** section (bottom)
   - Click: **"+"** button
   - Select: **"All Pages"** (if it exists)
   - OR create new trigger:
     - Trigger Type: **"Page View"**
     - Name: `All Pages`
     - Trigger fires on: **All Pages**
   - Click: **"Save"**

6. **Save Tag:**
   - Click: **"Save"** button (top right)

---

### **Step 2: Publish Container**

1. **In GTM:**
   - Click: **"Submit"** button (top right, blue button)
   - **Version Name:** `Facebook Pixel Setup - 2616872782026337`
   - **Version Description:** `Added Facebook Pixel tag for PageView tracking`
   - Click: **"Publish"**

---

### **Step 3: Test**

1. **Visit Your Website:**
   - Go to: https://www.tnrbusinesssolutions.com
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

2. **Check Browser Console:**
   - Open: F12 → Console
   - Type: `fbq`
   - Should see: Facebook Pixel function
   - Type: `dataLayer`
   - Should see: Array with GTM data

3. **Check Facebook Events Manager:**
   - Go to: [Facebook Events Manager](https://business.facebook.com/events_manager)
   - Click: **"Test Events"**
   - Visit your website
   - Should see: PageView events appearing

4. **Check GTM Dashboard:**
   - Wait: 5-10 minutes
   - Go to: GTM Dashboard
   - Should show: "Data has been received" (instead of "No Recent Data")

---

## 🎯 **Step 4: Add Form Submission Event (Optional)**

### **Create Form Submit Trigger:**

1. **In GTM:**
   - Click: **"Triggers"** → **"New"**
   - Trigger Type: **"Form Submission"**
   - Name: `Form Submit - Lead`
   - This trigger fires on: **All Forms**
   - Click: **"Save"**

### **Create Lead Event Tag:**

1. **In GTM:**
   - Click: **"Tags"** → **"New"**
   - Tag Type: **"Custom HTML"**
   - Name: `Facebook Pixel - Lead`
   - Code:
   ```html
   <script>
   fbq('track', 'Lead');
   </script>
   ```
   - Trigger: **Form Submit - Lead**
   - Click: **"Save"**

2. **Publish:**
   - Click: **"Submit"** → **"Publish"**

---

## 📋 **Quick Checklist**

- [ ] Created Facebook Pixel tag in GTM
- [ ] Added Pixel ID: `2616872782026337`
- [ ] Set trigger: All Pages
- [ ] Saved tag
- [ ] Published container
- [ ] Visited website to test
- [ ] Checked browser console (`fbq` works)
- [ ] Verified events in Facebook Events Manager
- [ ] GTM dashboard shows data (wait 5-10 min)

---

## ✅ **After Setup Complete**

1. **Connect Conversions API:**
   - Go to: Facebook → Settings → Integrations
   - Find: **Google Tag Manager**
   - Click: **"Connect"**
   - Follow setup wizard

2. **Optimize:**
   - Add more events (Lead, Contact, Purchase, etc.)
   - Set up custom triggers
   - Configure variables

---

**Status:** ✅ Ready to Add  
**Pixel ID:** 2616872782026337  
**Next:** Add tag to GTM and publish  
**Time:** ~2 minutes
