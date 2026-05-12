"""
状态机实现
"""

from enum import Enum
from typing import List, Callable, Optional


class ConversationState(Enum):
    """对话状态枚举"""
    IDLE = "idle"           # 待机状态
    LISTENING = "listening" # 倾听用户输入
    THINKING = "thinking"   # AI 思考中
    SPEAKING = "speaking"   # AI 响应中
    INTERRUPTED = "interrupted"  # 被中断


class StateTransitionError(Exception):
    """状态转换错误"""
    pass


class StateMachine:
    """状态机"""
    
    # 状态转换规则
    TRANSITION_RULES = {
        ConversationState.IDLE: [
            ConversationState.LISTENING,
        ],
        ConversationState.LISTENING: [
            ConversationState.THINKING,
            ConversationState.IDLE,
        ],
        ConversationState.THINKING: [
            ConversationState.SPEAKING,
            ConversationState.INTERRUPTED,
        ],
        ConversationState.SPEAKING: [
            ConversationState.IDLE,
            ConversationState.INTERRUPTED,
        ],
        ConversationState.INTERRUPTED: [
            ConversationState.IDLE,
            ConversationState.THINKING,
        ],
    }
    
    def __init__(self, initial_state: ConversationState = ConversationState.IDLE):
        self.state = initial_state
        self.listeners: List[Callable] = []
    
    def transition(self, new_state: ConversationState) -> bool:
        """尝试转换到新状态"""
        if not self.can_transition(new_state):
            raise StateTransitionError(
                f"无法从 {self.state.value} 转换到 {new_state.value}"
            )
        
        old_state = self.state
        self.state = new_state
        self._notify(old_state, new_state)
        return True
    
    def can_transition(self, target: ConversationState) -> bool:
        """检查是否可以转换到目标状态"""
        allowed_states = self.TRANSITION_RULES.get(self.state, [])
        return target in allowed_states
    
    def add_listener(self, listener: Callable):
        """添加状态变化监听器"""
        self.listeners.append(listener)
    
    def remove_listener(self, listener: Callable):
        """移除状态变化监听器"""
        if listener in self.listeners:
            self.listeners.remove(listener)
    
    def _notify(self, old_state: ConversationState, new_state: ConversationState):
        """通知所有监听器"""
        for listener in self.listeners:
            try:
                listener(old_state, new_state)
            except Exception as e:
                pass  # 忽略监听器错误
    
    def get_state(self) -> ConversationState:
        """获取当前状态"""
        return self.state
    
    def reset(self):
        """重置到初始状态"""
        self.state = ConversationState.IDLE