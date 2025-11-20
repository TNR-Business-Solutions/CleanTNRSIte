# Wix Embedded Script Extension Setup Guide

## 📋 Configuration for Wix Developer Dashboard

### **Name:**
```
TNR SEO & Analytics
```
*(30 characters max - this is 20 characters)*

### **Script Type:**
```
Functional
```

### **Script Placement:**
```
HTML Head
```

### **Script Code:**
Copy the entire contents of `wix-embedded-script.js` into the script editor.

---

## 🎯 What This Script Does

The embedded script provides:

1. **SEO Optimization**
   - Auto-generates meta descriptions if missing
   - Ensures Open Graph tags for social sharing
   - Validates SEO tag completeness

2. **Analytics Tracking**
   - Tracks page views
   - Monitors SEO metrics (title length, description length, heading counts)
   - Tracks Core Web Vitals (LCP, etc.)
   - Performance monitoring

3. **Performance Monitoring**
   - Page load time tracking
   - DOM content loaded time
   - First paint metrics
   - Resource loading analysis

4. **Event Tracking API**
   - Custom event tracking via `window.TNRSEO.trackEvent()`
   - Non-blocking analytics
   - Uses sendBeacon for reliability

---

## 🔧 Features

### **Auto SEO Optimization**
- Automatically generates meta descriptions from page content
- Adds Open Graph tags for better social sharing
- Validates SEO tag completeness

### **Analytics Integration**
- Tracks page views automatically
- Monitors SEO metrics
- Sends data to your API endpoint

### **Performance Tracking**
- Core Web Vitals monitoring
- Page load metrics
- Resource performance

### **Custom Event Tracking**
```javascript
// Track custom events
window.TNRSEO.trackEvent('button_click', {
  buttonName: 'Contact Form',
  page: 'homepage'
});
```

---

## 📝 Setup Instructions

### Step 1: Copy Script Code
1. Open `wix-embedded-script.js`
2. Copy the entire file contents
3. Paste into Wix Developer Dashboard script editor

### Step 2: Configure Extension
1. **Name:** `TNR SEO & Analytics`
2. **Script Type:** `Functional`
3. **Script Placement:** `HTML Head`
4. Paste the script code
5. Click **Save**

### Step 3: Test the Script
1. Install app on a Wix site
2. Check browser console for `[TNR SEO]` logs
3. Verify meta tags are generated
4. Check network tab for API calls

---

## 🔗 API Integration

The script sends data to your API endpoint:

### **Endpoints Used:**
- `POST /api/wix?action=trackPageView` - Page view tracking
- `POST /api/wix?action=trackSEOMetrics` - SEO metrics
- `POST /api/wix?action=trackWebVital` - Web Vitals
- `POST /api/wix?action=trackEvent` - Custom events

### **Data Format:**
```json
{
  "action": "trackPageView",
  "instanceId": "xxx",
  "pageData": {
    "url": "https://...",
    "title": "Page Title",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

---

## 🚀 Usage Examples

### Track Custom Events
```javascript
// Track button clicks
document.querySelector('.cta-button').addEventListener('click', () => {
  window.TNRSEO.trackEvent('cta_click', {
    buttonText: 'Get Started',
    location: 'hero'
  });
});

// Track form submissions
document.querySelector('form').addEventListener('submit', () => {
  window.TNRSEO.trackEvent('form_submit', {
    formName: 'contact',
    page: window.location.pathname
  });
});
```

### Get Instance ID
```javascript
const instanceId = window.TNRSEO.getInstanceId();
console.log('Instance ID:', instanceId);
```

### Access Configuration
```javascript
console.log('API Base URL:', window.TNRSEO.config.apiBaseUrl);
console.log('Debug Mode:', window.TNRSEO.config.debug);
```

---

## 🧪 Testing

### Check Script Loaded
```javascript
// In browser console
console.log(window.TNRSEO); // Should show the API object
```

### Verify Meta Tags
```javascript
// Check if meta description was generated
console.log(document.querySelector('meta[name="description"]')?.content);

// Check Open Graph tags
console.log(document.querySelector('meta[property="og:title"]')?.content);
```

### Monitor Network Requests
1. Open browser DevTools
2. Go to Network tab
3. Filter by `api/wix`
4. Verify requests are being sent

---

## 🔍 Debugging

### Enable Debug Mode
The script automatically enables debug logging on localhost. For production:

```javascript
// In browser console
window.TNRSEO.config.debug = true;
```

### Check Logs
Look for `[TNR SEO]` prefixed messages in console:
```
[TNR SEO] Script initialized
[TNR SEO] Page view tracked {...}
[TNR SEO] SEO metrics tracked {...}
```

---

## 🚨 Troubleshooting

### Script Not Loading
- Check script is in HTML Head placement
- Verify no JavaScript errors in console
- Check script type is "Functional"

### No Instance ID
- Verify Wix site has app installed
- Check `window.wixBiSession` exists
- Try manual instance ID in script config

### API Calls Failing
- Check API endpoint is accessible
- Verify CORS headers are set
- Check network tab for error details

---

## 📊 Data Collection

The script collects:

### **Page Data**
- URL and path
- Page title
- Referrer
- Viewport size
- User agent

### **SEO Metrics**
- Meta title length
- Meta description length
- Heading counts (H1, H2, H3)
- Image count
- Link count

### **Performance Metrics**
- Page load time
- DOM content loaded time
- First paint time
- Largest Contentful Paint (LCP)

---

## 🔒 Privacy & Security

- No personal data collected
- Only page-level analytics
- Non-blocking requests
- Uses sendBeacon for reliability
- Respects user privacy

---

## 📚 Next Steps

1. **Add API Handlers** - Create endpoints to receive tracking data
2. **Build Dashboard** - Display analytics in your dashboard
3. **Add More Metrics** - Track additional SEO/performance metrics
4. **Optimize** - Use data to improve site performance

---

## 🔗 Related Files

- `wix-embedded-script.js` - The embedded script code
- `server/handlers/wix-api-routes.js` - API route handler
- `WIX_EMBEDDED_SCRIPT_SETUP.md` - This setup guide

---

## 💡 Tips

- Script runs on every page load
- Non-blocking to avoid performance impact
- Automatically handles errors gracefully
- Works with Wix's JavaScript SDK
- Compatible with other analytics tools

