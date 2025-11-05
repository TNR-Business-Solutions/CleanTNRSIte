# LinkedIn OAuth Setup Instructions

## ✅ Your LinkedIn App Credentials

Based on your LinkedIn Developer Console:

- **Client ID**: `78pjq1wt4wz1fs`
- **Client Secret**: `[YOUR_CLIENT_SECRET]` (Get this from LinkedIn Developer Console → Your App → Auth → Application credentials)
- **Access Token Duration**: 2 months (5184000 seconds)
- **OAuth Scope**: `w_member_social` ✅ (Correct for posting)

## 🔧 Step 1: Add Redirect URL to LinkedIn

**CRITICAL**: You must add the redirect URL to your LinkedIn app's authorized redirect URLs.

1. Go to your LinkedIn app: https://www.linkedin.com/developers/apps
2. Click on your "Automation" app
3. Go to **Auth** tab
4. Under **Authorized redirect URLs for your app**, click **Add redirect URL**
5. Add this URL:
   ```
   https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback
   ```
6. Click **Update**

⚠️ **Important**: The redirect URL must match exactly (including `https://` and `www.`)

## 🔑 Step 2: Add Environment Variables to Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project (`clean-site` or `tnrbusinesssolutions`)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `LINKEDIN_CLIENT_ID` | `78pjq1wt4wz1fs` | Production, Preview, Development |
   | `LINKEDIN_CLIENT_SECRET` | `[YOUR_CLIENT_SECRET]` (Get from LinkedIn Developer Console) | Production, Preview, Development |
   | `LINKEDIN_REDIRECT_URI` | `https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback` | Production, Preview, Development |

5. Click **Save** for each variable
6. **Redeploy** your application (Vercel will automatically redeploy after adding environment variables)

## 🧪 Step 3: Test the Connection

1. Go to your Admin Dashboard: https://www.tnrbusinesssolutions.com/admin-dashboard.html
2. Click on the **📱 Social Media** tab
3. Click **💼 Connect LinkedIn**
4. You'll be redirected to LinkedIn to authorize
5. Click **Allow** to grant permissions
6. You'll be redirected back with a success message
7. Your token will be automatically saved to the database

## ✅ Step 4: Verify Token

1. In the Admin Dashboard → Social Media tab
2. You should see your LinkedIn account listed
3. Click **🧪 Test** to verify the token is valid
4. You should see: "✅ LinkedIn token is valid"

## 📝 Step 5: Post to LinkedIn

Once connected, you can post to LinkedIn using:

```javascript
// Via API
POST /api/social/post-to-linkedin
{
  "content": "Your LinkedIn post content here"
}
```

Or use the Admin Dashboard's posting interface.

## 🔄 Token Refresh

LinkedIn tokens expire after 2 months. When a token expires:

1. The system will detect it when you try to post
2. You'll get an error message
3. Simply reconnect by clicking **💼 Connect LinkedIn** again
4. The new token will replace the old one automatically

## 🐛 Troubleshooting

### Error: "Invalid redirect URI"
- **Solution**: Make sure the redirect URL in LinkedIn matches exactly: `https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback`
- Check for typos, `http` vs `https`, `www` vs non-www

### Error: "Invalid client credentials"
- **Solution**: Double-check your `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` in Vercel
- Make sure there are no extra spaces
- Redeploy after adding environment variables

### Error: "Token expired"
- **Solution**: Reconnect your LinkedIn account (tokens expire after 2 months)
- Click **💼 Connect LinkedIn** again in the Admin Dashboard

### Error: "Insufficient permissions"
- **Solution**: Make sure `w_member_social` scope is enabled in your LinkedIn app
- Go to LinkedIn Developer Console → Your App → Auth → OAuth 2.0 scopes

## 📚 Additional Resources

- LinkedIn API Documentation: https://docs.microsoft.com/en-us/linkedin/
- LinkedIn Developer Console: https://www.linkedin.com/developers/apps
- UGC Posts API: https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin

---

**Status**: ✅ Ready to use once environment variables are added to Vercel and redirect URL is configured in LinkedIn.

