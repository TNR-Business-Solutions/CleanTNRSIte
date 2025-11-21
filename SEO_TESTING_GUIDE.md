# 🎯 Wix SEO Testing Guide

Complete guide for testing Wix SEO audit and auto-optimize features.

---

## 🚀 Quick Start

### Option 1: Automated Testing Loop (Recommended)

```powershell
# Local testing
.\test-wix-seo-loop.ps1

# Production testing
.\test-wix-seo-loop.ps1 -Production
```

**Features:**
- ✅ Automatic OAuth handling
- ✅ Comprehensive SEO tests
- ✅ Detailed JSON reports
- ✅ Opens dashboards for verification
- ✅ Retry failed tests automatically

### Option 2: Standalone SEO Tests

```bash
node test-wix-seo-complete.js
```

### Option 3: Interactive Menu

```powershell
.\start-test-loop.ps1
# Select option [5] - Run Wix SEO Tests
```

---

## 📊 Tests Included

### 1. **Wix Connection Test**
- Verifies OAuth token is valid
- Checks token expiration
- Confirms instance ID is correct
- Shows client connection details

**Success Criteria:**
- ✅ Client found in database
- ✅ Access token valid
- ✅ Token not expired

### 2. **SEO Audit Test**
- Runs full site SEO audit
- Analyzes all pages
- Identifies SEO issues
- Provides detailed recommendations

**What it checks:**
- Meta titles (length, uniqueness)
- Meta descriptions (length, quality)
- H1 tags (presence, quality)
- Image alt text
- Internal linking
- Open Graph tags
- Structured data

**Success Criteria:**
- ✅ Audit completes without errors
- ✅ Returns page count
- ✅ Lists all issues found
- ✅ Provides actionable recommendations

### 3. **Product SEO Test**
- Gets all products from Wix store
- Checks product SEO status
- Analyzes product metadata
- Reports on SEO readiness

**What it checks:**
- Product name quality
- Description presence/quality
- Image count
- SEO-friendly URLs
- Category assignments

**Success Criteria:**
- ✅ Products retrieved successfully
- ✅ SEO status reported for each
- ✅ Identifies optimization opportunities

### 4. **Auto-Optimize SEO Test**
- Automatically optimizes all pages
- Updates meta tags
- Enhances descriptions
- Adds Open Graph tags
- Improves structured data

**What it does:**
- Generates optimal meta titles
- Creates compelling descriptions
- Adds missing alt text
- Implements best practices
- Updates all products/pages in bulk

**Success Criteria:**
- ✅ Optimization completes without errors
- ✅ Reports pages optimized count
- ✅ Lists all changes made
- ✅ Confirms updates applied

### 5. **Site-wide SEO Update Test**
- Tests updating global SEO settings
- Changes site title
- Updates site description
- Modifies site keywords

**Success Criteria:**
- ✅ Settings update successfully
- ✅ Changes reflected immediately
- ✅ No errors or timeouts

---

## 📄 Output Reports

### Test Results (`wix-seo-test-results.json`)

```json
{
  "timestamp": "2025-11-21T09:10:25.000Z",
  "tests": [
    {
      "name": "Wix client connection",
      "status": "PASS",
      "details": "Instance ID: a4890371...",
      "timestamp": "2025-11-21T09:10:25.123Z"
    },
    {
      "name": "SEO Audit execution",
      "status": "PASS",
      "details": "Analyzed 12 pages",
      "timestamp": "2025-11-21T09:10:30.456Z"
    }
  ],
  "summary": {
    "total": 5,
    "passed": 5,
    "failed": 0
  }
}
```

### SEO Report (`seo-report-[timestamp].json`)

```json
{
  "timestamp": "2025-11-21T09:10:45.000Z",
  "site": "shesallthatandmore.com",
  "instanceId": "a4890371-c6da-46f4-a830-9e19df999cf8",
  "audit": {
    "totalPages": 12,
    "pagesWithIssues": 3,
    "issues": [
      {
        "pageName": "Homepage",
        "pageUrl": "/",
        "issues": [
          "Missing meta description",
          "H1 tag too short (12 characters)"
        ]
      }
    ]
  },
  "optimization": {
    "pagesOptimized": 12,
    "totalUpdates": 24,
    "optimizations": [
      {
        "pageName": "Homepage",
        "changes": [
          "Added meta description",
          "Enhanced H1 tag",
          "Added Open Graph tags"
        ]
      }
    ]
  },
  "summary": {
    "totalTests": 5,
    "passed": 5,
    "failed": 0,
    "successRate": 100
  }
}
```

---

## 🔍 Manual Testing Workflow

### Step 1: Connect Wix Client

1. Open: `https://www.tnrbusinesssolutions.com/api/auth/wix`
2. Select site: **shesallthatandmore.com**
3. Authorize the app
4. Verify redirect succeeds

### Step 2: Test SEO Audit

1. Open: `https://www.tnrbusinesssolutions.com/wix-seo-manager.html`
2. Select client: **Shesallthat&more**
3. Click: **Run Full SEO Audit**
4. Wait for results (10-30 seconds)

**Expected result:**
```
✅ SEO Audit Complete
Total Pages: 12
Pages with Issues: 3

Issues Found:
- Homepage: Missing meta description
- Products: 2 products need alt text
- About: H1 tag too short
```

### Step 3: Test Auto-Optimize

1. Stay on SEO Manager page
2. Click: **Auto-Optimize All Pages**
3. Wait for completion (30-60 seconds)
4. Review optimization report

**Expected result:**
```
✅ Auto-Optimization Complete
Pages Optimized: 12
Total Updates: 24

Changes Applied:
- Homepage: Added meta description, enhanced title
- Products: Added alt text to 5 images
- About: Enhanced H1 tag
```

### Step 4: Test Product SEO

1. Open: `https://www.tnrbusinesssolutions.com/wix-ecommerce-manager.html`
2. Click: **Sync Products**
3. Verify products load
4. Check each product has:
   - ✅ Name
   - ✅ Description
   - ✅ Images
   - ✅ Price

### Step 5: Verify Changes

1. Go to: `https://www.shesallthatandmore.com`
2. Right-click → View Page Source
3. Check for:
   - `<meta name="description" content="...">`
   - `<meta property="og:title" content="...">`
   - `<meta property="og:description" content="...">`
   - `<title>` tag is optimized

---

## ❌ Troubleshooting

### Error: "No Metasite Context"

**Cause:** OAuth token expired or invalid

**Fix:**
1. Reconnect: `https://www.tnrbusinesssolutions.com/api/auth/wix`
2. Complete authorization
3. Retry test

### Error: "apiUrl is not defined"

**Cause:** Code deployment issue

**Fix:**
1. Check latest deployment on Vercel
2. Ensure `server/handlers/wix-api-client.js` is updated
3. Redeploy if needed: `git push`

### Error: "Falling back to SQLite"

**Cause:** Neon database connection issue

**Fix:**
1. Check environment variables on Vercel:
   - `POSTGRES_URL` should be set
   - `DATABASE_URL` should be set
2. Check Neon database is online
3. Verify connection string is correct

### Error: "Client not found"

**Cause:** No OAuth completed or token not saved

**Fix:**
1. Complete OAuth flow
2. Check database for saved tokens:
   ```sql
   SELECT * FROM wix_tokens WHERE instance_id = 'a4890371...';
   ```
3. If empty, complete OAuth again

### Tests timeout

**Cause:** API taking too long

**Fix:**
1. Check Vercel function logs
2. Increase timeout in test script:
   ```javascript
   timeout: 60000 // 60 seconds
   ```
3. Check Wix API rate limits

---

## 📊 Success Criteria

### All Tests Pass (100%)
```
Total Tests: 5
✅ Passed: 5
❌ Failed: 0
Success Rate: 100%
```

### Minimum Acceptable (80%)
```
Total Tests: 5
✅ Passed: 4
❌ Failed: 1
Success Rate: 80%
```

**If success rate < 80%:**
- Review failed tests
- Check error messages
- Fix issues
- Rerun tests

---

## 🎯 Next Steps

### After All Tests Pass:

1. **Production Testing**
   ```powershell
   .\test-wix-seo-loop.ps1 -Production
   ```

2. **Test with Real Client Sites**
   - Connect additional Wix sites
   - Run SEO audits
   - Test auto-optimize on live sites

3. **Monitor Performance**
   - Check Vercel logs
   - Monitor API response times
   - Track success rates

4. **Enable Automation**
   - Set up scheduled SEO audits
   - Configure auto-optimize triggers
   - Enable notifications

---

## 📝 Notes

- **OAuth tokens expire after 30 days** - Reconnect monthly
- **Rate limits apply** - Max 100 API calls per hour
- **Large sites (>50 pages)** - May take 2-3 minutes for full audit
- **Auto-optimize** - Can be run multiple times safely
- **Backup recommended** - Before mass auto-optimize on production sites

---

## 🆘 Support

If tests continue to fail:

1. Check Vercel deployment status
2. Review Vercel function logs
3. Verify Neon database is accessible
4. Check Wix app permissions
5. Test OAuth flow manually

**Common issues documented in:**
- `TESTING_LOOP_GUIDE.md`
- `WIX_TESTING_AND_FIXES_SUMMARY.md`
- `FACEBOOK_PERMISSIONS_FIX.md`

