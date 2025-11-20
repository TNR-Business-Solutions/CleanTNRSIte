# Threads API Setup Guide

## Overview

Threads integration is now ready for your social automation app. This allows you to post to Threads and manage your Threads account.

## Configuration

### App Credentials
- **Threads App ID:** `1453925242353888`
- **Threads App Secret:** `1c72d00838f0e2f3595950b6e42ef3df`
- **Display Name:** TNR Social Automation

### Environment Variables (Vercel)

Add these to Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `THREADS_APP_ID` | `1453925242353888` | All |
| `THREADS_APP_SECRET` | `1c72d00838f0e2f3595950b6e42ef3df` | All |
| `THREADS_REDIRECT_URI` | `https://www.tnrbusinesssolutions.com/api/auth/threads/callback` | All |

## Threads App Configuration

### 1. Redirect Callback URLs

In your Threads app settings, add:

```
https://www.tnrbusinesssolutions.com/api/auth/threads/callback
```

### 2. Uninstall Callback URL (Optional)

```
https://www.tnrbusinesssolutions.com/api/threads/uninstall
```

### 3. Delete Callback URL (Optional)

```
https://www.tnrbusinesssolutions.com/api/threads/delete
```

## OAuth Flow

### Initiate Authentication

**URL:** `https://www.tnrbusinesssolutions.com/api/auth/threads`

**Scopes:**
- `threads_basic` - Basic profile info
- `threads_content_publish` - Publish threads
- `threads_manage_insights` - Read insights
- `threads_manage_replies` - Manage replies

### Flow Steps

1. User clicks "Connect Threads"
2. Redirects to Threads authorization page
3. User approves permissions
4. Redirects back to callback URL
5. Exchange code for access token
6. Get long-lived token (60 days)
7. Fetch user profile
8. Save token to database

## API Endpoints

### 1. Initiate OAuth
```
GET /api/auth/threads
```

### 2. OAuth Callback
```
GET /api/auth/threads/callback?code=xxx&state=xxx
```

### 3. Post to Threads
```
POST /api/post/threads
Content-Type: application/json

{
  "text": "Your thread content here",
  "imageUrl": "https://example.com/image.jpg" // optional
}
```

## Features

### OAuth Authentication
- ✅ Secure OAuth 2.0 flow
- ✅ CSRF protection with state tokens
- ✅ Long-lived tokens (60 days)
- ✅ Token storage in database
- ✅ User profile fetching

### Posting
- ✅ Text posts (up to 500 characters)
- ✅ Image posts
- ✅ Automatic token management
- ✅ Error handling

### Token Management
- ✅ Automatic token exchange
- ✅ Long-lived token conversion
- ✅ Database persistence
- ✅ Token expiration tracking

## Usage

### Connect Threads Account

```javascript
// Redirect user to Threads OAuth
window.location.href = '/api/auth/threads?returnUrl=/admin-dashboard.html';
```

### Post to Threads

```javascript
const response = await fetch('/api/post/threads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Hello from TNR Social Automation! 🚀',
    useDatabaseToken: true
  })
});

const result = await response.json();
console.log('Thread ID:', result.thread_id);
```

### Post with Image

```javascript
const response = await fetch('/api/post/threads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Check out this awesome image! 📸',
    imageUrl: 'https://example.com/image.jpg',
    useDatabaseToken: true
  })
});
```

## Limitations

### Content Limits
- **Text:** 500 characters maximum
- **Images:** Must be publicly accessible URLs
- **Rate Limits:** Follow Threads API rate limits

### Requirements
- **Account Type:** Must be a public Threads account
- **Testing:** Can only generate tokens for app testers
- **App Status:** App must be approved for production use

## Testing

### Generate Test Token

1. Go to Meta App Dashboard → Threads API
2. Under "User Token Generator"
3. Add your Threads account as a tester
4. Generate long-lived access token
5. Use in API calls for testing

### Test OAuth Flow

1. Visit: `https://www.tnrbusinesssolutions.com/api/auth/threads`
2. Authorize the app
3. Check redirect to dashboard with success message
4. Verify token saved in database

### Test Posting

```bash
curl -X POST https://www.tnrbusinesssolutions.com/api/post/threads \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test post from API",
    "useDatabaseToken": true
  }'
```

## Troubleshooting

### "Missing access token"
- Ensure you've connected your Threads account
- Check database for saved token
- Re-authenticate if token expired

### "Text too long"
- Threads posts are limited to 500 characters
- Reduce text length and try again

### "Invalid redirect URI"
- Verify redirect URI in Threads app settings
- Must exactly match: `https://www.tnrbusinesssolutions.com/api/auth/threads/callback`

### "Account not public"
- Threads API only works with public accounts
- Switch to public account in Threads app settings

## Security

### Token Storage
- Tokens stored securely in database
- Never exposed in client-side code
- Encrypted in transit

### OAuth State
- Random state tokens for CSRF protection
- 10-minute expiration
- Automatic cleanup

### App Secret
- Never exposed in logs or responses
- Stored only in environment variables
- Used for token exchange

## Next Steps

1. ✅ Add environment variables to Vercel
2. ✅ Configure redirect URLs in Threads app
3. ✅ Wait for deployment to complete
4. ✅ Test OAuth flow
5. ✅ Generate test tokens
6. ✅ Test posting functionality

## Documentation

- **Threads API Docs:** https://developers.facebook.com/docs/threads
- **OAuth Guide:** https://developers.facebook.com/docs/threads/get-started
- **Publishing Guide:** https://developers.facebook.com/docs/threads/posts

---

**Status:** Ready for configuration
**OAuth URL:** `https://www.tnrbusinesssolutions.com/api/auth/threads`
**Callback URL:** `https://www.tnrbusinesssolutions.com/api/auth/threads/callback`

