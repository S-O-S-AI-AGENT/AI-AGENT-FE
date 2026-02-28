import { test, expect } from "@playwright/test";

/**
 * This test suite validates the primary user journey for the AI Agent application.
 * It focuses on the "E2E 자동 테스터" (E2E Auto Tester) feature, as it's a
 * representative and critical part of the application's functionality.
 */
test.describe("AI Agent Primary User Journey", () => {
  /**
   * This test covers the following steps:
   * 1. Navigating from the homepage to the E2E Tester feature.
   * 2. Verifying that the E2E Tester page loads correctly.
   * 3. Mocking the API call to the AI backend to ensure a deterministic and fast test.
   * 4. Submitting a URL to generate a test.
   * 5. Validating the loading state and the final generated test code display.
   */
  test("should navigate to the E2E Tester, generate a test, and display the result", async ({
    page,
  }) => {
    // Step 1: Visit the homepage.
    // The baseURL is configured in playwright.config.ts, so we can use a relative path.
    await page.goto("/");

    // Step 2: Verify the main heading is visible on the homepage.
    // This confirms that the landing page has loaded correctly.
    await expect(
      page.getByRole("heading", { name: "AI Project Agent", level: 1 })
    ).toBeVisible();

    // Step 3: Find and click the link to the "E2E 자동 테스터" feature.
    // We use a regular expression for the name to avoid a brittle selector if
    // descriptive text within the link changes.
    const e2eTesterLink = page.getByRole("link", { name: /E2E 자동 테스터/ });
    await expect(e2eTesterLink).toBeVisible();
    await e2eTesterLink.click();

    // Step 4: Verify the navigation to the E2E Tester page and its key components.
    await expect(page).toHaveURL("/e2e-tester");
    await expect(
      page.getByRole("heading", { name: "E2E 자동 테스터", level: 1 })
    ).toBeVisible();

    // Check that the progress stepper, a key UI element on this page, is visible.
    await expect(
      page.getByRole("navigation", { name: "Progress" })
    ).toBeVisible();

    // Step 5: Mock the API response to ensure a fast and reliable test.
    // This avoids dependency on the actual backend/AI service, making the test deterministic.
    const mockTestCode = `
import { test, expect } from '@playwright/test';

test('Github main page validation', async ({ page }) => {
  await page.goto('https://github.com');
  await expect(page.getByRole('heading', { name: 'Let’s build from here', level: 1 })).toBeVisible();
});
    `;
    await page.route("**/api/e2e-analyzer", async (route) => {
      // Simulate a small network delay to allow the loading state to be asserted.
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: { testResult: mockTestCode },
      });
    });

    // Step 6: Interact with the form to generate a test.
    // Find the input by its accessible label and fill it with a sample URL.
    const urlInput = page.getByLabel("테스트할 웹사이트 URL");
    await urlInput.fill("https://github.com");
    await expect(urlInput).toHaveValue("https://github.com");

    // Find the button by its role and name, then click it.
    const generateButton = page.getByRole("button", {
      name: "테스트 생성 및 실행",
    });
    await generateButton.click();

    // Step 7: Validate the loading state and final result.
    // After clicking, the button should become disabled, indicating a loading state.
    await expect(generateButton).toBeDisabled();

    // Wait for the result to appear. The application's CodeBlock component renders a <pre> tag.
    const resultBlock = page.locator("pre");
    await expect(resultBlock).toBeVisible();

    // Verify the content of the result block contains our mocked code.
    await expect(resultBlock).toContainText("test('Github main page validation'");
    await expect(resultBlock).toContainText(
      "await page.goto('https://github.com');"
    );

    // After the result is displayed, the button should be enabled again.
    await expect(
      page.getByRole("button", { name: "테스트 생성 및 실행" })
    ).toBeEnabled();
  });
});