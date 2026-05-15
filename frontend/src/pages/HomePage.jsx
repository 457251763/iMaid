import { useState } from 'react'
import DraggableContainer from '../components/DraggableContainer'
import Live2DRenderer from '../components/Live2D/Live2DRenderer'
import useLive2DStore from '../store/live2d-state'
import './HomePage.css'

function HomePage() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage = { role: 'user', content: inputValue }
    setMessages([...messages, userMessage])

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
    <DraggableContainer className="home-page">
      <div className="live2d-section drag-handle">
        <div className="live2d-wrapper">
          <div className="live2d-glow" />
          <Live2DRenderer 
            className="live2d-canvas-container" 
            width={300} 
            height={300} 
          />
        </div>
      </div>

      <div className="chat-section">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-hint">点击形象开始对话</div>
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

        <div className="chat-input-row">
          <input
            type="text"
            className="chat-input"
            placeholder="输入消息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="send-btn" onClick={handleSend}>
            →
          </button>
        </div>
      </div>
    </DraggableContainer>
  )
}

export default HomePage