#!/usr/bin/env python3
"""
iMaid 关闭脚本 - 同时关闭前后端和 Electron 服务
"""

import os
import sys
import subprocess
import time
import signal

# Windows 标志
IS_WINDOWS = sys.platform == 'win32'


def print_banner():
    """打印横幅"""
    print("=" * 60)
    print("  🎀 iMaid 智能桌宠 - 关闭器")
    print("=" * 60)
    print()


def kill_process_by_name(name, windows_title=False):
    """根据进程名终止进程"""
    try:
        if IS_WINDOWS:
            if windows_title:
                # 使用 taskkill 按窗口标题终止
                subprocess.run(
                    f'taskkill /F /FI "WINDOWTITLE eq {name}"',
                    shell=True,
                    capture_output=True
                )
            else:
                subprocess.run(
                    f'taskkill /F /IM "{name}"',
                    shell=True,
                    capture_output=True
                )
        else:
            subprocess.run(
                ['pkill', '-f', name],
                capture_output=True
            )
        return True
    except Exception as e:
        print(f"    ⚠ 终止 {name} 时出错: {e}")
        return False


def kill_process_by_port(port):
    """根据端口号终止进程"""
    try:
        if IS_WINDOWS:
            # 查找占用端口的进程
            result = subprocess.run(
                f'netstat -ano | findstr ":{port}" | findstr "LISTENING"',
                shell=True,
                capture_output=True,
                text=True
            )
            
            for line in result.stdout.strip().split('\n'):
                if line:
                    parts = line.split()
                    if len(parts) >= 5:
                        pid = parts[-1]
                        try:
                            subprocess.run(
                                f'taskkill /F /PID {pid}',
                                shell=True,
                                capture_output=True
                            )
                            print(f"    ✓ 已终止占用端口 {port} 的进程 (PID: {pid})")
                        except:
                            pass
        else:
            # Unix 系统
            subprocess.run(
                f'lsof -ti:{port} | xargs kill -9',
                shell=True,
                capture_output=True
            )
        return True
    except Exception as e:
        print(f"    ⚠ 清理端口 {port} 时出错: {e}")
        return False


def kill_all_imaid():
    """终止所有 iMaid 相关进程"""
    print("[1/5] 关闭 Electron...")
    if IS_WINDOWS:
        kill_process_by_name("electron.exe")
    else:
        kill_process_by_name("Electron")
    print("    ✓ Electron 已关闭")

    print("\n[2/5] 关闭 Node.js 进程...")
    if IS_WINDOWS:
        # 关闭所有 node.exe 进程（前端服务）
        subprocess.run(
            'taskkill /F /IM "node.exe" /T',
            shell=True,
            capture_output=True
        )
    else:
        kill_process_by_name("node")
    print("    ✓ Node 进程已关闭")

    print("\n[3/5] 关闭 Python 进程...")
    if IS_WINDOWS:
        # 只关闭后端相关 Python 进程
        subprocess.run(
            'taskkill /F /FI "WINDOWTITLE eq iMaid*"',
            shell=True,
            capture_output=True
        )
        # 也尝试关闭 uvicorn
        subprocess.run(
            'taskkill /F /IM "python.exe" /T',
            shell=True,
            capture_output=True
        )
    else:
        kill_process_by_name("uvicorn")
        kill_process_by_name("python")
    print("    ✓ Python 进程已关闭")

    print("\n[4/5] 清理占用端口...")
    kill_process_by_port(5173)  # 前端端口
    kill_process_by_port(8000)  # 后端端口
    print("    ✓ 端口已释放")

    print("\n[5/5] 检查残留进程...")
    time.sleep(1)
    
    # 再次检查是否有残留
    if IS_WINDOWS:
        result = subprocess.run(
            'tasklist /FI "IMAGENAME eq node.exe" /FO LIST',
            shell=True,
            capture_output=True,
            text=True
        )
        if "node.exe" in result.stdout:
            print("    ⚠ 仍有 node 进程残留，已再次清理")
            subprocess.run('taskkill /F /IM "node.exe" /T', shell=True)
    else:
        result = subprocess.run(
            'pgrep -f "imaid|vite|electron"',
            shell=True,
            capture_output=True
        )
        if result.stdout:
            print("    ⚠ 仍有残留进程，已清理")
            subprocess.run('pkill -9 -f "imaid|vite|electron"', shell=True)


def main():
    """主入口"""
    print_banner()
    
    try:
        kill_all_imaid()
        
        print()
        print("=" * 60)
        print("  ✅ iMaid 已完全关闭")
        print("=" * 60)
        print()
        print("  💡 可以安全退出")
        print()
        
    except Exception as e:
        print(f"\n❌ 关闭时出错: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
    
    if IS_WINDOWS:
        input("\n按 Enter 键退出...")