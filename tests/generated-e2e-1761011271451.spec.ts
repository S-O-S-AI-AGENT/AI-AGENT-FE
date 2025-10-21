import { test, expect } from '@playwright/test';

/**
 * This test suite validates the primary user journey for the AI Project Agent application.
 * It focuses on the "SQL Tuner" feature, as it represents a core functionality of the platform.
 * The test covers navigation from the homepage, interacting with the feature, and validating the output.
 */
test.describe('Primary User Journey: SQL Tuner', () => {
  test('should navigate to the SQL Tuner, input a query, and receive an optimized result', async ({ page }) => {
    // Step 1: Navigate to the application's homepage.
    // We expect the page to load and have the correct title, confirming we're in the right place.
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Project Agent/);
    await expect(page.getByRole('heading', { name: 'AI 기반 개발 및 운영 자동화 에이전트' })).toBeVisible();

    // Step 2: Select the "SQL Tuner" feature from the list on the homepage.
    // We use an accessible role-based selector to find and click the link.
    // This simulates a user choosing a feature to use.
    await page.getByRole('link', { name: 'SQL 튜너' }).click();

    // Step 3: Verify successful navigation to the SQL Tuner page.
    // The URL should be updated, and the main heading of the page should be visible.
    await expect(page).toHaveURL('/sql-tuner');
    await expect(page.getByRole('heading', { name: 'SQL Tuner' })).toBeVisible();

    // Step 4: Input an unoptimized SQL query into the code editor.
    // The application uses a Monaco editor, which doesn't expose a simple textarea role directly.
    // We target the underlying textarea within the editor's DOM structure to reliably input text.
    const unoptimizedQuery = 'SELECT * FROM users WHERE registration_date < \'2023-01-01\';';
    await page.locator('.monaco-editor textarea').first().fill(unoptimizedQuery);

    // Step 5: Trigger the optimization process.
    // We find the primary action button by its role and text content and click it.
    // The button text is in Korean, consistent with the rest of the UI.
    await page.getByRole('button', { name: 'SQL 튜닝 시작' }).click();

    // Step 6: Wait for and validate the results.
    // AI-based operations can take time, so we use a generous timeout for the assertions.
    // Playwright's expect automatically waits for the element to appear.
    // We expect specific headings for the tuned query and its explanation to be visible.
    const resultTimeout = 30000; // 30 seconds
    await expect(page.getByRole('heading', { name: '튜닝된 SQL 쿼리' })).toBeVisible({ timeout: resultTimeout });
    await expect(page.getByRole('heading', { name: '성능 개선 설명' })).toBeVisible();

    // Step 7: Verify the content of the optimized query and the explanation.
    // For the given input, we expect the AI to suggest adding an index on the 'registration_date' column.
    // We check for keywords like 'INDEX' in the generated SQL and related terms in the explanation text.

    // Locate the code block containing the optimized query.
    const optimizedQueryContainer = page.locator('div').filter({ has: page.getByRole('heading', { name: '튜닝된 SQL 쿼리' }) }).locator('pre').first();
    await expect(optimizedQueryContainer).toContainText(/CREATE INDEX/i);
    await expect(optimizedQueryContainer).toContainText(/idx_users_registration_date/i);
    await expect(optimizedQueryContainer).toContainText(/ON users\(registration_date\)/i);

    // Locate the container for the performance explanation.
    const explanationContainer = page.locator('div').filter({ has: page.getByRole('heading', { name: '성능 개선 설명' }) });
    await expect(explanationContainer).toContainText(/인덱스/i); // "index" in Korean
    await expect(explanationContainer).toContainText(/WHERE 절의 `registration_date` 컬럼/i);
    await expect(explanationContainer).toContainText(/Full Table Scan을 피하고/i);
  });
});