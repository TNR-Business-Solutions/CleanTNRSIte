@echo off
echo ========================================
echo   Starting TNR Automation Server
echo ========================================
echo.

REM Kill existing Node processes
echo Stopping existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Done.
echo.

REM Navigate to server directory
cd server

REM Start the server
echo Starting server on http://localhost:3000
echo.
echo Server is running! Press Ctrl+C to stop.
echo.
node index.js

pause

