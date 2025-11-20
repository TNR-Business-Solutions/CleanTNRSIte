# Fix "Template" Field in Editor Add-on

## 🚨 **Error Message:**
"Change Template in TNR AutoTool extension - The Template in TNR AutoTool extension should not be localhost."

---

## 🔍 **What is the "Template" Field?**

In Wix Editor Add-ons, there might be a **"Template"** field separate from the "Panel URL" field. This could be:
- A template URL for the add-on
- A preview/template configuration
- An additional URL field for templates

---

## ✅ **How to Fix**

### **Step 1: Find the Template Field**

1. Go to **Wix Developer Dashboard**
2. Navigate to **Develop** → **Extensions** → **Editor Add-on**
3. Find your add-on: **"TNR SEO & Automation"** or **"TNR AutoTool"**
4. Click **Edit** or **Settings**
5. Look for a field labeled:
   - **"Template"**
   - **"Template URL"**
   - **"Preview Template"**
   - **"Add-on Template"**

### **Step 2: Update Template Field**

**If you find a Template field:**
1. **Current value:** Likely contains `localhost` or `http://localhost:3000`
2. **Change to:** `https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html`
   - OR leave it **empty** if optional
   - OR use the same URL as Panel URL

**If Template field is optional:**
- You can **leave it empty** or **remove the localhost value**

### **Step 3: Verify All URL Fields**

Check **ALL** URL-related fields in the Editor Add-on configuration:

1. ✅ **Panel URL:** `https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html`
2. ⚠️ **Template URL:** (if exists) - Should be production URL or empty
3. ⚠️ **Preview URL:** (if exists) - Should be production URL or empty
4. ⚠️ **Base URL:** (if exists) - Should be production URL

---

## 🔧 **Alternative: Check JSON Configuration**

If the Editor Add-on uses JSON configuration:

1. Look for a **"JSON Editor"** or **"Configuration"** section
2. Check for any `localhost` references in the JSON
3. Update all URLs to production domain

**Example JSON to check:**
```json
{
  "panelUrl": "https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html",
  "templateUrl": "https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html",
  "baseUrl": "https://www.tnrbusinesssolutions.com"
}
```

---

## 📋 **Quick Checklist**

- [ ] Found Template field in Editor Add-on settings
- [ ] Removed/replaced any localhost URLs
- [ ] Updated to production URL: `https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html`
- [ ] Verified Panel URL is correct (no localhost)
- [ ] Checked all URL fields in the add-on configuration
- [ ] Saved all changes
- [ ] Refreshed submission page to verify blocker is gone

---

## 🔍 **Where to Look in Wix Dashboard**

### **Option 1: Editor Add-on Settings**
- **Develop** → **Extensions** → **Editor Add-on** → **Your Add-on** → **Settings/Edit**

### **Option 2: JSON Configuration**
- **Develop** → **Extensions** → **Editor Add-on** → **Your Add-on** → **JSON Editor**

### **Option 3: Advanced Settings**
- **Develop** → **Extensions** → **Editor Add-on** → **Your Add-on** → **Advanced** or **Configuration**

---

## 🚨 **If You Can't Find Template Field**

1. **Delete and recreate the add-on:**
   - Delete the current Editor Add-on
   - Create a new one with production URLs from the start
   - Use values from `WIX_EDITOR_ADDON_SETUP.md`

2. **Contact Wix Support:**
   - They can help locate the Template field
   - Or clarify what "Template" refers to

3. **Check for hidden fields:**
   - Expand all sections
   - Look for "Advanced" or "More Options"
   - Check JSON configuration if available

---

## ✅ **Correct Configuration**

All URL fields should use:
```
https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html
```

**NOT:**
- ❌ `http://localhost:3000/wix-editor-addon-panel.html`
- ❌ `https://localhost:3000/wix-editor-addon-panel.html`
- ❌ `localhost:3000`
- ❌ Any localhost reference

---

## 📝 **After Fixing**

1. **Save** all changes
2. **Refresh** the submission page
3. **Verify** the blocker is gone
4. **Check** that Panel URL still works
5. **Test** the add-on in a Wix site

---

## 🔗 **Related Files**

- `wix-editor-addon-panel.html` - The panel file (no localhost references)
- `WIX_EDITOR_ADDON_SETUP.md` - Setup guide
- `WIX_APP_BLOCKERS_FIX.md` - General blockers guide

