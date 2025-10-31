import { test, expect } from "@playwright/test";

// @feature homepage
test.describe("Homepage and Navigation", () => {
  test("should display feature cards and allow navigation to feature pages", async ({
    page,
  }) => {
    // 1. Navigate to the homepage
    await page.goto("/");

    // 2. Verify that the main feature cards are visible
    // We check for the heading of each feature card to ensure they are rendered.
    // Scoping within the 'main' landmark to ensure we're looking at page content.
    const main = page.getByRole("main");
    await expect(
      main.getByRole("heading", { name: "SQL 튜너", level: 2 })
    ).toBeVisible();
    await expect(
      main.getByRole("heading", { name: "E2E 자동 테스터", level: 2 })
    ).toBeVisible();
    await expect(
      main.getByRole("heading", { name: "로그 분석기", level: 2 })
    ).toBeVisible();

    // 3. Click on the '로그 분석기' feature link to navigate
    // We use a regular expression to find the link associated with the feature.
    await main.getByRole("link", { name: /로그 분석기/ }).click();

    // 4. Validate that the navigation was successful
    // The URL should be updated to the log analyzer's path.
    await expect(page).toHaveURL("/log-analyzer");

    // The heading of the new page should be visible, confirming the page load.
    // Based on `src/app/log-analyzer/page.tsx`, the main heading is "AI 기반 로그 분석기"
    await expect(
      page.getByRole("heading", { name: "AI 기반 로그 분석기", level: 1 })
    ).toBeVisible();
  });
});

// @feature log-analyzer
test.describe("Log Analyzer", () => {
  test("should analyze sample logs and display mock results", async ({
    page,
  }) => {
    // Mock the API response to ensure a predictable and fast test run.
    // This intercepts the POST request to the log analyzer API and returns a predefined JSON.
    await page.route("**/api/log-analyzer", async (route) => {
      const mockAnalysis = {
        summary: {
          totalLines: 10,
          errorCount: 2,
          warnCount: 1,
          infoCount: 3,
          timeRange: "2024-12-23 10:15:32 - 2024-12-23 10:16:05",
        },
        issues: [
          {
            type: "critical",
            category: "Database Connection",
            message: "데이터베이스 연결 타임아웃이 감지되었습니다",
            count: 1,
            impact: "높음",
            suggestion: "데이터베이스 연결 풀 설정을 확인하세요",
            firstOccurrence: "2024-12-23 10:15:45",
            affectedService: "DatabaseService",
          },
        ],
        recommendations: ["데이터베이스 연결 풀 모니터링 강화"],
      };
      await route.fulfill({ json: mockAnalysis });
    });

    // 1. Navigate directly to the Log Analyzer page
    await page.goto("/log-analyzer");

    // 2. Verify the page header is correct
    await expect(
      page.getByRole("heading", { name: "AI 기반 로그 분석기", level: 1 })
    ).toBeVisible();

    // 3. Input sample log data into the textarea
    const sampleLog = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds
2024-12-23 10:15:46 WARN  [DatabaseService] Retrying database connection (attempt 1/3)
2024-12-23 10:16:01 ERROR [PaymentService] Payment processing failed: insufficient_funds, user_id=12345`;

    // The textarea is inside a CodeBlock component and can be identified by its placeholder.
    await page
      .getByPlaceholder("코드를 입력하세요...")
      .fill(sampleLog);

    // 4. Click the '분석 시작' button to trigger the analysis
    await page.getByRole("button", { name: "분석 시작" }).click();

    // 5. Wait for the analysis to complete and validate the results
    // We expect the loading spinner to appear and then disappear.
    // A robust way to wait for the result is to assert that a key part of the mock response is visible.
    const resultsSection = page.getByRole("region", { name: "분석 결과" });
    await expect(
      resultsSection.getByText("데이터베이스 연결 타임아웃이 감지되었습니다")
    ).toBeVisible();

    // Further validation to ensure other parts of the mock response are rendered correctly.
    await expect(resultsSection.getByText("총 라인 수")).toBeVisible();
    await expect(resultsSection.getByText("10")).toBeVisible(); // From mockAnalysis.summary.totalLines
    await expect(
      resultsSection.getByText("데이터베이스 연결 풀 모니터링 강화")
    ).toBeVisible();
  });
});

// @feature e2e-tester
test.describe("E2E Tester", () => {
  test("should start the test generation process and show progress", async ({
    page,
  }) => {
    // Mock the API to avoid a real, long-running process.
    // This allows us to test the UI's reaction to the process starting.
    await page.route("**/api/deploy-e2e", async (route) => {
      // We fulfill the request to simulate the backend accepting the job.
      // The frontend will then update its state to 'analyzing'.
      await route.fulfill({
        status: 200,
        body: "Processing started",
      });
    });

    // 1. Navigate to the E2E Tester page
    await page.goto("/e2e-tester");

    // 2. Verify the page's main heading
    await expect(
      page.getByRole("heading", { name: "AI 기반 E2E 테스트 자동화", level: 1 })
    ).toBeVisible();

    // 3. Fill in the required form fields
    const repoUrl = "https://github.com/S-O-S-AI-AGENT/AI-AGENT-FE";
    const testScenario =
      "사용자가 랜딩 페이지에 방문하여 주요 기능 카드를 확인하고, 로그 분석기 페이지로 이동하는지 테스트합니다.";

    await page
      .getByLabel("GitHub 레포지토리 URL")
      .fill(repoUrl);
    await page
      .getByLabel("테스트 시나리오 또는 요구사항")
      .fill(testScenario);

    // 4. Click the button to start the process
    await page.getByRole("button", { name: "분석 및 테스트 생성" }).click();

    // 5. Validate that the UI updates to show the process has started
    // A stepper component should appear, indicating the current step.
    const stepper = page.getByRole("navigation", { name: "Progress" });
    await expect(stepper).toBeVisible();

    // Check that the current step is '분석' (Analysis)
    const currentStepIndicator = stepper.getByRole("listitem", {
      current: true,
    });
    
    // The component uses an aria-current="step" on the inner div, so we locate it this way.
    const currentStep = page.locator('[aria-current="step"]');
    await expect(currentStep).toBeVisible();

    // The name of the current step is visually associated.
    await expect(page.getByText("분석")).toBeVisible();
  });
});