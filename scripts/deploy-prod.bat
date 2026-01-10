@echo off
echo ===================================
echo   Polybet - Production Deployment
echo ===================================

echo [1/4] Stopping current containers...
docker-compose -f docker-compose.prod.yml down

echo [2/4] Pulling latest updates (if any)...
REM git pull origin main

echo [3/4] Building production images...
docker-compose -f docker-compose.prod.yml build

echo [4/4] Starting environment...
docker-compose -f docker-compose.prod.yml up -d

echo.
echo Deployment Complete!
echo API: http://localhost:3000
echo Web: http://localhost:3000
echo.
pause
