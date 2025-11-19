# ⚡ Wix Automation App - Quick Start Guide

## 🎯 Goal
Get your Wix automation app up and running in 5 minutes and connect www.shesallthatandmore.com

---

## ✅ Step-by-Step Instructions

### 1. Start the Server (30 seconds)

Open terminal and run:
```bash
npm run server
```

You should see:
```
HTTP server listening on http://localhost:3000
```

✅ **Leave this terminal running!**

---

### 2. Open the Dashboard (10 seconds)

Open your web browser and go to:
```
http://localhost:3000/wix-client-dashboard.html
```

You should see:
- "🚀 Wix Client Management Dashboard" header
- Stats showing 0 clients
- "Connect New Wix Client" button

---

### 3. Connect www.shesallthatandmore.com (2 minutes)

#### Option A: Via Dashboard Button
1. Click **"Connect New Wix Client"**
2. Enter identifier: `shesallthatandmore`
3. Click OK

#### Option B: Direct URL
Navigate to:
```
http://localhost:3000/api/auth/wix?clientId=shesallthatandmore
```

#### What Happens Next:
1. You'll be redirected to Wix OAuth page
2. **Log in** with the Wix account that owns www.shesallthatandmore.com
3. **Click "Authorize"** to grant permissions
4. You'll be redirected back to the dashboard
5. **Done!** The client now appears in your client list

---

### 4. Run SEO Audit (1 minute)

1. In the dashboard, find the **shesallthatandmore** client
2. Click the **"SEO"** button
3. Click **"Run Full SEO Audit"**
4. Review the audit results

**Expected Results:**
- Total pages count
- Pages with SEO issues
- Specific recommendations for each page

---

### 5. View Products (1 minute)

1. Go back to main dashboard
2. Click the **"Store"** button for shesallthatandmore
3. Products will load automatically
4. Try the advanced filters:
   - Set price range
   - Filter by stock status
   - Click "Apply Filters"

---

## 🎉 Success Checklist

After completing the steps above, you should have:

- [x] Server running on http://localhost:3000
- [x] Dashboard accessible
- [x] www.shesallthatandmore.com connected
- [x] Client appears in dashboard with "Active" status
- [x] SEO audit completed successfully
- [x] Products visible in e-commerce manager
- [x] Advanced filters working

---

## 🔧 Troubleshooting

### Server won't start
```bash
# Make sure you're in the right directory
cd server
node index.js
```

### Can't access dashboard
- Make sure server is running
- Check you're using `http://localhost:3000` (not another port)
- Try restarting the server

### OAuth redirect fails
- Check Wix app settings: https://dev.wix.com/apps/
- Verify redirect URI is: `http://localhost:3000/api/auth/wix/callback`
- Make sure you're logged into the correct Wix account

### Client shows "Expired" status
- Click "Connect New Wix Client" again
- Complete OAuth flow
- Token will auto-refresh

---

## 📊 What to Do Next

### For www.shesallthatandmore.com:

#### 1. **SEO Upgrade** (Priority)
```
✅ Run SEO audit
✅ Review issues found
✅ Update site-wide SEO settings
✅ Fix page-specific issues
✅ Add structured data to products
```

#### 2. **Advanced Product Filtering** (Priority)
```
✅ Test existing filters
✅ Set up custom filters for client needs
✅ Implement on their live site
```

#### 3. **Multi-Platform Integration** (Future)
```
✅ Review product catalog
✅ Prepare for Shopify sync
✅ Test sync functionality
```

### For Future Clients:

1. Click "Connect New Wix Client"
2. Enter their unique identifier
3. Complete OAuth flow
4. Manage from dashboard

---

## 🧪 Testing

Run the automated test suite:
```bash
npm run test:wix
```

Expected output:
```
✅ Server is running and healthy
✅ Dashboard accessibility tests passed
✅ OAuth endpoints working
✅ Client management API working
✅ SEO module ready
✅ E-commerce module ready
✅ Advanced filtering ready

🎉 All tests passed!
```

---

## 📱 Access Points

| Feature | URL |
|---------|-----|
| **Main Dashboard** | http://localhost:3000/wix-client-dashboard.html |
| **SEO Manager** | http://localhost:3000/wix-seo-manager.html |
| **E-commerce Manager** | http://localhost:3000/wix-ecommerce-manager.html |
| **Connect Client** | http://localhost:3000/api/auth/wix?clientId=CLIENT_ID |
| **API Endpoint** | http://localhost:3000/api/wix |

---

## 🚀 Deploy to Production

When ready to deploy:

1. **Add to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables in Vercel:**
   ```
   WIX_APP_ID=9901133d-7490-4e6e-adfd-cb11615cc5e4
   WIX_APP_SECRET=87fd621b-f3d2-4b2f-b085-2c4f00a17b97
   WIX_REDIRECT_URI=https://yourdomain.com/api/auth/wix/callback
   ```

3. **Update Wix App Redirect URI:**
   - Go to: https://dev.wix.com/apps/
   - Change redirect URI to your production URL

4. **Test OAuth Flow:**
   - Connect a test client
   - Verify everything works

---

## 📚 Full Documentation

For complete documentation, see:
- **WIX_APP_README.md** - Complete reference
- **WIX_AUTOMATION_SETUP_GUIDE.md** - Detailed setup guide

---

## 💡 Pro Tips

1. **Use meaningful client IDs** - Use their domain name or business name
2. **Test locally first** - Always test before deploying
3. **Monitor server logs** - Watch for errors in the terminal
4. **Tokens auto-refresh** - No need to manually manage tokens
5. **Bookmark the dashboard** - For quick access

---

## ⏱️ Time Breakdown

- Server setup: **30 seconds**
- Dashboard access: **10 seconds**
- Client connection: **2 minutes**
- SEO audit: **1 minute**
- Product review: **1 minute**

**Total Time: ~5 minutes** ⚡

---

## 🎯 Your Current Goal

**Immediate:** Get www.shesallthatandmore.com connected and audited  
**Next:** Implement SEO improvements and advanced filtering  
**Future:** Scale to manage multiple Wix clients

---

**Ready? Let's go! 🚀**

Start with Step 1 above and you'll be up and running in minutes!

