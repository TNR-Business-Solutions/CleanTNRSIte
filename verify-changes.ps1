# Verification Script for Token Testing Fix
# Run this to verify all changes are present before deploying

Write-Host "🔍 Verifying Token Testing Fix Changes..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Frontend debugging code
Write-Host "1. Checking social-media-automation-dashboard.html..." -ForegroundColor Yellow
$frontendFile = "social-media-automation-dashboard.html"
if (Test-Path $frontendFile) {
  $content = Get-Content $frontendFile -Raw
    
  $checks = @(
    @{ Pattern = "getMetaTokenFromDatabase response:"; Name = "getMetaTokenFromDatabase logging" },
    @{ Pattern = "Sending test-token request body:"; Name = "Request body logging" },
    @{ Pattern = "JSON stringified:"; Name = "JSON stringified logging" },
    @{ Pattern = "tokenIdStr = String\(tokenId\)\.trim\(\)"; Name = "TokenId string conversion" },
    @{ Pattern = "window\.metaTokenId = String\(token\.id\)"; Name = "TokenId storage" }
  )
    
  foreach ($check in $checks) {
    if ($content -match $check.Pattern) {
      Write-Host "   ✅ $($check.Name)" -ForegroundColor Green
    }
    else {
      Write-Host "   ❌ $($check.Name) - MISSING!" -ForegroundColor Red
      $allGood = $false
    }
  }
}
else {
  Write-Host "   ❌ File not found!" -ForegroundColor Red
  $allGood = $false
}

Write-Host ""

# Check 2: Backend debugging code
Write-Host "2. Checking server/handlers/test-token.js..." -ForegroundColor Yellow
$backendFile = "server/handlers/test-token.js"
if (Test-Path $backendFile) {
  $content = Get-Content $backendFile -Raw
    
  $checks = @(
    @{ Pattern = "test-token received body:"; Name = "Received body logging" },
    @{ Pattern = "Extracted tokenId:"; Name = "TokenId extraction logging" },
    @{ Pattern = "Extracted platform:"; Name = "Platform extraction logging" },
    @{ Pattern = "dataKeys: Object\.keys\(data"; Name = "Error response details" }
  )
    
  foreach ($check in $checks) {
    if ($content -match $check.Pattern) {
      Write-Host "   ✅ $($check.Name)" -ForegroundColor Green
    }
    else {
      Write-Host "   ❌ $($check.Name) - MISSING!" -ForegroundColor Red
      $allGood = $false
    }
  }
}
else {
  Write-Host "   ❌ File not found!" -ForegroundColor Red
  $allGood = $false
}

Write-Host ""

# Check 3: Git status
Write-Host "3. Checking Git Status..." -ForegroundColor Yellow
$gitStatus = git status --short 2>&1
if ($LASTEXITCODE -eq 0) {
  if ($gitStatus) {
    Write-Host "   ⚠️  Uncommitted changes found:" -ForegroundColor Yellow
    Write-Host $gitStatus
    Write-Host ""
    Write-Host "   Run these commands to commit:" -ForegroundColor Cyan
    Write-Host "   git add -A" -ForegroundColor White
    Write-Host "   git commit -m 'fix: Add comprehensive debugging for test-token endpoint'" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor White
  }
  else {
    Write-Host "   ✅ No uncommitted changes" -ForegroundColor Green
  }
}
else {
  Write-Host "   ⚠️  Could not check git status" -ForegroundColor Yellow
}

Write-Host ""

# Final summary
if ($allGood) {
  Write-Host "✅ All changes verified! Ready to deploy." -ForegroundColor Green
  Write-Host ""
  Write-Host "Next steps:" -ForegroundColor Cyan
  Write-Host "1. Commit changes (if any): git add -A && git commit -m 'fix: Token testing debugging' && git push" -ForegroundColor White
  Write-Host "2. Deploy: vercel --prod" -ForegroundColor White
}
else {
  Write-Host "❌ Some changes are missing! Please check the files." -ForegroundColor Red
}

Write-Host ""
