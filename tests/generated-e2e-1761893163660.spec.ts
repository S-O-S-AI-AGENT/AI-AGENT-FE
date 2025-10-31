import { test, expect } from "@playwright/test";

// @feature log-analyzer
test.describe("Log Analyzer User Journey", () => {
  test("should navigate to log analyzer, analyze sample logs, and display results", async ({
    page,
  }) => {
    // Define a mock API response that matches the frontend's expected data structure.
    // This ensures a consistent and fast test, independent of the actual API's state.
    const mockApiResponse = {
      summary: {
        totalLines: 10,
        errorCount: 2,
        warnCount: 1,
        infoCount: 7,
        timeRange: "2024-12-23 10:15:32 - 10:16:05",
      },
      issues: [
        {
          type: "error",
          title: "데이터베이스 연결 타임아웃",
          category: "Database",
          description: "데이터베이스에 30초 이상 연결하지 못했습니다.",
          impact: "높음",
          count: 1,
          firstOccurrence: "2024-12-23 10:15:45",
          recommendations: [
            "데이터베이스 연결 풀 설정을 확인하세요.",
            "네트워크 지연 시간을 점검하세요.",
          ],
        },
        {
          type: "critical",
          title: "결제 처리 실패",
          category: "Payment",
          description: "잔액 부족으로 인해 결제 처리에 실패했습니다.",
          impact: "중간",
          count: 1,
          firstOccurrence: "2024-12-23 10:16:01",
          recommendations: ["사용자에게 결제 실패를 알리세요."],
        },
      ],
      patterns: [
        {
          description: "데이터베이스 연결 자동 복구",
          frequency: 1,
          pattern: "ERROR -> WARN -> INFO",
        },
      ],
      recommendations: [
        "전체 시스템에 대한 모니터링 대시보드를 구축하세요.",
        "중요 오류에 대한 실시간 알림을 설정하세요.",
      ],
    };

    // Mock the log-analyzer API endpoint before navigating to the page.
    await page.route("/api/log-analyzer", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockApiResponse),
      });
    });

    // 1. Start at the homepage.
    await page.goto("/");

    // 2. Find the Log Analyzer feature card and navigate to its page.
    // The card itself is a link containing the heading.
    await page.getByRole("link", { name: "📊 로그 분석기" }).click();

    // 3. Verify that the app has navigated to the correct URL.
    await expect(page).toHaveURL("/log-analyzer");

    // 4. Check for the main heading on the Log Analyzer page to confirm it loaded.
    // Verifying the exact text, including the emoji and heading level (h1).
    await expect(
      page.getByRole("heading", { name: "📊 AI 기반 로그 분석", level: 1 })
    ).toBeVisible();

    // 5. Use the "sample logs" feature to populate the textarea.
    await page.getByRole("button", { name: "샘플 로그 사용" }).click();

    // 6. Verify that the textarea has been filled with sample log content.
    const logTextArea = page.getByPlaceholder("여기에 로그를 붙여넣으세요...");
    await expect(logTextArea).not.toBeEmpty();

    // 7. Click the "Start Analysis" button to trigger the API call.
    await page.getByRole("button", { name: "분석 시작" }).click();

    // 8. Validate that the analysis results are displayed on the page.
    // Playwright's expect automatically waits for the element to appear.
    await expect(
      page.getByRole("heading", { name: "분석 결과", level: 2 })
    ).toBeVisible();

    // 9. Check for a specific issue from the mocked response to confirm data is rendered.
    // Using getByRole with level 3 to be specific about the issue title heading.
    await expect(
      page.getByRole("heading", { name: "데이터베이스 연결 타임아웃", level: 3 })
    ).toBeVisible();

    // 10. Verify one of the summary cards is rendered correctly.
    // Check for the "에러" label and its corresponding count from the mock data.
    const errorCard = page.locator("div").filter({ hasText: /^에러\d+$/ });
    await expect(errorCard).toContainText(`에러${mockApiResponse.summary.errorCount}`);
    await expect(errorCard).toBeVisible();

    // 11. Check if a general recommendation is present.
    await expect(
      page.getByText("전체 시스템에 대한 모니터링 대시보드를 구축하세요.")
    ).toBeVisible();
  });
});