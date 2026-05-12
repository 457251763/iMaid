const { contextBridge, ipcRenderer } = require('electron')

// 暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // === 基础信息 ===
  
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 获取平台信息
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // 获取窗口配置
  getWindowConfig: () => ipcRenderer.invoke('get-window-config'),
  
  // 获取窗口位置
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  
  // === 窗口控制 ===
  
  // 最小化到托盘
  minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
  
  // 显示窗口
  showWindow: () => ipcRenderer.send('show-window'),
  
  // 移动窗口
  moveWindow: (x, y) => ipcRenderer.send('move-window', { x, y }),
  
  // 移动到角落
  moveToCorner: () => ipcRenderer.send('move-to-corner'),
  
  // 设置透明度
  setOpacity: (opacity) => ipcRenderer.send('set-opacity', opacity),
  
  // === 语音功能 ===
  
  // 开始语音模式
  startVoiceMode: () => ipcRenderer.send('start-voice-mode'),
  
  // 发送消息到语音服务
  sendToVoiceService: (message) => ipcRenderer.invoke('send-to-voice-service', message),
  
  // === 事件监听 ===
  
  // 监听语音模式开始
  onStartVoiceMode: (callback) => {
    ipcRenderer.on('start-voice-mode', () => callback())
  },
  
  // 监听语音识别结果
  onVoiceResult: (callback) => {
    ipcRenderer.on('voice-result', (event, result) => callback(result))
  },
  
  // 监听主题变化
  onThemeChange: (callback) => {
    ipcRenderer.on('theme-change', (event, theme) => callback(theme))
  },
  
  // 移除所有监听
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  }
})

console.log('Preload 脚本已加载 - iMaid v0.2')