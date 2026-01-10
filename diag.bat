@echo off
echo Starting diagnostics > diag.log
echo date %date% %time% >> diag.log
echo Checking docker... >> diag.log
docker ps >> diag.log 2>&1
echo Checking npm... >> diag.log
call npm --version >> diag.log 2>&1
echo Checking node... >> diag.log
node --version >> diag.log 2>&1
echo Done. >> diag.log
