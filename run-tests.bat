@echo off
REM Test Runner Script for Windows
REM Runs tests in a loop until all pass

echo Starting automated test suite...
echo Base URL: %TEST_URL%
echo.

REM Set environment variables if not set
if "%TEST_URL%"=="" set TEST_URL=https://www.tnrbusinesssolutions.com
if "%HEADLESS%"=="" set HEADLESS=true
if "%ADMIN_PASSWORD%"=="" set ADMIN_PASSWORD=TNR2024!

REM Run test suite
node test-runner-with-logs.js

echo.
echo Test suite completed. Check test-results-*.json files for details.
pause

