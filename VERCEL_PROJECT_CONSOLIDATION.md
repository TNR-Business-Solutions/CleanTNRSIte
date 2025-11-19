# Vercel Project Consolidation Guide

**Goal:** Consolidate all TNR projects into the main `tnr-business-solutions` project.

---

## Current Situation

You have **4 separate Vercel projects** all pointing to the same GitHub repository (`TNR-Business-Solutions/CleanTNRSIte`):

1. ✅ **tnr-business-solutions** (MAIN - Keep This)
   - Domain: `www.tnrbusinesssolutions.com`
   - Project ID: `prj_UySLruuI8nrDcHHTHtOQLO0F5FlS`
   - Status: **Active and configured**

2. ❌ **clean-site** (Duplicate - Remove)
   - Domain: `clean-site-tau.vercel.app`
   - Status: Should be deleted

3. ❌ **tnr-legal-deploy** (Duplicate - Remove)
   - Domain: `tnr-legal-deploy.vercel.app`
   - Status: Should be deleted (legal pages are already in main site)

4. ❌ **tnr-legal-simple** (Duplicate - Remove)
   - Domain: `tnr-legal-simple.vercel.app`
   - Status: Should be deleted (legal pages are already in main site)

---

## Consolidation Steps

### Step 1: Verify Main Project Configuration ✅
The main project `tnr-business-solutions` is already:
- ✅ Linked to the correct GitHub repository
- ✅ Using the unified `vercel.json` configuration
- ✅ Has the custom domain `www.tnrbusinesssolutions.com`

### Step 2: Remove Duplicate Projects

#### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Log in to your account

2. **Delete `clean-site` Project**
   - Navigate to: `clean-site` project
   - Go to Settings → General
   - Scroll to bottom → Click "Delete Project"
   - Confirm deletion

3. **Delete `tnr-legal-deploy` Project**
   - Navigate to: `tnr-legal-deploy` project
   - Go to Settings → General
   - Click "Delete Project"
   - Confirm deletion

4. **Delete `tnr-legal-simple` Project**
   - Navigate to: `tnr-legal-simple` project
   - Go to Settings → General
   - Click "Delete Project"
   - Confirm deletion

#### Option B: Using Vercel CLI

```bash
# Check current project
vercel whoami

# Switch to org if needed
vercel switch

# Remove project links (if any exist locally)
# Note: CLI doesn't directly delete projects, use dashboard
```

---

### Step 3: Verify Main Project

After removing duplicates, verify your main project:

1. **Check Project Settings**
   ```bash
   vercel inspect
   ```

2. **Verify Domain Configuration**
   - In Vercel Dashboard → `tnr-business-solutions` → Settings → Domains
   - Ensure `www.tnrbusinesssolutions.com` is configured
   - Verify DNS settings are correct

3. **Test Deployment**
   - Push a test commit
   - Verify deployment works correctly
   - Check all functionality

---

## Important Notes

### Legal Pages
- ✅ `privacy-policy.html` and `terms-conditions.html` are already in the main site root
- ✅ No separate deployment needed - these pages are part of the main site
- ✅ Already accessible at:
  - `www.tnrbusinesssolutions.com/privacy-policy.html`
  - `www.tnrbusinesssolutions.com/terms-conditions.html`

### What Happens When You Delete Projects

- ❌ **Subdomains will stop working** (clean-site-tau.vercel.app, etc.)
- ✅ **Main domain continues working** (www.tnrbusinesssolutions.com)
- ✅ **GitHub integration remains** (all repos still connected)
- ✅ **No code changes needed** (already unified configuration)

### Backup Recommendation

Before deleting, you may want to:
1. Screenshot project settings (if any are unique)
2. Export any environment variables (though they should be in main project)
3. Note any specific configurations

---

## After Consolidation

Once consolidation is complete:

1. ✅ **Single deployment** for all content
2. ✅ **Unified configuration** in `vercel.json`
3. ✅ **Simplified management** - one project to maintain
4. ✅ **All features active**: caching, security headers, API functions
5. ✅ **Easy updates** - push to main branch and deploy

---

## Troubleshooting

### If a deleted project had unique settings:
- Check main project settings in Vercel dashboard
- Compare with notes from deleted project
- Transfer any needed environment variables

### If DNS issues occur:
- Verify domain DNS settings in main project
- Check domain configuration in Vercel
- Allow 24-48 hours for DNS propagation

---

## Verification Checklist

After consolidation, verify:
- [ ] Only `tnr-business-solutions` project exists
- [ ] Main domain `www.tnrbusinesssolutions.com` works
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] API endpoints work (`/submit-form`, `/checkout`)
- [ ] Legal pages accessible
- [ ] No broken links or 404 errors

---

## Current Project Status

**Main Project:** `tnr-business-solutions`
- **Project ID:** `prj_UySLruuI8nrDcHHTHtOQLO0F5FlS`
- **Repository:** `TNR-Business-Solutions/CleanTNRSIte`
- **Domain:** `www.tnrbusinesssolutions.com`
- **Configuration:** Unified `vercel.json` with all features
- **Status:** ✅ Ready to be the only project

