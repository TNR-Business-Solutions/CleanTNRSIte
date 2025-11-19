# X Developer Portal Settings - Step-by-Step Guide

## 📋 Fill Out the User Authentication Settings Form

### 1. App permissions (Required)
**Select:** `Read and write`
- ✅ This enables posting tweets (required for automation)
- ⚠️ Currently set to "Read" - you must change this to post tweets

### 2. Request email from users
**Leave unchecked** (unless you need user emails)

### 3. Type of App (Required)
**Select:** `Web App, Automated App or Bot` (Confidential client)
- ✅ This enables OAuth 2.0 Authentication
- ✅ Required for server-side applications like yours

### 4. Callback URI / Redirect URL (Required)
**Add this URL:**
```
https://www.tnrbusinesssolutions.com/api/auth/twitter/callback
```

**Important:**
- Must start with `https://`
- Must match exactly (including `www.`)
- Click **"+ Add another URI / URL"** if you need to add multiple URLs

### 5. Website URL (Required)
**Enter:**
```
https://www.tnrbusinesssolutions.com
```

### 6. Organization name (Optional)
**Enter:** `TNR Business Solutions`
- This will be shown when users authorize your app

### 7. Organization URL (Optional)
**Enter:**
```
https://www.tnrbusinesssolutions.com
```

### 8. Terms of service (Optional)
**Leave blank** or add if you have one:
```
https://www.tnrbusinesssolutions.com/terms
```

### 9. Privacy policy (Optional)
**Leave blank** or add if you have one:
```
https://www.tnrbusinesssolutions.com/privacy
```

## ✅ After Saving

1. **Click "Save"** at the bottom of the form
2. **Regenerate your Bearer Token** (or Access Token and Secret) to get new tokens with "Read and Write" permissions
3. **Save the new token** using the instructions in `TWITTER_SETUP_INSTRUCTIONS.md`

## 🔄 What Happens Next

After saving these settings:
- ✅ Your app will have "Read and Write" permissions
- ✅ OAuth 2.0 will be enabled (for the callback flow)
- ✅ Users can authorize your app to post on their behalf
- ✅ You can use the Bearer Token or OAuth 2.0 flow

## 📝 Summary of Required Fields

| Field | Value |
|-------|-------|
| **App permissions** | `Read and write` ✅ |
| **Type of App** | `Web App, Automated App or Bot` ✅ |
| **Callback URI** | `https://www.tnrbusinesssolutions.com/api/auth/twitter/callback` ✅ |
| **Website URL** | `https://www.tnrbusinesssolutions.com` ✅ |
| **Organization name** | `TNR Business Solutions` (optional) |
| **Organization URL** | `https://www.tnrbusinesssolutions.com` (optional) |

## ⚠️ Important Notes

1. **After changing permissions**, you MUST regenerate your tokens for the changes to take effect
2. **The callback URL must match exactly** - including `https://` and `www.`
3. **OAuth 2.0 requires** the "Web App, Automated App or Bot" type
4. **Read and Write permissions** are required to post tweets

## 🧪 Testing After Setup

1. Go to: `https://www.tnrbusinesssolutions.com/admin-dashboard.html`
2. Navigate to **Social Media** tab
3. Click **🐦 Connect X (Twitter)**
4. Complete the OAuth flow
5. Token will be saved automatically

