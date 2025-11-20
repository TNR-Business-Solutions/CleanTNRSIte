# WhatsApp Business API Setup Guide

## Overview

WhatsApp Business API integration is now ready for your social automation platform. Send and receive WhatsApp messages at scale.

## Configuration

### Your WhatsApp Business Account
- **Test Phone Number:** +1 555 145 9284
- **Phone Number ID:** `834327523105302`
- **WhatsApp Business Account ID:** `1390987755953317`
- **API Version:** v22.0

### Environment Variables (Vercel)

Add these to Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `WHATSAPP_PHONE_NUMBER_ID` | `834327523105302` | All |
| `WHATSAPP_ACCESS_TOKEN` | `[Your Access Token]` | All |
| `WHATSAPP_VERIFY_TOKEN` | `tnr_whatsapp_verify_2024` | All |
| `META_APP_SECRET` | `8bb683dbc591772f9fe6dada7e2d792b` | All |

**Note:** Get your access token from Meta App Dashboard → WhatsApp → API Setup → Access Token

## Webhook Configuration

### Callback URL
```
https://www.tnrbusinesssolutions.com/api/whatsapp/webhooks
```

### Verify Token
```
tnr_whatsapp_verify_2024
```

### Setup Steps

1. **Go to Meta App Dashboard**
   - Navigate to: https://developers.facebook.com/apps/2201740210361183
   - Go to: **WhatsApp** → **Configuration**

2. **Configure Webhook**
   - **Callback URL:** `https://www.tnrbusinesssolutions.com/api/whatsapp/webhooks`
   - **Verify Token:** `tnr_whatsapp_verify_2024`
   - Click **Verify and save**

3. **Subscribe to Webhooks**
   - Select fields:
     - ✅ **messages** - Incoming messages
     - ✅ **message_template_status_update** - Template status changes

## API Endpoints

### 1. Receive Messages (Webhook)
```
GET/POST /api/whatsapp/webhooks
```

### 2. Send Message
```
POST /api/send/whatsapp
Content-Type: application/json

{
  "to": "1234567890",
  "type": "text",
  "text": "Hello from TNR!"
}
```

## Sending Messages

### Text Message
```javascript
await fetch('/api/send/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '1234567890',
    type: 'text',
    text: 'Hello! This is a test message from TNR Social Automation.'
  })
});
```

### Template Message (hello_world)
```javascript
await fetch('/api/send/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '1234567890',
    type: 'template',
    templateName: 'hello_world',
    languageCode: 'en_US'
  })
});
```

### Image Message
```javascript
await fetch('/api/send/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '1234567890',
    type: 'image',
    imageUrl: 'https://example.com/image.jpg',
    caption: 'Check out this image!'
  })
});
```

### Mark Message as Read
```javascript
await fetch('/api/send/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'markAsRead',
    messageId: 'wamid.xxx'
  })
});
```

## Webhook Events

### Incoming Messages
The webhook receives events when:
- ✅ User sends a text message
- ✅ User sends an image
- ✅ User sends a video
- ✅ User sends a document
- ✅ User sends audio
- ✅ User sends location
- ✅ User sends contacts

### Message Status Updates
- ✅ **sent** - Message sent to WhatsApp servers
- ✅ **delivered** - Message delivered to recipient
- ✅ **read** - Message read by recipient
- ✅ **failed** - Message failed to send

### Template Status Updates
- ✅ Template approved
- ✅ Template rejected
- ✅ Template disabled

## Features

### Webhook Handler
- ✅ Webhook verification (GET)
- ✅ Signature verification (SHA-256 HMAC)
- ✅ Message event processing
- ✅ Status update tracking
- ✅ Template status monitoring

### Message Sending
- ✅ Text messages
- ✅ Template messages
- ✅ Image messages
- ✅ Mark as read
- ✅ Error handling

## Testing

### Test with curl (Text Message)
```bash
curl -X POST https://www.tnrbusinesssolutions.com/api/send/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "type": "text",
    "text": "Test message from API"
  }'
```

### Test with curl (Template Message)
```bash
curl -X POST https://www.tnrbusinesssolutions.com/api/send/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "type": "template",
    "templateName": "hello_world",
    "languageCode": "en_US"
  }'
```

### Send Test Message from Meta Dashboard

1. Go to: WhatsApp → API Setup
2. Select your test phone number
3. Enter a recipient number
4. Click "Send message"

## Pricing

### Test Numbers (Free for 90 days)
- ✅ Free messages for 90 days
- ✅ Test with your own phone number
- ✅ No payment method required

### Production Numbers
- 💰 Pay-per-message pricing
- 💰 Varies by country/region
- 💰 Payment method required

See: https://developers.facebook.com/docs/whatsapp/pricing

## Limitations

### Test Numbers
- **Duration:** 90 days free trial
- **Recipients:** Limited to test numbers
- **Volume:** Limited message volume

### Message Templates
- **Approval:** Templates must be approved by Meta
- **Content:** Follow WhatsApp Business Policy
- **Response Time:** Usually 24-48 hours for approval

### Rate Limits
- **Quality Rating:** Affects rate limits
- **Phone Number Status:** Verified numbers have higher limits
- **Tier System:** Start at 1,000 messages/day, scale up

## Security

### Webhook Verification
- ✅ Verify token authentication
- ✅ SHA-256 HMAC signature verification
- ✅ Secure token storage

### Access Token
- ✅ Stored in environment variables
- ✅ Never exposed in logs
- ✅ Used for API authentication

## Troubleshooting

### "Webhook verification failed"
**Solution:**
1. Verify callback URL is correct
2. Check verify token matches: `tnr_whatsapp_verify_2024`
3. Ensure endpoint is accessible
4. Check Vercel logs for errors

### "Invalid signature"
**Solution:**
1. Verify `META_APP_SECRET` environment variable
2. Check app secret matches Meta Dashboard
3. Ensure request body is read correctly

### "Missing access token"
**Solution:**
1. Generate access token in Meta Dashboard
2. Add to Vercel environment variables
3. Redeploy application

### "Message not delivered"
**Solution:**
1. Verify recipient phone number format (no + or spaces)
2. Check phone number has opted in
3. Verify access token is valid
4. Check WhatsApp Business Account status

## Next Steps

1. ✅ Add environment variables to Vercel
2. ✅ Configure webhook in Meta Dashboard
3. ✅ Test webhook verification
4. ✅ Send test message
5. ✅ Receive and process incoming messages
6. ✅ Add payment method (for production)
7. ✅ Add your business phone number

## Advanced Features (TODO)

- [ ] Message templates with variables
- [ ] Rich media messages (video, documents)
- [ ] Interactive messages (buttons, lists)
- [ ] Message reactions
- [ ] Catalog messages
- [ ] Flow messages
- [ ] Auto-reply system
- [ ] Message scheduling
- [ ] Analytics and reporting

## Documentation

- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp
- **Cloud API:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Webhooks:** https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
- **Message Templates:** https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates

---

**Status:** Ready for configuration
**Webhook URL:** `https://www.tnrbusinesssolutions.com/api/whatsapp/webhooks`
**Verify Token:** `tnr_whatsapp_verify_2024`

