# Comprehensive Testing Loop Guide

## 🎯 Overview

This testing loop will systematically test and fix all integrations for your social automation platform.

## 🚀 Quick Start

### **Run as Administrator:**

```powershell
# Right-click PowerShell → "Run as Administrator"
cd C:\Users\roytu\Desktop\clean-site
.\start-test-loop.ps1
```

---

## 📋 Test Loop Features

### **Automated Tests:**
1. ✅ Server health check
2. ✅ Wix OAuth and API endpoints
3. ✅ Meta (Facebook) OAuth and permissions
4. ✅ Instagram integration and webhooks
5. ✅ WhatsApp Business API
6. ✅ Threads API
7. ✅ LinkedIn OAuth
8. ✅ Twitter/X OAuth
9. ✅ All dashboards accessible

### **Interactive Menu:**
```
1. Run Full Test Suite
2. Open Admin Dashboard
3. Open Social Media Dashboard
4. Open Wix Dashboard
5. Test Wix OAuth
6. Test Meta OAuth
7. Test LinkedIn OAuth
8. Test Twitter OAuth
9. View Test Results
10. View Server Logs
11. Restart Server
Q. Quit
```

---

## 🔄 Testing Workflow

### **Phase 1: Automated Testing**
```powershell
# From menu:
> 1

# This will:
- Test all endpoints
- Verify OAuth URLs
- Check webhook responses
- Generate test-results.json
```

### **Phase 2: Manual OAuth Completion**
Based on test results, complete OAuth for each platform:

#### **Wix Integration:**
```powershell
# From menu:
> 5

# In browser:
1. Connect to: http://www.shesallthatandmore.com/
2. Authorize TNR Business Solutions app
3. Return to dashboard
```

#### **Facebook Integration:**
```powershell
# From menu:
> 6

# In browser:
1. Select "TNR Business Solutions" Page
2. Grant permissions:
   - pages_manage_posts
   - pages_read_engagement
   - pages_show_list
3. Authorize
```

#### **Instagram Integration:**
```
Prerequisites:
1. Accept Instagram Tester invitation
2. Connect via Meta OAuth (menu option 6)
3. Instagram auto-connects with Facebook Page
```

#### **LinkedIn Integration:**
```powershell
# From menu:
> 7

# In browser:
1. Sign in to LinkedIn
2. Authorize TNR Business Solutions
```

#### **Twitter Integration:**
```powershell
# From menu:
> 8

# In browser:
1. Sign in to Twitter/X
2. Authorize TNR Business Solutions
```

### **Phase 3: Feature Testing**

#### **Test Wix Features:**
```powershell
# From menu:
> 4

# In dashboard:
1. Go to SEO Manager
2. Click "Run Full SEO Audit"
3. Verify results show
4. Go to E-commerce Manager
5. Click "Sync Products"
6. Verify products load from shesallthatandmore.com
```

#### **Test Social Media Posting:**
```powershell
# From menu:
> 3

# In dashboard:
1. Test Facebook post:
   - Enter message
   - Click "Post to Facebook"
   - Verify success

2. Test Instagram post:
   - Enter message + image URL
   - Click "Post to Instagram"
   - Verify success

3. Test LinkedIn post:
   - Enter message
   - Click "Post to LinkedIn"
   - Verify success

4. Test Twitter post:
   - Enter message
   - Click "Post to Twitter"
   - Verify success
```

### **Phase 4: Re-test**
```powershell
# From menu:
> 1

# Check for improvements
# Review test-results.json
```

---

## 🐛 Error Fixing Loop

### **1. Identify Errors:**
```powershell
# From menu:
> 9  # View Test Results
```

### **2. Common Errors & Fixes:**

#### **❌ "Server not responding"**
```powershell
# From menu:
> 11  # Restart Server
```

#### **❌ "OAuth redirect error"**
**Fix:**
- Check `.env` file:
```env
WIX_REDIRECT_URI=http://localhost:3000/api/auth/wix/callback
META_REDIRECT_URI=http://localhost:3000/api/auth/meta/callback
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
TWITTER_REDIRECT_URI=http://localhost:3000/api/auth/twitter/callback
```

#### **❌ "Missing access token"**
**Fix:**
- Complete OAuth flow for that platform
- Re-run tests

#### **❌ "Facebook permissions error"**
**Fix:**
```powershell
# Check permissions:
curl -X POST http://localhost:3000/api/social/check-facebook-permissions `
  -H "Content-Type: application/json" `
  -d '{"useDatabaseToken": true}'

# If missing permissions, reconnect:
# Menu option 6
```

#### **❌ "Wix site not connected"**
**Fix:**
```powershell
# Menu option 5
# Connect: http://www.shesallthatandmore.com/
# Ensure Wix app is installed on site
```

### **3. Apply Fixes & Re-test:**
```powershell
# After applying fixes:
# Menu option 1 (Run Tests)
# Verify improvements
```

---

## 📊 Test Results Format

**File:** `test-results.json`

```json
{
  "timestamp": "2024-11-20T...",
  "baseUrl": "http://localhost:3000",
  "tests": [
    {
      "name": "Server is running",
      "status": "PASS",
      "details": "Status: 200",
      "timestamp": "..."
    }
  ],
  "summary": {
    "total": 30,
    "passed": 25,
    "failed": 5,
    "skipped": 0
  }
}
```

---

## 🎯 Success Criteria

### **All Tests Pass When:**

1. **Server Health:** ✅
   - Server responds
   - API root accessible

2. **Wix:** ✅
   - OAuth works
   - Can connect shesallthatandmore.com
   - SEO audit runs
   - E-commerce sync works

3. **Facebook:** ✅
   - OAuth works
   - TNR Business Solutions Page connected
   - Can post successfully
   - Permissions valid

4. **Instagram:** ✅
   - Connected via Meta OAuth
   - Can post images
   - Webhooks respond

5. **LinkedIn:** ✅
   - OAuth works
   - Can post updates

6. **Twitter:** ✅
   - OAuth works
   - Can post tweets

---

## 📝 Checklist

### **Before Starting:**
- [ ] PowerShell running as Administrator
- [ ] In correct directory: `clean-site`
- [ ] `.env` file configured
- [ ] Server dependencies installed

### **OAuth Completion:**
- [ ] Wix: http://www.shesallthatandmore.com/ connected
- [ ] Facebook: TNR Business Solutions Page connected
- [ ] Instagram: Tester invite accepted
- [ ] LinkedIn: Account connected
- [ ] Twitter: Account connected

### **Feature Testing:**
- [ ] Wix SEO audit works
- [ ] Wix e-commerce sync works
- [ ] Facebook posting works
- [ ] Instagram posting works
- [ ] LinkedIn posting works
- [ ] Twitter posting works

### **Final Validation:**
- [ ] All automated tests pass
- [ ] No errors in test results
- [ ] All dashboards accessible
- [ ] All platforms connected

---

## 🆘 Troubleshooting

### **"Script won't run"**
```powershell
# Enable scripts:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **"Port 3000 already in use"**
```powershell
# Kill processes:
Get-Process -Name "node" | Stop-Process -Force
```

### **"Module not found"**
```powershell
# Reinstall dependencies:
npm install
cd server
npm install
cd ..
```

### **"Database error"**
```powershell
# Check .env file has:
POSTGRES_URL=postgresql://...
DATABASE_URL=postgresql://...
```

---

## 📈 Progress Tracking

**Test Iteration Log:**
```
Iteration 1: Initial test - 15/30 passed
  - Fixed: OAuth redirects
  - Fixed: Server port conflict

Iteration 2: After OAuth - 20/30 passed
  - Completed: Wix connection
  - Completed: Facebook OAuth

Iteration 3: After permissions - 25/30 passed
  - Fixed: Facebook posting permissions
  - Fixed: Instagram connection

Iteration 4: Final validation - 30/30 passed ✅
  - All platforms working
  - All features functional
```

---

## 🎊 When Complete

**All systems should be:**
- ✅ **Wix:** Connected to shesallthatandmore.com, SEO & E-commerce working
- ✅ **Facebook:** TNR Business Solutions Page, posting works
- ✅ **Instagram:** TNR Business Solutions account, posting works
- ✅ **LinkedIn:** Account connected, posting works
- ✅ **Twitter:** Account connected, posting works
- ✅ **All dashboards:** Accessible and functional
- ✅ **Test results:** 100% pass rate

---

**Run the loop until all tests pass!** 🚀

