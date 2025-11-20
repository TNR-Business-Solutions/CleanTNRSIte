# Wix Webhook Routing Fix

## Issue Identified

The webhook was returning "❌ Missing action parameter" error, which indicates it was being routed to the wrong handler.

**Root Cause:** The routing order in `api/[...all].js` was incorrect. The general `wix` route was catching webhook requests before the specific `wix/webhooks` route could handle them.

## Fix Applied

### 1. Fixed Routing Order

Changed the routing order in `api/[...all].js` to check for webhooks **before** the general Wix API route:

**Before:**
```javascript
// Wix API routes - handle /api/wix requests
if (route === "wix" || route.startsWith("wix/")) {
  // This was catching wix/webhooks too!
}

// Wix Webhooks - specific endpoint
if (route === "wix/webhooks" || route.startsWith("wix/webhooks")) {
  // Never reached!
}
```

**After:**
```javascript
// Wix Webhooks - specific endpoint (MUST come before wix/* catch-all)
if (route === "wix/webhooks" || route.startsWith("wix/webhooks")) {
  // Now checked first!
}

// Wix API routes - handle /api/wix requests (catch-all, must be last)
if (route === "wix" || route.startsWith("wix/")) {
  // Only catches other wix/* routes
}
```

### 2. Added Request Validation

Added validation in the webhook handler to detect if an API request accidentally reaches the webhook endpoint:

```javascript
// Verify this is actually a webhook request (not a regular API call)
if (req.query?.action || req.body?.action) {
  console.error('❌ Webhook endpoint received API request with action parameter');
  return res.status(400).json({ 
    error: 'Invalid request format for webhook endpoint',
    hint: 'Webhooks do not use action parameters. Check routing configuration.'
  });
}
```

## Expected Behavior After Fix

### ✅ Correct Routing

**Webhook Request:**
```
POST /api/wix/webhooks
Content-Type: text/plain
Body: [JWT token]

→ Routes to: wix-webhooks.js handler
→ Processes JWT token
→ Returns: 200 OK
```

**API Request:**
```
POST /api/wix?action=getClientDetails
Content-Type: application/json

→ Routes to: wix-api-routes.js handler
→ Processes action parameter
→ Returns: JSON response
```

## Testing

### 1. Verify Routing

After deployment, check Vercel logs:

**Webhook Request Should Show:**
```
✅ Routing to Wix Webhooks handler
📥 Webhook request received: { route: 'wix/webhooks', ... }
🔐 Attempting JWT verification...
```

**Should NOT Show:**
```
✅ Routing to Wix API handler
❌ Missing action parameter
```

### 2. Test Webhook

1. Trigger a webhook event in Wix
2. Check Vercel logs for:
   - "✅ Routing to Wix Webhooks handler" (correct)
   - NOT "✅ Routing to Wix API handler" (wrong)

### 3. Verify No More Errors

The error "❌ Missing action parameter" should no longer appear for webhook requests.

## Deployment

1. **Commit Changes**
   ```bash
   git add api/[...all].js server/handlers/wix-webhooks.js
   git commit -m "Fix webhook routing order"
   git push
   ```

2. **Wait for Deployment**
   - Vercel will automatically deploy
   - Wait 1-2 minutes for deployment to complete

3. **Test Webhook**
   - Trigger a webhook event
   - Check Vercel logs
   - Verify correct routing

## Status

✅ **Routing Order**: Fixed
✅ **Request Validation**: Added
✅ **Error Detection**: Enhanced
✅ **Ready for Testing**: Yes

---

**Last Updated**: After routing fix
**Next Action**: Deploy and test webhook

