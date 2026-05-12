"""
LLM 路由
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """测试 LLM 对话"""
    # TODO: 实现真实的 LLM 调用
    session_id = request.session_id or "default"
    
    return ChatResponse(
        reply=f"这是一条测试回复: {request.message}",
        session_id=session_id
    )


@router.get("/models")
async def list_models():
    """列出可用的模型"""
    return {
        "models": [
            {"id": "deepseek-chat", "name": "DeepSeek Chat", "provider": "deepseek"},
            {"id": "abab6-chat", "name": "MiniMax Chat", "provider": "minimax"}
        ]
    }