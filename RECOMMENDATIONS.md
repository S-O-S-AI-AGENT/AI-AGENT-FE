# 개선 권장사항 (Recommendations)

이 문서는 AI-AGENT-FE 프로젝트의 구체적인 개선 권장사항을 우선순위별로 정리합니다.

---

## 🔴 즉시 개선 필요 (Critical - 1-2주)

### 1. AI API 실제 연동

**현재 상태:**
```typescript
// 모든 API가 Mock 데이터 사용
setTimeout(() => {
  const mockResponse = { ... };
  setResult(mockResponse);
}, 2000);
```

**개선 방안:**
```typescript
// .env.local
OPENAI_API_KEY=sk-...
OPENAI_API_ENDPOINT=https://api.openai.com/v1/chat/completions

// src/lib/ai.ts
export async function callAI(prompt: string) {
  const response = await fetch(process.env.OPENAI_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// API Route 업데이트
export async function POST(request: NextRequest) {
  const { query } = await request.json();
  
  const prompt = `SQL 쿼리를 최적화해주세요:\n${query}`;
  const aiResponse = await callAI(prompt);
  
  return NextResponse.json({
    optimizedQuery: parseOptimizedQuery(aiResponse),
    improvements: parseImprovements(aiResponse),
  });
}
```

**우선순위:** 🔴 높음  
**예상 소요 시간:** 3-5일  
**영향도:** 매우 높음 (핵심 기능)

---

### 2. 테마 관리 전역화

**문제점:**
- 각 페이지마다 dark mode 로직 중복
- LocalStorage 키가 페이지마다 다름
- 코드 중복으로 유지보수 어려움

**개선 방안:**

1. **Context 생성**
```typescript
// src/contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('app-theme', JSON.stringify(newValue));
      return newValue;
    });
  };
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

2. **Layout 업데이트**
```typescript
// src/app/layout.tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

3. **페이지에서 사용**
```typescript
// src/app/sql-tuner/page.tsx
import { useTheme } from '@/contexts/ThemeContext';

export default function SQLTuner() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  // 모든 중복 코드 제거!
  // useEffect, localStorage 로직 불필요
  
  return (
    <PageHeader 
      isDarkMode={isDarkMode}
      setIsDarkMode={toggleDarkMode}
      {...otherProps}
    />
  );
}
```

**우선순위:** 🔴 높음  
**예상 소요 시간:** 2-3일  
**영향도:** 중간 (코드 품질)

---

### 3. 입력 검증 강화

**현재 상태:**
```typescript
// 기본적인 검증만 존재
if (!query) {
  return NextResponse.json({ error: "쿼리 필요" }, { status: 400 });
}
```

**개선 방안:**

1. **Zod 설치**
```bash
npm install zod
```

2. **검증 스키마 정의**
```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const sqlTunerSchema = z.object({
  query: z.string()
    .min(1, "쿼리를 입력해주세요")
    .max(10000, "쿼리가 너무 깁니다"),
  schema: z.string().optional(),
});

export const text2sqlSchema = z.object({
  question: z.string()
    .min(1, "질문을 입력해주세요")
    .max(500, "질문이 너무 깁니다"),
  schema: z.string().optional(),
});

export const logAnalyzerSchema = z.object({
  logs: z.string()
    .min(1, "로그를 입력해주세요")
    .max(1000000, "로그가 너무 큽니다 (최대 1MB)"),
});
```

3. **API에서 사용**
```typescript
// src/app/api/sql-tuner/route.ts
import { sqlTunerSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    const validated = sqlTunerSchema.parse(body);
    
    // Business logic
    const result = await processSQLQuery(validated.query);
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}
```

**우선순위:** 🔴 높음  
**예상 소요 시간:** 1-2일  
**영향도:** 높음 (보안)

---

## 🟡 중기 개선 (Important - 1-2개월)

### 4. 컴포넌트 분리

**문제점:**
- `codebase-generator/page.tsx`: 926 라인
- `e2e-tester/page.tsx`: 979 라인
- `guide/page.tsx`: 1,362 라인

**개선 방안:**

**Before:**
```typescript
// src/app/codebase-generator/page.tsx (926 lines)
export default function CodebaseGenerator() {
  // All logic in one file
  return (
    <>
      {/* Step 1 */}
      {currentStep === 1 && <div>...</div>}
      
      {/* Step 2 */}
      {currentStep === 2 && <div>...</div>}
      
      {/* Step 3 */}
      {currentStep === 3 && <div>...</div>}
      
      {/* Step 4 */}
      {currentStep === 4 && <div>...</div>}
    </>
  );
}
```

**After:**
```typescript
// src/app/codebase-generator/components/StepOne.tsx
export function StepOne({ data, onChange }) {
  return (
    <div>
      <ProjectNameInput value={data.name} onChange={onChange} />
      <DescriptionTextarea value={data.desc} onChange={onChange} />
    </div>
  );
}

// src/app/codebase-generator/components/StepTwo.tsx
export function StepTwo({ data, onChange }) {
  return (
    <div>
      <TargetUserInput value={data.target} onChange={onChange} />
      <DifficultySelector value={data.difficulty} onChange={onChange} />
    </div>
  );
}

// src/app/codebase-generator/page.tsx (cleaned up)
import { StepOne } from './components/StepOne';
import { StepTwo } from './components/StepTwo';
import { StepThree } from './components/StepThree';
import { StepFour } from './components/StepFour';

export default function CodebaseGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  return (
    <>
      {currentStep === 1 && <StepOne data={formData} onChange={setFormData} />}
      {currentStep === 2 && <StepTwo data={formData} onChange={setFormData} />}
      {currentStep === 3 && <StepThree data={formData} onChange={setFormData} />}
      {currentStep === 4 && <StepFour data={formData} onChange={setFormData} />}
    </>
  );
}
```

**우선순위:** 🟡 중간  
**예상 소요 시간:** 5-7일  
**영향도:** 중간 (유지보수성)

---

### 5. 단위 테스트 추가

**현재 상태:**
- E2E 테스트만 존재 (331 라인)
- 단위 테스트 0%

**개선 방안:**

1. **Jest 및 Testing Library 설치**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

2. **Jest 설정**
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

3. **컴포넌트 테스트**
```typescript
// __tests__/components/PageHeader.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PageHeader from '@/components/PageHeader';

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(
      <PageHeader 
        title="Test Title"
        description="Test Description"
        icon="🚀"
        isDarkMode={false}
        setIsDarkMode={jest.fn()}
        storageKey="test"
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
  
  it('toggles dark mode on button click', () => {
    const setDarkMode = jest.fn();
    render(
      <PageHeader 
        isDarkMode={false}
        setIsDarkMode={setDarkMode}
        {...otherProps}
      />
    );
    
    fireEvent.click(screen.getByText('☀️'));
    expect(setDarkMode).toHaveBeenCalledWith(true);
  });
});
```

4. **API 테스트**
```typescript
// __tests__/api/sql-tuner.test.ts
import { POST } from '@/app/api/sql-tuner/route';

describe('SQL Tuner API', () => {
  it('returns optimized query', async () => {
    const request = new Request('http://localhost/api/sql-tuner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'SELECT * FROM users' }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.optimizedQuery).toBeDefined();
    expect(data.improvements).toBeInstanceOf(Array);
  });
  
  it('returns error for empty query', async () => {
    const request = new Request('http://localhost/api/sql-tuner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '' }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

5. **유틸리티 테스트**
```typescript
// __tests__/lib/utils.test.ts
import { textUtils } from '@/lib/utils';

describe('textUtils', () => {
  describe('truncate', () => {
    it('truncates long text', () => {
      const result = textUtils.truncate('Hello World', 5);
      expect(result).toBe('Hello...');
    });
    
    it('does not truncate short text', () => {
      const result = textUtils.truncate('Hi', 5);
      expect(result).toBe('Hi');
    });
  });
  
  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(textUtils.formatFileSize(500)).toBe('500.0 B');
    });
    
    it('formats kilobytes', () => {
      expect(textUtils.formatFileSize(1024)).toBe('1.0 KB');
    });
  });
});
```

**목표 커버리지:**
- 컴포넌트: 80%+
- API Routes: 90%+
- 유틸리티: 95%+

**우선순위:** 🟡 중간  
**예상 소요 시간:** 2주  
**영향도:** 높음 (품질 보증)

---

### 6. 상태 관리 라이브러리 도입

**현재 문제:**
- E2E 테스터의 복잡한 상태 관리
- 테스트 히스토리, 결과, 현재 테스트 등 여러 상태

**개선 방안:**

1. **Zustand 설치**
```bash
npm install zustand
```

2. **Store 생성**
```typescript
// src/store/e2eStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Test {
  id: number;
  name: string;
  url: string;
  steps: TestStep[];
  status: 'idle' | 'running' | 'passed' | 'failed';
}

interface E2EStore {
  tests: Test[];
  results: TestResult[];
  activeTab: 'tests' | 'results';
  
  addTest: (test: Test) => void;
  updateTest: (id: number, updates: Partial<Test>) => void;
  deleteTest: (id: number) => void;
  runTest: (id: number) => Promise<void>;
  setActiveTab: (tab: 'tests' | 'results') => void;
}

export const useE2EStore = create<E2EStore>()(
  persist(
    (set, get) => ({
      tests: [],
      results: [],
      activeTab: 'tests',
      
      addTest: (test) => 
        set((state) => ({ tests: [...state.tests, test] })),
      
      updateTest: (id, updates) =>
        set((state) => ({
          tests: state.tests.map(t => 
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      
      deleteTest: (id) =>
        set((state) => ({
          tests: state.tests.filter(t => t.id !== id),
        })),
      
      runTest: async (id) => {
        // Test execution logic
      },
      
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'e2e-storage',
    }
  )
);
```

3. **컴포넌트에서 사용**
```typescript
// src/app/e2e-tester/page.tsx
import { useE2EStore } from '@/store/e2eStore';

export default function E2ETester() {
  const { 
    tests, 
    addTest, 
    updateTest, 
    deleteTest 
  } = useE2EStore();
  
  // 훨씬 깔끔한 코드!
  return (
    <div>
      {tests.map(test => (
        <TestCard 
          key={test.id}
          test={test}
          onUpdate={(updates) => updateTest(test.id, updates)}
          onDelete={() => deleteTest(test.id)}
        />
      ))}
    </div>
  );
}
```

**우선순위:** 🟡 중간  
**예상 소요 시간:** 3-5일  
**영향도:** 중간 (개발 경험)

---

### 7. 성능 최적화

**문제점:**
- Monaco Editor 번들 크기 (3MB+)
- 불필요한 리렌더링
- 이미지 최적화 비활성화

**개선 방안:**

1. **Monaco Editor Dynamic Import**
```typescript
// src/components/CodeEditor.tsx
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />,
  }
);

export function CodeEditor({ code, onChange }) {
  return (
    <MonacoEditor 
      value={code}
      onChange={onChange}
      language="sql"
      theme="vs-dark"
    />
  );
}
```

2. **React.memo 적용**
```typescript
// src/components/FeatureCard.tsx
import { memo } from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = memo(({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="card">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';
export default FeatureCard;
```

3. **useMemo / useCallback**
```typescript
// src/app/e2e-tester/page.tsx
import { useMemo, useCallback } from 'react';

export default function E2ETester() {
  const [tests, setTests] = useState([]);
  
  // Expensive computation
  const passedTests = useMemo(
    () => tests.filter(t => t.status === 'passed'),
    [tests]
  );
  
  // Function memoization
  const handleRunTest = useCallback(
    async (id: number) => {
      // Run test logic
    },
    []
  );
  
  return <TestList tests={passedTests} onRun={handleRunTest} />;
}
```

4. **이미지 최적화 활성화**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: false, // 활성화
    domains: ['yourdomain.com'],
  },
};
```

**우선순위:** 🟡 중간  
**예상 소요 시간:** 3-4일  
**영향도:** 중간 (사용자 경험)

---

## 🟢 장기 개선 (Nice to Have - 3-6개월)

### 8. 국제화 (i18n) 지원

**설치:**
```bash
npm install next-intl
```

**설정:**
```typescript
// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./locales/${locale}.json`)).default,
}));

// src/locales/ko.json
{
  "HomePage": {
    "title": "AI Project Agent",
    "description": "개발과 운영을 간단하게"
  }
}

// src/locales/en.json
{
  "HomePage": {
    "title": "AI Project Agent",
    "description": "Simplify Development and Operations"
  }
}
```

**사용:**
```typescript
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');
  
  return (
    <h1>{t('title')}</h1>
  );
}
```

**우선순위:** 🟢 낮음  
**예상 소요 시간:** 1-2주  
**영향도:** 낮음 (글로벌 확장 시)

---

### 9. PWA 변환

**설치:**
```bash
npm install next-pwa
```

**설정:**
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // existing config
});
```

**매니페스트:**
```json
// public/manifest.json
{
  "name": "AI Project Agent",
  "short_name": "AI Agent",
  "description": "AI-powered development tools",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

**우선순위:** 🟢 낮음  
**예상 소요 시간:** 2-3일  
**영향도:** 낮음 (모바일 경험)

---

### 10. 실시간 협업 기능

**WebSocket 기반 실시간 업데이트:**

```typescript
// src/lib/websocket.ts
import { io, Socket } from 'socket.io-client';

export class RealtimeService {
  private socket: Socket;
  
  connect(testId: string) {
    this.socket = io('wss://your-server.com');
    this.socket.emit('join-test', testId);
  }
  
  onTestUpdate(callback: (test: Test) => void) {
    this.socket.on('test-updated', callback);
  }
  
  updateTest(testId: string, updates: Partial<Test>) {
    this.socket.emit('update-test', { testId, updates });
  }
}
```

**우선순위:** 🟢 낮음  
**예상 소요 시간:** 2-3주  
**영향도:** 낮음 (팀 협업 시)

---

## 📊 우선순위 요약

### 즉시 (1-2주)
1. ✅ AI API 실제 연동 - **가장 중요**
2. ✅ 테마 관리 전역화
3. ✅ 입력 검증 강화

### 중기 (1-2개월)
4. ✅ 컴포넌트 분리
5. ✅ 단위 테스트 추가
6. ✅ 상태 관리 라이브러리
7. ✅ 성능 최적화

### 장기 (3-6개월)
8. ⭕ 국제화 지원
9. ⭕ PWA 변환
10. ⭕ 실시간 협업

---

## 💡 구현 순서 제안

**Week 1-2:**
- AI API 연동 (OpenAI/Claude)
- 입력 검증 (Zod)

**Week 3-4:**
- 테마 Context 생성
- 기존 페이지 마이그레이션

**Week 5-8:**
- 단위 테스트 작성
- 80% 커버리지 목표

**Week 9-12:**
- 큰 컴포넌트 분리
- 성능 최적화
- 상태 관리 개선

**Month 4-6:**
- i18n 지원
- PWA 변환
- 고급 기능 추가

---

## 🎯 성공 지표

### 코드 품질
- TypeScript 에러: 0
- ESLint 경고: < 10
- 테스트 커버리지: > 80%

### 성능
- Lighthouse 점수: > 90
- 번들 크기: < 500KB (초기 로드)
- TTI (Time to Interactive): < 3초

### 보안
- 입력 검증: 100%
- OWASP Top 10: 모두 대응
- 의존성 취약점: 0

### 사용자 경험
- 로딩 시간: < 2초
- 에러율: < 1%
- 응답 시간: < 500ms

---

이 권장사항들을 단계적으로 적용하면 프로젝트가 **프로덕션 수준의 완성도**를 갖추게 될 것입니다.
