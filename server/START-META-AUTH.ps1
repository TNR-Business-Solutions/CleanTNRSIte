# ================================
# TNR Meta OAuth Server Startup
# Simple LocalTunnel solution
# ================================

Write-Host "`n=== TNR Meta Authentication Server ===" -ForegroundColor Cyan

# Kill any existing processes
Write-Host "Stopping any existing Node/LocalTunnel processes..." -ForegroundColor Yellow
Get-Process node, lt -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Step 1: Start LocalTunnel in background
Write-Host "`n=== Starting LocalTunnel ===" -ForegroundColor Green
Write-Host "Opening tunnel to port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoLogo", "-NoProfile", "-Command", "npx localtunnel --port 3000 --print-requests"
Start-Sleep -Seconds 5

Write-Host "`n=== IMPORTANT ===" -ForegroundColor Yellow
Write-Host "1. A new window opened with your LocalTunnel URL (https://XXXXX.loca.lt)" -ForegroundColor White
Write-Host "2. Copy that HTTPS URL from the tunnel window" -ForegroundColor White
Write-Host "3. Add this to Meta App > Facebook Login > Valid OAuth Redirect URIs:" -ForegroundColor White
Write-Host "   https://XXXXX.loca.lt/auth/meta/callback" -ForegroundColor Cyan
Write-Host "4. Then press Enter here to continue..." -ForegroundColor White
Read-Host

# Step 2: Get tunnel URL from user
Write-Host "`nEnter your LocalTunnel URL (e.g., https://abc-def.loca.lt):" -ForegroundColor Cyan
$tunnelUrl = Read-Host "Tunnel URL"
$redirectUri = "$tunnelUrl/auth/meta/callback"

# Step 3: Start Node server with correct environment
Write-Host "`n=== Starting Node Server ===" -ForegroundColor Green
Write-Host "Redirect URI: $redirectUri" -ForegroundColor Yellow

$env:META_APP_ID = "2201740210361183"
$env:META_APP_SECRET = "8bb683dbc591772f9fe6dada7e2d792b"
$env:META_REDIRECT_URI = $redirectUri

Write-Host "Starting server on http://localhost:3000..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

node index.js

# If Node exits, show message
Write-Host "`n=== Server Stopped ===" -ForegroundColor Red
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")



