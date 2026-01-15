@echo off
echo ===================================================
echo 🧹 LIMPANDO HISTORICO E ENVIANDO (Polybet)
echo ===================================================

echo [1/5] Resetando historico do Git (mantendo arquivos)...
:: Isso desfaz os commits locais mas mantem seu codigo salvo na pasta
git reset origin/main

echo [2/5] Removendo arquivos com senhas (Seguranca do GitHub)...
del setup_git.bat
del fix_git.bat
del fix_git_v2.bat
del fix_git_final.bat

echo [3/5] Adicionando arquivos limpos...
git add .

echo [4/5] Criando commit seguro...
git commit -m "feat: Smart Contracts and Frontend Integration (Clean)"

echo [5/5] Enviando para o GitHub...
:: O remote ja esta configurado com o token, entao so precisamos do push
git push -u origin dev
git push --tags

echo.
echo ✅ Agora deve ter ido! O GitHub bloqueou antes por seguranca.
echo Verifique: https://github.com/jacanidjar/polybet/branches
echo.
pause
