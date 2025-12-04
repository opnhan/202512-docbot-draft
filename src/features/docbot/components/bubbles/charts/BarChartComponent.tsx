import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VisualizationConfig } from '../../../types';

interface Props {
    config: VisualizationConfig;
}

export const BarChartComponent: React.FC<Props> = ({ config }) => {
    // Transform data for Recharts
    const data = config.data.labels.map((label, i) => ({
        name: label,
        value: config.data.datasets[0].values[i]
    }));

    return (
        <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            {/* Title */}
            <h3 className="mb-2 text-lg font-bold text-gray-900">{config.title}</h3>

            {/* Description */}
            {config.description && (
                <p className="mb-4 text-sm text-gray-500">{config.description}</p>
            )}

            {/* Chart */}
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickFormatter={(value) => `${(value / 10000).toLocaleString()}`}
                        />
                        <Tooltip
                            formatter={(value: number) => [`${(value / 10000).toLocaleString()}만원`, '매출']}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                        />
                        <Bar
                            dataKey="value"
                            fill="#8b5cf6"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
