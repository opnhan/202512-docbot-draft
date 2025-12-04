import OpenAI from 'openai';

export async function performAnalysis(
    rawData: any[],
    plan: string,
    apiKey: string
): Promise<string> {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    // Format raw data for the LLM
    // Format raw data for the LLM
    const dataSummary = rawData.map(row => {
        // row is { month: "2025-09", amount: 12345678, ... }
        return `${row.month}: ${Math.round(row.amount / 10000)}만원`;
    }).join('\n');

    const prompt = `
    You are an expert Data Analyst. Execute the following analysis plan using the provided data.
    
    Analysis Plan: "${plan}"
    
    Raw Data (Monthly Revenue):
    ${dataSummary}
    
    Instructions:
    1. Follow the plan strictly.
    2. Be honest about the data. If there are fluctuations, mention them.
    3. Use rounded integers for currency (e.g., "1,234만원").
    4. Provide a concise, insightful summary (2-3 sentences).
    5. Do NOT use template phrases like "Here is the analysis". Just give the insight.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: prompt }]
        });

        return response.choices[0].message.content || 'Data analysis failed.';
    } catch (error) {
        console.error('[Analysis Agent] Error:', error);
        return 'Unable to analyze data at this time.';
    }
}
