import { useState } from 'react'
import { Link } from 'react-router-dom'
import DraggableContainer from '../components/DraggableContainer'
import './HomePage.css'

function HomePage() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage = { role: 'user', content: inputValue }
    setMessages([...messages, userMessage])

    // TODO: 发送消息到后端
    setTimeout(() => {
      const aiMessage = { role: 'assistant', content: `这是测试回复: ${inputValue}` }
      setMessages(prev => [...prev, aiMessage])
    }, 500)

    setInputValue('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <DraggableContainer className="home-page page">
      <header className="header drag-handle">
        <h1>iMaid - 智能桌宠</h1>
        <Link to="/settings" className="btn btn-secondary drag-handle">设置</Link>
      </header>

      <div className="live2d-container">
        <div className="live2d-placeholder">
          <div className="placeholder-icon">🎀</div>
          <p>Live2D 模型加载区域</p>
          <small>将在 v0.4 版本实现</small>
        </div>
      </div>

      <div className="chat-container card">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>开始和 iMaid 对话吧！</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🎀'}
                </div>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            className="input chat-input"
            placeholder="输入消息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="btn btn-primary" onClick={handleSend}>
            发送
          </button>
        </div>
      </div>
    </DraggableContainer>
  )
}

export default HomePage