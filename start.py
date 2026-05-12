#!/usr/bin/env python3
"""
iMaid 启动脚本 - 同时启动前后端和 Electron
"""

import os
import sys
import time
import socket
import subprocess
import threading
from pathlib import Path

# 项目路径
PROJECT_ROOT = Path(__file__).parent.absolute()
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"

# 端口配置
FRONTEND_PORT = 5173
BACKEND_PORT = 8000

# Python 路径
PYTHON_EXE = r"C:\Users\45725\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\vm\tools\python\python.exe"

# Windows 标志
IS_WINDOWS = sys.platform == 'win32'
CREATE_NEW_CONSOLE = 0x00000010 if IS_WINDOWS else 0


class IMaidStarter:
    """iMaid 启动器"""
    
    def __init__(self):
        self.processes = {}
    
    def print_banner(self):
        """打印横幅"""
        print("=" * 60)
        print("  🎀 iMaid 智能桌宠 - 启动器")
        print("=" * 60)
        print()
    
    def check_port(self, port):
        """检查端口是否被占用"""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        try:
            result = sock.connect_ex(('localhost', port))
            sock.close()
            return result == 0
        except:
            return False
    
    def wait_for_port(self, port, timeout=30):
        """等待端口就绪"""
        for _ in range(timeout):
            if self.check_port(port):
                return True
            time.sleep(1)
        return False
    
    def run_process(self, name, command, cwd=None, wait_ready=None):
        """运行进程"""
        if isinstance(command, str):
            command = command.split()
        
        try:
            process = subprocess.Popen(
                command,
                cwd=cwd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=CREATE_NEW_CONSOLE if IS_WINDOWS else 0,
                shell=IS_WINDOWS
            )
            self.processes[name] = process
            
            if wait_ready:
                print(f"    ⏳ 等待 {name} 就绪...", end="", flush=True)
                if self.wait_for_port(wait_ready):
                    print(" ✓")
                    return True
                else:
                    print(" ✗")
                    return False
            return True
            
        except Exception as e:
            print(f"    ✗ 启动失败: {e}")
            return False
    
    def check_dependencies(self):
        """检查依赖"""
        print("[检查依赖]")
        
        # 检查 Python
        try:
            result = subprocess.run(
                [PYTHON_EXE, "--version"],
                capture_output=True,
                text=True
            )
            print(f"    ✓ Python: {result.stdout.strip()}")
        except:
            print("    ✗ 未找到 Python")
            return False
        
        # 检查 npm
        try:
            result = subprocess.run(
                ["npm", "--version"],
                capture_output=True,
                text=True
            )
            print(f"    ✓ npm: {result.stdout.strip()}")
        except:
            print("    ✗ 未找到 npm，请安装 Node.js")
            return False
        
        # 检查目录
        if not BACKEND_DIR.exists():
            print("    ✗ 后端目录不存在")
            return False
        if not FRONTEND_DIR.exists():
            print("    ✗ 前端目录不存在")
            return False
        
        print()
        return True
    
    def start_backend(self):
        """启动后端"""
        print("[启动后端服务]")
        
        if self.check_port(BACKEND_PORT):
            print("    ✓ 后端已在运行 (跳过)")
            return True
        
        return self.run_process(
            "Backend",
            [PYTHON_EXE, str(BACKEND_DIR / "main.py")],
            cwd=str(BACKEND_DIR),
            wait_ready=BACKEND_PORT
        )
    
    def start_frontend(self):
        """启动前端"""
        print("[启动前端服务]")
        
        if self.check_port(FRONTEND_PORT):
            print("    ✓ 前端已在运行 (跳过)")
            return True
        
        return self.run_process(
            "Frontend",
            ["npm", "run", "dev"],
            cwd=str(FRONTEND_DIR),
            wait_ready=FRONTEND_PORT
        )
    
    def start_electron(self):
        """启动 Electron"""
        print("[启动 Electron 应用]")
        
        return self.run_process(
            "Electron",
            ["npm", "run", "electron:dev"],
            cwd=str(FRONTEND_DIR)
        )
    
    def start(self):
        """启动所有服务"""
        self.print_banner()
        
        # 检查依赖
        if not self.check_dependencies():
            input("\n按 Enter 键退出...")
            return False
        
        # 启动后端
        print()
        backend_ok = self.start_backend()
        
        # 启动前端
        print()
        frontend_ok = self.start_frontend()
        
        # 等待前端就绪后启动 Electron
        if frontend_ok:
            print()
            time.sleep(2)
            electron_ok = self.start_electron()
        
        # 打印结果
        print()
        print("=" * 60)
        print("  🎀 iMaid 已启动！")
        print("=" * 60)
        print()
        print(f"  🌐 前端:  http://localhost:{FRONTEND_PORT}")
        print(f"  🌐 后端:  http://localhost:{BACKEND_PORT}")
        print(f"  📖 API:   http://localhost:{BACKEND_PORT}/docs")
        print()
        print("  💡 在系统托盘中找到 iMaid 图标")
        print()
        
        return True
    
    def stop(self):
        """停止所有服务"""
        print("\n[停止服务]")
        
        for name, process in self.processes.items():
            try:
                process.terminate()
                process.wait(timeout=5)
                print(f"    ✓ {name} 已停止")
            except:
                process.kill()
                print(f"    ✓ {name} 已强制终止")
        
        # 清理残留进程
        if IS_WINDOWS:
            subprocess.run('taskkill /F /IM node.exe /T', shell=True, capture_output=True)
            subprocess.run('taskkill /F /IM python.exe /T', shell=True, capture_output=True)
        
        print("\n再见！")


def main():
    """主入口"""
    starter = IMaidStarter()
    
    try:
        success = starter.start()
        if success:
            print("\n按 Ctrl+C 退出...")
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        print("\n")
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        starter.stop()
        input("\n按 Enter 键退出...")


if __name__ == "__main__":
    main()