# iMaid - Windows 智能桌宠系统设计文档

**版本**: 2.1  
**日期**: 2026-05-14  
**项目目标**: 开发类似 Neuro-sama 的 Windows 桌面宠物，支持 AI 对话、Live2D 形象展示、长期记忆和多平台联动

**开发进度**:
- v0.2 ✅ 已完成
- v0.3 🚧 开发中 (Live2D 渲染)
- v0.4 📋 计划中 (语音服务)

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术选型与参考框架](#2-技术选型与参考框架)
3. [系统架构设计](#3-系统架构设计)
4. [悬浮窗口设计](#4-悬浮窗口设计)
5. [语音服务设计](#5-语音服务设计)
6. [P0 功能详细设计](#6-p0-功能详细设计)
7. [P1 功能详细设计](#7-p1-功能详细设计)
8. [数据存储方案](#8-数据存储方案)
9. [API 接口设计](#9-api-接口设计)
10. [开发路线图](#10-开发路线图)
11. [技术风险与应对策略](#11-技术风险与应对策略)

---

## 1. 项目概述

### 1.1 核心目标

构建一个运行在 Windows 平台的智能桌面宠物系统，具备以下核心能力：

- **悬浮窗口模式**: 类似输入法，悬浮在屏幕上始终可见
- **AI 对话能力**: 基于大语言模型的自然语言交互
- **语音交互**: 随时唤醒的语音对话能力
- **视觉形象**: 使用 Live2D 技术展示动态角色形象
- **长期记忆**: 通过向量数据库实现持久化知识存储
- **多平台联动**: 支持手机 APP 和 QQ 等平台的互联互通

### 1.2 功能优先级

| 优先级 | 功能模块 | 描述 |
|--------|----------|------|
| P0 | 悬浮窗口 | 始终置顶、透明、角落悬浮 |
| P0 | 大模型接入 | 支持多种 LLM API (DeepSeek/Gemini 等) |
| P0 | Live2D 渲染 | 流畅的 2D 角色动画展示 |
| P0 | 实时对话 | 双向 WebSocket 通信，低延迟响应 |
| P0 | 语音服务 | 热词唤醒、语音识别、语音合成 |
| P0 | Token 管理 | 智能上下文压缩和成本控制 |
| P0 | 长期记忆 | ChromaDB 向量存储 + 结构化知识库 |
| P1 | 跨平台记忆同步 | 多设备间记忆状态同步 |
| P1 | 跨平台联动 | QQ 机器人、手机 APP 交互支持 |

---

## 2. 技术选型与参考框架

### 2.1 桌面端技术栈

#### 推荐方案: Electron + React + Vite

**优势分析**:

- 成熟的跨平台桌面应用框架
- 生态丰富，开发效率高
- 支持 WebGL/OpenGL，Live2D 渲染性能优秀
- 内置多进程架构，UI 与业务逻辑分离
- 支持透明窗口、置顶等悬浮特性

### 2.2 窗口模式

#### 悬浮球模式 (v0.2+)

```
┌──────────────────────┐
│  ┌────────────────┐  │
│  │   Live2D 角色   │  │
│  │   (透明背景)    │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │   聊天消息区域  │  │
│  │   (可折叠)      │  │
│  └────────────────┘  │
└──────────────────────┘
         ↕ 可拖拽移动
    悬浮在桌面任意位置
```

**配置参数**:

| 参数 | 值 | 说明 |
|------|-----|------|
| 宽度 | 320px | 悬浮球宽度 |
| 高度 | 400px | 悬浮球高度 |
| 位置 | 右下角 | 默认位置可拖动 |
| 置顶 | true | 始终在其他窗口之上 |
| 透明 | true | 支持透明背景 |
| 边框 | 无 | 无系统边框 |
| 任务栏 | 隐藏 | 不显示在任务栏 |

### 2.3 语音服务技术

**组件架构**:

```
┌─────────────────────────────────────────────────────┐
│              Python 语音服务 (后台进程)              │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  音频采集    │  │   热词检测    │  │   VAD     │ │
│  │  (pyaudio)   │  │  (porcupine) │  │ (webrtc)  │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│         │                  │                │        │
│         └──────────────────┼────────────────┘        │
│                            ▼                         │
│                 ┌────────────────┐                   │
│                 │  语音识别 STT   │                   │
│                 │  (SenseVoice)   │                   │
│                 └────────────────┘                   │
│                            │                         │
│                            ▼                         │
│                 ┌────────────────┐                   │
│                 │  语音合成 TTS   │                   │
│                 │   (CosyVoice)  │                   │
│                 └────────────────┘                   │
└─────────────────────────────────────────────────────┘
                    │
                    │ IPC / 管道通信
                    ▼
┌─────────────────────────────────────────────────────┐
│              Electron 主进程                         │
└─────────────────────────────────────────────────────┘
```

---

## 3. 系统架构设计

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Electron)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   Live2D 渲染器   │  │    聊天界面      │  │    设置面板    │ │
│  │  (PIXI.js)       │  │   (React)        │  │   (React)      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                         Electron 主进程                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  悬浮窗口管理     │  │   系统托盘        │  │   全局快捷键   │ │
│  │  (alwaysOnTop)   │  │   (Tray)         │  │   (Shortcut)   │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  IPC 通信        │  │  进程管理        │  │  窗口控制      │ │
│  │  (ipcMain)       │  │  (子进程 spawn)  │  │  (移动/透明)   │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                    │                              │
          进程管道通信                      WebSocket / HTTP
                    │                              │
                    ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Python 后台服务层                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   语音服务       │  │   WebSocket 服务  │  │   HTTP 服务    │ │
│  │  (voice_service) │  │  (ws_server)      │  │  (FastAPI)     │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   对话管理器      │  │   记忆管理器      │  │   状态机       │ │
│  │  (DialogueMgr)   │  │  (MemoryMgr)     │  │  (StateMachine)│ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   LLM 服务层      │  │   TTS 服务层      │  │   STT 服务层   │ │
│  │  (LLMProvider)   │  │  (CosyVoice)     │  │  (SenseVoice)  │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                          数据存储层                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   ChromaDB       │  │   Redis          │  │   SQLite       │ │
│  │   (向量存储)      │  │   (会话缓存)      │  │   (结构化数据)  │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 模块职责划分

#### 3.2.1 Electron 主进程

| 模块 | 文件 | 职责 |
|------|------|------|
| 窗口管理 | `electron/main.js` | 悬浮窗口创建、置顶、透明、移动 |
| 系统托盘 | `electron/main.js` | 托盘图标、右键菜单 |
| 快捷键 | `electron/main.js` | 全局快捷键注册 |
| IPC 处理 | `electron/main.js` | 与渲染进程和语音服务通信 |
| 进程管理 | `electron/main.js` | 启动/停止语音服务 |

#### 3.2.2 渲染进程 (React)

| 模块 | 文件 | 职责 |
|------|------|------|
| Live2D 渲染 | `Live2DRenderer.js` | 模型加载、动画播放、交互响应 |
| 聊天组件 | `ChatPanel.jsx` | 消息展示、输入框、语音输入 |
| 状态管理 | `store.js` | 全局状态、对话历史、用户设置 |
| WebSocket 客户端 | `ws-client.js` | 与后端实时通信 |
| 拖拽控制 | `DraggableContainer.jsx` | 窗口拖拽移动 |

#### 3.2.3 Python 后台服务

| 模块 | 文件 | 职责 |
|------|------|------|
| 语音服务 | `voice_service.py` | 热词检测、STT、TTS |
| WebSocket 服务 | `ws_server.py` | 客户端连接管理、消息路由 |
| 对话管理 | `dialogue_manager.py` | 上下文构建、LLM 调用 |
| 记忆管理 | `memory_manager.py` | ChromaDB 操作、向量检索 |
| Token 管理 | `token_manager.py` | 用量统计、成本控制 |
| 状态机 | `state_machine.py` | 对话状态流转 |

---

## 4. 悬浮窗口设计

### 4.1 窗口配置

```javascript
// electron/main.js
const WINDOW_CONFIG = {
  width: 320,
  height: 400,
  opacity: 0.95,
  alwaysOnTop: true,
  transparent: true,
  frame: false,
  resizable: false,
  skipTaskbar: true,
  focusable: true,
  hasShadow: true
}
```

### 4.2 窗口行为

| 行为 | 实现 |
|------|------|
| 启动位置 | 右下角 (屏幕工作区) |
| 拖拽移动 | 支持拖拽标题区域 |
| 关闭按钮 | 隐藏到托盘而非退出 |
| 快捷键 | Ctrl+Shift+I 显示/隐藏 |
| 语音快捷键 | Ctrl+Shift+V 开始语音 |

### 4.3 拖拽实现

```javascript
// 前端可拖拽容器
class DraggableContainer extends React.Component {
  handleMouseDown = (e) => {
    this.dragging = true
    this.startX = e.screenX
    this.startY = e.screenY
    
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  }
  
  handleMouseMove = (e) => {
    if (!this.dragging) return
    
    const deltaX = e.screenX - this.startX
    const deltaY = e.screenY - this.startY
    
    // 通过 IPC 发送移动请求
    window.electronAPI.moveWindow(
      window.screenX + deltaX,
      window.screenY + deltaY
    )
  }
}
```

### 4.4 透明背景实现

```css
/* 前端透明背景 */
.live2d-container {
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 标题栏区域用于拖拽 */
.title-bar {
  -webkit-app-region: drag;
  cursor: move;
  height: 30px;
}
```

---

## 5. 语音服务设计

### 5.1 服务架构

```
用户说话 → 音频采集 → 热词检测 → VAD → STT → 文本
                              ↓
                         唤醒成功
                              ↓
用户继续说话 → 持续录音 → 端点检测 → STT → 发送对话

AI 回复 → TTS 合成 → 音频播放 → 动画播放
```

### 5.2 IPC 通信协议

```
┌─────────────┐          ┌─────────────┐
│  Electron   │          │   Python    │
│  主进程     │          │  语音服务   │
└──────┬──────┘          └──────┬──────┘
       │                        │
       │    stdin/stdout       │
       │◄──────────────────────►│
       │                        │
       │    IPC (ipcMain)       │
       │◄──────────────────────►│
       │                        │
       │    WebSocket           │
       └────────────────────────┘
```

### 5.3 命令协议

| 命令 | 方向 | 说明 |
|------|------|------|
| `wake` | Electron → Python | 唤醒语音服务 |
| `sleep` | Electron → Python | 进入休眠 |
| `set_wake_word:{word}` | Electron → Python | 设置唤醒词 |
| `status` | Electron → Python | 获取服务状态 |
| `quit` | Electron → Python | 关闭服务 |

### 5.4 事件协议

| 事件 | 说明 |
|------|------|
| `voice_wake` | 语音服务已唤醒 |
| `voice_sleep` | 语音服务进入休眠 |
| `stt_result` | 语音识别结果 |
| `tts_complete` | 语音合成完成 |

### 5.5 热词唤醒设计

```python
# voice_service.py
class VoiceService:
    def __init__(self):
        self.wake_word = "小 Maid"
        self.is_listening = False
        
    def detect_wake_word(self, audio_chunk):
        """检测唤醒词 - 使用 porcupine 或类似库"""
        # TODO: 实现热词检测
        pass
    
    def on_wake(self):
        """唤醒回调"""
        self.is_listening = True
        self.send_to_renderer({
            "type": "voice_wake",
            "data": {"status": "listening"}
        })
```

---

## 6. P0 功能详细设计

### 6.1 悬浮窗口实现

```javascript
// 创建悬浮窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 320,
    height: 400,
    x: screenWidth - 340,  // 右下角
    y: screenHeight - 420,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    backgroundColor: '#00000000',  // 完全透明
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })
}
```

### 6.2 语音服务集成

```python
# 语音服务主循环
def main():
    service = VoiceService()
    
    while service.running:
        command = sys.stdin.readline().strip()
        service.handle_command(command)
```

### 6.3 LLM 多 API 适配层

同原设计文档 4.1 节

### 6.4 Live2D 渲染

同原设计文档 4.2 节

### 6.5 实时对话

同原设计文档 4.3 节

### 6.6 Token 管理

同原设计文档 4.4 节

### 6.7 长期记忆

同原设计文档 4.5 节

---

## 7. P1 功能详细设计

### 7.1 跨平台记忆同步

同原设计文档 5.1 节

### 7.2 QQ 平台联动

同原设计文档 5.2 节

### 7.3 手机端 APP 设计

同原设计文档 5.3 节

---

## 8. 数据存储方案

同原设计文档第 6 节

---

## 9. API 接口设计

### 9.1 WebSocket 接口

同原设计文档 7.1 节

### 9.2 REST API

同原设计文档 7.2 节

### 9.3 IPC 接口 (Electron ↔ Python)

```javascript
// Preload 脚本暴露的 API
window.electronAPI = {
  // 语音控制
  startVoiceMode: () => ipcRenderer.send('start-voice-mode'),
  sendToVoiceService: (message) => ipcRenderer.invoke('send-to-voice-service', message),
  
  // 窗口控制
  moveWindow: (x, y) => ipcRenderer.send('move-window', { x, y }),
  moveToCorner: () => ipcRenderer.send('move-to-corner'),
  setOpacity: (opacity) => ipcRenderer.send('set-opacity', opacity),
  
  // 事件监听
  onStartVoiceMode: (callback) => ipcRenderer.on('start-voice-mode', callback),
  onVoiceResult: (callback) => ipcRenderer.on('voice-result', (e, r) => callback(r))
}
```

---

## 10. 开发路线图

### 10.1 v0.2 悬浮窗口版本 ✅ 已完成

- [x] 重构 Electron 窗口配置
- [x] 实现透明、置顶、无边框窗口
- [x] 窗口拖拽移动功能
- [x] 系统托盘集成
- [x] 全局快捷键注册

### 10.2 v0.3 Live2D 渲染版本 🚧 开发中

- [ ] Live2D 模型加载与渲染
- [ ] 角色动画系统
- [ ] 表情切换与动作响应
- [ ] PIXI.js 集成 pixi-live2d-display

### 10.3 v0.4 语音服务版本 📋 计划中

- [ ] 创建 Python 语音服务进程
- [ ] 实现 IPC 通信管道
- [ ] 热词检测集成
- [ ] STT/TTS 接口设计

### 10.4 v0.5-v0.8 (同原计划)

- 实时对话、记忆系统、Token 管理、设置面板

### 10.5 v1.0 MVP 版本

- [ ] 系统托盘完善
- [ ] 快捷键优化
- [ ] 性能优化
- [ ] Bug 修复

### 10.6 v1.1-v1.2 (同原计划)

- QQ 机器人、跨平台同步

### 10.7 里程碑

| 阶段 | 版本 | 状态 | 交付物 |
|------|------|------|--------|
| 悬浮球基础 | v0.2 | ✅ 完成 | 可拖拽悬浮的桌宠窗口 |
| Live2D渲染 | v0.3 | 🚧 开发中 | 动态角色形象展示 |
| 语音交互 | v0.4 | 📋 计划 | 支持语音唤醒的桌宠 |
| 对话功能 | v0.5 | 📋 计划 | 完整对话能力 |
| 功能完善 | v0.8 | 📋 计划 | 记忆、设置、Token 管理 |
| MVP | v1.0 | 📋 计划 | 可发布的桌面应用 |
| 跨平台 | v1.2 | 📋 计划 | QQ 联动、多设备同步 |

---

## 11. 技术风险与应对策略

### 11.1 新增风险

| 风险项 | 概率 | 影响 | 应对策略 |
|--------|------|------|----------|
| 透明窗口性能问题 | 中 | 中 | 使用 GPU 加速、优化渲染 |
| 语音服务崩溃 | 低 | 高 | 进程监控、自动重启 |
| 麦克风权限问题 | 中 | 高 | 用户引导、权限提示 |
| 热词误触发 | 中 | 中 | 置信度阈值、可配置敏感度 |

### 11.2 其他风险

同原设计文档 9.1 节

---

## 附录

### A. 快捷键参考

| 快捷键 | 功能 |
|--------|------|
| Ctrl+Shift+I | 显示/隐藏桌宠 |
| Ctrl+Shift+V | 开始语音对话 |
| Ctrl+, | 打开设置 |

### B. 配置文件

```javascript
// 窗口配置
WINDOW_CONFIG = {
  width: 320,
  height: 400,
  opacity: 0.95,
  alwaysOnTop: true,
  transparent: true,
  frame: false,
  resizable: false,
  skipTaskbar: true
}
```

---

**文档版本**: v2.0  
**最后更新**: 2026-05-12  
**维护者**: iMaid Development Team