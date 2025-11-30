import { test, expect } from "@playwright/test";

/**
 * This test suite covers the primary end-to-end user journey for the AI Project Agent.
 * It focuses on the "SQL Tuner" feature, as it represents a core value proposition of the app.
 * The flow validates:
 * 1. Landing on the homepage and viewing available features.
 * 2. Navigating to the SQL Tuner page.
 * 3. Submitting an SQL query for optimization.
 * 4. Receiving and validating the AI-generated optimization result.
 */
test.describe("E2E: SQL Tuner Primary User Journey", () => {
  test("should allow a user to navigate to SQL Tuner, input a query, and receive an optimization", async ({
    page,
  }) => {
    // Step 1: Navigate to the application's homepage.
    // The baseURL is configured in playwright.config.ts, so we just use '/'.
    await page.goto("/");

    // Step 2: Verify the homepage has loaded and the SQL Tuner feature is visible.
    // We use accessible roles for robust selectors. The main heading should be present.
    await expect(
      page.getByRole("heading", { name: "AI Project Agent" })
    ).toBeVisible();

    // Find the link to the SQL Tuner feature by its text content.
    const sqlTunerLink = page.getByRole("link", { name: "SQL 튜너" });
    await expect(sqlTunerLink).toBeVisible();
    await expect(
      page.getByText("AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다.")
    ).toBeVisible();

    // Step 3: Click on the SQL Tuner feature card to navigate to its dedicated page.
    await sqlTunerLink.click();

    // Step 4: Verify the URL has changed and the SQL Tuner page content is visible.
    await expect(page).toHaveURL("/sql-tuner");
    await expect(
      page.getByRole("heading", { name: "SQL 튜너", level: 1 })
    ).toBeVisible();

    // Step 5: Input a sample unoptimized SQL query into the code editor.
    // The app uses Monaco Editor, which we can identify by its class. We target the first instance for input.
    const inputQuery =
      "SELECT id, name, email FROM customers WHERE registration_date < '2022-01-01';";
    const inputEditor = page.locator(".monaco-editor").first();
    
    // It's good practice to ensure the editor is ready and focused before typing.
    await inputEditor.click();
    
    // Clear any existing content and type the new query.
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+A' : 'Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(inputQuery);

    // Assert that the query was entered correctly.
    await expect(inputEditor).toContainText(inputQuery);

    // Step 6: Find and click the optimization button to start the AI analysis.
    const optimizeButton = page.getByRole("button", { name: /SQL 최적화/i });
    await expect(optimizeButton).toBeEnabled();
    await optimizeButton.click();

    // Step 7: Wait for the AI analysis to start and complete.
    // A loading indicator is expected to appear while the API call is in progress.
    // A generous timeout is necessary for potentially slow AI-based operations.
    const loadingIndicator = page.getByText(/AI가 쿼리를 분석하고/i);
    await expect(loadingIndicator).toBeVisible({ timeout: 10000 });

    // Wait for the loading indicator to disappear, signifying the process is complete.
    await expect(loadingIndicator).toBeHidden({ timeout: 60000 });

    // Step 8: Check the result editor for the optimized query.
    // The result should appear in the second Monaco editor instance on the page.
    const resultEditor = page.locator(".monaco-editor").nth(1);

    // The result editor must be visible and contain expected SQL keywords.
    // The exact AI output can be non-deterministic, so we check for key elements rather than a fixed string.
    await expect(resultEditor).toBeVisible({ timeout: 10000 });
    await expect(resultEditor).toContainText(/SELECT/i);
    await expect(resultEditor).toContainText(/FROM customers/i);

    // A crucial check is that the output is not empty and is different from the original input,
    // which indicates that a transformation or analysis has occurred.
    await expect(resultEditor.innerText()).not.toBe(inputQuery);
    await expect(resultEditor.innerText()).not.toBe("");
  });
});