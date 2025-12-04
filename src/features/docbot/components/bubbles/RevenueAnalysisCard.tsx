import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { DetailedHospitalStats } from '../../types';

interface Props {
    data: DetailedHospitalStats;
}

export const RevenueAnalysisCard: React.FC<Props> = ({ data }) => {
    // Prepare data for charts
    const recentRevenue = data.monthlyRevenue.slice(-6); // Last 6 months

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-200/50">
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/20 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-purple-500/30">
                        <span className="text-lg">📊</span>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">
                            {data.category} 상권 분석
                        </h3>
                        <p className="text-xs font-medium text-gray-500">{data.address}</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Key Metrics */}
                <div className="mb-6">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
                        <p className="mb-1.5 text-xs font-semibold text-blue-600">월 평균 매출</p>
                        <p className="text-2xl font-black text-gray-900">
                            {(data.avgMonthlyRevenue / 10000).toLocaleString()}<span className="text-sm font-bold text-gray-500">만원</span>
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">▲ {data.growthRate}%</span>
                            <span className="text-xs text-gray-500">vs 전분기</span>
                        </div>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div>
                    <h4 className="mb-4 text-sm font-bold text-gray-900">
                        매출 추이
                    </h4>
                    <div className="h-40 w-full rounded-xl bg-gray-50/50 p-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={recentRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                                    tickFormatter={(val) => val.slice(5)}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(147, 51, 234, 0.05)' }}
                                    formatter={(value: number) =>
                                        `${(value / 10000).toLocaleString()}만원`
                                    }
                                    contentStyle={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar
                                    dataKey="amount"
                                    fill="url(#colorGradient)"
                                    radius={[8, 8, 8, 8]}
                                    barSize={24}
                                />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
