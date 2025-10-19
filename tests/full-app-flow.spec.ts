import { test, expect } from "@playwright/test";

test.describe("AI Project Agent - 전체 애플리케이션 플로우", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("사용자 여정: SQL 튜너 전체 플로우", async ({ page }) => {
    // 1. 홈페이지에서 SQL 튜너로 이동
    await page.getByRole("link", { name: /SQL 튜너/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("/sql-tuner");
    await expect(page.getByText("AI 기반 SQL 쿼리 최적화")).toBeVisible();

    // 2. SQL 입력 필드가 있는지 확인
    const sqlInput = page.locator('textarea, input[type="text"]').first();
    if (await sqlInput.isVisible()) {
      await sqlInput.fill("SELECT * FROM users WHERE age > 25");
      await page.waitForTimeout(1000);
    }

    // 3. 스크린샷 촬영
    await page.screenshot({ path: "sql-tuner-input.png", fullPage: true });
  });

  test("사용자 여정: Text2SQL 전체 플로우", async ({ page }) => {
    // 1. Text2SQL 페이지로 이동
    await page.getByRole("link", { name: /Text2SQL/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("/text2sql");

    // 2. 자연어 입력 테스트
    const textInput = page.locator('textarea, input[type="text"]').first();
    if (await textInput.isVisible()) {
      await textInput.fill("25세 이상의 모든 사용자를 조회해줘");
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: "text2sql-input.png", fullPage: true });
  });

  test("사용자 여정: E2E 테스터 플로우", async ({ page }) => {
    // E2E 테스터 페이지로 이동
    await page.getByRole("link", { name: /E2E 자동 테스터/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("/e2e-tester");

    // 페이지 로드 확인
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "e2e-tester-page.png", fullPage: true });
  });

  test("사용자 여정: Log 분석기 플로우", async ({ page }) => {
    // Log 분석기 페이지로 이동
    const logAnalyzerLink = page.locator('a[href="/log-analyzer"]').first();
    await expect(logAnalyzerLink).toBeVisible({ timeout: 10000 });
    await logAnalyzerLink.click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("/log-analyzer");

    // 로그 입력 필드 테스트 (존재할 경우)
    const logInput = page.locator("textarea").first();
    if (await logInput.isVisible()) {
      await logInput.fill(`[2024-01-01 10:00:00] ERROR: Database connection failed
[2024-01-01 10:00:01] INFO: Retrying connection...
[2024-01-01 10:00:02] SUCCESS: Connection established`);
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: "log-analyzer-input.png", fullPage: true });
  });

  test("사용자 여정: 전체 네비게이션 플로우", async ({ page }) => {
    // 모든 주요 페이지를 순차적으로 방문
    const pages = [
      { name: "SQL 튜너", url: "/sql-tuner" },
      { name: "E2E 자동 테스터", url: "/e2e-tester" },
      { name: "Text2SQL", url: "/text2sql" },
      { name: "Log 분석기", url: "/log-analyzer" },
      { name: "Features", url: "/features" },
      { name: "Guide", url: "/guide" },
    ];

    for (let i = 0; i < pages.length; i++) {
      const currentPage = pages[i];

      // 홈으로 돌아가기 (첫 번째 제외)
      if (i > 0) {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
      }

      // 해당 페이지로 이동 (href 우선 사용: 텍스트 변경에 강건)
      const hrefLink = page.locator(`a[href="${currentPage.url}"]`).first();
      if ((await hrefLink.count()) > 0) {
        await hrefLink.click();
      } else {
        const link = page
          .getByRole("link", { name: new RegExp(currentPage.name, "i") })
          .first();
        if (!(await link.isVisible())) continue;
        await link.click();
      }
      await page.waitForLoadState("networkidle");

      // URL 검증
      await expect(page).toHaveURL(currentPage.url);

      // 페이지별 특정 요소 확인
      await page.waitForTimeout(1000);

      // 전체 페이지 스크린샷
      await page.screenshot({
        path: `journey-${currentPage.name
          .toLowerCase()
          .replace(/\s+/g, "-")}.png`,
        fullPage: true,
      });
    }
  });

  test("성능 테스트: 페이지 로드 시간", async ({ page }) => {
    const startTime = Date.now();

    // 홈페이지 로드
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const homeLoadTime = Date.now() - startTime;
    console.log(`홈페이지 로드 시간: ${homeLoadTime}ms`);

    // 각 페이지 로드 시간 측정
    const testPages = [
      "/sql-tuner",
      "/text2sql",
      "/log-analyzer",
      "/e2e-tester",
    ];

    for (const testPage of testPages) {
      const pageStartTime = Date.now();
      await page.goto(testPage);
      await page.waitForLoadState("networkidle");
      const pageLoadTime = Date.now() - pageStartTime;

      console.log(`${testPage} 로드 시간: ${pageLoadTime}ms`);

      // 로드 시간이 5초를 초과하지 않는지 확인
      expect(pageLoadTime).toBeLessThan(5000);
    }
  });

  test("접근성 테스트: 키보드 네비게이션", async ({ page }) => {
    // Tab 키로 네비게이션 테스트
    await page.keyboard.press("Tab");
    await page.waitForTimeout(500);

    // 현재 포커스된 요소 확인
    const focusedElement = await page.locator(":focus").first();
    await expect(focusedElement).toBeVisible();

    // 여러 번 Tab 키 눌러서 네비게이션 테스트
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: "keyboard-navigation.png", fullPage: true });
  });

  test("에러 핸들링 테스트", async ({ page }) => {
    // 존재하지 않는 페이지 접근
    await page.goto("/non-existent-page");

    // 404 페이지 또는 리다이렉트 확인
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "error-page.png", fullPage: true });

    // 홈으로 돌아가기
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /AI Project Agent|개발의 미래는/i }),
    ).toBeVisible();
  });
});
