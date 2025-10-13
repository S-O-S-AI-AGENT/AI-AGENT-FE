# 🤖 자동 테스트 결과 리포트

<div align="center">

![Test Status](https://img.shields.io/badge/Tests-{{TESTS_PASSED}}%20passed%20{{TESTS_FAILED}}%20failed-{{BADGE_COLOR}})
![Date](https://img.shields.io/badge/Date-{{REPORT_DATE_ENCODED}}-blue)

</div>

## 📋 실행 정보

| 항목           | 정보                                                               |
| -------------- | ------------------------------------------------------------------ |
| **실행 일시**  | {{REPORT_DATE}}                                                    |
| **커밋 해시**  | [`{{COMMIT_SHA}}`]({{GITHUB_REPO_URL}}/commit/{{FULL_COMMIT_SHA}}) |
| **브랜치**     | `{{BRANCH_NAME}}`                                                  |
| **워크플로우** | [실행 결과 보기]({{WORKFLOW_URL}})                                 |

## 📊 테스트 결과 요약

```
✅ 통과: {{TESTS_PASSED}}개
❌ 실패: {{TESTS_FAILED}}개
⏱️ 총 실행 시간: {{EXECUTION_TIME}}
📊 성공률: {{SUCCESS_RATE}}%
```

### 🔍 상세 결과

{{#if TESTS_FAILED}}

#### ❌ 실패한 테스트

{{FAILED_TESTS_DETAILS}}

#### 📝 실패 원인 분석

{{FAILURE_ANALYSIS}}
{{/if}}

{{#if TESTS_PASSED}}

#### ✅ 통과한 테스트

{{PASSED_TESTS_SUMMARY}}
{{/if}}

## 📹 테스트 영상 및 스크린샷

테스트 실행 중 촬영된 자료들:

### 🎬 비디오 파일

- 모든 테스트 실행 과정이 비디오로 기록되었습니다
- 실패한 테스트의 경우 상세한 재현 과정을 확인할 수 있습니다

### 📸 스크린샷

- 각 테스트 단계별 스크린샷
- 실패 지점의 상세 화면 캡처
- 반응형 디자인 테스트 결과

**다운로드:** [테스트 아티팩트]({{WORKFLOW_URL}})에서 확인 가능

## 🔗 관련 링크

<div align="center">

| 링크                                              | 설명                           |
| ------------------------------------------------- | ------------------------------ |
| [📊 워크플로우 결과]({{WORKFLOW_URL}})            | GitHub Actions 실행 상세 정보  |
| [🎭 Playwright 리포트]({{PLAYWRIGHT_REPORT_URL}}) | 상세 테스트 리포트 및 트레이스 |
| [🔗 저장소]({{GITHUB_REPO_URL}})                  | 소스 코드 저장소               |

</div>

## 📈 성능 메트릭

{{#if PERFORMANCE_METRICS}}

### ⚡ 페이지 로드 시간

{{PERFORMANCE_METRICS}}

### 🎯 Core Web Vitals

{{CORE_WEB_VITALS}}
{{/if}}

## 🚨 권장 사항

{{#if TESTS_FAILED}}

### 🔧 수정 필요사항

{{RECOMMENDATIONS}}
{{else}}

### ✨ 모든 테스트 통과!

현재 애플리케이션은 모든 자동화 테스트를 성공적으로 통과했습니다.
다음 배포를 위해 준비가 완료되었습니다.
{{/if}}

## 📞 문의사항

테스트 결과에 대한 문의사항이 있으시면:

1. **이 이슈에 댓글 남기기**
2. **개발팀 멘션**: @{{MAINTAINERS}}
3. **Slack 채널**: #dev-alerts

---

<div align="center">

_이 리포트는 GitHub Actions에 의해 자동으로 생성되었습니다._

<sub>생성 시간: {{CURRENT_TIMESTAMP}} | 워크플로우 ID: {{WORKFLOW_RUN_ID}}</sub>

</div>
