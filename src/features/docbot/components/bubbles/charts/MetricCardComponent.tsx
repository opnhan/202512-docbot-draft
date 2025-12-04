import React from 'react';
import { VisualizationConfig } from '../../../types';

interface Props {
    config: VisualizationConfig;
}

export const MetricCardComponent: React.FC<Props> = ({ config }) => {
    const value = config.data.datasets[0].values[0];
    const formatted = (value / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 });

    return (
        <div className="w-full rounded-2xl border border-purple-100 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 shadow-lg">
            {/* Title */}
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-gray-600">
                {config.title}
            </h3>

            {/* Main Value */}
            <div className="text-center">
                <div className="inline-flex items-baseline">
                    <span className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {formatted}
                    </span>
                    <span className="ml-2 text-2xl font-bold text-gray-500">만원</span>
                </div>
            </div>

            {/* Description */}
            {config.description && (
                <div className="mt-5 text-center">
                    <p className="text-lg font-semibold text-gray-700">{config.description}</p>
                </div>
            )}
        </div>
    );
};
