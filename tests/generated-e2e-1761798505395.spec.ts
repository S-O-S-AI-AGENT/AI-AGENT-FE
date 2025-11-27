import { test, expect } from "@playwright/test";

test.describe("AI Agent E2E User Journeys", () => {
  // @feature homepage
  test("should load the homepage and allow navigation to features", async ({
    page,
  }) => {
    // Navigate to the application's homepage
    await page.goto("/");

    // Verify the main heading is visible, using the title from the feature section
    // as the primary indicator of content loading.
    await expect(
      page.getByRole("heading", { name: "주요 기능", level: 2 }),
    ).toBeVisible();

    // Locate the section containing the feature cards for precise scoping
    const featuresSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "주요 기능", level: 2 }),
    });

    // --- SQL Tuner Card Validation ---
    const sqlTunerCard = featuresSection.locator("div").filter({
      has: page.getByRole("heading", { name: "SQL 튜너", level: 3 }),
    });
    await expect(sqlTunerCard).toBeVisible();
    await expect(
      sqlTunerCard.getByText(
        "AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다.",
      ),
    ).toBeVisible();
    // Verify the external link for the SQL Tuner
    const sqlTunerLink = sqlTunerCard.getByRole("link", { name: "바로가기" });
    await expect(sqlTunerLink).toHaveAttribute(
      "href",
      "http://vaatz-tuner-vaatz-tuner--20e49-112305685-f25b4e832f9a.kr.lb.naverncp.com/dashboard",
    );
    await expect(sqlTunerLink).toHaveAttribute("target", "_blank");

    // --- E2E Automatic Tester Card Validation ---
    const e2eTesterCard = featuresSection.locator("div").filter({
      has: page.getByRole("heading", { name: "E2E 자동 테스터", level: 3 }),
    });
    await expect(e2eTesterCard).toBeVisible();
    await expect(
      e2eTesterCard.getByText(
        "Playwright를 활용한 자동화된 엔드투엔드 테스트를 구성합니다.",
      ),
    ).toBeVisible();
    // Verify the internal link and navigate
    const e2eTesterLink = e2eTesterCard.getByRole("link", {
      name: "바로가기",
    });
    await expect(e2eTesterLink).toHaveAttribute("href", "/e2e-tester");

    // --- Log Analyzer Card Validation and Navigation ---
    const logAnalyzerCard = featuresSection.locator("div").filter({
      has: page.getByRole("heading", { name: "로그 분석기", level: 3 }),
    });
    await expect(logAnalyzerCard).toBeVisible();
    await expect(
      logAnalyzerCard.getByText(
        "시스템 로그를 분석하여 이슈와 패턴을 자동으로 탐지합니다.",
      ),
    ).toBeVisible();
    // Click the Log Analyzer link to test navigation
    await logAnalyzerCard.getByRole("link", { name: "바로가기" }).click();

    // Wait for navigation and verify the URL is correct
    await expect(page).toHaveURL(/.*\/log-analyzer/);
    await expect(
      page.getByRole("heading", { name: "AI 기반 로그 분석기", level: 1 }),
    ).toBeVisible();
  });

  // @feature log-analyzer
  test("should allow a user to analyze logs", async ({ page }) => {
    // Mock the API response to ensure a predictable outcome
    await page.route("**/api/log-analyzer", async (route) => {
      const mockResponse = {
        summary: {
          totalLines: 7,
          errorCount: 2,
          warnCount: 1,
          infoCount: 4,
          timeRange: "2024-12-23 10:15:32 ~ 2024-12-23 10:16:05",
        },
        issues: [
          {
            type: "critical",
            category: "Database Connection",
            title: "데이터베이스 연결 타임아웃 발생",
            description:
              "데이터베이스에 30초 이상 연결하지 못하는 문제가 발생했습니다.",
            impact: "높음",
            count: 1,
            recommendations: [
              "데이터베이스 서버의 상태 및 네트워크 연결을 확인하세요.",
              "연결 풀(Connection Pool) 설정을 검토하고 필요시 타임아웃을 늘리세요.",
            ],
          },
        ],
      };
      await route.fulfill({ json: mockResponse });
    });

    // Navigate directly to the Log Analyzer page
    await page.goto("/log-analyzer");

    // Verify the page header is correct
    await expect(
      page.getByRole("heading", { name: "AI 기반 로그 분석기", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "대용량 로그 파일을 AI로 분석하여 자동으로 이슈를 탐지하고 해결책을 제안합니다.",
      ),
    ).toBeVisible();

    // Input sample log data into the textarea
    const sampleLog = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds
2024-12-23 10:15:46 WARN  [DatabaseService] Retrying database connection (attempt 1/3)
2024-12-23 10:15:52 INFO  [DatabaseService] Database connection restored
2024-12-23 10:16:01 ERROR [PaymentService] Payment processing failed: insufficient_funds, user_id=12345
2024-12-23 10:16:05 INFO  [NotificationService] Payment failure notification sent to user_id=12345`;
    await page
      .getByPlaceholder("분석할 로그를 여기에 붙여넣으세요...")
      .fill(sampleLog);

    // Click the analyze button and wait for the loading state
    const analyzeButton = page.getByRole("button", { name: "로그 분석 시작" });
    await analyzeButton.click();
    await expect(
      page.getByRole("button", { name: /분석 중.../ }),
    ).toBeVisible();

    // After analysis, verify the results are displayed
    const resultsSection = page.locator("#analysis-results");
    await expect(
      resultsSection.getByRole("heading", { name: "분석 결과 요약", level: 2 }),
    ).toBeVisible();

    // Check for specific content from the mocked API response
    await expect(
      resultsSection.getByText("총 라인 수7"),
    ).toBeVisible();
    await expect(
      resultsSection.getByRole("heading", {
        name: "데이터베이스 연결 타임아웃 발생",
        level: 3,
      }),
    ).toBeVisible();
    await expect(
      resultsSection.getByText(
        "데이터베이스에 30초 이상 연결하지 못하는 문제가 발생했습니다.",
      ),
    ).toBeVisible();
  });

  // @feature e2e-tester
  test("should display the E2E Tester page and allow input", async ({ page }) => {
    // Navigate directly to the E2E Tester page
    await page.goto("/e2e-tester");

    // Verify the page header is correct using text from the PageHeader component
    await expect(
      page.getByRole("heading", { name: "E2E 자동 테스터", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "GitHub 리포지토리 URL을 입력하고 자동화된 E2E 테스트 생성을 시작하세요.",
      ),
    ).toBeVisible();

    // Verify the initial state of the stepper component
    const stepper = page.getByRole("navigation", { name: "Progress" });
    const idleStep = stepper.getByText("대기");
    await expect(idleStep).toBeVisible();
    // The current step is identified by aria-current="step" on its parent `div`
    await expect(
      stepper.locator('div[aria-current="step"]'),
    ).toBeVisible();

    // Fill in the repository and token fields
    await page
      .getByLabel("GitHub Repository URL")
      .fill("https://github.com/S-O-S-AI-AGENT/AI-AGENT-FE");
    await page
      .getByLabel("GitHub Token")
      .fill("ghp_dummy_token_for_testing_purpose");

    // Check that the "자동화 시작" button is enabled after filling inputs
    const startButton = page.getByRole("button", { name: "자동화 시작" });
    await expect(startButton).toBeEnabled();
    
    // This test will not click "자동화 시작" as it triggers a complex,
    // long-running stream. It focuses on validating the initial UI is correctly rendered
    // and ready for user interaction. A separate, more complex test would be needed
    // to mock the entire streaming response.
  });
});