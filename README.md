# AI Project Agent

🤖 1인 기업과 중소기업을 위한 AI 기반 개발 및 운영 도구 모음입니다.

## ✨ 주요 기능

### 🔧 개발 도구

- **SQL 튜너**: AI 기반 SQL 쿼리 최적화 및 성능 분석
- **Text2SQL**: 자연어를 SQL 쿼리로 변환
- **E2E 자동 테스터**: Playwright 기반 자동화 테스트 도구
- **로그 분석기**: AI 기반 로그 패턴 분석 및 이슈 탐지

### 🎨 새로운 AI 도구

- **Figma 디자인 생성기**: AI 기반 UI/UX 디자인 자동 생성
- **코드베이스 생성기**: 스마트 프로젝트 스캐폴딩 및 구조 생성

## 🌟 특징

- 🌓 **다크/라이트 모드**: 완전한 테마 지원
- 🎨 **모던 UI**: Glassmorphism과 그라디언트 디자인
- 📱 **반응형**: 모든 디바이스에서 완벽한 사용자 경험
- 🔄 **실시간**: 즉석에서 결과 확인 가능
- 🚀 **고성능**: Next.js 15 + Turbopack으로 빠른 빌드

## 🛠 기술 스택

- **Frontend**: Next.js 15.5.3, React 19, TypeScript
- **Styling**: Tailwind CSS 4.0, 커스텀 Glassmorphism 효과
- **UI Components**: Radix UI (Dialog, Select, Tabs)
- **Icons**: 커스텀 Emoji 기반 아이콘 시스템
- **Code Editor**: Monaco Editor with Syntax Highlighting
- **Testing**: Playwright E2E 테스트
- **Container**: Docker 멀티스테이지 빌드 지원

## 🚀 시작하기

### 로컬 개발

1. **의존성 설치**

```bash
npm install
```

2. **개발 서버 실행**

```bash
npm run dev
```

3. **브라우저에서 확인**
   - [http://localhost:3000](http://localhost:3000) 접속

### Docker로 실행

#### 프로덕션 환경

```bash
# Docker Compose로 빌드 및 실행
docker-compose up --build

# 또는 직접 빌드
docker build -t ai-project-agent .
docker run -p 3000:3000 ai-project-agent
```

#### 개발 환경

```bash
# 개발용 Docker Compose
docker-compose -f docker-compose.dev.yml up --build
```

### 테스트 실행

```bash
npm run test        # Playwright E2E 테스트
npm run test:ui     # 테스트 UI 모드
npm run lint        # ESLint 검사
```

## 📁 프로젝트 구조

```
ai-project-agent/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── sql-tuner/         # SQL 튜너 페이지
│   │   ├── text2sql/          # Text2SQL 페이지
│   │   ├── e2e-tester/        # E2E 테스터 페이지
│   │   ├── log-analyzer/      # 로그 분석기 페이지
│   │   ├── figma-generator/   # Figma 생성기 페이지
│   │   ├── codebase-generator/ # 코드베이스 생성기 페이지
│   │   └── guide/             # 사용 가이드
│   ├── components/            # 재사용 가능한 컴포넌트
│   ├── lib/                   # 유틸리티 함수
│   └── types/                 # TypeScript 타입 정의
├── public/                    # 정적 파일
├── tests/                     # Playwright 테스트
├── Dockerfile                 # 프로덕션 Docker 이미지
├── Dockerfile.dev             # 개발용 Docker 이미지
├── docker-compose.yml         # 프로덕션 Docker Compose
└── docker-compose.dev.yml     # 개발용 Docker Compose
```

## 🎯 사용법

### 1. SQL 튜너

- SQL 쿼리를 입력하면 AI가 성능 최적화 제안
- 실행 계획 분석 및 인덱스 추천

### 2. Text2SQL

- 자연어로 질문하면 SQL 쿼리로 변환
- 데이터베이스 스키마 업로드 지원

### 3. E2E 테스터

- 웹사이트 URL과 테스트 시나리오 입력
- Playwright 코드 자동 생성

### 4. 로그 분석기

- 로그 파일 업로드 또는 텍스트 입력
- AI 기반 패턴 분석 및 이슈 탐지

### 5. Figma 디자인 생성기

- 원하는 디자인을 설명하면 Figma MCP로 자동 생성
- UI/UX 컴포넌트 및 와이어프레임 생성

### 6. 코드베이스 생성기

- 프로젝트 요구사항 입력으로 전체 구조 생성
- 기술 스택 추천 및 best practice 적용

## 🐳 Docker 배포

### Health Check

애플리케이션은 `/api/health` 엔드포인트를 통해 헬스 체크를 제공합니다.

### 환경 변수

```bash
NODE_ENV=production           # 실행 환경
NEXT_TELEMETRY_DISABLED=1    # Next.js 텔레메트리 비활성화
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🔗 관련 링크

- [Next.js Documentation](https://nextjs.org/docs) - Next.js 기능 및 API 가이드
- [Tailwind CSS](https://tailwindcss.com) - 유틸리티 우선 CSS 프레임워크
- [Radix UI](https://www.radix-ui.com) - 접근성을 고려한 UI 컴포넌트
- [Playwright](https://playwright.dev) - 모던 웹 앱 테스팅
