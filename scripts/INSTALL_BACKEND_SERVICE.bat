@echo off
echo ========================================
echo   RARE 4N - Install Backend Service
echo   تثبيت Backend كخدمة Windows
echo ========================================
echo.

cd /d "%~dp0"

echo Checking for NSSM...
if not exist "C:\nssm\nssm.exe" (
    echo.
    echo ❌ NSSM not found!
    echo.
    echo Please install NSSM:
    echo   1. Download from: https://nssm.cc/download
    echo   2. Extract to C:\nssm
    echo   3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ NSSM found

echo.
echo Installing Backend service...
C:\nssm\nssm.exe install RARE4N-Backend "%CD%\backend" "node" "src/server.js"

echo.
echo Setting working directory...
C:\nssm\nssm.exe set RARE4N-Backend AppDirectory "%CD%\backend"

echo.
echo Starting service...
net start RARE4N-Backend

if errorlevel 1 (
    echo.
    echo ❌ Failed to start service
    echo You may need to run as Administrator
) else (
    echo.
    echo ✅ Backend service installed and started!
    echo.
    echo Service will start automatically on Windows boot
)

echo.
pause



