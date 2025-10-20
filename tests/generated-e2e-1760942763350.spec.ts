import { test, expect } from "@playwright/test";

/**
 * This test suite validates the primary user journey for the AI Project Agent application.
 * It focuses on the "SQL Tuner" feature, as it represents a core input-process-output flow.
 *
 * The journey covers:
 * 1. Landing on the homepage.
 * 2. Navigating to the SQL Tuner tool.
 * 3. Submitting an SQL query for optimization.
 * 4. Verifying that the optimized query and an explanation are successfully generated and displayed.
 */
test.describe("Primary User Journey: SQL Tuner", () => {
  test("should allow a user to optimize an SQL query and see the results", async ({
    page,
  }) => {
    // Step 1: Navigate to the application's homepage.
    await page.goto("/");

    // Step 2: Verify that the main heading and description are visible on the homepage.
    // This confirms the page has loaded correctly.
    await expect(
      page.getByRole("heading", { name: "AI Project Agent" })
    ).toBeVisible();
    await expect(
      page.getByText(
        "1인 기업과 중소기업을 위한 AI 기반 개발 및 운영 자동화 솔루션"
      )
    ).toBeVisible();

    // Step 3: Locate and click on the "SQL 튜너" feature card to navigate to the tool.
    // We use a role selector for accessibility, targeting the link associated with the SQL Tuner.
    const sqlTunerLink = page.getByRole("link", { name: /SQL 튜너/ });
    await expect(sqlTunerLink).toBeVisible();
    await sqlTunerLink.click();

    // Step 4: Verify that the navigation to the SQL Tuner page was successful.
    // Check the URL and the presence of the page-specific heading.
    await expect(page).toHaveURL("/sql-tuner");
    await expect(
      page.getByRole("heading", { name: "SQL 튜너" })
    ).toBeVisible();

    // Step 5: Input a sample SQL query into the textarea.
    // Using a placeholder selector is a good way to find form elements.
    const sampleQuery =
      "SELECT name, email FROM users u JOIN orders o ON u.id = o.user_id WHERE o.amount > 1000;";
    await page
      .getByPlaceholder("최적화할 SQL 쿼리를 입력하세요.")
      .fill(sampleQuery);

    // Step 6: Click the "최적화" (Optimize) button to submit the query.
    const optimizeButton = page.getByRole("button", { name: "최적화" });
    await optimizeButton.click();

    // Step 7: Wait for the optimization results to appear.
    // AI-based API calls can take time, so we use an expect-based wait with an increased timeout.
    // We wait for the "최적화된 SQL" (Optimized SQL) heading to become visible.
    const optimizedSqlHeading = page.getByRole("heading", {
      name: "최적화된 SQL",
    });
    await expect(optimizedSqlHeading).toBeVisible({ timeout: 20000 });

    // Step 8: Verify that both the optimized SQL and the explanation sections are displayed.
    const explanationHeading = page.getByRole("heading", {
      name: "최적화 설명",
    });
    await expect(explanationHeading).toBeVisible();

    // Step 9: Validate that the result containers have content.
    // We locate the container div that is the next sibling of the heading.
    // This is a robust way to associate content with its label.
    const optimizedResultContainer = optimizedSqlHeading.locator(
      "xpath=./following-sibling::div[1]"
    );
    await expect(optimizedResultContainer).toBeVisible();
    await expect(optimizedResultContainer).not.toBeEmpty(); // Ensures the code block rendered something.

    const explanationContainer = explanationHeading.locator(
      "xpath=./following-sibling::div[1]"
    );
    await expect(explanationContainer).toBeVisible();
    await expect(explanationContainer).not.toBeEmpty(); // Ensures the explanation text is present.

    // Step 10: Confirm the "Optimize" button is enabled again, indicating the process is complete.
    await expect(optimizeButton).toBeEnabled();
  });
});