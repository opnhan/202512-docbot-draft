import React from 'react';
import { VisualizationConfig } from '../../types';
import { LineChartComponent } from './charts/LineChartComponent';
import { BarChartComponent } from './charts/BarChartComponent';
import { MetricCardComponent } from './charts/MetricCardComponent';

interface Props {
    config: VisualizationConfig;
}

/**
 * ChartRenderer - Dynamic chart component selector
 * Renders the appropriate chart component based on the chartType in config
 */
export const ChartRenderer: React.FC<Props> = ({ config }) => {
    console.log('[ChartRenderer] Rendering chart type:', config.chartType);

    switch (config.chartType) {
        case 'line':
            return <LineChartComponent config={config} />;

        case 'bar':
            return <BarChartComponent config={config} />;

        case 'metric':
            return <MetricCardComponent config={config} />;

        // Future chart types
        case 'comparison':
        case 'table':
        case 'area':
        case 'pie':
            console.warn(`[ChartRenderer] Chart type "${config.chartType}" not yet implemented`);
            return (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
                    <p className="text-gray-600">
                        차트 타입 "{config.chartType}"는 곧 지원될 예정입니다.
                    </p>
                </div>
            );

        default:
            console.error(`[ChartRenderer] Unsupported chart type: ${config.chartType}`);
            return (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                    <p className="text-red-600">
                        지원하지 않는 차트 타입입니다.
                    </p>
                </div>
            );
    }
};
