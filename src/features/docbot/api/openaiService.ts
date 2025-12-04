import OpenAI from 'openai';
import { Message } from '../types';
import { interpretQuery } from './agents/interpretationAgent';
import { planAnalysis } from './agents/planningAgent';
import { performAnalysis } from './agents/analysisAgent';
import { selectVisualization } from './agents/visualizationAgent';
import { presentResponse } from './agents/presentationAgent';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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

    // Use the latest month's average revenue (not overall average)
    const avgMonthlyRevenue = monthlyRevenue.length > 0
        ? monthlyRevenue[monthlyRevenue.length - 1].amount
        : 0;

    return {
        category: category,
        address: region,
        avgMonthlyRevenue,
        growthRate,
        monthlyRevenue,
        dayDistribution,
        regionCode: '',
        referenceDate: monthlyRevenue.length > 0 ? monthlyRevenue[monthlyRevenue.length - 1].month : ''
    };
}

// Execute tool calls via Backend API
async function fetchHospitalData(region: string, category: string): Promise<any> {
    try {
        const params = new URLSearchParams();

        if (region) {
            const normalizedRegion = region.replace(/구$/, '');
            params.append('region', normalizedRegion);
        }
        if (category) {
            params.append('category', category);
        }

        const response = await fetch(`${API_BASE_URL}/api/hospitals/stats/monthly?${params}`);
        const result = await response.json();

        if (!result.success) {
            console.error('API Error:', result.error);
            return null;
        }

        const rawData = result.data || [];
        return transformToStats(rawData, region || '전체', category || '병원');
    } catch (error) {
        console.error('API Call Error:', error);
        return null;
    }
}

export async function getOpenAIResponse(
    messages: Message[],
    apiKey: string
): Promise<Message> {
    try {
        const userQuery = messages[messages.length - 1].content;

        // 1. Interpretation Agent
        console.log('[Orchestrator] 1. Interpreting query...');
        const interpretation = await interpretQuery(userQuery, apiKey);
        console.log('[Orchestrator] Intent:', interpretation);

        if (interpretation.intent === 'revenue_analysis' && interpretation.region) {
            // 2. Data Fetching (Tool Execution)
            console.log('[Orchestrator] 2. Fetching data...');
            const toolResult = await fetchHospitalData(interpretation.region, interpretation.category || '');

            if (toolResult) {
                // 3. Planning Agent
                console.log('[Orchestrator] 3. Planning analysis...');
                const plan = await planAnalysis(interpretation, apiKey);
                console.log('[Orchestrator] Plan:', plan);

                // 4. Analysis Agent
                console.log('[Orchestrator] 4. Performing analysis...');
                const analysisInsights = await performAnalysis(toolResult.monthlyRevenue, plan, apiKey);
                console.log('[Orchestrator] Insights:', analysisInsights);

                // 5. Visualization Agent
                console.log('[Orchestrator] 5. Selecting visualization...');
                const visualizationConfig = await selectVisualization(analysisInsights, toolResult.monthlyRevenue, apiKey);
                console.log('[Orchestrator] Visualization:', visualizationConfig);

                // 6. Presentation Agent
                console.log('[Orchestrator] 6. Presenting response...');
                const finalResponse = await presentResponse(analysisInsights, visualizationConfig, apiKey);

                return {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: finalResponse.text,
                    timestamp: new Date(),
                    type: 'visualization',
                    data: toolResult,
                    visualization: finalResponse.visualization
                };
            } else {
                return {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: '해당 조건에 맞는 병원 데이터를 찾을 수 없습니다.',
                    timestamp: new Date(),
                    type: 'text'
                };
            }
        }

        // Fallback for general chat or other intents
        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages.map(m => ({ role: m.role as any, content: m.content }))
        });

        return {
            id: Date.now().toString(),
            role: 'assistant',
            content: response.choices[0].message.content || '응답을 생성할 수 없습니다.',
            timestamp: new Date(),
            type: 'text'
        };

    } catch (error) {
        console.error('Orchestrator Error:', error);
        throw error;
    }
}
