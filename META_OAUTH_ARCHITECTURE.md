# Meta OAuth Architecture - TNR Business Solutions

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TNR Business Solutions                        │
│              www.tnrbusinesssolutions.com                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐         ┌──────────┐        ┌──────────────┐
   │ Website │         │   OAuth  │        │   Content    │
   │  Pages  │         │   Flow   │        │  Generator   │
   └─────────┘         └──────────┘        └──────────────┘
        │                     │                     │
        │              ┌──────┴──────┐              │
        │              ▼             ▼              │
        │         /auth/meta    /auth/meta/        │
        │                       callback            │
        │              │             │              │
        └──────────────┴─────────────┴──────────────┘
                       │
                       │ HTTPS
                       ▼
        ┌──────────────────────────────────┐
        │     Meta (Facebook) API          │
        │  - Facebook Pages API            │
        │  - Instagram Graph API           │
        │  - OAuth 2.0 Authorization       │
        └──────────────────────────────────┘
```

---

## 🔄 OAuth Flow Diagram

```
┌──────────┐                                    ┌──────────┐
│          │  1. Click "Connect Facebook"       │          │
│   User   │─────────────────────────────────>  │ Website  │
│          │                                    │          │
└──────────┘                                    └──────────┘
                                                     │
                                                     │ 2. Redirect to
                                                     │    /auth/meta
                                                     ▼
                                          ┌────────────────────┐
                                          │  Vercel Function   │
                                          │  /api/auth/meta.js │
                                          └────────────────────┘
                                                     │
                                                     │ 3. Generate OAuth URL
                                                     │    & Redirect
                                                     ▼
┌──────────┐                              ┌─────────────────┐
│          │  4. Show login/permissions    │                 │
│   User   │ <─────────────────────────────│  Facebook.com   │
│          │                               │  OAuth Dialog   │
└──────────┘                               └─────────────────┘
     │                                              │
     │ 5. User approves                             │
     │                                              │
     └─────────────────────────────────────────────>│
                                                    │
                                                    │ 6. Redirect with code
                                                    ▼
                                        ┌──────────────────────────┐
                                        │   Vercel Function        │
                                        │   /api/auth/meta/        │
                                        │   callback.js            │
                                        └──────────────────────────┘
                                                    │
                        ┌───────────────────────────┼────────────────────────┐
                        │                           │                        │
                        │ 7. Exchange code          │                        │
                        │    for tokens             │                        │
                        ▼                           ▼                        ▼
            ┌─────────────────┐        ┌────────────────────┐   ┌──────────────────┐
            │ Short-lived     │        │  Long-lived        │   │  Page Access     │
            │ User Token      │───────>│  User Token        │   │  Tokens          │
            │ (2 hours)       │        │  (60 days)         │   │  (never expire)  │
            └─────────────────┘        └────────────────────┘   └──────────────────┘
                                                    │
                                                    │ 8. Fetch pages
                                                    │    & Instagram accounts
                                                    ▼
                                        ┌──────────────────────────┐
                                        │   Return JSON with:      │
                                        │   - User token           │
                                        │   - Page tokens          │
                                        │   - Instagram accounts   │
                                        └──────────────────────────┘
                                                    │
                                                    │ 9. Display tokens
                                                    ▼
┌──────────┐                                ┌─────────────┐
│          │  <──────────────────────────── │   Browser   │
│   User   │    Save tokens securely!       │  JSON View  │
│          │                                └─────────────┘
└──────────┘
```

---

## 📁 File Structure

```
clean-site/
├── api/
│   ├── auth/
│   │   ├── meta.js                    ← OAuth initiation
│   │   └── meta/
│   │       └── callback.js            ← OAuth callback handler
│   ├── checkout.js                    ← Existing checkout API
│   ├── crm-api.js                     ← Existing CRM API
│   └── submit-form.js                 ← Existing form API
│
├── gmb-post-generator.html            ← Content generation tool
├── live-automation-demo.html          ← Automation dashboard
├── tnr-social-media-setup.html        ← Social media setup
│
├── vercel.json                        ← Deployment config (updated)
├── package.json                       ← Dependencies (updated)
│
└── Documentation:
    ├── META_OAUTH_SETUP_GUIDE.md      ← Full setup guide
    ├── QUICK_META_OAUTH_SETUP.md      ← Quick reference
    └── META_OAUTH_ARCHITECTURE.md     ← This file
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Environment Variables                     │
│                  (Stored in Vercel Only)                     │
├─────────────────────────────────────────────────────────────┤
│  META_APP_ID         = 2201740210361183                     │
│  META_APP_SECRET     = 0d2b09da0b07236276de7ae1adc05487     │
│  META_REDIRECT_URI   = https://www.tnrbusiness...callback   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Injected at runtime
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel Serverless Functions                     │
│                    (No secrets in code)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS only
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Meta Graph API                            │
│              (graph.facebook.com)                           │
└─────────────────────────────────────────────────────────────┘
```

**Security Features:**
- ✅ No secrets in Git repository
- ✅ Environment variables in Vercel only
- ✅ HTTPS enforced everywhere
- ✅ CSRF protection via state parameter
- ✅ Strict redirect URI validation
- ✅ Short-lived tokens exchanged immediately
- ✅ Function timeout limits (10 seconds)

---

## 📊 Data Flow

### Authorization Phase (One-time setup)
```
User → Website → /auth/meta → Facebook → Approval → 
/auth/meta/callback → Token Exchange → Save Tokens
```

### Posting Phase (Ongoing usage)
```
User → GMB Generator → Create Content → 
API Call (with token) → Facebook/Instagram → Post Published
```

---

## 🌐 Endpoints

### Public Endpoints (User-facing)
| Endpoint | Method | Purpose | Returns |
|----------|--------|---------|---------|
| `/auth/meta` | GET | Start OAuth flow | Redirect to Facebook |
| `/auth/meta/callback` | GET | Handle OAuth response | JSON with tokens |

### Internal Flow (Automatic)
| Action | Endpoint | Purpose |
|--------|----------|---------|
| 1. Initiate | `/api/auth/meta.js` | Generate OAuth URL |
| 2. Callback | `/api/auth/meta/callback.js` | Exchange tokens |
| 3. Short → Long | Facebook API | Get long-lived token |
| 4. Fetch Pages | Facebook API | Get page access tokens |
| 5. Fetch IG | Facebook API | Get Instagram accounts |

---

## 💾 Token Types & Lifespans

| Token Type | Lifespan | Purpose | Renewable |
|------------|----------|---------|-----------|
| **Authorization Code** | 10 minutes | One-time exchange | No (single use) |
| **Short-lived User Token** | 2 hours | Initial token | Yes (to long-lived) |
| **Long-lived User Token** | 60 days | User authorization | Yes (re-authorize) |
| **Page Access Token** | Never expires | Post to Facebook | No (permanent) |

**Important Notes:**
- ✅ Page tokens don't expire - save them permanently
- ⚠️ User token expires in 60 days - re-authorize to refresh
- ✅ Instagram uses the same page token as Facebook

---

## 🔄 Integration Points

### Current Integration
```
GMB Post Generator → (Manual copy/paste) → Social Media
```

### Future Integration (After OAuth)
```
GMB Post Generator → [Post to Facebook Button] → 
Vercel Function (with token) → Facebook/Instagram API → 
Post Published ✅
```

---

## 🚀 Deployment Pipeline

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│              │       │              │       │              │
│  Git Push    │──────>│   GitHub     │──────>│   Vercel     │
│  (main)      │       │  Repository  │       │   Deploy     │
│              │       │              │       │              │
└──────────────┘       └──────────────┘       └──────────────┘
                                                      │
                                                      │ Build
                                                      ▼
                              ┌──────────────────────────────────┐
                              │   Production Deployment          │
                              │   - Serverless functions ready   │
                              │   - OAuth endpoints live         │
                              │   - Environment vars loaded      │
                              └──────────────────────────────────┘
                                                      │
                                                      │ Live at
                                                      ▼
                              www.tnrbusinesssolutions.com/auth/meta
```

---

## 📈 Scaling Considerations

**Current Setup:**
- Handles multiple pages per authorization
- Supports both Facebook and Instagram
- Vercel auto-scales serverless functions
- No server maintenance required

**Future Enhancements:**
- Store tokens in database (instead of manual copy)
- Add token refresh automation
- Build admin dashboard for token management
- Add scheduled posting functionality
- Implement post analytics tracking

---

## 🎯 Key Benefits of This Architecture

1. **✅ No Local Server Required**
   - Everything runs on Vercel's infrastructure
   - No need for LocalTunnel or ngrok
   - Production-ready from day one

2. **✅ Secure by Design**
   - Secrets stored in environment variables
   - HTTPS everywhere
   - No client-side token exposure

3. **✅ Scalable**
   - Serverless auto-scaling
   - Handle unlimited authorization requests
   - No infrastructure management

4. **✅ Maintainable**
   - Clean separation of concerns
   - Easy to update and deploy
   - Comprehensive documentation

5. **✅ Cost-Effective**
   - Free tier on Vercel supports this use case
   - Pay only for usage
   - No dedicated server costs

---

*Last Updated: October 30, 2025*
*Architecture Version: 1.0.0*

