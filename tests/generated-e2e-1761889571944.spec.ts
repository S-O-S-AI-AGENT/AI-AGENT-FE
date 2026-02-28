import { test, expect } from "@playwright/test";

// @feature homepage
test("should display the homepage and feature cards", async ({ page }) => {
  // Navigate to the root of the application
  await page.goto("/");

  // 1. Verify the page title from the root layout
  await expect(page).toHaveTitle("AI Project Agent - 개발 및 운영 도구");

  // 2. Locate and verify the "SQL 튜너" feature card
  // The card itself is a link, so we locate it by its role and accessible name.
  const sqlTunerCard = page.getByRole("link", { name: /SQL 튜너/ });
  await expect(sqlTunerCard).toBeVisible();
  // Verify the description within the card's scope
  await expect(
    sqlTunerCard.getByText("AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다.")
  ).toBeVisible();
  // Verify the external link
  await expect(sqlTunerCard).toHaveAttribute(
    "href",
    "http://vaatz-tuner-vaatz-tuner--20e49-112305685-f25b4e832f9a.kr.lb.naverncp.com/dashboard"
  );

  // 3. Locate and verify the "E2E 자동 테스터" feature card
  const e2eTesterCard = page.getByRole("link", { name: /E2E 자동 테스터/ });
  await expect(e2eTesterCard).toBeVisible();
  await expect(
    e2eTesterCard.getByText(
      "Playwright를 활용한 자동화된 엔드투엔드 테스트를 구성합니다."
    )
  ).toBeVisible();
  await expect(e2eTesterCard).toHaveAttribute("href", "/e2e-tester");

  // 4. Locate and verify the "로그 분석기" feature card
  const logAnalyzerCard = page.getByRole("link", { name: /로그 분석기/ });
  await expect(logAnalyzerCard).toBeVisible();
  await expect(
    logAnalyzerCard.getByText(
      "시스템 로그를 분석하여 이슈와 패턴을 자동으로 탐지합니다."
    )
  ).toBeVisible();
  await expect(logAnalyzerCard).toHaveAttribute("href", "/log-analyzer");
});

// @feature log-analyzer
test("should navigate to the log analyzer, input logs, and receive analysis", async ({
  page,
}) => {
  // Mock the API response for the log analyzer to ensure a deterministic test
  await page.route("**/api/log-analyzer", async (route) => {
    const mockAnalysis = {
      summary: {
        totalLines: 6,
        errorCount: 2,
        warnCount: 1,
        infoCount: 3,
        timeRange: "2024-12-23 10:15:32 - 2024-12-23 10:16:05",
      },
      issues: [
        {
          type: "critical",
          category: "Database Connection",
          title: "데이터베이스 연결 타임아웃",
          description: "데이터베이스 연결에 30초 이상 소요되어 타임아웃이 발생했습니다.",
          impact: "높음",
          count: 1,
          firstOccurrence: "2024-12-23 10:15:45",
          recommendations: ["데이터베이스 연결 풀 설정을 확인하세요", "네트워크 지연 시간 확인"],
        },
      ],
      patterns: [],
      recommendations: ["데이터베이스 연결 풀 모니터링 강화"],
    };
    await route.fulfill({ json: mockAnalysis });
  });

  // 1. Start from the homepage
  await page.goto("/");

  // 2. Navigate to the Log Analyzer page
  await page.getByRole("link", { name: /로그 분석기/ }).click();
  await expect(page).toHaveURL("/log-analyzer");

  // 3. Find the textarea and input sample logs
  const sampleLog = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds
2024-12-23 10:15:46 WARN  [DatabaseService] Retrying database connection (attempt 1/3)
2024-12-23 10:15:52 INFO  [DatabaseService] Database connection restored
2024-12-23 10:16:01 ERROR [PaymentService] Payment processing failed: insufficient_funds, user_id=12345
2024-12-23 10:16:05 INFO  [NotificationServ`;
  
  // Use a generic role selector as no specific label/placeholder is available
  await page.getByRole('textbox').fill(sampleLog);

  // 4. Click the analyze button
  await page.getByRole("button", { name: "분석 시작" }).click();

  // 5. Verify that the analysis results are displayed
  // Playwright's expect automatically waits for the element to be visible.
  const resultsSection = page.getByRole("region", { name: "분석 결과" });
  await expect(resultsSection).toBeVisible();

  // 6. Validate the content of the analysis summary from the mocked response
  const summarySection = resultsSection.getByRole("heading", {
    name: "분석 요약",
    level: 2,
  });
  await expect(summarySection).toBeVisible();
  await expect(resultsSection.getByText("총 라인 수: 6")).toBeVisible();
  await expect(resultsSection.getByText("에러: 2")).toBeVisible();

  // 7. Validate a specific issue detected from the mocked response
  await expect(
    resultsSection.getByRole("heading", { name: "데이터베이스 연결 타임아웃", level: 3 })
  ).toBeVisible();
  await expect(
    resultsSection.getByText(
      "데이터베이스 연결에 30초 이상 소요되어 타임아웃이 발생했습니다."
    )
  ).toBeVisible();

  // 8. Validate a final recommendation from the mocked response
  await expect(
    resultsSection.getByText("데이터베이스 연결 풀 모니터링 강화")
  ).toBeVisible();
});

// @feature e2e-tester
test("should navigate to the E2E tester page and display initial state", async ({
  page,
}) => {
  // 1. Start from the homepage
  await page.goto("/");

  // 2. Navigate to the E2E Auto Tester page
  await page.getByRole("link", { name: /E2E 자동 테스터/ }).click();
  await expect(page).toHaveURL("/e2e-tester");

  // 3. Verify the main header of the E2E Tester page
  // The title is inferred from the link on the homepage. `PageHeader` renders an `<h1>`.
  await expect(
    page.getByRole("heading", { name: "E2E 자동 테스터", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByText("GitHub 저장소 URL을 입력하여 E2E 테스트 자동화를 시작하세요.")
  ).toBeVisible();

  // 4. Check for the initial state of the workflow stepper
  // Locate the stepper navigation by its ARIA label.
  const stepper = page.getByRole("navigation", { name: "Progress" });
  // The first step should be the current step, indicated by `aria-current`.
  const firstStep = stepper.getByText("저장소 분석");
  await expect(firstStep).toHaveAttribute("aria-current", "step");

  // 5. Verify the input field for the repository URL exists
  const repoUrlInput = page.getByPlaceholder(
    "https://github.com/owner/repository"
  );
  await expect(repoUrlInput).toBeVisible();

  // 6. Verify the main action button is present and initially disabled
  const startButton = page.getByRole("button", { name: "자동화 시작" });
  await expect(startButton).toBeVisible();
  await expect(startButton).toBeDisabled();

  // 7. Enter a valid URL and verify the button becomes enabled
  await repoUrlInput.fill("https://github.com/S-O-S-AI-AGENT/AI-AGENT-FE");
  await expect(startButton).toBeEnabled();
});