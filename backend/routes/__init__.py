"""
Routes 模块
"""

from fastapi import APIRouter

router = APIRouter()

# 注册各个路由模块
from . import health, llm, chat, memory, settings

router.include_router(health.router, prefix="/health", tags=["健康检查"])
router.include_router(llm.router, prefix="/llm", tags=["LLM"])
router.include_router(chat.router, prefix="/chat", tags=["对话"])
router.include_router(memory.router, prefix="/memory", tags=["记忆"])
router.include_router(settings.router, prefix="/settings", tags=["设置"])