"""
对话路由
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[List[Message]] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    tokens_used: Optional[dict] = None


@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """发送对话消息"""
    # TODO: 实现真实的对话逻辑
    session_id = request.session_id or "default"
    
    return ChatResponse(
        reply=f"收到消息: {request.message}",
        session_id=session_id,
        tokens_used={"prompt": 100, "completion": 50}
    )