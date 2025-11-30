# 🔐 Admin Password Reset Instructions

## Current Situation

The admin password system is now using **bcrypt password hashing** for security. This means:

1. **If `ADMIN_PASSWORD_HASH` is set in Vercel:** The system verifies passwords against the hash
2. **If no hash is set:** The system falls back to plain text password (less secure)

## Problem

You're trying to use `TNR2024!` but it's not working because:
- The hash in Vercel (`$2b$10$NVoNsZXClpbxViJofhpYw.NLn1C0bxyhBHHtBx9PqDOBGg4loXXzS`) was generated for a **different password**
- The system is trying to verify `TNR2024!` against that hash, which doesn't match

## Solution: Update Password Hash in Vercel

### Option 1: Generate New Hash for "TNR2024!" (Recommended)

1. **Generate the hash** (run this command locally):
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('TNR2024!', 10).then(hash => console.log('ADMIN_PASSWORD_HASH=' + hash));"
   ```

2. **Copy the generated hash** (it will look like: `$2b$10$...`)

3. **Update Vercel Environment Variable:**
   - Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
   - Find: `ADMIN_PASSWORD_HASH`
   - Update the value with the new hash
   - Save and redeploy

4. **Test login** with:
   - Username: `admin`
   - Password: `TNR2024!`

### Option 2: Temporarily Remove Hash (Use Plain Text)

If you need immediate access:

1. **Go to Vercel Dashboard:**
   - Settings → Environment Variables
   - Find: `ADMIN_PASSWORD_HASH`
   - **Delete or clear the value** (leave it empty)
   - Save and redeploy

2. **The system will fall back to:**
   - Username: `admin`
   - Password: `TNR2024!` (from `ADMIN_PASSWORD` or default)

3. **⚠️ WARNING:** This is less secure. Generate a hash and add it back ASAP.

### Option 3: Find Out What Password the Current Hash Matches

**This is NOT possible** - bcrypt hashes are one-way. You cannot reverse a hash to get the original password.

**Options:**
- Try common passwords you might have used
- Generate a new hash for a password you know
- Use password reset request (if email is working)

## Quick Fix Script

Run this to generate a hash for "TNR2024!":

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('TNR2024!', 10).then(hash => console.log('\n✅ Generated Hash:\nADMIN_PASSWORD_HASH=' + hash + '\n\nCopy this to Vercel environment variables.'));"
```

## After Updating

1. **Redeploy** (Vercel will auto-redeploy when you save environment variables)
2. **Wait 1-2 minutes** for deployment to complete
3. **Test login** with:
   - Username: `admin`
   - Password: `TNR2024!`

## Current Configuration

**Username:** `admin` (or value from `ADMIN_USERNAME` env var)

**Password Options:**
- If `ADMIN_PASSWORD_HASH` is set → Password must match the hash
- If no hash → Password is `TNR2024!` (or value from `ADMIN_PASSWORD` env var)

## Need Help?

If you're still having issues:
1. Check Vercel logs for authentication errors
2. Verify environment variables are set correctly
3. Make sure you're using the correct username (`admin`)
4. Try clearing browser cache and cookies

---

**Status:** Password hash needs to be updated in Vercel to match "TNR2024!"

