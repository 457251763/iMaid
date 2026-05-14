const { app, BrowserWindow, Menu, Tray, globalShortcut, ipcMain, screen } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged

// 窗口状态
let mainWindow = null
let tray = null
let voiceServiceProcess = null

// 当前页面路径
let currentPage = '/'

// 获取主页 URL
function getHomeUrl() {
  return isDev ? 'http://localhost:5173/#/' : `file://${path.join(__dirname, '../dist/index.html')}#/`
}

// 窗口配置
const WINDOW_CONFIG = {
  width: 320,
  height: 400,
  opacity: 0.95,
  alwaysOnTop: true,
  transparent: true,
  frame: false,
  resizable: false,
  skipTaskbar: true,
  focusable: true,
  hasShadow: true
}

// 获取屏幕尺寸
function getScreenPosition() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  
  return {
    x: width - WINDOW_CONFIG.width - 20,
    y: height - WINDOW_CONFIG.height - 20
  }
}

// 创建主窗口 (悬浮模式)
function createWindow() {
  const position = getScreenPosition()
  
  mainWindow = new BrowserWindow({
    width: WINDOW_CONFIG.width,
    height: WINDOW_CONFIG.height,
    x: position.x,
    y: position.y,
    opacity: WINDOW_CONFIG.opacity,
    alwaysOnTop: WINDOW_CONFIG.alwaysOnTop,
    transparent: WINDOW_CONFIG.transparent,
    frame: WINDOW_CONFIG.frame,
    resizable: WINDOW_CONFIG.resizable,
    skipTaskbar: WINDOW_CONFIG.skipTaskbar,
    focusable: WINDOW_CONFIG.focusable,
    hasShadow: WINDOW_CONFIG.hasShadow,
    title: 'iMaid',
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  })

  // 加载页面
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    console.log('iMaid 悬浮窗口已启动')
  })

  // 拖拽移动窗口 (通过拖拽标题区域)
  mainWindow.on('moved', () => {
    console.log('窗口位置已更改')
  })

  // 关闭窗口时隐藏到托盘
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
      console.log('窗口已隐藏到托盘')
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 窗口获得焦点
  mainWindow.on('focus', () => {
    console.log('窗口获得焦点')
  })

  // 窗口失去焦点时隐藏（可选，保持悬浮球效果）
  mainWindow.on('blur', () => {
    // 注释掉这行，否则用户无法与桌宠交互
    // mainWindow.hide()
  })
}

// 创建系统托盘
function createTray() {
  // 优先使用专用托盘图标，其次使用主图标
  const iconPaths = [
    path.join(__dirname, '../public/tray_icon.ico'),
    path.join(__dirname, '../public/tray_icon.png'),
    path.join(__dirname, '../public/icon.png')
  ]
  
  let iconPath = null
  const fs = require('fs')
  for (const p of iconPaths) {
    try {
      fs.accessSync(p)
      iconPath = p
      console.log(`[Tray] Found icon: ${p}`)
      break
    } catch {
      console.log(`[Tray] Not found: ${p}`)
    }
  }
  
  if (!iconPath) {
    console.log('托盘图标不存在，跳过托盘创建')
    return
  }

  try {
    tray = new Tray(iconPath)
    console.log(`[Tray] Created successfully with: ${iconPath}`)
  } catch (err) {
    console.error('[Tray] 创建失败:', err.message)
    return
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示桌宠',
      click: () => toggleWindow()
    },
    {
      label: '移动到角落',
      click: () => moveToCorner()
    },
    { type: 'separator' },
    {
      label: '开始对话',
      click: () => startVoiceMode()
    },
    {
      label: '打开设置',
      click: () => openSettings()
    },
    { type: 'separator' },
    {
      label: '关于',
      click: () => showAbout()
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('iMaid - 智能桌宠')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    toggleWindow()
  })
}

// 切换窗口显示/隐藏
function toggleWindow() {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
      // 如果当前不在主页，则加载主页
      const currentUrl = mainWindow.webContents.getURL()
      if (!currentUrl.includes('#/') || currentUrl.endsWith('#/settings')) {
        mainWindow.loadURL(getHomeUrl())
      }
    }
  }
}

// 移动窗口到右下角
function moveToCorner() {
  if (mainWindow) {
    const position = getScreenPosition()
    mainWindow.setPosition(position.x, position.y)
  }
}

// 打开设置页面
function openSettings() {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
    currentPage = '/settings'
    const settingsUrl = isDev 
      ? 'http://localhost:5173/#/settings' 
      : `file://${path.join(__dirname, '../dist/index.html')}#/settings`
    mainWindow.loadURL(settingsUrl)
  }
}

// 显示关于对话框
function showAbout() {
  const { dialog } = require('electron')
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '关于 iMaid',
    message: 'iMaid - 智能桌宠',
    detail: '版本: 0.2.0\n悬浮式智能桌面宠物\n支持语音交互、记忆功能'
  })
}

// 注册全局快捷键
function registerShortcuts() {
  // 显示/隐藏窗口
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    toggleWindow()
  })

  // 语音唤醒快捷键 (可选)
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    startVoiceMode()
  })
}

// 启动语音服务 (Python 后台进程)
function startVoiceService() {
  const voiceServicePath = path.join(__dirname, '../backend/voice_service.py')
  const backendDir = path.join(__dirname, '../backend')
  
  try {
    require('fs').accessSync(voiceServicePath)
    
    voiceServiceProcess = spawn('python', [voiceServicePath], {
      cwd: backendDir,
      detached: false,
      stdio: 'pipe'
    })

    voiceServiceProcess.stdout.on('data', (data) => {
      console.log(`[Voice Service] ${data}`)
    })

    voiceServiceProcess.stderr.on('data', (data) => {
      console.error(`[Voice Service Error] ${data}`)
    })

    voiceServiceProcess.on('close', (code) => {
      console.log(`语音服务已退出，退出码: ${code}`)
      voiceServiceProcess = null
    })

    console.log('语音服务已启动')
  } catch (err) {
    console.log('语音服务脚本不存在，将在后续版本启用')
  }
}

// 开始语音模式
function startVoiceMode() {
  if (mainWindow) {
    mainWindow.webContents.send('start-voice-mode')
    mainWindow.show()
    mainWindow.focus()
  }
  
  // 通知语音服务开始监听
  if (voiceServiceProcess) {
    voiceServiceProcess.stdin.write('wake\n')
  }
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '设置',
          accelerator: 'CommandOrControl+,',
          click: () => openSettings()
        },
        { type: 'separator' },
        {
          label: '移动到角落',
          click: () => moveToCorner()
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '显示/隐藏',
          accelerator: 'CommandOrControl+Shift+I',
          click: () => toggleWindow()
        },
        {
          label: '移动到角落',
          click: () => moveToCorner()
        },
        { type: 'separator' },
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => showAbout()
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC 通信处理
function setupIPC() {
  // 获取应用版本
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // 获取平台信息
  ipcMain.handle('get-platform', () => {
    return process.platform
  })

  // 获取窗口配置
  ipcMain.handle('get-window-config', () => {
    return WINDOW_CONFIG
  })

  // 获取窗口位置
  ipcMain.handle('get-window-position', () => {
    if (mainWindow) {
      return mainWindow.getPosition()
    }
    return null
  })

  // 最小化到托盘
  ipcMain.on('minimize-to-tray', () => {
    if (mainWindow) {
      mainWindow.hide()
    }
  })

  // 显示窗口
  ipcMain.on('show-window', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // 移动窗口
  ipcMain.on('move-window', (event, { x, y }) => {
    if (mainWindow) {
      mainWindow.setPosition(x, y)
    }
  })

  // 移动到角落
  ipcMain.on('move-to-corner', () => {
    moveToCorner()
  })

  // 开始语音模式
  ipcMain.on('start-voice-mode', () => {
    startVoiceMode()
  })

  // 设置窗口透明度
  ipcMain.on('set-opacity', (event, opacity) => {
    if (mainWindow) {
      mainWindow.setOpacity(opacity)
    }
  })

  // 发送消息到语音服务
  ipcMain.handle('send-to-voice-service', async (event, message) => {
    if (voiceServiceProcess && voiceServiceProcess.stdin) {
      voiceServiceProcess.stdin.write(message + '\n')
      return { success: true }
    }
    return { success: false, error: 'Voice service not running' }
  })
}

// 应用准备就绪
app.whenReady().then(() => {
  console.log('='.repeat(40))
  console.log('iMaid 应用启动中...')
  console.log('='.repeat(40))
  
  createMenu()
  setupIPC()
  createWindow()
  createTray()
  registerShortcuts()
  
  // 启动语音后台服务
  startVoiceService()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  console.log('='.repeat(40))
  console.log('iMaid 已就绪')
  console.log('快捷键: Ctrl+Shift+I 显示/隐藏')
  console.log('快捷键: Ctrl+Shift+V 开始语音')
  console.log('='.repeat(40))
})

// 所有窗口关闭时
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用退出前
app.on('before-quit', () => {
  app.isQuitting = true
  globalShortcut.unregisterAll()
  
  // 关闭语音服务
  if (voiceServiceProcess) {
    voiceServiceProcess.kill()
  }
})

// 异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
})