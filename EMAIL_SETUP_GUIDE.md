# 📧 이메일 전송 환경변수 상세 가이드

## 🔧 필수 GitHub Secrets 설정

자동 테스트 결과를 이메일로 받기 위해 다음 3개의 GitHub Secrets를 설정해야 합니다.

### 1. EMAIL_USERNAME

- **설명**: 이메일 발송에 사용할 Gmail 계정
- **형식**: `your-email@gmail.com`
- **예시**: `dev-team@company.com` 또는 `notifications@yourcompany.com`

### 2. EMAIL_PASSWORD

- **설명**: Gmail App Password (계정 비밀번호가 아님!)
- **형식**: 16자리 앱 전용 비밀번호
- **예시**: `abcd efgh ijkl mnop` (공백 포함)

### 3. EMAIL_RECIPIENTS

- **설명**: 테스트 결과를 받을 이메일 주소들
- **형식**: 단일 또는 쉼표로 구분된 여러 이메일
- **예시**:
  - 단일: `manager@company.com`
  - 다중: `dev@company.com,qa@company.com,manager@company.com`

## 🔑 Gmail App Password 생성 방법

### 1단계: Gmail 2단계 인증 활성화

1. [Google 계정 관리](https://myaccount.google.com/) 접속
2. **보안** 탭 클릭
3. **Google에 로그인** 섹션에서 **2단계 인증** 활성화

### 2단계: App Password 생성

1. **보안** → **Google에 로그인** → **앱 비밀번호** 클릭
2. 앱 선택: **메일**
3. 기기 선택: **기타(맞춤 이름)**
4. 이름 입력: `GitHub Actions` 또는 `AI Project Agent`
5. **생성** 클릭
6. 생성된 16자리 비밀번호 복사 (공백 포함)

## ⚙️ GitHub Secrets 설정 방법

### 1단계: 저장소 설정 접근

1. GitHub 저장소 → **Settings** 탭
2. 왼쪽 메뉴 → **Secrets and variables** → **Actions**

### 2단계: Secret 추가

각 환경변수에 대해 다음 단계를 반복:

1. **New repository secret** 클릭
2. **Name** 필드에 환경변수 이름 입력
3. **Secret** 필드에 값 입력
4. **Add secret** 클릭

## 📋 설정 체크리스트

### ✅ Gmail 계정 준비

- [ ] Gmail 계정 준비
- [ ] 2단계 인증 활성화
- [ ] App Password 생성 완료

### ✅ GitHub Secrets 설정

- [ ] `EMAIL_USERNAME` 설정 (Gmail 주소)
- [ ] `EMAIL_PASSWORD` 설정 (App Password)
- [ ] `EMAIL_RECIPIENTS` 설정 (수신자 목록)

## 📨 발송되는 이메일 내용

### 기본 정보

- **제목**: `🤖 AI Project Agent - 자동 테스트 결과`
- **발신자**: `EMAIL_USERNAME`에서 설정한 Gmail 주소
- **수신자**: `EMAIL_RECIPIENTS`에서 설정한 이메일 주소들

### 이메일 본문 내용

1. **테스트 결과 요약**

   - 통과한 테스트 개수
   - 실패한 테스트 개수
   - 실행 일시와 커밋 정보

2. **웹 애플리케이션 테스트 상태**

   - E2E 테스트 완료 확인

3. **관련 링크**

   - GitHub Actions 워크플로우 실행 결과
   - GitHub 저장소 링크

4. **첨부파일**
   - 테스트 실행 중 촬영된 비디오 파일들
   - 실패한 테스트의 스크린샷

## 🔧 고급 설정

### 다른 SMTP 서버 사용

Gmail 대신 다른 이메일 서비스를 사용하려면 워크플로우 파일에서 SMTP 설정을 변경:

```yaml
server_address: smtp.your-provider.com # 예: smtp.outlook.com
server_port: 587 # 또는 465
```

### 이메일 템플릿 커스터마이징

더 예쁜 이메일을 원한다면 `.github/templates/email-template.html` 파일을 수정하세요.

### 조건부 이메일 발송

특정 조건에서만 이메일을 발송하려면:

```yaml
if: ${{ failure() }} # 테스트 실패 시에만 발송
```

## 🚨 문제 해결

### 이메일이 발송되지 않는 경우

1. **Gmail App Password 확인**

   - 16자리 비밀번호가 정확한지 확인
   - 공백을 포함해서 정확히 복사했는지 확인

2. **Gmail 계정 설정 확인**

   - 2단계 인증이 활성화되어 있는지 확인
   - "보안 수준이 낮은 앱의 액세스" 설정 확인

3. **GitHub Secrets 확인**
   - Secret 이름이 정확한지 확인 (대소문자 구분)
   - Secret 값에 불필요한 공백이 없는지 확인

### 일부 수신자가 메일을 받지 못하는 경우

1. **EMAIL_RECIPIENTS 형식 확인**

   - 쉼표로 정확히 구분되어 있는지 확인
   - 각 이메일 주소가 유효한지 확인

2. **스팸 폴더 확인**
   - 수신자의 스팸 폴더 확인 요청

## 📊 예상 이메일 예시

```
제목: 🤖 AI Project Agent - 자동 테스트 결과

🤖 AI Project Agent 자동 테스트 결과

실행 일시: 2024-01-15 14:30:25
커밋: abc1234

📊 테스트 결과
✅ 통과: 12개
❌ 실패: 0개

🌐 웹 애플리케이션 테스트
웹 애플리케이션의 모든 주요 기능에 대한 E2E 테스트가 완료되었습니다.

🔗 관련 링크
- 워크플로우 실행 결과
- GitHub 저장소

테스트 영상은 첨부파일을 확인해주세요.

이 메일은 자동으로 발송되었습니다.
```

이제 위 가이드에 따라 설정하면 자동으로 테스트 결과를 이메일로 받아볼 수 있습니다! 🚀
