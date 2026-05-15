import { create } from 'zustand';

export const Live2DState = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
  SLEEPING: 'sleeping',
};

const useLive2DStore = create((set) => ({
  state: Live2DState.IDLE,
  model: null,
  animationController: null,
  isSpeaking: false,

  setState: (newState) => set({ state: newState }),

  setModel: (model) => set({ model }),

  setAnimationController: (controller) => set({ animationController: controller }),

  setSpeaking: (isSpeaking) => set({ isSpeaking }),
}));

export default useLive2DStore;