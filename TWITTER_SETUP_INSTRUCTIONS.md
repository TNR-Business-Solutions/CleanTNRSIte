# Twitter/X API Setup Instructions

## Your Twitter/X Credentials

You have generated the following credentials from the X Developer Portal:

- **Access Token**: `1960032716675858433-utRcm0ssHi3jtxwezEmgAbVSKwMJqS`
- **Access Token Secret**: `Tm025vvA3qSoi4lahlBEWoYbwRAiBkggCFAuM4WQza8MT`

These are **OAuth 1.0a tokens** that can be used directly for posting to Twitter/X.

## Option 1: Save Tokens Directly to Database (Recommended)

You can save these tokens directly to the database using the admin dashboard or API:

### Via Admin Dashboard:
1. Go to `/admin-dashboard.html`
2. Navigate to the "Social Media" tab
3. Click "Connect X (Twitter)" - this will save your tokens

### Via API (Manual Save):
You can use the social tokens API to save them using curl:

```bash
curl -X POST https://www.tnrbusinesssolutions.com/api/social-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "action": "save",
    "platform": "twitter",
    "access_token": "1960032716675858433-utRcm0ssHi3jtxwezEmgAbVSKwMJqS",
    "page_name": "TNR Business Solutions",
    "user_id": "1960032716675858433"
  }'
```

Or using JavaScript fetch:

```javascript
fetch('https://www.tnrbusinesssolutions.com/api/social-tokens', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'save',
    platform: 'twitter',
    access_token: '1960032716675858433-utRcm0ssHi3jtxwezEmgAbVSKwMJqS',
    page_name: 'TNR Business Solutions',
    user_id: '1960032716675858433'
  })
})
.then(r => r.json())
.then(console.log);
```

**Note:** The `access_token_secret` is not currently stored in the database schema. If you need OAuth 1.0a signing (which requires the secret), we'll need to update the database schema first. For now, we'll try using the access_token as a Bearer token (OAuth 2.0 style).

## Option 2: Add to Vercel Environment Variables

If you want to use these as fallback tokens, add them to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
TWITTER_ACCESS_TOKEN=1960032716675858433-utRcm0ssHi3jtxwezEmgAbVSKwMJqS
TWITTER_ACCESS_TOKEN_SECRET=Tm025vvA3qSoi4lahlBEWoYbwRAiBkggCFAuM4WQza8MT
```

## Important Notes

⚠️ **Security Warning:**
- These tokens provide full access to your Twitter/X account
- **DO NOT** commit these tokens to GitHub or share them publicly
- Store them securely in Vercel environment variables or the database
- If compromised, regenerate them immediately in the X Developer Portal

## Testing Your Tokens

After saving, test the connection:

1. Go to `/admin-dashboard.html`
2. Navigate to "Social Media" tab
3. Find your Twitter/X connection
4. Click "Test Connection" to verify the tokens work

## Posting to Twitter/X

Once tokens are saved, you can post using:

```bash
POST /api/post-to-twitter
Content-Type: application/json

{
  "text": "Your tweet content here (max 280 characters)"
}
```

Or use the admin dashboard's social media posting interface.

## Token Permissions

Your tokens have **Read Only** permissions as shown in the X Developer Portal. To post tweets, you need to:

1. Go to your X Developer Portal
2. Navigate to your app's settings
3. Update the app permissions to include **Read and Write** access
4. Regenerate your Access Token and Secret with the new permissions

## Troubleshooting

### Error: "Invalid or expired token"
- Check that tokens are correctly saved in the database
- Verify tokens haven't been revoked in X Developer Portal
- Ensure tokens have proper permissions (Read and Write for posting)

### Error: "Forbidden" or "Unauthorized"
- Your tokens may have Read Only permissions
- Regenerate tokens with Read and Write permissions
- Check that your app has the correct permissions in X Developer Portal

### Error: "Rate limit exceeded"
- Twitter/X has rate limits on API calls
- Wait before making additional requests
- Consider implementing rate limiting in your application

## Next Steps

1. ✅ Save tokens to database (via admin dashboard or API)
2. ✅ Test connection to verify tokens work
3. ✅ Update app permissions to Read and Write (if needed)
4. ✅ Start posting to Twitter/X from admin dashboard

