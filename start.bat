@echo off
cd /d "%~dp0"

echo iMaid Starting...

echo [1] Backend
start "iMaid-Backend" cmd /k "cd /d C:\Users\45725\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a028ec5549a76cd5fc3895c\iMaid-main\backend && python main.py"

timeout /t 3 /nobreak >nul

echo [2] Electron (includes Vite)
start "iMaid" cmd /k "cd /d C:\Users\45725\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a028ec5549a76cd5fc3895c\iMaid-main\frontend && npm run electron:dev"

echo Done! Look for iMaid in system tray.
pause