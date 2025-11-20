# Fix Wix App Submission Blockers

## 🚨 **Current Blockers (2)**

1. ❌ **Change Template in TNR AutoTool extension** - Should not be localhost
2. ❌ **Add company info** - Need company name, logo, description, address, privacy policy

---

## ✅ **Fix #1: Editor Add-on Panel URL**

### **Problem:**
The Editor Add-on panel URL is set to localhost, which Wix doesn't allow for production.

### **Solution:**

1. **Go to:** Wix Developer Dashboard → **Develop** → **Extensions** → **Editor Add-on**
2. **Find:** "TNR SEO & Automation" or "TNR AutoTool" add-on
3. **Edit:** Panel URL field
4. **Change from:** `https://localhost:3000/wix-editor-addon-panel.html` (or any localhost URL)
5. **Change to:** `https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html`
6. **Save** the changes

### **Correct Panel URL:**
```
https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html
```

### **Verify:**
- ✅ URL starts with `https://`
- ✅ URL uses your production domain (`tnrbusinesssolutions.com`)
- ✅ No `localhost` in the URL
- ✅ File exists and is accessible

---

## ✅ **Fix #2: Add Company Info**

### **Problem:**
Company logo needs to be uploaded.

### **Solution:**

1. **Go to:** Wix Developer Dashboard → **App Profile** → **Contact details** → **Company Info**
2. **Upload Company Logo:**
   - Click **"Upload"** or **"Change"** next to Company logo
   - Select: `C:\Users\roytu\Desktop\clean-site\media\logo-1000x1000.png`
   - Verify it displays correctly

3. **Verify All Fields:**
   - ✅ **Company name:** `TNR Business Solutions`
   - ✅ **Company description:** (Your 1159 character description)
   - ✅ **Company address:** `418 Concord Ave, Greensburg, PA, USA`
   - ✅ **Company website:** `https://www.tnrbusinesssolutions.com`
   - ✅ **Privacy policy link:** `https://www.tnrbusinesssolutions.com/privacy-policy.html`
   - ✅ **Company logo:** Upload `logo-1000x1000.png`

4. **Check Agreement:**
   - ✅ Check the box: "By registering my company, I agree to receive Wix Developers emails & updates"

---

## 📋 **Quick Fix Checklist**

### **Blocker #1: Editor Add-on URL**
- [ ] Go to Extensions → Editor Add-on
- [ ] Find "TNR AutoTool" or "TNR SEO & Automation"
- [ ] Change Panel URL to: `https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html`
- [ ] Remove any localhost references
- [ ] Save changes

### **Blocker #2: Company Info**
- [ ] Go to App Profile → Contact details → Company Info
- [ ] Upload company logo: `media/logo-1000x1000.png`
- [ ] Verify company name: `TNR Business Solutions`
- [ ] Verify company description is filled
- [ ] Verify company address: `418 Concord Ave, Greensburg, PA, USA`
- [ ] Verify company website: `https://www.tnrbusinesssolutions.com`
- [ ] Verify privacy policy link: `https://www.tnrbusinesssolutions.com/privacy-policy.html`
- [ ] Check agreement box
- [ ] Save changes

---

## 🔍 **How to Find the Editor Add-on**

1. **Navigate to:** Wix Developer Dashboard
2. **Click:** **Develop** (left sidebar)
3. **Click:** **Extensions** (submenu)
4. **Look for:** Editor Add-on section
5. **Find:** Your add-on (might be named "TNR AutoTool" or "TNR SEO & Automation")
6. **Click:** Edit or Settings
7. **Find:** Panel URL field
8. **Update:** Change to production URL

---

## 🚨 **Common Issues**

### **Issue: Can't find Editor Add-on**
**Solution:**
- Check if you've created the Editor Add-on yet
- If not created, go to **Develop** → **Extensions** → **Create Add-on**
- Use the values from `WIX_EDITOR_ADDON_SETUP.md`

### **Issue: Panel URL field is read-only**
**Solution:**
- You may need to delete and recreate the add-on
- Or contact Wix support if the field is locked

### **Issue: Company logo upload fails**
**Solution:**
- Use the 1000x1000px version: `media/logo-1000x1000.png`
- Ensure file is PNG or JPG format
- Check file size (should be under 5MB)

---

## ✅ **After Fixing Blockers**

Once both blockers are fixed:

1. **Refresh** the submission page
2. **Verify** blockers are gone
3. **Check** recommendations (3 remaining)
4. **Review** all app information
5. **Submit** for review

---

## 📝 **Files You Need**

- **Company Logo:** `C:\Users\roytu\Desktop\clean-site\media\logo-1000x1000.png`
- **Editor Add-on Panel:** Should be deployed at `https://www.tnrbusinesssolutions.com/wix-editor-addon-panel.html`

---

## 🔗 **Related Guides**

- `WIX_EDITOR_ADDON_SETUP.md` - Editor Add-on configuration
- `WIX_COMPANY_INFO_CHECKLIST.md` - Company info details
- `WIX_APP_MEDIA_UPLOAD_GUIDE.md` - Media assets guide

