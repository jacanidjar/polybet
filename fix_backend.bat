@echo off
cd apps\api
npm install
npx prisma generate
npx prisma db push
