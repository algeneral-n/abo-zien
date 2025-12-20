@echo off
echo ========================================
echo   RARE 4N - Start Services
echo   تشغيل Backend و Cloudflare
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Backend...
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
start "RARE 4N Backend" cmd /k "npm start"
cd ..
echo ✅ Backend starting...

echo.
echo [2/2] Starting Cloudflare Tunnel...
if exist cloudflared.exe (
    start "Cloudflare Tunnel" cmd /k "cloudflared.exe tunnel run 8280d872-79cc-4b82-9de8-a86ab4bf9540"
    echo ✅ Cloudflare Tunnel starting...
) else (
    echo WARNING: cloudflared.exe not found
    echo Please run: cloudflared tunnel run 8280d872-79cc-4b82-9de8-a86ab4bf9540 manually
)

echo.
echo ========================================
echo   Services Status:
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Cloudflare: https://api.zien-ai.app
echo.
echo To check status:
echo   curl http://localhost:5000/health
echo   curl https://api.zien-ai.app/health
echo.
pause


