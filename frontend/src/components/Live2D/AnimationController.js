export default class AnimationController {
  constructor(model) {
    this.model = model;
    this.currentMotions = new Map();
    this.blinkTimer = null;
    this.isBlinking = false;
    this.blinkInterval = 3000;
  }

  /**
   * 播放指定名称的动画动作
   * @param {string} name - 动画动作的名称，如'idle'、'Tap'、'say'等
   * @returns {Promise} 动画播放完成后返回的Promise
   * 
   * 该方法调用模型的motion方法播放动画，并记录当前正在播放的动画。
   * 如果动画不存在或播放失败，会捕获错误并输出警告日志。
   */
  async play(name) {
    if (!this.model || !name) return;

    try {
      await this.model.motion(name);
      this.currentMotions.set(name, true);
    } catch (e) {
      console.warn(`Motion "${name}" not found or failed to play:`, e);
    }
  }

  /**
   * 停止指定名称的动画动作
   * @param {string} name - 要停止的动画动作名称
   * @returns {Promise} 动画停止操作完成后返回的Promise
   * 
   * 从当前播放的动画记录中移除指定的动画。
   */
  async stop(name) {
    if (!this.model || !name) return;

    if (this.currentMotions.has(name)) {
      this.currentMotions.delete(name);
    }
  }

  /**
   * 使用淡入淡出效果播放动画
   * @param {string} name - 动画动作的名称
   * @param {number} duration - 过渡时长，默认0.5秒
   * @returns {Promise} 动画播放完成后返回的Promise
   * 
   * 该方法目前与play方法功能相同，
   * 设计上用于实现动画之间的平滑过渡效果。
   */
  async fade(name, duration = 0.5) {
    if (!this.model || !name) return;

    try {
      await this.model.motion(name);
      this.currentMotions.set(name, true);
    } catch (e) {
      console.warn(`Motion "${name}" not found or failed to play:`, e);
    }
  }

  /**
   * 开始自动眨眼动画循环
   * @param {number} interval - 眨眼间隔时间，单位毫秒，默认3000ms
   * 
   * 使用setInterval定时器定期触发_blink方法执行眨眼动画。
   * 如果已经处于眨眼状态，则不会重复启动。
   */
  startBlink(interval = 3000) {
    if (this.isBlinking) return;

    this.blinkInterval = interval;
    this.isBlinking = true;

    this.blinkTimer = setInterval(() => {
      this._blink();
    }, this.blinkInterval);
  }

  /**
   * 停止自动眨眼动画
   * 
   * 清除眨眼定时器，并设置眨眼状态为false。
   * 用于在特定场景下暂停眨眼，如播放特殊动画时。
   */
  stopBlink() {
    if (this.blinkTimer) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    this.isBlinking = false;
  }

  /**
   * 执行单次眨眼动作
   * @private
   * 
   * 内部方法，通过播放'Blink'动画实现模型眨眼效果。
   * 使用catch吞掉错误，避免眨眼失败影响其他功能。
   */
  _blink() {
    if (!this.model) return;
    this.play('Blink').catch(() => {});
  }

  /**
   * 播放待机空闲动画
   * 
   * 调用play方法播放名为'idle'的待机动画。
   * 这是模型加载完成后的默认动画状态。
   */
  playIdle() {
    this.play('idle').catch(() => {});
  }

  /**
   * 停止所有正在播放的动画
   * 
   * 清空currentMotions记录，但不实际停止模型动画。
   * 用于重置动画状态管理器。
   */
  stopAll() {
    this.currentMotions.clear();
  }

  /**
   * 获取当前正在播放的所有动画名称列表
   * @returns {Array} 包含所有活跃动画名称的数组
   */
  getActiveMotions() {
    return Array.from(this.currentMotions.keys());
  }

  /**
   * 检查指定名称的动画是否正在播放
   * @param {string} name - 动画名称
   * @returns {boolean} 如果动画正在播放返回true，否则返回false
   */
  isPlaying(name) {
    return this.currentMotions.has(name);
  }

  /**
   * 销毁动画控制器，释放所有资源
   * 
   * 依次停止眨眼定时器、清空动画记录、解除模型引用。
   * 在组件卸载或模型销毁时调用，确保不产生内存泄漏。
   */
  destroy() {
    this.stopBlink();
    this.stopAll();
    this.model = null;
  }
}