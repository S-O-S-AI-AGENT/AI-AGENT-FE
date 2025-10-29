import { test, expect } from "@playwright/test";

// @feature homepage
test("should load the homepage and display feature cards", async ({ page }) => {
  // Navigate to the root of the application
  await page.goto("/");

  // Verify the main page heading/title is present.
  // The page uses cards instead of a single h1, so we verify a key feature card.
  const sqlTunerCard = page.getByRole("link", { name: "SQL 튜너 AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다." });

  // Expect the SQL Tuner card to be visible, confirming the page has loaded correctly
  await expect(sqlTunerCard).toBeVisible();

  // Verify that other key feature cards are also present
  await expect(page.getByRole("link", { name: "Text2SQL 자연어로 SQL 쿼리를 생성하고 데이터베이스를 쉽게 조회합니다." })).toBeVisible();
  await expect(page.getByRole("link", { name: "로그 분석기 시스템 로그를 분석하여 이슈와 패턴을 자동으로 탐지합니다." })).toBeVisible();
});

// @feature sql-tuner
test("should optimize a SQL query on the SQL Tuner page", async ({ page }) => {
  // Navigate directly to the SQL Tuner page for an independent test
  await page.goto("/sql-tuner");

  // Define the original, unoptimized SQL query to be tested
  const originalSQL = "SELECT * FROM users u, orders o WHERE u.id = o.user_id AND u.signup_date > '2023-01-01'";

  // Locate the input textarea using its placeholder text
  const sqlInput = page.getByPlaceholder("코드를 입력하세요...");
  
  // Verify the input area is visible before interacting with it
  await expect(sqlInput).toBeVisible();
  
  // Fill the textarea with the original SQL query
  await sqlInput.fill(originalSQL);

  // Find and click the "Analyze" button to start the optimization process
  const analyzeButton = page.getByRole("button", { name: "최적화 분석" });
  await analyzeButton.click();

  // The button text changes to "분석 중...", indicating an async operation.
  // We can assert this state to ensure the loading indicator is working.
  await expect(page.getByRole("button", { name: "분석 중..." })).toBeVisible();

  // Wait for the analysis results to be displayed.
  // Playwright's expect will auto-wait for the element to appear.
  const analysisResultsHeader = page.getByRole("heading", { name: "분석 결과", level: 3 });
  await expect(analysisResultsHeader).toBeVisible();
  
  // Check for a specific piece of text in the improvement suggestions
  await expect(page.getByText("인덱스 최적화")).toBeVisible();
  await expect(page.getByText("user_id와 status에 복합 인덱스를 추가하면 조인 성능이 85% 향상됩니다.")).toBeVisible();

  // Verify that the optimized SQL query is displayed in the output area.
  // The mock response includes a comment "-- 최적화된 쿼리", which we check for.
  const optimizedSQLOutput = page.locator('textarea[readonly]');
  await expect(optimizedSQLOutput).toContainText(/-- 최적화된 쿼리/);
  await expect(optimizedSQLOutput).toContainText(/CREATE INDEX idx_orders_user_status ON orders\(user_id, status\);/);
});

// @feature log-analyzer
test("should analyze logs and display a summary on the Log Analyzer page", async ({ page }) => {
  // Navigate directly to the Log Analyzer page
  await page.goto("/log-analyzer");
  
  // Check that the page header is correct
  await expect(page.getByRole("heading", { name: "AI 기반 로그 분석기", level: 1 })).toBeVisible();

  // Define sample log content to be analyzed, taken from the component's sample data
  const sampleLog = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds
2024-12-23 10:15:46 WARN  [DatabaseService] Retrying database connection (attempt 1/3)
2024-12-23 10:16:01 ERROR [PaymentService] Payment processing failed: insufficient_funds, user_id=12345`;

  // Locate the log input textarea by its placeholder
  const logInput = page.getByPlaceholder("여기에 로그를 붙여넣으세요...");
  
  // Fill the textarea with the sample log data
  await logInput.fill(sampleLog);

  // Click the "Analyze Log" button to trigger the analysis
  const analyzeButton = page.getByRole("button", { name: "로그 분석" });
  await analyzeButton.click();
  
  // Expect the loading state to be visible while analysis is in progress
  await expect(page.getByText("AI가 로그를 분석하고 있습니다...")).toBeVisible();

  // Wait for the results section to appear by checking for its heading
  const resultsHeader = page.getByRole("heading", { name: "분석 결과", level: 2 });
  await expect(resultsHeader).toBeVisible();

  // Validate the summary section by checking for specific labels and values
  const summarySection = page.getByRole("region", { name: "분석 요약" });
  await expect(summarySection.getByText("총 라인 수")).toBeVisible();
  await expect(summarySection.getByText("에러 수")).toBeVisible();
  await expect(summarySection.getByText("경고 수")).toBeVisible();
  
  // Check that the identified issues are listed
  await expect(page.getByRole("heading", { name: "탐지된 주요 이슈", level: 3 })).toBeVisible();
  await expect(page.getByText("데이터베이스 연결 시간 초과")).toBeVisible();
});

// @feature text2sql
test("should generate a SQL query from a natural language question", async ({ page }) => {
  // Navigate directly to the Text2SQL page
  await page.goto("/text2sql");

  // Verify the page header is rendered correctly
  await expect(page.getByRole("heading", { name: "Text2SQL 변환기", level: 1 })).toBeVisible();
  
  // Define the natural language question
  const question = "Show me all active users";
  
  // Locate the question input textarea by its extensive placeholder text
  const questionInput = page.getByPlaceholder("데이터베이스에 대해 질문하세요... (예: 지난 달 가장 많이 팔린 제품은?)");
  
  // Type the question into the input field
  await questionInput.fill(question);

  // Click the "Generate SQL" button
  const generateButton = page.getByRole("button", { name: "SQL 생성" });
  await generateButton.click();
  
  // Assert the loading state is shown to the user
  await expect(page.getByText("AI가 SQL을 생성하고 있습니다...")).toBeVisible();

  // Wait for the generated SQL to appear in the read-only output textarea.
  // The mock response is hardcoded in the component, so we can check for its exact content.
  const generatedSQLOutput = page.locator('textarea[readonly]');
  await expect(generatedSQLOutput).toBeVisible();
  await expect(generatedSQLOutput).toHaveValue(/SELECT \* FROM users WHERE status = 'active' LIMIT 10;/);

  // Verify the "Copy" button is available for the generated query
  const outputSection = page.getByRole('region', { name: "생성된 SQL" });
  await expect(outputSection.getByRole("button", { name: "복사" })).toBeVisible();
});