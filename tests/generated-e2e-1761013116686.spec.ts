import { test, expect } from "@playwright/test";

test.describe("Primary User Journey: SQL Tuner", () => {
  test("should navigate from homepage, analyze an SQL query, and display optimization results", async ({
    page,
  }) => {
    // 1. Navigate to the application's homepage.
    // The test starts by visiting the root URL.
    await page.goto("/");

    // 2. Verify that the main heading on the homepage is visible.
    // This confirms that the landing page has loaded correctly before proceeding.
    // The heading text is in Korean based on the source code.
    await expect(
      page.getByRole("heading", {
        name: "AI 기반 개발 및 운영 자동화 솔루션",
        level: 1,
      }),
    ).toBeVisible();

    // 3. Locate the "SQL Tuner" feature card and click it to navigate to the tool.
    // We use a regular expression to make the selector for the link more resilient.
    // The accessible name includes the card's title and description.
    const sqlTunerLink = page.getByRole("link", { name: /SQL 튜너/ });
    await sqlTunerLink.click();

    // 4. Validate the URL and the main heading of the SQL Tuner page.
    // This ensures the navigation was successful.
    await expect(page).toHaveURL("/sql-tuner");
    await expect(
      page.getByRole("heading", { name: "SQL Tuner", level: 1 }),
    ).toBeVisible();

    // 5. Input a sample non-optimized SQL query into the editor.
    // The application uses a Monaco editor, which requires clicking to focus
    // and then typing the content. We target the first editor instance for input.
    const originalSql =
      'SELECT * FROM employees WHERE department = \'Sales\' AND salary > 50000;';
    const inputEditor = page.locator(".monaco-editor").first();
    await inputEditor.click();
    await page.keyboard.type(originalSql);

    // 6. Find the 'Analyze' button and click it to submit the query.
    // A regular expression is used for the button name to accommodate potential text variations.
    await page
      .getByRole("button", { name: /쿼리 최적화|Analyze/i })
      .click();

    // 7. Verify that a loading indicator appears while the AI is processing.
    // This confirms that the request has been sent. We assume an accessible
    // role='status' is used for the loading spinner.
    await expect(
      page.getByRole("status", { name: /Analyzing|Loading/i }),
    ).toBeVisible();

    // 8. Wait for the analysis result and validate the output.
    // We target the second Monaco editor instance for the output. The key validation
    // is to check for an optimization suggestion, like creating an 'INDEX'.
    // A generous timeout is provided to allow for the AI model's response time.
    const outputEditor = page.locator(".monaco-editor").last();
    await expect(outputEditor).toContainText(/INDEX/i, { timeout: 60000 });

    // 9. Confirm that the optimized SQL is not empty and contains the original table name.
    await expect(outputEditor).toContainText(/employees/);
    const outputText = await outputEditor.innerText();
    expect(outputText.trim()).not.toBe("");

    // 10. Finally, ensure the loading indicator has disappeared after the result is displayed.
    await expect(
      page.getByRole("status", { name: /Analyzing|Loading/i }),
    ).toBeHidden();
  });
});