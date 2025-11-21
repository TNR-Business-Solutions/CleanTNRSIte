#!/usr/bin/env pwsh
# Wix Database Diagnostic Script
# Tests if Neon database is working correctly

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "WIX DATABASE DIAGNOSTIC TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$instanceId = "a4890371-c6da-46f4-a830-9e19df999cf8"
$diagnosticUrl = "https://www.tnrbusinesssolutions.com/api/wix/test-token?instanceId=$instanceId"

# Step 1: Run diagnostic
Write-Host "📊 Step 1: Running database diagnostic..." -ForegroundColor Yellow
Write-Host "   URL: $diagnosticUrl`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $diagnosticUrl -Method Get -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✅ Diagnostic completed successfully!`n" -ForegroundColor Green
        
        # Show summary
        Write-Host "📋 SUMMARY:" -ForegroundColor Cyan
        Write-Host "   Database Type: $($response.summary.database)" -ForegroundColor White
        Write-Host "   Tokens Found: $($response.summary.tokensFound)" -ForegroundColor White
        Write-Host "   Has Postgres URL: $($response.summary.environment.hasPostgresUrl)" -ForegroundColor White
        Write-Host "   Node Environment: $($response.summary.environment.nodeEnv)`n" -ForegroundColor White
        
        # Analyze results
        if ($response.summary.database -eq "Neon Postgres") {
            Write-Host "✅ DATABASE STATUS: Neon is working!" -ForegroundColor Green
            
            if ($response.summary.tokensFound -gt 0) {
                Write-Host "✅ TOKEN STATUS: $($response.summary.tokensFound) token(s) found`n" -ForegroundColor Green
                Write-Host "🎉 SUCCESS! Your Wix automation should be working now.`n" -ForegroundColor Green
                Write-Host "Next steps:" -ForegroundColor Yellow
                Write-Host "   1. Go to: https://www.tnrbusinesssolutions.com/wix-seo-manager.html" -ForegroundColor White
                Write-Host "   2. Select the client 'shesallthatandmore'" -ForegroundColor White
                Write-Host "   3. Click 'Run Full SEO Audit'" -ForegroundColor White
                Write-Host "   4. It should work now!`n" -ForegroundColor White
            } else {
                Write-Host "⚠️  TOKEN STATUS: No tokens found" -ForegroundColor Yellow
                Write-Host "`nThis means Neon is working, but you need to complete OAuth.`n" -ForegroundColor Yellow
                Write-Host "Next steps:" -ForegroundColor Yellow
                Write-Host "   1. Complete OAuth: https://www.tnrbusinesssolutions.com/api/auth/wix" -ForegroundColor White
                Write-Host "   2. Run this diagnostic again to verify token was saved" -ForegroundColor White
                Write-Host "   3. Then try the SEO audit`n" -ForegroundColor White
            }
        } else {
            Write-Host "❌ DATABASE STATUS: Falling back to $($response.summary.database)" -ForegroundColor Red
            Write-Host "`nThis means the Neon fix didn't work. Check the detailed logs:`n" -ForegroundColor Yellow
            
            # Show detailed logs
            Write-Host "📋 DETAILED LOGS:" -ForegroundColor Cyan
            foreach ($log in $response.logs) {
                Write-Host "   $log" -ForegroundColor Gray
            }
            
            Write-Host "`nNext steps:" -ForegroundColor Yellow
            Write-Host "   1. Check Vercel logs for Neon connection errors" -ForegroundColor White
            Write-Host "   2. Verify POSTGRES_URL environment variable is correct" -ForegroundColor White
            Write-Host "   3. Review database.js createTables() method`n" -ForegroundColor White
        }
        
    } else {
        Write-Host "❌ Diagnostic failed: $($response.error)`n" -ForegroundColor Red
        
        # Show detailed logs
        if ($response.logs) {
            Write-Host "📋 ERROR LOGS:" -ForegroundColor Cyan
            foreach ($log in $response.logs) {
                Write-Host "   $log" -ForegroundColor Gray
            }
        }
    }
    
} catch {
    Write-Host "❌ Could not connect to diagnostic endpoint" -ForegroundColor Red
    Write-Host "   Error: $_`n" -ForegroundColor Red
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "   1. Vercel deployment still in progress (wait 30 seconds)" -ForegroundColor White
    Write-Host "   2. Server is down" -ForegroundColor White
    Write-Host "   3. Network connection issue`n" -ForegroundColor White
}

Write-Host "========================================`n" -ForegroundColor Cyan

# Ask if user wants to open in browser
$openBrowser = Read-Host "Open diagnostic page in browser? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process $diagnosticUrl
}

