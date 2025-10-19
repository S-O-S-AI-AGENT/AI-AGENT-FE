import { test, expect } from "@playwright/test";

test.describe("AI Project Agent - 홈페이지", () => {
  test.beforeEach(async ({ page }) => {
    // 페이지 로드 전 대기
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("홈페이지가 정상적으로 로드된다", async ({ page }) => {
    // 메인 제목 확인
    await expect(page.getByText("개발과 운영을 간단하게")).toBeVisible();

    // 네비게이션 확인
    await expect(page.getByText("AI Project Agent")).toBeVisible();

    // 페이지 전체 스크린샷
    await page.screenshot({ path: "homepage-loaded.png", fullPage: true });
  });

  test("모든 기능 카드가 표시되고 호버 효과가 작동한다", async ({ page }) => {
    // 4개의 주요 기능 카드 확인
    const features = ["SQL 튜너", "E2E 자동 테스터", "Text2SQL", "Log 분석기"];

    for (const feature of features) {
      const card = page.getByText(feature).first();
      await expect(card).toBeVisible();

      // 호버 효과 테스트
      await card.hover();
      await page.waitForTimeout(500); // 애니메이션 대기
    }

    await page.screenshot({ path: "feature-cards.png", fullPage: true });
  });

  test("SQL 튜너 페이지 네비게이션", async ({ page }) => {
    // SQL 튜너 카드 클릭
    await page.getByRole("link", { name: /SQL 튜너/ }).click();
    await page.waitForLoadState("networkidle");

    // URL 확인
    await expect(page).toHaveURL("/sql-tuner");

    // 페이지 제목 확인
    await expect(page.getByText("AI 기반 SQL 쿼리 최적화")).toBeVisible();

    // 페이지 스크린샷
    await page.screenshot({ path: "sql-tuner-page.png", fullPage: true });
  });

  test("모든 페이지 링크 네비게이션 테스트", async ({ page }) => {
    const pageLinks = [
      { text: "E2E 자동 테스터", url: "/e2e-tester" },
      { text: "Text2SQL", url: "/text2sql" },
      { text: "Log 분석기", url: "/log-analyzer" },
      { text: "Figma Generator", url: "/figma-generator" },
      { text: "Codebase Generator", url: "/codebase-generator" },
    ];

    for (const link of pageLinks) {
      // 홈으로 돌아가기
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // 링크 클릭
      await page
        .getByRole("link", { name: new RegExp(link.text, "i") })
        .first()
        .click();
      await page.waitForLoadState("networkidle");

      // URL 확인
      await expect(page).toHaveURL(link.url);

      // 페이지 스크린샷
      await page.screenshot({
        path: `${link.url.replace("/", "")}-page.png`,
        fullPage: true,
      });

      // 페이지 로드 확인을 위한 작은 대기
      await page.waitForTimeout(1000);
    }
  });

  test("반응형 디자인 테스트", async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: "desktop" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 375, height: 667, name: "mobile" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.waitForTimeout(500);

      // 메인 컨텐츠 확인
      await expect(page.getByText("개발과 운영을 간단하게")).toBeVisible();

      // 스크린샷
      await page.screenshot({
        path: `homepage-${viewport.name}.png`,
        fullPage: true,
      });
    }
  });
});
