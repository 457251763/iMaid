import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SettingsPage.css'

function SettingsPage() {
  const navigate = useNavigate()
  const [llmConfig, setLlmConfig] = useState({
    provider: 'deepseek',
    apiKey: '',
    model: 'deepseek-chat',
    temperature: 0.7
  })

  const [appConfig, setAppConfig] = useState({
    theme: 'light',
    language: 'zh-CN'
  })

  const handleSave = () => {
    alert('配置已保存')
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>设置</h1>
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 返回主页
        </button>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <h2 className="section-title">LLM 设置</h2>

          <div className="setting-item">
            <label>提供商</label>
            <select
              className="input"
              value={llmConfig.provider}
              onChange={(e) => setLlmConfig({...llmConfig, provider: e.target.value})}
            >
              <option value="deepseek">DeepSeek</option>
              <option value="minimax">MiniMax</option>
            </select>
          </div>

          <div className="setting-item">
            <label>API Key</label>
            <input
              type="password"
              className="input"
              placeholder="输入 API Key"
              value={llmConfig.apiKey}
              onChange={(e) => setLlmConfig({...llmConfig, apiKey: e.target.value})}
            />
          </div>

          <div className="setting-item">
            <label>模型</label>
            <input
              type="text"
              className="input"
              placeholder="模型名称"
              value={llmConfig.model}
              onChange={(e) => setLlmConfig({...llmConfig, model: e.target.value})}
            />
          </div>

          <div className="setting-item">
            <label>温度 (Temperature): <span className="temperature-value">{llmConfig.temperature}</span></label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={llmConfig.temperature}
              onChange={(e) => setLlmConfig({...llmConfig, temperature: parseFloat(e.target.value)})}
            />
          </div>
        </section>

        <section className="settings-section">
          <h2 className="section-title">应用设置</h2>

          <div className="setting-item">
            <label>主题</label>
            <select
              className="input"
              value={appConfig.theme}
              onChange={(e) => setAppConfig({...appConfig, theme: e.target.value})}
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>

          <div className="setting-item">
            <label>语言</label>
            <select
              className="input"
              value={appConfig.language}
              onChange={(e) => setAppConfig({...appConfig, language: e.target.value})}
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="section-title">关于</h2>
          <div className="about-info">
            <p><strong>iMaid</strong> - 智能 Windows 桌宠系统</p>
            <p>版本: 0.3.0</p>
            <p className="about-desc">
              类似 Neuro-sama 的 Windows 桌面宠物，具备 AI 对话、Live2D 形象展示、长期记忆和多平台联动能力。
            </p>
          </div>

          <div className="section-actions">
            <button className="btn-primary" onClick={handleSave}>
              保存配置
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsPage