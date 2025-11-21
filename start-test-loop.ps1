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

# Start the server in background
Write-Host "🚀 Starting server..." -ForegroundColor Cyan
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:scriptPath
    Set-Location server
    node index.js
}

Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Server failed to start!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Stop-Job $serverJob
    Remove-Job $serverJob
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
    Write-Host "2. Open Admin Dashboard (Browser)" -ForegroundColor White
    Write-Host "3. Open Social Media Dashboard (Browser)" -ForegroundColor White
    Write-Host "4. Open Wix Dashboard (Browser)" -ForegroundColor White
    Write-Host "5. Test Wix OAuth" -ForegroundColor White
    Write-Host "6. Test Meta OAuth" -ForegroundColor White
    Write-Host "7. Test LinkedIn OAuth" -ForegroundColor White
    Write-Host "8. Test Twitter OAuth" -ForegroundColor White
    Write-Host "9. View Test Results" -ForegroundColor White
    Write-Host "10. View Server Logs" -ForegroundColor White
    Write-Host "11. Restart Server" -ForegroundColor White
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
            Write-Host "🌐 Opening Admin Dashboard..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/admin-dashboard-v2.html"
        }
        
        "3" {
            Write-Host "🌐 Opening Social Media Dashboard..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/social-media-automation-dashboard.html"
        }
        
        "4" {
            Write-Host "🌐 Opening Wix Dashboard..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/wix-client-dashboard.html"
        }
        
        "5" {
            Write-Host "🔗 Opening Wix OAuth..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/api/auth/wix"
            Write-Host "✅ Please complete OAuth in browser" -ForegroundColor Yellow
            Write-Host "   Connect: http://www.shesallthatandmore.com/" -ForegroundColor Yellow
        }
        
        "6" {
            Write-Host "🔗 Opening Meta OAuth..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/api/auth/meta"
            Write-Host "✅ Please complete OAuth in browser" -ForegroundColor Yellow
            Write-Host "   Connect: TNR Business Solutions Page" -ForegroundColor Yellow
        }
        
        "7" {
            Write-Host "🔗 Opening LinkedIn OAuth..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/api/auth/linkedin"
            Write-Host "✅ Please complete OAuth in browser" -ForegroundColor Yellow
        }
        
        "8" {
            Write-Host "🔗 Opening Twitter OAuth..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000/api/auth/twitter"
            Write-Host "✅ Please complete OAuth in browser" -ForegroundColor Yellow
        }
        
        "9" {
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
        
        "10" {
            Write-Host ""
            Write-Host "📋 Server Logs (last 20 lines):" -ForegroundColor Cyan
            Write-Host ""
            Receive-Job $serverJob | Select-Object -Last 20
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "11" {
            Write-Host "🔄 Restarting server..." -ForegroundColor Yellow
            Stop-Job $serverJob
            Remove-Job $serverJob
            Start-Sleep -Seconds 2
            
            $serverJob = Start-Job -ScriptBlock {
                Set-Location $using:scriptPath
                Set-Location server
                node index.js
            }
            
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
Stop-Job $serverJob
Remove-Job $serverJob

Write-Host "Goodbye!" -ForegroundColor Green
Write-Host ""

