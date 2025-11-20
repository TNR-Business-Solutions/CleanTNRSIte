@echo off
echo ========================================
echo    WIX AUTOMATION SERVER
echo ========================================
echo.

REM Set environment variables
set POSTGRES_URL=postgresql://neondb_owner:npg_vOjG38AiJwBR@ep-twilight-bush-a4q7qlre-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
set PORT=3000

echo Starting server on http://localhost:3000
echo POSTGRES_URL is set
echo.
echo Keep this window open!
echo Press Ctrl+C to stop the server.
echo.
echo ========================================
echo.

node index.js

pause

