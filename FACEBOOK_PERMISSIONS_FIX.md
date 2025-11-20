# Facebook API Permissions Error - Complete Fix

## 🔍 Problem Analysis

### Error Details:
- **Status Code:** 400 Bad Request
- **Error Message:** "(#200) Permissions error"
- **Error Type:** OAuthException
- **Error Code:** 200

### Root Cause:
The Facebook API is returning a permissions error because one or more of the following issues:

1. **Missing Permissions:** The app hasn't requested the required permissions during OAuth
2. **Expired Token:** The user's access token has expired
3. **Page Access:** The user doesn't have admin/editor role on the target Facebook Page
4. **Revoked Permissions:** The user manually revoked permissions after connecting
5. **App Review:** Advanced permissions not approved by Facebook

---

## ✅ Solutions Implemented

### 1. **Enhanced Error Handling** (`post-to-facebook.js`)

**Before:**
```javascript
return res.status(400).json({
  success: false,
  error: 'Facebook API Error',
  message: fbError.message,
  errorType: fbError.type,
  errorCode: fbError.code
});
```

**After:**
```javascript
// Provide actionable error messages
let userMessage = fbError.message || 'Failed to post to Facebook';
let action = 'retry';
let actionUrl = null;

// Handle specific error codes
if (fbError.code === 200 || fbError.type === 'OAuthException') {
  userMessage = '❌ Permissions Error: Your Facebook account needs to be reconnected with the correct permissions.';
  action = 'reconnect';
  actionUrl = '/api/auth/meta';
} else if (fbError.code === 190) {
  userMessage = '❌ Token Expired: Please reconnect your Facebook account.';
  action = 'reconnect';
  actionUrl = '/api/auth/meta';
} else if (fbError.code === 368) {
  userMessage = '❌ Page Access: You don\'t have permission to post on this Page.';
  action = 'check_page_role';
}

return res.status(400).json({
  success: false,
  error: 'Facebook API Error',
  message: userMessage,
  originalMessage: fbError.message,
  errorType: fbError.type,
  errorCode: fbError.code,
  action: action,
  actionUrl: actionUrl,
  help: action === 'reconnect' 
    ? 'Click the "Reconnect Facebook" button to grant the required permissions'
    : 'Please check your Facebook Page settings and permissions'
});
```

---

### 2. **New Permission Checker** (`check-facebook-permissions.js`)

Created comprehensive endpoint to validate Facebook token and permissions:

**Endpoint:** `/api/social/check-facebook-permissions`

**Features:**
- ✅ Checks all granted permissions
- ✅ Identifies missing required permissions
- ✅ Lists all Facebook Pages user manages
- ✅ Validates posting permissions on each Page
- ✅ Checks token expiration
- ✅ Provides actionable recommendations

**Example Response:**
```json
{
  "success": true,
  "status": {
    "valid": true,
    "canPost": true,
    "tokenSource": "database",
    "needsReconnect": false
  },
  "user": {
    "id": "123456789",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "permissions": {
    "granted": [
      "pages_manage_posts",
      "pages_read_engagement",
      "pages_show_list",
      "pages_manage_metadata"
    ],
    "required": [
      "pages_manage_posts",
      "pages_read_engagement",
      "pages_show_list"
    ],
    "missing": []
  },
  "pages": {
    "count": 2,
    "list": [
      {
        "id": "987654321",
        "name": "My Business Page",
        "category": "Business",
        "hasToken": true,
        "canPost": true,
        "tasks": ["CREATE_CONTENT", "MODERATE", "ANALYZE"]
      }
    ],
    "selected": {
      "id": "987654321",
      "name": "My Business Page",
      "canPost": true
    }
  },
  "token": {
    "isValid": true,
    "expiresAt": 1735689600,
    "expiresIn": 5184000,
    "appId": "2201740210361183",
    "userId": "123456789",
    "scopes": ["pages_manage_posts", "pages_read_engagement", "pages_show_list"]
  },
  "recommendations": []
}
```

**With Issues:**
```json
{
  "success": true,
  "status": {
    "valid": false,
    "canPost": false,
    "needsReconnect": true
  },
  "permissions": {
    "granted": ["pages_show_list"],
    "required": ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
    "missing": ["pages_manage_posts", "pages_read_engagement"]
  },
  "recommendations": [
    {
      "type": "error",
      "message": "Missing required permissions: pages_manage_posts, pages_read_engagement",
      "action": "Reconnect your Facebook account to grant missing permissions",
      "actionUrl": "/api/auth/meta"
    }
  ]
}
```

---

## 🔧 Required Permissions

### Current Permissions Requested:
```javascript
const scopes = [
  'pages_manage_posts',        // Create, edit and delete posts on Pages
  'pages_read_engagement',     // Read engagement data on Pages
  'pages_show_list',          // Access the list of Pages a person manages
  'pages_manage_metadata'     // Manage Page settings
];
```

### Facebook Permission Levels:

#### **Standard Access** (Available Immediately):
- `pages_show_list`
- `pages_read_engagement`

#### **Advanced Access** (Requires App Review):
- ❗ `pages_manage_posts` - **THIS IS LIKELY THE ISSUE**
- ❗ `pages_manage_metadata`

---

## 🚨 Most Likely Issue: Advanced Access Not Approved

### Why You're Getting the Error:

Facebook has **two tiers of permissions**:

1. **Standard Access:** Available immediately for testing
2. **Advanced Access:** Requires App Review approval

**The problem:** `pages_manage_posts` (required for posting) is an **Advanced Access** permission.

### Current Status:
Your Meta app is likely in **Development Mode** with only **Standard Access** permissions, which means:
- ✅ You can read Page data
- ✅ You can list Pages
- ❌ **You CANNOT post to Pages** (requires Advanced Access)

---

## 🎯 Solution Steps (In Order)

### Step 1: Check App Mode
1. Go to: https://developers.facebook.com/apps/2201740210361183
2. Check app status: **Development** or **Live**
3. If **Development:** You can only test with approved testers

### Step 2: Add Test Users (Immediate Solution)
**If app is in Development mode:**

1. Go to: **Roles** → **Test Users**
2. Add yourself as a test user
3. Test users automatically get all permissions
4. This lets you test posting without App Review

**OR**

1. Go to: **Roles** → **Administrators**
2. Ensure you're listed as an Admin
3. Admins can use Development mode apps

### Step 3: Request Advanced Access (Production Solution)
**For production use with real users:**

1. Go to: **App Review** → **Permissions and Features**
2. Find `pages_manage_posts`
3. Click **Request Advanced Access**
4. Provide required information:
   - **Use case explanation**
   - **Demo video** showing app functionality
   - **Privacy policy URL**
   - **Terms of service URL**
5. Submit for review (typically 3-7 days)

### Step 4: Reconnect After Approval
Once Advanced Access is approved:
1. Have users visit: `/api/auth/meta`
2. Re-authorize to grant updated permissions
3. Test posting again

---

## 🧪 Testing Your Fix

### Test 1: Check Permissions
```javascript
fetch('/api/social/check-facebook-permissions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ useDatabaseToken: true })
})
.then(r => r.json())
.then(data => {
  console.log('Status:', data.status);
  console.log('Missing Permissions:', data.permissions.missing);
  console.log('Recommendations:', data.recommendations);
});
```

### Test 2: Try Posting
```javascript
fetch('/api/social/post-to-facebook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Test post from TNR Social Automation',
    useDatabaseToken: true
  })
})
.then(r => r.json())
.then(data => {
  console.log('Result:', data);
  if (!data.success) {
    console.log('Action:', data.action);
    console.log('Action URL:', data.actionUrl);
  }
});
```

---

## 📋 Quick Checklist

- [ ] Verify you're an Admin or Test User on the Meta app
- [ ] Check if `pages_manage_posts` has Advanced Access
- [ ] Verify Facebook Page role (must be Admin or Editor)
- [ ] Check token expiration using permission checker
- [ ] Test with permission checker endpoint first
- [ ] If in Development mode, add yourself as Test User
- [ ] For production, submit App Review for Advanced Access
- [ ] After changes, reconnect Facebook account

---

## 🔄 User Flow for Fixing

### For End Users:
1. **See error:** "Permissions Error: Your Facebook account needs to be reconnected"
2. **Click:** "Reconnect Facebook" button
3. **Redirected to:** Facebook OAuth authorization
4. **Grant permissions**
5. **Redirected back:** To dashboard with updated token
6. **Try posting again**

### Dashboard Update Needed:
Add this to your social media dashboard:

```html
<button onclick="checkFacebookPermissions()">🔍 Check Facebook Status</button>
<button onclick="reconnectFacebook()">🔄 Reconnect Facebook</button>

<script>
async function checkFacebookPermissions() {
  const response = await fetch('/api/social/check-facebook-permissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ useDatabaseToken: true })
  });
  
  const data = await response.json();
  
  if (data.recommendations && data.recommendations.length > 0) {
    alert(data.recommendations.map(r => r.message).join('\n\n'));
    if (data.recommendations[0].actionUrl) {
      if (confirm('Would you like to fix this now?')) {
        window.location.href = data.recommendations[0].actionUrl;
      }
    }
  } else {
    alert('✅ Everything looks good! You can post to Facebook.');
  }
}

function reconnectFacebook() {
  window.location.href = '/api/auth/meta';
}
</script>
```

---

## 🎯 Expected Outcomes

### After Implementing This Fix:

**Before:**
```
Error: Failed to post: (#200) Permissions error
```

**After:**
```
❌ Permissions Error: Your Facebook account needs to be reconnected with the correct permissions.

Action: reconnect
Help: Click the "Reconnect Facebook" button to grant the required permissions
```

**User-Friendly Display:**
```
⚠️ Facebook Connection Issue

Your Facebook permissions have expired or are incomplete. Please reconnect your account to continue posting.

[Reconnect Facebook] [Learn More]
```

---

## 📚 Additional Resources

- **Facebook Permissions Reference:** https://developers.facebook.com/docs/permissions/reference
- **App Review Guide:** https://developers.facebook.com/docs/app-review
- **Pages API Documentation:** https://developers.facebook.com/docs/pages-api
- **Common Errors:** https://developers.facebook.com/docs/graph-api/common-errors

---

## 🆘 Still Having Issues?

### If error persists after fixes:

1. **Check Vercel logs:**
   ```
   vercel logs --follow
   ```

2. **Verify environment variables:**
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `META_REDIRECT_URI`

3. **Test with Graph API Explorer:**
   - Go to: https://developers.facebook.com/tools/explorer/
   - Select your app
   - Try posting with test token

4. **Check Facebook App Dashboard:**
   - Review app status
   - Check permission status
   - Verify webhook configuration

---

**Status:** Fix deployed and ready
**Next Step:** Run permission checker, then request Advanced Access for production use

