# 🔐 Login Required - Complete Fix Guide
**Date:** December 9, 2025  
**Issue:** 401 Unauthorized errors - User must login first

---

## ✅ **Root Cause**

The social media dashboard requires JWT authentication. The token is stored in `localStorage` after logging into the admin dashboard.

**The 401 errors occur because:**
- User hasn't logged into admin dashboard yet
- No JWT token in `localStorage.getItem('adminSession')`
- API endpoints require `Authorization: Bearer <token>` header

---

## 🚀 **Solution: Login First**

### **Step 1: Login to Admin Dashboard**

1. **Go to:** `https://www.tnrbusinesssolutions.com/admin-login.html`

2. **Login with:**
   - Username: `admin`
   - Password: `TNR2024!`

3. **After successful login:**
   - JWT token is stored in `localStorage.adminSession`
   - You'll be redirected to admin dashboard
   - Token is valid for 24 hours

### **Step 2: Access Social Media Dashboard**

1. **Go to:** `https://www.tnrbusinesssolutions.com/social-media-automation-dashboard.html`

2. **Check Console (F12):**
   - Should see: `✅ Authentication token found`
   - Should see: `✅ Using authentication token for request`

3. **All API calls will now work:**
   - No more 401 errors
   - Can retrieve tokens
   - Can post to platforms

---

## 🔧 **What Was Fixed**

### **1. Added `authFetch()` Function**
- ✅ Automatically includes JWT token in all requests
- ✅ Adds `Authorization: Bearer <token>` header
- ✅ Detects missing tokens

### **2. Enhanced Error Handling**
- ✅ Detects 401 errors
- ✅ Checks if token exists
- ✅ Prompts user to login if needed
- ✅ Clear error messages

### **3. Added Debug Logging**
- ✅ Logs when token is found/missing
- ✅ Logs request headers (without exposing token)
- ✅ Helps diagnose authentication issues

### **4. Authentication Check on Page Load**
- ✅ Checks for token when page loads
- ✅ Warns if token is missing
- ✅ Provides helpful console messages

---

## 📊 **Verification Steps**

### **1. Check if Token Exists**

Open browser console (F12) and type:
```javascript
localStorage.getItem('adminSession')
```

**Expected:**
- ✅ Returns JWT token string (if logged in)
- ❌ Returns `null` (if not logged in)

### **2. Check Console Messages**

After page load, you should see:
- ✅ `✅ Authentication token found` (if logged in)
- ⚠️ `⚠️ No authentication token found` (if not logged in)

### **3. Test API Call**

Try to load tokens:
- ✅ Should work without 401 errors (if logged in)
- ❌ Will get 401 error (if not logged in)

---

## 🚨 **Troubleshooting**

### **Problem: Still Getting 401 Errors After Login**

**Solution:**
1. Check if token exists: `localStorage.getItem('adminSession')`
2. If `null`, login again
3. If token exists, it may be expired - login again
4. Check browser console for error messages

### **Problem: Token Exists But Still 401**

**Possible Causes:**
1. Token expired (24 hour expiry)
2. Token invalid (server restart, secret changed)
3. Browser cache issue

**Solution:**
1. Clear browser cache
2. Login again to get fresh token
3. Check Vercel logs for server errors

### **Problem: Can't Login**

**Check:**
1. Username: `admin`
2. Password: `TNR2024!`
3. Check Vercel environment variables:
   - `ADMIN_PASSWORD_HASH` (if set, must match password)
   - Or remove hash to use plain text

---

## 📝 **Code Changes Made**

### **Added Functions:**

```javascript
// Get authentication headers
function getAuthHeaders() {
  const token = localStorage.getItem("adminSession");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Authenticated fetch wrapper
async function authFetch(url, options = {}) {
  // Includes JWT token in all requests
  // Handles 401 errors
  // Prompts login if needed
}
```

### **Updated All API Calls:**

- ✅ Replaced `fetch()` with `authFetch()`
- ✅ All `/api/social/*` endpoints now authenticated
- ✅ All `/api/social-tokens` endpoints now authenticated

---

## ✅ **Current Status**

- ✅ `authFetch()` function added
- ✅ All API calls use authentication
- ✅ Error handling improved
- ✅ Debug logging added
- ✅ User-friendly prompts

**Requirement:** Must login to admin dashboard first

---

**Status:** ✅ **FIXED**  
**Next Step:** Login to admin dashboard  
**Then:** Access social media dashboard
