# 🔌 API Endpoints Reference - TNR Business Solutions

## ✅ **All Platform Connection Endpoints**

### **OAuth Initiation Endpoints**

#### **Facebook/Instagram (Meta)**
- **URL**: `/auth/meta` or `/api/auth/meta`
- **Method**: GET
- **Handler**: `server/handlers/auth-meta.js`
- **Redirects to**: Facebook OAuth page
- **Callback**: `/api/auth/meta/callback`
- **Saves**: Facebook Page tokens + Instagram account tokens

#### **LinkedIn**
- **URL**: `/auth/linkedin` or `/api/auth/linkedin`
- **Method**: GET
- **Handler**: `server/handlers/auth-linkedin.js`
- **Redirects to**: LinkedIn OAuth page
- **Callback**: `/api/auth/linkedin/callback`
- **Saves**: LinkedIn access token + user ID

#### **Twitter/X**
- **URL**: `/auth/twitter` or `/api/auth/twitter`
- **Method**: GET
- **Handler**: `server/handlers/auth-twitter.js`
- **Redirects to**: Twitter OAuth page
- **Callback**: `/api/auth/twitter/callback`
- **Saves**: Twitter access token + refresh token + user ID

---

## 📤 **Posting Endpoints**

### **Multi-Platform Posting** (NEW)
- **URL**: `/api/social/post-to-multiple-platforms`
- **Method**: POST
- **Handler**: `server/handlers/post-to-multiple-platforms.js`
- **Body**:
  ```json
  {
    "platforms": ["facebook", "instagram", "linkedin", "twitter"],
    "message": "Your post content",
    "imageUrl": "https://example.com/image.jpg",
    "scheduledTime": "2025-12-15T10:00:00",
    "clientName": "Client Name",
    "pageId": "facebook_page_id"
  }
  ```

### **Individual Platform Posting**

#### **Facebook**
- **URL**: `/api/social/post-to-facebook`
- **Method**: POST
- **Handler**: `server/handlers/post-to-facebook.js`

#### **Instagram**
- **URL**: `/api/social/post-to-instagram`
- **Method**: POST
- **Handler**: `server/handlers/post-to-instagram.js`

#### **LinkedIn**
- **URL**: `/api/social/post-to-linkedin`
- **Method**: POST
- **Handler**: `server/handlers/post-to-linkedin.js`

#### **Twitter/X**
- **URL**: `/api/social/post-to-twitter`
- **Method**: POST
- **Handler**: `server/handlers/post-to-twitter.js`

---

## 🔍 **Token Management Endpoints**

### **List Tokens**
- **URL**: `/api/social/tokens`
- **Method**: GET
- **Query Params**: `?platform=facebook` (optional)
- **Handler**: `server/handlers/social-tokens-api.js`
- **Returns**: List of all tokens (without full access tokens for security)

### **Test Token**
- **URL**: `/api/social/test-token` or `/api/social/tokens?action=test`
- **Method**: POST
- **Handler**: `server/handlers/test-token.js` or `server/handlers/social-tokens-api.js`
- **Body**:
  ```json
  {
    "tokenId": "token-id",
    "platform": "facebook"
  }
  ```

### **Save Token**
- **URL**: `/api/social/tokens?action=save`
- **Method**: POST
- **Handler**: `server/handlers/social-tokens-api.js`
- **Body**:
  ```json
  {
    "platform": "twitter",
    "access_token": "token",
    "page_id": "user_id",
    "page_name": "User Name"
  }
  ```

### **Delete Token**
- **URL**: `/api/social/tokens?tokenId=xxx`
- **Method**: DELETE
- **Handler**: `server/handlers/social-tokens-api.js`

---

## 📊 **Data Management Endpoints**

### **Posts**
- **URL**: `/api/posts`
- **Method**: GET
- **Handler**: `server/handlers/posts-api.js`
- **Query Params**: `?platform=facebook&status=published&limit=10&offset=0`

### **Messages**
- **URL**: `/api/messages`
- **Method**: GET
- **Handler**: `server/handlers/messages-api.js`

### **Analytics Events**
- **URL**: `/api/analytics/events`
- **Method**: GET
- **Handler**: `server/handlers/analytics-events-api.js`

### **Dashboard Stats**
- **URL**: `/api/stats/dashboard`
- **Method**: GET
- **Handler**: `server/handlers/dashboard-stats-api.js`

### **CRM Clients**
- **URL**: `/api/crm/clients`
- **Method**: GET
- **Handler**: `server/handlers/crm-api.js`

---

## 🔗 **Vercel Route Configuration**

All routes are configured in `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/auth/meta", "destination": "/api/auth/meta" },
    { "source": "/auth/linkedin", "destination": "/api/auth/linkedin" },
    { "source": "/auth/twitter", "destination": "/api/auth/twitter" },
    { "source": "/api/:path*", "destination": "/api/[...all]" }
  ]
}
```

---

## ✅ **Connection Status**

All platforms are configured and ready:

- ✅ **Facebook**: OAuth flow complete, tokens auto-saved
- ✅ **Instagram**: Auto-detected via Facebook Pages
- ✅ **LinkedIn**: OAuth flow complete, tokens auto-saved
- ✅ **Twitter/X**: OAuth flow complete, tokens auto-saved

---

## 🚀 **Quick Connect**

Visit: `https://www.tnrbusinesssolutions.com/platform-connections.html`

Click "Connect" on any platform to start OAuth flow!

---

**All endpoints are live and ready!** 🎉
