# Wix Webhook Deployment Status

## Current Issue

Webhook requests are still being routed to the wrong handler despite the fix being pushed to GitHub.

### Observed Behavior (from Vercel logs)

```
route: 'wix/webhooks'
✅ Routing to Wix API handler  ← WRONG! Should be "Wix Webhooks handler"
Body keys: 0, 1, 2, 3, ... 897  ← JWT token parsed as array indices
❌ Missing action parameter  ← API handler expects action parameter
```

### Expected Behavior

```
route: 'wix/webhooks'
✅ Routing to Wix Webhooks handler  ← CORRECT
📥 Webhook request received: { bodyType: 'string', ... }
🔐 Attempting JWT verification...
```

## Current Routing Logic (in api/[...all].js)

```javascript
// Line 155-160: Webhook route check
if (route === "wix/webhooks" || route === "wix/webhooks/") {
  console.log("✅ Routing to Wix Webhooks handler (exact match)");
  const handler = require("../server/handlers/wix-webhooks");
  return await handler(req, res);
}

// Line 169-177: General wix route with exclusions
if ((route === "wix" || route.startsWith("wix/")) && 
    route !== "wix/webhooks" && 
    !route.startsWith("wix/seo-keywords")) {
  console.log("✅ Routing to Wix API handler");
  const handler = require("../server/handlers/wix-api-routes");
  return await handler(req, res);
}
```

## Why It's Still Routing Wrong

### Possible Causes

1. **Vercel Cache/CDN Delay**
   - Vercel may be caching the old routing logic
   - Edge network may not have updated yet
   - Can take 2-5 minutes to propagate globally

2. **Deployment Not Complete**
   - The commit was pushed, but Vercel deployment may still be building
   - Check Vercel Dashboard → Deployments for status

3. **Request Format Issue**
   - The body is being parsed as an array/object instead of a string
   - This suggests the Content-Type or body parsing is incorrect

## Solutions

### 1. Wait for Deployment

**Check Deployment Status:**
- Go to: https://vercel.com/dashboard → Your Project → Deployments
- Look for the latest deployment with commit: "Fix webhook routing - add explicit exclusion"
- Status should be "Ready" (green checkmark)

**If status is "Building":**
- Wait 1-2 minutes for it to complete

**If status is "Ready" but issue persists:**
- There may be a CDN cache issue
- Try triggering a new deployment (redeploy)

### 2. Force Cache Clear

**Option A: Redeploy in Vercel Dashboard**
- Go to the deployment
- Click "..." (three dots menu)
- Select "Redeploy"

**Option B: Make a small change and push**
- Add a comment or space to the file
- Commit and push to trigger new deployment

### 3. Verify Routing Logic

The current logic should work because:
- Webhook check comes before general wix check ✅
- General wix check explicitly excludes webhooks ✅
- Route is exact match "wix/webhooks" ✅

## Additional Issues to Address

### Body Parsing Issue

The JWT token is being parsed as array indices (0-897), which means:
- Vercel is treating the string as an iterable
- Need to ensure raw body is read as a string

**Fix Applied (in wix-webhooks.js):**
- Added stream reading for raw body
- Convert to string explicitly
- Handle text/plain content type

### Database Error

```
❌ Error creating table: This function can now be called only as a tagged-template function
```

This is a Neon driver syntax issue - needs separate fix in `database.js`.

## Next Steps

1. **Verify Deployment Complete**
   - Check Vercel Dashboard
   - Ensure "Ready" status
   - Wait 2-3 minutes after "Ready"

2. **Test Webhook Again**
   - Trigger webhook in Wix Developer Dashboard
   - Check Vercel logs
   - Should now show "Routing to Wix Webhooks handler"

3. **If Still Failing**
   - Redeploy from Vercel Dashboard
   - Check for any build errors
   - Verify the code actually deployed

## Verification Checklist

- [ ] Latest commit shows in Vercel deployment
- [ ] Deployment status is "Ready"
- [ ] Waited 2-3 minutes after deployment
- [ ] Webhook test shows correct routing in logs
- [ ] No "Missing action parameter" error
- [ ] Body is parsed as string, not array

---

**Status**: Waiting for Vercel deployment to propagate
**Expected Resolution**: 2-5 minutes after deployment completes

