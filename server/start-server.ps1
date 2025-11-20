# Wix Automation Server Startup Script
# This script starts the server with proper environment variables

Write-Host "🚀 Starting Wix Automation Server..." -ForegroundColor Green
Write-Host ""

# Load environment variables from .env file
$envFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envFile) {
    Write-Host "✅ Loading environment variables from .env file..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "   Set: $key" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "⚠️  .env file not found, using defaults" -ForegroundColor Yellow
}

# Set POSTGRES_URL if not already set
if (-not $env:POSTGRES_URL) {
    $env:POSTGRES_URL = "postgresql://neondb_owner:npg_vOjG38AiJwBR@ep-twilight-bush-a4q7qlre-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
    Write-Host "✅ Set POSTGRES_URL from script" -ForegroundColor Green
}

# Determine port
$port = if ($env:PORT) { $env:PORT } else { 3000 }
Write-Host ""
Write-Host "📡 Server will start on port: $port" -ForegroundColor Cyan
Write-Host "🌐 Base URL: http://localhost:$port" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Change to server directory
Set-Location $PSScriptRoot

# Start the server
try {
    node index.js
} catch {
    Write-Host "❌ Error starting server: $_" -ForegroundColor Red
    exit 1
}

