import { test, expect } from "@playwright/test";

/**
 * This test suite covers the primary user journey for the AI Project Agent application.
 * It validates the flow from the landing page to using a core feature (SQL Tuner)
 * and receiving a valid result, which demonstrates the application's main value.
 */
test.describe("Primary User Journey: SQL Tuner", () => {
  test("should navigate from homepage, use the SQL Tuner, and receive an optimized query", async ({
    page,
  }) => {
    // Step 1: Visit the landing page and verify its content.
    // The journey starts at the root of the application, which serves as the main hub.
    await page.goto("/");

    // Verify the main heading is visible to ensure the page has loaded correctly
    // before we proceed. This is a basic but crucial health check.
    await expect(
      page.getByRole("heading", { name: "AI Project Agent" })
    ).toBeVisible();

    // Step 2: Navigate from the homepage to the SQL Tuner feature.
    // The user identifies the desired tool and clicks on its card to navigate.
    // We use an accessible role selector to find the link by its visible name.
    await page.getByRole("link", { name: "SQL 튜너" }).click();

    // Assert that the navigation was successful by checking the URL and the page title.
    // This confirms that the correct page for the feature has been loaded.
    await expect(page).toHaveURL("/sql-tuner");
    await expect(
      page.getByRole("heading", { name: "SQL Tuner" })
    ).toBeVisible();

    // Step 3: Input a non-optimal SQL query into the editor.
    // The application uses a Monaco editor, which Playwright typically sees as a textbox.
    // We target the first textbox, assuming it's the input area.
    const sqlToOptimize =
      "SELECT * FROM employees WHERE department = 'Sales' AND salary > 50000;";
    await page.getByRole("textbox").first().fill(sqlToOptimize);

    // Verify that the query was entered correctly into the input field.
    await expect(page.getByRole("textbox").first()).toHaveValue(sqlToOptimize);

    // Step 4: Trigger the query tuning process.
    // The user clicks the main action button to submit the query for AI analysis.
    // We use a regular expression to make the selector robust against minor text changes.
    await page.getByRole("button", { name: /쿼리 튜닝|Tune Query/i }).click();

    // Step 5: Wait for and validate the optimized result.
    // After submission, the app calls an API. We need to wait for the response.
    // The result will appear in a separate output area, likely the second textbox/editor.
    const resultEditor = page.getByRole("textbox").nth(1);

    // We use an expect-based wait with a generous timeout to handle varying API response times.
    // A common AI optimization for this query is to suggest creating an index.
    // We assert that the output contains this keyword as a sign of a successful analysis.
    await expect(resultEditor).toContainText(/CREATE INDEX/i, {
      timeout: 30000,
    });

    // Further validation to ensure the output is meaningful and different from the input.
    const resultValue = await resultEditor.inputValue();
    expect(resultValue).not.toEqual(sqlToOptimize);
    expect(resultValue.length).toBeGreaterThan(sqlToOptimize.length);

    // Finally, confirm that the result editor containing the optimized query is visible to the user.
    await expect(resultEditor).toBeVisible();
  });
});