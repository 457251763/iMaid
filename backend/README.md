# Backend 后端服务

## 技术栈

- Python 3.10+ (主语言)
- FastAPI (Web 框架)
- WebSockets (实时通信)
- ChromaDB (向量数据库)
- Redis (会话缓存)
- SQLAlchemy (ORM)

## 目录结构

```
backend/
├── main.py              # 应用入口
├── config.py            # 配置管理
├── requirements.txt     # 依赖列表
├── services/            # 业务逻辑层
│   ├── llm_service.py   # LLM 服务封装
│   ├── tts_service.py  # 语音合成服务
│   ├── stt_service.py  # 语音识别服务
│   └── memory_service.py # 记忆服务
├── models/              # 数据模型
│   ├── conversation.py # 对话模型
│   ├── memory.py        # 记忆模型
│   └── user.py          # 用户模型
├── routes/              # API 路由
│   ├── chat.py          # 聊天相关 API
│   ├── memory.py        # 记忆管理 API
│   └── settings.py      # 设置相关 API
├── memory/              # 向量存储
│   └── vector_store.py  # ChromaDB 操作
├── utils/               # 工具函数
│   ├── token_manager.py # Token 管理
│   └── state_machine.py  # 状态机
└── ws_server.py         # WebSocket 服务
```

## 核心功能模块

### 1. LLM 服务层

**功能职责**:
- 多 API 适配器（DeepSeek / MiniMax）
- 统一调用接口
- 流式输出支持
- 故障转移

**关键文件**:
- `services/llm_service.py` - LLM 服务主类
- `services/providers/` - 各 API 提供商适配器

**支持的模型**:
- DeepSeek (推荐主力模型)
- MiniMax (支持多模态)

### 2. 记忆系统

**功能职责**:
- 向量存储与检索（ChromaDB）
- 结构化数据存储
- 上下文构建
- 记忆重要性评分

**关键文件**:
- `memory/vector_store.py` - 向量存储操作
- `services/memory_service.py` - 记忆服务

**存储设计**:
- ChromaDB: 语义向量存储
- SQLite: 结构化数据（用户配置、对话历史）

### 3. Token 管理

**功能职责**:
- 用量统计
- 成本控制
- 上下文压缩
- 限额告警

**关键文件**:
- `utils/token_manager.py` - Token 管理器

### 4. WebSocket 服务

**功能职责**:
- 客户端连接管理
- 消息路由
- 状态同步
- 心跳检测

**关键文件**:
- `ws_server.py` - WebSocket 服务器

### 5. 对话管理

**功能职责**:
- 上下文构建
- 历史消息管理
- 增量摘要
- 会话隔离

**关键文件**:
- `services/conversation_service.py` - 对话服务

### 6. 状态机

**功能职责**:
- 对话状态流转
- 事件监听
- 状态持久化

**关键文件**:
- `utils/state_machine.py` - 状态机实现

**状态定义**:
- IDLE: 待机状态
- LISTENING: 倾听用户输入
- THINKING: AI 思考中
- SPEAKING: AI 响应中
- INTERRUPTED: 被中断

## API 接口设计

### WebSocket 接口

```
ws://localhost:8000/ws
```

**消息类型**:
- `chat_message`: 客户端发送聊天消息
- `ai_response`: 服务端返回 AI 响应
- `stream_chunk`: 流式输出片段
- `state_change`: 状态变化通知
- `heartbeat`: 心跳检测

### REST API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/chat` | POST | 发送聊天消息 |
| `/api/memory/search` | POST | 搜索记忆 |
| `/api/memory/add` | POST | 添加记忆 |
| `/api/stats` | GET | 获取统计数据 |

## 开发计划

### Phase 1: 基础服务
- [ ] FastAPI 项目初始化
- [ ] 配置管理模块
- [ ] 基础目录结构

### Phase 2: LLM 集成
- [ ] DeepSeek API 适配器
- [ ] MiniMax API 适配器
- [ ] 统一调用接口

### Phase 3: 记忆系统
- [ ] ChromaDB 集成
- [ ] 向量存储与检索
- [ ] 上下文构建

### Phase 4: WebSocket
- [ ] WebSocket 服务器
- [ ] 消息协议实现
- [ ] 状态同步

### Phase 5: 完善功能
- [ ] Token 管理
- [ ] 对话摘要
- [ ] 跨平台接口