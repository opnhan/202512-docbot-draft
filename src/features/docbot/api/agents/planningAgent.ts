import OpenAI from 'openai';
import { InterpretationResult } from './interpretationAgent';

export async function planAnalysis(
    interpretation: InterpretationResult,
    apiKey: string
): Promise<string> {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const prompt = `
    You are a Senior Data Analyst. Create a specific analysis plan based on the user's request.
    
    Request: "${interpretation.specificQuestion}"
    Context: Region=${interpretation.region}, Category=${interpretation.category}
    
    Determine what needs to be analyzed to answer the user's question effectively.
    Do NOT perform the analysis, just plan it.
    
    Examples:
    - "Calculate monthly revenue growth for the last 6 months and identify the peak month."
    - "Compare the latest month's revenue against the 6-month average and check for stability."
    
    Output the plan as a concise text string.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: prompt }]
        });

        return response.choices[0].message.content || 'Analyze basic revenue trends.';
    } catch (error) {
        console.error('[Planning Agent] Error:', error);
        return 'Analyze basic revenue trends.';
    }
}
