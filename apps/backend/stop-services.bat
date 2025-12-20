@echo off
REM RARE 4N - Stop Backend and Cloudflare Tunnel (Windows)
REM إيقاف Backend و Cloudflare Tunnel

echo 🛑 Stopping RARE 4N Services...

REM Stop backend
taskkill /F /IM node.exe >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ✅ Backend stopped
) else (
    echo ⚠️  Backend was not running
)

REM Stop Cloudflare
taskkill /F /IM cloudflared.exe >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ✅ Cloudflare Tunnel stopped
) else (
    echo ⚠️  Cloudflare Tunnel was not running
)

echo.
echo ✅ All services stopped!
pause


