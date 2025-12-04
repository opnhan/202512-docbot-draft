import OpenAI from 'openai';

export interface InterpretationResult {
    intent: 'revenue_analysis' | 'property_search' | 'general_chat';
    region?: string;
    category?: string;
    timeRange?: string;
    specificQuestion?: string;
}

export async function interpretQuery(
    userQuery: string,
    apiKey: string
): Promise<InterpretationResult> {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const prompt = `
    Analyze the user's query and extract structured information.
    
    User Query: "${userQuery}"
    
    Rules:
    1. Normalize region names (e.g., "강남" -> "강남구").
    2. Identify the intent:
       - "revenue_analysis": Questions about sales, revenue, growth, trends.
       - "property_search": Questions about real estate, rent, opening spots.
       - "general_chat": Greetings, irrelevant questions.
    3. Extract category if present (e.g., "피부과", "내과").
    4. Extract time range if present (default to "recent_6_months" if analyzing trends).
    
    Output JSON format:
    {
        "intent": "revenue_analysis",
        "region": "강남구",
        "category": "피부과",
        "timeRange": "recent_6_months",
        "specificQuestion": "Analyze revenue trends"
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
        console.error('[Interpretation Agent] Error:', error);
        return { intent: 'general_chat' };
    }
}
