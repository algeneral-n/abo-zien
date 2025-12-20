@echo off
echo ========================================
echo   RARE 4N - Check Services Status
echo   التحقق من حالة الخدمات
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Checking Backend...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend: NOT RUNNING
    echo    Run: START_SERVICES.bat
) else (
    echo ✅ Backend: RUNNING
    curl -s http://localhost:5000/health
    echo.
)

echo.
echo [2] Checking Cloudflare Tunnel...
curl -s https://api.zien-ai.app/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Cloudflare Tunnel: NOT RUNNING
    echo    Run: cloudflared tunnel run rare4n-backend
) else (
    echo ✅ Cloudflare Tunnel: RUNNING
    curl -s https://api.zien-ai.app/health
    echo.
)

echo.
echo [3] Checking Windows Services...
echo.
sc query cloudflared | find "STATE"
echo.
sc query RARE4N-Backend 2>nul | find "STATE"
if errorlevel 1 (
    echo Backend service not installed
    echo Run: INSTALL_BACKEND_SERVICE.bat to install
)

echo.
pause



