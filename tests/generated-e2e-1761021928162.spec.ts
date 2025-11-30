import { test, expect } from "@playwright/test";

/**
 * This test suite validates the primary user journeys of the AI Project Agent application.
 * It covers the homepage navigation and the core functionality of three key features:
 * SQL Tuner, Log Analyzer, and Text2SQL.
 */

// Test for the main landing page and navigation to a feature page
test('Homepage should load and allow navigation to feature pages', async ({ page }) => {
  // 1. Navigate to the homepage
  await test.step('Navigate to the homepage', async () => {
    await page.goto('/');
  });

  // 2. Verify that the main feature cards are visible
  // We use getByRole to select the links, ensuring they are accessible.
  // The accessible name is derived from the heading and paragraph within the link.
  await test.step('Verify feature cards are visible', async () => {
    const sqlTunerCard = page.getByRole('link', { name: 'SQL 튜너 AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다.' });
    const text2sqlCard = page.getByRole('link', { name: 'Text2SQL 자연어로 SQL 쿼리를 생성하고 데이터베이스를 쉽게 조회합니다.' });
    const logAnalyzerCard = page.getByRole('link', { name: '로그 분석기 시스템 로그를 분석하여 이슈와 패턴을 자동으로 탐지합니다.' });

    await expect(sqlTunerCard).toBeVisible();
    await expect(text2sqlCard).toBeVisible();
    await expect(logAnalyzerCard).toBeVisible();
  });

  // 3. Test navigation to the SQL Tuner page by clicking its card
  await test.step('Navigate to SQL Tuner page', async () => {
    const sqlTunerCard = page.getByRole('link', { name: 'SQL 튜너 AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다.' });
    await sqlTunerCard.click();
  });

  // 4. Verify the URL and the heading of the new page to confirm navigation was successful
  await test.step('Verify SQL Tuner page content', async () => {
    await expect(page).toHaveURL('/sql-tuner');
    // The PageHeader component renders the title as a level 1 heading.
    await expect(page.getByRole('heading', { name: 'SQL 튜너', level: 1 })).toBeVisible();
  });
});

// @feature sql-tuner
test('SQL Tuner should accept a query, analyze it, and display results', async ({ page }) => {
  // 1. Navigate directly to the SQL Tuner page
  await test.step('Navigate to the SQL Tuner page', async () => {
    await page.goto('/sql-tuner');
  });

  // 2. Verify the page header is rendered correctly
  await test.step('Verify page header', async () => {
    await expect(page.getByRole('heading', { name: 'SQL 튜너', level: 1 })).toBeVisible();
  });

  // 3. Locate the input text area and enter a sample SQL query
  await test.step('Enter a sample SQL query', async () => {
    // The CodeBlock component uses a textarea with a specific placeholder.
    const sqlInput = page.getByPlaceholder('코드를 입력하세요...');
    const originalQuery = `SELECT u.id, u.name, o.product_name FROM users u JOIN orders o ON u.id = o.user_id WHERE u.signup_date > '2023-01-01'`;
    await sqlInput.fill(originalQuery);
    await expect(sqlInput).toHaveValue(originalQuery);
  });

  // 4. Find and click the "Analyze" button
  await test.step('Click the analyze button', async () => {
    // The exact button text is not in the provided context, so we use a flexible regex.
    const analyzeButton = page.getByRole('button', { name: /분석/i });
    await analyzeButton.click();
  });

  // 5. Wait for the analysis results to appear and validate them
  await test.step('Verify analysis results', async () => {
    // Wait for result section headings to become visible, indicating the async operation is complete.
    const optimizedSqlHeading = page.getByRole('heading', { name: '최적화된 SQL' });
    const analysisResultHeading = page.getByRole('heading', { name: '분석 결과' });

    await expect(optimizedSqlHeading).toBeVisible({ timeout: 10000 });
    await expect(analysisResultHeading).toBeVisible();

    // Validate the content of the optimized SQL, based on mock data in the component.
    const optimizedCodeBlock = page.locator('div:has-text("최적화된 SQL")').getByRole('textbox');
    await expect(optimizedCodeBlock).toContainText(/-- 최적화된 쿼리/);
    await expect(optimizedCodeBlock).toContainText(/CREATE INDEX/);

    // Validate the analysis details.
    await expect(page.getByText('인덱스 최적화')).toBeVisible();
    await expect(page.getByText(/조인 성능이 85% 향상됩니다/)).toBeVisible();
  });
});

// @feature log-analyzer
test('Log Analyzer should accept logs, analyze them, and display results', async ({ page }) => {
  // 1. Navigate to the Log Analyzer page
  await test.step('Navigate to the Log Analyzer page', async () => {
    await page.goto('/log-analyzer');
  });

  // 2. Verify the page header
  await test.step('Verify page header', async () => {
    await expect(page.getByRole('heading', { name: '로그 분석기', level: 1 })).toBeVisible();
  });

  // 3. Enter sample log data into the text area
  await test.step('Enter sample log data', async () => {
    // Scope the locator to the "로그 입력" section for robustness.
    const logInputSection = page.locator('div:has-text("로그 입력")').first();
    const logInputArea = logInputSection.getByRole('textbox');

    // Use sample log content from the component file.
    const sampleLog = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds
2024-12-23 10:16:01 ERROR [PaymentService] Payment processing failed: insufficient_funds, user_id=12345`;
    
    await logInputArea.fill(sampleLog);
    await expect(logInputArea).toHaveValue(sampleLog);
  });

  // 4. Click the analyze button
  await test.step('Click the analyze button', async () => {
    const analyzeButton = page.getByRole('button', { name: /분석/i });
    await analyzeButton.click();
  });

  // 5. Wait for the analysis results to appear and validate them
  await test.step('Verify analysis results', async () => {
    // The analysis state type in the component file suggests the result structure.
    const analysisSummaryHeading = page.getByRole('heading', { name: '분석 요약' });
    await expect(analysisSummaryHeading).toBeVisible({ timeout: 10000 });
    
    // Check for key metrics in the summary.
    const summarySection = page.locator('div:has-text("분석 요약")');
    await expect(summarySection.getByText('총 라인 수')).toBeVisible();
    await expect(summarySection.getByText('에러 수')).toBeVisible();
    
    // Check for the "Detected Issues" section and its content based on the sample log.
    const detectedIssuesHeading = page.getByRole('heading', { name: '감지된 이슈' });
    await expect(detectedIssuesHeading).toBeVisible();
    const issuesSection = page.locator('div:has-text("감지된 이슈")');
    await expect(issuesSection.getByText(/Connection timeout/)).toBeVisible();
    await expect(issuesSection.getByText(/Payment processing failed/)).toBeVisible();
  });
});

// @feature text2sql
test('Text2SQL should accept a question and generate an SQL query', async ({ page }) => {
  // 1. Navigate to the Text2SQL page
  await test.step('Navigate to the Text2SQL page', async () => {
    await page.goto('/text2sql');
  });

  // 2. Verify the page header
  await test.step('Verify page header', async () => {
    await expect(page.getByRole('heading', { name: 'Text2SQL', level: 1 })).toBeVisible();
  });

  // 3. Locate the question input and type a question
  await test.step('Enter a natural language question', async () => {
    // The placeholder text is not in the context files, so we use a flexible regex.
    const questionInput = page.getByPlaceholder(/질문을 입력하세요/);
    const userQuestion = '활성 사용자들의 평균 주문 금액은?';
    await questionInput.fill(userQuestion);
    await expect(questionInput).toHaveValue(userQuestion);
  });

  // 4. Verify the table schema is visible
  await test.step('Verify table schema is visible', async () => {
    await expect(page.getByRole('heading', { name: '테이블 스키마' })).toBeVisible();
    const schemaEditor = page.locator('div:has-text("테이블 스키마")').getByRole('textbox');
    await expect(schemaEditor).toContainText(/CREATE TABLE users/);
    await expect(schemaEditor).toContainText(/CREATE TABLE orders/);
  });
  
  // 5. Click the generate button
  await test.step('Click the generate SQL button', async () => {
    const generateButton = page.getByRole('button', { name: /SQL 생성/i });
    await generateButton.click();
  });

  // 6. Wait for the result to appear and validate the generated query
  await test.step('Verify the generated SQL query', async () => {
    const generatedSqlHeading = page.getByRole('heading', { name: '생성된 SQL' });
    await expect(generatedSqlHeading).toBeVisible({ timeout: 10000 });
    
    // Scope the search to the results section.
    const resultSection = page.locator('div:has-text("생성된 SQL")');
    const sqlOutputArea = resultSection.getByRole('textbox');
    
    // Assert against the expected query structure, based on mock history in the component.
    await expect(sqlOutputArea).toContainText(/SELECT AVG\(o.price\)/i);
    await expect(sqlOutputArea).toContainText(/FROM orders o/i);
    await expect(sqlOutputArea).toContainText(/JOIN users u ON o.user_id = u.id/i);
    await expect(sqlOutputArea).toContainText(/WHERE u.status = 'active'/i);
  });
});