@echo off
REM RARE 4N - Start Backend and Cloudflare Tunnel (Windows)
REM ?????????? Backend ?? Cloudflare Tunnel ????????????????

echo ???? Starting RARE 4N Services...

REM Create logs directory
if not exist logs mkdir logs

REM Check if backend is running
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ??????  Backend might be running
) else (
    echo ???? Starting Backend...
    cd backend
    start /B npm start > ..\logs\backend.log 2>&1
    cd ..
    echo ??? Backend started
)

REM Wait a bit
timeout /t 2 /nobreak >nul

REM Check if cloudflared is running
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>NUL | find /I /N "cloudflared.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ??????  Cloudflare Tunnel might be running
) else (
    echo ??????  Starting Cloudflare Tunnel...
    cd backend
    start /B cloudflared.exe tunnel --config config.yml run > ..\logs\cloudflare.log 2>&1
    cd ..
    echo ??? Cloudflare Tunnel started
)

echo.
echo ??? All services started!
echo ???? Logs:
echo    - Backend: logs\backend.log
echo    - Cloudflare: logs\cloudflare.log
echo.
echo ???? To stop services:
echo    stop-services.bat
echo.

pause



