@echo off
echo ========================================
echo TNR Business Solutions Server
echo ========================================
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Setting PORT=3000...
set PORT=3000
echo.
echo Starting server on port 3000...
echo.
echo Server will be available at:
echo   http://localhost:3000
echo   http://localhost:3000/admin-dashboard-v2.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
node serve-clean.js
pause
