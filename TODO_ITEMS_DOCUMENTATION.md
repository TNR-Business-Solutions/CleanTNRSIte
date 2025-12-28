# TODO Items Documentation
**Date:** December 17, 2025  
**Status:** Documented for Future Implementation

---

## 📋 **TODO Items by Priority**

### 🔴 **High Priority - Core Functionality**

#### 1. **Token Refresh Logic** (`server/handlers/post-to-nextdoor.js`)
**Location:** Line 72  
**Status:** Not Implemented  
**Description:** Implement token refresh logic for Nextdoor OAuth tokens  
**Impact:** Tokens may expire, breaking Nextdoor integration  
**Estimated Time:** 2-3 hours  
**Dependencies:** Nextdoor API refresh token endpoint

---

### 🟡 **Medium Priority - Feature Enhancements**

#### 2. **Instagram Webhooks - Comment Processing** (`server/handlers/instagram-webhooks.js`)
**Location:** Lines 126-129  
**Status:** Placeholder  
**Description:** 
- Save comment to database
- Auto-reply if needed
- Moderate comment (hide/unhide)
- Send notification to admin

**Impact:** Missing real-time comment management  
**Estimated Time:** 4-6 hours  
**Dependencies:** Database schema for comments, notification system

#### 3. **Instagram Webhooks - Mention Processing** (`server/handlers/instagram-webhooks.js`)
**Location:** Lines 142-144  
**Status:** Placeholder  
**Description:**
- Fetch mention details
- Respond to mention
- Save to database

**Impact:** Missing mention tracking and response automation  
**Estimated Time:** 3-4 hours  
**Dependencies:** Instagram Mentions API, database schema

#### 4. **Instagram Webhooks - Insights Processing** (`server/handlers/instagram-webhooks.js`)
**Location:** Lines 158-159  
**Status:** Placeholder  
**Description:**
- Save insights to database
- Generate analytics report

**Impact:** Missing automated insights tracking  
**Estimated Time:** 2-3 hours  
**Dependencies:** Database schema for insights, analytics module

---

## 📝 **Implementation Notes**

### Token Refresh Pattern
```javascript
// Recommended implementation pattern
async function refreshToken(refreshToken) {
  try {
    const response = await axios.post('https://api.nextdoor.com/oauth/token', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
    return response.data;
  } catch (error) {
    Logger.error('Token refresh failed:', error);
    throw error;
  }
}
```

### Webhook Handler Pattern
```javascript
// Recommended implementation pattern
async function handleComment(commentData) {
  // 1. Save to database
  await db.saveComment(commentData);
  
  // 2. Check auto-reply rules
  if (shouldAutoReply(commentData)) {
    await sendAutoReply(commentData);
  }
  
  // 3. Moderate if needed
  if (needsModeration(commentData)) {
    await moderateComment(commentData);
  }
  
  // 4. Notify admin
  await notifyAdmin('new_comment', commentData);
}
```

---

## ✅ **Completed TODOs**

None yet - all items are pending implementation.

---

## 🎯 **Recommended Implementation Order**

1. **Token Refresh Logic** (High Priority)
   - Prevents service disruption
   - Relatively straightforward
   - High impact

2. **Comment Processing** (Medium Priority)
   - Core social media management feature
   - Improves user engagement
   - Moderate complexity

3. **Mention Processing** (Medium Priority)
   - Important for brand monitoring
   - Similar to comment processing
   - Can reuse patterns

4. **Insights Processing** (Medium Priority)
   - Analytics enhancement
   - Lower user-facing impact
   - Can be implemented incrementally

---

## 📊 **Impact Assessment**

| TODO Item | User Impact | Technical Complexity | Priority |
|-----------|-------------|---------------------|----------|
| Token Refresh | High | Low | 🔴 High |
| Comment Processing | Medium | Medium | 🟡 Medium |
| Mention Processing | Medium | Medium | 🟡 Medium |
| Insights Processing | Low | Low | 🟡 Medium |

---

**Note:** These TODOs represent planned enhancements. The system is fully functional without them, but implementing these features will improve automation and user experience.

