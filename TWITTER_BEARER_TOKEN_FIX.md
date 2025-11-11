# 🔧 Fix Twitter Bearer Token Permissions

## The Problem
You're getting the error: **"You are not permitted to perform this action"**

This means your Bearer Token has **"Read Only"** permissions instead of **"Read and Write"** permissions.

## ✅ Solution: Regenerate Bearer Token with Write Permissions

### Step 1: Verify App Permissions
1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app: **TNR_Business_Automation**
3. Click **"Settings"** tab
4. Scroll to **"User authentication settings"**
5. Under **"App permissions"**, make sure it says **"Read and Write"**
   - If it says "Read only", change it to **"Read and Write"**
   - Click **"Save"**

### Step 2: Regenerate Bearer Token
1. Go to **"Keys and tokens"** tab
2. Find the **"Bearer Token"** section
3. Click **"Regenerate"** button
4. **Copy the new Bearer Token** immediately (you won't see it again!)

### Step 3: Save New Token in Dashboard
1. Go to your dashboard: https://www.tnrbusinesssolutions.com/social-media-automation-dashboard.html
2. Scroll to **"Twitter/X Setup"** section
3. Paste the new Bearer Token in the **"Bearer Token"** field
4. Click **"💾 Save Token"**
5. Click **"🧪 Test Connection"** to verify it works

## 🎯 Alternative: Use OAuth 2.0 Flow (Recommended)

Instead of manually managing Bearer Tokens, use the OAuth 2.0 flow:

1. Click **"🔗 Connect Twitter/X"** button in the dashboard
2. Authorize the app on Twitter
3. The token will be automatically saved with correct permissions

This is easier and more secure!

## 📝 Notes

- **Access Token and Access Token Secret** (OAuth 1.0a) have Read and Write permissions, but our current implementation uses OAuth 2.0 Bearer Tokens
- Bearer Tokens must be regenerated **after** changing app permissions
- Old Bearer Tokens won't automatically get new permissions - you must regenerate them

## ✅ After Fixing

Once you've regenerated and saved the new Bearer Token:
- ✅ Test connection should show: "✅ Token is valid"
- ✅ Posting tweets should work without permission errors
- ✅ You'll see success messages when posting

