"""
FastAPI 应用入口
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from config import settings

# 创建 FastAPI 应用
app = FastAPI(
    title="iMaid Backend",
    description="智能桌宠后端服务",
    version="0.1.0",
    debug=settings.debug
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化"""
    logger.info("iMaid Backend 启动中...")
    logger.info(f"调试模式: {settings.debug}")
    logger.info(f"服务地址: http://{settings.host}:{settings.port}")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时的清理"""
    logger.info("iMaid Backend 关闭中...")


@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "iMaid Backend",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "ok",
        "service": "imaid-backend",
        "version": "0.1.0"
    }


# 导入并注册路由
from routes import router as routes_router
app.include_router(routes_router, prefix="/api", tags=["routes"])


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"启动服务器: http://{settings.host}:{settings.port}")
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )