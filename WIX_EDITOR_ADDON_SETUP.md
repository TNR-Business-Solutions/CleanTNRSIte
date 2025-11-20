# Wix Editor Add-on Setup Guide

## 📋 Form Values for Wix Developer Dashboard

Use these values when creating your Editor Add-on:

### **Basic Info**

**Add-on name (visible to users):**
```
TNR SEO & Automation
```
*(35 characters max - this is 20 characters)*

**Panel URL:**
```
https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html
```
*(For development, you can use `https://localhost:3000/wix-editor-addon-panel.html` if you have HTTPS set up locally)*

**Panel width:**
```
Small (288px)
```
*(Matches most native Editor panels)*

**Panel height (px):**
```
600
```
*(Or select "Auto" if available - the panel will adjust based on content)*

### **Market Listing**

**Teaser:**
```
Optimize SEO and manage products directly from the Wix Editor
```
*(60 characters max - this is 58 characters)*

**Icon:**
- Upload a square icon (512x512px recommended)
- Use your TNR logo or a SEO/automation themed icon
- PNG format with transparent background

---

## 🎯 What This Add-on Does

The Editor Add-on provides:

1. **Quick SEO Actions**
   - Run SEO audit on the current site
   - Auto-optimize the current page
   - View SEO score and issues count

2. **Page SEO Management**
   - Edit meta title and description
   - Update page SEO settings
   - Real-time SEO score display

3. **Product Management**
   - View products from the store
   - Sync products to external platforms
   - Quick access to product data

---

## 🔧 Setup Instructions

### Step 1: Deploy the Panel File

1. Upload `wix-editor-addon-panel.html` to your server
2. Ensure it's accessible via HTTPS
3. Test the URL: `https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html`

### Step 2: Create the Add-on in Wix Dashboard

1. Go to: https://dev.wix.com/dashboard
2. Select your app
3. Navigate to **Editor Add-ons** section
4. Click **Create Add-on**
5. Fill in the form with the values above
6. Click **Save**

### Step 3: Test the Add-on

1. Go to your Wix site
2. Open the Wix Editor
3. Look for your add-on in the left sidebar
4. Click to open the panel
5. Test the functionality

---

## 🔗 Integration with Your Automation System

The add-on connects to your existing Wix automation API:

- **Base URL**: `https://www.tnrbusinesssolutions.com/api/wix`
- **Authentication**: Uses instance ID from Wix context
- **Endpoints Used**:
  - `auditSiteSEO` - Run SEO audit
  - `autoOptimizeSEO` - Auto-optimize page
  - `updatePageSEO` - Update page SEO
  - `getProducts` - Load products
  - `syncProductsToExternal` - Sync products

---

## 🚨 Important Notes

### HTTPS Required
- Editor Add-ons **must** use HTTPS
- Localhost development requires HTTPS setup
- Use your production domain for the panel URL

### Instance ID
- The add-on gets the instance ID from Wix SDK
- If not available, it tries to get from URL parameters
- Users must have connected their site via the main dashboard first

### Permissions
- The add-on uses the same permissions as your OAuth app
- Make sure all required permissions are set (see `WIX_APP_PERMISSIONS_GUIDE.md`)

---

## 🎨 Customization

You can customize the add-on by editing `wix-editor-addon-panel.html`:

- **Colors**: Update CSS variables in the `<style>` section
- **Features**: Add more buttons and functions
- **Layout**: Adjust the grid and spacing
- **Branding**: Update header text and logo

---

## 📱 Testing Checklist

- [ ] Panel loads in Wix Editor
- [ ] SEO audit button works
- [ ] Page optimization works
- [ ] SEO score displays correctly
- [ ] Meta title/description can be updated
- [ ] Products can be loaded
- [ ] All API calls succeed
- [ ] Error messages display properly
- [ ] Loading states work correctly

---

## 🆘 Troubleshooting

### Panel doesn't load
- Check that the URL is accessible via HTTPS
- Verify CORS headers are set correctly
- Check browser console for errors

### "Instance ID not found" error
- User needs to connect site via main dashboard first
- Check that OAuth flow completed successfully
- Verify token is stored in database

### API calls fail
- Check that all permissions are set in Wix Developer Dashboard
- Verify the API endpoint is correct
- Check Vercel logs for detailed errors

---

## 🔄 Next Steps

After creating the add-on:

1. **Submit for Review** (if publishing to Wix App Market)
2. **Test with Real Sites** - Connect actual Wix sites
3. **Gather Feedback** - See what features users want
4. **Iterate** - Add more features based on usage

---

## 📚 Resources

- **Wix Editor Add-ons Docs**: https://dev.wix.com/docs/rest/api-reference/wix-editor
- **Wix SDK Reference**: https://dev.wix.com/docs/rest/api-reference/wix-editor/sdk
- **Your Automation API**: `https://www.tnrbusinesssolutions.com/api/wix`

