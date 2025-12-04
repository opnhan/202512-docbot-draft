# Technical Architecture Document

## 시스템 구조

### 전체 아키텍처

```
┌──────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │ ChatWidget │  │ MessageList│  │ ChartRenderer    │  │
│  │  (UI Shell)│  │ (Display)  │  │ (Visualization)  │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
│         React + TypeScript + TailwindCSS + Recharts      │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓ chatService()
┌──────────────────────────────────────────────────────────┐
│                    AI Service Layer                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  OpenAI Integration (openaiService.ts)             │ │
│  │  - System Prompt                                   │ │
│  │  - Function Calling (Tools)                        │ │
│  │  - Tool Execution                                  │ │
│  └────────────┬───────────────────────────────────────┘ │
│               │                                          │
│               ├─→ Tool: get_revenue_analysis             │
│               │   ├─ Region normalization                │
│               │   ├─ Backend API call                    │
│               │   └─ Transform to UI format              │
│               │                                          │
│               └─→ Tool: get_property_list (v1.1)         │
│                   └─ Property search & filtering         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  UI Selection Agent (uiAgent.ts) - v2.0            │ │
│  │  - Intent analysis                                 │ │
│  │  - Chart type selection                            │ │
│  │  - Config generation                               │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓ HTTP GET
┌──────────────────────────────────────────────────────────┐
│                   Backend API Layer                      │
│  Express Server (port 3001)                              │
│                                                          │
│  Endpoints:                                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GET /api/hospitals/stats/monthly                   │ │
│  │  Query: ?region=강남&category=피부과                 │ │
│  │  Response: {success, count, data[]}                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GET /api/hospitals/revenue                         │ │
│  │  Query: ?region=&category=&limit=100               │ │
│  │  Response: {success, count, data[]}                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GET /health                                        │ │
│  │  Response: {status, totalRecords}                 │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓ SQL Query
┌──────────────────────────────────────────────────────────┐
│                   Data Layer                             │
│  SQLite Database: hospitals.db (256 MB)                  │
│                                                          │
│  Table: hospital_revenue                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Columns:                                           │ │
│  │  - year_month (TEXT): 202101 ~ 202509             │ │
│  │  - code (TEXT): Hospital identifier               │ │
│  │  - hospital_name (TEXT)                           │ │
│  │  - address (TEXT)                                 │ │
│  │  - category (TEXT): 진료과목                       │ │
│  │  - revenue (REAL): 매출액                          │ │
│  │  - transaction_count (INTEGER)                    │ │
│  │  - avg_payment (REAL)                             │ │
│  │  - monday ~ sunday (REAL): 요일별 비율             │ │
│  │  - weekday_ratio, weekend_ratio (REAL)            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Total Records: 537,220                                  │
│  Index: idx_commercial_stats_region_category (planned)   │
└──────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### 1. Frontend Components

#### 1.1 ChatWidget.tsx
- **역할**: 채팅 UI 컨테이너
- **State**: Zustand (`useChatStore`)
- **Props**: None
- **Children**: MessageList, InputArea

#### 1.2 MessageList.tsx
- **역할**: 메시지 렌더링
- **Logic**:
  ```typescript
  if (msg.type === 'visualization') {
      <ChartRenderer config={msg.visualization} />
  } else if (msg.type === 'revenue_report') {
      <RevenueAnalysisCard data={msg.data} />
  }
  ```

#### 1.3 ChartRenderer.tsx (v2.0)
- **역할**: 동적 차트 컴포넌트 선택
- **Input**: `VisualizationConfig`
- **Output**: Recharts 컴포넌트
- **Supported Types**:
  - LineChartComponent
  - BarChartComponent
  - ComparisonChartComponent
  - MetricCardComponent
  - DataTableComponent
  - AreaChartComponent
  - PieChartComponent

---

### 2. AI Service Layer

#### 2.1 OpenAI Integration (openaiService.ts)

**System Prompt**:
```typescript
const systemMessage = `당신은 "닥봇"이라는 이름의 전문 AI 어시스턴트입니다.

역할: 병원 개원을 준비하는 의사들을 위한 상권 분석, 매출 정보, 부동산 매물 추천 컨설턴트

핵심 지침:
1. 사용자의 질문을 정확히 파악하여 적절한 함수(도구)를 호출하세요.
2. 지역명은 "강남구", "서초구", "마포구" 형식으로 정규화하세요.
3. 진료과목은 "내과", "피부과", "치과", "정형외과" 등으로 정확히 추출하세요.
4. 데이터를 받은 후에는 친절하고 전문적인 한국어로 핵심 정보를 요약하여 답변하세요.
5. 숫자는 한국식으로 표현하세요. (예: 1억 2천만원)
`;
```

**Available Tools**:
1. `get_revenue_analysis(region, category)`
2. `get_property_list(region, minArea, maxArea)` (미구현)

**Tool Execution Flow**:
```typescript
async function executeToolCall(toolName: string, args: any): Promise<any> {
    switch (toolName) {
        case 'get_revenue_analysis':
            // 1. Normalize region
            const normalizedRegion = args.region.replace(/구$/, '');
            
            // 2. Call backend API
            const response = await fetch(`${API_BASE_URL}/api/hospitals/stats/monthly?region=${normalizedRegion}&category=${args.category}`);
            
            // 3. Transform to frontend format
            return transformToStats(rawData, args.region, args.category);
    }
}
```

#### 2.2 UI Selection Agent (uiAgent.ts) - v2.0

**Purpose**: Analyze user intent and select optimal chart type

**Input**:
- `userQuery`: "강남구 피부과 매출 추이를 보여줘"
- `toolName`: "get_revenue_analysis"
- `toolResult`: { monthlyRevenue: [...], avgMonthlyRevenue: 52250000, ... }

**Process**:
1. Send to OpenAI with specialized prompt
2. Receive JSON response with chart type
3. Generate `VisualizationConfig`

**Output**:
```typescript
{
    chartType: 'line',
    title: '강남구 피부과 월별 매출 추이',
    description: '최근 6개월 매출 변화',
    data: {
        labels: ['2025-04', '2025-05', ...],
        datasets: [{
            name: '월 매출',
            values: [50372908, 47356337, ...]
        }]
    },
    config: {
        xAxisLabel: '월',
        yAxisLabel: '매출 (만원)',
        showLegend: false
    }
}
```

---

### 3. Backend API

#### 3.1 Server Configuration
```javascript
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new Database(dbPath, { readonly: true });
```

#### 3.2 Query Builder
```javascript
function buildWhereClause(filters) {
    const conditions = [];
    const params = {};

    if (filters.region) {
        conditions.push('address LIKE @region');
        params.region = `%${filters.region}%`;
    }

    if (filters.category) {
        conditions.push('category = @category');
        params.category = filters.category;
    }

    return { conditions, params };
}
```

#### 3.3 Monthly Stats Endpoint
```javascript
app.get('/api/hospitals/stats/monthly', (req, res) => {
    const { region, category } = req.query;
    
    const query = `
        SELECT 
            year_month,
            AVG(revenue) as avg_revenue,
            SUM(transaction_count) as total_transactions,
            COUNT(*) as count,
            AVG(monday) as avg_monday,
            ...
        FROM hospital_revenue
        WHERE address LIKE @region AND category = @category
        GROUP BY year_month
        ORDER BY year_month ASC
    `;
    
    const results = db.prepare(query).all({ region: `%${region}%`, category });
    
    res.json({
        success: true,
        count: results.length,
        data: results
    });
});
```

---

## Data Transformation

### transformToStats Function

**Input** (from backend):
```json
[
    {
        "year_month": "202509",
        "avg_revenue": 52249088.76826484,
        "total_transactions": 62978,
        "count": 1752,
        "avg_monday": 14.2,
        ...
    },
    ...
]
```

**Output** (for frontend):
```typescript
{
    category: "피부과",
    address: "강남구",
    avgMonthlyRevenue: 52249089,  // Latest month
    growthRate: 13.5,             // vs previous month
    monthlyRevenue: [
        { month: "2025-04", amount: 50372909, transactionCount: 35 },
        ...
    ],
    dayDistribution: {
        '월': 14, '화': 15, '수': 16, ...
    },
    regionCode: '',
    referenceDate: '2025-09'
}
```

**Key Calculations**:
```typescript
// 1. Latest month revenue
const avgMonthlyRevenue = monthlyRevenue[monthlyRevenue.length - 1].amount;

// 2. Growth rate
const last = monthlyRevenue[monthlyRevenue.length - 1].amount;
const prev = monthlyRevenue[monthlyRevenue.length - 2].amount;
const growthRate = ((last - prev) / prev * 100).toFixed(1);

// 3. Day distribution (average across all months)
const totalMonths = monthlyData.length;
const dayDistribution = {
    '월': Math.round(monthlyData.reduce((sum, row) => sum + row.avg_monday, 0) / totalMonths),
    ...
};
```

---

## State Management

### Zustand Store (useChatStore.ts)

```typescript
interface ChatState {
    isOpen: boolean;
    messages: Message[];
    isLoading: boolean;
    toggleChat: () => void;
    addMessage: (message: Message) => void;
    setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    isOpen: false,
    messages: [],
    isLoading: false,
    toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
    addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
    })),
    setLoading: (loading) => set({ isLoading: loading }),
}));
```

---

## Security

### API Key Management
```env
# .env
VITE_OPENAI_API_KEY=sk-...
```

**⚠️ Warning**: Client-side API key exposure
- Current: Key visible in browser (not production-ready)
- Recommended: Move to backend proxy

### SQL Injection Prevention
```javascript
// ✅ Parameterized queries
const stmt = db.prepare('SELECT * FROM hospital_revenue WHERE category = @category');
stmt.all({ category: userInput });

// ❌ String concatenation (vulnerable)
db.exec(`SELECT * FROM ... WHERE category = '${userInput}'`);
```

---

## Performance Optimization

### Frontend
- **Code Splitting**: React.lazy() for chart components
- **Memoization**: React.memo() for expensive chart renders
- **Virtualization**: react-window for large data tables

### Backend
- **Connection Pooling**: Single SQLite connection (read-only)
- **Query Caching**: Considered for frequently accessed data
- **Compression**: gzip for API responses

### Database
- **Indexes** (planned):
  ```sql
  CREATE INDEX idx_region_category 
  ON hospital_revenue(address, category);
  
  CREATE INDEX idx_year_month 
  ON hospital_revenue(year_month DESC);
  ```

---

## Monitoring & Logging

### Current State
- Console.log for debugging
- No centralized logging

### Planned (v1.2)
- **Backend**: Winston for structured logging
- **Frontend**: Sentry for error tracking
- **Metrics**: Response times, error rates

---

## Deployment

### Development
```bash
# Frontend + Backend
npm run dev:all  # Vite (5173) + Express (3001)
```

### Production (TBD)
- Frontend: Vercel / Netlify
- Backend: AWS Lambda / Google Cloud Run
- Database: S3 / Cloud Storage
