import { useState, useEffect, useCallback } from 'react'

/**
 * 可拖拽容器组件
 * 用于实现窗口拖拽功能，支持边界限制
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子元素
 * @param {string} props.className - 自定义类名
 * @param {boolean} props.enableDrag - 是否启用拖拽功能，默认 true
 * @param {string} props.dragHandleClass - 拖拽手柄的类名，默认 'drag-handle'
 * @param {Object} props.bounds - 边界限制 { minX, maxX, minY, maxY }
 */
function DraggableContainer({ 
  children, 
  className = '', 
  enableDrag = true,
  dragHandleClass = 'drag-handle',
  bounds = null
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 })

  // 初始化窗口位置
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getWindowPosition) {
      window.electronAPI.getWindowPosition().then(position => {
        if (position) {
          setWindowPosition(position)
        }
      }).catch(err => {
        console.warn('获取窗口位置失败:', err)
      })
    }
  }, [])

  // 开始拖拽
  const handleMouseDown = useCallback((e) => {
    if (!enableDrag) return
    
    // 检查是否点击了拖拽手柄
    const target = e.target
    const handle = target.closest(`.${dragHandleClass}`)
    if (!handle && !target.classList.contains('drag-handle')) {
      return
    }

    e.preventDefault()
    setIsDragging(true)
    
    // 获取鼠标相对屏幕的位置
    setDragOffset({
      x: e.screenX,
      y: e.screenY
    })
  }, [enableDrag, dragHandleClass])

  // 拖拽中
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return

    const deltaX = e.screenX - dragOffset.x
    const deltaY = e.screenY - dragOffset.y

    let newX = windowPosition.x + deltaX
    let newY = windowPosition.y + deltaY

    // 应用边界限制
    if (bounds) {
      newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX))
      newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY))
    }

    // 发送移动请求到主进程
    if (window.electronAPI && window.electronAPI.moveWindow) {
      window.electronAPI.moveWindow(newX, newY)
    }
  }, [isDragging, dragOffset, windowPosition, bounds])

  // 结束拖拽
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    // 更新窗口位置
    if (window.electronAPI && window.electronAPI.getWindowPosition) {
      window.electronAPI.getWindowPosition().then(position => {
        if (position) {
          setWindowPosition(position)
        }
      }).catch(err => {
        console.warn('获取窗口位置失败:', err)
      })
    }
  }, [isDragging])

  // 添加全局事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      // 添加拖拽中的样式
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div 
      className={`draggable-container ${className} ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  )
}

export default DraggableContainer
