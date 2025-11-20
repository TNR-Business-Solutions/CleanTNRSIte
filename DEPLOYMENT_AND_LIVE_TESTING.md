# Deployment and Live Server Testing Guide

## 🚀 Deployment Status

**Last Push:** Successfully pushed to GitHub  
**Commit:** `ef1f239` - Fix Wix OAuth flow, SEO optimization, and comprehensive testing suite  
**Vercel:** Auto-deployment should be in progress

---

## 📋 What Was Deployed

### Core Fixes
- ✅ Neon database token persistence (fixed driver API)
- ✅ OAuth flow improvements with proper redirect handling
- ✅ Enhanced error logging and database connection verification
- ✅ E-commerce catalog sync with multi-platform support

### Testing Infrastructure
- ✅ Comprehensive test suite (smoke tests, Lighthouse, flowthrough)
- ✅ All tests passing locally (10/10 flowthrough, 100/100 Lighthouse)
- ✅ SEO optimizations (meta descriptions added)

### Dependencies
- ✅ Updated all packages to latest versions
- ✅ Security vulnerabilities fixed
- ✅ Workspace optimized

---

## 🌐 Testing on Live Server

### Step 1: Wait for Vercel Deployment

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your project: `tnr-business-solutions`
3. Wait for deployment to complete (usually 1-3 minutes)
4. Note your deployment URL (e.g., `https://tnr-business-solutions.vercel.app`)

### Step 2: Verify Environment Variables

Ensure these are set in Vercel:
- ✅ `POSTGRES_URL` - Neon database connection
- ✅ `WIX_APP_ID` - Wix application ID
- ✅ `WIX_APP_SECRET` - Wix application secret
- ✅ `WIX_REDIRECT_URI` - Should be your Vercel domain + `/api/auth/wix/callback`

### Step 3: Test Database Connection

```bash
# Test database connection on live server
curl https://your-domain.vercel.app/api/db/test
```

Expected response:
```json
{
  "success": true,
  "database": {
    "type": "Neon Postgres",
    "connected": true,
    "wixTokensTable": {
      "exists": true,
      "tokenCount": 0
    }
  }
}
```

### Step 4: Run Tests Against Live Server

```bash
# Set your Vercel domain
export TEST_BASE_URL=https://your-domain.vercel.app

# Or use PowerShell
$env:TEST_BASE_URL="https://your-domain.vercel.app"

# Run all tests
npm run test:wix:all
```

### Step 5: Test OAuth Flow on Live Server

1. Navigate to: `https://your-domain.vercel.app/wix-client-dashboard.html`
2. Click "Connect New Wix Client"
3. Complete OAuth flow
4. Verify token is saved in Neon database

### Step 6: Test SEO Tools

1. Navigate to: `https://your-domain.vercel.app/wix-seo-manager.html`
2. Select connected client
3. Run SEO audit
4. Test auto-optimize feature

### Step 7: Test E-commerce Manager

1. Navigate to: `https://your-domain.vercel.app/wix-ecommerce-manager.html`
2. Select connected client
3. View products
4. Test catalog sync

---

## 🔧 Vercel Configuration

### Required Environment Variables

Make sure these are set in Vercel Dashboard > Settings > Environment Variables:

```
POSTGRES_URL=postgresql://neondb_owner:npg_vOjG38AiJwBR@ep-twilight-bush-a4q7qlre-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
WIX_APP_ID=9901133d-7490-4e6e-adfd-cb11615cc5e4
WIX_APP_SECRET=87fd621b-f3d2-4b2f-b085-2c4f00a17b97
WIX_REDIRECT_URI=https://your-domain.vercel.app/api/auth/wix/callback
```

### Update Wix Redirect URI

**IMPORTANT:** After deployment, update the redirect URI in your Wix Developer Dashboard:

1. Go to: https://dev.wix.com/dashboard
2. Select your app
3. Go to OAuth Settings
4. Update Redirect URI to: `https://your-domain.vercel.app/api/auth/wix/callback`

---

## 🧪 Live Server Test Commands

### Quick Health Check
```bash
curl https://your-domain.vercel.app/health
```

### Database Test
```bash
curl https://your-domain.vercel.app/api/db/test
```

### Full Test Suite
```bash
TEST_BASE_URL=https://your-domain.vercel.app npm run test:wix:all
```

### Individual Tests
```bash
# Flowthrough tests
TEST_BASE_URL=https://your-domain.vercel.app npm run test:wix:flow

# Lighthouse tests
TEST_BASE_URL=https://your-domain.vercel.app npm run test:wix:lighthouse
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Vercel deployment completed successfully
- [ ] Environment variables are set correctly
- [ ] Database connection works (check `/api/db/test`)
- [ ] OAuth redirect URI updated in Wix Developer Dashboard
- [ ] Can access dashboard: `/wix-client-dashboard.html`
- [ ] Can access SEO manager: `/wix-seo-manager.html`
- [ ] Can access E-commerce manager: `/wix-ecommerce-manager.html`
- [ ] OAuth flow works (can connect a client)
- [ ] Tokens are saved to Neon database
- [ ] SEO tools work with connected client
- [ ] E-commerce manager loads products

---

## 🐛 Troubleshooting

### Issue: Database shows SQLite instead of Neon
**Solution:** Check that `POSTGRES_URL` is set in Vercel environment variables

### Issue: OAuth redirect fails
**Solution:** Update `WIX_REDIRECT_URI` in both Vercel and Wix Developer Dashboard

### Issue: Tokens not saving
**Solution:** Check server logs in Vercel dashboard for database connection errors

### Issue: Tests fail on live server
**Solution:** Ensure `TEST_BASE_URL` is set to your Vercel domain (not localhost)

---

## 📊 Expected Live Server Results

When testing on live server, you should see:

- ✅ All smoke tests pass
- ✅ Database type: "Neon Postgres" (not SQLite)
- ✅ OAuth flow redirects correctly
- ✅ Pages load in < 2 seconds
- ✅ SEO scores: 100/100
- ✅ All endpoints accessible

---

## 🎉 Success Indicators

Your deployment is successful when:

1. ✅ Vercel shows "Ready" status
2. ✅ `/health` endpoint returns 200
3. ✅ `/api/db/test` shows Neon Postgres connection
4. ✅ Can connect Wix client via OAuth
5. ✅ Token is saved in Neon database
6. ✅ All tests pass on live server

---

## 📞 Next Steps

1. **Monitor Vercel Deployment**
   - Check Vercel dashboard for deployment status
   - Review build logs for any errors

2. **Update Wix Redirect URI**
   - Critical: Update in Wix Developer Dashboard
   - Use your Vercel domain

3. **Test on Live Server**
   - Run test suite against live URL
   - Connect a real Wix client
   - Verify full flowthrough works

4. **Monitor Production**
   - Check Vercel function logs
   - Monitor Neon database usage
   - Verify tokens are persisting

---

**Deployment Date:** November 20, 2025  
**Status:** ✅ Pushed to GitHub, awaiting Vercel deployment

