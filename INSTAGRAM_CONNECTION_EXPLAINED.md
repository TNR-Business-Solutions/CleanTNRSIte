# 📷 Instagram Connection - How It Works
**Date:** January 27, 2026  
**Important:** Instagram doesn't appear as a separate option - it's connected through Facebook Pages

---

## ✅ **How Instagram Connection Works**

### **Key Point:**
Instagram Business Accounts are **connected TO Facebook Pages**, not separate entities you select during OAuth.

---

## 🔄 **The OAuth Flow Explained**

### **Step 1: Facebook Authorization**
When you click "Connect Facebook":
1. You're redirected to Facebook
2. Facebook asks: "Which Pages do you want to connect?"
3. You see **only Facebook Pages** (this is correct!)
4. You select: **TNR Business Solutions** Page
5. You grant permissions

### **Step 2: Automatic Instagram Detection**
After you authorize:
1. Our system fetches your selected Facebook Pages
2. **For each Page, it checks:** "Does this Page have an Instagram Business Account connected?"
3. If yes → Instagram is automatically detected and saved
4. If no → Only Facebook Page is saved (Instagram not available)

---

## ⚠️ **Why Instagram Might Not Appear**

### **Reason 1: Instagram Not Connected to Facebook Page**
**Most Common Issue**

**Check:**
1. Go to: https://www.facebook.com/TNRBusinessSolutions/settings/instagram
2. Look for: Instagram section
3. Check if Instagram account is connected

**If Not Connected:**
1. Click: **"Connect Account"** or **"Add Instagram Account"**
2. Login to Instagram
3. Grant permissions
4. **Important:** Instagram account must be **Business** or **Creator** (not Personal)

**After Connecting:**
- Re-run OAuth flow
- Go to: `/platform-connections.html`
- Click: "Connect Facebook" again
- Select your Facebook Page
- Instagram will now be detected automatically

---

### **Reason 2: Instagram Account Type**
**Instagram account must be Business or Creator**

**Check Account Type:**
1. Open Instagram app
2. Go to: Settings → Account
3. Check: Account type
4. If it says "Personal", convert to Business:
   - Settings → Account → Switch to Professional Account
   - Choose: Business Account
   - Connect to Facebook Page

**After Converting:**
- Re-run OAuth flow
- Instagram will be detected

---

### **Reason 3: Permissions Not Granted**
**App needs permission to see Instagram**

**Check Permissions:**
1. Go to: Meta App Dashboard
2. Navigate to: App Review → Permissions and Features
3. Ensure approved:
   - `pages_manage_posts` (includes Instagram)
   - `pages_read_engagement`
   - `pages_show_list`

**If Permissions Pending:**
- Submit for review
- Wait for approval
- Re-run OAuth flow

---

## ✅ **Correct Flow - Step by Step**

### **1. Connect Instagram to Facebook Page (Do This First)**

**Option A: Via Facebook Page Settings**
1. Go to: https://www.facebook.com/TNRBusinessSolutions/settings/
2. Click: **Instagram** in left sidebar
3. Click: **"Connect Account"**
4. Login to Instagram
5. Grant permissions
6. Verify connection shows: `@tnrbusinesssolutions`

**Option B: Via Instagram App**
1. Open Instagram app
2. Go to: Settings → Account → Linked Accounts
3. Connect to Facebook Page
4. Select: TNR Business Solutions Page

---

### **2. Run OAuth Flow**

1. **Go to:** `/platform-connections.html`
2. **Click:** "Connect Facebook"
3. **Facebook asks:** "Which Pages do you want to connect?"
4. **Select:** TNR Business Solutions Page
5. **Grant permissions**
6. **Redirected back** to success page

---

### **3. Instagram is Automatically Detected**

**What Happens:**
- System fetches your selected Facebook Page
- Checks: "Does this Page have Instagram Business Account?"
- If yes → Fetches Instagram account details
- Saves both Facebook Page token AND Instagram account info
- Shows success page with: `📷 Instagram: @tnrbusinesssolutions`

---

## 🔍 **Verify Instagram Connection**

### **Check 1: Facebook Page Settings**
- Go to: https://www.facebook.com/TNRBusinessSolutions/settings/instagram
- Should show: Instagram account connected
- Username: `@tnrbusinesssolutions`

### **Check 2: After OAuth**
- Success page should show:
  - ✅ Facebook Page: TNR Business Solutions
  - 📷 Instagram: @tnrbusinesssolutions

### **Check 3: Dashboard**
- Go to: `/social-media-automation-dashboard.html`
- Click: "🧪 Test Token"
- Should show: `📷 Instagram: @tnrbusinesssolutions`

---

## 🚨 **Troubleshooting**

### **Problem: Instagram Not Detected After OAuth**

**Check:**
1. Is Instagram connected to Facebook Page? (Check Page Settings)
2. Is Instagram account Business/Creator? (Not Personal)
3. Did you select the correct Facebook Page during OAuth?
4. Check Vercel logs for errors

**Solution:**
1. Connect Instagram to Facebook Page (if not connected)
2. Re-run OAuth flow
3. Select Facebook Page again
4. Instagram should be detected

---

### **Problem: "No Instagram connected" in Dashboard**

**Check:**
1. Go to Facebook Page Settings → Instagram
2. Verify Instagram is connected
3. If connected, re-test token:
   - Dashboard → Click "🧪 Test Token"
   - Should now detect Instagram

**If Still Not Detected:**
1. Re-run OAuth flow
2. This refreshes the connection
3. Instagram should be detected

---

## 📊 **Expected Behavior**

### **During OAuth:**
- ✅ You see Facebook Pages to select
- ❌ You do NOT see Instagram accounts (this is correct!)
- ✅ Select your Facebook Page

### **After OAuth:**
- ✅ Facebook Page token saved
- ✅ Instagram account automatically detected (if connected)
- ✅ Both saved to database
- ✅ Success page shows both

### **In Dashboard:**
- ✅ Shows: `✅ Connected to: TNR Business Solutions`
- ✅ Shows: `📷 Instagram: @tnrbusinesssolutions` (if connected)

---

## ✅ **Quick Checklist**

- [ ] Instagram account is Business or Creator (not Personal)
- [ ] Instagram is connected to Facebook Page
- [ ] Facebook Page is selected during OAuth
- [ ] Permissions are granted
- [ ] OAuth flow completes successfully
- [ ] Instagram appears in success page
- [ ] Dashboard shows Instagram connection

---

## 🎯 **Action Items**

1. **Verify Instagram Connection:**
   - Go to: https://www.facebook.com/TNRBusinessSolutions/settings/instagram
   - Ensure Instagram is connected

2. **If Not Connected:**
   - Connect Instagram to Facebook Page
   - Convert to Business account if needed

3. **Re-run OAuth:**
   - Go to: `/platform-connections.html`
   - Click: "Connect Facebook"
   - Select Facebook Page
   - Instagram will be detected automatically

---

**Key Takeaway:** Instagram doesn't appear as a separate option - it's automatically detected when connected to your Facebook Page!
