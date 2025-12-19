# 🔧 Server Troubleshooting Guide

## Issue: "ERR_CONNECTION_REFUSED" on localhost:3000

This means the server is not running. Follow these steps:

## Step 1: Check if Node.js is Installed

Open Command Prompt and run:
```batch
node -v
```

**Expected**: Should show version number (e.g., `v18.17.0`)
**If error**: Install Node.js from https://nodejs.org/

## Step 2: Check if Dependencies are Installed

In your project folder, run:
```batch
npm install
```

This installs required packages like `dotenv`, `sqlite3`, etc.

## Step 3: Start the Server

### Method A: Use the Batch File (Easiest)
1. Double-click `START-SERVER.bat`
2. A window should open showing server logs
3. Look for: `🚀 Server running on http://localhost:3000`

### Method B: Manual Start
1. Open Command Prompt
2. Navigate to project folder:
   ```batch
   cd c:\Users\roytu\Desktop\clean-site
   ```
3. Set port and start:
   ```batch
   set PORT=3000
   node serve-clean.js
   ```

## Step 4: Verify Server is Running

### Check Port
```batch
netstat -ano | findstr :3000
```
**Expected**: Should show `LISTENING` status

### Check Node Process
```batch
tasklist | findstr node.exe
```
**Expected**: Should show node.exe process

### Test in Browser
- Go to: `http://localhost:3000/`
- Should see your homepage or dashboard

## Common Issues & Solutions

### Issue 1: "Cannot find module 'dotenv'"
**Solution**: Run `npm install` in project folder

### Issue 2: "Port 3000 already in use"
**Solution**: 
1. Find process using port 3000:
   ```batch
   netstat -ano | findstr :3000
   ```
2. Kill the process:
   ```batch
   taskkill /F /PID <PID_NUMBER>
   ```
3. Or use a different port (update .env to PORT=3001)

### Issue 3: "EADDRINUSE: address already in use"
**Solution**: Another server is running on port 3000
- Kill all node processes: `taskkill /F /IM node.exe`
- Wait a few seconds
- Start server again

### Issue 4: Server starts but exits immediately
**Possible causes**:
- Missing dependencies (run `npm install`)
- Syntax error in serve-clean.js
- Database initialization error

**Solution**: Check the console output for error messages

### Issue 5: ".env file not found"
**Solution**: This is OK - server will use default port 3000

## Quick Test

Run this to test if server can start:
```batch
cd c:\Users\roytu\Desktop\clean-site
set PORT=3000
node serve-clean.js
```

**Expected output**:
```
🚀 Server running on http://localhost:3000
📊 Admin Dashboard: http://localhost:3000/admin-dashboard-v2.html
```

If you see this, the server is running! Keep this window open.

## Still Not Working?

1. **Check Windows Firewall**: May be blocking port 3000
2. **Try different port**: Change to 3001 or 8080
3. **Check antivirus**: May be blocking Node.js
4. **Run as Administrator**: Right-click Command Prompt → Run as Administrator

---

**Need more help?** Share the error message you see when running `node serve-clean.js`
