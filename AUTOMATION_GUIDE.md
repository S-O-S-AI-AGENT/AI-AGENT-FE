# 🤖 자동화된 테스트 및 배포 시스템 사용 가이드

## 🎯 개요

이 시스템은 다음과 같은 자동화 플로우를 제공합니다:

1. **자동 E2E 테스트**: Playwright를 사용한 웹 애플리케이션 테스트
2. **TestFlight 배포**: iOS 앱 자동 빌드 및 TestFlight 업로드
3. **테스트 결과 공유**: GitHub 이슈 및 이메일로 자동 리포트 생성
4. **비디오 녹화**: 테스트 실행 과정 자동 기록

## 🚀 시작하기

### 1. 필수 준비사항

#### GitHub Secrets 설정

[GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) 파일을 참고하여 다음 secrets를 설정하세요:

**iOS/TestFlight 관련:**

- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`
- `BUILD_CERTIFICATE_BASE64`
- `P12_PASSWORD`
- `BUILD_PROVISION_PROFILE_BASE64`
- `KEYCHAIN_PASSWORD`

**이메일 알림 관련:**

- `EMAIL_USERNAME`
- `EMAIL_PASSWORD`
- `EMAIL_RECIPIENTS`

**Slack 알림 (선택사항):**

- `SLACK_WEBHOOK_URL`

#### iOS 앱 설정 (선택사항)

[IOS_SETUP_GUIDE.md](./IOS_SETUP_GUIDE.md) 파일을 참고하여 Capacitor를 설정하세요.

### 2. 워크플로우 활성화

워크플로우는 다음 경우에 자동으로 실행됩니다:

- **Push**: `main`, `develop` 브랜치에 코드 푸시
- **Pull Request**: `main` 브랜치로 PR 생성
- **Schedule**: 매일 오전 9시 KST (UTC 0시)
- **Manual**: GitHub Actions 페이지에서 수동 실행

## 📊 테스트 결과 확인

### 1. GitHub 이슈

- 테스트 완료 후 자동으로 상세한 리포트 이슈가 생성됩니다
- 테스트 결과, 성능 메트릭, TestFlight 배포 상태 포함
- `automated-test`, `report` 라벨로 분류

### 2. 이메일 알림

- HTML 형식의 예쁜 이메일 리포트
- 테스트 비디오 및 스크린샷 첨부
- 실패한 테스트의 상세 정보 포함

### 3. Slack 알림 (설정 시)

- 간단한 테스트 결과 요약
- 실시간 알림

### 4. GitHub Actions 아티팩트

- Playwright HTML 리포트
- 테스트 실행 비디오
- 스크린샷 및 트레이스 파일

## 🧪 테스트 유형

### 현재 구현된 테스트

1. **홈페이지 기능 테스트**

   - 페이지 로드 확인
   - 네비게이션 테스트
   - 반응형 디자인 검증

2. **전체 애플리케이션 플로우**

   - 사용자 여정 시뮬레이션
   - 모든 페이지 방문 테스트
   - 성능 메트릭 수집

3. **접근성 테스트**

   - 키보드 네비게이션
   - 스크린 리더 호환성

4. **에러 핸들링**
   - 404 페이지 테스트
   - 네트워크 오류 시뮬레이션

### 테스트 추가 방법

`tests/` 디렉토리에 새 `.spec.ts` 파일을 생성하면 자동으로 실행됩니다.

```typescript
import { test, expect } from "@playwright/test";

test.describe("새로운 기능 테스트", () => {
  test("기능 설명", async ({ page }) => {
    await page.goto("/");
    // 테스트 로직
  });
});
```

## 📱 TestFlight 배포

### 자동 배포 조건

- `main` 브랜치에 코드 푸시
- 모든 E2E 테스트 통과

### 수동 배포

GitHub Actions에서 워크플로우를 수동으로 실행할 수 있습니다.

### 베타 테스터 추가

1. App Store Connect에서 TestFlight 섹션으로 이동
2. 내부 테스팅 또는 외부 테스팅 그룹에 사용자 추가
3. 테스터들에게 TestFlight 앱 설치 및 초대 이메일 확인 요청

## 🔧 고급 설정

### 테스트 실행 주기 변경

`.github/workflows/automated-testing.yml`에서 cron 스케줄 수정:

```yaml
schedule:
  # 매일 오후 2시 KST (UTC 5시)
  - cron: "0 5 * * *"
```

### 이메일 템플릿 커스터마이징

`.github/templates/email-template.html` 파일을 수정하세요.

### Playwright 설정 조정

`playwright.config.ts`에서 브라우저, 타임아웃, 병렬 실행 등을 설정할 수 있습니다.

## 🐛 문제 해결

### 테스트 실패 시

1. GitHub Actions 로그 확인
2. Playwright 리포트에서 상세 정보 확인
3. 실패한 테스트의 비디오 및 스크린샷 분석

### TestFlight 업로드 실패 시

1. Apple Developer 계정 상태 확인
2. 인증서 만료일 확인
3. 프로비저닝 프로필 유효성 검증

### 이메일 발송 실패 시

1. Gmail App Password 유효성 확인
2. SMTP 설정 검증
3. 수신자 이메일 주소 확인

## 📚 추가 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [TestFlight 가이드](https://developer.apple.com/testflight/)
- [Capacitor 문서](https://capacitorjs.com/docs)

## 🤝 기여하기

테스트 시나리오 추가나 워크플로우 개선을 위한 기여를 환영합니다!

1. 이슈 생성으로 개선사항 제안
2. PR 생성하여 변경사항 제출
3. 테스트 시나리오 추가

---

**문의사항이 있으시면 GitHub 이슈를 생성해주세요!** 🙋‍♂️
