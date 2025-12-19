# 🧪 Manual Testing Guide - Platform Modal

## Quick Test Instructions

### Step 1: Start the Server

**Option A: Using Node.js (Recommended)**
```bash
cd c:\Users\roytu\Desktop\clean-site
npm start
```
Server will start on `http://localhost:3000`

**Option B: Using Python (Alternative)**
```bash
cd c:\Users\roytu\Desktop\clean-site
python -m http.server 8000
```
Server will start on `http://localhost:8000`

### Step 2: Open the Dashboard

1. Open your browser
2. Navigate to: `http://localhost:3000/admin-dashboard-v2.html` (or port 8000 if using Python)
3. **Note**: You may need to login first at `http://localhost:3000/admin-login.html`
   - Username: Check your `.env` file for `ADMIN_USERNAME` (default: `admin`)
   - Password: Check your `.env` file for `ADMIN_PASSWORD` (default: `TNR2024!`)

### Step 3: Test the Platform Modal

#### Test 1: Click the Platforms Connected Card
1. Look at the top stats section
2. Find the card showing "🌐 Platforms Connected" with a number (currently shows "8")
3. **Click on the card**
4. **Expected**: A modal should open showing platform connections

#### Test 2: Verify Modal Content
**Left Side - Connected Platforms:**
- Should show: Wix, Meta/Facebook, LinkedIn, Twitter/X, Pinterest
- Each should have a green "✓ Connected" badge
- Each should have a "🔧 Manage" button

**Right Side - Available to Connect:**
- Should show: Threads, WhatsApp Business, Instagram Business
- Each should have an orange "⏳ Not Connected" badge
- Each should have a "🔗 Connect" or "⚙️ Setup" button

#### Test 3: Test Modal Interactions
1. **Close Button**: Click the "×" button in top-right
   - **Expected**: Modal closes

2. **Click Outside**: Click anywhere outside the modal (on the dark overlay)
   - **Expected**: Modal closes

3. **Keyboard Navigation**: 
   - Tab to the Platforms Connected card
   - Press Enter or Space
   - **Expected**: Modal opens

4. **Connect Button**: Click "🔗 Connect" on an available platform
   - **Expected**: Should navigate to OAuth URL or setup guide

5. **Manage Button**: Click "🔧 Manage" on a connected platform
   - **Expected**: Should navigate to platform management dashboard

### Step 4: Check Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for any errors
4. **Expected**: No errors, may see API calls to `/api/social/tokens`

### Step 5: Test API Integration

1. Open Developer Tools (F12)
2. Go to Network tab
3. Click the Platforms Connected card
4. Look for a request to `/api/social/tokens`
5. **Expected**: 
   - Request should be made
   - Response should be `{ success: true, tokens: [...] }` or error with fallback

---

## ✅ Expected Results

### Visual Appearance
- ✅ Modal has gradient background matching dashboard
- ✅ Two columns side-by-side (stacks on mobile)
- ✅ Platform icons visible (🏢, 📘, 💼, 🐦, etc.)
- ✅ Status badges are color-coded (green/orange)
- ✅ Buttons are clearly visible and clickable
- ✅ Smooth animations on open/close

### Functionality
- ✅ Modal opens when card is clicked
- ✅ Modal closes with X button
- ✅ Modal closes when clicking outside
- ✅ Keyboard navigation works
- ✅ Platform lists are populated
- ✅ Connect/Manage buttons work
- ✅ API call is made (check Network tab)

### Error Handling
- ✅ If API fails, falls back to static definitions
- ✅ Loading state shows "Loading..." initially
- ✅ Empty states show appropriate messages

---

## 🐛 Troubleshooting

### Modal Doesn't Open
- Check browser console for JavaScript errors
- Verify `showPlatformsModal()` function exists
- Check if modal HTML element exists in page source

### API Call Fails
- Check Network tab for `/api/social/tokens` request
- Verify server is running
- Check if database is initialized
- Modal should still work with fallback data

### Platforms Not Showing
- Check browser console for errors
- Verify `platformDefinitions` object exists
- Check if `renderPlatformList()` function is working

### Styling Issues
- Check if CSS is loaded
- Verify modal styles are in the `<style>` tag
- Check browser compatibility (modern browsers only)

---

## 📸 What You Should See

### Before Clicking:
- Stats card showing "🌐 Platforms Connected" with number "8"
- Card should have hover effect (slight lift on hover)
- Cursor should change to pointer on hover

### After Clicking:
- Dark overlay covering the page
- Modal in center with:
  - Header: "🌐 Platform Connections" with X button
  - Left column: "✅ Connected Platforms" heading
  - Right column: "🔗 Available to Connect" heading
  - Platform list items with icons, names, badges, and buttons

---

## 🎯 Success Criteria

✅ **All tests pass if:**
1. Modal opens when card is clicked
2. Both columns show platforms correctly
3. Status badges are accurate
4. Buttons are functional
5. Modal closes properly
6. No JavaScript errors in console
7. API call is made (or graceful fallback)

---

**Ready to test!** Start the server and follow the steps above.
