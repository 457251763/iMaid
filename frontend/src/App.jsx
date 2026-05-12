import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  useEffect(() => {
    // 检测是否是 Electron 环境
    if (window.electronAPI) {
      console.log('运行在 Electron 环境中')
      setConnectionStatus('electron')
    } else {
      console.log('运行在浏览器环境中')
      setConnectionStatus('browser')
    }
  }, [])

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        
        <div className="status-bar">
          <span className={`status-indicator ${connectionStatus}`}></span>
          <span className="status-text">
            {connectionStatus === 'electron' ? 'Electron 环境' : 
             connectionStatus === 'browser' ? '浏览器环境' : '连接中...'}
          </span>
        </div>
      </div>
    </Router>
  )
}

export default App