@echo off
REM ========================================
REM   RARE 4N - Install All Services
REM   تثبيت كل الخدمات للعمل الدائم
REM ========================================

cd /d "%~dp0"

echo.
echo ========================================
echo   Installing Permanent Services
echo   تثبيت الخدمات الدائمة
echo ========================================
echo.
echo This script will:
echo   1. Install Cloudflare Tunnel as Windows Service
echo   2. Install PM2 for Backend management
echo   3. Setup Backend to run with PM2
echo.
echo Press any key to continue...
pause >nul

echo.
echo [1/5] Checking Cloudflare config...
if exist "%USERPROFILE%\.cloudflared\config.yml" (
    echo ✅ Cloudflare config found
) else (
    echo ❌ Cloudflare config NOT found
    echo.
    echo Please setup Cloudflare first:
    echo   1. cloudflared tunnel login
    echo   2. cloudflared tunnel create rare4n-backend
    echo   3. cloudflared tunnel route dns rare4n-backend api.zien-ai.app
    echo   4. Create config.yml in %USERPROFILE%\.cloudflared\
    echo.
    pause
    exit /b 1
)

echo.
echo [2/5] Installing Cloudflare Tunnel Service...
cloudflared service install
if errorlevel 1 (
    echo.
    echo ❌ Failed to install Cloudflare service
    echo.
    echo Please run this script as Administrator:
    echo   Right-click → Run as administrator
    echo.
    pause
    exit /b 1
)
echo ✅ Cloudflare service installed

echo.
echo [3/5] Starting Cloudflare Service...
net start cloudflared
if errorlevel 1 (
    echo WARNING: Service may already be running
    sc query cloudflared | find "STATE"
) else (
    echo ✅ Cloudflare service started
)

echo.
echo [4/5] Installing PM2...
npm install -g pm2
if errorlevel 1 (
    echo.
    echo ❌ Failed to install PM2
    echo Please check Node.js installation
    echo.
    pause
    exit /b 1
)
echo ✅ PM2 installed

echo.
echo [5/5] Setting up Backend with PM2...
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

pm2 start src/server.js --name rare4n-backend
pm2 save
pm2 startup
cd ..

echo.
echo ========================================
echo   ✅ Installation Complete!
echo ========================================
echo.
echo Services Status:
echo.
sc query cloudflared | find "STATE"
echo.
pm2 list
echo.
echo ========================================
echo   Services are now running permanently!
echo   الخدمات تعمل الآن بشكل دائم!
echo ========================================
echo.
echo To check status:
echo   CHECK_SERVICES.bat
echo.
echo To manage services:
echo   PM2: pm2 list, pm2 logs, pm2 restart all
echo   Cloudflare: net start cloudflared, net stop cloudflared
echo.
pause



