# iMaid - 智能 Windows 桌宠系统

## 项目概述

类似 Neuro-sama 的 Windows 桌面宠物，具备 AI 对话、Live2D 形象展示、长期记忆和多平台联动能力。

## 技术架构

```
┌─────────────────────────────────────────┐
│           Frontend (Electron)           │
│  React + Vite + PIXI.js (Live2D)        │
└─────────────────┬───────────────────────┘
                  │ WebSocket / HTTP
┌─────────────────┴───────────────────────┐
│           Backend (Python)             │
│  FastAPI + ChromaDB + Redis            │
│  LLM: DeepSeek / MiniMax               │
└─────────────────────────────────────────┘
```

## 目录结构

```
iMaid/
├── DESIGN.md           # 设计文档
├── README.md           # 项目说明
├── frontend/           # 前端项目
│   ├── README.md       # 前端功能说明
│   └── src/            # 前端源码
└── backend/            # 后端服务
    ├── README.md       # 后端功能说明
    ├── services/       # 业务逻辑
    ├── models/         # 数据模型
    ├── routes/         # API 路由
    ├── memory/         # 向量存储
    └── utils/          # 工具函数
```

## 功能版本

### v0.4 🚧 开发中
- [ ] 大模型对话 (LLM Service)
- [ ] Chat API 端点
- [ ] WebSocket 实时通信
- [ ] 状态机 (IDLE, LISTENING, THINKING, SPEAKING)
- [ ] Live2D 状态联动动画

### v0.5 📋 计划中
- [ ] 语音服务
- [ ] 热词唤醒
- [ ] STT/TTS

### v0.6 📋 计划中
- [ ] 记忆系统 (ChromaDB)
- [ ] 向量存储
- [ ] 上下文注入

### v0.3 ✅ 已完成
- [x] Live2D 渲染 (pixi-live2d-display + PIXI.js)
- [x] 模型加载系统 (ModelLoader 含缓存机制)
- [x] 动画控制系统 (idle, speaking, tap, blink)
- [x] 交互响应 (点击、双击、长按、鼠标跟随)
- [x] 视线跟随功能 (startLookAtMouse)
- [x] 自动眨眼动画
- [x] 状态管理 (Zustand)
- [x] 详细中文代码注释

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
pip install -r requirements.txt
python main.py
```

## 技术选型

| 模块 | 技术 |
|------|------|
| 桌面框架 | Electron |
| 前端框架 | React 18 + Vite |
| Live2D | PIXI.js + pixi-live2d-display |
| 后端框架 | FastAPI |
| 向量存储 | ChromaDB |
| LLM | DeepSeek / MiniMax |

## 开发人员

- 维护者: iMaid Development Team
- 版本: 0.4.0
- 日期: 2026-05-15