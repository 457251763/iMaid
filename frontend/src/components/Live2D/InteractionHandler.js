export default class InteractionHandler {
  constructor(model, canvasContainer) {
    this.model = model;
    this.canvasContainer = canvasContainer;
    this.hitTargets = new Map();
    this.mouseX = 0;
    this.mouseY = 0;
    this.isLookingAtMouse = false;
    this.lookAtMouseCallback = null;
    this.tapTimeout = null;
    this.isLongPress = false;
    this.longPressTimer = null;
    this.longPressThreshold = 500;
    this.doubleTapThreshold = 300;
    this.lastTapTime = 0;
    this.tapCount = 0;
    this.eventListeners = [];
  }

  /**
   * 初始化交互处理器
   * 
   * 绑定鼠标事件监听器并启动鼠标跟随功能。
   * 在模型和画布容器准备好后调用。
   */
  init() {
    if (!this.canvasContainer) return;

    this._bindEventListeners();
    this.startLookAtMouse();
  }

  /**
   * 绑定画布容器上的鼠标事件监听器
   * @private
   * 
   * 为画布容器添加pointerdown、pointermove、pointerleave事件监听。
   * 保存所有监听器引用以便后续销毁时移除。
   */
  _bindEventListeners() {
    const container = this.canvasContainer;

    const tapHandler = (e) => this._onTap(e);
    const moveHandler = (e) => this._onMouseMove(e);
    const leaveHandler = () => this._onMouseLeave();

    container.addEventListener('pointerdown', tapHandler);
    container.addEventListener('pointermove', moveHandler);
    container.addEventListener('pointerleave', leaveHandler);

    this.eventListeners = [
      { element: container, event: 'pointerdown', handler: tapHandler },
      { element: container, event: 'pointermove', handler: moveHandler },
      { element: container, event: 'pointerleave', handler: leaveHandler }
    ];
  }

  /**
   * 处理触摸/点击事件
   * @private
   * @param {Event} event - 原生点击事件对象
   * 
   * 实现单击、双击、长按三种交互的区分逻辑。
   * 通过时间间隔和点击次数判断用户操作类型，
   * 分别触发handleTap、handleDoubleTap、handleLongPress方法。
   */
  _onTap(event) {
    const rect = this.canvasContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.tapCount++;
    const now = Date.now();

    if (this.tapCount === 1) {
      this.isLongPress = false;

      this.longPressTimer = setTimeout(() => {
        if (!this.isLongPress) {
          this.isLongPress = true;
          this.handleLongPress({ x, y, event });
        }
      }, this.longPressThreshold);
    }

    if (now - this.lastTapTime < this.doubleTapThreshold) {
      this._clearTapTimeout();
      this.tapCount = 0;
      this.lastTapTime = 0;
      this.handleDoubleTap({ x, y, event });
    } else {
      this._clearTapTimeout();
      this.tapTimeout = setTimeout(() => {
        if (this.tapCount === 1 && !this.isLongPress) {
          this.handleTap({ x, y, event });
        }
        this.tapCount = 0;
        this.lastTapTime = 0;
      }, this.doubleTapThreshold);
      this.lastTapTime = now;
    }
  }

  /**
   * 清除单击延迟定时器
   * @private
   * 
   * 在检测到双击或长按时调用，防止误触发单击事件。
   */
  _clearTapTimeout() {
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
      this.tapTimeout = null;
    }
  }

  /**
   * 处理鼠标移动事件
   * @private
   * @param {Event} event - 原生鼠标移动事件
   * 
   * 更新当前鼠标在画布中的相对坐标位置，
   * 用于后续的鼠标跟随功能。
   */
  _onMouseMove(event) {
    const rect = this.canvasContainer.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  }

  /**
   * 处理鼠标离开画布事件
   * @private
   * 
   * 将鼠标位置重置为画布中心点，
   * 使模型视线回到正前方。
   */
  _onMouseLeave() {
    this.mouseX = this.canvasContainer.clientWidth / 2;
    this.mouseY = this.canvasContainer.clientHeight / 2;
  }

  /**
   * 处理单击事件
   * @param {Object} param - 包含点击信息的对象
   * @param {number} param.x - 点击位置的X坐标
   * @param {number} param.y - 点击位置的Y坐标
   * @param {Event} param.event - 原生事件对象
   * 
   * 检测点击位置是否命中模型的交互区域，
   * 如果命中则执行该区域的回调函数，
   * 并播放点击动画效果。
   */
  handleTap({ x, y, event }) {
    this._clearTapTimeout();
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const hitResult = this._checkHitTarget(x, y);

    if (hitResult) {
      const callback = this.hitTargets.get(hitResult);
      if (callback) {
        callback({ x, y, name: hitResult, event });
      }
    }

    this._playTapAnimation();
  }

  /**
   * 处理双击事件
   * @param {Object} param - 包含点击信息的对象
   * @param {number} param.x - 点击位置的X坐标
   * @param {number} param.y - 点击位置的Y坐标
   * @param {Event} param.event - 原生事件对象
   * 
   * 播放双击动画并派发打开设置对话框的事件。
   * 用于快速访问应用设置功能。
   */
  handleDoubleTap({ x, y, event }) {
    this._clearTapTimeout();
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.isLongPress = false;

    this._playDoubleTapAnimation();
    this._openSettingsPage();
  }

  /**
   * 处理长按事件
   * @param {Object} param - 包含点击信息的对象
   * @param {number} param.x - 点击位置的X坐标
   * @param {number} param.y - 点击位置的Y坐标
   * @param {Event} param.event - 原生事件对象
   * 
   * 播放长按动画并派发自定义longpress事件。
   * 长按阈值默认为500毫秒。
   */
  handleLongPress({ x, y, event }) {
    this._clearTapTimeout();
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    this._playLongPressAnimation();
    this._dispatchCustomEvent('longpress', { x, y, event });
  }

  /**
   * 检测点击位置是否命中模型交互区域
   * @private
   * @param {number} x - 点击位置的X坐标
   * @param {number} y - 点击位置的Y坐标
   * @returns {string|null} 返回命中的区域名称，未命中返回null
   * 
   * 使用Live2D模型的hitTest方法进行命中检测，
   * 这是Live2D Cubism SDK提供的标准功能。
   */
  _checkHitTarget(x, y) {
    if (!this.model) return null;

    if (typeof this.model.hitTest === 'function') {
      return this.model.hitTest(x, y);
    }

    return null;
  }

  /**
   * 播放单击动画
   * @private
   * 
   * 调用模型的Tap动画，为点击交互提供视觉反馈。
   */
  _playTapAnimation() {
    if (!this.model) return;

    this.model.motion('Tap').catch(() => {});
  }

  /**
   * 播放双击动画
   * @private
   * 
   * 与单击动画相同，用于双击交互的视觉反馈。
   */
  _playDoubleTapAnimation() {
    if (!this.model) return;

    this.model.motion('Tap').catch(() => {});
  }

  /**
   * 播放长按动画
   * @private
   * 
   * 与单击动画相同，用于长按交互的视觉反馈。
   */
  _playLongPressAnimation() {
    if (!this.model) return;

    this.model.motion('Tap').catch(() => {});
  }

  /**
   * 打开设置页面
   * @private
   * 
   * 派发opendialog自定义事件，
   * 由外部监听器处理具体的页面跳转逻辑。
   */
  _openSettingsPage() {
    this._dispatchCustomEvent('opendialog', {});
  }

  /**
   * 派发自定义事件
   * @private
   * @param {string} eventName - 事件名称
   * @param {Object} detail - 事件携带的数据
   * 
   * 创建并派发名为'live2d:{eventName}'的自定义事件，
   * 事件会冒泡传播，方便外部组件监听。
   */
  _dispatchCustomEvent(eventName, detail) {
    const event = new CustomEvent(`live2d:${eventName}`, {
      detail,
      bubbles: true
    });
    this.canvasContainer?.dispatchEvent(event);
  }

  /**
   * 启动鼠标跟随功能
   * 
   * 启动一个requestAnimationFrame循环，
   * 持续更新模型的rotation属性使模型看向鼠标位置。
   * 如果已经启动则不会重复启动。
   */
  startLookAtMouse() {
    if (this.isLookingAtMouse) return;
    this.isLookingAtMouse = true;

    this._updateLookAt();
  }

  /**
   * 停止鼠标跟随功能
   * 
   * 取消requestAnimationFrame动画帧请求，
   * 并重置跟随状态标志。
   */
  stopLookAtMouse() {
    this.isLookingAtMouse = false;
    if (this.lookAtMouseCallback) {
      cancelAnimationFrame(this.lookAtMouseCallback);
      this.lookAtMouseCallback = null;
    }
  }

  /**
   * 更新模型的注视方向
   * @private
   * 
   * 计算鼠标相对于画布中心的位置偏移量，
   * 将偏移量映射到模型的rotation属性实现注视效果。
   * 偏移值会被限制在-1到1之间以保证自然的注视范围。
   */
  _updateLookAt() {
    if (!this.isLookingAtMouse || !this.model) return;

    const container = this.canvasContainer;
    if (!container) return;

    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;

    const deltaX = (this.mouseX - centerX) / centerX;
    const deltaY = (this.mouseY - centerY) / centerY;

    const clampedX = Math.max(-1, Math.min(1, deltaX));
    const clampedY = Math.max(-1, Math.min(1, deltaY));

    if (typeof this.model.rotation === 'object') {
      this.model.rotation.x = clampedY * 0.3;
      this.model.rotation.y = clampedX * 0.3;
    }

    this.lookAtMouseCallback = requestAnimationFrame(() => this._updateLookAt());
  }

  /**
   * 注册模型的交互区域
   * @param {string} name - 交互区域的名称，对应模型中的HitArea
   * @param {function} callback - 命中该区域时执行的回调函数
   * 
   * 用于为模型的特定区域（如头部、身体）绑定点击响应。
   * 回调函数接收包含坐标、区域名和事件对象的参数。
   */
  onHitTarget(name, callback) {
    if (typeof name === 'string' && typeof callback === 'function') {
      this.hitTargets.set(name, callback);
    }
  }

  /**
   * 移除交互区域的回调
   * @param {string} name - 要移除的区域名称
   * 
   * 从hitTargets中删除指定区域的回调函数。
   */
  removeHitTarget(name) {
    if (this.hitTargets.has(name)) {
      this.hitTargets.delete(name);
    }
  }

  /**
   * 获取所有已注册的交互区域名称
   * @returns {Array} 包含所有交互区域名称的数组
   */
  getHitTargets() {
    return Array.from(this.hitTargets.keys());
  }

  /**
   * 更新鼠标位置
   * @param {number} x - 新的X坐标
   * @param {number} y - 新的Y坐标
   * 
   * 手动设置内部存储的鼠标位置，
   * 用于外部代码控制注视方向。
   */
  updateMousePosition(x, y) {
    this.mouseX = x;
    this.mouseY = y;
  }

  /**
   * 销毁交互处理器，释放所有资源
   * 
   * 停止鼠标跟随、清除定时器、移除所有事件监听器。
   * 在组件卸载时必须调用以防止内存泄漏。
   */
  destroy() {
    this.stopLookAtMouse();
    this._clearTapTimeout();

    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    this.eventListeners = [];
    this.hitTargets.clear();
    this.model = null;
    this.canvasContainer = null;
  }
}