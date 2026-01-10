@echo off
echo Cleaning Next.js cache...
cd apps\web
rmdir /s /q .next
echo Starting Server...
npm run dev
pause
