# Twitter/X API Setup Instructions

## Your Twitter/X Credentials

You have generated the following credentials from the X Developer Portal:

### Bearer Token (OAuth 2.0) - **RECOMMENDED** ✅
- **Bearer Token**: `AAAAAAAAAAAAAAAAAAAAAP+Y5QEAAAAAyvMFm/9j+nK3vcqXpCh/nAnyFfE=SDzYcI7JGB3vt8MUVAAsf0G2UzCye1IRCkgHgb259kHPmaYCxc`

**This Bearer Token is the easiest to use** - it works directly with the current implementation and doesn't require OAuth 1.0a signing.

### Access Token and Secret (OAuth 1.0a) - Alternative
- **Access Token**: `1960032716675858433-utRcm0ssHi3jtxwezEmgAbVSKwMJqS`
- **Access Token Secret**: `Tm025vvA3qSoi4lahlBEWoYbwRAiBkggCFAuM4WQza8MT`

**Note:** OAuth 1.0a tokens require request signing. The Bearer Token is simpler and recommended.

## Option 1: Save Tokens Directly to Database (Recommended)

You can save these tokens directly to the database using the admin dashboard or API:

### Via Admin Dashboard:
1. Go to `/admin-dashboard.html`
2. Navigate to the "Social Media" tab
3. Click "Connect X (Twitter)" - this will save your tokens

### Via API (Manual Save) - Bearer Token (Recommended):

**Using curl:**
```bash
curl -X POST https://www.tnrbusinesssolutions.com/api/social-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "action": "save",
    "platform": "twitter",
    "access_token": "AAAAAAAAAAAAAAAAAAAAAP+Y5QEAAAAAyvMFm/9j+nK3vcqXpCh/nAnyFfE=SDzYcI7JGB3vt8MUVAAsf0G2UzCye1IRCkgHgb259kHPmaYCxc",
    "page_name": "TNR Business Solutions (@TNRBusinessSol)",
    "token_type": "Bearer"
  }'
```

**Using JavaScript (browser console or Node.js):**
```javascript
fetch('https://www.tnrbusinesssolutions.com/api/social-tokens', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'save',
    platform: 'twitter',
    access_token: 'AAAAAAAAAAAAAAAAAAAAAP+Y5QEAAAAAyvMFm/9j+nK3vcqXpCh/nAnyFfE=SDzYcI7JGB3vt8MUVAAsf0G2UzCye1IRCkgHgb259kHPmaYCxc',
    page_name: 'TNR Business Solutions (@TNRBusinessSol)',
    token_type: 'Bearer'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Token saved!', data);
  alert('Twitter/X token saved successfully!');
})
.catch(err => {
  console.error('❌ Error:', err);
  alert('Error saving token: ' + err.message);
});
```

### Via API (Manual Save) - OAuth 1.0a Tokens (Alternative):

If you prefer to use the Access Token and Secret:

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

**Note:** OAuth 1.0a tokens require the `access_token_secret` for request signing, which is not currently stored in the database schema. The Bearer Token approach is recommended as it works immediately with the current implementation.

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

⚠️ **IMPORTANT:** Your tokens currently have **Read Only** permissions as shown in the X Developer Portal. To post tweets, you need to:

1. Go to your X Developer Portal: https://developer.twitter.com/en/portal/dashboard
2. Navigate to your app: **TNR_Business_Automation**
3. Go to **Settings** → **User authentication settings**
4. Under **App permissions**, change from **Read** to **Read and Write**
5. **Regenerate your Bearer Token** (or Access Token and Secret) with the new permissions
6. Save the new token using the instructions above

**Current Status:** Your Bearer Token has Read Only permissions - it can read tweets but cannot post. You must update permissions and regenerate the token to enable posting.

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

