import { test, expect } from "@playwright/test";

/**
 * This test suite validates the primary user journeys for the AI Agent application.
 * It covers navigating from the homepage to key feature pages and interacting with their core functionalities.
 */
test.describe("AI Agent Primary User Journeys", () => {
  // Before each test, start at the homepage.
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // @feature log-analyzer
  test("should navigate to Log Analyzer, analyze sample logs, and display results", async ({
    page,
  }) => {
    // 1. Navigate from homepage to the Log Analyzer feature.
    // The feature cards on the homepage are links. We find the one for the Log Analyzer.
    await test.step("Navigate to Log Analyzer page", async () => {
      // Find the link containing the '로그 분석기' title and click it.
      // Using a regex for robustness against surrounding whitespace or minor changes.
      await page.getByRole("link", { name: /로그 분석기/ }).click();
      await expect(page).toHaveURL("/log-analyzer");
    });

    // 2. Verify the Log Analyzer page has loaded correctly.
    await test.step("Verify page content", async () => {
      // Check for the main heading (H1) to confirm we are on the right page.
      // The text is copied verbatim from `src/app/log-analyzer/page.tsx`.
      await expect(
        page.getByRole("heading", { name: "📊 AI 기반 로그 분석", level: 1 })
      ).toBeVisible();
      // Check for the main action buttons.
      await expect(
        page.getByRole("button", { name: "샘플 로그 사용" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "분석 시작" })
      ).toBeVisible();
    });

    // 3. Use the "sample log" feature to populate the textarea.
    await test.step("Load and verify sample log", async () => {
      const logTextArea = page.getByPlaceholder("여기에 로그를 붙여넣으세요...");
      await expect(logTextArea).toBeEmpty();

      await page.getByRole("button", { name: "샘플 로그 사용" }).click();

      // The textarea should now contain the sample log content.
      await expect(logTextArea).not.toBeEmpty();
      await expect(logTextArea).toContainText(
        "User authentication successful: user_id=12345"
      );
    });

    // 4. Mock the API response to ensure a predictable and fast test run.
    await test.step("Mock API response for analysis", async () => {
      await page.route("**/api/log-analyzer", async (route) => {
        const mockResponse = {
          summary: {
            totalLines: 10,
            errorCount: 2,
            warnCount: 1,
            infoCount: 7,
            timeRange: "2024-12-23 10:15:32 ~ 2024-12-23 10:16:05",
          },
          issues: [
            {
              type: "critical",
              category: "Database",
              title: "데이터베이스 연결 타임아웃",
              description:
                "데이터베이스에 30초 이상 연결하지 못하여 타임아웃이 발생했습니다.",
              impact: "높음",
              count: 1,
              firstOccurrence: "2024-12-23 10:15:45",
              recommendations: ["DB 연결 풀 설정 확인", "네트워크 지연 시간 모니터링"],
            },
          ],
          patterns: [],
          recommendations: ["데이터베이스 연결 모니터링 강화"],
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockResponse),
        });
      });
    });

    // 5. Start the analysis and validate the results are displayed.
    await test.step("Perform analysis and validate results", async () => {
      await page.getByRole("button", { name: "분석 시작" }).click();

      // The loading spinner should appear while analyzing.
      // It might be too fast to see, but we can check for its presence.
      await expect(page.getByText("분석 중...")).toBeVisible();

      // Wait for the results to appear on the page.
      // We check for the result section headings.
      await expect(
        page.getByRole("heading", { name: "분석 요약", level: 2 })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "탐지된 주요 이슈", level: 2 })
      ).toBeVisible();

      // Verify that specific content from our mock response is rendered.
      await expect(page.getByText("데이터베이스 연결 타임아웃")).toBeVisible();
      await expect(
        page.getByText("DB 연결 풀 설정 확인")
      ).toBeVisible();
    });
  });

  // @feature e2e-tester
  test("should navigate to the E2E Tester page and display configuration options", async ({
    page,
  }) => {
    // 1. Navigate from homepage to the E2E Tester feature.
    await test.step("Navigate to E2E Tester page", async () => {
      await page.getByRole("link", { name: /E2E 자동 테스터/ }).click();
      await expect(page).toHaveURL("/e2e-tester");
    });

    // 2. Verify that the main UI components for configuration are visible.
    // This confirms the page has loaded correctly without performing the full E2E generation,
    // which is complex and depends on external services.
    await test.step("Verify configuration UI elements", async () => {
      // Check for the section headings. These are h2 elements in the code.
      await expect(
        page.getByRole("heading", { name: "자동화 설정", level: 2 })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "실행 로그", level: 2 })
      ).toBeVisible();

      // Check for the GitHub repository input field.
      await expect(
        page.getByPlaceholder("https://github.com/owner/repo")
      ).toBeVisible();

      // Check for the primary action button.
      await expect(
        page.getByRole("button", { name: "AI 분석 및 테스트 생성" })
      ).toBeVisible();
    });
  });
});