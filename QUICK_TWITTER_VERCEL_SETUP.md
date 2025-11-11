# 🚀 Quick Twitter/X Vercel Setup - 2 Minutes

## ⚡ Add Environment Variables to Vercel

1. Go to: [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → **Settings** → **Environment Variables**

2. Add these 3 variables to **All Environments** (Production, Preview, Development):

| Variable Name | Value |
|--------------|-------|
| `TWITTER_CLIENT_ID` | `WnRBRW1sWUFBRkRaYmFNTG8wU0Y6MTpjaQ` |
| `TWITTER_CLIENT_SECRET` | `0bC4qZu82KjWEdyqmd2Olfg5eoNvYTXUma8lXWWYawF06WVQK3` |
| `TWITTER_REDIRECT_URI` | `https://www.tnrbusinesssolutions.com/api/auth/twitter/callback` |

3. Click **Save** for each variable

4. **Wait 1-2 minutes** for Vercel to auto-redeploy (or manually redeploy)

## ✅ Test the OAuth Flow

1. Go to: `https://www.tnrbusinesssolutions.com/admin-dashboard.html`
2. Click **📱 Social Media** tab
3. Click **🐦 Connect X (Twitter)**
4. Complete the authorization flow
5. Token will be saved automatically! 🎉

## 📋 What This Enables

- ✅ Users can connect their Twitter/X accounts via OAuth 2.0
- ✅ Tokens are automatically saved to the database
- ✅ Ready to post tweets from the admin dashboard
- ✅ No manual token management needed

## ⚠️ Important

- Your app permissions are set to **"Read and Write"** ✅
- The OAuth flow will work once these environment variables are added
- Tokens generated via OAuth will have the correct permissions automatically

---

**Full documentation:** See `TWITTER_SETUP_INSTRUCTIONS.md` for complete setup guide.

