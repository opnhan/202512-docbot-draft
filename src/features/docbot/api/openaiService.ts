import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { Message } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Define tools for OpenAI function calling
const tools: ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'get_revenue_analysis',
            description: '특정 지역과 진료과목의 병원 매출 분석 및 상권 정보를 조회합니다. 사용자가 "강남 피부과 매출", "서초구 내과 분석", "마포 치과 상권" 등 지역과 병원 카테고리에 대한 매출/상권 정보를 질문할 때 호출하세요.',
            parameters: {
                type: 'object',
                properties: {
                    region: {
                        type: 'string',
                        description: '분석할 지역명 (예: "강남구", "서초구", "마포구"). 사용자가 "강남", "서초" 등 간략하게 말해도 "구"를 붙여서 전달하세요.',
                    },
                    category: {
                        type: 'string',
                        description: '병원 진료과목 (예: "내과", "피부과", "치과", "정형외과"). 사용자가 명시하지 않으면 이 파라미터는 생략 가능합니다.',
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
            description: '병원 개원에 적합한 임대 매물 목록을 검색합니다. 사용자가 "강남 매물", "40평 이상 자리", "서초 임대" 등 부동산 매물을 찾을 때 호출하세요.',
            parameters: {
                type: 'object',
                properties: {
                    region: {
                        type: 'string',
                        description: '검색할 지역명 (예: "강남구", "서초구", "마포구"). 사용자가 "강남역", "홍대" 등으로 말하면 해당 지역의 "구"로 변환하세요.',
                    },
                    minArea: {
                        type: 'number',
                        description: '최소 면적 (평). 사용자가 "40평 이상", "최소 50평" 등으로 말하면 해당 숫자를 입력하세요.',
                    },
                    maxArea: {
                        type: 'number',
                        description: '최대 면적 (평). 사용자가 "60평 이하" 등으로 말하면 해당 숫자를 입력하세요.',
                    },
                },
                required: [],
            },
        },
    },
];

// Helper to transform aggregated DB stats into DetailedHospitalStats
function transformToStats(monthlyData: any[], region: string, category: string): any {
    if (!monthlyData || monthlyData.length === 0) return null;

    // Format monthly revenue
    const monthlyRevenue = monthlyData.map(row => {
        const ym = row.year_month.toString();
        const month = `${ym.substring(0, 4)}-${ym.substring(4, 6)}`;
        return {
            month,
            amount: Math.round(row.avg_revenue),
            transactionCount: Math.round(row.total_transactions / row.count)
        };
    });

    // Calculate day distribution (average of averages)
    const totalMonths = monthlyData.length;
    const dayDistribution = {
        '월': Math.round(monthlyData.reduce((sum, row) => sum + (row.avg_monday || 0), 0) / totalMonths),
        '화': Math.round(monthlyData.reduce((sum, row) => sum + (row.avg_tuesday || 0), 0) / totalMonths),
        '수': Math.round(monthlyData.reduce((sum, row) => sum + (row.avg_wednesday || 0), 0) / totalMonths),
        '목': Math.round(monthlyData.reduce((sum, row) => sum + (row.avg_thursday || 0), 0) / totalMonths),
        '금': Math.round(monthlyData.reduce((sum, row) => sum + (row.avg_friday || 0), 0) / totalMonths),
        '토': Math.round(monthlyData.reduce((sum, row) => sum + (row.avg_saturday || 0), 0) / totalMonths),
        '일': Math.round(monthlyData.reduce((sum, row) => sum + (row.avg_sunday || 0), 0) / totalMonths),
    };

    // Calculate growth rate (last month vs previous)
    let growthRate = 0;
    if (monthlyRevenue.length >= 2) {
        const last = monthlyRevenue[monthlyRevenue.length - 1].amount;
        const prev = monthlyRevenue[monthlyRevenue.length - 2].amount;
        growthRate = prev > 0 ? parseFloat(((last - prev) / prev * 100).toFixed(1)) : 0;
    }

    // Calculate average monthly revenue (overall average)
    const avgMonthlyRevenue = monthlyRevenue.length > 0
        ? Math.round(monthlyRevenue.reduce((acc, curr) => acc + curr.amount, 0) / monthlyRevenue.length)
        : 0;

    return {
        hospitalName: `${region} ${category} 평균`,
        category: category,
        address: region,
        avgMonthlyRevenue,
        growthRate,
        floatingPopulation: 15420, // Mock data
        openDate: '2020-01-01',
        area: 45,
        doctorCount: 1,
        equipment: [],
        monthlyRevenue,
        demographics: {
            gender: { male: 45, female: 55 }, // Mock
            age: { // Mock
                '10대': 5,
                '20대': 25,
                '30대': 35,
                '40대': 20,
                '50대': 10,
                '60대 이상': 5
            }
        },
        dayDistribution,
        timeDistribution: { // Mock
            '09-12': 30,
            '12-15': 40,
            '15-18': 30
        }
    };
}

// Execute tool calls via Backend API
async function executeToolCall(toolName: string, args: any): Promise<any> {
    switch (toolName) {
        case 'get_revenue_analysis': {
            try {
                const params = new URLSearchParams();

                if (args.region) {
                    params.append('region', args.region);
                }
                if (args.category) {
                    params.append('category', args.category);
                }

                // Call the new monthly stats endpoint
                const response = await fetch(`${API_BASE_URL}/api/hospitals/stats/monthly?${params}`);
                const result = await response.json();

                if (!result.success) {
                    console.error('API Error:', result.error);
                    return null;
                }

                const rawData = result.data || [];

                // Transform to stats object
                return transformToStats(rawData, args.region || '전체', args.category || '병원');
            } catch (error) {
                console.error('API Call Error:', error);
                return null;
            }
        }
        case 'get_property_list': {
            return [];
        }
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
            content: `당신은 "닥봇"이라는 이름의 전문 AI 어시스턴트입니다.

**역할**: 병원 개원을 준비하는 의사들을 위한 상권 분석, 매출 정보, 부동산 매물 추천 컨설턴트

**핵심 지침**:
1. 사용자의 질문을 정확히 파악하여 적절한 함수(도구)를 호출하세요.
2. 지역명은 "강남구", "서초구", "마포구" 형식으로 정규화하세요. ("강남" → "강남구")
3. 진료과목은 "내과", "피부과", "치과", "정형외과" 등으로 정확히 추출하세요.
4. 면적 조건은 숫자만 추출하여 전달하세요. ("40평 이상" → minArea: 40)
5. 데이터를 받은 후에는 **친절하고 전문적인 한국어**로 핵심 정보를 요약하여 답변하세요.
6. 숫자는 한국식으로 표현하세요. (예: 1억 2천만원)
7. 데이터가 없거나 적으면 "현재 해당 조건의 데이터가 부족합니다"라고 안내하세요.
8. 항상 긍정적이고 도움이 되는 톤을 유지하세요.`,
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

            // Execute the tool (now async)
            const toolResult = await executeToolCall(toolName, toolArgs);

            // Determine message type based on tool
            let messageType: 'text' | 'revenue_report' | 'property_list' = 'text';
            let content = assistantMessage.content || '';

            if (toolName === 'get_revenue_analysis') {
                if (toolResult) {
                    messageType = 'revenue_report';

                    // Use the aggregated stats
                    const avgRevenue = toolResult.avgMonthlyRevenue;

                    content = `**${toolResult.address} ${toolResult.category}** 상권 분석 결과입니다.\n\n평균 월매출은 약 **${(avgRevenue / 10000).toLocaleString()}만원**이며, 전분기 대비 **${toolResult.growthRate}%** 성장했습니다.`;
                } else {
                    content = '해당 조건에 맞는 병원 데이터를 찾을 수 없습니다. 다른 지역이나 진료과목을 검색해보시겠어요?';
                    messageType = 'text';
                }
            } else if (toolName === 'get_property_list') {
                messageType = 'property_list';
                if (Array.isArray(toolResult) && toolResult.length > 0) {
                    content = `조건에 맞는 추천 매물 **${toolResult.length}건**을 찾았습니다.`;
                } else {
                    content = '조건에 맞는 매물이 없습니다. 면적 범위나 지역을 조정해보시겠어요?';
                    messageType = 'text';
                }
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
