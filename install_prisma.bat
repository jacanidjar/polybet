@echo off
cd apps\api
npm install @prisma/client prisma
npx prisma generate
