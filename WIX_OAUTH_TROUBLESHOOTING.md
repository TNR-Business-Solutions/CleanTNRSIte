# 🔧 Wix OAuth Troubleshooting Guide

## ✅ What Was Fixed

### 1. **Token Exchange Endpoint** ✅
- **Before:** `https://www.wix.com/oauth/access` ❌
- **After:** `https://www.wixapis.com/oauth/access` ✅
- **Why:** Wix uses `wixapis.com` domain for all API calls, not `wix.com`

### 2. **Environment Variable Support** ✅
- Now supports `WIX_APP_ID` and `WIX_APP_SECRET` from environment variables
- Falls back to hardcoded values for local development
- Better configuration logging for debugging

### 3. **Enhanced Error Handling** ✅
- Detailed error messages with status codes
- Better logging for debugging
- Helpful error messages for common issues

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid authorization code" or "Code expired"

**Symptoms:**
- OAuth callback receives code but token exchange fails
- Error: `400 Bad Request` or `Invalid authorization code`

**Solutions:**
1. **Check Redirect URI Match:**
   - Go to: https://dev.wix.com/apps/9901133d-7490-4e6e-adfd-cb11615cc5e4/oauth
   - Verify Redirect URL matches exactly: `http://localhost:3000/api/auth/wix/callback`
   - Must match character-for-character (including `http://` vs `https://`)

2. **Code Expiration:**
   - Wix authorization codes expire quickly (usually within minutes)
   - Try the OAuth flow again immediately
   - Don't leave the authorization page open too long

3. **Code Already Used:**
   - Each authorization code can only be used once
   - If you refresh the callback page, it will fail
   - Start a fresh OAuth flow

---

### Issue 2: "Authentication failed" (401 Unauthorized)

**Symptoms:**
- Error: `401 Unauthorized` during token exchange
- Error message mentions `WIX_APP_ID` or `WIX_APP_SECRET`

**Solutions:**
1. **Verify App Credentials:**
   ```bash
   # Check environment variables
   echo $WIX_APP_ID
   echo $WIX_APP_SECRET
   ```

2. **Check Wix Developer Portal:**
   - Go to: https://dev.wix.com/apps/
   - Select your app
   - Verify App ID: `9901133d-7490-4e6e-adfd-cb11615cc5e4`
   - Get App Secret from: Settings → OAuth → App Secret

3. **Set Environment Variables:**
   ```bash
   # In server directory, create .env file:
   WIX_APP_ID=9901133d-7490-4e6e-adfd-cb11615cc5e4
   WIX_APP_SECRET=your-secret-here
   WIX_REDIRECT_URI=http://localhost:3000/api/auth/wix/callback
   ```

---

### Issue 3: "Token endpoint not found" (404 Not Found)

**Symptoms:**
- Error: `404 Not Found` when exchanging code
- Error mentions `WIX_TOKEN_URL`

**Solutions:**
1. **Verify Token Endpoint:**
   - Should be: `https://www.wixapis.com/oauth/access`
   - NOT: `https://www.wix.com/oauth/access`
   - This has been fixed in the code ✅

2. **Check Network Connectivity:**
   ```bash
   # Test endpoint accessibility
   curl -X POST https://www.wixapis.com/oauth/access
   ```

---

### Issue 4: OAuth Redirect Doesn't Work

**Symptoms:**
- Clicking "Connect Wix Client" doesn't redirect
- Browser shows error or blank page

**Solutions:**
1. **Check Server is Running:**
   ```bash
   npm run server
   # Should see: "HTTP server listening on http://localhost:3000"
   ```

2. **Verify OAuth Initiation URL:**
   ```
   http://localhost:3000/api/auth/wix?clientId=shesallthatandmore
   ```

3. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

4. **Verify Wix Installer URL:**
   - Should redirect to: `https://www.wix.com/installer/install?appId=...`
   - If not redirecting, check server logs

---

### Issue 5: Callback Receives Wrong Parameters

**Symptoms:**
- Callback URL is called but with unexpected parameters
- Missing `code` or `state` parameters

**Solutions:**
1. **Check Callback URL Format:**
   - Should be: `http://localhost:3000/api/auth/wix/callback?code=...&state=...`
   - Wix may also send `token` directly instead of `code`

2. **Check Server Logs:**
   ```bash
   # Look for these log messages:
   🎯 Wix OAuth callback received
      Query params: [code, state, instanceId, ...]
   ```

3. **Handle Direct Token Flow:**
   - Code now handles both `code` and direct `token` parameters ✅
   - Also handles JWT tokens in `code` parameter ✅

---

## 🧪 Testing the Fix

### Step 1: Start Server
```bash
cd server
npm run server
```

### Step 2: Check Configuration Logs
Look for these log messages on server start:
```
🔧 Wix OAuth Configuration: {
  appId: '9901133d...',
  redirectUri: 'http://localhost:3000/api/auth/wix/callback',
  ...
}
```

### Step 3: Test OAuth Flow
1. Open: `http://localhost:3000/wix-client-dashboard.html`
2. Click: "Connect New Wix Client"
3. Enter: `shesallthatandmore`
4. Complete Wix authorization
5. Check server logs for:
   ```
   🎯 Wix OAuth callback received
   🔄 Exchanging authorization code for access token
   ✅ Successfully obtained access token
   💾 Saved tokens for instance: ...
   ```

### Step 4: Verify Token Exchange
Check logs for:
- ✅ Token endpoint: `https://www.wixapis.com/oauth/access`
- ✅ Success response with `access_token` and `refresh_token`
- ✅ Instance ID received

---

## 📋 Checklist

Before reporting issues, verify:

- [ ] Server is running on `http://localhost:3000`
- [ ] Redirect URI in Wix Developer Portal matches exactly: `http://localhost:3000/api/auth/wix/callback`
- [ ] App ID and Secret are correct
- [ ] You're logged into the correct Wix account (owner of the site)
- [ ] You have admin access to the Wix site
- [ ] Network connectivity is working
- [ ] Server logs show OAuth initiation
- [ ] Server logs show callback received
- [ ] No firewall blocking `wixapis.com`

---

## 🔍 Debug Mode

Enable detailed logging by checking server console output. The code now logs:

- ✅ OAuth initiation with state token
- ✅ Callback received with all query parameters
- ✅ Token exchange request details
- ✅ Token exchange response details
- ✅ Error details with status codes

---

## 📞 Still Having Issues?

If OAuth still doesn't work after trying these solutions:

1. **Check Server Logs:**
   - Copy full error message from server console
   - Include query parameters received

2. **Check Wix Developer Portal:**
   - Verify app is in "Published" status
   - Check OAuth settings match exactly

3. **Test with curl:**
   ```bash
   # Test token exchange manually
   curl -X POST https://www.wixapis.com/oauth/access \
     -H "Content-Type: application/json" \
     -d '{
       "grant_type": "authorization_code",
       "client_id": "9901133d-7490-4e6e-adfd-cb11615cc5e4",
       "client_secret": "your-secret",
       "code": "your-code"
     }'
   ```

4. **Provide Details:**
   - Server logs (full error)
   - Browser console errors
   - Exact redirect URI configured in Wix
   - Steps you took before error occurred

---

## ✅ Expected Behavior After Fix

1. **OAuth Initiation:**
   - Click "Connect Wix Client" → Redirects to Wix installer
   - URL: `https://www.wix.com/installer/install?appId=...&redirectUrl=...&state=...`

2. **Authorization:**
   - Log in to Wix
   - Authorize app
   - Redirect back to callback

3. **Token Exchange:**
   - Callback receives code/token
   - Exchanges at `https://www.wixapis.com/oauth/access`
   - Receives access token and refresh token

4. **Success:**
   - Redirects to dashboard
   - Client appears in client list
   - Token saved for future use

---

**Last Updated:** 2025-01-12  
**Status:** ✅ Fixed - Token endpoint corrected, error handling improved

