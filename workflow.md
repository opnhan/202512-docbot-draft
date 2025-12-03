# DocBot 에이전트 작동 흐름 (Agent Workflow)

이 문서는 DocBot 에이전트가 사용자와 상호작용할 때 내부적으로 어떻게 작동하는지, 어떤 파일과 함수가 호출되는지 단계별로 설명합니다.

전체 흐름: **사용자 입력 → 프론트엔드 처리 → 서비스 레이어(OpenAI) → 도구 실행(Agent) → 응답 렌더링**

---

## 🕵️‍♂️ 상세 작동 흐름도

### 1. 사용자 입력 (Frontend)
사용자가 채팅창에 질문(예: "강남구 피부과 매출 어때?")을 입력하고 전송 버튼을 누릅니다.

- **파일**: `src/features/docbot/components/InputArea.tsx`
- **함수**: `handleSend()`
  - 사용자가 입력한 메시지를 `useChatStore`에 추가하여 화면에 즉시 표시합니다.
  - `chatService(conversationHistory)`를 호출하여 AI의 응답을 요청합니다.

### 2. 서비스 레이어 & OpenAI 호출 (Service)
앱은 OpenAI API 키가 있는지 확인하고, 실제 AI 모델에게 대화 내역을 전달합니다.

- **파일**: `src/features/docbot/api/chatService.ts`
- **함수**: `chatService()`
  - `VITE_OPENAI_API_KEY`가 존재하면 `getOpenAIResponse()`를 호출합니다.
  - (키가 없으면 `mockChatService`로 넘어가지만, 현재는 키가 적용되어 있습니다.)

### 3. AI의 판단 & 도구 호출 (Brain)
OpenAI(GPT-4o-mini)는 사용자의 질문을 분석하고, 미리 정의된 **도구(Tool)**를 사용할지 결정합니다.

- **파일**: `src/features/docbot/api/openaiService.ts`
- **함수**: `getOpenAIResponse()`
  - **System Prompt**: "당신은 닥봇입니다... 지역명은 '강남구'로 정규화하세요..." 같은 지침이 포함됩니다.
  - **Tools 정의**: `get_revenue_analysis`, `get_property_list` 함수가 GPT에게 "이런 도구가 있다"고 알려져 있습니다.
  - **판단**: GPT가 질문("강남구 피부과...")을 보고 `get_revenue_analysis(region: "강남구", category: "피부과")`를 호출하겠다는 **JSON 응답**을 보냅니다.

### 4. 도구 실행 & 데이터 필터링 (Executor)
GPT가 도구 사용을 요청하면, 코드가 이를 가로채서 **로컬에서 실제 데이터를 조회(필터링)**합니다. 이 부분이 **"에이전트가 데이터를 찾아오는"** 핵심 단계입니다.

- **파일**: `src/features/docbot/api/openaiService.ts`
- **함수**: `executeToolCall(toolName, args)`
  - GPT가 준 파라미터(`args`)를 받습니다.
  - `MOCK_HOSPITAL_DATA` 또는 `MOCK_PROPERTIES` 배열에서 `filter()` 함수를 돌려 조건에 맞는 데이터를 찾아냅니다.
  - **결과**: 필터링된 병원 데이터 리스트를 반환합니다.

### 5. 최종 응답 생성 (Response Construction)
도구 실행 결과(데이터)를 바탕으로, 프론트엔드가 이해할 수 있는 **구조화된 응답 객체**를 만듭니다.

- **파일**: `src/features/docbot/api/openaiService.ts` (하단부)
- **로직**:
  - 도구 실행 결과가 있으면 `messageType`을 `'revenue_report'` 또는 `'property_list'`로 설정합니다.
  - `content`에는 GPT가 생성한 친절한 요약 멘트(예: "강남구 피부과 1곳을 찾았습니다.")를 넣습니다.
  - `data`에는 필터링된 **JSON 데이터 원본**을 담습니다.

### 6. UI 렌더링 (Rendering)
완성된 메시지가 프론트엔드로 돌아오고, 타입에 맞는 컴포넌트가 그려집니다.

- **파일**: `src/features/docbot/components/MessageList.tsx`
- **작동**:
  - 메시지 타입이 `revenue_report`이면 → `RevenueAnalysisCard` 컴포넌트를 렌더링 (차트 표시).
  - 메시지 타입이 `property_list`이면 → `PropertyCard` 컴포넌트를 렌더링 (매물 카드 표시).
  - 일반 텍스트면 말풍선만 표시.

---

## 📝 수정 가이드

코드를 수정하고 싶을 때 참고하세요:

1. **AI의 말투나 성격을 바꾸고 싶다**
   - 👉 `openaiService.ts`의 `systemMessage` 내용을 수정하세요.

2. **검색되는 데이터(병원, 매물)를 추가/수정하고 싶다**
   - 👉 `src/mocks/data.ts` 파일을 열어서 JSON 데이터를 추가하세요.

3. **검색 조건을 더 똑똑하게(예: 가격 필터) 만들고 싶다**
   - 👉 `openaiService.ts`의 `tools` 정의(파라미터 추가)와 `executeToolCall` 함수(필터링 로직 추가)를 수정하세요.
