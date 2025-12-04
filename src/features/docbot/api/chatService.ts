import { Message } from '../types';
import { getOpenAIResponse } from './openaiService';

// Main chat service - uses OpenAI if API key is available
export const chatService = async (messages: Message[]): Promise<Message> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    // Use OpenAI if API key is available
    if (apiKey) {
        try {
            return await getOpenAIResponse(messages, apiKey);
        } catch (error) {
            console.error('OpenAI service failed:', error);
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                timestamp: new Date(),
                type: 'text',
            };
        }
    }

    // No API key configured
    return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'OpenAI API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 추가해주세요.',
        timestamp: new Date(),
        type: 'text',
    };
};
