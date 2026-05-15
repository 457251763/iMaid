class ModelLoader {
  constructor() {
    this.cache = new Map();
  }

  /**
   * 加载Live2D模型文件
   * @param {string} path - 模型JSON文件的路径
   * @param {function} onProgress - 加载进度回调函数，接受0-1之间的进度值
   * @returns {Promise} 返回加载完成的Live2DModel实例
   * 
   * 该方法实现模型缓存机制：如果缓存中已存在该路径的模型，
   * 则直接返回缓存的模型实例，避免重复加载。
   * 使用PIXILive2D插件的Live2DModel.from方法加载模型，
   * 并启用自动交互功能(autoInteract)。
   */
  async loadModel(path, onProgress) {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    try {
      const { Live2DModel } = window.PIXI.live2d;

      if (!Live2DModel) {
        throw new Error('Live2DModel not available');
      }

      const model = await Live2DModel.from(path, {
        autoInteract: true,
        onProgress: onProgress,
      });

      if (!model || !model.scale) {
        throw new Error('Model loaded but scale property not available');
      }

      this.cache.set(path, model);
      return model;
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  /**
   * 清空所有已缓存的模型
   * 
   * 清除方法内部维护的模型缓存Map，
   * 通常在需要重新加载模型或释放内存时调用。
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 从缓存中移除指定路径的模型
   * @param {string} path - 要移除的模型路径
   * 
   * 如果缓存中存在该路径的模型，则从缓存中删除。
   * 用于精确控制单个模型的缓存管理。
   */
  removeModel(path) {
    if (this.cache.has(path)) {
      this.cache.delete(path);
    }
  }
}

export default new ModelLoader();