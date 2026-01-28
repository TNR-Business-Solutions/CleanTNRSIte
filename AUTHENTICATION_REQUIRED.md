# 🔐 Authentication Required - Quick Fix Guide
**Date:** December 9, 2025  
**Issue:** 401 Unauthorized errors when accessing social media tokens

---

## ✅ **Solution: Login First**

The social media dashboard requires you to be **logged into the admin dashboard** first to access tokens and post to platforms.

### **Quick Steps:**

1. **Go to Login Page:**
   - `https://www.tnrbusinesssolutions.com/admin-login.html`

2. **Login with:**
   - Username: `admin`
   - Password: `TNR2024!`

3. **After Login:**
   - You'll be redirected to the admin dashboard
   - Your JWT token is now stored in `localStorage`
   - You can now access the social media dashboard

4. **Go to Social Media Dashboard:**
   - `https://www.tnrbusinesssolutions.com/social-media-automation-dashboard.html`
   - All API calls will now work with authentication

---

## 🔧 **What Was Fixed**

### **1. Added `authFetch()` Function**
- Automatically includes JWT token in all API requests
- Shows helpful error message if not logged in
- Prompts to redirect to login page if needed

### **2. Added Authentication Check**
- Checks for token on page load
- Warns if token is missing
- Provides helpful console messages

### **3. Better Error Handling**
- Detects 401 errors
- Prompts user to login if needed
- Clear error messages

---

## 📊 **Current Status**

- ✅ `authFetch()` function added
- ✅ All API calls use authentication
- ✅ Error handling for missing tokens
- ✅ User-friendly prompts

---

## 🚨 **If You Still Get 401 Errors**

1. **Check if you're logged in:**
   - Open browser console (F12)
   - Type: `localStorage.getItem('adminSession')`
   - Should return a JWT token string

2. **If token is missing:**
   - Go to `/admin-login.html`
   - Login again
   - Return to social media dashboard

3. **If token exists but still getting 401:**
   - Token may be expired
   - Login again to get fresh token
   - Check Vercel logs for server errors

---

## ✅ **Verification**

After logging in:

1. **Check Console:**
   - Should see: `✅ Authentication token found`

2. **Try to Load Tokens:**
   - Go to Platform Connections
   - Should load without 401 errors

3. **Test Posting:**
   - Create a test post
   - Should work without authentication errors

---

**Status:** ✅ **FIXED**  
**Requirement:** Must login to admin dashboard first  
**Error Handling:** ✅ Improved
