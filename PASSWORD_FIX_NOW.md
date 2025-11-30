# 🔑 URGENT: Password Hash Fix Required

## Problem
Vercel logs show: `[Error 1002] Invalid credentials`
- Server is receiving login attempts ✅
- Password verification is failing ❌
- **Root cause:** Password hash in Vercel doesn't match "TNR2024!"

## Immediate Fix

### Step 1: Update Password Hash in Vercel

1. Go to: **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Find: `ADMIN_PASSWORD_HASH`

3. **Update the value to:**
   ```
   $2b$10$FFTpkPUMyyuZQtP/Hz4MEu0kBqP1SOova3dp1K13WXMctTRahV5nm
   ```

4. **Save** (Vercel will auto-redeploy)

5. **Wait 1-2 minutes** for deployment

### Step 2: Test Login

1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Go to: `/admin-login.html`
3. Enter:
   - Username: `admin`
   - Password: `TNR2024!`
4. Should login successfully

## Alternative: Use Plain Text (Temporary)

If you need immediate access:

1. **Delete** `ADMIN_PASSWORD_HASH` from Vercel environment variables
2. **Save** and wait for deployment
3. Login with: `admin` / `TNR2024!`
4. ⚠️ **Less secure** - add hash back ASAP

## Current Status

- ✅ Server is working
- ✅ Authentication endpoint is receiving requests
- ❌ Password hash doesn't match "TNR2024!"
- ✅ Code is fixed and ready

## Verification

After updating the hash, check Vercel logs. You should see:
```
🔍 Checking user: admin, hasHash: true, hasPassword: true
🔐 Verifying password against hash...
🔐 Password verification result: true
```

Instead of:
```
[Error 1002] Invalid credentials
```

---

**Action Required:** Update `ADMIN_PASSWORD_HASH` in Vercel with the hash above

