# 🚀 Wix Dashboard Testing Instructions
## For: "She's All That and More" Site

**Date:** 2025-01-17  
**Admin:** Roy Turner

---

## 📋 Quick Start

### Step 1: Start the Server

Open a PowerShell terminal and run:

```powershell
cd C:\Users\roytu\Desktop\clean-site\server
node index.js
```

You should see:
```
📁 Serving static files from: C:\Users\roytu\Desktop\clean-site
✅ Loaded environment variables from env.local.json
HTTP server listening on http://localhost:3000
```

**Keep this terminal open!**

---

### Step 2: Open the Dashboard

In your browser, navigate to:
```
http://localhost:3000/wix-client-dashboard.html
```

---

### Step 3: Connect "She's All That and More"

1. Click **"Connect New Wix Client"** button
2. Enter client ID: `shesallthatandmore`
3. You'll be redirected to Wix OAuth page
4. Authorize the app
5. You'll be redirected back to the dashboard
6. The client should now appear in the client list

---

## ✅ Verification Checklist

### **1. Dashboard Loads**
- [ ] Dashboard page displays correctly
- [ ] Stats cards show (may show "-" if no clients connected)
- [ ] Quick Actions section visible
- [ ] Client list section visible

### **2. Connect Client**
- [ ] "Connect New Wix Client" button works
- [ ] OAuth flow redirects to Wix
- [ ] After authorization, redirects back
- [ ] Client appears in client list with "● Active" badge
- [ ] Stats update (Total Clients shows 1, Active Connections shows 1)

### **3. SEO Manager**
- [ ] Click "SEO Tools" or "SEO" button on client card
- [ ] SEO Manager page loads
- [ ] Client is pre-selected in dropdown
- [ ] Click "Run Full SEO Audit"
- [ ] Audit results display (may take a moment)
- [ ] Try updating Site SEO settings
- [ ] Success message appears

### **4. E-commerce Manager**
- [ ] Click "E-commerce Manager" or "Store" button on client card
- [ ] E-commerce Manager page loads
- [ ] Client is pre-selected in dropdown
- [ ] Products load and display in grid
- [ ] Try using filters (Min Price, Max Price, In Stock)
- [ ] Filtered products display
- [ ] Collections load in dropdown

### **5. Navigation**
- [ ] Can navigate between all three dashboards
- [ ] Client selection persists when navigating
- [ ] Back buttons work correctly

---

## 🧪 API Testing (Optional)

If you want to test the API directly, open another PowerShell terminal:

### Test Health Endpoint
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health"
```
**Expected:** `{ "status": "ok" }`

### Test Database Connection
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/db/test"
```
**Expected:** JSON with database connection info

### List Connected Clients
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/wix?action=listClients"
```
**Expected:** JSON with clients array

---

## 🐛 Troubleshooting

### Server Won't Start

**Check if port 3000 is in use:**
```powershell
netstat -ano | findstr :3000
```

**Kill processes on port 3000:**
```powershell
# Find the PID from netstat output, then:
Get-Process -Id <PID> | Stop-Process -Force
```

### Dashboard Shows "Error loading clients"

1. Check server terminal for errors
2. Verify database connection works: `http://localhost:3000/api/db/test`
3. Check if any clients are connected

### OAuth Flow Fails

1. Verify Wix App ID and Secret in `server/env.local.json`
2. Check redirect URI in Wix Developer Console matches: `https://localhost:3000/api/auth/wix/callback`
3. Check server logs for specific error messages

### Products Don't Load

1. Verify client is connected (has active token)
2. Check if Wix site has products
3. Check server logs for API errors
4. Verify Wix API permissions include e-commerce access

---

## 📊 What to Test

### **Core Functionality**
1. ✅ Connect a Wix client (OAuth flow)
2. ✅ View connected clients in dashboard
3. ✅ Run SEO audit
4. ✅ Update SEO settings
5. ✅ View products
6. ✅ Filter products
7. ✅ View collections

### **Edge Cases**
1. ⚠️ Connect multiple clients
2. ⚠️ Disconnect and reconnect client
3. ⚠️ Test with expired token (if possible)
4. ⚠️ Test with Wix site that has no products
5. ⚠️ Test with Wix site that has no pages

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

✅ Dashboard Loads: [ ] Pass [ ] Fail
✅ Connect Client: [ ] Pass [ ] Fail
✅ SEO Manager: [ ] Pass [ ] Fail
✅ E-commerce Manager: [ ] Pass [ ] Fail
✅ Navigation: [ ] Pass [ ] Fail

Issues Found:
_______________________________________
_______________________________________
_______________________________________

Notes:
_______________________________________
_______________________________________
```

---

## 🎯 Expected Behavior

### **After Connecting Client:**
- Client appears in dashboard with "● Active" badge
- Stats update: Total Clients = 1, Active Connections = 1
- Can click "SEO" or "Store" buttons to manage that client

### **In SEO Manager:**
- Client pre-selected in dropdown
- Can run SEO audit (shows results)
- Can update site-wide SEO settings
- Success messages appear after updates

### **In E-commerce Manager:**
- Client pre-selected in dropdown
- Products load and display in grid
- Can filter by price, stock, collection
- Collections appear in dropdown

---

## 🚀 Next Steps After Testing

1. **Document any issues** you find
2. **Test with real data** from "She's All That and More" site
3. **Verify SEO changes** appear on the actual Wix site
4. **Verify product data** matches what's in Wix
5. **Test all navigation paths**

---

## 📞 Support

If you encounter issues:
1. Check server terminal for error messages
2. Check browser console (F12) for JavaScript errors
3. Review `WIX_DASHBOARD_VERIFICATION_REPORT.md` for detailed test procedures
4. Check `WIX_APP_README.md` for documentation

---

**Status:** Ready for Testing  
**Last Updated:** 2025-01-17




