import { create } from 'zustand';
import { ChatState, Message } from '../types';

export const useChatStore = create<ChatState>((set) => ({
    isOpen: false,
    messages: [
        {
            id: 'welcome',
            role: 'assistant',
            content: '안녕하세요! 닥봇입니다. \n\n개원하고 싶은 지역이나 궁금한 상권이 있으신가요?',
            timestamp: new Date(),
            type: 'text',
        },
    ],
    isLoading: false,
    toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
    addMessage: (message: Message) =>
        set((state) => ({ messages: [...state.messages, message] })),
    setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
