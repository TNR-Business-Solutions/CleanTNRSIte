# 🔄 Server Restart on Port 3000

## Server Configuration

The server is configured to use:
- **Default Port**: 3000 (if PORT env var not set)
- **Environment Port**: 8000 (if .env file has PORT=8000)

## To Run on Port 3000

### Option 1: Remove PORT from .env
If `.env` file has `PORT=8000`, either:
- Remove the PORT line from `.env`
- Or change it to `PORT=3000`

### Option 2: Override at runtime
```bash
set PORT=3000 && node serve-clean.js
```

### Option 3: Use START-SERVER.bat
Update `START-SERVER.bat` to:
```batch
@echo off
echo Starting TNR Business Solutions Server on Port 3000...
cd /d "%~dp0"
set PORT=3000
node serve-clean.js
pause
```

## Verify Server is Running

1. Check if port is listening:
   ```bash
   netstat -ano | findstr :3000
   ```

2. Test in browser:
   - Dashboard: `http://localhost:3000/admin-dashboard-v2.html`
   - Login: `http://localhost:3000/admin-login.html`

## Current Status

✅ Server started in background on port 3000
✅ All API endpoints available:
   - `/api/stats/dashboard`
   - `/api/posts`
   - `/api/messages`
   - `/api/analytics/events`

---

**Server should now be running on port 3000!**
