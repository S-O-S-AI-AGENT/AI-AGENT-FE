import { test, expect } from "@playwright/test";

/**
 * This test suite validates the primary user journey for the AI Project Agent application.
 * It covers navigating from the homepage to a specific feature (SQL Tuner),
 * using the feature, and verifying that a result is produced.
 */
test.describe("Primary User Journey - SQL Tuner", () => {
  // Define a longer timeout for this test suite to accommodate AI API response times.
  test.setTimeout(60000);

  test("should allow a user to navigate to the SQL Tuner, input a query, and receive an optimized result", async ({
    page,
  }) => {
    // 1. Navigate to the application's homepage.
    // The baseURL is configured in playwright.config.ts, so we can use a relative path.
    await page.goto("/");

    // 2. Verify that the homepage has loaded correctly.
    // We expect to see the main heading of the application.
    await expect(
      page.getByRole("heading", { name: "AI 기반 개발 및 운영 자동화 에이전트" })
    ).toBeVisible();

    // 3. Find and click on the "SQL 튜너" feature card to navigate to its page.
    // Using getByRole('link') is a robust way to select navigation elements.
    await page.getByRole("link", { name: /SQL 튜너/ }).click();

    // 4. Validate the navigation to the SQL Tuner page.
    // Check if the URL is correct and the page heading is visible.
    await expect(page).toHaveURL("/sql-tuner");
    await expect(
      page.getByRole("heading", { name: "SQL 튜너" })
    ).toBeVisible();

    // 5. Input a sample inefficient SQL query into the text editor.
    // The Monaco editor used in the app is accessible via the 'textbox' role.
    const inefficientQuery =
      "SELECT * FROM products WHERE category_id = (SELECT id FROM categories WHERE name = 'Electronics');";
    await page
      .getByRole("textbox")
      .fill(inefficientQuery);

    // 6. Click the button to submit the query for optimization.
    // The button is identified by its text content.
    await page.getByRole("button", { name: "쿼리 최적화" }).click();

    // 7. Wait for the optimization results to appear.
    // The application will show a loading state and then display the results.
    // We wait for the "Optimized Query" heading to become visible, which indicates
    // the AI has responded. A generous timeout is used for the API call.
    const optimizedQueryHeader = page.getByRole("heading", {
      name: "최적화된 쿼리",
    });
    await expect(optimizedQueryHeader).toBeVisible({ timeout: 30000 });

    // 8. Verify that the result contains an optimized query in a code block.
    // We check for the presence of a <pre> element (commonly used for code blocks)
    // following the result heading and ensure it's not empty.
    // A common optimization for this type of query is to use a JOIN.
    const resultBlock = page.locator("pre").first();
    await expect(resultBlock).toBeVisible();
    await expect(resultBlock).not.toBeEmpty();
    await expect(resultBlock).toContainText(/JOIN/i);

    // 9. Verify that an explanation for the optimization is also provided.
    const explanationHeader = page.getByRole("heading", { name: "상세 설명" });
    await expect(explanationHeader).toBeVisible();

    // Check that the explanation text is present and not empty.
    const explanationText = explanationHeader.locator("..").locator("p");
    await expect(explanationText).toBeVisible();
    await expect(explanationText).not.toBeEmpty();
  });
});