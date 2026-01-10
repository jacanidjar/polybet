@echo off
echo ==========================================
echo Polybet - FULL RESET (Deep Clean)
echo ==========================================
echo WARNING: This will delete node_modules
echo and reinstall everything from scratch!
echo.
pause

echo [1/7] Closing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/7] Removing node_modules...
cd apps\web
if exist node_modules (
    echo    - Removing node_modules (this may take a while)...
    rmdir /s /q node_modules
    echo    - Done!
)

echo [3/7] Cleaning npm cache...
call npm cache clean --force

echo [4/7] Cleaning build caches...
rmdir /s /q .next 2>nul
cd ..\..
rmdir /s /q .turbo 2>nul
cd apps\web

echo [5/7] Removing package-lock.json...
if exist package-lock.json (
    del package-lock.json
)

echo [6/7] Reinstalling all dependencies...
call npm install --legacy-peer-deps

echo [7/7] Starting Web Server...
echo ==========================================
npm run dev
pause
