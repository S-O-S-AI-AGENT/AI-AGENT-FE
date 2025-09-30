# GitHub Secrets 설정 가이드

자동 테스트 및 TestFlight 배포를 위해 다음 GitHub Secrets를 설정해야 합니다.

## 📱 iOS/TestFlight 관련 Secrets

### 1. Apple Developer 관련

- `APPLE_ID`: Apple Developer 계정 이메일
- `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password ([생성 방법](https://support.apple.com/en-us/HT204397))
- `APPLE_TEAM_ID`: Apple Developer Team ID

### 2. iOS 인증서 및 프로비저닝 프로필

- `BUILD_CERTIFICATE_BASE64`: 배포용 인증서를 Base64로 인코딩한 값
- `P12_PASSWORD`: 인증서의 비밀번호
- `BUILD_PROVISION_PROFILE_BASE64`: 프로비저닝 프로필을 Base64로 인코딩한 값
- `KEYCHAIN_PASSWORD`: 임시 키체인 비밀번호 (임의의 강력한 비밀번호)

#### 인증서 및 프로필 준비 방법

```bash
# 인증서를 Base64로 인코딩
base64 -i Certificates.p12 | pbcopy

# 프로비저닝 프로필을 Base64로 인코딩
base64 -i YourApp.mobileprovision | pbcopy
```

## 📧 이메일 알림 관련 Secrets

### Gmail 사용 시

- `EMAIL_USERNAME`: 발신자 Gmail 주소
- `EMAIL_PASSWORD`: Gmail App Password ([생성 방법](https://support.google.com/accounts/answer/185833))
- `EMAIL_RECIPIENTS`: 수신자 이메일 주소 (여러 명일 경우 쉼표로 구분)

### 다른 SMTP 서버 사용 시

워크플로우 파일의 `send-email-notification` 작업에서 SMTP 설정을 수정하세요.

## 🔧 Secrets 설정 방법

1. GitHub 저장소로 이동
2. Settings → Secrets and variables → Actions
3. "New repository secret" 클릭
4. Secret 이름과 값을 입력
5. "Add secret" 클릭

## 📋 필수 Secrets 체크리스트

### iOS/TestFlight 배포용

- [ ] `APPLE_ID`
- [ ] `APPLE_APP_SPECIFIC_PASSWORD`
- [ ] `APPLE_TEAM_ID`
- [ ] `BUILD_CERTIFICATE_BASE64`
- [ ] `P12_PASSWORD`
- [ ] `BUILD_PROVISION_PROFILE_BASE64`
- [ ] `KEYCHAIN_PASSWORD`

### 이메일 알림용

- [ ] `EMAIL_USERNAME`
- [ ] `EMAIL_PASSWORD`
- [ ] `EMAIL_RECIPIENTS`

## 🚀 추가 설정

### Capacitor 사용 시 (권장)

현재 프로젝트가 Next.js 웹 애플리케이션이므로, iOS 앱으로 변환하려면 Capacitor를 설치하는 것을 권장합니다:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npm install @capacitor/ios
npx cap add ios
```

### 알림 라벨 설정

GitHub 저장소에서 다음 라벨들을 미리 생성해두세요:

- `automated-test`
- `report`

이렇게 설정하면 자동화된 테스트 및 배포 플로우가 완성됩니다!
