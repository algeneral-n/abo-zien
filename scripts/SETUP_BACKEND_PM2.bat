@echo off
echo ========================================
echo   RARE 4N - Setup Backend with PM2
echo   إعداد Backend باستخدام PM2
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking PM2...
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo PM2 not found. Installing...
    npm install -g pm2
    if errorlevel 1 (
        echo ERROR: Failed to install PM2
        pause
        exit /b 1
    )
)
echo ✅ PM2 installed

echo.
echo [2/3] Installing Backend dependencies...
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
cd ..

echo.
echo [3/3] Starting Backend with PM2...
cd backend
pm2 start src/server.js --name rare4n-backend
pm2 save
pm2 startup
cd ..

echo.
echo ✅ Backend is now running with PM2!
echo.
echo PM2 Commands:
echo   pm2 list          - Show all processes
echo   pm2 logs          - Show logs
echo   pm2 restart all   - Restart all
echo   pm2 stop all      - Stop all
echo   pm2 delete all    - Delete all
echo.
pause



