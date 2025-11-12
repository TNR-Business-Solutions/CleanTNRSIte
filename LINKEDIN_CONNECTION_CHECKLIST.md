# ✅ LinkedIn Connection Checklist

## Your LinkedIn App Configuration (Verified ✅)

- **Client ID**: `78pjq1wt4wz1fs` ✅
- **Primary Client Secret**: `[YOUR_CLIENT_SECRET]` (Get from LinkedIn Developer Console → Auth → Application credentials) ✅
- **Redirect URI**: `https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback` ✅
- **OAuth Scope**: `w_member_social` ✅
- **Token Duration**: 2 months ✅

## 🔑 Step-by-Step: Add to Vercel

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your project (`clean-site` or `tnrbusinesssolutions`)

### 2. Add Environment Variables
- Go to **Settings** → **Environment Variables**
- Add these **3 variables**:

#### Variable 1: LINKEDIN_CLIENT_ID
- **Key**: `LINKEDIN_CLIENT_ID`
- **Value**: `78pjq1wt4wz1fs`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

#### Variable 2: LINKEDIN_CLIENT_SECRET
- **Key**: `LINKEDIN_CLIENT_SECRET`
- **Value**: `[YOUR_CLIENT_SECRET]` (Get from LinkedIn Developer Console → Auth → Application credentials)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- ⚠️ **Important**: Copy exactly, no extra spaces
- Click **Save**

#### Variable 3: LINKEDIN_REDIRECT_URI
- **Key**: `LINKEDIN_REDIRECT_URI`
- **Value**: `https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

### 3. Wait for Redeployment
- Vercel will automatically redeploy (usually 1-2 minutes)
- Wait until you see "Ready" status

## 🧪 Test Connection

1. Go to: https://www.tnrbusinesssolutions.com/admin-dashboard.html
2. Click **📱 Social Media** tab
3. Click **💼 Connect LinkedIn**
4. **Complete quickly** - authorization codes expire fast!
5. Click **Allow** on LinkedIn immediately
6. You should see a success page

## 🐛 If You Still Get Errors

### Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → **Logs**
2. Look for errors related to LinkedIn OAuth
3. Check for messages about missing environment variables

### Common Issues

**"Unknown error" or "Configuration Error"**
- ✅ Verify all 3 environment variables are set
- ✅ Check for typos or extra spaces
- ✅ Make sure all are set for Production, Preview, AND Development
- ✅ Redeploy after adding variables

**"Redirect URI mismatch"**
- ✅ Verify redirect URI in LinkedIn matches exactly
- ✅ Must include `https://` and `www.`
- ✅ No trailing slashes

**"Invalid client"**
- ✅ Double-check CLIENT_SECRET is correct
- ✅ Use Primary Client Secret (not Secondary)
- ✅ No extra spaces before/after

## ✅ Success Indicators

When it works, you'll see:
- ✅ Success page with your LinkedIn profile
- ✅ Token automatically saved
- ✅ LinkedIn account listed in Admin Dashboard
- ✅ Can test connection successfully

---

**Next Steps**: Add the environment variables to Vercel, wait for redeployment, then try connecting again!

