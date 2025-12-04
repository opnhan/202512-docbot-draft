import OpenAI from 'openai';

export interface VisualizationConfig {
    chartType: 'line' | 'bar' | 'pie' | 'metric' | 'table';
    title: string;
    description: string;
    xAxisKey: string;
    dataKeys: string[];
    config: any;
}

export async function selectVisualization(
    analysisInsights: string,
    rawData: any[],
    apiKey: string
): Promise<VisualizationConfig> {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    // Format raw data sample for context
    const dataSample = JSON.stringify(rawData.slice(-3));

    const prompt = `
    You are a Data Visualization Expert. Choose the best chart to represent the analysis insights.
    
    Analysis Insights: "${analysisInsights}"
    Data Sample: ${dataSample}
    
    Rules:
    1. Select 'line' for trends over time.
    2. Select 'bar' for comparisons or rankings.
    3. Select 'metric' for single key figures (growth rate, total).
    4. Generate a dynamic, engaging title based on the insights (e.g., "Revenue up 20% in Q3!").
    5. Set 'xAxisKey' to 'month' (formatted as YY.MM).
    
    Output JSON format:
    {
        "chartType": "line",
        "title": "Dynamic Title Here",
        "description": "Brief description of what the chart shows.",
        "xAxisKey": "month",
        "dataKeys": ["amount"],
        "config": { "color": "#8884d8" }
    }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: prompt }],
            response_format: { type: 'json_object' }
        });

        let content = response.choices[0].message.content || '{}';

        // Strip markdown code blocks if present
        if (content.includes('```json')) {
            content = content.replace(/```json\n?|\n?```/g, '');
        } else if (content.includes('```')) {
            content = content.replace(/```\n?|\n?```/g, '');
        }

        return JSON.parse(content);
    } catch (error) {
        console.error('[Visualization Agent] Error:', error);
        return {
            chartType: 'table',
            title: 'Revenue Data',
            description: 'Monthly revenue data table.',
            xAxisKey: 'month',
            dataKeys: ['amount'],
            config: {}
        };
    }
}
