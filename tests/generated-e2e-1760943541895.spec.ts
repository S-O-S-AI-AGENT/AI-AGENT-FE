import { test, expect } from "@playwright/test";

/**
 * This test suite validates the primary user journey for the SQL Tuner feature.
 * It covers the end-to-end flow from the homepage to receiving an optimized SQL query.
 */
test.describe("E2E: SQL Tuner Primary User Journey", () => {
  test("should navigate to SQL Tuner, submit a query, and receive an optimized result", async ({ page }) => {
    // Step 1: Start at the application's homepage.
    // Comments: We begin the journey where a typical user would, at the root URL.
    await page.goto("/");

    // Step 2: Verify that the main heading of the homepage is visible.
    // Comments: This confirms the page has loaded correctly before we proceed.
    // We use getByRole for accessibility and robustness.
    await expect(
      page.getByRole("heading", { name: "AI Project Agent" })
    ).toBeVisible();

    // Step 3: Locate the "SQL 튜너" feature card and click on it to navigate.
    // Comments: This simulates the user selecting the feature they want to use.
    // The link is identified by its accessible name, which is the text content.
    const sqlTunerLink = page.getByRole("link", { name: "SQL 튜너" });
    await expect(sqlTunerLink).toBeVisible();
    await sqlTunerLink.click();

    // Step 4: Verify that the URL has changed to the SQL Tuner page.
    // Comments: This assertion ensures the navigation was successful.
    await expect(page).toHaveURL("/sql-tuner");
    await expect(
      page.getByRole("heading", { name: "SQL 튜너" })
    ).toBeVisible();

    // Step 5: Input an inefficient SQL query into the code editor.
    // Comments: We prepare the input for the core feature action.
    // The Monaco editor component is accessible via the 'textbox' role.
    const inefficientQuery =
      "SELECT * FROM products WHERE category_id = 123 AND in_stock = true;";
    const queryEditor = page.getByRole("textbox");
    await expect(queryEditor).toBeVisible();
    await queryEditor.fill(inefficientQuery);

    // Step 6: Click the "SQL 튜닝" button to submit the query for optimization.
    // Comments: This triggers the main action of the page.
    const tuneButton = page.getByRole("button", { name: "SQL 튜닝" });
    await expect(tuneButton).toBeEnabled();
    await tuneButton.click();

    // Step 7: Wait for the loading indicator to appear.
    // Comments: This confirms that the application has started processing the request.
    // We use a specific data-testid for the loading spinner for a reliable selection.
    const loadingSpinner = page.getByTestId("loading-spinner");
    await expect(loadingSpinner).toBeVisible();

    // Step 8: Wait for the result container to become visible.
    // Comments: This is the most crucial part of the test. We wait for the AI-generated
    // response. A long timeout is used because AI API calls can be slow.
    const resultContainer = page.locator("div:has-text('Tuned SQL')");
    await expect(resultContainer).toBeVisible({ timeout: 30000 });

    // Step 9: Verify that the loading indicator has disappeared after the result is shown.
    // Comments: This ensures a good user experience where loading states are correctly managed.
    await expect(loadingSpinner).not.toBeVisible();

    // Step 10: Validate the content of the optimized query.
    // Comments: We check that the result is present, different from the input,
    // and contains expected optimization advice (e.g., suggesting an index).
    const resultCodeBlock = resultContainer.locator("code");
    await expect(resultCodeBlock).toBeVisible();

    // The result should not be empty.
    await expect(resultCodeBlock).not.toBeEmpty();

    // The optimized output should be different from the original inefficient query.
    const optimizedQueryText = await resultCodeBlock.innerText();
    expect(optimizedQueryText).not.toEqual(inefficientQuery);

    // Check for common optimization keywords. This makes the test robust against
    // minor variations in the AI's output.
    await expect(resultCodeBlock).toContainText(/INDEX/i);
  });
});