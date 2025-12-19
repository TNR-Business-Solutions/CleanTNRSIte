# Wix Redirect URI Setup Guide

## ⚠️ Error: "We couldn't find an app with this redirect url"

This error means the redirect URI in your code doesn't match what's configured in your Wix app settings.

## 🔧 Solution: Add Redirect URI to Wix App

### Step 1: Go to Wix Developer Console

1. Go to: https://dev.wix.com/dashboard
2. Sign in with your Wix account
3. Find your app: **App ID: `9901133d-7490-4e6e-adfd-cb11615cc5e4`**

### Step 2: Add Redirect URI

1. Click on your app to open it
2. Go to **Settings** → **OAuth** (or **Redirect URIs**)
3. Find the **Redirect URIs** section
4. Click **Add Redirect URI** or **+ Add**
5. Add these redirect URIs:

#### For Local Development:
```
http://localhost:3000/api/auth/wix/callback
```

#### For Production:
```
https://www.tnrbusinesssolutions.com/api/auth/wix/callback
```

### Step 3: Save Changes

1. Click **Save** or **Update**
2. Wait a few seconds for changes to propagate

### Step 4: Try Again

1. Go back to: `http://localhost:3000/wix-client-dashboard.html`
2. Click **Connect New Wix Client**
3. The OAuth flow should work now

## 📋 Current Redirect URI in Code

The code is now configured to use:
- **Development:** `http://localhost:3000/api/auth/wix/callback`
- **Production:** `https://www.tnrbusinesssolutions.com/api/auth/wix/callback`

## ✅ Verification

After adding the redirect URI, you should see:
- No more "redirect url" errors
- Successful OAuth redirect
- Token saved to database

## 🔍 Troubleshooting

### If you still get errors:

1. **Check the exact URL:**
   - Make sure there are no trailing slashes
   - Make sure it's `http://` not `https://` for localhost
   - Make sure the port is `3000`

2. **Check Wix App Settings:**
   - Verify the redirect URI is saved
   - Try removing and re-adding it
   - Wait 1-2 minutes for changes to propagate

3. **Check Environment Variables:**
   - If you set `WIX_REDIRECT_URI` in `.env`, make sure it matches what's in Wix
   - Remove the env var to use the default if needed

## 📚 Wix Documentation

For more help, see: https://dev.wix.com/docs/rest/getting-started/authentication

