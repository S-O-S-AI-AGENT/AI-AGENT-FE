import { test, expect } from "@playwright/test";

test.describe("AI Agent Primary User Journeys", () => {
  // @feature homepage
  test("should navigate to feature pages from the homepage", async ({
    page,
  }) => {
    // Navigate to the root of the application
    await page.goto("/");

    // Verify the main page heading is visible. Use a regex for flexibility.
    await expect(
      page.getByRole("heading", { name: /AI Project Agent/i, level: 1 })
    ).toBeVisible();

    // Locate the main section containing feature cards
    const featuresSection = page.getByRole("main");

    // --- E2E 자동 테스터 Navigation ---
    // Find the link for "E2E 자동 테스터" and click it
    const e2eTesterLink = featuresSection.getByRole("link", {
      name: /E2E 자동 테스터/,
    });
    await expect(e2eTesterLink).toBeVisible();
    await e2eTesterLink.click();

    // Assert that the URL has changed to the E2E tester page
    await expect(page).toHaveURL("/e2e-tester");
    await expect(
      page.getByRole("heading", { name: "E2E 자동 테스터", level: 1 })
    ).toBeVisible();

    // --- 로그 분석기 Navigation ---
    // Go back to the homepage to test the next link
    await page.goBack();
    await expect(page).toHaveURL("/");

    // Find the link for "로그 분석기" and click it
    const logAnalyzerLink = featuresSection.getByRole("link", {
      name: /로그 분석기/,
    });
    await expect(logAnalyzerLink).toBeVisible();
    await logAnalyzerLink.click();

    // Assert that the URL has changed to the log analyzer page
    await expect(page).toHaveURL("/log-analyzer");
    // The exact title is not in the page.tsx snippet, but "로그 분석기" is the most likely H1.
    await expect(
      page.getByRole("heading", { name: "로그 분석기", level: 1 })
    ).toBeVisible();

    // --- SQL 튜너 External Link Check ---
    // Go back to the homepage one last time
    await page.goBack();

    // Verify the "SQL 튜너" link points to the correct external URL
    const sqlTunerLink = featuresSection.getByRole("link", {
      name: /SQL 튜너/,
    });
    await expect(sqlTunerLink).toHaveAttribute(
      "href",
      "http://vaatz-tuner-vaatz-tuner--20e49-112305685-f25b4e832f9a.kr.lb.naverncp.com/dashboard"
    );
  });

  // @feature log-analyzer
  test("should analyze sample logs and display results", async ({ page }) => {
    // The sample log content is derived from `src/app/log-analyzer/page.tsx`.
    const sampleLog = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds
2024-12-23 10:15:46 WARN  [DatabaseService] Retrying database connection (attempt 1/3)
2024-12-23 10:15:52 INFO  [DatabaseService] Database connection restored
2024-12-23 10:16:01 ERROR [PaymentService] Payment processing failed: insufficient_funds, user_id=12345
2024-12-23 10:16:05 INFO  [NotificationServ`;

    // Mock the API response to ensure a consistent and fast test run.
    // The structure is based on `src/app/api/log-analyzer/route.ts`.
    await page.route("**/api/log-analyzer", async (route) => {
      const mockAnalysis = {
        summary: {
          totalLines: 6,
          errorCount: 2,
          warnCount: 1,
          infoCount: 3,
          timeRange: "2024-12-23 10:15:32 - 10:16:05",
        },
        issues: [
          {
            type: "critical",
            title: "데이터베이스 연결 타임아웃이 감지되었습니다",
            category: "Database Connection",
            description:
              "데이터베이스에 30초 이상 연결할 수 없어 타임아웃이 발생했습니다.",
            impact: "높음",
            count: 1,
            firstOccurrence: "2024-12-23 10:15:45",
            recommendations: ["데이터베이스 연결 풀 설정을 확인하세요"],
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
      await route.fulfill({ json: mockAnalysis });
    });

    // Navigate directly to the log analyzer page
    await page.goto("/log-analyzer");

    // Verify the page header is correct
    await expect(
      page.getByRole("heading", { name: "로그 분석기", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText("시스템 로그를 분석하여 이슈와 패턴을 자동으로 탐지합니다.")
    ).toBeVisible();

    // Find the textarea and fill it with the sample log data
    const logInput = page.getByPlaceholder("분석할 로그를 여기에 붙여넣으세요...");
    await logInput.fill(sampleLog);
    await expect(logInput).toHaveValue(sampleLog);

    // Click the "분석 시작" button to trigger the analysis
    // Button text is inferred from `src/app/guide/page.tsx`'s description of a similar feature
    await page.getByRole("button", { name: "분석 시작" }).click();

    // Wait for the analysis results to appear by checking for a key piece of text
    const resultsSection = page.locator("section#analysis-results");
    await expect(
      resultsSection.getByRole("heading", { name: "분석 결과" })
    ).toBeVisible();

    // Validate that key information from the mocked response is displayed
    await expect(
      resultsSection.getByText("데이터베이스 연결 타임아웃이 감지되었습니다")
    ).toBeVisible();
    await expect(
      resultsSection.getByText("데이터베이스 연결 풀 모니터링 강화")
    ).toBeVisible();
    await expect(resultsSection.getByText("Error Count")).toBeVisible();
    await expect(resultsSection.getByText("2")).toBeVisible(); // Check error count
  });

  // @feature e2e-tester
  test("should display the E2E Test Automation configuration page", async ({
    page,
  }) => {
    // Navigate directly to the E2E tester page
    await page.goto("/e2e-tester");

    // Verify the page header title and description are correctly displayed
    await expect(
      page.getByRole("heading", { name: "E2E 자동 테스터", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText(
        "Playwright를 활용한 자동화된 엔드투엔드 테스트를 구성합니다."
      )
    ).toBeVisible();

    // Verify that the main configuration form elements are present
    const mainForm = page.getByRole("form");
    await expect(
      mainForm.getByLabel("GitHub Repository URL")
    ).toBeVisible();
    await expect(
      mainForm.getByLabel("GitHub Personal Access Token")
    ).toBeVisible();
    await expect(
      mainForm.getByLabel(
        "어떤 테스트를 자동화하고 싶으신가요? (예: 로그인, 회원가입)"
      )
    ).toBeVisible();

    // Check for the stepper component, indicating the process flow is visible
    // `Stepper.tsx` uses a <nav> element with an aria-label
    await expect(page.getByRole("navigation", { name: "Progress" })).toBeVisible();

    // Ensure the main call-to-action button is present and initially enabled
    const startButton = page.getByRole("button", { name: "자동화 시작" });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
  });
});