@echo off
echo ==================================================
echo      POLYBET NUCLEAR REPAIR TOOL ☢️
echo ==================================================
echo.
echo [1/2] Cleaning and Reinstalling API...
cd apps/api
if exist node_modules rmdir /s /q node_modules
if exist dist rmdir /s /q dist
if exist package-lock.json del package-lock.json
echo    Installing API dependencies...
call npm install
cd ../..

echo.
echo [2/2] Cleaning and Reinstalling Blockchain...
cd packages/contracts
if exist node_modules rmdir /s /q node_modules
if exist cache rmdir /s /q cache
if exist artifacts rmdir /s /q artifacts
if exist package-lock.json del package-lock.json
echo    Installing Blockchain dependencies...
call npm install
cd ../..

echo.
echo ==================================================
echo      REPAIR COMPLETE! ✅
echo ==================================================
echo Now run 'polybet.bat' normally.
pause
