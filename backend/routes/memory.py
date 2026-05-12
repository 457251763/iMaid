"""
记忆路由
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class MemoryEntry(BaseModel):
    content: str
    type: Optional[str] = None
    importance: Optional[float] = 1.0


class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5


class AddMemoryRequest(BaseModel):
    content: str
    type: Optional[str] = "general"
    importance: Optional[float] = 1.0


@router.post("/search")
async def search_memory(request: SearchRequest):
    """搜索记忆"""
    # TODO: 实现真实的记忆搜索
    return {
        "results": [
            {"content": f"关于 '{request.query}' 的记忆", "score": 0.95}
        ]
    }


@router.post("/add")
async def add_memory(request: AddMemoryRequest):
    """添加记忆"""
    # TODO: 实现真实的记忆添加
    return {
        "id": "mem_001",
        "content": request.content,
        "type": request.type,
        "importance": request.importance
    }


@router.get("/list")
async def list_memories(limit: int = 20):
    """列出所有记忆"""
    # TODO: 实现真实的记忆列表
    return {
        "memories": [
            {"id": "mem_001", "content": "示例记忆", "created_at": "2026-05-11T00:00:00"}
        ],
        "total": 1
    }