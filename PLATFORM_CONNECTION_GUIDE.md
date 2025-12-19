# 🔗 Platform Connection Guide - TNR Business Solutions

## ✅ **All Platforms Ready to Connect**

Your platform supports connecting to all major social media platforms:

### **Supported Platforms**
1. ✅ **Facebook/Meta** - Full OAuth flow
2. ✅ **Instagram** - Via Facebook (connected automatically)
3. ✅ **LinkedIn** - Full OAuth flow
4. ✅ **Twitter/X** - Full OAuth flow

---

## 🔗 **Connection URLs**

### **Production URLs** (Vercel)
- **Facebook/Instagram**: `https://www.tnrbusinesssolutions.com/auth/meta`
- **LinkedIn**: `https://www.tnrbusinesssolutions.com/auth/linkedin`
- **Twitter/X**: `https://www.tnrbusinesssolutions.com/auth/twitter`

### **Local Development URLs**
- **Facebook/Instagram**: `http://localhost:3000/auth/meta`
- **LinkedIn**: `http://localhost:3000/auth/linkedin`
- **Twitter/X**: `http://localhost:3000/auth/twitter`

---

## 📋 **Connection Steps**

### **1. Facebook/Instagram Connection**

1. **Go to Platform Connections**: `https://www.tnrbusinesssolutions.com/platform-connections.html`
2. **Click "Connect"** on Meta/Facebook card
3. **You'll be redirected to Facebook** for authorization
4. **Approve permissions**:
   - `pages_manage_posts` - Post to Pages
   - `pages_read_engagement` - Read engagement
   - `pages_show_list` - List your pages
   - `pages_manage_metadata` - Manage settings
5. **Select Pages** you want to connect
6. **Tokens are automatically saved** to database
7. **Instagram accounts** linked to Facebook Pages are automatically detected

**Result**: 
- ✅ Facebook Page tokens saved (never expire)
- ✅ Instagram Business Account tokens saved
- ✅ Ready to post to both platforms

---

### **2. LinkedIn Connection**

1. **Go to Platform Connections**: `https://www.tnrbusinesssolutions.com/platform-connections.html`
2. **Click "Connect"** on LinkedIn card
3. **You'll be redirected to LinkedIn** for authorization
4. **Approve permissions**:
   - `w_member_social` - Post content
   - `openid` - User identification
   - `profile` - Profile information
   - `email` - Email access
5. **Tokens are automatically saved** to database

**Result**:
- ✅ LinkedIn access token saved
- ✅ User ID stored
- ✅ Ready to post to LinkedIn

---

### **3. Twitter/X Connection**

1. **Go to Platform Connections**: `https://www.tnrbusinesssolutions.com/platform-connections.html`
2. **Click "Connect"** on Twitter/X card
3. **You'll be redirected to Twitter** for authorization
4. **Approve permissions**:
   - `tweet.read` - Read tweets
   - `tweet.write` - Post tweets
   - `users.read` - Read profile
   - `offline.access` - Refresh token
5. **Tokens are automatically saved** to database

**Result**:
- ✅ Twitter access token saved
- ✅ Refresh token saved (if available)
- ✅ Ready to post to Twitter/X

---

## ⚙️ **Environment Variables Required**

Make sure these are set in **Vercel Dashboard → Settings → Environment Variables**:

### **Facebook/Instagram (Meta)**
```
META_APP_ID=your_facebook_app_id
META_APP_SECRET=your_facebook_app_secret
META_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/meta/callback
```

### **LinkedIn**
```
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/linkedin/callback
```

### **Twitter/X**
```
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=https://www.tnrbusinesssolutions.com/api/auth/twitter/callback
```

---

## 🔧 **API Endpoints**

### **OAuth Initiation**
- `GET /auth/meta` - Start Facebook/Instagram OAuth
- `GET /auth/linkedin` - Start LinkedIn OAuth
- `GET /auth/twitter` - Start Twitter OAuth

### **OAuth Callbacks** (Automatic)
- `GET /api/auth/meta/callback` - Facebook callback
- `GET /api/auth/linkedin/callback` - LinkedIn callback
- `GET /api/auth/twitter/callback` - Twitter callback

### **Token Management**
- `GET /api/social/tokens` - List all tokens
- `GET /api/social/tokens?platform=facebook` - List Facebook tokens
- `POST /api/social/tokens?action=test` - Test token validity
- `POST /api/social/tokens?action=save` - Save token manually
- `DELETE /api/social/tokens?tokenId=xxx` - Delete token

### **Posting**
- `POST /api/social/post-to-multiple-platforms` - Post to multiple platforms
- `POST /api/social/post-to-facebook` - Post to Facebook
- `POST /api/social/post-to-instagram` - Post to Instagram
- `POST /api/social/post-to-linkedin` - Post to LinkedIn
- `POST /api/social/post-to-twitter` - Post to Twitter

---

## ✅ **Verification Checklist**

After connecting each platform:

- [ ] **Facebook**: Token saved, can see pages in database
- [ ] **Instagram**: Instagram account ID detected and saved
- [ ] **LinkedIn**: Token saved, user ID stored
- [ ] **Twitter**: Token saved, ready to post

**Test Connection**:
1. Go to Platform Connections page
2. Click "Test" or "Manage" on each platform
3. Verify token is valid
4. Try posting a test post

---

## 🚀 **Quick Connect**

**All platforms can be connected from one page**:
```
https://www.tnrbusinesssolutions.com/platform-connections.html
```

Click "Connect" on each platform card to start OAuth flow!

---

## 📝 **Notes**

- **Instagram**: No separate connection needed - automatically available when Facebook Page has Instagram Business Account linked
- **Tokens**: Automatically saved to database on successful OAuth
- **Page Tokens**: Facebook Page tokens never expire (permanent)
- **User Tokens**: May expire (60 days for Facebook, varies for others)
- **Refresh**: Tokens are automatically refreshed when possible

---

**All platforms are ready to connect!** 🎉
