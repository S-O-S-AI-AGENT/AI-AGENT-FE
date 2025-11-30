import { test, expect } from "@playwright/test";

test.describe("Primary User Journeys", () => {
  // Before each test, navigate to the application's homepage.
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // @feature sql-tuner
  test("should navigate to SQL Tuner, input a query, and receive an optimized result", async ({
    page,
  }) => {
    // 1. Navigate from the homepage to the SQL Tuner feature.
    // The link is identified by its accessible name, which includes the feature title.
    await page.getByRole("link", { name: "SQL 튜너" }).click();

    // 2. Verify successful navigation to the SQL Tuner page.
    // Check the URL and the presence of the main page heading.
    await expect(page).toHaveURL("/sql-tuner");
    await expect(
      page.getByRole("heading", { name: "SQL 튜너", level: 1 }),
    ).toBeVisible();

    // 3. Input a sample SQL query into the text area.
    // The textarea is located using its placeholder text, which is the most reliable selector here.
    const originalQuery = `SELECT u.id, u.name, o.product_name FROM users u JOIN orders o ON u.id = o.user_id WHERE u.status = 'active'`;
    await page
      .getByPlaceholder("코드를 입력하세요...")
      .fill(originalQuery);

    // 4. Trigger the analysis by clicking the main action button.
    await page.getByRole("button", { name: "성능 분석 실행" }).click();

    // 5. Validate the results of the analysis.
    // Playwright's expect assertions will wait for the elements to appear.
    // We expect to see the optimized SQL query and the detailed analysis section.
    const analysisResultsSection = page.locator("section", {
      has: page.getByRole("heading", { name: "분석 결과" }),
    });

    // Check that the mock optimized query is displayed.
    await expect(
      analysisResultsSection.getByText("-- 최적화된 쿼리"),
    ).toBeVisible();

    // Check for a specific improvement suggestion from the mock analysis.
    await expect(
      analysisResultsSection.getByText("인덱스 최적화"),
    ).toBeVisible();
    await expect(
      analysisResultsSection.getByText(
        /user_id와 status에 복합 인덱스를 추가하면/,
      ),
    ).toBeVisible();
  });

  // @feature log-analyzer
  test("should navigate to Log Analyzer, input logs, and receive analysis", async ({
    page,
  }) => {
    // 1. Navigate from the homepage to the Log Analyzer feature.
    await page.getByRole("link", { name: "로그 분석기" }).click();

    // 2. Verify successful navigation.
    await expect(page).toHaveURL("/log-analyzer");
    await expect(
      page.getByRole("heading", { name: "로그 분석기", level: 1 }),
    ).toBeVisible();

    // 3. Input sample logs into the textarea.
    // The sample log is taken directly from the component's source code for consistency.
    const sampleLog = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds
2024-12-23 10:15:46 WARN  [DatabaseService] Retrying database connection (attempt 1/3)
2024-12-23 10:15:52 INFO  [DatabaseService] Database connection restored
2024-12-23 10:16:01 ERROR [PaymentService] Payment processing failed: insufficient_funds, user_id=12345`;
    await page
      .getByPlaceholder("분석할 로그를 여기에 붙여넣으세요...")
      .fill(sampleLog);

    // 4. Start the analysis process.
    await page.getByRole("button", { name: "로그 분석 시작" }).click();

    // 5. Validate the analysis results.
    // Check for the summary heading and specific issues identified in the mock analysis.
    await expect(
      page.getByRole("heading", { name: "분석 결과 요약" }),
    ).toBeVisible();

    // Find the section containing the discovered issues.
    const issuesSection = page.locator("section", {
      has: page.getByRole("heading", { name: "주요 발견 이슈" }),
    });

    // Assert that the critical "Connection timeout" issue is visible in the report.
    await expect(
      issuesSection.getByRole("heading", { name: "Connection Timeout" }),
    ).toBeVisible();
    await expect(
      issuesSection.getByText(/Could not connect to database/),
    ).toBeVisible();
  });

  // @feature text2sql
  test("should navigate to Text2SQL, input a natural language question, and get a SQL query", async ({
    page,
  }) => {
    // 1. Navigate from the homepage to the Text2SQL feature.
    await page.getByRole("link", { name: "Text2SQL" }).click();

    // 2. Verify successful navigation.
    await expect(page).toHaveURL("/text2sql");
    await expect(
      page.getByRole("heading", { name: "Text2SQL", level: 1 }),
    ).toBeVisible();

    // 3. Input a natural language question.
    const question = "활성 사용자들의 평균 주문 금액은?";
    await page
      .getByPlaceholder("SQL로 변환할 질문을 입력하세요...")
      .fill(question);

    // 4. Trigger the SQL generation.
    await page.getByRole("button", { name: "SQL 생성" }).click();

    // 5. Validate the generated SQL query.
    // Check for the result heading and the content of the generated SQL.
    await expect(
      page.getByRole("heading", { name: "생성된 SQL 쿼리" }),
    ).toBeVisible();

    // The generated SQL is inside a read-only textarea. We find it by its content.
    // The mock response is hardcoded in the component for this specific question.
    const expectedSql =
      "SELECT AVG(o.price) as avg_order_amount FROM orders o JOIN users u ON o.user_id = u.id WHERE u.status = 'active';";
    
    // We can locate the code block by looking for the generated SQL text content.
    const generatedSqlBlock = page.locator("textarea:has-text('SELECT AVG(o.price)')");

    await expect(generatedSqlBlock).toBeVisible();
    await expect(generatedSqlBlock).toHaveValue(expectedSql);
  });
});