# Test eBay Notification Endpoint
# Tests the Node.js endpoint deployed on Vercel

Write-Host "🧪 Testing eBay Notification Endpoint" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$url = "https://www.tnrbusinesssolutions.com/ebay/notifications/marketplace-deletion"
$challenge = "test123"
$token = "TNR-Cards-2026-woowreDVxpwAmvzZ2LE2DOOx"

$testUrl = "$url`?challenge=$challenge&verificationToken=$token"

Write-Host "URL: $testUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "Testing GET request (verification)..." -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri $testUrl -Method GET -UseBasicParsing
    
    Write-Host ""
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response Body: $($response.Content)" -ForegroundColor Green
    Write-Host ""
    
    if ($response.Content -eq $challenge) {
        Write-Host "✅ Challenge-response verified correctly!" -ForegroundColor Green
        Write-Host "✅ Endpoint is working and ready for eBay verification" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Response doesn't match challenge" -ForegroundColor Yellow
        Write-Host "   Expected: $challenge" -ForegroundColor Yellow
        Write-Host "   Received: $($response.Content)" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "This might mean:" -ForegroundColor Yellow
    Write-Host "1. Endpoint not deployed yet (check Vercel)" -ForegroundColor Yellow
    Write-Host "2. Route not configured correctly" -ForegroundColor Yellow
    Write-Host "3. Deployment still building" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. If test passed: Go to eBay Developer Portal" -ForegroundColor White
Write-Host "2. Click 'Save' on Marketplace Account Deletion endpoint" -ForegroundColor White
Write-Host "3. eBay will verify automatically" -ForegroundColor White
