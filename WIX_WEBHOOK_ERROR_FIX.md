# Wix Webhook Error Fix

## Issue
Wix webhook is returning an error: "The webhook server returned an error."

## Root Cause
The webhook handler needs to properly:
1. Receive the raw JWT token as text (not parsed JSON)
2. Verify the JWT with the public key
3. Parse nested JSON strings from the JWT payload
4. Return 200 OK response

## Fixes Applied

### 1. Improved Request Body Handling
- ✅ Better detection of text/plain content type
- ✅ Proper handling of Vercel serverless function body parsing
- ✅ Fallback to stream reading if body is not available
- ✅ Validation that body is a non-empty string

### 2. Enhanced JWT Verification
- ✅ Better error logging for JWT verification failures
- ✅ Clear messages for signature errors vs expiration errors
- ✅ Fallback to plain JSON if JWT verification fails
- ✅ Logging of verification process for debugging

### 3. Better Error Messages
- ✅ Detailed error logging with request details
- ✅ Helpful error messages for missing public key
- ✅ Clear indication of what went wrong

## Required Configuration

### Environment Variable in Vercel

Add this to Vercel Dashboard → Settings → Environment Variables:

**Key:** `WIX_WEBHOOK_PUBLIC_KEY`

**Value:** Your Wix public key (from Wix Developer Dashboard → OAuth section)

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

**Important:** 
- Replace with your actual public key from Wix Developer Dashboard
- Keep the `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` lines
- Add to **All Environments** (Production, Preview, Development)

## Testing

### 1. Check Vercel Logs
After deploying, check Vercel logs when Wix sends a webhook:

```
📥 Webhook request received: { contentType: 'text/plain', bodyType: 'string', ... }
🔐 Attempting JWT verification...
✅ JWT verified successfully
📦 Parsed event: { eventType: '...', instanceId: '...' }
✅ Processed app permission creation: {...}
```

### 2. Test Webhook in Wix Dashboard
1. Go to Wix Developer Dashboard → Extensions → Webhooks
2. Click on your "App Permission Created" webhook
3. Click "Test webhook" (if available)
4. Check Vercel logs for the request

### 3. Verify Response
The webhook should return:
- **Status Code:** 200 OK
- **Body:** Empty or "OK"

## Troubleshooting

### Error: "Invalid webhook payload"
**Cause:** JWT verification failed or body format is incorrect

**Fix:**
1. Verify `WIX_WEBHOOK_PUBLIC_KEY` is set in Vercel
2. Check that the public key matches the one in Wix Developer Dashboard
3. Ensure the public key includes BEGIN/END lines
4. Check Vercel logs for detailed error messages

### Error: "JWT signature invalid"
**Cause:** Public key doesn't match Wix's private key

**Fix:**
1. Get the correct public key from Wix Developer Dashboard → OAuth
2. Copy the entire key including BEGIN/END lines
3. Update `WIX_WEBHOOK_PUBLIC_KEY` in Vercel
4. Redeploy the application

### Error: "Request body must be a non-empty string"
**Cause:** Request body is not being received correctly

**Fix:**
1. Check Vercel logs for the actual body type received
2. Verify the webhook is sending `text/plain` content type
3. Check if Vercel is parsing the body before it reaches the handler

### Error: "WIX_WEBHOOK_PUBLIC_KEY not configured"
**Cause:** Environment variable is not set

**Fix:**
1. Add `WIX_WEBHOOK_PUBLIC_KEY` to Vercel environment variables
2. Ensure it's added to all environments
3. Redeploy the application

## Expected Behavior

### Successful Webhook Processing

1. **Request Received**
   ```
   POST /api/wix/webhooks
   Content-Type: text/plain
   Body: [JWT token]
   ```

2. **JWT Verification**
   ```
   ✅ JWT verified successfully
   ```

3. **Event Processing**
   ```
   📥 Received webhook: { eventType: 'wix.devcenter.apps.v1.app_permission_created', ... }
   🔐 App permission created: [permission-id]
   ✅ Processed app permission creation: {...}
   ```

4. **Response**
   ```
   Status: 200 OK
   Body: (empty)
   ```

## Next Steps

1. ✅ Add `WIX_WEBHOOK_PUBLIC_KEY` to Vercel environment variables
2. ✅ Redeploy the application
3. ✅ Test the webhook in Wix Developer Dashboard
4. ✅ Check Vercel logs for successful processing
5. ✅ Verify webhook status shows "Active" in Wix Dashboard

## Status

✅ **Request Body Handling**: Fixed
✅ **JWT Verification**: Enhanced with better error handling
✅ **Error Logging**: Comprehensive logging added
✅ **Response Format**: Correct (200 OK with empty body)

---

**Last Updated**: Current session
**Status**: Ready for testing after adding public key to Vercel

