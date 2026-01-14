@echo off
chcp 65001 >nul
cls
echo.
echo    ██████╗  ██████╗ ██╗  ██╗   ██╗██████╗ ███████╗████████╗
echo    ██╔══██╗██╔═══██╗██║  ╚██╗ ██╔╝██╔══██╗██╔════╝╚══██╔══╝
echo    ██████╔╝██║   ██║██║   ╚████╔╝ ██████╔╝█████╗     ██║   
echo    ██╔═══╝ ██║   ██║██║    ╚██╔╝  ██╔══██╗██╔══╝     ██║   
echo    ██║     ╚██████╔╝███████╗██║   ██████╔╝███████╗   ██║   
echo    ╚═╝      ╚═════╝ ╚══════╝╚═╝   ╚═════╝ ╚══════╝   ╚═╝   
echo.
echo    The World's Largest Prediction Market Platform
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo [CLEANUP] Killing old processes and windows...
taskkill /F /FI "WINDOWTITLE eq Polybet Blockchain" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Polybet API" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Polybet Web" >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo    Cleanup complete. Ready to start.
echo.
echo [STARTUP SEQUENCE]
echo.
echo    1. Database (SQLite - Local)
echo    2. Blockchain (Hardhat + Contracts)
echo    3. Backend API (NestJS)
echo    4. Frontend Web (Next.js)
echo.
echo ═══════════════════════════════════════════════════════════════

echo.
echo [1/4] Starting Database...
echo    Using SQLite (No Docker required)

echo.
echo [2/4] Starting Local Blockchain...
if not exist "packages\contracts\node_modules" (
    echo    Installing Blockchain dependencies...
    cmd /c "cd packages/contracts && npm install"
)
start "Polybet Blockchain" cmd /k "cd packages/contracts && npx hardhat node"
echo    Waiting for blockchain to initialize (10s)...
timeout /t 10 /nobreak > nul

echo.
echo [2.5/4] Deploying Smart Contracts...
call cmd /c "cd packages/contracts && npx hardhat run scripts/deploy.js --network localhost"
if %errorlevel% neq 0 (
    echo.
    echo    ❌ Contract Deployment Failed! 
    echo    Check if Hardhat node is running.
    pause
    exit /b
)
echo    ✅ Contracts Deployed!

echo.
echo [3/4] Starting Backend API...
if not exist "apps\api\node_modules" (
    echo    Installing Backend API dependencies...
    cmd /c "cd apps\api && npm install"
)
start "Polybet API" cmd /k "cd apps/api && npm run start:dev"

echo.
echo [4/4] Starting Frontend Web...
start "Polybet Web" cmd /k "cd apps/web && npm run dev"

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo    🚀 SYSTEM ONLINE!
echo.
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:3001
echo    Blockchain: http://localhost:8545
echo    Database:  SQLite (Local file)
echo.
echo    (Close this window to stop nothing - services run in separate windows)
echo ═══════════════════════════════════════════════════════════════
pause
