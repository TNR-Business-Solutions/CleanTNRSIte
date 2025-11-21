# PowerShell Script: Start Test Loop as Administrator
# Comprehensive testing and fixing loop for all integrations

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TNR Integration Testing Loop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Not running as Administrator!" -ForegroundColor Red
    Write-Host "Please run this script as Administrator" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "📁 Working Directory: $(Get-Location)" -ForegroundColor Blue
Write-Host ""

# Kill any existing Node processes
Write-Host "🔪 Killing existing Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ Node processes cleared" -ForegroundColor Green
Write-Host ""

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Install server dependencies if needed
if (-not (Test-Path "server/node_modules")) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
        Set-Location ..
        pause
        exit 1
    }
    Set-Location ..
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Start the server in background using Start-Process
Write-Host "🚀 Starting server..." -ForegroundColor Cyan
$serverPath = Join-Path $scriptPath "server"
$nodePath = (Get-Command node).Source

# Start server in new window
$serverProcess = Start-Process -FilePath $nodePath -ArgumentList "index.js" -WorkingDirectory $serverPath -WindowStyle Minimized -PassThru

Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check if server is running
$serverRunning = $false
$attempts = 0
while (-not $serverRunning -and $attempts -lt 5) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        $serverRunning = $true
        Write-Host "✅ Server is running!" -ForegroundColor Green
        Write-Host ""
    } catch {
        $attempts++
        if ($attempts -lt 5) {
            Write-Host "⏳ Still starting... (attempt $attempts/5)" -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $serverRunning) {
    Write-Host "❌ Server failed to start!" -ForegroundColor Red
    Write-Host "Error: Server not responding after 5 attempts" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check if port 3000 is already in use" -ForegroundColor Yellow
    Write-Host "2. Check server/index.js for errors" -ForegroundColor Yellow
    Write-Host "3. Check .env file exists in project root" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try starting manually: cd server; node index.js" -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    pause
    exit 1
}

# Function to run tests
function Run-Tests {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Running Integration Tests" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    node test-all-integrations.js
    
    return $LASTEXITCODE
}

# Function to display menu
function Show-Menu {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Test Loop Menu" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Run Full Test Suite" -ForegroundColor White
    Write-Host "2. Run Wix SEO Tests (Audit + Auto-Optimize) ⭐" -ForegroundColor Green
    Write-Host "3. Open Admin Dashboard (Browser)" -ForegroundColor White
    Write-Host "4. Open Social Media Dashboard (Browser)" -ForegroundColor White
    Write-Host "5. Open Wix Dashboard (Browser)" -ForegroundColor White
    Write-Host "6. Test Wix OAuth" -ForegroundColor White
    Write-Host "7. Test Meta OAuth" -ForegroundColor White
    Write-Host "8. Test LinkedIn OAuth" -ForegroundColor White
    Write-Host "9. Test Twitter OAuth" -ForegroundColor White
    Write-Host "10. View Test Results" -ForegroundColor White
    Write-Host "11. View Server Logs" -ForegroundColor White
    Write-Host "12. Restart Server" -ForegroundColor White
    Write-Host "Q. Quit" -ForegroundColor Red
    Write-Host ""
}

# Main testing loop
$continue = $true
$testIteration = 1

while ($continue) {
    Show-Menu
    $choice = Read-Host "Enter your choice"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "🧪 Test Iteration #$testIteration" -ForegroundColor Magenta
            Write-Host ""
            $exitCode = Run-Tests
            $testIteration++
            
            if ($exitCode -eq 0) {
                Write-Host ""
                Write-Host "✅ Tests completed successfully!" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "⚠️  Some tests failed. Review results above." -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "2" {
            Write-Host ""
            Write-Host "🎯 Running Wix SEO Tests..." -ForegroundColor Cyan
            Write-Host ""
            node test-wix-seo-complete.js
            
            Write-Host ""
            if (Test-Path "wix-seo-test-results.json") {
                $results = Get-Content "wix-seo-test-results.json" | ConvertFrom-Json
                Write-Host "📊 Results: $($results.summary.passed)/$($results.summary.total) passed" -ForegroundColor $(if ($results.summary.failed -eq 0) { "Green" } else { "Yellow" })
            }
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "3" {
            Write-Host "🌐 Opening Admin Dashboard..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/admin-dashboard-v2.html"
        }
        
        "4" {
            Write-Host "🌐 Opening Social Media Dashboard..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/social-media-automation-dashboard.html"
        }
        
        "5" {
            Write-Host "🌐 Opening Wix Dashboard..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/wix-client-dashboard.html"
        }
        
        "6" {
            Write-Host "🔗 Opening Wix OAuth..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/api/auth/wix"
            Write-Host "✅ Please complete OAuth in browser" -ForegroundColor Yellow
            Write-Host "   Connect: http://www.shesallthatandmore.com/" -ForegroundColor Yellow
        }
        
        "7" {
            Write-Host "🔗 Opening Meta OAuth..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/api/auth/meta"
            Write-Host "✅ Please complete OAuth in browser" -ForegroundColor Yellow
            Write-Host "   Connect: TNR Business Solutions Page" -ForegroundColor Yellow
        }
        
        "8" {
            Write-Host "🔗 Opening LinkedIn OAuth..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/api/auth/linkedin"
            Write-Host "✅ Please complete OAuth in browser" -ForegroundColor Yellow
        }
        
        "9" {
            Write-Host "🔗 Opening Twitter OAuth..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/api/auth/twitter"
            Write-Host "✅ Please complete OAuth in browser" -ForegroundColor Yellow
        }
        
        "10" {
            if (Test-Path "test-results.json") {
                Write-Host ""
                Get-Content "test-results.json" | ConvertFrom-Json | ConvertTo-Json -Depth 10
                Write-Host ""
            } else {
                Write-Host "❌ No test results found. Run tests first." -ForegroundColor Red
            }
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "11" {
            Write-Host ""
            Write-Host "📋 Server Process Info:" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Process ID: $($serverProcess.Id)" -ForegroundColor White
            Write-Host "Status: $(if ($serverProcess.HasExited) { 'Stopped' } else { 'Running' })" -ForegroundColor White
            Write-Host ""
            Write-Host "Check server window for live logs..." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "12" {
            Write-Host "🔄 Restarting server..." -ForegroundColor Yellow
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            
            $serverProcess = Start-Process -FilePath $nodePath -ArgumentList "index.js" -WorkingDirectory $serverPath -WindowStyle Minimized -PassThru
            
            Start-Sleep -Seconds 5
            Write-Host "✅ Server restarted" -ForegroundColor Green
        }
        
        "Q" {
            Write-Host ""
            Write-Host "Shutting down..." -ForegroundColor Yellow
            $continue = $false
        }
        
        "q" {
            Write-Host ""
            Write-Host "Shutting down..." -ForegroundColor Yellow
            $continue = $false
        }
        
        default {
            Write-Host "❌ Invalid choice. Please try again." -ForegroundColor Red
        }
    }
}

# Cleanup
Write-Host "Cleaning up..." -ForegroundColor Yellow
if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Server stopped" -ForegroundColor Green
}

Write-Host "Goodbye!" -ForegroundColor Green
Write-Host ""

