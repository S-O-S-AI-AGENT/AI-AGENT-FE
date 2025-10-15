# AI-AGENT-FE 아키텍처 문서

## 시스템 아키텍처

### 전체 구조

```
┌────────────────────────────────────────────────────────────┐
│                       Browser (Client)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          React 19 + Next.js 15 App Router            │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Pages     │  │ Components  │  │   Hooks     │  │  │
│  │  │             │  │             │  │             │  │  │
│  │  │ - Home      │  │ - Header    │  │ - useState  │  │  │
│  │  │ - SQL Tuner │  │ - CodeBlock │  │ - useEffect │  │  │
│  │  │ - Text2SQL  │  │ - Icons     │  │             │  │  │
│  │  │ - E2E       │  │ - Spinner   │  │             │  │  │
│  │  │ - Logs      │  │             │  │             │  │  │
│  │  │ - Figma     │  │             │  │             │  │  │
│  │  │ - Codebase  │  │             │  │             │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │              Client-Side State                  │ │  │
│  │  │  - LocalStorage (theme, history)                │ │  │
│  │  │  - useState (forms, UI state)                   │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └────────────────────┬──────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │
                          │ HTTP/JSON
                          │ fetch API
                          ▼
┌────────────────────────────────────────────────────────────┐
│                  Next.js Server (Vercel/Docker)             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  API Routes                           │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  /api/sql-tuner       (POST)                 │   │  │
│  │  │  - Request: { query: string }                │   │  │
│  │  │  - Response: { optimizedQuery, improvements }│   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  /api/text2sql        (POST)                 │   │  │
│  │  │  - Request: { question, schema }             │   │  │
│  │  │  - Response: { sql, explanation }            │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  /api/log-analyzer    (POST)                 │   │  │
│  │  │  - Request: { logs: string }                 │   │  │
│  │  │  - Response: { summary, issues, patterns }   │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  /api/e2e-analyzer    (POST)                 │   │  │
│  │  │  - Request: { url, scenario }                │   │  │
│  │  │  - Response: { recommendedSteps }            │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  /api/health          (GET)                  │   │  │
│  │  │  - Response: { status, uptime, env }         │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Current: Mock Data Layer                   │  │
│  │  - Simulated AI responses                             │  │
│  │  - 2 second delay for realism                         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ (Future Integration)
                         ▼
┌────────────────────────────────────────────────────────────┐
│                     AI Services Layer                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  OpenAI GPT  │  │   Claude     │  │  Custom LLM  │     │
│  │              │  │   Anthropic  │  │              │     │
│  │  - SQL Gen   │  │  - Code Gen  │  │  - Log Parse │     │
│  │  - Optimize  │  │  - Analysis  │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────────────────────────────────────┘
```

---

## 데이터 흐름

### 일반적인 요청 플로우

```
1. User Interaction
   ↓
2. Event Handler (onClick, onChange, onSubmit)
   ↓
3. Form Validation (client-side)
   ↓
4. setState({ isLoading: true })
   ↓
5. API Call
   fetch('/api/feature', {
     method: 'POST',
     body: JSON.stringify(data)
   })
   ↓
6. Next.js API Route Handler
   ↓
7. Request Validation
   ↓
8. Business Logic (Currently: Mock Data)
   ↓
9. Response Formatting
   ↓
10. JSON Response
    ↓
11. Client Receives Data
    ↓
12. setState({ result, isLoading: false })
    ↓
13. UI Re-render
    ↓
14. Display Results
```

### SQL 튜너 예시

```typescript
// 1. User Input
<textarea onChange={(e) => setOriginalSQL(e.target.value)} />

// 2. Event Handler
const handleAnalyze = async () => {
  setIsAnalyzing(true);
  
  // 3. API Call
  const response = await fetch('/api/sql-tuner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: originalSQL })
  });
  
  // 4. Parse Response
  const data = await response.json();
  
  // 5. Update State
  setOptimizedSQL(data.optimizedQuery);
  setAnalysis(data);
  setIsAnalyzing(false);
};

// 6. Display Results
{analysis && (
  <div>
    <CodeBlock code={optimizedSQL} />
    <ImprovementsList items={analysis.improvements} />
  </div>
)}
```

---

## 컴포넌트 계층 구조

```
RootLayout (src/app/layout.tsx)
│
├─ HomePage (src/app/page.tsx)
│  ├─ Header
│  │  ├─ Logo
│  │  ├─ Title
│  │  └─ DarkModeToggle
│  ├─ Hero Section
│  │  ├─ MainTitle
│  │  ├─ Description
│  │  └─ CTAButtons
│  └─ Features Grid
│     ├─ FeatureCard × 6
│     │  ├─ Icon
│     │  ├─ Title
│     │  ├─ Description
│     │  ├─ Stats
│     │  └─ Link
│     └─ ...
│
├─ SQL Tuner Page (src/app/sql-tuner/page.tsx)
│  ├─ PageHeader (component)
│  │  ├─ BackButton
│  │  ├─ Title
│  │  └─ DarkModeToggle
│  ├─ Input Section
│  │  ├─ Label
│  │  ├─ Textarea (Original SQL)
│  │  └─ AnalyzeButton
│  ├─ Result Section
│  │  ├─ CodeBlock (Optimized SQL)
│  │  ├─ ImprovementsList
│  │  │  └─ ImprovementCard × N
│  │  └─ PerformanceMetrics
│  └─ History Section
│
├─ E2E Tester Page (src/app/e2e-tester/page.tsx)
│  ├─ PageHeader
│  ├─ Tabs
│  │  ├─ Tests Tab
│  │  │  ├─ TestList
│  │  │  │  └─ TestCard × N
│  │  │  └─ AddTestButton
│  │  └─ Results Tab
│  │     └─ ResultsList
│  ├─ TestBuilder
│  │  ├─ TestNameInput
│  │  ├─ URLInput
│  │  ├─ StepsList
│  │  │  └─ StepCard × N
│  │  │     ├─ ActionSelect
│  │  │     ├─ SelectorInput
│  │  │     ├─ ValueInput
│  │  │     └─ DeleteButton
│  │  └─ AddStepButton
│  └─ ActionBar
│     ├─ RunButton
│     ├─ ExportButton
│     └─ DownloadButton
│
├─ Codebase Generator (src/app/codebase-generator/page.tsx)
│  ├─ PageHeader
│  ├─ WizardSteps
│  │  ├─ StepIndicator
│  │  └─ ProgressBar
│  ├─ Step1: Basic Info
│  │  ├─ ProjectNameInput
│  │  ├─ DescriptionTextarea
│  │  └─ CategorySelect
│  ├─ Step2: Target & Difficulty
│  │  ├─ TargetUserInput
│  │  └─ DifficultySelector
│  ├─ Step3: Platform & Features
│  │  ├─ PlatformCheckboxes
│  │  └─ FeaturesList
│  ├─ Step4: Tech Stack
│  │  ├─ FrontendSelect
│  │  ├─ BackendSelect
│  │  ├─ DatabaseSelect
│  │  └─ DeploymentSelect
│  ├─ NavigationButtons
│  │  ├─ PrevButton
│  │  └─ NextButton / GenerateButton
│  └─ ResultSection
│     ├─ ProjectStructureTree
│     ├─ DependenciesList
│     ├─ ConventionsList
│     └─ DownloadButton
│
└─ Guide Page (src/app/guide/page.tsx)
   ├─ PageHeader
   ├─ TabNavigation
   │  └─ Tab × 8
   ├─ Overview Section
   │  ├─ IntroText
   │  └─ QuickStartSteps
   ├─ Feature Guides
   │  ├─ SQLTunerGuide
   │  ├─ Text2SQLGuide
   │  ├─ E2EGuide
   │  ├─ LogAnalyzerGuide
   │  ├─ FigmaGuide
   │  └─ CodebaseGuide
   └─ Tips Section
```

---

## 상태 관리 패턴

### 현재 구조 (Local State)

각 페이지가 독립적인 상태를 관리합니다:

```typescript
// 모든 페이지에서 반복되는 패턴
export default function FeaturePage() {
  // 1. Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 2. LocalStorage Persistence
  useEffect(() => {
    const saved = localStorage.getItem("feature-dark-mode");
    if (saved) setIsDarkMode(JSON.parse(saved));
  }, []);
  
  useEffect(() => {
    localStorage.setItem("feature-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  // 3. Feature-specific State
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // ... rest of component
}
```

**장점:**
- ✅ 간단하고 직관적
- ✅ 각 페이지가 독립적
- ✅ 코드 이해하기 쉬움

**단점:**
- ⚠️ 코드 중복 (dark mode 로직 반복)
- ⚠️ 테마 상태가 페이지마다 별도로 관리됨
- ⚠️ 전역 상태 공유 어려움

### 권장 구조 (Context API)

```typescript
// contexts/ThemeContext.tsx
export const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem("app-theme");
    if (saved) setIsDarkMode(JSON.parse(saved));
  }, []);
  
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem("app-theme", JSON.stringify(newValue));
      return newValue;
    });
  }, []);
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom Hook
export function useTheme() {
  return useContext(ThemeContext);
}

// Usage in layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// Usage in pages
export default function FeaturePage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  // 중복 코드 제거!
}
```

---

## API 설계

### RESTful 엔드포인트

| Endpoint | Method | Request | Response | Status |
|----------|--------|---------|----------|--------|
| `/api/health` | GET | - | `{ status, uptime, env }` | ✅ 구현 |
| `/api/sql-tuner` | POST | `{ query }` | `{ optimizedQuery, improvements, performance }` | 🟡 Mock |
| `/api/text2sql` | POST | `{ question, schema? }` | `{ sql, explanation, confidence }` | 🟡 Mock |
| `/api/log-analyzer` | POST | `{ logs }` | `{ summary, issues, patterns, recommendations }` | 🟡 Mock |
| `/api/e2e-analyzer` | POST | `{ url, scenario }` | `{ recommendedSteps }` | 🟡 Mock |

**범례:**
- ✅ 구현: 실제 로직 구현
- 🟡 Mock: Mock 데이터 반환
- ❌ 미구현: 엔드포인트 없음

### API 응답 형식

모든 API는 일관된 형식을 따릅니다:

```typescript
// Success Response
{
  // 기능별 데이터
  [feature-specific data]
}

// Error Response
{
  error: "에러 메시지"
}
```

### 에러 핸들링

```typescript
export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();
    
    // Validation
    if (!data) {
      return NextResponse.json(
        { error: "데이터가 필요합니다." },
        { status: 400 }
      );
    }
    
    // Business Logic
    const result = await processData(data);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
```

---

## 라우팅 구조

Next.js App Router 파일 시스템 기반:

```
/                           → src/app/page.tsx (Home)
/sql-tuner                  → src/app/sql-tuner/page.tsx
/text2sql                   → src/app/text2sql/page.tsx
/e2e-tester                 → src/app/e2e-tester/page.tsx
/log-analyzer               → src/app/log-analyzer/page.tsx
/figma-generator            → src/app/figma-generator/page.tsx
/codebase-generator         → src/app/codebase-generator/page.tsx
/guide                      → src/app/guide/page.tsx
/features                   → src/app/features/page.tsx

/api/health                 → src/app/api/health/route.ts
/api/sql-tuner              → src/app/api/sql-tuner/route.ts
/api/text2sql               → src/app/api/text2sql/route.ts
/api/log-analyzer           → src/app/api/log-analyzer/route.ts
/api/e2e-analyzer           → src/app/api/e2e-analyzer/route.ts
```

---

## 스타일링 아키텍처

### Tailwind CSS 구조

```
globals.css
├─ @import "tailwindcss"
├─ CSS Variables (:root)
│  ├─ --background
│  ├─ --foreground
│  ├─ --font-sans
│  └─ --font-mono
├─ Dark Mode (@media prefers-color-scheme)
└─ Custom Styles
   ├─ Scrollbar styling
   └─ Utility classes

Component Styles (inline Tailwind)
├─ Layout: flex, grid, container
├─ Colors: bg-*, text-*, border-*
├─ Spacing: p-*, m-*, gap-*
├─ Effects: shadow-*, hover:*, transition-*
└─ Responsive: sm:*, md:*, lg:*
```

### 다크 모드 구현

```typescript
// 조건부 클래스 적용
<div className={`
  ${isDarkMode 
    ? "bg-gray-900 text-white" 
    : "bg-white text-gray-900"
  }
`}>
```

---

## 빌드 & 배포 아키텍처

### Docker 멀티스테이지 빌드

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### 배포 옵션

1. **Vercel (추천)**
   - 자동 배포
   - Edge 네트워크
   - 제로 설정

2. **Docker**
   - Self-hosted
   - Kubernetes 지원
   - 완전한 제어

3. **Docker Compose**
   ```yaml
   services:
     web:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
   ```

---

## 보안 아키텍처

### 현재 보안 계층

```
┌─────────────────────────────────────┐
│     1. Client-Side Validation       │
│  - Form validation                  │
│  - Input length limits              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     2. Network Layer (HTTPS)        │
│  - TLS encryption                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     3. Next.js Security             │
│  - CSRF protection (future)         │
│  - XSS prevention (React)           │
│  - Content Security Policy          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     4. API Routes                   │
│  - Request validation               │
│  - Error handling                   │
│  - Rate limiting (future)           │
└─────────────────────────────────────┘
```

### 권장 보안 강화

```typescript
// 1. Zod를 사용한 입력 검증
import { z } from 'zod';

const schema = z.object({
  query: z.string().min(1).max(10000),
});

// 2. Rate Limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// 3. Helmet.js (보안 헤더)
import helmet from 'helmet';

// 4. CORS 설정
const allowedOrigins = ['https://yourdomain.com'];
```

---

## 성능 최적화 전략

### 현재 구조

```
┌─────────────────────────────────────┐
│         1. Build Time               │
│  - Next.js Turbopack                │
│  - TypeScript compilation           │
│  - Tailwind CSS purge               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         2. Bundle                   │
│  - App Router code splitting        │
│  - Image optimization (disabled)    │
│  - Font optimization                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         3. Runtime                  │
│  - React 19 optimizations           │
│  - Client-side caching (LS)         │
└─────────────────────────────────────┘
```

### 개선 전략

```typescript
// 1. Dynamic Import (Monaco Editor)
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

// 2. React.memo
const MemoizedCard = React.memo(FeatureCard);

// 3. useMemo
const expensiveValue = useMemo(
  () => computeExpensive(data),
  [data]
);

// 4. Image Optimization
import Image from 'next/image';
<Image src="/logo.png" width={50} height={50} />
```

---

## 확장성 고려사항

### 수평 확장 (Horizontal Scaling)

```
Load Balancer
    │
    ├─ Next.js Instance 1
    ├─ Next.js Instance 2
    └─ Next.js Instance 3
```

### 수직 확장 (Vertical Scaling)

- CPU: 다중 코어 활용
- 메모리: Node.js 힙 크기 증가
- I/O: SSD, 빠른 네트워크

### 캐싱 전략

```
┌─────────────────────────────────────┐
│     1. Browser Cache                │
│  - Static assets (CSS, JS, images)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     2. CDN Cache                    │
│  - Vercel Edge Network              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     3. Server Cache                 │
│  - Redis (future)                   │
│  - In-memory cache                  │
└─────────────────────────────────────┘
```

---

## 미래 아키텍처 비전

### Phase 1: AI Integration (즉시)

```
Frontend → API Routes → AI Services
                          ├─ OpenAI GPT-4
                          ├─ Claude
                          └─ Custom Models
```

### Phase 2: Microservices (중기)

```
Frontend
    │
    ├─ SQL Service
    ├─ Log Analysis Service
    ├─ Code Generation Service
    └─ Design Service
```

### Phase 3: Real-time (장기)

```
Frontend ←→ WebSocket ←→ Backend
              │
              ├─ Collaborative Editing
              ├─ Live Updates
              └─ Notifications
```

---

## 결론

현재 아키텍처는 **견고하고 확장 가능한 기반**을 제공합니다:

✅ **강점:**
- Next.js App Router 활용
- 명확한 관심사 분리
- Docker 배포 준비 완료
- TypeScript 타입 안정성

⚠️ **개선 필요:**
- AI API 실제 연동
- 전역 상태 관리
- 보안 강화
- 성능 최적화

프로젝트는 **프로덕션 배포를 위한 좋은 출발점**에 있으며, 몇 가지 핵심 개선사항을 적용하면 상용 서비스로 발전할 수 있습니다.
