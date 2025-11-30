# 🔐 Vercel Environment Variables - Complete Setup Guide

## ✅ Currently Set (Good!)
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- BUSINESS_EMAIL
- BUSINESS_PHONE
- BUSINESS_ADDRESS
- PORT
- NODE_ENV

## ❌ MISSING - Add These Now!

### 1. JWT_SECRET (REQUIRED)
**Key:** `JWT_SECRET`  
**Value:** `2b9fdb1cf895c6ae663d1cb00f6e564f6516a5193fab423ac7f73398d5edae16`  
**Environment:** All Environments  
**Sensitive:** ✅ Yes (recommended)

### 2. ADMIN_PASSWORD_HASH (REQUIRED)
**Key:** `ADMIN_PASSWORD_HASH`  
**Value:** `$2b$10$ngHOu7/UL/mtMX7JfvvfTO2BiQVA9wy981WRd.cpNXYLK1zLKeeue`  
**Environment:** All Environments  
**Sensitive:** ✅ Yes (recommended)  
**Note:** This hash is for password: `TNR2024!`

### 3. ADMIN_USERNAME (OPTIONAL)
**Key:** `ADMIN_USERNAME`  
**Value:** `admin`  
**Environment:** All Environments  
**Sensitive:** ❌ No  
**Note:** Defaults to "admin" if not set

### 4. ALLOWED_ORIGIN (OPTIONAL)
**Key:** `ALLOWED_ORIGIN`  
**Value:** `https://www.tnrbusinesssolutions.com`  
**Environment:** All Environments  
**Sensitive:** ❌ No

## 📋 Quick Copy & Paste

### Step 1: Add JWT_SECRET
1. Click **"Create new"** in Vercel
2. **Key:** `JWT_SECRET`
3. **Value:** `2b9fdb1cf895c6ae663d1cb00f6e564f6516a5193fab423ac7f73398d5edae16`
4. **Environment:** Select "All Environments"
5. **Sensitive:** ✅ Enable
6. **Save**

### Step 2: Add ADMIN_PASSWORD_HASH
1. Click **"Create new"**
2. **Key:** `ADMIN_PASSWORD_HASH`
3. **Value:** `$2b$10$ngHOu7/UL/mtMX7JfvvfTO2BiQVA9wy981WRd.cpNXYLK1zLKeeue`
4. **Environment:** Select "All Environments"
5. **Sensitive:** ✅ Enable
6. **Save**

### Step 3: Add ADMIN_USERNAME (Optional)
1. Click **"Create new"**
2. **Key:** `ADMIN_USERNAME`
3. **Value:** `admin`
4. **Environment:** Select "All Environments"
5. **Sensitive:** ❌ No
6. **Save**

### Step 4: Add ALLOWED_ORIGIN (Optional)
1. Click **"Create new"**
2. **Key:** `ALLOWED_ORIGIN`
3. **Value:** `https://www.tnrbusinesssolutions.com`
4. **Environment:** Select "All Environments"
5. **Sensitive:** ❌ No
6. **Save**

## ⏱️ After Adding Variables

1. **Wait 1-2 minutes** for Vercel to redeploy
2. **Check deployment status** - should show "Ready"
3. **Test login:**
   - Username: `admin`
   - Password: `TNR2024!`

## 🔍 Verification

After deployment, check Vercel logs. You should see:
```
🔍 Checking user: admin, hasHash: true, hasPassword: true
🔐 Verifying password against hash...
🔐 Password verification result: true
✅ Authentication successful
```

## 📝 Summary

**Required (Must Add):**
- ✅ JWT_SECRET
- ✅ ADMIN_PASSWORD_HASH

**Optional (Recommended):**
- ADMIN_USERNAME
- ALLOWED_ORIGIN

**Already Set (Good!):**
- ✅ SMTP variables (for email)
- ✅ BUSINESS_EMAIL
- ✅ NODE_ENV

---

**Status:** Add the 2 required variables above, then test login!

