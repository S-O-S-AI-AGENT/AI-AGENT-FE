import { test, expect } from "@playwright/test";

/**
 * This test file validates the primary user journey for the SQL Tuner feature.
 * The flow covers:
 * 1. Navigating from the homepage to the SQL Tuner page.
 * 2. Inputting a non-optimal SQL query.
 * 3. Triggering the AI-powered optimization.
 * 4. Verifying that an optimized SQL query is returned and displayed.
 */
test.describe("Primary User Journey: SQL Tuner", () => {
  test("should allow a user to get an optimized SQL query", async ({ page }) => {
    // Step 1: Navigate to the application's homepage.
    // The test starts at the root of the application.
    await page.goto("/");

    // Verify that the homepage has loaded correctly by checking the title and main heading.
    await expect(page).toHaveTitle(/AI Project Agent/);
    await expect(
      page.getByRole("heading", { name: "AI Project Agent" })
    ).toBeVisible();

    // Step 2: Find and navigate to the "SQL 튜너" (SQL Tuner) feature.
    // We use a role selector to find the link to the feature, which is accessible and robust.
    const sqlTunerLink = page.getByRole("link", { name: /SQL 튜너/ });
    await expect(sqlTunerLink).toBeVisible();
    await sqlTunerLink.click();

    // Step 3: Verify that the navigation to the SQL Tuner page was successful.
    // Check the URL and the presence of the main heading on the new page.
    await expect(page).toHaveURL("/sql-tuner");
    await expect(page.getByRole("heading", { name: "SQL 튜너" })).toBeVisible();

    // Step 4: Input a sample SQL query into the text area.
    // This query is intentionally simple and could be optimized (e.g., by suggesting an index).
    const sampleQuery = "SELECT * FROM products WHERE category = 'electronics';";
    
    // Locate the input text area. We select the first textbox on the page,
    // assuming it's the designated input for the original query.
    const queryInput = page.getByRole("textbox").first();
    await expect(queryInput).toBeVisible();
    await queryInput.fill(sampleQuery);

    // Step 5: Trigger the optimization process.
    // Find the optimization button by its role and text content.
    const optimizeButton = page.getByRole("button", { name: /최적화/ }); // Matches "최적화", "쿼리 최적화", etc.
    await expect(optimizeButton).toBeEnabled();
    await optimizeButton.click();

    // Step 6: Wait for and validate the optimization result.
    // AI processing can take time, so we use an expect-based wait with a generous timeout.
    // We expect a result container (likely a <pre> tag within a specific layout) to become visible.
    // This is more reliable than waiting for a loading spinner to disappear.
    const resultContainer = page.locator('div:has-text("최적화된 SQL 쿼리") + div').locator('pre');

    // Assert that the result container is visible on the page.
    // The timeout is increased to 30 seconds to accommodate for potential API latency.
    await expect(resultContainer).toBeVisible({ timeout: 30000 });

    // Assert that the result contains expected SQL keywords, confirming it's a valid query.
    await expect(resultContainer).toContainText(/SELECT/i);
    await expect(resultContainer).toContainText(/FROM/i);

    // Assert that the result is not the same as the original input,
    // indicating that some form of optimization or reformatting has occurred.
    await expect(resultContainer).not.toHaveText(sampleQuery);
  });
});