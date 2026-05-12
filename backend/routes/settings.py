"""
设置路由
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter()


class SettingsUpdate(BaseModel):
    key: str
    value: Any


class LLMSettings(BaseModel):
    provider: str = "deepseek"
    api_key: Optional[str] = None
    model: str = "deepseek-chat"
    temperature: float = 0.7
    max_tokens: int = 2000


@router.get("/all")
async def get_all_settings():
    """获取所有设置"""
    # TODO: 从数据库加载设置
    return {
        "llm": {
            "provider": "deepseek",
            "model": "deepseek-chat",
            "temperature": 0.7
        },
        "app": {
            "theme": "light",
            "language": "zh-CN"
        }
    }


@router.get("/{key}")
async def get_setting(key: str):
    """获取指定设置"""
    return {
        "key": key,
        "value": None  # TODO: 从数据库加载
    }


@router.put("/update")
async def update_setting(setting: SettingsUpdate):
    """更新设置"""
    # TODO: 保存到数据库
    return {
        "key": setting.key,
        "value": setting.value,
        "success": True
    }


@router.get("/llm/config")
async def get_llm_config():
    """获取 LLM 配置"""
    return {
        "provider": "deepseek",
        "model": "deepseek-chat",
        "temperature": 0.7,
        "max_tokens": 2000
    }


@router.put("/llm/config")
async def update_llm_config(config: LLMSettings):
    """更新 LLM 配置"""
    return {
        "success": True,
        "config": config.model_dump()
    }