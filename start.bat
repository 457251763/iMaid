@echo off
chcp 65001 >nul
echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║           iMaid 智能桌宠 - 启动器                        ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:: 检查 Python 路径
set "PYTHON_EXE=C:\Users\45725\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\vm\tools\python\python.exe"

if not exist "%PYTHON_EXE%" (
    set "PYTHON_EXE=python"
)

:: 检查 npm
where npm >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 npm，请确保已安装 Node.js
    pause
    exit /b 1
)

echo [1/5] 检查端口状态...
netstat -ano | findstr ":5173" >nul 2>&1
if %errorlevel% equ 0 (
    echo       前端服务已在运行 (端口 5173)
    set "FRONTEND_RUNNING=1"
) else (
    set "FRONTEND_RUNNING=0"
)

netstat -ano | findstr ":8000" >nul 2>&1
if %errorlevel% equ 0 (
    echo       后端服务已在运行 (端口 8000)
    set "BACKEND_RUNNING=1"
) else (
    set "BACKEND_RUNNING=0"
)

echo.
echo [2/5] 启动后端服务...
if %BACKEND_RUNNING% equ 1 (
    echo       后端已启动，跳过
) else (
    start "iMaid-Backend" cmd /c "cd /d "%SCRIPT_DIR%backend" && %PYTHON_EXE% main.py"
    echo       后端启动中 (端口 8000)...
)

echo.
echo [3/5] 启动前端服务...
if %FRONTEND_RUNNING% equ 1 (
    echo       前端已启动，跳过
) else (
    start "iMaid-Frontend" cmd /c "cd /d "%SCRIPT_DIR%frontend" && npm run dev"
    echo       前端启动中 (端口 5173)...
)

echo.
echo [4/5] 等待服务就绪...
timeout /t 8 /nobreak >nul

:: 检查服务是否启动成功
netstat -ano | findstr ":5173" >nul 2>&1
if %errorlevel% equ 0 (
    echo       ✓ 前端服务已就绪
) else (
    echo       ✗ 前端服务启动失败
)

netstat -ano | findstr ":8000" >nul 2>&1
if %errorlevel% equ 0 (
    echo       ✓ 后端服务已就绪
) else (
    echo       ✗ 后端服务启动失败
)

echo.
echo [5/5] 启动 Electron 应用...
start "iMaid" cmd /c "cd /d "%SCRIPT_DIR%frontend" && npm run electron:dev"

echo.
echo ════════════════════════════════════════════════════════════
echo  iMaid 已启动！
echo ════════════════════════════════════════════════════════════
echo.
echo  🌐 前端: http://localhost:5173
echo  🌐 后端: http://localhost:8000
echo  📖 API文档: http://localhost:8000/docs
echo.
echo  💡 提示: 在系统托盘中找到 iMaid 图标，可右键查看菜单
echo.
pause