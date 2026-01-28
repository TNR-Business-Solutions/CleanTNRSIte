# 🚀 Google Tag Manager Optimization Guide
**Date:** January 27, 2026  
**Container ID:** GTM-WPL26J5C  
**Status:** ⚙️ Setting Up Tags

---

## ⚠️ **Current Issue: "No Recent Data"**

This means GTM is installed but no tags are configured yet. Let's fix this!

---

## 🎯 **Step 1: Verify Installation**

### **Check GTM Code is Live:**

1. **Visit Your Website:**
   - Go to: https://www.tnrbusinesssolutions.com
   - Open browser console (F12)
   - Type: `dataLayer`
   - Should see: Array with GTM data

2. **Check Network Tab:**
   - Look for: `gtm.js?id=GTM-WPL26J5C`
   - Status should be: `200 OK`

3. **If Not Loading:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear browser cache
   - Check if deployment is complete

---

## 🎯 **Step 2: Set Up Facebook Pixel Tag**

### **Create Facebook Pixel Tag in GTM:**

1. **In Google Tag Manager:**
   - Click: **"Tags"** → **"New"**
   - Tag Type: **"Custom HTML"** or **"Facebook Pixel"** (if available)

2. **If Using Custom HTML:**
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
   fbq('init', 'YOUR_PIXEL_ID'); // Replace with your Pixel ID
   fbq('track', 'PageView');
   </script>
   <noscript><img height="1" width="1" style="display:none"
   src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
   /></noscript>
   <!-- End Facebook Pixel Code -->
   ```

3. **Get Your Pixel ID:**
   - Go to: [Facebook Events Manager](https://business.facebook.com/events_manager)
   - Select: **Conversion Pixel**
   - Copy: **Pixel ID** (numeric)

4. **Set Trigger:**
   - Trigger: **"All Pages"** (or create custom trigger)
   - This fires on every page load

---

## 🎯 **Step 3: Set Up Conversions API Tag**

### **Create Conversions API Tag:**

1. **In Google Tag Manager:**
   - Click: **"Tags"** → **"New"**
   - Tag Type: **"Custom HTML"**

2. **Add Conversions API Code:**
   ```html
   <!-- Facebook Conversions API -->
   <script>
   // This will be configured after connecting via Facebook Integrations
   // Facebook will provide the exact code after you connect GTM
   </script>
   ```

3. **Note:** The exact Conversions API code will be provided by Facebook when you connect GTM via Facebook Integrations.

---

## 🎯 **Step 4: Set Up Basic Triggers**

### **Create PageView Trigger:**

1. **In GTM:**
   - Click: **"Triggers"** → **"New"**
   - Trigger Type: **"Page View"**
   - Name: **"All Pages - PageView"**
   - Trigger fires on: **All Pages**

### **Create Form Submission Trigger:**

1. **In GTM:**
   - Click: **"Triggers"** → **"New"**
   - Trigger Type: **"Form Submission"**
   - Name: **"Form Submit - Lead"**
   - This trigger: **All Forms** (or specific form ID)

### **Create Click Trigger (for buttons):**

1. **In GTM:**
   - Click: **"Triggers"** → **"New"**
   - Trigger Type: **"Click - All Elements"**
   - Name: **"Button Clicks"**
   - This trigger fires on: **Some Clicks**
   - Condition: **Click Element** → **matches CSS selector** → **button, .btn, a.btn**

---

## 🎯 **Step 5: Set Up Facebook Events**

### **PageView Event:**

1. **Tag:** Facebook Pixel (already created)
2. **Event:** `PageView`
3. **Trigger:** All Pages - PageView

### **Lead Event:**

1. **Create New Tag:**
   - Tag Type: **Custom HTML**
   - Name: **"Facebook Pixel - Lead"**
   - HTML:
   ```html
   <script>
   fbq('track', 'Lead');
   </script>
   ```
   - Trigger: **Form Submit - Lead**

### **Contact Event:**

1. **Create New Tag:**
   - Tag Type: **Custom HTML**
   - Name: **"Facebook Pixel - Contact"**
   - HTML:
   ```html
   <script>
   fbq('track', 'Contact');
   </script>
   ```
   - Trigger: **Form Submit - Lead**

---

## 🎯 **Step 6: Set Up Variables (Optional but Recommended)**

### **Create Built-in Variables:**

1. **In GTM:**
   - Click: **"Variables"** → **"Configure"**
   - Enable:
     - **Page URL**
     - **Page Path**
     - **Page Title**
     - **Click URL**
     - **Click Text**
     - **Form Element**
     - **Form ID**

### **Create Custom Variables:**

1. **Page Type Variable:**
   - Variable Type: **"Data Layer Variable"**
   - Data Layer Variable Name: `pageType`
   - Use for: Tracking different page types

2. **User ID Variable (if available):**
   - Variable Type: **"Data Layer Variable"**
   - Data Layer Variable Name: `userId`
   - Use for: Better customer matching

---

## 🎯 **Step 7: Connect Conversions API via Facebook**

### **After Tags Are Set Up:**

1. **In Facebook Business Suite:**
   - Go to: **Settings → Integrations**
   - Find: **Google Tag Manager**
   - Click: **"Connect"**

2. **Follow Setup Wizard:**
   - Select Pixel: **Conversion Pixel**
   - Choose: **Conversions API Gateway**
   - Connect: Your GTM account
   - Facebook will provide: Exact code to add

3. **Add Conversions API Code:**
   - Facebook will give you: Server-side code
   - Add as: **Custom HTML tag** in GTM
   - Trigger: **All Pages** (or specific events)

---

## 📋 **Quick Setup Checklist**

### **Basic Setup:**
- [ ] Facebook Pixel tag created
- [ ] Pixel ID added to tag
- [ ] PageView trigger created
- [ ] Tag published in GTM
- [ ] Website visited (to trigger data)
- [ ] GTM dashboard shows data

### **Advanced Setup:**
- [ ] Form submission trigger created
- [ ] Lead event tag created
- [ ] Button click trigger created
- [ ] Variables configured
- [ ] Conversions API connected
- [ ] Test events verified

---

## 🚨 **Troubleshooting "No Recent Data"**

### **Issue 1: GTM Not Loading**

**Check:**
- Is GTM code in `<head>` section?
- Is noscript code after `<body>` tag?
- Check browser console for errors
- Verify container ID: `GTM-WPL26J5C`

**Solution:**
- Hard refresh website
- Clear browser cache
- Check deployment is live

---

### **Issue 2: Tags Not Firing**

**Check:**
- Are tags published in GTM?
- Are triggers configured correctly?
- Check GTM Preview mode

**Solution:**
- Publish tags in GTM
- Test in Preview mode
- Verify triggers are correct

---

### **Issue 3: Still No Data**

**Check:**
- Visit website after publishing tags
- Wait a few minutes for data to appear
- Check GTM dashboard again

**Solution:**
- Publish all tags
- Visit website
- Wait 5-10 minutes
- Check dashboard again

---

## ✅ **Action Items**

1. **Get Your Pixel ID:**
   - Go to Facebook Events Manager
   - Copy Pixel ID

2. **Create Facebook Pixel Tag:**
   - In GTM → Tags → New
   - Add Pixel code with your Pixel ID
   - Set trigger: All Pages

3. **Publish Tags:**
   - Click: **"Submit"** in GTM
   - Add version name: "Initial Facebook Pixel Setup"
   - Publish

4. **Test:**
   - Visit website
   - Check GTM dashboard (wait 5-10 minutes)
   - Should see data

5. **Connect Conversions API:**
   - Go to Facebook → Settings → Integrations
   - Connect Google Tag Manager
   - Follow setup wizard

---

**Status:** ⚙️ Ready to Set Up Tags  
**Next:** Create Facebook Pixel tag in GTM  
**Priority:** High
