import { test, expect } from "@playwright/test";

// This test file validates the primary user journey:
// 1. Starts at the homepage.
// 2. Navigates to the Log Analyzer tool.
// 3. Submits logs for analysis.
// 4. Verifies that the mock analysis results are displayed correctly.
test("should navigate to Log Analyzer, perform analysis, and display results", async ({
  page,
}) => {
  // @feature log-analyzer

  // 1. Start at the homepage and verify feature cards are visible.
  // This confirms the page has loaded correctly before we interact with it.
  await page.goto("/");

  // From src/app/page.tsx, feature cards are links containing an <h3>.
  // The link's accessible name includes the icon and title.
  await expect(
    page.getByRole("link", { name: "🧪 E2E 자동 테스터" })
  ).toBeVisible();
  const logAnalyzerLink = page.getByRole("link", { name: "📊 로그 분석기" });
  await expect(logAnalyzerLink).toBeVisible();

  // 2. Navigate to the Log Analyzer page by clicking on its feature card.
  await logAnalyzerLink.click();

  // 3. Verify that the URL has changed to the log analyzer page.
  await expect(page).toHaveURL("/log-analyzer");

  // 4. Check for the correct page header and description.
  // The heading text and level are taken directly from src/app/log-analyzer/page.tsx.
  await expect(
    page.getByRole("heading", { name: "AI 기반 로그 분석", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByText(
      "AI를 활용하여 복잡한 로그 데이터에서 패턴과 이슈를 신속하게 탐지합니다."
    )
  ).toBeVisible();

  // 5. Input sample logs into the textarea.
  // We locate the textarea by its placeholder text for better accessibility.
  const logTextArea = page.getByPlaceholder(
    "분석할 로그를 여기에 붙여넣어 주세요..."
  );
  await expect(logTextArea).toBeVisible();

  // Use a sample log that includes ERROR and WARN lines to trigger the mock analysis logic.
  const sampleLog = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds
2024-12-23 10:15:46 WARN  [DatabaseService] Retrying database connection (attempt 1/3)`;
  await logTextArea.fill(sampleLog);

  // 6. Click the "분석 시작" button to initiate the analysis.
  // This action triggers a POST request to /api/log-analyzer, which returns a mock response.
  await page.getByRole("button", { name: "분석 시작" }).click();

  // 7. Wait for and verify that the analysis results are rendered on the page.
  // Playwright's `expect` automatically waits for elements to appear, handling the async API call.

  // First, confirm the "탐지된 주요 이슈" section header (an <h3>) is visible.
  await expect(
    page.getByRole("heading", { name: "탐지된 주요 이슈", level: 3 })
  ).toBeVisible();

  // Second, verify a specific issue message from the mock API response is displayed.
  // This text is inside an <h4>, as seen in the component's rendering logic.
  // The text itself is defined in src/app/api/log-analyzer/route.ts.
  await expect(
    page.getByRole("heading", {
      name: "데이터베이스 연결 타임아웃이 감지되었습니다",
      level: 4,
    })
  ).toBeVisible();

  // Finally, check for one of the general recommendations to ensure the full mock payload was processed.
  await expect(page.getByText("데이터베이스 연결 풀 모니터링 강화")).toBeVisible();
});