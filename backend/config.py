"""
配置管理模块
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from loguru import logger


class Settings(BaseSettings):
    """应用配置"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # 服务配置
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    # LLM 配置
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"
    
    minimax_api_key: str = ""
    minimax_base_url: str = "https://api.minimax.chat"
    minimax_model: str = "abab6-chat"
    
    # ChromaDB 配置
    chroma_db_path: str = "./memory_db"
    
    # Redis 配置
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    # 日志配置
    log_level: str = "INFO"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._setup_logging()
    
    def _setup_logging(self):
        """配置日志"""
        logger.remove()
        logger.add(
            sink=lambda msg: print(msg, end=""),
            level=self.log_level,
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
        )


# 全局配置实例
settings = Settings()


def reload_settings():
    """重新加载配置"""
    global settings
    settings = Settings()
    return settings