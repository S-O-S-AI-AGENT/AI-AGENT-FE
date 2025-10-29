import { test, expect } from "@playwright/test";

test.describe("AI Agent Primary User Journeys", () => {
  // @feature sql-tuner
  test("should allow a user to tune a SQL query and see optimizations", async ({
    page,
  }) => {
    // Navigate to the SQL Tuner page
    await page.goto("/sql-tuner");

    // 1. Verify the page has loaded correctly by checking the main header.
    await expect(
      page.getByRole("heading", { name: "SQL 튜너", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText("AI를 통해 SQL 쿼리의 성능을 분석하고 최적화 제안을 받으세요.")
    ).toBeVisible();

    // 2. Locate the input textarea and enter a sample SQL query.
    const sqlInput = page.getByPlaceholder("코드를 입력하세요...");
    await expect(sqlInput).toBeVisible();
    const sampleQuery = `SELECT u.name, COUNT(*) FROM users u, orders o WHERE u.id = o.user_id AND u.signup_date > '2023-01-01' GROUP BY u.name;`;
    await sqlInput.fill(sampleQuery);

    // 3. Click the analysis button to submit the query.
    const analyzeButton = page.getByRole("button", { name: "SQL 성능 분석" });
    await analyzeButton.click();

    // 4. Wait for the analysis to complete and results to be displayed.
    // The UI shows a loading state, we wait for the results section to appear.
    const optimizedSqlHeading = page.getByRole("heading", {
      name: "최적화된 SQL",
    });
    await expect(optimizedSqlHeading).toBeVisible({ timeout: 10000 }); // Increased timeout for simulated API call

    // 5. Validate the content of the optimized SQL output.
    // The component uses a readonly textarea for the output.
    const optimizedSqlOutput = optimizedSqlHeading
      .locator("+ div") // The CodeBlock component is the next sibling
      .getByRole("textbox");
    await expect(optimizedSqlOutput).toContainText(/INNER JOIN/); // A simple check for optimization
    await expect(optimizedSqlOutput).toContainText(/CREATE INDEX/); // Check for index suggestion

    // 6. Validate the analysis details section for specific improvement suggestions.
    await expect(
      page.getByRole("heading", { name: "성능 개선 분석" })
    ).toBeVisible();
    await expect(page.getByText("인덱스 최적화")).toBeVisible();
    await expect(
      page.getByText(
        "user_id와 status에 복합 인덱스를 추가하면 조인 성능이 85% 향상됩니다."
      )
    ).toBeVisible();
  });

  // @feature log-analyzer
  test("should allow a user to analyze logs and view the summary", async ({
    page,
  }) => {
    // Navigate to the Log Analyzer page
    await page.goto("/log-analyzer");

    // 1. Verify the page has loaded by checking the header.
    await expect(
      page.getByRole("heading", { name: "로그 분석기", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText("AI를 통해 대규모 로그 데이터를 분석하고 자동으로 이슈를 탐지합니다.")
    ).toBeVisible();

    // 2. Use the "sample log" feature to populate the input.
    const sampleLogButton = page.getByRole("button", {
      name: "샘플 로그 사용",
    });
    await sampleLogButton.click();

    // 3. Verify that the textarea is populated with the sample log content.
    const logInput = page.getByPlaceholder(
      "로그 내용을 여기에 붙여넣거나 샘플 로그를 사용하세요."
    );
    await expect(logInput).toContainText(
      /User authentication successful: user_id=12345/
    );
    await expect(logInput).toContainText(
      /Connection timeout: Could not connect to database/
    );

    // 4. Click the analyze button to start the process.
    const analyzeButton = page.getByRole("button", { name: "로그 분석" });
    await analyzeButton.click();

    // 5. Wait for the analysis results to appear by looking for the results heading.
    const resultsHeading = page.getByRole("heading", { name: "분석 요약" });
    await expect(resultsHeading).toBeVisible({ timeout: 10000 });

    // 6. Validate that key sections of the report are rendered.
    // Because the mock response is internal, we check for the structure of the results.
    await expect(page.getByText(/총 라인:/)).toBeVisible();
    await expect(page.getByText(/에러:/)).toBeVisible();
    await expect(page.getByText(/경고:/)).toBeVisible();

    const issuesHeading = page.getByRole("heading", {
      name: "탐지된 주요 이슈",
    });
    await expect(issuesHeading).toBeVisible();
    // Check that at least one issue card is rendered.
    await expect(issuesHeading.locator("+ div > div").first()).toBeVisible();
  });

  // @feature text2sql
  test("should allow a user to generate a SQL query from natural language", async ({
    page,
  }) => {
    // Navigate to the Text2SQL page
    await page.goto("/text2sql");

    // 1. Verify the page has loaded correctly.
    await expect(
      page.getByRole("heading", { name: "Text2SQL", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText("자연어 질문을 입력하면 AI가 SQL 쿼리를 생성해 드립니다.")
    ).toBeVisible();

    // 2. Locate the input field and enter a natural language question.
    const questionInput = page.getByPlaceholder(
      "예: '지난 달 가장 많이 주문한 상위 5명의 사용자'"
    );
    await expect(questionInput).toBeVisible();
    await questionInput.fill(
      "Show me all active users who signed up this year."
    );

    // 3. Click the generate button.
    const generateButton = page.getByRole("button", { name: "SQL 생성" });
    await generateButton.click();

    // 4. Wait for the generated SQL to appear.
    const generatedSqlHeading = page.getByRole("heading", {
      name: "생성된 SQL 쿼리",
    });
    await expect(generatedSqlHeading).toBeVisible({ timeout: 10000 });

    // 5. Validate the generated SQL output.
    // The result is in a readonly textarea within a CodeBlock component.
    const sqlOutput = generatedSqlHeading
      .locator("+ div") // The CodeBlock component
      .getByRole("textbox");
    await expect(sqlOutput).toBeVisible();

    // Check for SQL keywords, as the exact mock response is internal.
    await expect(sqlOutput).toContainText(/SELECT/i);
    await expect(sqlOutput).toContainText(/FROM users/i);
    await expect(sqlOutput).toContainText(/WHERE/i);
    await expect(sqlOutput).toContainText(/status = 'active'/i);

    // 6. Verify that the query history is updated.
    await expect(
      page.getByRole("heading", { name: "최근 생성 기록" })
    ).toBeVisible();
    await expect(
      page.getByText("지난 달에 가장 많이 주문한 사용자를 찾아주세요")
    ).toBeVisible();
  });
});