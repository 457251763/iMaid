# Frontend 前端项目

## 技术栈

- Electron (桌面应用框架)
- React 18 (UI 框架)
- Vite (构建工具)
- PIXI.js 6.x + pixi-live2d-display (Live2D 渲染)
- React Router (路由管理)
- Zustand / Redux Toolkit (状态管理)

## 目录结构

```
frontend/
├── src/
│   ├── components/      # React 组件
│   │   ├── Live2D/      # Live2D 渲染相关组件
│   │   ├── Chat/       # 聊天界面组件
│   │   └── Settings/   # 设置面板组件
│   ├── hooks/          # 自定义 React Hooks
│   ├── pages/          # 页面组件
│   ├── store/          # 状态管理
│   └── App.jsx         # 应用入口
├── public/
│   ├── models/         # Live2D 模型文件
│   └── libs/           # 第三方库 (Cubism Core)
├── package.json
└── vite.config.js
```

## 核心功能模块

### 1. Live2D 渲染模块

**功能职责**:
- 加载和渲染 Live2D 模型
- 播放模型动作和表情
- 处理用户交互（点击、拖拽）
- 视线跟随和眨眼动画

**关键文件**:
- `components/Live2D/Live2DRenderer.jsx` - 渲染器主组件
- `components/Live2D/InteractionHandler.js` - 交互处理

### 2. 聊天界面模块

**功能职责**:
- 消息列表展示
- 文字输入框
- 语音输入按钮
- 发送/接收消息

**关键文件**:
- `components/Chat/ChatPanel.jsx` - 聊天面板
- `components/Chat/MessageList.jsx` - 消息列表
- `components/Chat/ChatInput.jsx` - 输入框

### 3. 状态管理

**功能职责**:
- 全局状态管理（对话历史、用户设置）
- WebSocket 连接状态
- AI 状态（Idle/Thinking/Speaking）

**关键文件**:
- `store/useAppStore.js` - Zustand store

### 4. WebSocket 客户端

**功能职责**:
- 与后端服务建立长连接
- 消息发送与接收
- 心跳检测与重连

**关键文件**:
- `hooks/useWebSocket.js` - WebSocket Hook

## 开发计划

### Phase 1: 基础框架
- [ ] Electron + React + Vite 项目初始化
- [ ] 基础组件库配置
- [ ] Electron 主进程配置

### Phase 2: Live2D 集成
- [ ] PIXI.js 和 Live2D SDK 集成
- [ ] 模型加载与显示
- [ ] 基础动画播放

### Phase 3: 聊天功能
- [ ] 聊天界面 UI
- [ ] WebSocket 通信
- [ ] 消息同步

### Phase 4: 功能完善
- [ ] 设置面板
- [ ] 系统托盘
- [ ] 快捷键支持