import { test, expect } from "@playwright/test";

/**
 * This test file covers the primary user journey for the Log Analyzer feature.
 * The flow begins at the homepage, navigates to the Log Analyzer,
 * submits sample log data, and verifies that the AI-driven analysis results
 * are displayed correctly on the page.
 *
 * The API call to the backend is mocked to ensure test stability and speed,
 * allowing the test to focus solely on the frontend behavior.
 */
test.describe("Primary User Journey: Log Analyzer", () => {
  // @feature log-analyzer
  test("should navigate to Log Analyzer, submit logs, and display mock analysis results", async ({
    page,
  }) => {
    // Step 0: Mock the API response for the log analyzer.
    // This ensures a consistent and predictable response for the test,
    // isolating the frontend from any backend changes or issues.
    // The mock data structure is designed to match what the frontend component expects to render.
    await page.route("**/api/log-analyzer", async (route) => {
      const mockResponse = {
        summary: {
          totalLines: 6,
          errorCount: 2,
          warnCount: 1,
          infoCount: 3,
          timeRange: "2024-12-23 10:15:32 ~ 2024-12-23 10:16:05",
        },
        issues: [
          {
            type: "critical",
            title: "데이터베이스 연결 타임아웃",
            category: "Database Connection",
            description:
              "데이터베이스에 30초 이상 연결하지 못하여 연결 타임아웃이 발생했습니다.",
            impact: "높음",
            count: 1,
            firstOccurrence: "2024-12-23 10:15:45",
            recommendations: [
              "데이터베이스 서버의 네트워크 상태를 확인하세요.",
            ],
          },
          {
            type: "error",
            title: "결제 처리 실패",
            category: "Payment Processing",
            description:
              "사용자(user_id=12345)의 잔액이 부족하여 결제에 실패했습니다.",
            impact: "중간",
            count: 1,
            firstOccurrence: "2024-12-23 10:16:01",
            recommendations: [
              "실패한 결제에 대한 사용자 알림 시스템을 구현하세요.",
            ],
          },
        ],
        patterns: [
          {
            description: "데이터베이스 연결 복구 패턴",
            frequency: 1,
            pattern: "Connection timeout → Retry → Success",
          },
        ],
        recommendations: ["데이터베이스 연결 풀 모니터링 강화"],
      };
      await route.fulfill({ json: mockResponse });
    });

    // Step 1: Start at the landing page.
    await page.goto("/");

    // Step 2: Find and click the "Log Analyzer" feature card to navigate.
    // We use getByRole with the accessible name for robustness.
    const logAnalyzerLink = page.getByRole("link", { name: "로그 분석기" });
    await expect(logAnalyzerLink).toBeVisible();
    await logAnalyzerLink.click();

    // Step 3: Verify the app has navigated to the Log Analyzer page.
    await expect(page).toHaveURL("/log-analyzer");
    await expect(
      page.getByRole("heading", { name: "AI 기반 로그 분석기", level: 1 })
    ).toBeVisible();

    // Step 4: Input sample log data into the textarea.
    // The sample log is taken from the component's source code for realism.
    const sampleLog = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds
2024-12-23 10:15:46 WARN  [DatabaseService] Retrying database connection (attempt 1/3)
2024-12-23 10:15:52 INFO  [DatabaseService] Database connection restored
2024-12-23 10:16:01 ERROR [PaymentService] Payment processing failed: insufficient_funds, user_id=12345
2024-12-23 10:16:05 INFO  [NotificationService] Payment failure notification sent to user_id=12345`;
    await page.getByLabel("로그 데이터 입력").fill(sampleLog);

    // Step 5: Click the "Analyze" button to submit the logs.
    const analyzeButton = page.getByRole("button", { name: "분석 시작" });
    await expect(analyzeButton).toBeEnabled();
    await analyzeButton.click();

    // Step 6: Verify the loading state and wait for results.
    // Asserting the button text changes confirms the submission process has started.
    // Playwright's auto-waiting will handle the delay until the results appear.
    await expect(page.getByRole("button", { name: "분석 중..." })).toBeVisible();

    // Step 7: Validate that the analysis results are displayed correctly.
    // We scope our assertions to the "분석 결과" section for precision.
    const resultsSection = page.getByRole("region", { name: "분석 결과" });
    await expect(resultsSection).toBeVisible();

    // Check for the summary section and its content.
    await expect(
      resultsSection.getByRole("heading", { name: "분석 요약", level: 3 })
    ).toBeVisible();
    await expect(resultsSection.getByText("총 라인: 6")).toBeVisible();
    await expect(resultsSection.getByText("에러: 2")).toBeVisible();
    await expect(resultsSection.getByText("경고: 1")).toBeVisible();

    // Check for the detected issues section.
    await expect(
      resultsSection.getByRole("heading", { name: "주요 감지 이슈", level: 3 })
    ).toBeVisible();

    // Verify a critical issue from the mock response is rendered.
    await expect(
      resultsSection.getByRole("heading", {
        name: "데이터베이스 연결 타임아웃",
        level: 4,
      })
    ).toBeVisible();
    await expect(
      resultsSection.getByText(
        "데이터베이스에 30초 이상 연결하지 못하여 연결 타임아웃이 발생했습니다."
      )
    ).toBeVisible();

    // Verify the second issue is also rendered.
    await expect(
      resultsSection.getByRole("heading", { name: "결제 처리 실패", level: 4 })
    ).toBeVisible();
    await expect(
      resultsSection.getByText(
        "사용자(user_id=12345)의 잔액이 부족하여 결제에 실패했습니다."
      )
    ).toBeVisible();

    // Check for the recommendations section.
    await expect(
      resultsSection.getByRole("heading", { name: "종합 권장 사항", level: 3 })
    ).toBeVisible();
    await expect(
      resultsSection.getByText("데이터베이스 연결 풀 모니터링 강화")
    ).toBeVisible();
  });
});