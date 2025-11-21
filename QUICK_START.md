# Quick Start Guide - TNR Integration Testing

## 🚀 Fastest Way to Start Testing

### **Option 1: Simple Server Start (RECOMMENDED)**

**Just double-click:**
```
START-SERVER.bat
```

That's it! Server will start on http://localhost:3000

---

### **Option 2: Manual Start**

```powershell
# Open PowerShell (no admin needed)
cd C:\Users\roytu\Desktop\clean-site\server
node index.js
```

Server runs on http://localhost:3000

---

## 📋 Testing Checklist (Do in Order)

### ✅ **Step 1: Start Server**
- Double-click `START-SERVER.bat`
- Wait for "Server started on port 3000"

### ✅ **Step 2: Test Server**
- Open browser: http://localhost:3000
- Should see "Go to Dashboard" link

### ✅ **Step 3: Connect Wix**
```
1. Open: http://localhost:3000/api/auth/wix
2. Sign in to Wix
3. Connect: shesallthatandmore.com
4. Authorize app
```

### ✅ **Step 4: Test Wix Features**
```
1. Open: http://localhost:3000/wix-client-dashboard.html
2. Select site
3. Click "SEO Manager"
4. Click "Run Full SEO Audit" ← TEST
5. Click "E-commerce Manager"  
6. Click "Sync Products" ← TEST
```

### ✅ **Step 5: Connect Facebook**
```
1. Open: http://localhost:3000/api/auth/meta
2. Sign in to Facebook
3. Select "TNR Business Solutions" Page
4. Grant ALL permissions
```

### ✅ **Step 6: Test Social Media**
```
1. Open: http://localhost:3000/social-media-automation-dashboard.html
2. Post to Facebook ← TEST
3. Post to Instagram ← TEST
```

### ✅ **Step 7: Connect LinkedIn**
```
1. Open: http://localhost:3000/api/auth/linkedin
2. Authorize
3. Test posting from dashboard
```

### ✅ **Step 8: Connect Twitter**
```
1. Open: http://localhost:3000/api/auth/twitter
2. Authorize
3. Test posting from dashboard
```

---

## 🔧 Troubleshooting

### **"Server won't start"**
```powershell
# Check if port 3000 is in use:
netstat -ano | findstr :3000

# Kill the process:
taskkill /F /PID [PID_NUMBER]

# Then restart server
```

### **"OAuth fails"**
Check `.env` file exists with:
```env
WIX_APP_ID=9901133d-7490-4e6e-adfd-cb11615cc5e4
WIX_APP_SECRET=87fd621b-f3d2-4b2f-b085-2c4f00a17b97
META_APP_ID=2201740210361183
META_APP_SECRET=8bb683dbc591772f9fe6dada7e2d792b
```

### **"Can't post to Facebook"**
```
1. Check permissions:
   http://localhost:3000/api/social/check-facebook-permissions
   
2. If missing permissions, reconnect:
   http://localhost:3000/api/auth/meta
```

---

## 📊 Quick URLs

| Feature | URL |
|---------|-----|
| **Admin Dashboard** | http://localhost:3000/admin-dashboard-v2.html |
| **Social Media Dashboard** | http://localhost:3000/social-media-automation-dashboard.html |
| **Wix Dashboard** | http://localhost:3000/wix-client-dashboard.html |
| **Wix OAuth** | http://localhost:3000/api/auth/wix |
| **Facebook OAuth** | http://localhost:3000/api/auth/meta |
| **LinkedIn OAuth** | http://localhost:3000/api/auth/linkedin |
| **Twitter OAuth** | http://localhost:3000/api/auth/twitter |
| **Check FB Permissions** | http://localhost:3000/api/social/check-facebook-permissions |

---

## ✅ Success = All These Work:

**Wix (shesallthatandmore.com):**
- [ ] Site connected
- [ ] SEO audit runs
- [ ] Products load from store

**Facebook (TNR Business Solutions):**
- [ ] Can post successfully
- [ ] Posts appear on Facebook Page

**Instagram (TNR Business Solutions):**
- [ ] Can post successfully
- [ ] Posts appear on Instagram

**LinkedIn:**
- [ ] Connected
- [ ] Can post

**Twitter:**
- [ ] Connected
- [ ] Can post

---

## 🎯 Expected Timeline

- **Server Start:** 30 seconds
- **Each OAuth:** 2-3 minutes
- **Testing each feature:** 5 minutes
- **Total:** ~30 minutes for complete testing

---

## 💡 Tips

1. **Keep server window open** while testing
2. **Test one platform at a time**
3. **Check for error messages** in browser console (F12)
4. **If something fails**, check server window for logs
5. **Re-run OAuth** if permissions seem wrong

---

**Just start the server and follow the checklist!** ✨

Everything is already coded and deployed. You just need to:
1. Start server
2. Complete OAuth flows
3. Test features
4. Check they all work

That's it! 🚀

