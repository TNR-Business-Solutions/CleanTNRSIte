# 🚀 Server on Port 3000 - Instructions

## Quick Start

### Option 1: Use the New Batch File (Recommended)
Double-click: **`START-SERVER-3000.bat`**

This will:
- Set PORT=3000
- Start the server
- Keep the window open so you can see logs

### Option 2: Manual Start
Open Command Prompt in the project folder and run:
```batch
set PORT=3000
node serve-clean.js
```

### Option 3: Update .env File
If you want port 3000 permanently, update `.env` file:
```
PORT=3000
```

## Verify Server is Running

1. **Check port**: `netstat -ano | findstr :3000`
   - Should show `LISTENING` status

2. **Test in browser**:
   - Home: `http://localhost:3000/`
   - Dashboard: `http://localhost:3000/admin-dashboard-v2.html`
   - Login: `http://localhost:3000/admin-login.html`

## Access URLs (Port 3000)

- **Admin Dashboard**: `http://localhost:3000/admin-dashboard-v2.html`
- **Platform Connections**: `http://localhost:3000/platform-connections.html`
- **Posts Management**: `http://localhost:3000/posts-management.html`
- **Messages Management**: `http://localhost:3000/messages-management.html`
- **Analytics Events**: `http://localhost:3000/analytics-events.html`
- **Webhooks Management**: `http://localhost:3000/webhooks-management.html`

## API Endpoints (Port 3000)

- `/api/stats/dashboard` - Dashboard statistics
- `/api/posts` - Posts management
- `/api/messages` - Messages management
- `/api/analytics/events` - Analytics events

## Troubleshooting

### Server won't start
1. Check if port 3000 is already in use:
   ```batch
   netstat -ano | findstr :3000
   ```
2. Kill any process using port 3000:
   ```batch
   taskkill /F /PID <PID_NUMBER>
   ```
3. Try starting again

### Server starts but exits immediately
- Check console for error messages
- Verify all dependencies are installed: `npm install`
- Check that `serve-clean.js` exists and is valid

### Can't access pages
- Make sure server is running (check netstat)
- Try `http://localhost:3000/` first
- Check browser console for errors

---

**Server should now be running on port 3000!** 🎉
