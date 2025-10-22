import { test, expect } from "@playwright/test";

// @feature homepage
test('should load the homepage and display key feature cards', async ({ page }) => {
  // Navigate to the root of the application
  await page.goto('/');

  // Verify the main heading is visible
  await expect(page.getByRole('heading', { name: 'AI Project Agent', level: 1 })).toBeVisible();

  // Verify the main product description is visible
  await expect(page.getByText('1인 기업과 중소기업을 위한 AI 기반 개발 및 운영 자동화 도구')).toBeVisible();

  // Check for the presence of feature cards by their titles, ensuring they are links
  await expect(page.getByRole('link', { name: /SQL 튜너/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Text2SQL/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /E2E 자동 테스터/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /로그 분석기/ })).toBeVisible();
});

// @feature sql-tuner
test('should navigate to SQL Tuner, input a query, and receive an optimization', async ({ page }) => {
  // Start at the homepage
  await page.goto('/');

  // Navigate to the SQL Tuner feature page
  await page.getByRole('link', { name: /SQL 튜너/ }).click();

  // Verify the page has loaded by checking for the main heading
  await expect(page.getByRole('heading', { name: 'SQL 쿼리 최적화', level: 1 })).toBeVisible();

  // Define the SQL query to be optimized
  const originalSql = "SELECT * FROM users WHERE status = 'active' AND last_login < '2023-01-01';";
  
  // Locate the input textarea and fill it with the query
  const sqlInput = page.getByPlaceholder('최적화할 SQL 쿼리를 입력하세요...');
  await sqlInput.fill(originalSql);

  // Click the button to start the analysis
  await page.getByRole('button', { name: '분석 및 최적화' }).click();

  // The app will show a loading state, wait for the results to appear.
  // We can assert the visibility of a key part of the result.
  const analysisResultHeader = page.getByRole('heading', { name: 'AI 분석 결과', level: 2 });
  await expect(analysisResultHeader).toBeVisible({ timeout: 10000 }); // Increased timeout for simulated API call

  // Verify that the optimized SQL is displayed
  const optimizedSqlOutput = page.locator('textarea').nth(1);
  await expect(optimizedSqlOutput).toContainText(/-- 최적화된 쿼리/);
  
  // Verify a specific improvement suggestion is present
  await expect(page.getByText('인덱스 최적화')).toBeVisible();
});

// @feature log-analyzer
test('should navigate to Log Analyzer, input logs, and receive an analysis', async ({ page }) => {
  // Start at the homepage
  await page.goto('/');

  // Navigate to the Log Analyzer feature page
  await page.getByRole('link', { name: /로그 분석기/ }).click();
  
  // Verify the page has loaded by checking for the main heading
  await expect(page.getByRole('heading', { name: '로그 분석 및 AI 리포팅', level: 1 })).toBeVisible();

  // Define sample log content to analyze
  const logContent = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds`;
  
  // Locate the input textarea and paste the logs
  const logInput = page.getByPlaceholder('로그 데이터를 여기에 붙여넣으세요...');
  await logInput.fill(logContent);
  
  // Click the button to start the analysis
  await page.getByRole('button', { name: 'AI 분석 시작' }).click();
  
  // Wait for the analysis report header to be visible
  const reportHeader = page.getByRole('heading', { name: 'AI 분석 리포트', level: 2 });
  await expect(reportHeader).toBeVisible({ timeout: 10000 });

  // Verify that the summary section is displayed
  const summaryHeader = page.getByRole('heading', { name: '분석 요약', level: 3 });
  await expect(summaryHeader).toBeVisible();

  // Check for specific analysis results, like the error count
  const errorCount = page.locator('div').filter({ hasText: /^에러 수1$/ }).first();
  await expect(errorCount).toBeVisible();

  // Check for the identified issues section
  await expect(page.getByRole('heading', { name: '탐지된 주요 이슈', level: 3 })).toBeVisible();
  await expect(page.getByText('데이터베이스 연결 실패')).toBeVisible();
});

// @feature text2sql
test('should navigate to Text2SQL, input a question, and receive a SQL query', async ({ page }) => {
  // Start at the homepage
  await page.goto('/');

  // Navigate to the Text2SQL feature page
  await page.getByRole('link', { name: /Text2SQL/ }).click();

  // Verify the page has loaded by checking for the main heading
  await expect(page.getByRole('heading', { name: 'AI 기반 Text to SQL', level: 1 })).toBeVisible();

  // Define the natural language question
  const question = "활성 상태인 사용자를 모두 보여줘";
  
  // Locate the question input and fill it
  const questionInput = page.getByPlaceholder(/데이터베이스에 질문해보세요/);
  await questionInput.fill(question);

  // Click the button to generate the SQL
  await page.getByRole('button', { name: 'SQL 생성' }).click();

  // Wait for the results section to appear
  const generatedSqlHeader = page.getByRole('heading', { name: '생성된 SQL 쿼리', level: 2 });
  await expect(generatedSqlHeader).toBeVisible({ timeout: 10000 });
  
  // Locate the output element and verify it contains a valid SQL query
  // The result is in a CodeBlock component which uses a textarea
  const sqlOutput = page.locator('h2:has-text("생성된 SQL 쿼리") + div').locator('textarea');
  await expect(sqlOutput).toContainText(/SELECT/i);
  await expect(sqlOutput).toContainText(/FROM users/i);
  await expect(sqlOutput).toContainText(/WHERE status = 'active'/i);
});