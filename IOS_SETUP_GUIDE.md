# iOS 앱 변환 및 TestFlight 배포 가이드

## 🏗️ 1단계: Capacitor 설치 및 설정

### Capacitor 설치

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "AI Project Agent" "com.yourcompany.aiprojectagent"
```

### iOS 플랫폼 추가

```bash
npm install @capacitor/ios
npx cap add ios
```

### 앱 빌드 및 동기화

```bash
npm run build
npx cap sync
```

## 📱 2단계: iOS 앱 설정

### Xcode에서 프로젝트 열기

```bash
npx cap open ios
```

### 필수 설정

1. **Bundle Identifier 설정**: `com.yourcompany.aiprojectagent`
2. **Team 설정**: Apple Developer Team 선택
3. **Signing & Capabilities**: 자동 서명 활성화
4. **Deployment Target**: iOS 13.0 이상

## 🚀 3단계: TestFlight 배포 설정

### Archive 생성

1. Xcode에서 `Product` → `Archive`
2. Archive가 완료되면 Organizer가 열림
3. `Distribute App` → `App Store Connect` 선택
4. `Upload` 선택하여 TestFlight에 업로드

### 자동화를 위한 설정

- `fastlane` 설치 및 설정 (선택사항)
- GitHub Actions에서 사용할 인증서 및 프로비저닝 프로필 준비

## 🔧 4단계: Capacitor 설정 파일

### capacitor.config.ts

```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.yourcompany.aiprojectagent",
  appName: "AI Project Agent",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  ios: {
    scheme: "AI Project Agent",
  },
};

export default config;
```

## 📝 5단계: 추가 설정

### package.json 스크립트 추가

```json
{
  "scripts": {
    "ios:build": "npm run build && npx cap sync ios",
    "ios:open": "npx cap open ios",
    "ios:run": "npx cap run ios"
  }
}
```

### 앱 아이콘 및 스플래시 스크린

- `resources/` 폴더에 아이콘 및 스플래시 이미지 추가
- `@capacitor/assets` 플러그인 사용하여 자동 생성

## 🧪 6단계: 테스트 설정

### Detox 설치 (E2E 테스트용)

```bash
npm install --save-dev detox
```

### iOS 시뮬레이터에서 테스트

```bash
npx cap run ios
```

## 📋 체크리스트

### 개발 환경 준비

- [ ] Xcode 설치 (최신 버전)
- [ ] Apple Developer 계정 준비
- [ ] Capacitor 설치 완료
- [ ] iOS 시뮬레이터 설정

### 배포 준비

- [ ] Bundle Identifier 설정
- [ ] App Store Connect에 앱 등록
- [ ] TestFlight 사용자 그룹 생성
- [ ] 인증서 및 프로비저닝 프로필 생성

### 자동화 준비

- [ ] GitHub Secrets 설정
- [ ] 워크플로우 파일 수정
- [ ] 테스트 케이스 작성 완료

## 🚨 주의사항

1. **Next.js Static Export**: Capacitor와 함께 사용하려면 정적 내보내기가 필요할 수 있습니다.
2. **API 호출**: 앱에서는 절대 URL을 사용해야 합니다.
3. **권한 설정**: 카메라, 마이크 등 필요한 권한을 `Info.plist`에 추가해야 합니다.

## 🔗 유용한 링크

- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [TestFlight 가이드](https://developer.apple.com/testflight/)
- [GitHub Actions iOS CI/CD](https://docs.github.com/en/actions/deployment/deploying-xcode-applications/installing-an-apple-certificate-on-macos-runners-for-xcode-development)
