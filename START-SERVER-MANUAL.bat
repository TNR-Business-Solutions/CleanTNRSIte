@echo off
echo ========================================
echo Starting TNR Business Solutions Server
echo ========================================
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Checking Node.js...
node --version
echo.
echo Setting PORT=3000...
set PORT=3000
echo PORT environment variable: %PORT%
echo.
echo Starting server...
echo.
node serve-clean.js
echo.
echo Server stopped.
pause
