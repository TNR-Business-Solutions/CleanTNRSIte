# Instagram Connection Guide - Step by Step

## 📋 Overview
Instagram posting requires connecting your Instagram Business Account to a Facebook Page. Instagram uses Facebook's API, so you must connect through Facebook OAuth.

**Important:** This guide is for connecting YOUR OWN Instagram account for posting and getting insights. If you want to analyze OTHER Instagram accounts (competitors), see the Business Discovery API documentation.

## ✅ Prerequisites

1. **Instagram Business or Creator Account** (NOT Personal account)
   - Go to Instagram Settings → Account → Switch to Professional Account
   - Choose "Business" or "Creator"
   - Complete the setup process

2. **Facebook Page** (required to connect Instagram)
   - Create a Facebook Page if you don't have one
   - You must be an admin of the Facebook Page

3. **Facebook Developer App** (already set up for TNR)
   - The app is already configured
   - You just need to connect your accounts

## 🔗 Step-by-Step Connection Process

### Step 1: Connect Instagram to Facebook Page

1. **Go to Facebook Page Settings**
   - Log in to Facebook
   - Go to your Facebook Page
   - Click "Settings" in the left sidebar

2. **Navigate to Instagram Section**
   - Click "Instagram" in the left sidebar (under Page Settings)
   - You should see "Connect Account" button

3. **Connect Your Instagram Account**
   - Click "Connect Account"
   - Log in to your Instagram Business/Creator account
   - Authorize the connection
   - Make sure your Instagram account shows as "Connected"

### Step 2: Verify Instagram Account Type

1. **Check Instagram Account Type**
   - Go to Instagram Settings → Account
   - Look for "Switch to Professional Account" (if you see this, you're still on Personal)
   - If you see "Account type: Business" or "Account type: Creator", you're good!

2. **If Account is Personal**
   - Go to Instagram Settings → Account → Switch to Professional Account
   - Choose "Business" or "Creator"
   - Complete the setup (add category, contact info, etc.)

### Step 3: Connect via TNR Dashboard

1. **Go to Social Media Dashboard**
   - Navigate to `/social-media-automation-dashboard.html`
   - Find the "Meta (Facebook/Instagram) Setup" section

2. **Click "Connect Facebook/Instagram"**
   - This will redirect you to Facebook OAuth
   - Log in to Facebook if prompted
   - Authorize the app to access your Pages

3. **Grant Permissions**
   - Make sure you grant:
     - `pages_manage_posts` - To post to Facebook and Instagram
     - `pages_read_engagement` - To read insights
     - `instagram_basic` - To access Instagram account

4. **Complete OAuth Flow**
   - Facebook will redirect you back to the dashboard
   - You should see a success page showing your connected pages
   - Look for Instagram account information in the success page

### Step 4: Verify Connection

1. **Check Connection Status**
   - Go back to the Social Media Dashboard
   - Look at the "Meta Connection Status" section
   - You should see:
     - ✅ Connected to: [Your Facebook Page Name]
     - 📷 Instagram: @[Your Instagram Username]

2. **Test Instagram Posting**
   - Go to the Instagram tab in the dashboard
   - Generate or enter some content
   - Click "Post to Instagram"
   - Check your Instagram account to verify the post was published

## 🐛 Troubleshooting

### Problem: "No Instagram Business Account Connected"

**Solution:**
1. Make sure your Instagram account is Business or Creator (not Personal)
2. Go to Facebook Page Settings → Instagram → Connect Account
3. Reconnect your Instagram account if it was previously connected
4. Reconnect via OAuth after connecting Instagram to Facebook Page

### Problem: "Invalid insights metric" Error

**Solution:**
- This error has been fixed in the latest update
- The system now uses only valid Instagram metrics (impressions, reach)
- If you still see this error, make sure you're using the latest deployed version

### Problem: Instagram Account Not Showing in OAuth Success Page

**Possible Causes:**
1. Instagram account is not connected to Facebook Page
   - Go to Facebook Page Settings → Instagram
   - Verify Instagram shows as "Connected"

2. Instagram account is Personal (not Business/Creator)
   - Switch to Professional Account in Instagram Settings

3. OAuth permissions don't include Instagram
   - Reconnect via OAuth and make sure to grant all permissions
   - Check Facebook App Settings to ensure Instagram permissions are enabled

### Problem: Can't Post to Instagram

**Checklist:**
1. ✅ Instagram account is Business or Creator
2. ✅ Instagram is connected to Facebook Page
3. ✅ Connected via OAuth successfully
4. ✅ Instagram account shows in dashboard connection status
5. ✅ You're using the correct Facebook Page Access Token (not User Token)

## 📝 Important Notes

1. **Instagram Uses Facebook Page Token**
   - Instagram posts use the same Facebook Page Access Token
   - You don't need a separate Instagram token
   - The Instagram account ID is retrieved from the Facebook Page

2. **Account Type Matters**
   - Personal Instagram accounts CANNOT be connected
   - Only Business and Creator accounts work
   - Make sure to complete the Professional Account setup

3. **Permissions Required**
   - `pages_manage_posts` - Required for posting
   - `pages_read_engagement` - Required for insights
   - `instagram_basic` - Required for Instagram access

4. **Token Never Expires**
   - Facebook Page Access Tokens don't expire (unlike User Tokens)
   - Once connected, you shouldn't need to reconnect
   - Instagram uses the same token as Facebook

## 🆘 Still Having Issues?

If you're still experiencing issues after following this guide:

1. **Check Vercel Logs**
   - Go to Vercel Dashboard → Logs
   - Look for Instagram-related errors
   - Check for "No Instagram Business Account" warnings

2. **Verify Facebook App Settings**
   - Go to Facebook Developers → Your App → Settings
   - Make sure Instagram Basic Display is added
   - Check that permissions include Instagram access

3. **Reconnect Everything**
   - Disconnect Instagram from Facebook Page
   - Reconnect Instagram to Facebook Page
   - Reconnect via OAuth in the dashboard
   - Test posting again

4. **Contact Support**
   - Provide screenshots of:
     - Facebook Page Settings → Instagram (showing connection status)
     - Instagram Settings → Account (showing account type)
     - OAuth success page
     - Any error messages from Vercel logs

## ✅ Success Checklist

- [ ] Instagram account is Business or Creator (not Personal)
- [ ] Instagram account is connected to Facebook Page
- [ ] Connected via OAuth in TNR Dashboard
- [ ] Instagram account shows in connection status
- [ ] Can see Instagram username in dashboard
- [ ] Test post to Instagram works successfully
- [ ] Instagram insights load (may be empty if permissions are limited)

---

## 🔍 Understanding Instagram APIs

### For YOUR Account (Current Setup):
- **Publishing API:** Post content to your Instagram account ✅ Implemented
- **Insights API:** Get metrics about your account ✅ Implemented
- **Connection:** Via Facebook OAuth ✅ Implemented

### For OTHER Accounts (Not Yet Implemented):
- **Business Discovery API:** Analyze competitor/client accounts ❌ Not implemented
  - Requires Instagram User Access Token (different from Page Token)
  - Can get follower counts, media counts, basic metrics for other accounts
  - Useful for competitor analysis and client monitoring

**See `INSTAGRAM_API_TYPES_EXPLAINED.md` for detailed API differences.**

---

## 🆘 Still Having Issues?

If you're still seeing errors after following this guide:

1. **Check Your Account Type**
   - Go to Instagram Settings → Account
   - Make sure it says "Account type: Business" or "Account type: Creator"
   - If it says "Personal", switch to Professional Account

2. **Verify Facebook Page Connection**
   - Go to Facebook Page Settings → Instagram
   - Make sure Instagram shows as "Connected"
   - If not connected, click "Connect Account"

3. **Check OAuth Permissions**
   - When connecting via OAuth, make sure to grant all permissions:
     - `pages_manage_posts` - Required for posting
     - `pages_read_engagement` - Required for insights
     - `instagram_basic` - Required for Instagram access

4. **Reconnect Everything**
   - Disconnect Instagram from Facebook Page
   - Reconnect Instagram to Facebook Page
   - Reconnect via OAuth in dashboard
   - Test posting again

5. **Check Vercel Logs**
   - Go to Vercel Dashboard → Logs
   - Look for Instagram-related errors
   - Check for "No Instagram Business Account" warnings
   - Look for insights metric errors

6. **Verify Token Type**
   - Make sure you're using Facebook Page Access Token (not User Token)
   - Page tokens never expire
   - User tokens expire after 60 days

---

**Last Updated:** 2025-01-12
**API Version:** Facebook Graph API v19.0

