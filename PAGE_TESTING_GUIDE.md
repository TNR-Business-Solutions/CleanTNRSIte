# 🧪 Page Testing Guide

## Prerequisites
1. **Start the server** using one of these methods:
   - Double-click `START-SERVER.bat`
   - Or run: `node serve-clean.js`
   - Server should start on port 8000

2. **Login to admin dashboard**:
   - Navigate to: `http://localhost:8000/admin-login.html`
   - Username: (from your .env file)
   - Password: `TNR2024!`

## Testing Checklist

### ✅ Test 1: Dashboard Navigation
**URL**: `http://localhost:8000/admin-dashboard-v2.html`

**Steps**:
1. Verify all 5 stat cards are visible at the top
2. Hover over each card - should show pointer cursor
3. Click each card and verify navigation:
   - 🌐 Platforms Connected → `/platform-connections.html`
   - 📝 Posts This Month → `/posts-management.html`
   - 💬 Messages Processed → `/messages-management.html`
   - 📊 Analytics Events → `/analytics-events.html`
   - 🔔 Active Webhooks → `/webhooks-management.html`

**Expected**: All cards should navigate to their respective pages

---

### ✅ Test 2: Platform Connections Page
**URL**: `http://localhost:8000/platform-connections.html`

**What to check**:
- [ ] Page loads without errors
- [ ] Header shows "🌐 Platform Connections"
- [ ] Two columns visible: "Connected Platforms" and "Available to Connect"
- [ ] Platform cards show with icons and names
- [ ] "Back to Dashboard" button works
- [ ] "Refresh" button works
- [ ] Connected platforms show "✓ Connected" badge
- [ ] Available platforms show "⏳ Not Connected" badge
- [ ] Connect/Manage buttons are clickable
- [ ] Responsive on mobile (resize browser)

**Expected**: Page displays connected and available platforms correctly

---

### ✅ Test 3: Posts Management Page
**URL**: `http://localhost:8000/posts-management.html`

**What to check**:
- [ ] Page loads without errors
- [ ] Header shows "📝 Posts This Month"
- [ ] Stats cards show: Total Posts, Published, Scheduled, Total Engagement
- [ ] Filters section visible (Platform, Status, Date Range, Search)
- [ ] Posts list area visible (may show empty state)
- [ ] "Back to Dashboard" button works
- [ ] "Refresh" button works
- [ ] Filters are functional (try selecting different options)
- [ ] Empty state message shows if no posts
- [ ] Responsive design works

**Expected**: Page displays posts management interface with filters

---

### ✅ Test 4: Messages Management Page
**URL**: `http://localhost:8000/messages-management.html`

**What to check**:
- [ ] Page loads without errors
- [ ] Header shows "💬 Messages Processed"
- [ ] Stats cards show: Total Messages, Incoming, Outgoing, Avg Response Time
- [ ] Filters section visible (Platform, Direction, Status, Search)
- [ ] Messages list area visible (may show empty state)
- [ ] "Back to Dashboard" button works
- [ ] "Refresh" button works
- [ ] Filters are functional
- [ ] Empty state message shows if no messages
- [ ] Responsive design works

**Expected**: Page displays messages management interface

---

### ✅ Test 5: Analytics Events Page
**URL**: `http://localhost:8000/analytics-events.html`

**What to check**:
- [ ] Page loads without errors
- [ ] Header shows "📊 Analytics Events"
- [ ] Stats cards show: Total Events, Page Views, Clicks, Conversions
- [ ] Filters section visible (Event Type, Date Range, Page, Search)
- [ ] Events list area visible (may show empty state)
- [ ] "Back to Dashboard" button works
- [ ] "Refresh" button works
- [ ] Filters are functional
- [ ] Empty state message shows if no events
- [ ] Responsive design works

**Expected**: Page displays analytics events interface

---

### ✅ Test 6: Webhooks Management Page
**URL**: `http://localhost:8000/webhooks-management.html`

**What to check**:
- [ ] Page loads without errors
- [ ] Header shows "🔔 Active Webhooks"
- [ ] Stats cards show: Total Webhooks, Active, Total Calls, Failed Calls
- [ ] Webhooks list shows 5 webhooks:
  - Wix Blog Category Webhook
  - Meta/Facebook Webhooks
  - WhatsApp Business Webhooks
  - Instagram Business Webhooks
  - Wix SEO Keywords Extension
- [ ] Each webhook shows status badge (✓ Active)
- [ ] "Test", "Logs", "Enable/Disable" buttons visible
- [ ] "Back to Dashboard" button works
- [ ] "Refresh" button works
- [ ] Webhook URLs are displayed
- [ ] Events list shows for each webhook
- [ ] Responsive design works

**Expected**: Page displays all 5 webhooks with management options

---

### ✅ Test 7: Navigation & Authentication
**What to check**:
- [ ] All pages have admin header menu
- [ ] Header links work (Home, Dashboard, etc.)
- [ ] Active page is highlighted in header
- [ ] Logout button works on all pages
- [ ] If not logged in, pages redirect to login
- [ ] After login, can access all pages

**Expected**: Navigation works consistently across all pages

---

### ✅ Test 8: Responsive Design
**What to check** (resize browser to mobile width ~375px):
- [ ] All pages adapt to mobile layout
- [ ] Stats grids become single column
- [ ] Filters stack vertically
- [ ] Lists remain readable
- [ ] Buttons are touch-friendly
- [ ] Header menu wraps properly

**Expected**: All pages are mobile-responsive

---

### ✅ Test 9: Keyboard Accessibility
**What to check**:
- [ ] Tab through stat cards on dashboard
- [ ] Press Enter/Space on stat cards - should navigate
- [ ] All buttons are keyboard accessible
- [ ] Focus indicators visible

**Expected**: All interactive elements are keyboard accessible

---

## Common Issues & Solutions

### Issue: "Cannot GET /page-name.html"
**Solution**: Server not running or file not found. Check:
- Server is running on port 8000
- File exists in root directory
- Check browser console for errors

### Issue: "Redirected to login page"
**Solution**: Session expired. Re-login and try again.

### Issue: "Empty state showing"
**Solution**: This is expected if no data exists. Pages are ready for API integration.

### Issue: "Styles not loading"
**Solution**: Check that `assets/styles.css` exists and server is serving static files correctly.

---

## Test Results Template

```
Date: ___________
Tester: ___________

✅ Dashboard Navigation: [ ] Pass [ ] Fail
✅ Platform Connections: [ ] Pass [ ] Fail
✅ Posts Management: [ ] Pass [ ] Fail
✅ Messages Management: [ ] Pass [ ] Fail
✅ Analytics Events: [ ] Pass [ ] Fail
✅ Webhooks Management: [ ] Pass [ ] Fail
✅ Navigation & Auth: [ ] Pass [ ] Fail
✅ Responsive Design: [ ] Pass [ ] Fail
✅ Keyboard Access: [ ] Pass [ ] Fail

Notes:
_______________________________________
_______________________________________
_______________________________________
```

---

## Next Steps After Testing

Once all pages are verified:
1. ✅ Integrate API endpoints for real data
2. ✅ Add error handling for API failures
3. ✅ Implement real-time updates
4. ✅ Add pagination for large datasets
5. ✅ Add export functionality

---

**Ready to test!** Start the server and follow this guide.
