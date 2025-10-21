// tests/main-user-journey.spec.ts

import { test, expect } from "@playwright/test";

/**
 * This test suite validates the primary user journey for the AI Project Agent application.
 * It focuses on the "Text2SQL" feature, which is a core functionality.
 * The test covers the flow from the homepage to generating an SQL query and verifying the output.
 */
test.describe("Primary User Journey: Text2SQL Generation", () => {
  test("should allow a user to navigate to Text2SQL, generate a query, and see the result", async ({
    page,
  }) => {
    // Step 1: Navigate to the application's homepage.
    // The baseURL is configured in playwright.config.ts, so we use a relative path.
    await page.goto("/");

    // Step 2: Verify that the homepage has loaded correctly by checking for the main heading.
    // This ensures the application is up and running before we proceed.
    await expect(
      page.getByRole("heading", { name: "S.O.S 팀의 AI Project Agent" })
    ).toBeVisible();

    // Step 3: Find the "Text2SQL" feature card and click on it to navigate to the tool.
    // Using getByRole('link') with a name is a robust and accessible way to select the element.
    const text2sqlLink = page.getByRole("link", { name: "Text2SQL" });
    await expect(text2sqlLink).toBeVisible();
    await text2sqlLink.click();

    // Step 4: Confirm that the navigation to the Text2SQL page was successful.
    // We check both the URL and the page's main heading.
    await expect(page).toHaveURL("/text2sql");
    await expect(
      page.getByRole("heading", { name: "Text2SQL" })
    ).toBeVisible();

    // Step 5: Input a natural language query into the text area.
    // We'll use a placeholder selector, which is common for such input fields.
    // The placeholder text is assumed based on the application's context.
    const naturalLanguageQuery = "Show me all users from California";
    await page
      .getByPlaceholder("예: 2023년에 가입한 사용자 수")
      .fill(naturalLanguageQuery);

    // Step 6: Find and click the button to trigger the SQL generation.
    // The button's name is likely in Korean, matching the app's primary language.
    const generateButton = page.getByRole("button", { name: "SQL 생성" });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();

    // Step 7: Wait for the result and validate the generated SQL.
    // The app will likely show a loading state, then display the result in a code block.
    // We'll wait for the result block to become visible. A longer timeout is used
    // because this step involves an API call to an AI model.
    const resultBlock = page.locator("pre > code");
    await expect(resultBlock).toBeVisible({ timeout: 20000 });

    // Step 8: Assert that the generated code contains the expected SQL syntax.
    // This confirms the AI model is correctly interpreting the natural language input.
    const generatedSQL = await resultBlock.innerText();
    expect(generatedSQL.toUpperCase()).toContain("SELECT");
    expect(generatedSQL.toUpperCase()).toContain("FROM");
    expect(generatedSQL.toUpperCase()).toContain("USERS"); // Assuming a 'users' table
    expect(generatedSQL.toLowerCase()).toContain("california");
  });
});