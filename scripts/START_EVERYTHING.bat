@echo off
REM ========================================
REM   RARE 4N - Start Everything
REM   ?????????? ???? ?????? (Backend + Cloudflare)
REM ========================================

cd /d "%~dp0"

echo.
echo ========================================
echo   Starting All Services
echo   ?????????? ???? ??????????????
echo ========================================
echo.

echo [1/2] Starting Backend...
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
start "RARE 4N Backend" cmd /k "npm start"
cd ..
echo ??? Backend starting on http://localhost:5000

echo.
echo [2/2] Starting Cloudflare Tunnel...
if exist cloudflared.exe (
    start "Cloudflare Tunnel" cmd /k "cloudflared tunnel run"
    echo ??? Cloudflare Tunnel starting for api.zien-ai.app
) else (
    echo WARNING: cloudflared.exe not found in current directory
    echo Trying system cloudflared...
    start "Cloudflare Tunnel" cmd /k "cloudflared tunnel run"
)

echo.
echo ========================================
echo   Services Starting...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Cloudflare: https://api.zien-ai.app
echo.
echo Waiting 10 seconds for services to start...
timeout /t 10 /nobreak >nul

echo.
echo Checking services...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo ?????? Backend may still be starting...
) else (
    echo ??? Backend is running!
)

curl -s https://api.zien-ai.app/health >nul 2>&1
if errorlevel 1 (
    echo ?????? Cloudflare Tunnel may still be starting...
) else (
    echo ??? Cloudflare Tunnel is running!
)

echo.
echo ========================================
echo   Services are running!
echo   ?????????????? ???????? ????????!
echo ========================================
echo.
echo To make them permanent (run on Windows startup):
echo   Run: INSTALL_ALL_SERVICES.bat (as Administrator)
echo.
pause




