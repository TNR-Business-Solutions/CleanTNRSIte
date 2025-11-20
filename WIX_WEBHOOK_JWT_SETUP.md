# Wix Webhook JWT Setup - App Permission Created

## Overview

Wix sends webhooks as **JWT tokens** that must be verified using a public key. The webhook handler now supports both JWT-signed webhooks and plain JSON webhooks.

## Environment Variable

Add your Wix public key to your environment variables:

### Vercel Environment Variables

Add this to your Vercel project settings:

**Key:** `WIX_WEBHOOK_PUBLIC_KEY` or `WIX_PUBLIC_KEY`

**Value:** 
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4/pyNLAhlg0Y2qSjve82
JGd9J8qyiiAYOwDRQh4U/5TTLnbsjjOZryrSWJH6HZzhyJHaIyspCfnMvNX5KgmQ
JQHpYevXnh4fNuchMrSrziFuRc3sdvxsUZ/imgqhEN/vhtpbGKPXKCnGcXXu4AKU
0ANw6I4+pDj/DXhnzIVqU4D3tq8KmizIRzvOEs+ZOV9/jNQLO39OCzxIdHjkBHng
ASCSJkifI88X+X0wK9BeKCf5M7HyT3xp6ZQx03m0IEBzYYzhqr6d/cSy0z+hPzc/
dV39N9zNZlt4xEHI2lI7DiuIJVvZypkis1w0oJlDH7UoQlaNCg2/3aLmitt7zioe
swIDAQAB
-----END PUBLIC KEY-----
```

**Important:** Replace the above public key with your actual Wix app's public key from the Wix Developer Dashboard.

## Webhook Configuration

### Callback URL
```
https://www.tnrbusinesssolutions.com/api/wix/webhooks
```

## Setup Steps

1. **Get Your Public Key**
   - Go to Wix Developer Dashboard
   - Navigate to your app: TNRBusinessSolutions AUTOTOOL
   - Go to: **Develop** → **OAuth**
   - Copy your **Public Key** (it's in the same format as shown above)

2. **Add Public Key to Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add new variable:
     - **Name:** `WIX_WEBHOOK_PUBLIC_KEY`
     - **Value:** Paste your public key (keep the `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` lines)
     - **Environment:** Production, Preview, Development (all)
   - Click **Save**

3. **Create Webhook in Wix**
   - Go to Wix Developer Dashboard
   - Navigate to: **Develop** → **Extensions** → **Webhooks**
   - Click **Create webhook**
   - Select event: **App Permission Created**
   - Add callback URL: `https://www.tnrbusinesssolutions.com/api/wix/webhooks`
   - Click **Save**

4. **Redeploy to Vercel**
   - After adding the environment variable, redeploy your Vercel project
   - The webhook handler needs the `jsonwebtoken` package (already installed)

## Supported App Permission Events

The webhook handler now supports:

- ✅ **wix.devcenter.apps.v1.app_permission_created** - When app permission is created
- ✅ **wix.devcenter.apps.v1.app_permission_updated** - When app permission is updated
- ✅ **wix.devcenter.apps.v1.app_permission_deleted** - When app permission is deleted

Also supports alternative event name formats:
- `app.permission.created`
- `App Permission Created`

## How It Works

### JWT Webhook Format

1. **Wix sends JWT token** in the request body
2. **Handler verifies JWT** using the public key
3. **Decodes and parses** nested JSON strings
4. **Extracts event data** and processes the event

### Webhook Payload Structure

```javascript
// Wix sends JWT token containing:
{
  data: "{\"eventType\":\"wix.devcenter.apps.v1.app_permission_created\",\"instanceId\":\"xxx\",\"data\":\"{...}\"}"
}

// After JWT verification and parsing:
{
  eventType: "wix.devcenter.apps.v1.app_permission_created",
  instanceId: "xxx-xxx-xxx",
  data: {
    permissionId: "xxx",
    permissionName: "WIX_STORES",
    permissionType: "STORES",
    granted: true
  },
  verified: true
}
```

## What Happens When Webhook is Triggered

### App Permission Created
- ✅ Logs the permission creation event
- ✅ Extracts permission data (ID, name, type, granted status)
- ✅ Updates app token metadata with permission information
- ✅ Stores permission details in database

### App Permission Updated
- ✅ Logs the permission update event
- ✅ Updates permission status in database
- ✅ Refreshes app token metadata

### App Permission Deleted
- ✅ Logs the permission deletion event
- ✅ Removes permission from database
- ✅ Updates app token metadata

## Verification

After setting up the webhook:

1. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Trigger the webhook by changing app permissions in Wix
   - Look for: `🔐 App permission created:` in the logs

2. **Expected Log Output**
   ```
   📥 Received webhook: { eventType: 'wix.devcenter.apps.v1.app_permission_created', instanceId: 'xxx', verified: true }
   🔐 App permission created: [permission-id]
   ✅ Updated permissions for instance: xxx
   ✅ Processed app permission creation: {...}
   ```

## Troubleshooting

### Webhook Returns 400 Error - "Invalid webhook payload"
- **Cause:** JWT verification failed or payload format is incorrect
- **Fix:** 
  - Verify the public key is correct and properly formatted
  - Check that the public key includes the BEGIN/END lines
  - Ensure the environment variable is set in Vercel

### Webhook Returns 401 Error - "Invalid webhook signature"
- **Cause:** JWT token verification failed
- **Fix:**
  - Verify you're using the correct public key from Wix Developer Dashboard
  - Check that the public key matches your app's OAuth settings
  - Ensure the public key is stored correctly in environment variables

### Webhook Not Receiving Events
- **Cause:** Webhook not properly configured or callback URL incorrect
- **Fix:**
  - Verify callback URL: `https://www.tnrbusinesssolutions.com/api/wix/webhooks`
  - Check that the webhook is enabled in Wix Developer Dashboard
  - Verify the app has the necessary permissions

### "jsonwebtoken not installed" Warning
- **Cause:** Missing dependency
- **Fix:** The package is already installed, but if you see this error, run:
  ```bash
  npm install jsonwebtoken
  ```

## Fallback Support

The webhook handler supports **both formats**:

1. **JWT-signed webhooks** (new format) - Requires public key
2. **Plain JSON webhooks** (old format) - For backward compatibility

If no public key is configured, the handler will fall back to plain JSON format.

## Next Steps

After the webhook is working, you can:

1. **Track permission changes** for analytics
2. **Update app behavior** based on available permissions
3. **Notify users** when permissions are granted or revoked
4. **Sync permissions** to external systems

## Production Status

✅ JWT verification: Implemented
✅ App Permission events: Supported
✅ Database integration: Working
✅ Error handling: Comprehensive
✅ Logging: Detailed
✅ Fallback support: Plain JSON format supported

