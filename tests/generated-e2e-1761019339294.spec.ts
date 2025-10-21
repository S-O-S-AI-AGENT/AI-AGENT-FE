import { test, expect } from "@playwright/test";

test.describe("Primary User Journey: SQL Tuner", () => {
  test("should navigate from home, analyze a SQL query, and display optimization results", async ({
    page,
  }) => {
    // Step 1: Navigate to the application's landing page.
    await page.goto("/");

    // Verify that the main heading is visible, confirming the page has loaded correctly.
    // We use getByRole with a specific name and ARIA level for a precise and accessible locator.
    await expect(
      page.getByRole("heading", {
        name: "AI 기반 개발 및 운영 자동화 플랫폼",
        level: 1,
      })
    ).toBeVisible();

    // Step 2: Select and navigate to the "SQL Tuner" feature.
    // The feature cards are links. We locate the correct one by its accessible name, which includes the title.
    await page.getByRole("link", { name: /SQL 튜너/ }).click();

    // Verify successful navigation by checking the URL and the page's main heading.
    await expect(page).toHaveURL("/sql-tuner");
    await expect(
      page.getByRole("heading", { name: "SQL 튜너", level: 1 })
    ).toBeVisible();

    // Step 3: Input a sample SQL query into the designated textarea.
    const sqlQueryToAnalyze = `
      SELECT 
        u.id, 
        u.name, 
        COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.created_at >= '2024-01-01'
      GROUP BY u.id
      HAVING COUNT(o.id) > 5
      ORDER BY order_count DESC;
    `;
    // We use getByPlaceholder to find the input area, which is a robust selector for form fields.
    await page.getByPlaceholder("코드를 입력하세요...").fill(sqlQueryToAnalyze);

    // Step 4: Initiate the analysis process.
    // Locate the "Analyze" button by its role and accessible name and click it.
    await page.getByRole("button", { name: "분석하기" }).click();

    // Step 5: Validate the results displayed on the page after the analysis.
    // Playwright's 'expect' assertions have a built-in wait mechanism, which handles the
    // asynchronous nature of the analysis (simulated API call) without needing explicit waits.

    // Confirm that the "Optimized SQL" section has appeared.
    await expect(
      page.getByRole("heading", { name: "최적화된 SQL", level: 3 })
    ).toBeVisible();

    // Confirm that the "Performance Improvement Suggestions" section has appeared.
    await expect(
      page.getByRole("heading", { name: "성능 개선 제안", level: 3 })
    ).toBeVisible();

    // Verify a specific, key piece of text from the analysis results to ensure the logic executed correctly.
    // This checks for a recommendation related to index optimization.
    await expect(
      page.getByText(
        "user_id와 status에 복합 인덱스를 추가하면 조인 성능이 85% 향상됩니다."
      )
    ).toBeVisible();

    // Verify that the optimized SQL code block contains the expected index recommendation comment.
    // Using a regular expression allows for a flexible yet precise match of the code content.
    await expect(
      page.getByText(
        /CREATE INDEX idx_orders_user_status ON orders\(user_id, status\);/
      )
    ).toBeVisible();
  });
});