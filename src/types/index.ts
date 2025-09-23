// SQL 튜너 관련 타입
export interface SQLTunerRequest {
  query: string;
  schema?: string;
}

export interface SQLTunerResponse {
  optimizedQuery: string;
  improvements: Improvement[];
  performance: PerformanceMetrics;
}

export interface Improvement {
  type: string;
  impact: "높음" | "중간" | "낮음";
  description: string;
}

export interface PerformanceMetrics {
  originalTime: string;
  optimizedTime: string;
  improvement: string;
}

// Text2SQL 관련 타입
export interface Text2SQLRequest {
  question: string;
  schema?: string;
}

export interface Text2SQLResponse {
  sql: string;
  explanation: string;
  confidence: number;
}

// E2E 테스터 관련 타입
export interface TestStep {
  action: "navigate" | "click" | "fill" | "expect" | "wait";
  selector: string;
  value: string;
}

export interface E2ETest {
  id: number;
  name: string;
  url: string;
  steps: TestStep[];
  status: "idle" | "running" | "passed" | "failed";
}

export interface TestResult {
  testId: number;
  testName: string;
  status: "passed" | "failed";
  duration: number;
  error?: string;
  screenshot?: string;
}

// 로그 분석기 관련 타입
export interface LogAnalysisRequest {
  logs: string;
}

export interface LogAnalysisResponse {
  summary: LogSummary;
  issues: LogIssue[];
  patterns: LogPattern[];
  recommendations: string[];
}

export interface LogSummary {
  totalLines: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  timeRange: string;
}

export interface LogIssue {
  type: "critical" | "error" | "warning";
  category: string;
  message: string;
  count: number;
  impact: "높음" | "중간" | "낮음";
  suggestion: string;
  firstOccurrence: string;
  affectedService: string;
}

export interface LogPattern {
  pattern: string;
  frequency: number;
  description: string;
}
