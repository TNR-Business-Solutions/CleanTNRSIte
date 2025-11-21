# Production Testing Loop
# Automated testing on Vercel deployment

$ErrorActionPreference = "Continue"
$PRODUCTION_URL = "https://www.tnrbusinesssolutions.com"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-Host ""
Write-ColorOutput Cyan "================================================================================"
Write-ColorOutput Cyan "🚀 AUTOMATED PRODUCTION TESTING LOOP"
Write-ColorOutput Cyan "================================================================================"
Write-Host ""

# Step 1: Wait for deployment
Write-ColorOutput Yellow "⏳ Step 1: Waiting for Vercel deployment..."
Write-Host "   Checking deployment status every 5 seconds..."
Write-Host ""

$deployed = $false
$attempts = 0
$maxAttempts = 20

while (-not $deployed -and $attempts -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "$PRODUCTION_URL/api/wix" -Method GET -TimeoutSec 5 -UseBasicParsing 2>$null
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput Green "✅ Deployment is live!"
            $deployed = $true
        }
    } catch {
        $attempts++
        Write-Host "   Attempt $attempts/$maxAttempts - Waiting..." -NoNewline
        Start-Sleep -Seconds 5
        Write-Host "`r" -NoNewline
    }
}

if (-not $deployed) {
    Write-ColorOutput Red "❌ Deployment not detected after $maxAttempts attempts"
    Write-ColorOutput Yellow "   The deployment may still be in progress. Continue? (Y/N)"
    $continue = Read-Host
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit 1
    }
}

Write-Host ""

# Step 2: Run automated tests
Write-ColorOutput Yellow "📊 Step 2: Running automated integration tests..."
Write-Host ""

node test-production.js

Write-Host ""

# Step 2.5: Run Wix SEO comprehensive tests
Write-ColorOutput Yellow "🎯 Step 2.5: Running comprehensive Wix SEO tests..."
Write-Host ""

node test-wix-seo-complete.js

Write-Host ""

# Step 3: OAuth Instructions
Write-ColorOutput Cyan "================================================================================"
Write-ColorOutput Cyan "🔑 STEP 3: COMPLETE OAUTH FLOWS"
Write-ColorOutput Cyan "================================================================================"
Write-Host ""

Write-ColorOutput Yellow "You need to complete OAuth for these platforms:"
Write-Host ""

$oauthLinks = @(
    @{Name="Wix"; URL="$PRODUCTION_URL/api/auth/wix"; Site="shesallthatandmore.com"},
    @{Name="Meta/Facebook"; URL="$PRODUCTION_URL/api/auth/meta"; Site="TNR Business Solutions Page"},
    @{Name="Threads"; URL="$PRODUCTION_URL/api/auth/threads"; Site=""},
    @{Name="LinkedIn"; URL="$PRODUCTION_URL/api/auth/linkedin"; Site=""},
    @{Name="Twitter/X"; URL="$PRODUCTION_URL/api/auth/twitter"; Site=""}
)

$index = 1
foreach ($link in $oauthLinks) {
    Write-ColorOutput Cyan "$index. $($link.Name)"
    Write-ColorOutput Blue "   $($link.URL)"
    if ($link.Site) {
        Write-ColorOutput Yellow "   → Connect: $($link.Site)"
    }
    Write-Host ""
    $index++
}

Write-ColorOutput Yellow "Press any key to open OAuth links in browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Open OAuth links
foreach ($link in $oauthLinks) {
    Write-ColorOutput Green "Opening $($link.Name)..."
    Start-Process $link.URL
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-ColorOutput Yellow "Complete the OAuth flows in your browser, then press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 4: Test Wix SEO Audit
Write-ColorOutput Cyan "================================================================================"
Write-ColorOutput Cyan "🧪 STEP 4: TESTING WIX SEO AUDIT"
Write-ColorOutput Cyan "================================================================================"
Write-Host ""

Write-ColorOutput Yellow "Testing SEO audit on connected Wix site..."
Write-Host ""

try {
    $seoTest = Invoke-WebRequest -Uri "$PRODUCTION_URL/wix-seo-manager.html" -UseBasicParsing -TimeoutSec 10
    if ($seoTest.StatusCode -eq 200) {
        Write-ColorOutput Green "✅ SEO Manager page loaded successfully"
        Write-Host ""
        Write-ColorOutput Yellow "Manual Test Required:"
        Write-Host "   1. Visit: $PRODUCTION_URL/wix-seo-manager.html"
        Write-Host "   2. Select: Shesallthat&more"
        Write-Host "   3. Click: 'Run Full SEO Audit'"
        Write-Host "   4. Verify: Results display without errors"
        Write-Host ""
        
        Write-ColorOutput Yellow "Opening SEO Manager in browser..."
        Start-Process "$PRODUCTION_URL/wix-seo-manager.html"
    }
} catch {
    Write-ColorOutput Red "❌ SEO Manager page error: $($_.Exception.Message)"
}

Write-Host ""
Write-ColorOutput Yellow "After testing SEO audit, press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 5: Test E-commerce
Write-ColorOutput Cyan "================================================================================"
Write-ColorOutput Cyan "🛒 STEP 5: TESTING WIX E-COMMERCE"
Write-ColorOutput Cyan "================================================================================"
Write-Host ""

Write-ColorOutput Yellow "Opening E-commerce Manager..."
Start-Process "$PRODUCTION_URL/wix-ecommerce-manager.html"

Write-Host ""
Write-ColorOutput Yellow "Manual Test Required:"
Write-Host "   1. Select: Shesallthat&more"
Write-Host "   2. Click: 'Sync Products'"
Write-Host "   3. Verify: Products load from store"
Write-Host "   4. Check: Collections display correctly"
Write-Host ""

Write-ColorOutput Yellow "After testing e-commerce, press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 6: Social Media Dashboard
Write-ColorOutput Cyan "================================================================================"
Write-ColorOutput Cyan "📱 STEP 6: TESTING SOCIAL MEDIA POSTING"
Write-ColorOutput Cyan "================================================================================"
Write-Host ""

Write-ColorOutput Yellow "Opening Social Media Dashboard..."
Start-Process "$PRODUCTION_URL/social-media-automation-dashboard.html"

Write-Host ""
Write-ColorOutput Yellow "Manual Test Required:"
Write-Host "   1. Try posting to Facebook"
Write-Host "   2. Try posting to Instagram (with image)"
Write-Host "   3. Try posting to LinkedIn"
Write-Host "   4. Try posting to Twitter"
Write-Host "   5. Verify all posts succeed"
Write-Host ""

Write-ColorOutput Yellow "After testing social media, press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Final Summary
Write-ColorOutput Cyan "================================================================================"
Write-ColorOutput Cyan "✅ TESTING LOOP COMPLETE"
Write-ColorOutput Cyan "================================================================================"
Write-Host ""

Write-ColorOutput Green "All automated tests completed!"
Write-Host ""

Write-ColorOutput Yellow "📋 Testing Checklist:"
Write-Host ""
Write-Host "   OAuth Flows:"
Write-Host "   [ ] Wix connected"
Write-Host "   [ ] Facebook/Meta authorized"
Write-Host "   [ ] Threads authorized"
Write-Host "   [ ] LinkedIn authorized"
Write-Host "   [ ] Twitter authorized"
Write-Host ""
Write-Host "   Wix Features:"
Write-Host "   [ ] SEO audit runs without errors"
Write-Host "   [ ] Products sync successfully"
Write-Host "   [ ] Collections display"
Write-Host ""
Write-Host "   Social Media:"
Write-Host "   [ ] Facebook post successful"
Write-Host "   [ ] Instagram post successful"
Write-Host "   [ ] LinkedIn post successful"
Write-Host "   [ ] Twitter post successful"
Write-Host ""

Write-ColorOutput Cyan "================================================================================"
Write-Host ""

Write-ColorOutput Yellow "Would you like to run the tests again? (Y/N)"
$runAgain = Read-Host

if ($runAgain -eq "Y" -or $runAgain -eq "y") {
    Write-Host ""
    Write-ColorOutput Green "Restarting testing loop..."
    Start-Sleep -Seconds 2
    & $PSCommandPath
} else {
    Write-ColorOutput Green "Testing loop finished. Good luck! 🎉"
    Write-Host ""
}

