# Meta (Facebook/Instagram) Webhooks Setup

## Overview

Your Meta webhook handler is now ready to receive events from Facebook and Instagram.

## Webhook Configuration

### Callback URL
```
https://www.tnrbusinesssolutions.com/api/meta/webhooks
```

### Verify Token
```
tnr_meta_webhook_verify_2024
```

**Note:** This token is used to verify your webhook endpoint. Keep it secure.

## Setup Steps

### 1. Add Environment Variable to Vercel

Add this to Vercel Dashboard → Settings → Environment Variables:

**Key:** `META_VERIFY_TOKEN`  
**Value:** `tnr_meta_webhook_verify_2024`  
**Environment:** All (Production, Preview, Development)

### 2. Configure Webhook in Meta Dashboard

1. **Go to Meta App Dashboard**
   - Navigate to: https://developers.facebook.com/apps/2201740210361183
   - Go to: **Use cases** → **Customize** → **Webhooks**

2. **Select Product**
   - Choose the product you want to subscribe to:
     - **Page** (for Facebook Pages)
     - **Instagram** (for Instagram Business accounts)
     - **User** (for user events)

3. **Configure Webhook**
   - **Callback URL:** `https://www.tnrbusinesssolutions.com/api/meta/webhooks`
   - **Verify Token:** `tnr_meta_webhook_verify_2024`
   - Click **Verify and Save**

4. **Subscribe to Events**
   - Select the fields you want to receive:
     - **Page:** feed, comments, reactions, mentions
     - **Instagram:** comments, mentions, story_insights
     - **Messaging:** messages, messaging_postbacks, message_reads

### 3. Test the Webhook

1. **Verify Endpoint**
   - Meta will send a GET request to verify your endpoint
   - Your handler will respond with the challenge token
   - Status should show "Verified" in Meta Dashboard

2. **Send Test Event**
   - In Meta Dashboard, click "Send Test Event"
   - Check Vercel logs for the event processing

## Supported Events

### Facebook Page Events
- ✅ **feed** - New posts, updates to posts
- ✅ **comments** - New comments on posts
- ✅ **reactions** - Likes, reactions on posts
- ✅ **mention** - When your page is mentioned

### Instagram Events
- ✅ **comments** - Comments on Instagram posts
- ✅ **mentions** - Mentions in Instagram stories/posts
- ✅ **story_insights** - Story view insights

### Messaging Events (Messenger/Instagram DM)
- ✅ **messages** - Incoming messages
- ✅ **messaging_postbacks** - Button clicks
- ✅ **message_reads** - Message read receipts

## Webhook Handler Features

### 1. Verification (GET Request)
- Responds to webhook verification challenge
- Uses verify token to authenticate Meta's request
- Returns challenge parameter on success

### 2. Signature Verification
- Verifies webhook signatures using SHA-256 HMAC
- Uses your app secret to validate authenticity
- Rejects requests with invalid signatures

### 3. Event Processing
- Handles multiple event types
- Processes entries and changes
- Logs all events for debugging

### 4. Error Handling
- Comprehensive error logging
- Graceful failure handling
- Returns appropriate HTTP status codes

## Expected Behavior

### Verification Request (GET)
```
GET /api/meta/webhooks?hub.mode=subscribe&hub.verify_token=tnr_meta_webhook_verify_2024&hub.challenge=12345

→ Response: 12345 (200 OK)
```

### Webhook Event (POST)
```
POST /api/meta/webhooks
X-Hub-Signature-256: sha256=...
Body: { object: 'page', entry: [...] }

→ Response: EVENT_RECEIVED (200 OK)
```

## Vercel Logs

After setup, you should see in Vercel logs:

### Verification
```
🔐 Webhook verification request received
   Mode: subscribe
   Token: tnr_meta_webhook_verify_2024
✅ Webhook verified successfully
```

### Events
```
📥 Webhook event received
✅ Webhook signature verified
📦 Webhook event: { object: 'page', entryCount: 1 }
📄 Facebook Page event for page: 123456789
📰 Feed update: {...}
```

## Security

### App Secret
Your app secret is used to verify webhook signatures:
- **Stored in:** Environment variables (secure)
- **Used for:** HMAC signature verification
- **Never exposed in:** Logs or responses

### Verify Token
Your verify token is used for initial webhook setup:
- **Stored in:** Environment variables
- **Used for:** Webhook endpoint verification
- **Changed if:** You need to re-verify the endpoint

## Troubleshooting

### Verification Failed
**Issue:** Meta shows "Verification Failed"

**Solutions:**
1. Verify callback URL is correct: `https://www.tnrbusinesssolutions.com/api/meta/webhooks`
2. Verify token matches: `tnr_meta_webhook_verify_2024`
3. Check Vercel logs for errors
4. Ensure environment variable is set

### Invalid Signature
**Issue:** Webhook events rejected with "Invalid signature"

**Solutions:**
1. Verify `META_APP_SECRET` environment variable is set correctly
2. Check that app secret matches Meta Dashboard
3. Ensure request body is read correctly
4. Check Vercel logs for signature details

### Events Not Received
**Issue:** Webhook verified but no events received

**Solutions:**
1. Verify you've subscribed to the correct fields
2. Check that your app has necessary permissions
3. Trigger a test event from Meta Dashboard
4. Check Vercel logs for incoming requests

## Next Steps

1. ✅ Add `META_VERIFY_TOKEN` to Vercel environment variables
2. ✅ Configure webhook in Meta Dashboard
3. ✅ Subscribe to desired event fields
4. ✅ Test webhook verification
5. ✅ Test webhook events
6. ✅ Implement business logic for handling events

## Implementation

The webhook handler is ready to receive events. To add business logic:

1. **Edit:** `server/handlers/meta-webhooks.js`
2. **Update:** Event handler functions (handlePageEvent, handleInstagramEvent, etc.)
3. **Add:** Your custom logic for processing events
4. **Test:** Trigger events and verify processing

---

**Status:** Ready for configuration
**Webhook URL:** `https://www.tnrbusinesssolutions.com/api/meta/webhooks`
**Verify Token:** `tnr_meta_webhook_verify_2024`

