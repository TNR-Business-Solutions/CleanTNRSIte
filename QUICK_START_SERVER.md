# 🚀 Quick Start Server on Port 3000

## The Problem
Server isn't running, so you get "ERR_CONNECTION_REFUSED"

## The Solution

### Step 1: Open Command Prompt
- Press `Win + R`
- Type `cmd` and press Enter

### Step 2: Navigate to Project
```batch
cd c:\Users\roytu\Desktop\clean-site
```

### Step 3: Install Dependencies (if needed)
```batch
npm install
```

### Step 4: Start Server
```batch
set PORT=3000
node serve-clean.js
```

**OR** just double-click: **`START-SERVER.bat`**

## What You Should See

When the server starts successfully, you'll see:
```
🚀 Server running on http://localhost:3000
📊 Admin Dashboard: http://localhost:3000/admin-dashboard-v2.html
```

**Keep this window open!** Closing it stops the server.

## Verify It's Working

1. **Check the console** - Should show "Server running on http://localhost:3000"
2. **Open browser** - Go to `http://localhost:3000/admin-dashboard-v2.html`
3. **Check port** - Run: `netstat -ano | findstr :3000` (should show LISTENING)

## If It Still Doesn't Work

1. **Check for errors** in the console window
2. **Make sure Node.js is installed**: `node -v`
3. **Install dependencies**: `npm install`
4. **Try a different port**: Change `PORT=3000` to `PORT=3001`

---

**The server MUST be running for the website to work!**
