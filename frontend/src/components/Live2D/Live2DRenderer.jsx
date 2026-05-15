import { useEffect, useRef, useState } from 'react';

import LIVE2D_CONFIG from '@/config/live2d-config';
import modelLoader from './ModelLoader';
import AnimationController from './AnimationController';
import useLive2DStore from '@/store/live2d-state';

const Live2DRenderer = ({ width = 320, height = 320, className = '' }) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  const setModel = useLive2DStore((state) => state.setModel);
  const setAnimationController = useLive2DStore((state) => state.setAnimationController);

  /**
   * 初始化PIXI应用和Live2D模型
   * 
   * 这是Live2D渲染器的核心初始化逻辑，在组件挂载时执行。
   * 主要完成以下工作：
   * 1. 初始化PIXI Application实例
   * 2. 创建画布并添加到DOM容器
   * 3. 加载Live2D模型文件
   * 4. 配置模型的缩放、位置和遮罩
   * 5. 创建动画控制器并启动待机动画
   * 6. 启动自动眨眼功能
   * 
   * 组件卸载时会自动清理所有资源，防止内存泄漏。
   * 
   * @effect
   * @dependencies [width, height, setModel, setAnimationController]
   */
  useEffect(() => {
    let pixiApp = null;
    let model = null;
    let animationController = null;
    let isMounted = true;

    /**
     * 异步初始化函数
     * 
     * 使用async/await处理异步加载流程，
     * 包含完整的错误处理机制。
     * @async
     */
    const initPIXI = async () => {
      try {
        const PIXI = window.PIXI;

        if (!PIXI || !PIXI.live2d) {
          throw new Error('PIXI or Live2D plugin not loaded');
        }

        const { Live2DModel } = PIXI.live2d;

        if (!Live2DModel) {
          throw new Error('Live2DModel not available');
        }

        const dpr = window.devicePixelRatio || 1;

        pixiApp = new PIXI.Application({
          width: width,
          height: height,
          backgroundAlpha: 0,
          antialias: true,
          resolution: dpr,
          autoDensity: true,
        });

        if (!containerRef.current || !isMounted) {
          pixiApp.destroy(true, { children: true });
          return;
        }

        const canvas = pixiApp.view;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        containerRef.current.style.position = 'relative';
        containerRef.current.appendChild(canvas);
        appRef.current = pixiApp;

        modelLoader.clearCache();

        const loadedModel = await modelLoader.loadModel(
          LIVE2D_CONFIG.modelPath,
          (progress) => {
            if (isMounted) {
              setLoadProgress(Math.round(progress * 100));
            }
          }
        );

        if (!isMounted || !loadedModel) {
          return;
        }

        if (!loadedModel.scale || !loadedModel.anchor || !loadedModel.position) {
          throw new Error('Model missing required properties (scale, anchor, position)');
        }

        const totalScale = (LIVE2D_CONFIG.scale || 0.1) * 5;

        loadedModel.anchor.set(0.5, 0);

        loadedModel.scale.set(totalScale, totalScale);

        loadedModel.position.set(width / 2, 0);

        const maskGraphics = new PIXI.Graphics();
        maskGraphics.beginFill(0x000000);
        maskGraphics.drawRect(0, height * 0.55, width, height * 0.45);
        maskGraphics.endFill();

        loadedModel.mask = maskGraphics;

        pixiApp.stage.addChild(loadedModel);

        model = loadedModel;
        setModel(loadedModel);

        animationController = new AnimationController(loadedModel);
        setAnimationController(animationController);

        animationController.playIdle();

        const blinkInterval = LIVE2D_CONFIG.blinkInterval || 3000;
        animationController.startBlink(blinkInterval);

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize Live2D:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load Live2D model');
          setIsLoading(false);
        }
      }
    };

    initPIXI();

    /**
     * 组件卸载时的清理函数
     * 
     * 负责释放所有分配的资源：
     * 1. 销毁动画控制器
     * 2. 从舞台移除模型
     * 3. 销毁PIXI应用
     * 4. 清除全局状态引用
     * 
     * @returns {void}
     */
    return () => {
      isMounted = false;

      if (animationController) {
        try {
          animationController.destroy();
        } catch (e) {}
      }

      if (model && appRef.current) {
        try {
          appRef.current.stage.removeChild(model);
        } catch (e) {}
      }

      if (appRef.current) {
        try {
          appRef.current.destroy(true, {
            children: true,
            texture: true,
            baseTexture: true,
          });
        } catch (e) {}
        appRef.current = null;
      }

      setModel(null);
      setAnimationController(null);
    };
  }, [width, height, setModel, setAnimationController]);

  if (error) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '12px',
          fontSize: '12px',
          color: '#ef4444',
          textAlign: 'center',
          padding: '10px',
        }}
      >
        加载失败: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#6366f1',
            fontSize: '12px',
          }}
        >
          <div>加载 Live2D... {loadProgress}%</div>
        </div>
      )}
    </div>
  );
};

export default Live2DRenderer;