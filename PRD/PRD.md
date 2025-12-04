# DocBot PRD (Product Requirements Document)

**버전**: 1.0  
**작성일**: 2025-12-04  
**프로젝트**: DocBot - AI 기반 병원 상권 분석 챗봇

---

## 1. 제품 개요

### 1.1 비전

병원 개원을 준비하는 의사들에게 **데이터 기반 의사결정**을 지원하는 AI 어시스턴트를 제공합니다.

### 1.2 목표

- 복잡한 상권 데이터를 **자연어 대화로 간단하게** 조회
- 사용자 의도에 맞는 **최적의 시각화** 자동 제공
- 실시간 데이터 분석으로 **정확한 매출 정보** 제공

### 1.3 대상 사용자

- **Primary**: 병원 개원을 준비하는 의사
- **Secondary**: 병원 경영 컨설턴트, 부동산 중개인

---

## 2. 핵심 기능

### 2.1 상권 매출 분석

#### 기능 설명
특정 지역과 진료과목의 병원 매출 데이터를 분석하여 제공

#### 입력
- 지역명: "강남구", "서초구" 등
- 진료과목: "피부과", "내과", "치과" 등

#### 출력
- 월 평균 매출
- 전월/전분기 대비 성장률
- 월별 매출 추이 (차트)
- 요일별 매출 분포

#### 사용 예시
```
사용자: "강남구 피부과 매출 어때?"
DocBot: [차트] 5,225만원 / +13.5% 성장
```

### 2.2 매물 추천 (v1.1 예정)

#### 기능 설명
병원 개원에 적합한 임대 매물 검색 및 추천

#### 입력
- 지역
- 면적 (평수)
- 예산

#### 출력
- 매물 목록 (카드 형태)
- 위치, 가격, 면적 정보
#### 예시
| 사용자 질문 | 선택되는 차트 |
|------------|--------------|
| "매출 추이를 보여줘" | Line Chart |
| "강남과 서초 비교해줘" | Comparison Chart |
| "성장률은?" | Metric Card |
| "지역별 순위는?" | Bar Chart (Descending) |

---

## 3. 비즈니스 로직

### 3.1 데이터 소스

#### 3.1.1 병원 매출 데이터
- **출처**: SQLite 데이터베이스 (`data/hospitals.db`)
- **테이블**: `hospital_revenue`
- **필드**:
  - `year_month`: 매출 기준월 (YYYYMM)
  - `code`: 병원 식별코드
  - `hospital_name`: 병원명
  - `address`: 주소
  - `category`: 진료과목
  - `revenue`: 월 매출액
  - `transaction_count`: 거래 건수
  - `avg_payment`: 평균 결제액
  - 요일별 매출 비율 (monday ~ sunday)

- **데이터 기간**: 2021-01 ~ 2025-09 (57개월)
- **총 레코드**: 537,220건

#### 3.1.2 데이터 집계 방식

**월별 평균 매출 계산**:
```sql
SELECT 
    year_month,
    AVG(revenue) as avg_revenue,
    COUNT(*) as hospital_count
FROM hospital_revenue
WHERE address LIKE '%{region}%' AND category = '{category}'
GROUP BY year_month
ORDER BY year_month DESC;
```

**성장률 계산**:
```
성장률 = (최근_월_매출 - 이전_월_매출) / 이전_월_매출 × 100
```

### 3.2 지역명 정규화

#### 규칙
사용자가 "강남구", "강남", "강남역" 중 어떤 형태로 입력해도 정확한 검색 가능

#### 구현
```typescript
const normalizedRegion = userInput.replace(/구$/, '');
// "강남구" → "강남"
// "서초구" → "서초"
```

#### 매칭 방식
```sql
address LIKE '%강남%'
```

### 3.3 UI 선택 로직 (v2.0)

#### UI Selection Agent

OpenAI가 다음 요소를 분석:
1. **사용자 의도**
   - "추이" → Line Chart
   - "비교" → Comparison Chart
   - "순위" → Bar Chart
   - "얼마" → Metric Card

2. **데이터 특성**
   - 시계열 데이터 → Line/Area Chart
   - 다차원 비교 → Grouped Bar
   - 단일 값 → Metric Card

3. **데이터 개수**
   - 1개 값 → Metric
   - 2~10개 → Bar/Line
   - 10개 이상 → Table/Area

#### Agent Prompt Template
```
사용자 질문: "{user_query}"
데이터 타입: "{data_type}"
데이터 개수: {data_count}

최적의 차트를 선택하고 JSON으로 응답:
{
    "chartType": "line",
    "reasoning": "월별 추이 분석 요청으로 시계열 데이터에 Line Chart가 적합"
}
```

---

### 4. 기술 아키텍처 (v3.0 Multi-Agent)

### 4.1 시스템 구성도

```
┌─────────────┐
│   User      │
│ (Natural    │
│  Language)  │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Agent Pipeline                     │
│                                                             │
│  1. Interpretation Agent                                    │
│     - Query Parsing & Intent Extraction                     │
│     ↓                                                       │
│  2. Planning Agent                                          │
│     - Analysis Strategy & Tool Selection                    │
│     ↓                                                       │
│  3. Analysis Agent                                          │
│     - Dynamic Data Processing & Insight Generation          │
│     ↓                                                       │
│  4. Visualization Agent                                     │
│     - Chart Type Selection & Configuration                  │
│     ↓                                                       │
│  5. Presentation Agent                                      │
│     - Final Response Composition (Text + UI)                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                       Infrastructure                        │
│  - Backend API (Node.js/Express)                            │
│  - Database (SQLite)                                        │
│  - OpenAI GPT-4o-mini                                       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 에이전트 상세 역할

#### 1. Interpretation Agent
- **역할**: 사용자의 모호한 자연어 질문을 명확한 분석 요구사항으로 변환
- **입력**: "강남 피부과 요즘 어때?"
- **출력**: `{ region: "강남구", category: "피부과", intent: "trend_analysis", timeRange: "recent_6_months" }`

#### 2. Planning Agent
- **역할**: 해석된 요구사항을 바탕으로 어떤 분석을 수행할지 결정 (Rule-based가 아닌 AI 판단)
- **입력**: Interpretation 결과
- **출력**: Analysis Plan (e.g., "Calculate monthly growth rate and identify peak months")

#### 3. Analysis Agent
- **역할**: 수립된 계획에 따라 실제 데이터를 분석하고 인사이트 도출
- **특징**: 사전에 정의된 통계 함수에 의존하지 않고, 데이터 특성에 맞춰 동적으로 분석 수행
- **입력**: Raw Data + Analysis Plan
- **출력**: Analysis Insights (Text) + Computed Metrics

#### 4. Visualization Agent
- **역할**: 분석 결과와 인사이트를 가장 잘 표현하는 시각화 방식 결정
- **입력**: Analysis Insights + Metrics
- **출력**: Visualization Config (Chart Type, Title, X/Y Axis)

#### 5. Presentation Agent
- **역할**: 최종적으로 사용자에게 전달할 메시지 구성 (친절한 톤앤매너 적용)
- **입력**: All Agent Outputs
- **출력**: Final Response Object (Text + UI Component)

### 4.3 데이터 흐름

```
1. User Query
   ↓
2. Interpretation Agent -> Structured Intent
   ↓
3. Planning Agent -> Analysis Strategy
   ↓
4. Backend API -> Fetch Raw Data
   ↓
5. Analysis Agent -> Dynamic Insights
   ↓
6. Visualization Agent -> Chart Config
   ↓
7. Presentation Agent -> Final Response
```

---

## 5. 운영 정책

### 5.1 데이터 업데이트

#### 빈도
- **현재**: Static (2025-09까지 고정)
- **목표 (v1.2)**: 월 1회 자동 업데이트

#### 프로세스
1. CSV 파일 수신
2. `server/convert-csv-to-sqlite.js` 실행
3. `hospitals.db` 파일 교체
4. 서버 재시작 (자동)

### 5.2 API 사용량 관리

#### OpenAI API
- **모델**: gpt-4o-mini
- **예상 비용**: 사용자당 ~$0.001/query
- **월간 예산**: $100 (약 100K queries)

#### Rate Limiting
- **현재**: 없음
- **목표 (v1.1)**: 사용자당 100 req/day

### 5.3 에러 처리

#### Database 에러
```typescript
if (!result.success) {
    return "데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.";
}
```

#### OpenAI API 에러
```typescript
catch (error) {
    return "일시적인 오류가 발생했습니다. API 키를 확인해주세요.";
}
```

#### No Data Found
```
"해당 조건에 맞는 병원 데이터를 찾을 수 없습니다. 
다른 지역이나 진료과목을 검색해보시겠어요?"
```

### 5.4 보안 정책

#### API Key 관리
- `.env` 파일에 저장 (git ignored)
- 환경변수: `VITE_OPENAI_API_KEY`
- **주의**: 클라이언트 사이드에서 직접 호출 (프로덕션 권장 안함)

#### 데이터베이스
- **Read-only 모드**로 연결
- SQL Injection 방지: Parameterized queries

---

## 6. 성능 요구사항

### 6.1 응답 시간

| 작업 | 목표 | 현재 |
|-----|------|------|
| UI 로딩 | < 1s | ✅ 0.5s |
| 채팅 응답 | < 3s | ✅ 2s |
| 차트 렌더링 | < 1s | ✅ 0.3s |

### 6.2 데이터베이스

- **쿼리 시간**: < 100ms
- **인덱스**: region, category에 복합 인덱스 (v1.1)

---

## 7. 향후 계획

### v1.1 (2주 내)
- [ ] Rate limiting 추가
- [ ] 사용자 피드백 수집
- [ ] 에러 로깅 시스템

### v2.0 (1개월 내) - UI Agent
- [ ] 7가지 차트 타입 구현
- [ ] UI Selection Agent 배포
- [ ] A/B 테스팅 (정적 UI vs 동적 UI)

### v2.1 (2개월 내)
- [ ] 다중 지역 비교 기능
- [ ] 커스텀 날짜 범위 선택
- [ ] PDF 리포트 Export

---

## 8. 성공 지표 (KPI)

### 사용자 만족도
- 쿼리 성공률: > 95%
- 평균 세션 시간: > 3분
- 재방문율: > 60%

### 기술 지표
- API 응답 시간: < 2s (95th percentile)
- 에러율: < 1%
- 시스템 가용성: > 99.5%

---

## 부록

### A. 용어 정의

- **진료과목**: 내과, 피부과, 치과 등 병원 전문 분야
- **상권**: 특정 지역의 상업 활동 지역
- **Tool**: OpenAI Function Calling에서 사용하는 함수
- **Agent**: 특정 작업을 자율적으로 수행하는 AI 컴포넌트

### B. 참조 문서

- [Workflow 문서](./workflow.md)
- [Technical Architecture](./technical_architecture.md)
- [UI Agent Implementation Plan](./ui_agent_implementation.md)
