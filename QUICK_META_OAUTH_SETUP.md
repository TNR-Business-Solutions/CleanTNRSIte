# 🚀 Quick Meta OAuth Setup - TNR Business Solutions

## ⚡ Fast Setup (5 Minutes)

### Step 1: Add Environment Variables to Vercel
Go to: [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these 3 variables to **All Environments** (Production, Preview, Development):

```
META_APP_ID = 2201740210361183
META_APP_SECRET = 0d2b09da0b07236276de7ae1adc05487
META_REDIRECT_URI = https://www.tnrbusinesssolutions.com/api/auth/meta/callback
```

### Step 2: Update Meta App Redirect URI
Go to: [Meta Developers](https://developers.facebook.com/apps/2201740210361183) → Use cases → Facebook Login for Business → Settings

Add to **Valid OAuth Redirect URIs**:
```
https://www.tnrbusinesssolutions.com/api/auth/meta/callback
```

### Step 3: Deploy to Vercel
```bash
git add .
git commit -m "Add Meta OAuth serverless functions"
git push origin main
```

Wait ~2 minutes for deployment to complete.

### Step 4: Test OAuth Flow
Visit in your browser:
```
https://www.tnrbusinesssolutions.com/auth/meta
```

1. Login to Facebook
2. Approve permissions
3. Select your pages
4. **Save the tokens from the JSON response!**

---

## 📋 What You'll Get

After authorization, you'll receive:
- ✅ Long-lived user token (60 days)
- ✅ Page access token (never expires)
- ✅ Instagram account details
- ✅ Ready to post to Facebook & Instagram!

---

## 🔗 Your OAuth Endpoints

**Start OAuth Flow:**
```
https://www.tnrbusinesssolutions.com/auth/meta
```

**Callback URL (configured automatically):**
```
https://www.tnrbusinesssolutions.com/api/auth/meta/callback
```

---

## ✅ Files Created

- `/api/auth/meta.js` - OAuth initiation endpoint
- `/api/auth/meta/callback.js` - OAuth callback handler
- `META_OAUTH_SETUP_GUIDE.md` - Full documentation
- `QUICK_META_OAUTH_SETUP.md` - This quick reference

---

## 🆘 Troubleshooting

**Problem:** "META_APP_ID not configured"
**Solution:** Add environment variables in Vercel, then redeploy

**Problem:** "Redirect URI mismatch"
**Solution:** Verify the callback URL in Meta App matches exactly

**Problem:** OAuth completes but no JSON response
**Solution:** Check Vercel function logs for errors

---

## 📝 Next Steps After Getting Tokens

1. Store tokens securely (Vercel env vars or database)
2. Test posting with the access token
3. Connect to GMB Post Generator
4. Set up automated scheduling

---

## 🎯 Key Points

- ✅ No LocalTunnel needed anymore!
- ✅ Production-ready on Vercel
- ✅ HTTPS everywhere
- ✅ Tokens don't expire (page tokens)
- ✅ Works for both Facebook & Instagram

---

*Need detailed instructions? See `META_OAUTH_SETUP_GUIDE.md`*

