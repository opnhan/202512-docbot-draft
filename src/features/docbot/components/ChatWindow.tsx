import React from 'react';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';

export const ChatWindow: React.FC = () => {
    return (
        <div className="flex h-[600px] w-[400px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/10">
            {/* Header */}
            <div className="relative border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                            <span className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-sm font-black text-transparent">DB</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">DocBot</h2>
                        <p className="text-xs font-medium text-gray-400">AI 상권 분석 어시스턴트</p>
                    </div>
                </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white">
                <MessageList />
            </div>

            {/* Input Area */}
            <div className="bg-white px-4 pb-4 pt-3">
                <InputArea />
            </div>
        </div>
    );
};
