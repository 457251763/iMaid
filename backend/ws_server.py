"""
WebSocket 服务
"""

import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect
from loguru import logger

from utils.state_machine import ConversationState


class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.client_states: Dict[str, ConversationState] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """连接新客户端"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.client_states[client_id] = ConversationState.IDLE
        logger.info(f"客户端 {client_id} 已连接")
    
    def disconnect(self, client_id: str):
        """断开客户端连接"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.client_states:
            del self.client_states[client_id]
        logger.info(f"客户端 {client_id} 已断开")
    
    async def send_message(self, client_id: str, message: dict):
        """向指定客户端发送消息"""
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_json(message)
    
    async def broadcast(self, message: dict):
        """广播消息到所有客户端"""
        for client_id, websocket in self.active_connections.items():
            await websocket.send_json(message)
    
    def update_state(self, client_id: str, state: ConversationState):
        """更新客户端状态"""
        if client_id in self.client_states:
            self.client_states[client_id] = state


# 全局连接管理器
connection_manager = ConnectionManager()


async def handle_websocket(websocket: WebSocket, client_id: str):
    """处理 WebSocket 连接"""
    await connection_manager.connect(websocket, client_id)
    
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 处理不同类型的消息
            msg_type = message.get("type")
            
            if msg_type == "heartbeat":
                await handle_heartbeat(client_id)
            elif msg_type == "chat_message":
                await handle_chat_message(client_id, message)
            else:
                logger.warning(f"未知消息类型: {msg_type}")
                
    except WebSocketDisconnect:
        connection_manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket 错误: {e}")
        connection_manager.disconnect(client_id)


async def handle_heartbeat(client_id: str):
    """处理心跳消息"""
    await connection_manager.send_message(client_id, {
        "type": "heartbeat_ack",
        "data": {"timestamp": asyncio.get_event_loop().time()}
    })


async def handle_chat_message(client_id: str, message: dict):
    """处理聊天消息"""
    # 更新状态为思考中
    connection_manager.update_state(client_id, ConversationState.THINKING)
    
    await connection_manager.send_message(client_id, {
        "type": "state_change",
        "data": {"state": "thinking"}
    })
    
    # TODO: 调用 LLM 处理消息
    
    # 模拟回复
    await asyncio.sleep(1)
    
    await connection_manager.send_message(client_id, {
        "type": "ai_response",
        "data": {
            "message": f"收到消息: {message.get('data', {}).get('content', '')}",
            "session_id": client_id
        }
    })
    
    # 更新状态为空闲
    connection_manager.update_state(client_id, ConversationState.IDLE)
    await connection_manager.send_message(client_id, {
        "type": "state_change",
        "data": {"state": "idle"}
    })