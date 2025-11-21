# Wix SEO Automated Testing Loop
# This script automates the complete SEO testing workflow

param(
    [switch]$Production
)

$ErrorActionPreference = "Continue"

function Write-ColorOutput {
    param(
        [string]$Color,
        [string]$Message
    )
    
    $colorMap = @{
        "Red" = "Red"
        "Green" = "Green"
        "Yellow" = "Yellow"
        "Cyan" = "Cyan"
        "Blue" = "Blue"
        "Magenta" = "Magenta"
    }
    
    $consoleColor = $colorMap[$Color]
    if ($consoleColor) {
        Write-Host $Message -ForegroundColor $consoleColor
    } else {
        Write-Host $Message
    }
}

function Show-Banner {
    Write-Host ""
    Write-ColorOutput Cyan "================================================================================"
    Write-ColorOutput Cyan "🎯 WIX SEO AUTOMATED TESTING LOOP"
    Write-ColorOutput Cyan "================================================================================"
    Write-Host ""
}

function Test-ServerRunning {
    param([string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri "$Url/api/wix?action=listClients" -Method GET -TimeoutSec 5 -UseBasicParsing
        return $true
    } catch {
        return $false
    }
}

function Open-OAuthIfNeeded {
    param([string]$BaseUrl)
    
    Write-ColorOutput Yellow "🔍 Checking Wix connection status..."
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/wix" -Method POST -Body (@{
            action = "getClientDetails"
            instanceId = "a4890371-c6da-46f4-a830-9e19df999cf8"
        } | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10
        
        if ($response.success) {
            Write-ColorOutput Green "✅ Wix client already connected!"
            return $true
        }
    } catch {
        Write-ColorOutput Yellow "⚠️  Wix client not connected. Opening OAuth page..."
    }
    
    # Open OAuth page
    Start-Process "$BaseUrl/api/auth/wix"
    Write-ColorOutput Cyan "`n📝 Please complete the OAuth authorization in your browser."
    Write-ColorOutput Cyan "   This will connect 'shesallthatandmore.com' to the system."
    Write-Host ""
    Write-ColorOutput Yellow "Press any key when OAuth is complete..."
    [System.Console]::ReadKey() | Out-Null
    Write-Host ""
    
    # Verify connection
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/wix" -Method POST -Body (@{
            action = "getClientDetails"
            instanceId = "a4890371-c6da-46f4-a830-9e19df999cf8"
        } | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10
        
        if ($response.success) {
            Write-ColorOutput Green "✅ Wix client successfully connected!"
            return $true
        } else {
            Write-ColorOutput Red "❌ OAuth appears incomplete. Please try again."
            return $false
        }
    } catch {
        Write-ColorOutput Red "❌ Could not verify connection. Error: $($_.Exception.Message)"
        return $false
    }
}

function Run-SEOTests {
    param([string]$BaseUrl)
    
    Write-ColorOutput Yellow "`n🎯 Running comprehensive SEO tests...`n"
    
    node test-wix-seo-complete.js
    
    Write-Host ""
    
    # Check if test results file exists
    if (Test-Path "wix-seo-test-results.json") {
        $results = Get-Content "wix-seo-test-results.json" | ConvertFrom-Json
        
        Write-ColorOutput Cyan "================================================================================"
        Write-ColorOutput Cyan "📊 TEST RESULTS SUMMARY"
        Write-ColorOutput Cyan "================================================================================"
        Write-Host ""
        Write-Host "  Total Tests: $($results.summary.total)"
        Write-ColorOutput Green "  ✅ Passed: $($results.summary.passed)"
        Write-ColorOutput Red "  ❌ Failed: $($results.summary.failed)"
        
        $successRate = [math]::Round(($results.summary.passed / $results.summary.total) * 100)
        if ($successRate -ge 80) {
            Write-ColorOutput Green "`n  Success Rate: $successRate%"
        } else {
            Write-ColorOutput Yellow "`n  Success Rate: $successRate%"
        }
        Write-Host ""
        
        # Show failed tests
        if ($results.summary.failed -gt 0) {
            Write-ColorOutput Yellow "  Failed Tests:"
            foreach ($test in $results.tests) {
                if ($test.status -eq "FAIL") {
                    Write-ColorOutput Red "    ❌ $($test.name)"
                    Write-ColorOutput Red "       $($test.details)"
                }
            }
            Write-Host ""
        }
        
        # Check if SEO report was generated
        $reportFiles = Get-ChildItem -Path . -Filter "seo-report-*.json" | Sort-Object LastWriteTime -Descending
        if ($reportFiles.Count -gt 0) {
            Write-ColorOutput Green "  📄 SEO Report: $($reportFiles[0].Name)"
        }
        
        return $successRate
    } else {
        Write-ColorOutput Red "⚠️  Test results file not found."
        return 0
    }
}

function Open-Dashboards {
    param([string]$BaseUrl)
    
    Write-ColorOutput Yellow "`n📊 Opening SEO dashboards for manual verification...`n"
    
    Start-Sleep -Seconds 1
    Start-Process "$BaseUrl/wix-seo-manager.html"
    
    Start-Sleep -Seconds 1
    Start-Process "$BaseUrl/wix-ecommerce-manager.html"
    
    Write-ColorOutput Cyan "  ✅ Wix SEO Manager opened"
    Write-ColorOutput Cyan "  ✅ Wix E-commerce Manager opened"
    Write-Host ""
}

# Main execution
Show-Banner

# Determine base URL
$baseUrl = if ($Production) {
    "https://www.tnrbusinesssolutions.com"
} else {
    "http://localhost:3000"
}

Write-ColorOutput Blue "🌐 Target: $baseUrl"
Write-Host ""

# Check if server is running (for local only)
if (-not $Production) {
    Write-ColorOutput Yellow "🔍 Checking local server status..."
    if (-not (Test-ServerRunning $baseUrl)) {
        Write-ColorOutput Red "❌ Local server is not running!"
        Write-ColorOutput Yellow "`nPlease start the server first using one of these methods:"
        Write-Host "  1. Run: .\start-test-loop.ps1 and select option [1]"
        Write-Host "  2. Run: .\START-SERVER.bat"
        Write-Host "  3. Run: cd server; node index.js"
        Write-Host ""
        exit 1
    }
    Write-ColorOutput Green "✅ Server is running"
    Write-Host ""
}

# Step 1: Ensure OAuth is complete
Write-ColorOutput Cyan "================================================================================"
Write-ColorOutput Cyan "STEP 1: OAuth Connection"
Write-ColorOutput Cyan "================================================================================"
Write-Host ""

$connected = Open-OAuthIfNeeded $baseUrl

if (-not $connected) {
    Write-ColorOutput Red "`n❌ Cannot proceed without Wix OAuth. Exiting."
    exit 1
}

# Step 2: Run automated SEO tests
Write-ColorOutput Cyan "================================================================================"
Write-ColorOutput Cyan "STEP 2: Automated SEO Testing"
Write-ColorOutput Cyan "================================================================================"

$successRate = Run-SEOTests $baseUrl

# Step 3: Open dashboards for manual verification
Write-ColorOutput Cyan "================================================================================"
Write-ColorOutput Cyan "STEP 3: Manual Verification"
Write-ColorOutput Cyan "================================================================================"

Open-Dashboards $baseUrl

Write-ColorOutput Cyan "📝 Please verify the following in the opened dashboards:"
Write-Host "  1. SEO Audit runs without errors"
Write-Host "  2. Auto-Optimize SEO works correctly"
Write-Host "  3. Site-wide SEO settings can be updated"
Write-Host "  4. Products load in E-commerce Manager"
Write-Host ""

# Final summary
Write-ColorOutput Cyan "================================================================================"
Write-ColorOutput Cyan "🎯 TESTING COMPLETE"
Write-ColorOutput Cyan "================================================================================"
Write-Host ""

if ($successRate -ge 100) {
    Write-ColorOutput Green "🎉 All tests passed! Wix SEO automation is fully functional!"
} elseif ($successRate -ge 80) {
    Write-ColorOutput Green "✅ Most tests passed! Success rate: $successRate%"
} else {
    Write-ColorOutput Yellow "⚠️  Some tests failed. Success rate: $successRate%"
    Write-ColorOutput Yellow "    Review the errors above and rerun this script."
}

Write-Host ""
Write-ColorOutput Blue "📄 Test Results: wix-seo-test-results.json"
$reportFiles = Get-ChildItem -Path . -Filter "seo-report-*.json" | Sort-Object LastWriteTime -Descending
if ($reportFiles.Count -gt 0) {
    Write-ColorOutput Blue "📊 SEO Report: $($reportFiles[0].Name)"
}
Write-Host ""

if ($successRate -lt 100) {
    Write-ColorOutput Yellow "Would you like to run the tests again? (Y/N)"
    $retry = [System.Console]::ReadKey()
    if ($retry.Key -eq "Y") {
        Write-Host "`n"
        & $MyInvocation.MyCommand.Path -Production:$Production
    }
}

