# Vercel Environment Variables Setup Guide
**Date:** January 2025  
**Status:** Required for Production Deployment

---

## 🔐 Required Environment Variables

### 1. JWT Secret (REQUIRED)
Generate a secure random string for JWT token signing:

```bash
# Generate JWT Secret (run locally):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Add to Vercel:**
- **Key:** `JWT_SECRET`
- **Value:** `<generated-hex-string>` (64 characters)
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

---

### 2. Admin Password Hash (REQUIRED)
The system has generated a password hash for the admin user:

**Add to Vercel:**
- **Key:** `ADMIN_PASSWORD_HASH`
- **Value:** `$2b$10$NVoNsZXClpbxViJofhpYw.NLn1C0bxyhBHHtBx9PqDOBGg4loXXzS`
- **Note:** This is the hash for username `admin`

---

### 3. Admin Username (OPTIONAL - defaults to 'admin')
If you want to use a different username:

**Add to Vercel:**
- **Key:** `ADMIN_USERNAME`
- **Value:** `admin` (or your preferred username)

---

### 4. Employee Credentials (OPTIONAL)
If you want to add an employee user:

**Add to Vercel:**
- **Key:** `EMPLOYEE_USERNAME`
- **Value:** `<employee-username>`
- **Key:** `EMPLOYEE_PASSWORD_HASH`
- **Value:** `<generated-hash>` (generate by logging in once, or use the password hashing utility)

---

### 5. Allowed Origin (OPTIONAL - defaults to production domain)
**Add to Vercel:**
- **Key:** `ALLOWED_ORIGIN`
- **Value:** `https://www.tnrbusinesssolutions.com`

---

## 📋 Quick Setup Checklist

### Step 1: Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Add to Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `JWT_SECRET` = `<generated-secret>`
   - `ADMIN_PASSWORD_HASH` = `$2b$10$NVoNsZXClpbxViJofhpYw.NLn1C0bxyhBHHtBx9PqDOBGg4loXXzS`
   - `ALLOWED_ORIGIN` = `https://www.tnrbusinesssolutions.com` (optional)

### Step 3: Redeploy
After adding environment variables, Vercel will automatically redeploy, or you can trigger a manual redeploy.

---

## 🔍 Verify Setup

After deployment, test the authentication:

1. Go to `/admin-login.html`
2. Login with:
   - **Username:** `admin`
   - **Password:** `<your-admin-password>`
3. You should receive:
   - `accessToken` (expires in 24 hours)
   - `refreshToken` (expires in 7 days)

---

## ⚠️ Security Notes

1. **Never commit** these values to git
2. **JWT_SECRET** should be unique and random
3. **Password hashes** are one-way - cannot be reversed
4. If you forget your password, you'll need to generate a new hash

---

## 🆘 Troubleshooting

### "Invalid credentials" error:
- Check that `ADMIN_PASSWORD_HASH` is set correctly
- Verify the password you're using matches the original password
- Check Vercel logs for detailed error messages

### "JWT verification failed":
- Ensure `JWT_SECRET` is set
- Verify the secret hasn't changed (changing it invalidates all existing tokens)

### CORS errors:
- Verify `ALLOWED_ORIGIN` matches your production domain
- Check that the origin header is being sent correctly

---

## 📝 Current Configuration

**Generated Hash:**
```
ADMIN_PASSWORD_HASH=$2b$10$NVoNsZXClpbxViJofhpYw.NLn1C0bxyhBHHtBx9PqDOBGg4loXXzS
```

**Next Steps:**
1. ✅ Hash generated
2. ⏳ Add to Vercel environment variables
3. ⏳ Generate and add JWT_SECRET
4. ⏳ Redeploy
5. ⏳ Test authentication

---

**Status:** Ready for Vercel configuration

