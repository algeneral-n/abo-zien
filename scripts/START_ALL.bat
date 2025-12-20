@echo off
echo ========================================
echo   RARE 4N - System Startup
echo   Cognitive Loop + Kernel + Backend + Cloudflare
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Backend...
cd backend
if not exist node_modules (
    echo Installing Backend dependencies...
    call npm install
)
echo Backend dependencies OK
cd ..

echo.
echo [2/4] Starting Backend Server...
start "RARE 4N Backend" cmd /k "cd backend && npm start"

echo.
echo Waiting 5 seconds for Backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [3/4] Checking Backend Health...
curl http://localhost:5000/health
if errorlevel 1 (
    echo WARNING: Backend may not be running yet
) else (
    echo Backend is running!
)

echo.
echo [4/4] Starting Cloudflare Tunnel...
if exist cloudflared.exe (
    start "Cloudflare Tunnel" cmd /k "cloudflared.exe tunnel run 8280d872-79cc-4b82-9de8-a86ab4bf9540"
    echo Cloudflare Tunnel starting...
) else (
    echo WARNING: cloudflared.exe not found in root directory
    echo Please run: cloudflared tunnel run 8280d872-79cc-4b82-9de8-a86ab4bf9540 manually
)

echo.
echo ========================================
echo   System Status:
echo   - Backend: Starting...
echo   - Cloudflare: Starting...
echo   - Mobile App: Ready to start
echo ========================================
echo.
echo To start Mobile App:
echo   cd mobile
echo   npx expo start
echo.
pause


