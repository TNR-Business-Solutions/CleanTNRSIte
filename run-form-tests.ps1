# PowerShell script to run form submission tests with server management

Write-Host "🚀 Starting Form Submission Test Suite..." -ForegroundColor Cyan
Write-Host ""

# Check if server is running
$port = 3000
$serverRunning = $false

try {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ Server is already running on port $port" -ForegroundColor Green
        $serverRunning = $true
    }
} catch {
    Write-Host "⚠️  Server is not running on port $port" -ForegroundColor Yellow
}

# Start server in background if not running
if (-not $serverRunning) {
    Write-Host "🔄 Starting server..." -ForegroundColor Cyan
    Start-Process -FilePath "node" -ArgumentList "serve-clean.js" -WindowStyle Hidden
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Verify server started
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "✅ Server started successfully" -ForegroundColor Green
            $serverRunning = $true
        } else {
            Write-Host "❌ Server failed to start" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Server failed to start" -ForegroundColor Red
        exit 1
    }
}

# Run test loop
Write-Host ""
Write-Host "🔄 Running form submission tests..." -ForegroundColor Cyan
Write-Host ""

node test-form-loop.js

$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Some tests failed. Review the output above." -ForegroundColor Red
}

exit $exitCode

