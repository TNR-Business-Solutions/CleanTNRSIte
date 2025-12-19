@echo off
echo Starting TNR Business Solutions Server on Port 3000...
cd /d "%~dp0"
set PORT=3000
node serve-clean.js
pause
