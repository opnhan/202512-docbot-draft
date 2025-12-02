import { Message } from '../types';
import { MOCK_HOSPITAL_DATA, MOCK_PROPERTIES } from '../../../mocks/data';
import { getOpenAIResponse } from './openaiService';

// Mock service for fallback
const mockChatService = async (input: string): Promise<Message> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const lowerInput = input.toLowerCase();

            // 1. Revenue/Hospital Analysis Request
            if (lowerInput.includes('매출') || lowerInput.includes('분석') || lowerInput.includes('병원')) {
                resolve({
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `**${MOCK_HOSPITAL_DATA.hospitalName}** 인근 상권 분석 결과입니다.\n\n월 평균 매출은 약 **${(MOCK_HOSPITAL_DATA.avgMonthlyRevenue / 10000).toLocaleString()}만원**이며, 전분기 대비 **${MOCK_HOSPITAL_DATA.growthRate}%** 성장했습니다.`,
                    timestamp: new Date(),
                    type: 'revenue_report',
                    data: MOCK_HOSPITAL_DATA,
                });
                return;
            }

            // 2. Property Request
            if (lowerInput.includes('매물') || lowerInput.includes('임대') || lowerInput.includes('자리')) {
                resolve({
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `해당 지역에 추천할 만한 매물이 **${MOCK_PROPERTIES.length}건** 있습니다.`,
                    timestamp: new Date(),
                    type: 'property_list',
                    data: MOCK_PROPERTIES,
                });
                return;
            }

            // 3. Default Fallback
            resolve({
                id: Date.now().toString(),
                role: 'assistant',
                content: '죄송합니다. "매출 분석해줘" 또는 "매물 찾아줘"와 같이 질문해주세요.',
                timestamp: new Date(),
                type: 'text',
            });
        }, 1000); // Simulate network delay
    });
};

// Main chat service - uses OpenAI if API key is available, otherwise falls back to mock
export const chatService = async (messages: Message[]): Promise<Message> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    // Use OpenAI if API key is available
    if (apiKey) {
        try {
            return await getOpenAIResponse(messages, apiKey);
        } catch (error) {
            console.error('OpenAI service failed, falling back to mock:', error);
            // Fall through to mock service
        }
    }

    // Fallback to mock service
    const lastMessage = messages[messages.length - 1];
    const input = lastMessage?.content || '';
    return mockChatService(input);
};
