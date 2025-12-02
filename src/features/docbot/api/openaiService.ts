import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { Message } from '../types';
import { MOCK_HOSPITAL_DATA, MOCK_PROPERTIES } from '../../../mocks/data';

// Define tools for OpenAI function calling
const tools: ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'get_revenue_analysis',
            description: '특정 지역의 병원 매출 분석 및 상권 정보를 제공합니다. 사용자가 매출, 분석, 병원, 상권 등에 대해 질문할 때 사용합니다.',
            parameters: {
                type: 'object',
                properties: {
                    region: {
                        type: 'string',
                        description: '분석할 지역 (예: 강남구, 서초구)',
                    },
                    category: {
                        type: 'string',
                        description: '병원 카테고리 (예: 내과, 피부과, 치과)',
                    },
                },
                required: ['region'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_property_list',
            description: '임대 가능한 매물 목록을 제공합니다. 사용자가 매물, 임대, 자리 등에 대해 질문할 때 사용합니다.',
            parameters: {
                type: 'object',
                properties: {
                    region: {
                        type: 'string',
                        description: '검색할 지역 (예: 강남구, 마포구)',
                    },
                    minArea: {
                        type: 'number',
                        description: '최소 면적 (평)',
                    },
                    maxArea: {
                        type: 'number',
                        description: '최대 면적 (평)',
                    },
                },
                required: [],
            },
        },
    },
];

// Execute tool calls
function executeToolCall(toolName: string, _args: any): any {
    switch (toolName) {
        case 'get_revenue_analysis':
            return MOCK_HOSPITAL_DATA;
        case 'get_property_list':
            return MOCK_PROPERTIES;
        default:
            return null;
    }
}

// Convert internal Message to OpenAI format
function toOpenAIMessages(messages: Message[]): ChatCompletionMessageParam[] {
    return messages.map((msg) => {
        if (msg.role === 'system') {
            return { role: 'system', content: msg.content };
        } else if (msg.role === 'user') {
            return { role: 'user', content: msg.content };
        } else {
            return { role: 'assistant', content: msg.content };
        }
    });
}

export async function getOpenAIResponse(
    messages: Message[],
    apiKey: string
): Promise<Message> {
    const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true, // For client-side usage (not recommended for production)
    });

    try {
        // Add system message for context
        const systemMessage: Message = {
            id: 'system',
            role: 'system',
            content: `당신은 "닥봇"이라는 이름의 AI 어시스턴트입니다. 
병원 개원을 준비하는 의사들을 위해 상권 분석, 매출 정보, 매물 추천 등을 제공합니다.
친절하고 전문적으로 답변하며, 필요한 경우 제공된 도구(함수)를 사용하여 정확한 데이터를 제공합니다.`,
            timestamp: new Date(),
        };

        const allMessages = [systemMessage, ...messages];
        const openaiMessages = toOpenAIMessages(allMessages);

        // Call OpenAI API with tools
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: openaiMessages,
            tools,
            tool_choice: 'auto',
        });

        const assistantMessage = response.choices[0].message;

        // Check if the model wants to call a tool
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
            const toolCall = assistantMessage.tool_calls[0];

            // 💡 수정: toolCall을 function 속성을 가진 타입으로 단언합니다.
            const functionCall = (toolCall as any).function;

            const toolName = functionCall.name;
            const toolArgs = JSON.parse(functionCall.arguments);

            // Execute the tool
            const toolResult = executeToolCall(toolName, toolArgs);

            // Determine message type based on tool
            let messageType: 'text' | 'revenue_report' | 'property_list' = 'text';
            let content = assistantMessage.content || '';

            if (toolName === 'get_revenue_analysis') {
                messageType = 'revenue_report';
                content = `**${MOCK_HOSPITAL_DATA.hospitalName}** 인근 상권 분석 결과입니다.\n\n월 평균 매출은 약 **${(MOCK_HOSPITAL_DATA.avgMonthlyRevenue / 10000).toLocaleString()}만원**이며, 전분기 대비 **${MOCK_HOSPITAL_DATA.growthRate}%** 성장했습니다.`;
            } else if (toolName === 'get_property_list') {
                messageType = 'property_list';
                content = `해당 지역에 추천할 만한 매물이 **${MOCK_PROPERTIES.length}건** 있습니다.`;
            }

            return {
                id: Date.now().toString(),
                role: 'assistant',
                content,
                timestamp: new Date(),
                type: messageType,
                data: toolResult,
            };
        }

        // Regular text response
        return {
            id: Date.now().toString(),
            role: 'assistant',
            content: assistantMessage.content || '응답을 생성할 수 없습니다.',
            timestamp: new Date(),
            type: 'text',
        };
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
    }
}
