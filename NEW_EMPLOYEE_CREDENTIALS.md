# New Employee Account Setup
**Date Created:** January 2025  
**Status:** Ready for Implementation

---

## 📧 Email Account Setup

### Recommended Email Address:
**Format:** `[firstname].[lastname]@tnrbusinesssolutions.com`

**Example Options:**
- `employee1@tnrbusinesssolutions.com`
- `staff@tnrbusinesssolutions.com`
- `team@tnrbusinesssolutions.com`
- `support@tnrbusinesssolutions.com`

**Action Required:**
1. Create email account in your email hosting provider (Google Workspace, Microsoft 365, etc.)
2. Set up email forwarding if needed
3. Configure email client access

---

## 🔐 Dashboard Login Credentials

### Option 1: Create New Admin User (Recommended)
**Username:** `[employee_username]`  
**Password:** `[generate_secure_password]`

**To Implement:**
1. Update `server/handlers/admin-auth.js` to support multiple users
2. Add user to environment variables or database
3. Set appropriate permissions

### Option 2: Shared Admin Account (Temporary)
**Username:** `admin`  
**Password:** `[current_admin_password]`

**⚠️ Security Note:** This is less secure. Consider implementing multi-user support.

---

## 🔧 Implementation Steps

### Step 1: Update Admin Authentication

**File:** `server/handlers/admin-auth.js`

**Current Implementation:**
```javascript
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "TNR2024!";
```

**Recommended Update:**
```javascript
// Support multiple users via environment variables or database
const ADMIN_USERS = [
    {
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "TNR2024!",
        role: "admin"
    },
    {
        username: process.env.EMPLOYEE_USERNAME || "employee1",
        password: process.env.EMPLOYEE_PASSWORD || "[GENERATE_PASSWORD]",
        role: "employee"
    }
];
```

### Step 2: Set Environment Variables

**In Vercel Dashboard (Settings → Environment Variables):**

```
EMPLOYEE_USERNAME=employee1
EMPLOYEE_PASSWORD=[GENERATE_SECURE_PASSWORD]
```

**Password Requirements:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Not used elsewhere
- Store securely (password manager)

### Step 3: Generate Secure Password

**Recommended Password Generator:**
- Use a password manager (1Password, LastPass, Bitwarden)
- Or generate: `openssl rand -base64 24`

**Example Secure Password Format:**
```
TNR2025!Employee#Secure
```

### Step 4: Set Permissions (If Needed)

**Role-Based Access:**
- **Admin:** Full access to all features
- **Employee:** Limited access (CRM, campaigns, social media)

**Implementation:**
- Add role checking in API endpoints
- Filter dashboard features based on role
- Restrict sensitive operations (settings, user management)

---

## 📋 Account Information Template

**For Employee:**
```
Email: [employee_email]@tnrbusinesssolutions.com
Dashboard URL: https://www.tnrbusinesssolutions.com/admin-login.html
Username: [employee_username]
Password: [secure_password]
Role: Employee

Access Permissions:
✅ CRM System
✅ Email Campaigns
✅ Social Media Management
✅ Analytics (view only)
❌ System Settings
❌ User Management
```

---

## 🔒 Security Best Practices

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Unique for each account
   - Store in password manager

2. **Enable 2FA** (If Available)
   - Add two-factor authentication
   - Use authenticator app

3. **Regular Password Updates**
   - Change passwords every 90 days
   - Don't reuse passwords

4. **Session Management**
   - Logout when done
   - Don't share credentials
   - Use secure networks

5. **Monitor Access**
   - Review login logs regularly
   - Disable unused accounts
   - Update permissions as needed

---

## 📝 Quick Setup Checklist

- [ ] Create email account
- [ ] Generate secure password
- [ ] Add environment variables to Vercel
- [ ] Update admin-auth.js (if multi-user)
- [ ] Test login with new credentials
- [ ] Set appropriate permissions
- [ ] Document credentials securely
- [ ] Share credentials with employee (secure method)
- [ ] Enable 2FA (if available)
- [ ] Schedule password update reminder

---

## 🚨 Important Notes

1. **Never commit passwords to Git**
   - Use environment variables only
   - Store in secure password manager

2. **Share Credentials Securely**
   - Use encrypted email or password manager
   - Never send via plain text
   - Require password change on first login

3. **Document Access**
   - Keep record of who has access
   - Update when employees leave
   - Regular access audits

---

**Last Updated:** January 2025  
**Next Review:** After employee onboarding

