import OpenAI from 'openai';
import { VisualizationConfig } from './visualizationAgent';

export interface FinalResponse {
    text: string;
    visualization?: VisualizationConfig;
}

export async function presentResponse(
    analysisInsights: string,
    visualization: VisualizationConfig,
    apiKey: string
): Promise<FinalResponse> {
    // In this simple version, we might just pass the analysis text through,
    // or we could use an LLM to "polish" it one last time.
    // For now, we'll trust the Analysis Agent's output but ensure it fits with the chart.

    return {
        text: analysisInsights,
        visualization: visualization
    };
}
