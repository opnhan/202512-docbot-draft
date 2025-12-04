# UI Agent Implementation Plan

## Overview

사용자 질문의 의도와 데이터 특성을 분석하여 최적의 시각화를 동적으로 선택하는 AI 에이전트 시스템.

---

## Architecture

```
User Query + Data
       ↓
UI Selection Agent (OpenAI)
       ├─→ Intent Analysis
       ├─→ Data Structure Analysis  
       └─→ Chart Type Decision
       ↓
VisualizationConfig
       ↓
ChartRenderer (Dynamic)
       ↓
Recharts Component
```

---

## Implementation Phases

### Phase 1: Type System (Week 1)

#### New Types

```typescript
// src/features/docbot/types/index.ts

export interface VisualizationConfig {
    chartType: 'line' | 'bar' | 'area' | 'pie' | 'comparison' | 'table' | 'metric';
    title: string;
    description?: string;
    data: ChartData;
    config?: ChartOptions;
}

export interface ChartData {
    labels: string[];
    datasets: Dataset[];
}

export interface Dataset {
    name: string;
    values: number[];
    color?: string;
}

export interface ChartOptions {
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    stacked?: boolean;
}

// Message type extension
export interface Message {
    // ... existing fields
    type?: 'text' | 'revenue_report' | 'property_list' | 'visualization';
    visualization?: VisualizationConfig;
}
```

---

### Phase 2: UI Selection Agent (Week 2)

#### Agent Implementation

```typescript
// src/features/docbot/api/uiAgent.ts

import OpenAI from 'openai';
import { VisualizationConfig } from '../types';

export async function selectVisualization(
    userQuery: string,
    toolResult: any,
    apiKey: string
): Promise<VisualizationConfig | null> {
    
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const systemPrompt = `당신은 데이터 시각화 전문가입니다.
사용자의 질문과 데이터를 분석하여 가장 적절한 차트 타입을 선택하세요.

**차트 타입 선택 기준**:

1. **line** - 시간에 따른 추이, 트렌드
   - 키워드: "추이", "변화", "흐름", "트렌드"
   - 데이터: 시계열 (3개 이상 데이터 포인트)

2. **bar** - 항목 간 비교, 순위
   - 키워드: "비교", "순위", "가장", "높은", "낮은"
   - 데이터: 범주형 비교 (2~10개 항목)

3. **comparison** - 다중 항목 나란히 비교
   - 키워드: "A와 B 비교", "대조"
   - 데이터: 2개 이상 항목의 다차원 비교

4. **metric** - 단일 핵심 지표 강조
   - 키워드: "얼마", "몇", "현재", "최근"
   - 데이터: 단일 값 또는 2개 이하

5. **table** - 상세 수치 나열
   - 키워드: "자세히", "전체", "목록"
   - 데이터: 다차원, 많은 속성

6. **area** - 누적 추이, 볼륨 강조
   - 키워드: "전체", "누적", "합계"
   - 데이터: 시계열 + 누적 개념

7. **pie** - 비율, 구성 요소
   - 키워드: "비율", "점유율", "구성"
   - 데이터: 합이 100%인 범주형

응답 형식 (JSON):
{
    "chartType": "...",
    "reasoning": "..."
}`;

    const userContent = `
사용자 질문: "${userQuery}"

데이터 정보:
- 타입: ${Array.isArray(toolResult.monthlyRevenue) ? '시계열' : '단일값'}
- 데이터 포인트 수: ${toolResult.monthlyRevenue?.length || 1}
- 포함 필드: avgMonthlyRevenue, growthRate, monthlyRevenue, dayDistribution

최적의 차트 타입을 선택하세요.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
            ],
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        
        // Generate full VisualizationConfig
        return generateVisualizationConfig(result.chartType, toolResult, userQuery);
        
    } catch (error) {
        console.error('UI Agent error:', error);
        return null; // Fallback to default visualization
    }
}

function generateVisualizationConfig(
    chartType: string,
    toolResult: any,
    userQuery: string
): VisualizationConfig {
    
    const { monthlyRevenue, avgMonthlyRevenue, growthRate, category, address } = toolResult;
    
    const labels = monthlyRevenue.map((m: any) => m.month.slice(5)); // "2025-09" → "09"
    const values = monthlyRevenue.map((m: any) => m.amount);
    
    return {
        chartType: chartType as any,
        title: `${address} ${category} 매출 분석`,
        description: `평균 ${(avgMonthlyRevenue / 10000).toLocaleString()}만원 / ${growthRate > 0 ? '+' : ''}${growthRate}% 성장`,
        data: {
            labels,
            datasets: [{
                name: '월 매출',
                values,
                color: '#8b5cf6'
            }]
        },
        config: {
            xAxisLabel: '월',
            yAxisLabel: '매출 (만원)',
            showLegend: false,
            showGrid: true
        }
    };
}
```

---

### Phase 3: Chart Components (Week 3)

#### Base Chart Component

```typescript
// src/features/docbot/components/bubbles/charts/BaseChart.tsx

interface BaseChartProps {
    config: VisualizationConfig;
}

export const BaseChart: React.FC<BaseChartProps> = ({ config }) => {
    return (
        <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            {/* Title */}
            <h3 className="mb-2 text-lg font-bold text-gray-900">{config.title}</h3>
            
            {/* Description */}
            {config.description && (
                <p className="mb-4 text-sm text-gray-500">{config.description}</p>
            )}
            
            {/* Chart Content */}
            <div className="h-64 w-full">
                {props.children}
            </div>
        </div>
    );
};
```

#### Line Chart

```typescript
// src/features/docbot/components/bubbles/charts/LineChartComponent.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const LineChartComponent: React.FC<{ config: VisualizationConfig }> = ({ config }) => {
    const data = config.data.labels.map((label, i) => ({
        name: label,
        value: config.data.datasets[0].values[i]
    }));

    return (
        <BaseChart config={config}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${(value / 10000).toLocaleString()}만원`} />
                    <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </BaseChart>
    );
};
```

#### Bar Chart

```typescript
// src/features/docbot/components/bubbles/charts/BarChartComponent.tsx

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const BarChartComponent: React.FC<{ config: VisualizationConfig }> = ({ config }) => {
    const data = config.data.labels.map((label, i) => ({
        name: label,
        value: config.data.datasets[0].values[i]
    }));

    return (
        <BaseChart config={config}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${(value / 10000).toLocaleString()}만원`} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </BaseChart>
    );
};
```

#### Metric Card

```typescript
// src/features/docbot/components/bubbles/charts/MetricCardComponent.tsx

export const MetricCardComponent: React.FC<{ config: VisualizationConfig }> = ({ config }) => {
    const value = config.data.datasets[0].values[0];
    const formatted = (value / 10000).toLocaleString();

    return (
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-center shadow-lg">
            <h3 className="mb-2 text-sm font-semibold text-gray-600">{config.title}</h3>
            <div className="text-5xl font-black text-gray-900">
                {formatted}<span className="text-2xl text-gray-500">만원</span>
            </div>
            {config.description && (
                <p className="mt-3 text-sm text-gray-600">{config.description}</p>
            )}
        </div>
    );
};
```

---

### Phase 4: Integration (Week 4)

#### ChartRenderer

```typescript
// src/features/docbot/components/bubbles/ChartRenderer.tsx

import { LineChartComponent } from './charts/LineChartComponent';
import { BarChartComponent } from './charts/BarChartComponent';
import { MetricCardComponent } from './charts/MetricCardComponent';
// ... other imports

export const ChartRenderer: React.FC<{ config: VisualizationConfig }> = ({ config }) => {
    switch (config.chartType) {
        case 'line':
            return <LineChartComponent config={config} />;
        case 'bar':
            return <BarChartComponent config={config} />;
        case 'metric':
            return <MetricCardComponent config={config} />;
        case 'comparison':
            return <ComparisonChartComponent config={config} />;
        case 'table':
            return <DataTableComponent config={config} />;
        case 'area':
            return <AreaChartComponent config={config} />;
        case 'pie':
            return <PieChartComponent config={config} />;
        default:
            console.warn(`Unsupported chart type: ${config.chartType}`);
            return <div>Visualization type not supported</div>;
    }
};
```

#### openaiService.ts Update

```typescript
// After tool execution
if (toolName === 'get_revenue_analysis' && toolResult) {
    
    // Call UI Selection Agent
    const visualizationConfig = await selectVisualization(
        messages[messages.length - 1].content,
        toolResult,
        apiKey
    );

    if (visualizationConfig) {
        return {
            id: Date.now().toString(),
            role: 'assistant',
            content: `${toolResult.address} ${toolResult.category} 분석 결과입니다.`,
            timestamp: new Date(),
            type: 'visualization',
            visualization: visualizationConfig,
            data: toolResult
        };
    } else {
        // Fallback to legacy
        return {
            type: 'revenue_report',
            data: toolResult,
            ...
        };
    }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// uiAgent.test.ts

describe('UI Selection Agent', () => {
    it('should select line chart for trend query', async () => {
        const config = await selectVisualization(
            "매출 추이를 보여줘",
            mockToolResult,
            mockApiKey
        );
        expect(config?.chartType).toBe('line');
    });

    it('should select metric card for single value query', async () => {
        const config = await selectVisualization(
            "최근 성장률은?",
            mockToolResult,
            mockApiKey
        );
        expect(config?.chartType).toBe('metric');
    });
});
```

### Integration Tests

- User query → Chart render confirmation
- Chart interaction (tooltip, zoom)
- Responsive design on mobile

---

## Performance Considerations

- **Lazy Loading**: Chart components loaded on demand
- **Memoization**: Expensive calculations cached
- **Data Sampling**: Large datasets (>100 points) downsampled

---

## Rollout Plan

1. **Alpha (Internal)**: Phase 1-2 complete
2. **Beta (Selected Users)**: Phase 3 complete, 3 chart types
3. **GA (All Users)**: Phase 4 complete, all 7 chart types

---

## Success Metrics

- Chart type selection accuracy: >90%
- User preference (survey): >80% prefer dynamic over static
- Performance: <500ms to render chart
