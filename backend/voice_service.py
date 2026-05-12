"""
iMaid 语音服务 - 后台进程
负责语音唤醒、语音识别(STS)、语音合成(TTS)
"""

import sys
import json
import threading
import time
from loguru import logger

# 配置日志
logger.remove()
logger.add(
    sink=lambda msg: print(msg, end=""),
    level="INFO",
    format="<cyan>[VoiceService]</cyan> {message}"
)

class VoiceService:
    """语音服务主类"""
    
    def __init__(self):
        self.running = True
        self.wake_word = "小 Maid"
        self.is_listening = False
        self.last_audio_time = time.time()
        
        logger.info("语音服务初始化")
    
    def start(self):
        """启动语音服务"""
        logger.info("语音服务已启动")
        logger.info(f"唤醒词: {self.wake_word}")
        logger.info("等待命令...")
        
        # 监听 stdin 命令
        while self.running:
            try:
                line = sys.stdin.readline()
                if not line:
                    break
                
                command = line.strip()
                self.handle_command(command)
                
            except Exception as e:
                logger.error(f"处理命令时出错: {e}")
    
    def handle_command(self, command):
        """处理命令"""
        if command == "wake":
            self.wake_up()
        elif command == "sleep":
            self.go_to_sleep()
        elif command == "quit":
            self.shutdown()
        elif command.startswith("set_wake_word:"):
            self.wake_word = command.split(":", 1)[1]
            logger.info(f"唤醒词已更新: {self.wake_word}")
        elif command == "status":
            self.report_status()
        else:
            logger.warning(f"未知命令: {command}")
    
    def wake_up(self):
        """唤醒语音服务"""
        self.is_listening = True
        self.last_audio_time = time.time()
        logger.info("语音服务已唤醒")
        
        # 通知 Electron 前端
        self.send_to_renderer({
            "type": "voice_wake",
            "data": {"status": "listening"}
        })
        
        # 启动监听超时检测
        threading.Thread(target=self._listening_timeout, daemon=True).start()
    
    def go_to_sleep(self):
        """进入休眠"""
        self.is_listening = False
        logger.info("语音服务进入休眠")
        
        self.send_to_renderer({
            "type": "voice_sleep",
            "data": {"status": "idle"}
        })
    
    def _listening_timeout(self):
        """监听超时检测 - 30秒无活动则休眠"""
        timeout = 30
        while self.is_listening:
            if time.time() - self.last_audio_time > timeout:
                logger.info("监听超时，进入休眠")
                self.go_to_sleep()
                break
            time.sleep(1)
    
    def on_audio_data(self, audio_data):
        """处理音频数据"""
        self.last_audio_time = time.time()
        
        # TODO: 实现实际的语音识别
        # 1. 音频预处理
        # 2. 唤醒词检测
        # 3. 语音识别 (STT)
        
        pass
    
    def on_stt_result(self, text):
        """语音识别结果"""
        if text:
            logger.info(f"识别结果: {text}")
            
            # 发送到主后端处理
            self.send_to_renderer({
                "type": "stt_result",
                "data": {"text": text}
            })
    
    def speak(self, text):
        """语音合成 - TTS"""
        logger.info(f"开始合成语音: {text}")
        
        # TODO: 实现实际的 TTS
        # 1. 调用 TTS API
        # 2. 播放音频
        
        # 模拟完成
        self.send_to_renderer({
            "type": "tts_complete",
            "data": {"text": text}
        })
    
    def report_status(self):
        """报告服务状态"""
        status = {
            "running": self.running,
            "listening": self.is_listening,
            "wake_word": self.wake_word,
            "uptime": time.time() - start_time if 'start_time' in dir() else 0
        }
        logger.info(f"服务状态: {json.dumps(status)}")
    
    def send_to_renderer(self, message):
        """发送消息到渲染进程"""
        # 通过 stdout 发送消息，由 Electron 主进程接收
        # 实际实现需要通过进程间通信
        print(f"VTS:{json.dumps(message)}", flush=True)
    
    def shutdown(self):
        """关闭语音服务"""
        self.running = False
        logger.info("语音服务正在关闭...")
        sys.exit(0)


# 全局服务实例
voice_service = None

def main():
    """主入口"""
    global voice_service, start_time
    start_time = time.time()
    
    logger.info("=" * 40)
    logger.info("iMaid 语音服务")
    logger.info("=" * 40)
    
    voice_service = VoiceService()
    voice_service.start()


if __name__ == "__main__":
    main()