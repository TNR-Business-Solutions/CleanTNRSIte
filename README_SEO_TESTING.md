# 🎯 Wix SEO Testing - Quick Reference

## 🚀 Quickest Way to Test

```powershell
.\test-wix-seo-loop.ps1
```

**This script:**
1. ✅ Checks OAuth status (opens page if needed)
2. ✅ Runs all SEO tests automatically
3. ✅ Opens dashboards for verification
4. ✅ Generates detailed reports

---

## 📊 What Gets Tested

### ✅ SEO Audit
- Analyzes all pages on the site
- Identifies SEO issues (missing meta tags, poor titles, etc.)
- Provides detailed recommendations
- Reports pages with issues

### ⚡ Auto-Optimize SEO
- Automatically fixes common SEO issues
- Updates meta titles and descriptions
- Adds Open Graph tags
- Optimizes product descriptions
- Enhances image alt text

### 🌐 Site-wide SEO
- Tests global SEO settings updates
- Verifies site title changes
- Confirms description updates
- Validates keyword changes

### 📦 Product SEO
- Checks all products have proper SEO
- Verifies product names are optimized
- Ensures descriptions exist
- Validates images have alt text

---

## 🎯 Three Ways to Run Tests

### 1. **Automated Loop** (Recommended)
```powershell
.\test-wix-seo-loop.ps1          # Local testing
.\test-wix-seo-loop.ps1 -Production  # Production testing
```

### 2. **Interactive Menu**
```powershell
.\start-test-loop.ps1
# Select option [2] - Run Wix SEO Tests
```

### 3. **Standalone Script**
```bash
node test-wix-seo-complete.js
```

---

## 📄 Reports Generated

### `wix-seo-test-results.json`
Complete test results with pass/fail status for each test

### `seo-report-[timestamp].json`
Detailed SEO audit report including:
- All pages analyzed
- Issues found
- Optimizations applied
- Before/after comparisons

---

## ✅ Success Criteria

```
Total Tests: 5
✅ Wix client connection
✅ SEO Audit execution
✅ Product SEO check
✅ Auto-Optimize SEO execution
✅ Site-wide SEO update

Success Rate: 100%
```

---

## ❌ Common Errors & Fixes

### "Client not found"
**Fix:** Complete OAuth first
```
http://localhost:3000/api/auth/wix
OR
https://www.tnrbusinesssolutions.com/api/auth/wix
```

### "No Metasite Context"
**Fix:** Token expired, reconnect via OAuth

### "apiUrl is not defined"
**Fix:** Code deployment issue, check Vercel

---

## 🔗 Test Site

**Default test site:** `shesallthatandmore.com`
**Instance ID:** `a4890371-c6da-46f4-a830-9e19df999cf8`

To test a different site, edit `test-wix-seo-complete.js`:
```javascript
const INSTANCE_ID = 'your-instance-id-here';
```

---

## 📝 Example Output

```
🎯 COMPREHENSIVE WIX SEO TESTING
================================================================================

🔗 WIX CONNECTION TEST
✅ Wix client connection
   Instance ID: a4890371-c6da-46f4-a830-9e19df999cf8
   Token valid: true
   Expires: 12/21/2025, 9:03:27 AM

📊 SEO AUDIT TEST
Running full SEO audit...
✅ SEO Audit execution - Analyzed 12 pages

   📈 Audit Results:
   Total Pages: 12
   Pages with Issues: 3
   
   🔍 Issues Found:
   1. Homepage
      - Missing meta description
      - H1 tag too short

⚡ AUTO-OPTIMIZE SEO TEST
Running auto-optimize for all pages...
✅ Auto-Optimize SEO execution - Optimized 12 pages

   🎯 Optimization Results:
   Pages Optimized: 12
   Total Updates: 24
   
   📝 Optimizations Applied:
   1. Homepage
      ✓ Added meta description
      ✓ Enhanced H1 tag

📊 FINAL TEST SUMMARY
Total Tests: 5
✅ Passed: 5
❌ Failed: 0
Success Rate: 100%
```

---

## 🆘 Need Help?

1. **Read the full guide:** `SEO_TESTING_GUIDE.md`
2. **Check testing loop guide:** `TESTING_LOOP_GUIDE.md`
3. **Review fixes summary:** `WIX_TESTING_AND_FIXES_SUMMARY.md`

---

## 🎉 After All Tests Pass

1. Test on production: `.\test-wix-seo-loop.ps1 -Production`
2. Connect additional Wix sites
3. Run SEO audits on client sites
4. Monitor results in admin dashboard

