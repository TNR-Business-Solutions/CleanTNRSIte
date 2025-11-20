# Instagram API Setup Guide

## Overview

Instagram Business API integration is now ready for your social automation platform. Manage comments, messages, and content on Instagram.

## Configuration

### Your Instagram App
- **App Name:** TNR Social Automation-IG
- **App ID:** `1295923225557249`
- **App Secret:** `faf897f06f8cdfccdcd3eabc2d4f3c24`

### Required Permissions
- ✅ `instagram_business_basic` - Basic profile and media access
- ✅ `instagram_manage_comments` - Manage comments on posts
- ✅ `instagram_business_manage_messages` - Send and receive DMs

### Environment Variables (Vercel)

Add these to Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `INSTAGRAM_APP_ID` | `1295923225557249` | All |
| `INSTAGRAM_APP_SECRET` | `faf897f06f8cdfccdcd3eabc2d4f3c24` | All |
| `INSTAGRAM_VERIFY_TOKEN` | `tnr_instagram_verify_2024` | All |
| `META_APP_SECRET` | `8bb683dbc591772f9fe6dada7e2d792b` | All |

## Webhook Configuration

### Callback URL
```
https://www.tnrbusinesssolutions.com/api/instagram/webhooks
```

### Verify Token
```
tnr_instagram_verify_2024
```

### Setup Steps

1. **Go to Meta App Dashboard**
   - Navigate to: https://developers.facebook.com/apps/2201740210361183
   - Go to: **Instagram API** → **Configure webhooks**

2. **Configure Webhook**
   - **Callback URL:** `https://www.tnrbusinesssolutions.com/api/instagram/webhooks`
   - **Verify Token:** `tnr_instagram_verify_2024`
   - Click **Verify and save**

3. **Subscribe to Webhook Fields**
   - ✅ **comments** - Comments on your posts
   - ✅ **mentions** - When you're mentioned in stories/posts
   - ✅ **story_insights** - Story performance metrics
   - ✅ **live_comments** - Comments during live videos
   - ✅ **messages** - Instagram Direct Messages

4. **Add Instagram Account**
   - Go to: **Instagram API** → **Generate access tokens**
   - Add your Instagram Business account
   - **Important:** Assign Instagram Tester role in Roles tab first

5. **Publish App** (Required for Webhooks)
   - Webhooks only work when app is published
   - Go to: **App Review** → **Publish**
   - Or test with approved testers before publishing

## Supported Events

### Comment Events
- ✅ New comments on your posts
- ✅ Replies to comments
- ✅ Comment text and author info
- ✅ Parent comment tracking (for replies)

### Mention Events
- ✅ Mentions in stories
- ✅ Mentions in posts
- ✅ Mentions in comments

### Story Insights
- ✅ Impressions
- ✅ Reach
- ✅ Taps forward
- ✅ Taps back
- ✅ Exits

### Live Comment Events
- ✅ Comments during live videos
- ✅ Real-time comment stream

### Messaging Events (Instagram DMs)
- ✅ Incoming text messages
- ✅ Media attachments
- ✅ Quick replies
- ✅ Button postbacks
- ✅ Read receipts

## Features

### Webhook Handler
- ✅ Webhook verification (GET)
- ✅ Signature verification (SHA-256 HMAC)
- ✅ Comment event processing
- ✅ Mention tracking
- ✅ Story insights
- ✅ DM handling
- ✅ Live comment processing

### Security
- ✅ HMAC SHA-256 signature verification
- ✅ Verify token authentication
- ✅ Secure token storage

## Permissions Setup

### 1. Add Required Permissions

In Meta App Dashboard:
1. Go to: **App Review** → **Permissions and features**
2. Request these permissions:
   - `instagram_business_basic`
   - `instagram_manage_comments`
   - `instagram_business_manage_messages`

### 2. Assign Instagram Tester Role

1. Go to: **Roles** → **Instagram Testers**
2. Add your Instagram Business account
3. Accept the invite on Instagram
4. Generate access token for the account

### 3. Complete App Review (For Production)

**Before publishing:**
- App must pass review for advanced permissions
- Provide demo video showing app functionality
- Explain use case for each permission
- Add privacy policy and terms of service

## Testing

### Verify Webhook
1. Configure webhook in Meta Dashboard
2. Check Vercel logs for verification request
3. Should see: "✅ Instagram webhook verified successfully"

### Test Comment Event
1. Post an image on your Instagram Business account
2. Add a comment to the post
3. Check Vercel logs for comment event
4. Should see: "💬 Instagram comment on media: [media-id]"

### Test DM Event
1. Send a DM to your Instagram Business account
2. Check Vercel logs for message event
3. Should see: "📨 DM from [user-id]"

## Webhook Event Examples

### Comment Event
```json
{
  "object": "instagram",
  "entry": [{
    "id": "INSTAGRAM_ACCOUNT_ID",
    "time": 1699564800,
    "changes": [{
      "field": "comments",
      "value": {
        "id": "COMMENT_ID",
        "media": {
          "id": "MEDIA_ID",
          "media_product_type": "FEED"
        },
        "text": "Great post!",
        "from": {
          "id": "USER_ID",
          "username": "johndoe"
        }
      }
    }]
  }]
}
```

### DM Event
```json
{
  "object": "instagram",
  "entry": [{
    "id": "INSTAGRAM_ACCOUNT_ID",
    "time": 1699564800,
    "messaging": [{
      "sender": {
        "id": "USER_ID"
      },
      "recipient": {
        "id": "INSTAGRAM_ACCOUNT_ID"
      },
      "timestamp": 1699564800000,
      "message": {
        "mid": "MESSAGE_ID",
        "text": "Hello!"
      }
    }]
  }]
}
```

## Expected Vercel Logs

### Verification
```
🔐 Instagram webhook verification request received
   Mode: subscribe
   Token: tnr_instagram_verify_2024
✅ Instagram webhook verified successfully
```

### Comment Event
```
📥 Instagram webhook event received
✅ Webhook signature verified
📦 Webhook event: { object: 'instagram', entryCount: 1 }
📸 Instagram event: comments
💬 Instagram comment on media: 123456789
   From: johndoe (987654321)
   Text: Great post!
   Comment ID: comment_123
```

### DM Event
```
📥 Instagram webhook event received
✅ Webhook signature verified
💬 Instagram DM event for: 123456789
📨 DM from 987654321
   Text: Hello!
```

## Limitations

### App Status
- **Development:** Only approved testers receive webhooks
- **Published:** All users can trigger webhooks

### Rate Limits
- Follow Instagram API rate limits
- Webhook calls are not rate limited
- API calls to respond are rate limited

### Comment Management
- Can only manage comments on your own posts
- Can't delete comments, only hide them
- Reply limit: 180 chars for public replies

### Messaging
- Can only message users who message you first (24-hour window)
- Message templates not available for Instagram
- Limited to text and media messages

## Troubleshooting

### "Webhook verification failed"
**Solution:**
1. Verify callback URL is correct
2. Check verify token matches: `tnr_instagram_verify_2024`
3. Ensure app has Instagram API use case added
4. Check Vercel logs for errors

### "Invalid signature"
**Solution:**
1. Verify `INSTAGRAM_APP_SECRET` environment variable
2. Check app secret matches Meta Dashboard
3. Ensure `META_APP_SECRET` is set as fallback

### "No events received"
**Solution:**
1. Verify app is published or user is approved tester
2. Check webhook subscriptions are active
3. Verify Instagram account is Business/Creator account
4. Test with your own Instagram account first

### "Access token error"
**Solution:**
1. Verify Instagram Tester role is assigned
2. Check access token is generated for correct account
3. Ensure permissions are granted
4. Regenerate access token if expired

## Next Steps

1. ✅ Add environment variables to Vercel
2. ✅ Configure webhook in Meta Dashboard
3. ✅ Add Instagram account and generate token
4. ✅ Assign Instagram Tester role
5. ✅ Test webhook verification
6. ✅ Test comment and DM events
7. ✅ Complete app review for production
8. ✅ Publish app

## Advanced Features (TODO)

- [ ] Auto-reply to comments
- [ ] Comment moderation (hide/unhide)
- [ ] DM auto-responses
- [ ] Sentiment analysis on comments
- [ ] Hashtag tracking
- [ ] Competitor mention tracking
- [ ] Analytics dashboard
- [ ] Comment threading
- [ ] Bulk comment management

## Documentation

- **Instagram API:** https://developers.facebook.com/docs/instagram-api
- **Webhooks:** https://developers.facebook.com/docs/instagram-api/webhooks
- **Comments:** https://developers.facebook.com/docs/instagram-api/reference/ig-user/comments
- **Messaging:** https://developers.facebook.com/docs/messenger-platform/instagram

---

**Status:** Ready for configuration
**Webhook URL:** `https://www.tnrbusinesssolutions.com/api/instagram/webhooks`
**Verify Token:** `tnr_instagram_verify_2024`
**Note:** App must be published for webhooks to work with all users

