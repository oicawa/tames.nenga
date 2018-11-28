@echo off

setlocal
set TAMES_CONFIG_PATH=%~dp0\config.json
echo ==============================
echo config file path
echo ==============================
echo [%TAMES_CONFIG_PATH%]
echo.

echo ==============================
echo tames relative path
echo ==============================
set TAMES_PATH=%1
if "%TAMES_PATH%"=="" set /p TAMES_PATH="  Input 'tames' directory relative path >> "
echo [%TAMES_PATH%]
echo.

echo ==============================
echo port
echo ==============================
set TAMES_PORT=%2
if "%TAMES_PORT%"=="" set /p TAMES_PORT="  Input 'tames' port number >> "
if "%TAMES_PORT%"=="" set TAMES_PORT=3000
echo [%TAMES_PORT%]
echo.

cd %TAMES_PATH%
lein ring server-headless %TAMES_PORT%

pause
