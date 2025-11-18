# 🚀 Wix OAuth Production Deployment Guide

## Overview
Deploy the Wix automation tool to production at `www.tnrbusinesssolutions.com` with proper SSL certificate.

## ✅ Pre-Deployment Checklist

### 1. Update Wix Developer Portal Settings

**CRITICAL:** Update these settings in your Wix Developer Portal before deploying:

1. Go to: https://dev.wix.com/dashboard/9901133d-7490-4e6e-adfd-cb11615cc5e4/settings/oauth
2. Update **App URL**: `https://www.tnrbusinesssolutions.com`
3. Update **Redirect URL**: `https://www.tnrbusinesssolutions.com/api/auth/wix/callback`
4. Save changes

**Note:** Wix may take a few minutes to propagate these changes.

### 2. Set Vercel Environment Variables

In your Vercel project dashboard (`tnr-business-solutions`):

1. Go to: **Settings → Environment Variables**
2. Add/Update these variables:

```
WIX_APP_ID=9901133d-7490-4e6e-adfd-cb11615cc5e4
WIX_APP_SECRET=87fd621b-f3d2-4b2f-b085-2c4f00a17b97
WIX_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/wix/callback
```

**Important:** 
- Set these for **Production** environment
- Optionally set for **Preview** and **Development** if you want to test

### 3. Deploy to Vercel

```bash
# From project root directory
cd C:\Users\roytu\Desktop\clean-site

# Deploy to production
vercel --prod
```

Or push to your main branch (if auto-deploy is enabled):
```bash
git add .
git commit -m "Configure Wix OAuth for production"
git push origin main
```

## 🔍 Verification Steps

After deployment:

### 1. Test OAuth Flow

1. Visit: `https://www.tnrbusinesssolutions.com/wix-client-dashboard.html`
2. Click **"Connect Wix Site"** or **"Authorize Wix"**
3. You should be redirected to Wix authorization page
4. After authorizing, you should be redirected back to your dashboard

### 2. Check Server Logs

In Vercel dashboard:
1. Go to **Deployments** → Click latest deployment
2. Go to **Functions** → Click on `/api/auth/wix`
3. Check logs for:
   - `🔧 Wix OAuth Configuration: { redirectUri: 'https://www.tnrbusinesssolutions.com/...' }`
   - No errors about redirect URL mismatch

### 3. Verify Redirect URL

Test the OAuth initiation endpoint:
```bash
curl -I "https://www.tnrbusinesssolutions.com/api/auth/wix"
```

Check the `Location` header - it should contain:
```
redirectUrl=https%3A%2F%2Fwww.tnrbusinesssolutions.com%2Fapi%2Fauth%2Fwix%2Fcallback
```

## 🐛 Troubleshooting

### Error: "We couldn't find an app with this redirect url"

**Cause:** Redirect URL in Wix Developer Portal doesn't match what's being sent.

**Fix:**
1. Double-check Wix Developer Portal settings match exactly:
   - App URL: `https://www.tnrbusinesssolutions.com`
   - Redirect URL: `https://www.tnrbusinesssolutions.com/api/auth/wix/callback`
2. Wait 5-10 minutes for Wix to propagate changes
3. Clear browser cache and try again
4. Verify Vercel environment variables are set correctly

### Error: "Cannot GET /wix-client-dashboard.html"

**Cause:** Static files not being served correctly.

**Fix:**
1. Check `vercel.json` includes proper rewrites
2. Verify file exists in repository
3. Check Vercel build logs for errors

### OAuth Redirects to Wrong URL

**Cause:** Environment variable not set or cached.

**Fix:**
1. Verify `WIX_REDIRECT_URI` is set in Vercel
2. Redeploy after setting environment variables
3. Check server logs to see which redirect URI is being used

## 📋 Code Changes Summary

### Files Updated:
1. ✅ `server/handlers/auth-wix.js` - Auto-detects production vs development
2. ✅ `server/handlers/auth-wix-callback.js` - Uses environment variables
3. ✅ `vercel.json` - Added Wix OAuth routes

### How It Works:
- **Development (localhost):** Uses `https://localhost:3000/api/auth/wix/callback`
- **Production (Vercel):** Uses `https://www.tnrbusinesssolutions.com/api/auth/wix/callback`
- Detection: Checks for `VERCEL` or `VERCEL_ENV` environment variables

## 🎯 Next Steps After Deployment

1. ✅ Test OAuth flow end-to-end
2. ✅ Connect a test Wix site
3. ✅ Verify tokens are saved correctly
4. ✅ Test Wix API calls (SEO audit, etc.)

## 📞 Support

If issues persist:
1. Check Vercel function logs
2. Check Wix Developer Portal for app status
3. Verify SSL certificate is valid on your domain
4. Test with a different browser/incognito mode

