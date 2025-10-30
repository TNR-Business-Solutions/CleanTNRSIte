# Meta (Facebook/Instagram) OAuth Setup Guide for Vercel

## 🎯 Overview
This guide will help you deploy and configure Meta OAuth authentication for TNR Business Solutions on Vercel, enabling automated posting to Facebook and Instagram.

---

## 📋 Prerequisites
- ✅ Vercel account with project deployed
- ✅ Meta Developer App created ([developers.facebook.com](https://developers.facebook.com))
- ✅ Facebook Business Page
- ✅ Instagram Business Account (optional, linked to Facebook Page)

---

## 🚀 Step 1: Configure Environment Variables in Vercel

### Navigate to Vercel Project Settings
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **tnr-business-solutions**
3. Click **Settings** → **Environment Variables**

### Add the Following Variables

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `META_APP_ID` | `2201740210361183` | Your Meta App ID |
| `META_APP_SECRET` | `0d2b09da0b07236276de7ae1adc05487` | Your Meta App Secret |
| `META_REDIRECT_URI` | `https://www.tnrbusinesssolutions.com/api/auth/meta/callback` | OAuth callback URL |

### Important Notes:
- ✅ Add variables to **Production**, **Preview**, and **Development** environments
- ✅ Click **Save** after adding each variable
- ⚠️ **Never commit secrets to Git** - only store in Vercel environment variables

---

## 🔧 Step 2: Update Meta App Settings

### 2.1 Navigate to Meta App Dashboard
1. Go to [Meta Developers Console](https://developers.facebook.com/apps)
2. Select your app (App ID: `2201740210361183`)
3. Click **Use cases** → **Customize** → **Facebook Login for Business**

### 2.2 Configure Valid OAuth Redirect URIs

Add the following URIs to **Valid OAuth Redirect URIs**:

```
https://www.tnrbusinesssolutions.com/api/auth/meta/callback
```

**Important Settings:**
- ✅ Enable **Web OAuth Login**
- ✅ Enable **Enforce HTTPS**
- ✅ Enable **Use Strict Mode for Redirect URIs**
- ✅ Disable **Force Web OAuth Reauthentication** (for better UX)

### 2.3 Verify Permissions

Ensure your app has the following permissions approved:

**Required Permissions:**
- `pages_manage_posts` - Create, edit, delete posts
- `pages_read_engagement` - Read page insights
- `pages_show_list` - Access list of managed pages
- `pages_manage_metadata` - Manage page settings
- `instagram_basic` - Read Instagram account info
- `instagram_content_publish` - Publish to Instagram

**To Request Permissions:**
1. Go to **Use cases** → **Customize**
2. Add the permissions listed above
3. Submit for review if required (some permissions need Meta approval)

---

## 🌐 Step 3: Deploy to Vercel

### 3.1 Commit and Push Changes

```bash
# Add all new files
git add package.json vercel.json api/auth/meta.js api/auth/meta/callback.js META_OAUTH_SETUP_GUIDE.md

# Commit changes
git commit -m "Add Meta OAuth serverless functions for Vercel"

# Push to main branch (triggers Vercel deployment)
git push origin main
```

### 3.2 Verify Deployment

1. Wait for Vercel deployment to complete (check [Vercel Dashboard](https://vercel.com/dashboard))
2. Look for **"Deployment Successful"** status
3. Note any build errors in the deployment logs

---

## ✅ Step 4: Test OAuth Flow

### 4.1 Initiate OAuth Authorization

Open your browser and navigate to:
```
https://www.tnrbusinesssolutions.com/api/auth/meta
```

Or use the cleaner route:
```
https://www.tnrbusinesssolutions.com/auth/meta
```

### 4.2 Expected Flow

1. **Redirect to Facebook** - You'll be redirected to Facebook login
2. **Login** - Enter your Facebook credentials (if not already logged in)
3. **Grant Permissions** - Review and approve the requested permissions
4. **Select Pages** - Choose which Facebook Pages to authorize
5. **Redirect Back** - You'll be redirected to the callback URL

### 4.3 Success Response

If successful, you'll see a JSON response like:

```json
{
  "success": true,
  "message": "Successfully authorized! Save these tokens securely.",
  "authorization": {
    "longLivedUserToken": "EAAxxxxxxxxxxxx...",
    "expiresIn": 5183999,
    "expiresInDays": 59
  },
  "pages": [
    {
      "id": "123456789",
      "name": "TNR Business Solutions",
      "category": "Business Service",
      "accessToken": "EAAyyyyyyyyy...",
      "hasInstagram": true,
      "instagramAccount": {
        "id": "987654321",
        "username": "tnrbusinesssolutions",
        "name": "TNR Business Solutions"
      }
    }
  ],
  "nextSteps": [
    "1. Save the page access tokens securely",
    "2. Add tokens to your social media automation dashboard",
    "3. Test posting to Facebook and Instagram",
    "4. Set up automated posting schedules"
  ]
}
```

### 4.4 Save Your Tokens

**Critical:** Copy and securely store:
- **Page Access Token** (`pages[0].accessToken`) - This is what you'll use to post
- **Instagram Account ID** (`pages[0].instagramAccount.id`) - For Instagram posting
- **Long-lived User Token** - Backup for re-authorization

**Where to Store:**
- Option 1: Add as Vercel environment variables (e.g., `META_PAGE_ACCESS_TOKEN`)
- Option 2: Store in your database (encrypted)
- Option 3: Use a secrets manager (AWS Secrets Manager, etc.)

---

## 🔍 Step 5: Verify Installation

### Check Vercel Logs

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on the latest deployment
3. Click **Functions** tab
4. Look for successful executions of `/api/auth/meta` and `/api/auth/meta/callback`

### Test Endpoints

**Health Check:**
```bash
curl https://www.tnrbusinesssolutions.com/api/auth/meta
```
Should redirect to Facebook.

**Callback Test (via browser only):**
Complete the OAuth flow and verify the JSON response.

---

## 🛠️ Troubleshooting

### Issue: "META_APP_ID not configured" Error

**Solution:**
1. Verify environment variables are set in Vercel
2. Redeploy the project after adding variables
3. Check variable names match exactly (case-sensitive)

### Issue: "Redirect URI mismatch" Error

**Solution:**
1. Verify the callback URL in Meta App exactly matches: `https://www.tnrbusinesssolutions.com/api/auth/meta/callback`
2. Ensure HTTPS is enforced in Meta App settings
3. Check for trailing slashes (should NOT have trailing slash)

### Issue: OAuth Flow Starts But Doesn't Complete

**Solution:**
1. Check Vercel function logs for errors
2. Verify `META_APP_SECRET` is correct
3. Ensure all required permissions are approved in Meta App
4. Check if authorization code expired (try again quickly)

### Issue: "Missing authorization code" Error

**Solution:**
1. User may have denied permission - try again and click "Allow"
2. Check Meta App is in "Live" mode (not Development mode)
3. Verify redirect URI is whitelisted in Meta App

### Issue: Can't Fetch Instagram Account

**Solution:**
1. Verify Instagram Business Account is linked to Facebook Page
2. Convert Instagram to Business Account if not already
3. Check `instagram_basic` permission is approved
4. Ensure Facebook Page is linked in Instagram settings

---

## 📱 Step 6: Integrate with Your Dashboard

### Option 1: Update Existing Automation Pages

Edit `live-automation-demo.html` or `tnr-social-media-setup.html` to use the new OAuth flow:

```javascript
// Replace existing OAuth code with:
async function connectMeta() {
  // Redirect to Vercel OAuth endpoint
  window.location.href = 'https://www.tnrbusinesssolutions.com/auth/meta';
}
```

### Option 2: Create New Setup Page

Create a new page `meta-oauth-setup.html` to handle the OAuth flow and token storage.

### Option 3: Use GMB Post Generator

Update `gmb-post-generator.html` to include a "Post to Facebook" button that uses the stored tokens.

---

## 🔐 Security Best Practices

1. **Never expose tokens in client-side code**
   - Store tokens server-side or in secure environment variables
   - Use serverless functions to make API calls

2. **Rotate tokens regularly**
   - Page tokens don't expire, but user tokens do
   - Re-authorize every 60 days to get fresh tokens

3. **Use HTTPS everywhere**
   - Vercel provides HTTPS automatically
   - Never send tokens over HTTP

4. **Validate requests**
   - Check `state` parameter to prevent CSRF
   - Validate redirect origins

5. **Monitor API usage**
   - Check Vercel function logs regularly
   - Watch for unauthorized access attempts

---

## 📊 Next Steps

After successful OAuth setup:

1. **✅ Test Posting**
   - Use the access token to create a test post
   - Verify it appears on Facebook/Instagram

2. **✅ Automate Content**
   - Connect GMB Post Generator to Meta API
   - Schedule posts using the automation dashboard

3. **✅ Monitor Performance**
   - Track post engagement
   - Adjust content strategy based on insights

4. **✅ Scale Up**
   - Add more pages/accounts
   - Set up automated posting schedules
   - Integrate with other marketing tools

---

## 🆘 Support Resources

- **Meta API Documentation:** https://developers.facebook.com/docs/graph-api
- **Vercel Serverless Functions:** https://vercel.com/docs/functions/serverless-functions
- **TNR Support:** Contact your development team

---

## 📝 Deployment Checklist

Before going live, ensure:

- [ ] Environment variables configured in Vercel
- [ ] Meta App redirect URI updated
- [ ] All permissions approved in Meta App
- [ ] Code deployed to Vercel successfully
- [ ] OAuth flow tested and working
- [ ] Tokens saved securely
- [ ] Test post created successfully
- [ ] Documentation reviewed by team
- [ ] Monitoring and logging enabled

---

## 🎉 Success!

Once complete, you'll have:
- ✅ Production-ready OAuth flow on Vercel
- ✅ No need for LocalTunnel or local servers
- ✅ Secure, scalable architecture
- ✅ Automated Facebook/Instagram posting capability

**Your OAuth endpoints:**
- Initiate: `https://www.tnrbusinesssolutions.com/auth/meta`
- Callback: `https://www.tnrbusinesssolutions.com/auth/meta/callback`

---

*Last Updated: October 30, 2025*
*Version: 1.0.0*

