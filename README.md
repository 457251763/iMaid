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

## 功能优先级

### P0 (MVP)
- ✅ 大模型接入 (DeepSeek / MiniMax)
- ✅ Live2D 渲染
- ✅ 实时对话 (WebSocket)
- ✅ Token 管理
- ✅ 长期记忆 (ChromaDB)

### P1 (增强)
- ⬜ 跨平台记忆同步
- ⬜ QQ 机器人联动
- ⬜ 手机 APP 联动

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
- 版本: 1.0.0
- 日期: 2026-05-11