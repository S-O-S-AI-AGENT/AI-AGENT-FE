# AI 코드 분석기 설정 가이드

## 🔧 환경변수 설정

AI 코드 분석기를 사용하기 위해 다음 환경변수를 `.env.local` 파일에 설정해주세요:

### 1. Gemini AI API Key

Google Gemini AI를 사용하기 위한 API 키가 필요합니다.

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

**API 키 획득 방법:**

1. [Google AI Studio](https://aistudio.google.com/app/apikey)에 접속
2. Google 계정으로 로그인
3. "Create API Key" 버튼 클릭
4. 생성된 API 키를 복사하여 환경변수에 설정

### 2. GitHub Token (이슈 생성용)

분석 결과를 GitHub 이슈로 생성하기 위한 토큰이 필요합니다.

```bash
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=S-O-S-AI-AGENT
GITHUB_REPO=AI-AGENT-FE
```

**GitHub Token 생성 방법:**

1. GitHub 계정으로 로그인
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token (classic)" 클릭
4. 필요한 권한 선택:
   - `repo` (전체 저장소 접근)
   - `issues` (이슈 생성 및 관리)
5. 생성된 토큰을 복사하여 환경변수에 설정

## 🚀 사용 방법

1. **코드 입력**: 분석하고 싶은 코드를 텍스트 영역에 입력
2. **언어 선택**: 드롭다운에서 해당 프로그래밍 언어 선택
3. **파일명 입력** (선택사항): 코드의 파일명을 입력
4. **분석 실행**: "🔍 코드 분석" 버튼 클릭
5. **결과 확인**: 코드 품질 점수, 문제점, 권장사항 확인
6. **이슈 생성**: "📝 GitHub 이슈 생성" 버튼을 클릭하여 분석 결과를 이슈로 생성

## 📊 분석 항목

### 코드 품질 지표

- **전체 점수**: 종합적인 코드 품질 점수 (0-100)
- **복잡도**: 코드의 복잡성 정도
- **유지보수성**: 코드의 유지보수 용이성
- **보안성**: 보안 취약점 평가
- **성능**: 성능 최적화 정도

### 분석 관점

1. **코드 구조 및 품질**
2. **성능 최적화 가능성**
3. **보안 취약점**
4. **유지보수성**
5. **코딩 스타일 및 컨벤션**
6. **잠재적 버그**
7. **개선 제안사항**

## 🎯 지원 언어

- JavaScript/TypeScript
- Python
- Java
- C/C++
- C#
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- SQL
- HTML/CSS
- JSON/YAML/XML

## 📝 GitHub 이슈 자동 생성

분석 완료 후 "GitHub 이슈 생성" 기능을 사용하면:

- 📊 코드 품질 점수와 지표가 포함된 상세 보고서
- 🚨 발견된 문제점들의 유형별 분류
- 💡 구체적인 개선 권장사항
- 🏷️ 자동 라벨링 (code-analysis, 문제 유형, 심각도)

이를 통해 팀원들과 코드 리뷰 결과를 쉽게 공유하고 추적할 수 있습니다.

## 🔒 보안 주의사항

- API 키와 토큰은 절대로 공개 저장소에 커밋하지 마세요
- `.env.local` 파일은 `.gitignore`에 포함되어 있습니다
- 프로덕션 환경에서는 환경변수를 안전하게 관리하세요
