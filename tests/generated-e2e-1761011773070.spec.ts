import { test, expect } from '@playwright/test';

/**
 * This test file covers the primary user journey for the AI Project Agent application.
 * The journey starts from the homepage, navigates to a key feature (SQL Tuner),
 * interacts with it, and validates the result.
 */
test.describe('Primary User Journey - SQL Tuner', () => {
  test('should allow a user to navigate to the SQL Tuner, input a query, and receive a tuned result', async ({
    page,
  }) => {
    // Step 1: Navigate to the application's homepage.
    await page.goto('/');

    // Verify that the main heading is visible, confirming the page has loaded correctly.
    // The name is based on the h1 content in src/app/page.tsx.
    await expect(
      page.getByRole('heading', { name: '모든 개발자를 위한 AI 기반 통합 개발 환경' })
    ).toBeVisible();

    // Step 2: Locate and click on the "SQL 튜너" feature card to navigate to its page.
    // Using getByRole('link') is a best practice for accessibility and ensures we're clicking a navigational element.
    const sqlTunerLink = page.getByRole('link', { name: 'SQL 튜너' });
    await expect(sqlTunerLink).toBeVisible();
    await sqlTunerLink.click();

    // Step 3: Verify that the navigation to the SQL Tuner page was successful.
    // We check both the URL and the presence of the page's main heading.
    await expect(page).toHaveURL('/sql-tuner');
    await expect(page.getByRole('heading', { name: 'SQL 튜너' })).toBeVisible();

    // Step 4: Input a sample SQL query into the code editor.
    // The application uses a Monaco editor, which is accessible via the 'textbox' role.
    const queryInput = page.getByRole('textbox');
    await expect(queryInput).toBeVisible();

    const sampleQuery =
      "SELECT * FROM users WHERE last_login < NOW() - INTERVAL '1 year';";
    await queryInput.fill(sampleQuery);

    // Step 5: Click the button to initiate the SQL tuning process.
    // A regular expression is used for the button name to make the test resilient to minor text changes.
    const tuneButton = page.getByRole('button', { name: /SQL 튜닝하기/i });
    await expect(tuneButton).toBeEnabled();
    await tuneButton.click();

    // Step 6: Wait for the AI-generated result and validate it.
    // We expect a loading state, so we'll wait for the result heading to appear.
    // A generous timeout (e.g., 60 seconds) is crucial to accommodate the AI model's response time.
    const resultHeading = page.getByRole('heading', { name: '튜닝된 SQL' });
    await expect(resultHeading).toBeVisible({ timeout: 60000 });

    // Verify that the result area contains a code block and that it is not empty.
    // This confirms that the AI has returned a response. The selector targets the code block
    // associated with the result heading for specificity.
    const resultCodeBlock = page.locator('h3:has-text("튜닝된 SQL") + div pre');
    await expect(resultCodeBlock).toBeVisible();
    await expect(resultCodeBlock).not.toBeEmpty();

    // As a final check, verify that the output contains a common SQL keyword,
    // making the test more robust by confirming the nature of the output.
    await expect(resultCodeBlock).toContainText(/SELECT|INDEX/i);
  });
});