@echo off
chcp 65001 >nul
echo.
echo  ==============================================================
echo              iMaid - Startup Launcher
echo  ==============================================================
echo.

cd /d "%~dp0"

echo [1/5] Checking port status...

set FRONTEND_RUNNING=0
netstat -ano | findstr ":5173 " >nul 2>&1
if not errorlevel 1 set FRONTEND_RUNNING=1
if "%FRONTEND_RUNNING%"=="1" echo       Frontend already running (port 5173)

set BACKEND_RUNNING=0
netstat -ano | findstr ":8000 " >nul 2>&1
if not errorlevel 1 set BACKEND_RUNNING=1
if "%BACKEND_RUNNING%"=="1" echo       Backend already running (port 8000)

echo.
echo [2/5] Starting backend...
if "%BACKEND_RUNNING%"=="0" start "iMaid-Backend" cmd /c "cd /d %~dp0backend && python main.py"
if "%BACKEND_RUNNING%"=="0" echo       Backend starting (port 8000)...
if "%BACKEND_RUNNING%"=="1" echo       Backend already running, skip

echo.
echo [3/5] Starting frontend...
if "%FRONTEND_RUNNING%"=="0" start "iMaid-Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"
if "%FRONTEND_RUNNING%"=="0" echo       Frontend starting (port 5173)...
if "%FRONTEND_RUNNING%"=="1" echo       Frontend already running, skip

echo.
echo [4/5] Waiting for services...
timeout /t 8 /nobreak >nul

netstat -ano | findstr ":5173 " >nul 2>&1
if not errorlevel 1 (echo       [OK] Frontend ready) else (echo       [FAIL] Frontend failed)

netstat -ano | findstr ":8000 " >nul 2>&1
if not errorlevel 1 (echo       [OK] Backend ready) else (echo       [FAIL] Backend failed)

echo.
echo [5/5] Starting Electron app...
start "iMaid" cmd /c "cd /d %~dp0frontend && npm run electron:dev"

echo.
echo  ==============================================================
echo                iMaid started!
echo  ==============================================================
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo.
echo  Tip: Find iMaid icon in system tray
echo.
pause