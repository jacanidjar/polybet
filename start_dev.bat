@echo off
echo ===================================================
echo 🚀 Iniciando Ambiente de Desenvolvimento Polybet
echo ===================================================

echo [1/3] Iniciando Blockchain Local (Hardhat Node)...
start "Blockchain (Hardhat)" cmd /k "cd packages/contracts && npx hardhat node"

echo Aguardando 10 segundos para a blockchain iniciar...
timeout /t 10 /nobreak

echo [2/3] Fazendo Deploy dos Contratos...
call cmd /c "cd packages/contracts && npx hardhat run scripts/deploy.js --network localhost"

if %errorlevel% neq 0 (
    echo ❌ Erro no Deploy! Verifique o terminal anterior.
    pause
    exit /b %errorlevel%
) else (
    echo ✅ Deploy concluído com sucesso!
)

echo [3/3] Iniciando Frontend (Next.js)...
start "Frontend (Polybet)" cmd /k "cd apps/web && npm run dev"

echo ===================================================
echo 🎉 Tudo pronto!
echo - Blockchain rodando em janela separada.
echo - Frontend rodando em janela separada (http://localhost:3000).
echo ===================================================
pause
