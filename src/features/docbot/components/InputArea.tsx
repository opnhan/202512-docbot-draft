import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { chatService } from '../api/chatService';

export const InputArea: React.FC = () => {
    const [input, setInput] = useState('');
    const { addMessage, setLoading, messages } = useChatStore();

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: input,
            timestamp: new Date(),
        };
        addMessage(userMessage);

        setInput('');
        setLoading(true);

        // Call Chat Service with full conversation history
        try {
            const conversationHistory = [...messages, userMessage];
            const response = await chatService(conversationHistory);
            addMessage(response);
        } catch (error) {
            console.error(error);
            addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: '오류가 발생했습니다. 다시 시도해주세요.',
                timestamp: new Date(),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSend} className="relative">
            <div className="relative flex items-center rounded-2xl border border-gray-200 bg-white shadow-sm transition-all focus-within:border-gray-300 focus-within:shadow-md">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="w-full rounded-2xl bg-transparent py-3.5 pl-5 pr-14 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                    <Send size={18} />
                </button>
            </div>
        </form>
    );
};
