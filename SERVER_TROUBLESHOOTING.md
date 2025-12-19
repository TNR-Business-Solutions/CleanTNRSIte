# 🔧 Server Troubleshooting Guide

## Server Not Starting on Port 3000

### Quick Fixes:

#### 1. Check if Port 3000 is Already in Use
```bash
netstat -ano | findstr :3000
```
If something is using port 3000, either:
- Stop that process
- Change PORT in `.env` file to another port (e.g., 3001)

#### 2. Start Server Manually
**Option A: Double-click the batch file**
- Double-click `start-server.bat` in the project folder
- A window will open showing server logs

**Option B: Command Line**
```bash
cd c:\Users\roytu\Desktop\clean-site
npm start
```

**Option C: Direct Node**
```bash
cd c:\Users\roytu\Desktop\clean-site
node serve-clean.js
```

#### 3. Check for Errors
Look for error messages in the server window:
- Missing dependencies? Run: `npm install`
- Port already in use? Change PORT in `.env`
- Syntax errors? Check the console output

#### 4. Verify Server Started
You should see:
```
🚀 Server running on http://localhost:3000
📊 Admin Dashboard: http://localhost:3000/admin-dashboard-v2.html
```

#### 5. Test Connection
Open browser and go to:
- `http://localhost:3000` (home page)
- `http://localhost:3000/admin-login.html` (login page)

### Common Issues:

**Issue: "Port 3000 already in use"**
- Solution: Kill the process using port 3000 or change PORT

**Issue: "Cannot find module"**
- Solution: Run `npm install` to install dependencies

**Issue: "EADDRINUSE"**
- Solution: Another server is running on port 3000

**Issue: Server starts but browser shows "Connection Refused"**
- Check Windows Firewall
- Verify server is actually listening (check netstat)
- Try `127.0.0.1:3000` instead of `localhost:3000`

### Alternative: Use Different Port

Create/update `.env` file:
```
PORT=3001
```

Then access: `http://localhost:3001`

---

**Need Help?** Check the server console window for specific error messages.
