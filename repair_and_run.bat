@echo off
echo ==========================================
echo Polybet Final Repair ^& Launch
echo ==========================================
echo.

echo [1/6] Closing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo    - Node.js processes closed
) else (
    echo    - No Node.js processes running
)
timeout /t 2 /nobreak >nul

echo [2/6] Cleaning npm cache...
cd apps\web
call npm cache clean --force >nul 2>&1
echo    - Cache cleaned

echo [3/6] Cleaning Next.js build cache...
if exist .next (
    rmdir /s /q .next 2>nul
    echo    - .next folder removed
) else (
    echo    - No .next folder found
)

echo [4/6] Cleaning Turbo cache...
cd ..\..
if exist .turbo (
    rmdir /s /q .turbo 2>nul
    echo    - .turbo folder removed
)
cd apps\web

echo [5/6] Updating dependencies...
call npm install lucide-react@latest --save --legacy-peer-deps
echo    - Dependencies updated

echo.
echo [6/6] Starting Web Server...
echo ==========================================
npm run dev
pause
