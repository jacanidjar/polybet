@echo off
echo ==========================================
echo Polybet Setup Script
echo ==========================================

echo [1/3] Installing Contracts Dependencies...
cd packages\contracts
call npm install
cd ..\..

echo [2/3] Installing Web Dependencies...
cd apps\web
call npm install --legacy-peer-deps
call npm install @privy-io/react-auth@latest --legacy-peer-deps
cd ..\..

echo [3/3] Installing API Dependencies...
cd apps\api
call npm install
cd ..\..

echo ==========================================
echo Setup Complete!
echo To start the app:
echo 1. cd apps\web
echo 2. npm run dev
echo ==========================================
pause
