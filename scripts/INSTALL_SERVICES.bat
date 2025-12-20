@echo off
echo ========================================
echo   RARE 4N - Install Services
echo   ?????????? Backend ?? Cloudflare ???????????? Windows
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Installing Cloudflare Tunnel Service...
cloudflared service install
if errorlevel 1 (
    echo ERROR: Failed to install Cloudflare service
    echo Make sure cloudflared.exe is in PATH or current directory
    pause
    exit /b 1
)
echo ??? Cloudflare service installed

echo.
echo [2/3] Starting Cloudflare Service...
net start cloudflared
if errorlevel 1 (
    echo WARNING: Failed to start Cloudflare service
    echo You may need to run as Administrator
) else (
    echo ??? Cloudflare service started
)

echo.
echo [3/3] Creating Backend Service...
echo.
echo NOTE: Backend service requires NSSM (Non-Sucking Service Manager)
echo.
echo To install Backend as service:
echo   1. Download NSSM from: https://nssm.cc/download
echo   2. Extract to C:\nssm
echo   3. Run: C:\nssm\nssm.exe install RARE4N-Backend
echo   4. Set Path: %CD%\backend
echo   5. Set Startup: node src/server.js
echo   6. Start service: net start RARE4N-Backend
echo.

echo ========================================
echo   Services Status:
echo ========================================
sc query cloudflared | find "STATE"
echo.
echo To check Backend (if installed):
echo   sc query RARE4N-Backend
echo.
pause




