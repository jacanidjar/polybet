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
echo [CLEANUP] Killing all old processes...
taskkill /F /FI "WINDOWTITLE eq Polybet Blockchain" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Polybet API" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Polybet Web" >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo    ✓ Processes terminated.

echo.
echo [RESET] Preserving user data...
echo    ✓ Users will be preserved between restarts.

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo [STARTUP SEQUENCE]
echo.
echo    1. Database (SQLite - Local)
echo    2. Blockchain (Hardhat + 10 Markets)
echo    3. Backend API (NestJS)
echo    4. Frontend Web (Next.js)
echo.
echo ═══════════════════════════════════════════════════════════════

echo.
echo [1/5] Preparing Database...
echo    Using SQLite (No Docker required)
echo    Recreating schema...
cd apps\api
call npx prisma db push --skip-generate >nul 2>&1
cd ..\..
echo    ✓ Database schema ready.

echo.
echo [2/5] Starting Local Blockchain...
if not exist "packages\contracts\node_modules" (
    echo    Installing Blockchain dependencies...
    cmd /c "cd packages/contracts && npm install"
)
start "Polybet Blockchain" cmd /k "cd packages/contracts && npx hardhat node"
echo    Waiting for blockchain to initialize (10s)...
timeout /t 10 /nobreak > nul

echo.
echo [3/5] Deploying Smart Contracts (10 Markets)...
call cmd /c "cd packages/contracts && npx hardhat run scripts/deploy.js --network localhost"
if %errorlevel% neq 0 (
    echo.
    echo    ❌ Contract Deployment Failed! 
    echo    Check if Hardhat node is running.
    pause
    exit /b
)
echo    ✅ 10 Markets Deployed!

echo.
echo [4/5] Starting Backend API...
if not exist "apps\api\node_modules" (
    echo    Installing Backend API dependencies...
    cmd /c "cd apps\api && npm install"
)
start "Polybet API" cmd /k "cd apps/api && npm run start:dev"
echo    Waiting for API to start (8s)...
timeout /t 8 /nobreak > nul

echo.
echo [4.5/5] Seeding Markets in Database...
curl -X POST http://localhost:3001/markets/seed -s >nul 2>&1
echo    ✅ 10 Markets seeded in database!

echo.
echo [5/5] Starting Frontend Web...
start "Polybet Web" cmd /k "cd apps/web && npm run dev"

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo    🚀 SYSTEM ONLINE!
echo.
echo    Frontend:   http://localhost:3000
echo    Backend:    http://localhost:3001
echo    Blockchain: http://localhost:8545
echo    Database:   SQLite (Fresh)
echo.
echo    📊 10 Markets Created:
echo       #1 Trump 2024 Election
echo       #2 Bitcoin $100k
echo       #3 Fed Rate Cut
echo       #4 SpaceX Starship
echo       #5 Lakers NBA
echo       #6 Taylor Swift Album
echo       #7 ETH Flippening
echo       #8 AI Jobs
echo       #9 Apple AR Glasses
echo       #10 World Cup Penalties
echo.
echo    💡 First time? Click "Get $1,000" to fund your wallet!
echo.
echo ═══════════════════════════════════════════════════════════════
pause
