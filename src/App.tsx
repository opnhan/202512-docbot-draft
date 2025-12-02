import { MessageList } from './features/docbot/components/MessageList';
import { InputArea } from './features/docbot/components/InputArea';

function App() {
    return (
        <div className="flex h-screen flex-col bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
                <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                                <span className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-sm font-black text-transparent">DB</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">DocBot</h1>
                            <p className="text-xs font-medium text-gray-500">AI 상권 분석 어시스턴트</p>
                        </div>
                    </div>
                    <button className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200">
                        새 대화
                    </button>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl">
                    <MessageList />
                </div>
            </main>

            {/* Input Area - Fixed at Bottom */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white/80 backdrop-blur-lg">
                <div className="mx-auto max-w-3xl px-6 py-4">
                    <InputArea />
                </div>
                <div className="border-t border-gray-100 bg-gray-50/50 py-3">
                    <p className="text-center text-xs text-gray-400">
                        DocBot은 AI를 활용한 상권 분석 서비스입니다. 정확성을 위해 전문가와 상담하세요.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
