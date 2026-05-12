@echo off
chcp 65001 >nul
echo.
echo  ==============================================================
echo              iMaid - Shutdown Script
echo  ==============================================================
echo.

set "SCRIPT_DIR=%~dp0"

echo [1/4] Closing Electron...
taskkill /F /IM "electron.exe" >nul 2>&1
echo       Done

echo.
echo [2/4] Closing Node.js (Frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo       Done

echo.
echo [3/4] Closing Python (Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo       Done

echo.
echo [4/4] Cleaning up...
taskkill /F /IM "node.exe" >nul 2>&1
echo       Done

echo.
echo  ==============================================================
echo                iMaid shutdown complete
echo  ==============================================================
echo.
pause