# 🚀 Vercel Deployment Checklist

## New Features to Deploy

### ✅ Multi-Platform Features
1. **Multi-Platform Posting API**
   - File: `server/handlers/post-to-multiple-platforms.js`
   - Endpoint: `/api/social/post-to-multiple-platforms`
   - Route: Added to `serve-clean.js` (line 590-604)

2. **Calendar View**
   - File: `calendar-view.html`
   - New page for visual calendar scheduling

3. **Enhanced Scheduling UI**
   - File: `posts-management.html` (updated)
   - Multi-platform selection checkboxes
   - Integration with multi-platform API

4. **Quick Post Feature**
   - File: `admin-dashboard-v2.html` (updated)
   - Quick post section with multi-platform support

5. **Database Updates**
   - File: `database.js` (updated)
   - Added `messages` table schema

---

## Deployment Steps

### Option 1: Git Push (Recommended if connected to Vercel)

1. **Check Git Status**
   ```bash
   git status
   ```

2. **Stage All Changes**
   ```bash
   git add -A
   ```

3. **Commit Changes**
   ```bash
   git commit -m "feat: Add multi-platform posting, calendar view, and quick post features"
   ```

4. **Push to Repository**
   ```bash
   git push origin main
   ```
   (or `git push origin master` if using master branch)

5. **Vercel will automatically deploy** if connected to GitHub/GitLab/Bitbucket

---

### Option 2: Vercel CLI Deployment

1. **Install Vercel CLI** (if not installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

---

### Option 3: Manual Upload via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "Redeploy" or upload files manually

---

## Files Changed/Added

### New Files
- ✅ `server/handlers/post-to-multiple-platforms.js`
- ✅ `calendar-view.html`
- ✅ `MULTI_PLATFORM_FEATURES_COMPLETE.md`
- ✅ `TEST_RESULTS.md`
- ✅ `DEPLOYMENT_CHECKLIST.md`

### Modified Files
- ✅ `serve-clean.js` (added multi-platform route)
- ✅ `posts-management.html` (enhanced with multi-platform)
- ✅ `admin-dashboard-v2.html` (added quick post)
- ✅ `database.js` (added messages table)

---

## Pre-Deployment Checks

- ✅ All files exist
- ✅ Syntax errors fixed
- ✅ Routes registered
- ✅ Database schema updated
- ✅ API endpoints working locally

---

## Post-Deployment Verification

After deployment, verify:

1. **Multi-Platform API**
   - Test: `POST https://your-domain.vercel.app/api/social/post-to-multiple-platforms`
   - Should return success response

2. **Calendar View**
   - Visit: `https://your-domain.vercel.app/calendar-view.html`
   - Should load calendar

3. **Posts Management**
   - Visit: `https://your-domain.vercel.app/posts-management.html`
   - Schedule modal should have multi-platform checkboxes

4. **Quick Post**
   - Visit: `https://your-domain.vercel.app/admin-dashboard-v2.html`
   - Quick Post section should be visible

---

## Environment Variables

Make sure these are set in Vercel:

- `POSTGRES_URL` - Database connection string
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password
- `META_APP_ID` - Facebook App ID (if using)
- `META_APP_SECRET` - Facebook App Secret (if using)
- `PORT` - Server port (optional, defaults to 3000)

---

## Troubleshooting

### If deployment fails:

1. **Check Vercel logs** in dashboard
2. **Verify environment variables** are set
3. **Check build logs** for errors
4. **Ensure all dependencies** are in `package.json`
5. **Verify file paths** are correct (case-sensitive on Linux)

### Common Issues:

- **Module not found**: Check `package.json` dependencies
- **Database connection error**: Verify `POSTGRES_URL` is set
- **Route not found**: Check `serve-clean.js` route registration
- **File not found**: Verify file paths match exactly

---

## Deployment Status

- [ ] Git repository initialized
- [ ] Changes committed
- [ ] Pushed to remote
- [ ] Vercel deployment triggered
- [ ] Deployment successful
- [ ] All features tested on production

---

## Next Steps After Deployment

1. Test all features on production URL
2. Verify database connections
3. Test multi-platform posting with real tokens
4. Check calendar view loads correctly
5. Verify quick post works

---

**Ready to deploy!** 🚀
