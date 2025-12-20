@echo off
echo ========================================
echo   RARE 4N Backend Server
echo ========================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting server...
echo.

node src/server.js

pause









