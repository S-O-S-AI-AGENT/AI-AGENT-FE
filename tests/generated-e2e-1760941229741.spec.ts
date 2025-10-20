import { test, expect } from '@playwright/test';

/**
 * @fileoverview This test file covers the primary user journey for the SQL Tuner feature.
 * It simulates a user starting from the homepage, navigating to the SQL Tuner,
 * submitting a query for optimization, and verifying the returned results.
 */

// Define a test suite for the primary user journey.
test.describe('Primary User Journey: SQL Tuner', () => {

  // The main test case for the end-to-end flow.
  test('should allow a user to navigate to SQL Tuner, input a query, and receive an optimized result', async ({ page }) => {
    
    // Step 1: Navigate to the application's homepage.
    // The baseURL is configured in playwright.config.ts, so we just use '/'.
    await page.goto('/');
    
    // Step 2: Verify the homepage has loaded correctly by checking for a key feature link.
    // We use getByRole for accessibility and a regular expression for flexibility in the text.
    const sqlTunerLink = page.getByRole('link', { name: /SQL 튜너/i });
    await expect(sqlTunerLink).toBeVisible();

    // Step 3: Click the "SQL 튜너" link to go to the feature page.
    await sqlTunerLink.click();

    // Step 4: Validate that the navigation was successful.
    // Check if the URL is correct and the main heading of the page is visible.
    await expect(page).toHaveURL('/sql-tuner');
    await expect(page.getByRole('heading', { name: 'SQL 튜너' })).toBeVisible();

    // Step 5: Input a sample inefficient SQL query into the code editor.
    // The Monaco editor used in the app is accessible via the 'textbox' role.
    const inefficientQuery = "SELECT * FROM employees WHERE department = 'Sales' AND start_date < '2022-01-01';";
    await page.getByRole('textbox').fill(inefficientQuery);
    
    // Step 6: Find and click the button to trigger the AI-powered tuning process.
    // The button text is likely to be related to starting the tuning.
    await page.getByRole('button', { name: /쿼리 튜닝 시작/i }).click();

    // Step 7: Wait for the analysis to complete and the results to be displayed.
    // It's good practice to first assert that a loading state appears.
    // This confirms the submission was successful. We'll look for text like "분석 중..." (Analyzing...).
    await expect(page.getByText(/분석 중...|튜닝 중.../i)).toBeVisible();

    // Now, wait for the result to appear. AI responses can take time, so we
    // provide a generous timeout for this expectation. We expect the loading text
    // to disappear and a results heading to become visible.
    const resultHeading = page.getByRole('heading', { name: '튜닝 결과' });
    await expect(resultHeading).toBeVisible({ timeout: 60000 }); // 60-second timeout for the AI API call

    // Step 8: Validate the content of the optimization result.
    // A good result should include sections for the optimized query and an explanation.
    await expect(page.getByText(/최적화된 SQL 쿼리/i)).toBeVisible();
    await expect(page.getByText(/성능 개선 제안/i)).toBeVisible();

    // The most common optimization for the sample query is to add a composite index.
    // We verify that the suggestion contains a 'CREATE INDEX' statement.
    // Results are typically displayed in `<code>` blocks.
    const resultCodeBlock = page.locator('pre code').first();
    await expect(resultCodeBlock).toBeVisible();
    await expect(resultCodeBlock).toContainText(/CREATE INDEX/i, { timeout: 10000 });
    await expect(resultCodeBlock).toContainText(/ON employees \(department, start_date\)/i);
  });
});