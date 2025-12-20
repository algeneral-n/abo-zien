@echo off
REM ========================================
REM   RARE 4N - Setup Permanent Services
REM   ?????????? Backend ?? Cloudflare ?????????? ????????????
REM ========================================

cd /d "%~dp0"

echo.
echo ========================================
echo   Setting up Permanent Services
echo   ?????????? ?????????????? ??????????????
echo ========================================
echo.

echo [1/4] Checking Cloudflare config...
if exist "%USERPROFILE%\.cloudflared\config.yml" (
    echo ??? Cloudflare config found
) else (
    echo ??? Cloudflare config NOT found
    echo    Please run: cloudflared tunnel login
    echo    Then: cloudflared tunnel create rare4n-backend
    echo    Then: cloudflared tunnel route dns rare4n-backend api.zien-ai.app
    echo    Then create config.yml manually
    pause
    exit /b 1
)

echo.
echo [2/4] Installing Cloudflare Tunnel Service...
cloudflared service install
if errorlevel 1 (
    echo WARNING: Failed to install Cloudflare service
    echo You may need to run as Administrator
    echo.
    echo Please run this script as Administrator:
    echo   Right-click ??? Run as administrator
    pause
    exit /b 1
)
echo ??? Cloudflare service installed

echo.
echo [3/4] Starting Cloudflare Service...
net start cloudflared
if errorlevel 1 (
    echo WARNING: Failed to start Cloudflare service
    echo Service may already be running
) else (
    echo ??? Cloudflare service started
)

echo.
echo [4/4] Setting up Backend Service...
echo.
echo To install Backend as Windows Service, you need NSSM:
echo   1. Download NSSM from: https://nssm.cc/download
echo   2. Extract to C:\nssm
echo   3. Run: INSTALL_BACKEND_SERVICE.bat
echo.
echo OR use PM2 (Node.js process manager):
echo   1. npm install -g pm2
echo   2. cd backend
echo   3. pm2 start src/server.js --name rare4n-backend
echo   4. pm2 save
echo   5. pm2 startup
echo.

echo ========================================
echo   Services Status:
echo ========================================
echo.
sc query cloudflared | find "STATE"
echo.
echo To check services:
echo   sc query cloudflared
echo   sc query RARE4N-Backend (if installed)
echo.
echo To start services manually:
echo   net start cloudflared
echo   net start RARE4N-Backend (if installed)
echo.
echo To stop services:
echo   net stop cloudflared
echo   net stop RARE4N-Backend (if installed)
echo.
pause




