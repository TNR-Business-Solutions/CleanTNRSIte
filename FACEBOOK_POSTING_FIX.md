# 🔧 Facebook Posting Error - Quick Fix Guide

## ❌ Current Error

```
Error: (#200) If posting to a page, requires both pages_read_engagement 
and pages_manage_posts as an admin with sufficient administrative permission
```

## 🎯 Root Cause

Your Facebook token is missing the required permissions:
- ❌ `pages_manage_posts` (required for posting)
- ❌ `pages_read_engagement` (required for insights)

## ✅ Quick Fix (3 Steps)

### Step 1: Reconnect Facebook Account

1. Go to your Social Media Dashboard
2. Click **"Reconnect Facebook"** or visit:
   ```
   https://www.tnrbusinesssolutions.com/api/auth/meta
   ```
3. Grant ALL requested permissions when prompted

### Step 2: Verify You're a Page Admin

1. Go to your Facebook Page
2. Click **Settings** → **Page Roles**
3. Ensure your account is listed as **Admin** or **Editor**
4. If not, have the Page owner add you

### Step 3: Check App Permissions

1. Go to: https://developers.facebook.com/apps
2. Select your Meta app
3. Go to **App Review** → **Permissions and Features**
4. Check if `pages_manage_posts` shows:
   - ✅ **Approved** (Advanced Access) - Good!
   - ⚠️ **In Development** - Only works for test users
   - ❌ **Not Requested** - Need to request it

## 🚨 If App is in Development Mode

If your app is in **Development Mode**, you have two options:

### Option A: Add Yourself as Test User (Quick Test)
1. Go to **Roles** → **Test Users**
2. Add your Facebook account as a test user
3. Test users get all permissions automatically

### Option B: Request Advanced Access (Production)
1. Go to **App Review** → **Permissions and Features**
2. Find `pages_manage_posts`
3. Click **Request Advanced Access**
4. Submit required information (use case, demo video, privacy policy)
5. Wait for approval (3-7 days typically)

## 🧪 Test After Fixing

After reconnecting, test posting:

```javascript
// In browser console or your dashboard
fetch('/api/social/post-to-facebook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Test post - Black Friday Giveaway!',
    useDatabaseToken: true
  })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('✅ Posted successfully!', data.postUrl);
  } else {
    console.log('❌ Error:', data.message);
    console.log('Action:', data.action);
    if (data.actionUrl) {
      console.log('Fix it:', data.actionUrl);
    }
  }
});
```

## 📋 Checklist

- [ ] Reconnected Facebook account via OAuth
- [ ] Granted all permissions (pages_manage_posts, pages_read_engagement)
- [ ] Verified I'm Admin/Editor on the Facebook Page
- [ ] Checked app permissions status
- [ ] If in Development mode, added myself as Test User
- [ ] Tested posting again

## 🔗 Direct Links

- **Reconnect Facebook:** https://www.tnrbusinesssolutions.com/api/auth/meta
- **Facebook App Dashboard:** https://developers.facebook.com/apps
- **Social Media Dashboard:** https://www.tnrbusinesssolutions.com/social-media-automation-dashboard.html

## 💡 For Black Friday Posts

Once fixed, you can post the Black Friday giveaway to Facebook using:

**Post Content:**
```
🎉 BLACK FRIDAY GIVEAWAY ALERT! 🎉

We're giving away a FREE website makeover worth $4,500 to one lucky small business owner!

✨ What you could win:
• Custom website design
• SEO optimization
• Mobile responsiveness
• VIP strategy session
• Launch checklist

PLUS: Every qualified entry will receive 20% off their next purchase!

⏰ Entries close Friday at midnight (12:01 AM Saturday)
🏆 Winner announced Saturday

Enter now: https://www.tnrbusinesssolutions.com/black-friday-giveaway.html

#BlackFridayGiveaway #FreeWebsite #SmallBusiness #GreensburgPA #WebDesign #DigitalMarketing
```

---

**Status:** Error identified - needs reconnection with proper permissions
**Priority:** High (blocks Facebook posting)
**Estimated Fix Time:** 5 minutes (if app permissions are approved)




