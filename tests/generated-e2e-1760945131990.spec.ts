import { test, expect } from "@playwright/test";

/**
 * This test suite validates the primary user journey for the AI Agent application,
 * focusing on the SQL Tuner feature.
 */
test.describe("Primary User Journey: SQL Tuner", () => {
  /**
   * This test covers the end-to-end flow from the landing page to the SQL Tuner,
   * where a user inputs a query, requests optimization, and validates the output.
   */
  test("should allow a user to navigate to the SQL Tuner, input a query, and receive an optimized result", async ({
    page,
  }) => {
    // Step 1: Navigate to the homepage
    // The test starts by visiting the root of the application.
    await page.goto("/");

    // Step 2: Verify the main heading on the homepage is visible
    // This confirms that the landing page has loaded correctly.
    await expect(
      page.getByRole("heading", { name: "AI 기반 개발자 워크플로우 자동화", level: 1 })
    ).toBeVisible();

    // Step 3: Navigate to the SQL Tuner feature page
    // We locate the link to the SQL Tuner by its href attribute for robustness
    // and click it to proceed to the feature page.
    await page.locator('a[href="/sql-tuner"]').click();

    // Step 4: Verify the navigation was successful by checking the URL and page heading
    // This ensures we are on the correct page before interacting with its elements.
    await expect(page).toHaveURL("/sql-tuner");
    await expect(
      page.getByRole("heading", { name: "SQL Tuner", level: 1 })
    ).toBeVisible();

    // Step 5: Input an unoptimized SQL query into the editor
    // We define a sample query and locate the input editor associated with the
    // "Original SQL Query" heading to enter the text.
    const originalQuery =
      "SELECT * FROM users WHERE last_login < NOW() - INTERVAL '1 YEAR';";
    
    // Locate the section for the original query using its heading
    const originalQuerySection = page.locator("div").filter({
      has: page.getByRole("heading", { name: "Original SQL Query" }),
    });
    
    // Fill the text area within that section. The Monaco editor component uses a 'textbox' role.
    await originalQuerySection.getByRole("textbox").fill(originalQuery);
    
    // A quick check to ensure the text was entered correctly
    await expect(originalQuerySection.getByRole("textbox")).toHaveValue(originalQuery);

    // Step 6: Click the "Optimize SQL" button to submit the query
    // We use a role selector to find the button, which is accessible and user-friendly.
    await page.getByRole("button", { name: "Optimize SQL" }).click();

    // Step 7: Wait for and validate the optimized result
    // The API call to the AI model can take some time. We wait for the result
    // section to become visible. We increase the timeout to account for network
    // and AI processing latency.
    const optimizedQuerySection = page.locator("div").filter({
      has: page.getByRole("heading", { name: "Optimized Query" }),
    });

    // The result is displayed in a CodeBlock, which renders a 'code' role.
    // We wait up to 30 seconds for this element to appear.
    const optimizedResultBlock = optimizedQuerySection.getByRole("code");
    await expect(optimizedResultBlock).toBeVisible({ timeout: 30000 });

    // Step 8: Perform assertions on the result
    // We check that the optimized query is not empty and contains SQL-like keywords,
    // confirming that a valid-looking result was returned.
    const resultContent = await optimizedResultBlock.innerText();
    expect(resultContent).not.toBe("");
    expect(resultContent).not.toBe(originalQuery);
    expect(resultContent.toUpperCase()).toContain("SELECT");
  });
});