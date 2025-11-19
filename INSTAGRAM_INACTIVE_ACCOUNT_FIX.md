# Fix Instagram Inactive Account Issue

## 🔴 Problem: Instagram Account Shows as "Inactive"

If your Instagram account shows as "Inactive" in Meta Business Suite, it means the account is not properly connected or has been disconnected from your Facebook Page.

## ✅ Solution: Reactivate Instagram Account

### Step 1: Verify Account Status

1. **Check Instagram Account Type**
   - Go to Instagram → Settings → Account
   - Make sure it says "Account type: Business" or "Account type: Creator"
   - If it says "Personal", switch to Professional Account

2. **Check Instagram Connection to Facebook Page**
   - Go to Facebook Page → Settings → Instagram
   - Check if Instagram shows as "Connected" or "Not Connected"
   - If not connected, you'll see a "Connect Account" button

### Step 2: Disconnect and Reconnect Instagram

1. **Disconnect Instagram from Facebook Page**
   - Go to Facebook Page → Settings → Instagram
   - Click "Disconnect" (if connected)
   - Confirm the disconnection

2. **Reconnect Instagram to Facebook Page**
   - Click "Connect Account" in Facebook Page Settings → Instagram
   - Log in to your Instagram Business/Creator account
   - Authorize the connection
   - Make sure it shows as "Connected"

### Step 3: Verify Account in Meta Business Suite

1. **Check Meta Business Suite**
   - Go to business.facebook.com
   - Check Settings → Business Portfolio
   - Look for your Instagram account
   - It should show as "Active" (not "Inactive")

2. **If Still Inactive**
   - Make sure you're using the correct Instagram account
   - Check that the account is Business or Creator (not Personal)
   - Verify the account is public (not private)
   - Try disconnecting and reconnecting again

### Step 4: Reconnect via OAuth

1. **Go to TNR Dashboard**
   - Navigate to `/social-media-automation-dashboard.html`
   - Click "🔗 Connect Facebook/Instagram"

2. **Complete OAuth Flow**
   - Log in to Facebook
   - Grant all permissions:
     - `pages_manage_posts`
     - `pages_read_engagement`
     - `pages_show_list`
     - `pages_manage_metadata`

3. **Verify Connection**
   - Check the OAuth success page
   - Look for Instagram account information
   - Make sure it shows your Instagram username

### Step 5: Verify Account Verification

If you see "Verification needed" message:

1. **Verify Your Account**
   - Follow the verification prompts in Meta Business Suite
   - This may require:
     - Phone number verification
     - Email verification
     - ID verification (for business accounts)

2. **Complete Verification**
   - Go to Settings → Security
   - Complete any pending verification steps
   - This is required for full account access

## 🎯 Which Instagram Account to Use?

Based on your Meta Business Suite:

- **@tnrbusinesssolutions** - Status: Inactive ❌
- **@royturnertnrbusinesssolutions** - Status: Active ✅

### Recommendation:

**Use the ACTIVE account (@royturnertnrbusinesssolutions):**

1. **Make sure this account is Business or Creator**
   - Go to Instagram → Settings → Account
   - Verify account type

2. **Connect this account to Facebook Page**
   - Go to Facebook Page → Settings → Instagram
   - Disconnect @tnrbusinesssolutions (if connected)
   - Connect @royturnertnrbusinesssolutions instead

3. **Reconnect via OAuth**
   - Go to dashboard
   - Click "Connect Facebook/Instagram"
   - Complete OAuth flow
   - Verify the active account is connected

## 🔍 Troubleshooting Inactive Account

### Problem: Account Still Shows as Inactive

**Possible Causes:**
1. Account is Personal (not Business/Creator)
2. Account is private (must be public for Business accounts)
3. Account is not properly connected to Facebook Page
4. Account verification is pending
5. Account has been restricted or disabled

**Solutions:**
1. **Check Account Type**
   - Instagram Settings → Account → Account Type
   - Must be Business or Creator

2. **Check Account Privacy**
   - Instagram Settings → Privacy
   - Business accounts must be public
   - Switch to public if private

3. **Check Account Status**
   - Go to Instagram Settings → Help → Report a Problem
   - Check if account has any restrictions
   - Contact Instagram support if needed

4. **Reconnect Everything**
   - Disconnect Instagram from Facebook Page
   - Wait 5 minutes
   - Reconnect Instagram to Facebook Page
   - Reconnect via OAuth in dashboard

## ✅ Verification Checklist

- [ ] Instagram account is Business or Creator (not Personal)
- [ ] Instagram account is public (not private)
- [ ] Instagram account is connected to Facebook Page
- [ ] Instagram account shows as "Active" in Meta Business Suite
- [ ] Account verification is complete
- [ ] Connected via OAuth in TNR Dashboard
- [ ] Instagram account shows in dashboard connection status
- [ ] Test post to Instagram works successfully

## 🆘 Still Having Issues?

If your Instagram account is still showing as inactive after following these steps:

1. **Complete Account Verification First**
   - If Meta asks for verification, complete it first
   - Update phone number if you no longer have access to old number
   - See `META_VERIFICATION_PHONE_NUMBER_UPDATE.md` for detailed steps
   - Verification is required before reconnecting accounts

2. **Contact Meta Support**
   - Go to business.facebook.com → Help
   - Report the issue
   - Provide details about the inactive account
   - Explain verification issues if applicable

3. **Check Account Restrictions**
   - Go to Instagram Settings → Help → Report a Problem
   - Check for any account restrictions
   - Follow instructions to resolve

4. **Try Alternative Account**
   - If @tnrbusinesssolutions won't activate
   - Use @royturnertnrbusinesssolutions (which is active)
   - Connect that account to your Facebook Page instead

## 📱 Phone Number Verification Issue

If Meta is asking you to verify using an old phone number you no longer have access to:

1. **Update Phone Number**
   - Go to facebook.com/settings → Personal Information
   - Remove old phone number
   - Add new phone number
   - Verify new number with SMS code

2. **Use Alternative Verification**
   - Use email verification instead
   - Use authenticator app (Google Authenticator, Authy)
   - Contact Meta Support for help

3. **After Updating Phone Number**
   - Complete account verification
   - Reconnect Instagram to Facebook Page
   - Reconnect via OAuth in dashboard

**See `META_VERIFICATION_PHONE_NUMBER_UPDATE.md` for detailed steps.**

---

**Last Updated:** 2025-01-12

