@echo off
REM ========================================
REM   WIX AUTOMATION SERVER STARTER
REM ========================================

echo.
echo ========================================
echo    STARTING WIX AUTOMATION SERVER
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Kill any existing Node processes
echo [1/3] Stopping any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo        Existing processes stopped
) else (
    echo        No existing processes found
)

REM Navigate to server directory
echo [2/3] Navigating to server directory...
cd /d "%~dp0server"
if not exist "wix-server-standalone.js" (
    echo [ERROR] Server file not found: wix-server-standalone.js
    echo Current directory: %CD%
    pause
    exit /b 1
)
echo        Server directory found

REM Start the server
echo [3/3] Starting Wix Automation Server...
echo.
echo ========================================
echo    SERVER OUTPUT (Press Ctrl+C to stop)
echo ========================================
echo.

node wix-server-standalone.js

REM If server exits, show message
echo.
echo ========================================
echo    SERVER STOPPED
echo ========================================
pause
