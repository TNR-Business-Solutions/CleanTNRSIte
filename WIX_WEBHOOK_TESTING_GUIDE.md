# Wix Webhook Testing Guide

## ✅ Setup Complete

Your webhook configuration is now complete:

- ✅ **Public Key Added**: `WIX_WEBHOOK_PUBLIC_KEY` configured in Vercel
- ✅ **Deployment Created**: New deployment with webhook handler updates
- ✅ **Webhook URL**: `https://www.tnrbusinesssolutions.com/api/wix/webhooks`

## Testing the Webhook

### Step 1: Verify Deployment

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the latest deployment (should show "Deployment created" message)
3. Wait for deployment to complete (usually 1-2 minutes)
4. Verify status shows "Ready" ✅

### Step 2: Test in Wix Developer Dashboard

1. **Go to Wix Developer Dashboard**
   - Navigate to: **Develop** → **Extensions** → **Webhooks**
   - Find your "App Permission Created" webhook

2. **Check Webhook Status**
   - The webhook should show as "Active" or "Connected"
   - If it shows an error, wait a few minutes for the deployment to fully propagate

3. **Trigger a Test Event** (if available)
   - Some webhook types allow manual testing
   - Look for a "Test" or "Send Test Event" button

### Step 3: Monitor Vercel Logs

1. **Open Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Filter by: Recent (last hour)

2. **Watch for Webhook Events**
   - When Wix sends a webhook, you should see:
     ```
     📥 Webhook request received: { contentType: 'text/plain', bodyType: 'string', ... }
     🔐 Attempting JWT verification...
     ✅ JWT verified successfully
     📦 Parsed event: { eventType: 'wix.devcenter.apps.v1.app_permission_created', ... }
     🔐 App permission created: [permission-id]
     ✅ Processed app permission creation: {...}
     ```

### Step 4: Trigger Real Event

To trigger a real webhook event:

1. **Change App Permissions**
   - Go to a Wix site where your app is installed
   - Navigate to: **Settings** → **Apps** → **TNR AutoTool**
   - Change any permission setting
   - This should trigger the "App Permission Created" webhook

2. **Check Logs Immediately**
   - Go back to Vercel logs
   - Look for the webhook processing messages
   - Verify no errors occurred

## Expected Behavior

### ✅ Successful Webhook Processing

**Request:**
```
POST /api/wix/webhooks
Content-Type: text/plain
Body: [JWT token]
```

**Response:**
```
Status: 200 OK
Body: (empty or "OK")
```

**Logs:**
```
📥 Webhook request received: { contentType: 'text/plain', bodyType: 'string', bodyLength: 500 }
🔐 Attempting JWT verification...
✅ JWT verified successfully
📦 Parsed event: { eventType: 'wix.devcenter.apps.v1.app_permission_created', instanceId: 'xxx', hasData: true }
📥 Received webhook: { eventType: 'wix.devcenter.apps.v1.app_permission_created', instanceId: 'xxx', verified: true, hasData: true }
🔐 App permission created: [permission-id]
✅ Updated permissions for instance: xxx
✅ Processed app permission creation: { permissionId: 'xxx', permissionName: 'WIX_STORES', ... }
```

### ❌ Common Issues

#### Issue: "JWT signature invalid"
**Cause:** Public key doesn't match Wix's private key

**Solution:**
1. Verify the public key in Vercel matches the one from Wix Developer Dashboard → OAuth
2. Ensure the key includes newlines (BEGIN/END markers)
3. Check that no extra spaces or characters were added

#### Issue: "Request body must be a non-empty string"
**Cause:** Request body not received correctly

**Solution:**
1. Check Vercel logs for the actual body type received
2. Verify webhook is sending `text/plain` content type
3. Check if Vercel is parsing the body before it reaches the handler

#### Issue: "WIX_WEBHOOK_PUBLIC_KEY not configured"
**Cause:** Environment variable not loaded

**Solution:**
1. Verify the variable is set in Vercel
2. Ensure it's added to all environments (Production, Preview, Development)
3. Redeploy the application after adding the variable

## Verification Checklist

- [ ] Deployment completed successfully
- [ ] `WIX_WEBHOOK_PUBLIC_KEY` environment variable is set
- [ ] Webhook URL is correct: `https://www.tnrbusinesssolutions.com/api/wix/webhooks`
- [ ] Webhook shows as "Active" in Wix Developer Dashboard
- [ ] Vercel logs show successful JWT verification
- [ ] Webhook events are being processed
- [ ] No errors in Vercel logs

## Next Steps

1. **Wait for Deployment** (if not already complete)
   - Deployment usually takes 1-2 minutes
   - Check Vercel Dashboard → Deployments

2. **Test the Webhook**
   - Trigger a permission change in a Wix site
   - Monitor Vercel logs for processing

3. **Verify Success**
   - Check that webhook status in Wix Dashboard shows "Active"
   - Verify no errors in Vercel logs
   - Confirm events are being processed

4. **Monitor for Issues**
   - Check Vercel logs regularly
   - Watch for any error patterns
   - Verify webhook events are being received

## Troubleshooting

### Webhook Still Shows Error

1. **Wait 2-3 minutes** for DNS/propagation
2. **Check Vercel logs** for actual error messages
3. **Verify public key format** (should have newlines)
4. **Test webhook manually** using curl or Postman

### No Events Being Received

1. **Verify webhook is enabled** in Wix Developer Dashboard
2. **Check webhook URL** is correct
3. **Trigger a test event** to verify connectivity
4. **Check Vercel logs** for any incoming requests

### JWT Verification Failing

1. **Verify public key** matches Wix Dashboard exactly
2. **Check for extra spaces** or characters
3. **Ensure newlines** are preserved in the key
4. **Try re-adding** the environment variable

## Success Indicators

✅ **Webhook Status**: Shows "Active" in Wix Dashboard
✅ **Vercel Logs**: Show successful JWT verification
✅ **Events Processed**: Permission events are logged
✅ **No Errors**: All requests return 200 OK

---

**Status**: Ready for testing
**Last Updated**: After deployment creation
**Next Action**: Test webhook by triggering a permission change

