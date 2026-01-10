@echo off
echo Installing next-themes...
call npm install next-themes --save
if %ERRORLEVEL% NEQ 0 (
    echo Installation failed! > install_status.txt
) else (
    echo SUCCESS > install_status.txt
)
exit /b %ERRORLEVEL%
