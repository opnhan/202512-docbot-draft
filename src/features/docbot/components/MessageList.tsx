import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { useChatStore } from '../store/useChatStore';
import { RevenueAnalysisCard } from './bubbles/RevenueAnalysisCard';
import { PropertyCard } from './bubbles/PropertyCard';
import { ChartRenderer } from './bubbles/ChartRenderer';

export const MessageList: React.FC = () => {
    const { messages, isLoading } = useChatStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Show welcome screen if no messages
    if (messages.length === 0) {
        return (
            <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-6 py-12">
                <div className="relative mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30">
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white">
                        <span className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-3xl font-black text-transparent">DB</span>
                    </div>
                </div>
                <h2 className="mb-3 text-3xl font-bold text-gray-900">무엇을 도와드릴까요?</h2>
                <p className="mb-12 text-center text-gray-500">
                    상권 분석, 매출 정보, 매물 추천 등 궁금한 것을 물어보세요.
                </p>

                {/* Example Questions */}
                <div className="grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-2">
                    {[
                        { icon: '📊', text: '강남역 내과 매출 추이를 알려줘', color: 'from-blue-500 to-cyan-500' },
                        { icon: '🏢', text: '마포구 이비인후과 상권 분석', color: 'from-purple-500 to-pink-500' },
                        { icon: '🏘️', text: '50평대 임대 매물 추천해줘', color: 'from-orange-500 to-red-500' },
                        { icon: '📍', text: '압구정동 피부과 유동인구는?', color: 'from-green-500 to-teal-500' },
                    ].map((example, idx) => (
                        <button
                            key={idx}
                            className="group rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                        >
                            <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${example.color} text-xl shadow-md`}>
                                {example.icon}
                            </div>
                            <p className="text-sm font-medium text-gray-700 transition-colors group-hover:text-gray-900">
                                {example.text}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 px-6 py-8">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={clsx(
                        'flex w-full gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300',
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                >
                    {/* Avatar */}
                    <div className={clsx(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md",
                        msg.role === 'user'
                            ? "bg-gradient-to-br from-gray-200 to-gray-300"
                            : "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                    )}>
                        {msg.role === 'user' ? (
                            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        ) : (
                            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white">
                                <span className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-xs font-black text-transparent">DB</span>
                            </div>
                        )}
                    </div>

                    {/* Message Content */}
                    <div
                        className={clsx(
                            'flex max-w-[85%] flex-col',
                            msg.role === 'user' ? 'items-end' : 'items-start'
                        )}
                    >
                        <div
                            className={clsx(
                                'rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm',
                                msg.role === 'user'
                                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-purple-500/20'
                                    : 'bg-white text-gray-800 border border-gray-100'
                            )}
                        >
                            {msg.role === 'assistant' ? (
                                <div className="flex flex-col gap-4">
                                    <div className="prose prose-sm max-w-none text-gray-800">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>

                                    {/* Dynamic Visualization Rendering (v2.0) */}
                                    {msg.type === 'visualization' && msg.visualization && (
                                        <div className="mt-2 w-full">
                                            <ChartRenderer config={msg.visualization} />
                                        </div>
                                    )}

                                    {/* Custom Widget Rendering */}
                                    {msg.type === 'revenue_report' && msg.data && (
                                        <div className="mt-2 w-full">
                                            <RevenueAnalysisCard data={msg.data} />
                                        </div>
                                    )}

                                    {msg.type === 'property_list' && msg.data && Array.isArray(msg.data) && (
                                        <div className="mt-2 flex flex-col gap-4">
                                            {msg.data.map((prop: any) => (
                                                <PropertyCard key={prop.id} data={prop} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="font-medium">{msg.content}</p>
                            )}
                        </div>

                        {/* Timestamp */}
                        <p className="mt-1.5 px-1 text-[10px] font-medium text-gray-400">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex w-full gap-4 animate-in fade-in duration-300">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-md">
                        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white">
                            <span className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-xs font-black text-transparent">DB</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1.5 rounded-2xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
};
