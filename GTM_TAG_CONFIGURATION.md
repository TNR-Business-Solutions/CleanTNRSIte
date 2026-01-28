# 📝 GTM Tag Configuration - Exact Steps
**Date:** January 27, 2026  
**Pixel ID:** 2616872782026337

---

## 🎯 **Exact Steps to Add Facebook Pixel to GTM**

### **1. Open Google Tag Manager**
- URL: https://tagmanager.google.com/
- Container: GTM-WPL26J5C

### **2. Create New Tag**
- Click: **"Tags"** (left sidebar)
- Click: **"New"** (top right)

### **3. Configure Tag**
- **Tag Name:** `Facebook Pixel - PageView`
- **Tag Type:** Click **"Tag Configuration"** → Select **"Custom HTML"**

### **4. Paste Code**
Copy and paste this EXACT code:

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

### **5. Set Trigger**
- Scroll down to **"Triggering"** section
- Click: **"+"** button
- If "All Pages" exists → Select it
- If not → Create new:
  - Click: **"+"** → **"Trigger Configuration"**
  - Select: **"Page View"**
  - Name: `All Pages`
  - Trigger fires on: **All Pages**
  - Click: **"Save"**

### **6. Save Tag**
- Click: **"Save"** button (top right)

### **7. Publish**
- Click: **"Submit"** button (top right, blue)
- Version Name: `Facebook Pixel Setup`
- Click: **"Publish"**

---

## ✅ **Done!**

After publishing:
1. Visit your website
2. Check browser console: `fbq` should work
3. Wait 5-10 minutes
4. Check GTM dashboard: Should show data
5. Check Facebook Events Manager: Should see PageView events

---

**Pixel ID:** 2616872782026337  
**Status:** Ready to add
