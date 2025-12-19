# Wix Connection Guide 2025

## Using Latest Wix Dev Mode Features

Based on the latest Wix developer documentation (dev.wix.com), here's how to properly connect your Wix sites.

## 🔑 Key Changes in 2024-2025

1. **Wix IDE** - VS Code-based online development environment
2. **Wix CLI** - Command-line interface for local development  
3. **Test Instance Support** - Free Premium development site for testing
4. **Improved OAuth Flow** - Better token management and refresh
5. **Metasite ID vs Instance ID** - Important distinction for REST API calls

## 📋 Connection Methods

### Method 1: Standard OAuth Flow (Recommended)

1. **Start the server:**

   ```bash
   node server/index.js
   ```

2. **Open the Wix Client Dashboard:**
   - Navigate to: `http://localhost:3000/wix-client-dashboard.html`
   - Or in production: `https://www.tnrbusinesssolutions.com/wix-client-dashboard.html`

3. **Connect a Wix Client:**
   - Click "Connect New Wix Client"
   - You'll be redirected to Wix OAuth
   - Authorize the app
   - You'll be redirected back with tokens

4. **Verify Connection:**

   ```bash
   node check-wix-tokens.js
   ```

### Method 2: Using Wix Test Instance (New Feature)

Wix now provides a free Premium development site for testing:

1. **Get Test Instance:**
   - Go to: <https://developers.wixanswers.com/kb/en/article/how-to-test-your-app-on-a-free-premium-development-site>
   - Request access to the test site
   - Use the provided instance ID

2. **Connect Test Instance:**
   - Use the same OAuth flow as Method 1
   - The test instance will work the same as a regular site

### Method 3: Wix CLI (For Headless Development)

If you're building a headless project:

```bash
# Install Wix CLI
npm install -g @wix/cli

# Login to Wix
wix login

# Create a new project
wix create

# Start development
wix dev
```

## 🔧 Troubleshooting

### Issue: "No tokens found for instance"

**Solution:**

1. Tokens are stored in the database, not just memory
2. Make sure the server is running when connecting
3. Check that tokens are being saved:

   ```bash
   node check-wix-tokens.js
   ```

### Issue: "Instance ID not found"

**Solution:**

1. The instance ID from OAuth callback is the correct one
2. Make sure you're using the instance ID from the dashboard
3. Check metadata for metasite ID (may be different)

### Issue: "Token expired"

**Solution:**

1. Tokens auto-refresh, but if refresh fails:
2. Reconnect the client through the dashboard
3. The refresh token should be stored in the database

## 📊 Instance ID vs Metasite ID

**Important:** In Wix REST API:

- **Instance ID** - Used for OAuth and app installation
- **Metasite ID** - Used for REST API calls (often the same as instance ID)

The code automatically handles this by:

1. Extracting metasite ID from JWT token
2. Storing it in metadata
3. Using it for API calls

## 🧪 Testing Connection

Use the improved test script:

```bash
node test-wix-connection-improved.js <instanceId>
```

Example:

```bash
node test-wix-connection-improved.js b1a11299-b3ef-4aaa-bb2d-636fea489608
```

## 📚 Resources

- **Wix REST API Docs:** <https://dev.wix.com/docs/rest>
- **Wix CLI Docs:** <https://dev.wix.com/docs/wix-cli>
- **Wix IDE Docs:** <https://dev.wix.com/docs/develop-websites/articles/workspace-tools/velo-workspace/wix-ide>
- **Test Instance Guide:** <https://developers.wixanswers.com/kb/en/article/how-to-test-your-app-on-a-free-premium-development-site>

## ✅ Next Steps

1. **Start the server** (if not running)
2. **Open the dashboard** and connect a client
3. **Verify tokens** are saved to database
4. **Test the connection** using the improved test script
5. **Build the site** using the build script
