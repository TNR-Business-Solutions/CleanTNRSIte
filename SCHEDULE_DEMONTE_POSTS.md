# 📅 How to Schedule Posts for Demonte Contracting

## Quick Answer: YES! ✅

You can schedule posts for Demonte Contracting. Here are your options:

---

## Option 1: Use Facebook's Content Calendar (Easiest - Works Now)

### Steps:
1. **Go to**: https://business.facebook.com/latest/content_calendar
2. **Select Page**: Choose "Demonte Contracting" from the page dropdown (top left)
3. **Create Post**: 
   - Click "Create Post" button
   - Or click on a date in the calendar
4. **Write Your Post**: Enter content, add image if needed
5. **Schedule**: 
   - Click the clock icon or "Schedule" button
   - Select date and time
6. **Publish**: Click "Schedule" to save

**That's it!** The post will appear on Demonte Contracting's Facebook page at the scheduled time.

---

## Option 2: Use Your Dashboard (Automated - I Just Enhanced It)

### What I Just Added:
✅ **Scheduled Post Support** - Facebook API now accepts `scheduledTime` parameter
✅ **Client Association** - Posts can be linked to client names
✅ **Database Storage** - Scheduled posts saved to your database

### How to Use:

#### Step 1: Connect Demonte Contracting's Facebook Page

**If you're a Page Admin:**
1. Go to: `http://localhost:3000/api/auth/meta`
2. Login with Facebook account that has admin access to Demonte Contracting page
3. Select "Demonte Contracting" page when prompted
4. Done! Token saved automatically

**If Demonte Contracting connects it:**
1. Have them go to: `http://localhost:3000/api/auth/meta`
2. They login and select their page
3. Done!

#### Step 2: Schedule a Post via API

```javascript
// Example API call
POST http://localhost:3000/api/post-to-facebook
Content-Type: application/json

{
  "pageId": "demonte_contracting_page_id",
  "message": "Check out our latest construction project! #Construction #DemonteContracting",
  "scheduledTime": "2025-12-15T10:00:00",
  "clientName": "Demonte Contracting"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post scheduled for 12/15/2025, 10:00:00 AM!",
  "postId": "123456789_987654321",
  "scheduled": true,
  "clientName": "Demonte Contracting"
}
```

#### Step 3: View Scheduled Posts

- Go to: `http://localhost:3000/posts-management.html`
- Filter by client: "Demonte Contracting"
- See all scheduled posts with status "scheduled"

---

## What Changed in the Code

### 1. Enhanced `post-to-facebook.js`
- ✅ Added `scheduledTime` parameter support
- ✅ Posts scheduled for future dates (min 10 minutes ahead)
- ✅ Automatically saves to database with client name
- ✅ Works for both text and photo posts

### 2. Updated Database Schema
- ✅ Added `client_id` and `client_name` to `social_media_tokens` table
- ✅ Can now track which page belongs to which client

### 3. Post Storage
- ✅ Scheduled posts saved with status "scheduled"
- ✅ Shows in Posts Management page
- ✅ Updates to "published" when Facebook confirms

---

## Example: Schedule a Post for Demonte Contracting

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/post-to-facebook \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "YOUR_DEMONTE_PAGE_ID",
    "message": "New project starting next week! Contact us for a free estimate. #Construction #HomeImprovement",
    "scheduledTime": "2025-12-15T09:00:00",
    "clientName": "Demonte Contracting"
  }'
```

### Using JavaScript (from your dashboard):
```javascript
async function scheduleDemontePost() {
  const response = await fetch('/api/post-to-facebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pageId: 'demonte_page_id', // Get from platform-connections page
      message: 'Your post content here',
      scheduledTime: '2025-12-15T09:00:00',
      clientName: 'Demonte Contracting'
    })
  });
  
  const result = await response.json();
  console.log('Scheduled!', result);
}
```

---

## Next Steps

I can create a **visual scheduling UI** in your dashboard where you can:
- Select client (Demonte Contracting, TNR, etc.)
- Select their Facebook page
- Write post content
- Pick date/time from calendar
- Schedule with one click

Would you like me to build that UI now?

---

## Summary

**Right Now:**
- ✅ Use Facebook's content calendar: https://business.facebook.com/latest/content_calendar
- ✅ Select Demonte Contracting page
- ✅ Schedule posts directly

**With Your System:**
- ✅ Connect Demonte Contracting's page via OAuth
- ✅ Schedule posts via API (I just added this support)
- ✅ All posts tracked in your database

**Ready to schedule!** 🚀
