import { test, expect } from '@playwright/test';

test.describe('AI Agent Core User Journey', () => {
  test('should navigate to the SQL Tuner, input a query, and receive an optimized result', async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto('/');

    // 2. Verify the main heading is visible
    await expect(page.getByRole('heading', { name: 'AI Project Agent' })).toBeVisible();

    // 3. Find the "SQL 튜너" feature card and click on it
    const sqlTunerLink = page.getByRole('link', { name: 'SQL 튜너' });
    await expect(sqlTunerLink).toBeVisible();
    await sqlTunerLink.click();

    // 4. Verify the navigation to the SQL Tuner page
    await expect(page).toHaveURL('/sql-tuner');
    await expect(page.getByRole('heading', { name: 'SQL 튜너' })).toBeVisible();

    // 5. Enter a sample SQL query into the input area
    // Assuming the code editor component has a 'textbox' role
    const slowQuery = `SELECT * FROM products WHERE category = 'electronics' AND in_stock = false;`;
    await page.getByRole('textbox').first().fill(slowQuery);

    // 6. Find and click the analysis/optimization button
    // Using a regex to match button text like "분석하기" or "최적화"
    const analyzeButton = page.getByRole('button', { name: /분석|최적화|생성/i });
    await expect(analyzeButton).toBeEnabled();
    await analyzeButton.click();

    // 7. Wait for the result to appear and verify its content
    // AI responses can be slow, so we use a generous timeout.
    // We expect a heading like "분석 결과" to appear first.
    const resultHeading = page.getByRole('heading', { name: /결과|최적화된 쿼리/i });
    await expect(resultHeading).toBeVisible({ timeout: 20000 });

    // 8. Check that the result code block is visible and contains an optimization suggestion
    // We locate the code block (likely a <pre> tag) that appears after the result heading
    const resultCodeBlock = page.locator('div:has-text("분석 결과") + div pre').first();
    await expect(resultCodeBlock).toBeVisible();
    await expect(resultCodeBlock).not.toBeEmpty();
    
    // A common optimization suggestion is to create an index. We check for this keyword.
    await expect(resultCodeBlock).toContainText(/CREATE INDEX/i, { timeout: 10000 });
  });

  test('should navigate to the Text2SQL page and generate a SQL query', async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto('/');

    // 2. Find the "Text2SQL" feature card and click on it
    const text2sqlLink = page.getByRole('link', { name: 'Text2SQL' });
    await expect(text2sqlLink).toBeVisible();
    await text2sqlLink.click();

    // 3. Verify the navigation to the Text2SQL page
    await expect(page).toHaveURL('/text2sql');
    await expect(page.getByRole('heading', { name: 'Text2SQL' })).toBeVisible();
    
    // 4. Enter a natural language question into the input area
    const naturalLanguageQuery = '2024년에 가입한 사용자들의 이메일 주소를 보여줘';
    await page.getByRole('textbox').first().fill(naturalLanguageQuery);

    // 5. Find and click the generate button
    const generateButton = page.getByRole('button', { name: /생성|변환|실행/i });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();

    // 6. Wait for the generated SQL query to appear and verify its content
    const resultHeading = page.getByRole('heading', { name: /생성된 쿼리|결과/i });
    await expect(resultHeading).toBeVisible({ timeout: 15000 });

    const resultCodeBlock = page.locator('div:has-text("생성된 쿼리") + div pre').first();
    await expect(resultCodeBlock).toBeVisible();
    
    // Check if the generated query contains expected SQL keywords
    await expect(resultCodeBlock).toContainText(/SELECT/i);
    await expect(resultCodeBlock).toContainText(/FROM/i);
    await expect(resultCodeBlock).toContainText(/WHERE/i);
    await expect(resultCodeBlock).toContainText(/2024/);
  });
});