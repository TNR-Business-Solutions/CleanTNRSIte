# 🔧 Troubleshooting - Dashboard Error

## The Error You're Seeing

The dashboard is trying to load the client list but can't connect to the API. This means:
1. Server might not be running
2. Server might have crashed
3. API endpoint isn't responding

---

## ✅ SOLUTION - Restart Server Properly

### **Option 1: Use the Batch File (Easiest)**

1. **Go to your project folder:**
   ```
   C:\Users\roytu\Desktop\clean-site\server
   ```

2. **Double-click:**
   ```
   START-SERVER-SIMPLE.bat
   ```

3. **You should see:**
   ```
   ╔═══════════════════════════════════════════════════════╗
   ║         🚀 WIX AUTOMATION SERVER STARTED! 🚀         ║
   ╚═══════════════════════════════════════════════════════╝
   
   📍 Server running at: http://localhost:3000
   ```

4. **Keep that window open!** Don't close it.

5. **Now refresh your browser:**
   ```
   http://localhost:3000/wix-client-dashboard.html
   ```

---

### **Option 2: Manual Command Line**

1. **Open PowerShell or Command Prompt**

2. **Kill any old Node processes:**
   ```powershell
   taskkill /F /IM node.exe
   ```

3. **Navigate to server folder:**
   ```powershell
   cd C:\Users\roytu\Desktop\clean-site\server
   ```

4. **Start the server:**
   ```powershell
   node wix-server-standalone.js
   ```

5. **Wait for startup message:**
   ```
   🚀 WIX AUTOMATION SERVER STARTED!
   Server running at: http://localhost:3000
   ```

6. **Leave that terminal open** and go to your browser

7. **Refresh the dashboard:**
   ```
   http://localhost:3000/wix-client-dashboard.html
   ```

---

## ✅ Verify It's Working

### Test 1: Health Check
Open in browser:
```
http://localhost:3000/health
```

**Expected:** JSON response with `"status": "ok"`

### Test 2: API Endpoint
Open in browser:
```
http://localhost:3000/api/wix?action=listClients
```

**Expected:** JSON response with `"success": true, "clients": []`

### Test 3: Dashboard
Open in browser:
```
http://localhost:3000/wix-client-dashboard.html
```

**Expected:** Dashboard loads without errors

---

## 🐛 Common Issues

### Issue 1: "Port 3000 already in use"

**Solution:**
```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start server again
node wix-server-standalone.js
```

### Issue 2: Dashboard shows "Error loading clients"

**Cause:** Server isn't running or API endpoint not working

**Solution:**
1. Check server terminal - should show startup messages
2. Test health endpoint: `http://localhost:3000/health`
3. If no response, restart server

### Issue 3: "Cannot find module"

**Solution:**
```powershell
# Install dependencies
cd C:\Users\roytu\Desktop\clean-site\server
npm install
```

### Issue 4: Nothing happens when starting server

**Solution:**
1. Make sure you're in the `server` folder
2. Check Node.js is installed: `node --version`
3. Try: `node wix-server-standalone.js 2>&1 | Out-Host`

---

## 📋 Step-by-Step Checklist

Follow these steps in order:

- [ ] Open PowerShell/Command Prompt
- [ ] Run: `taskkill /F /IM node.exe`
- [ ] Run: `cd C:\Users\roytu\Desktop\clean-site\server`
- [ ] Run: `node wix-server-standalone.js`
- [ ] **Wait for "SERVER STARTED" message**
- [ ] **Keep that window open**
- [ ] Open browser
- [ ] Go to: `http://localhost:3000/health`
- [ ] Should see: `{"status": "ok"}`
- [ ] Go to: `http://localhost:3000/wix-client-dashboard.html`
- [ ] Dashboard should load without errors
- [ ] Click "Connect New Wix Client"
- [ ] Enter: `shesallthatandmore`
- [ ] Complete OAuth flow

---

## 🎯 Quick Test Script

Copy and paste this entire block into PowerShell:

```powershell
# Kill old processes
taskkill /F /IM node.exe 2>$null

# Wait
Start-Sleep -Seconds 2

# Navigate to server
cd C:\Users\roytu\Desktop\clean-site\server

# Start server
Write-Host "Starting Wix Automation Server..." -ForegroundColor Green
node wix-server-standalone.js
```

---

## 💡 Important Notes

1. **Keep Server Window Open** - The server only runs while that terminal window is open

2. **One Server at a Time** - Don't start multiple servers on port 3000

3. **Check for Errors** - Watch the server terminal for error messages

4. **Refresh Browser** - After restarting server, refresh your browser

5. **Clear Cache** - If still having issues, clear browser cache (Ctrl+Shift+Delete)

---

## ✅ Success Indicators

When everything is working, you should see:

**In Terminal:**
```
🚀 WIX AUTOMATION SERVER STARTED!
📍 Server running at: http://localhost:3000
✅ Ready to connect Wix clients!
```

**In Browser (health endpoint):**
```json
{
  "status": "ok",
  "message": "Wix Automation Server is running!",
  "wixHandlersLoaded": true
}
```

**In Browser (dashboard):**
- Dashboard loads
- No JavaScript errors in console (F12)
- "Total Clients: 0" (or number of connected clients)
- All buttons work

---

## 🆘 Still Not Working?

If you've tried everything above:

1. **Restart your computer** - Sometimes helps with port/process issues

2. **Check antivirus/firewall** - Might be blocking Node.js

3. **Try different port** - Edit `wix-server-standalone.js` and change `PORT = 3000` to `PORT = 3001`

4. **Reinstall dependencies:**
   ```powershell
   cd C:\Users\roytu\Desktop\clean-site\server
   Remove-Item node_modules -Recurse -Force
   npm install
   ```

---

**Once the server is running properly, the dashboard will work and you can connect clients!** 🚀

