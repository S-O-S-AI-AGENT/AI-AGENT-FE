import { test, expect } from "@playwright/test";

test.describe("AI Project Agent", () => {
  test("홈페이지가 정상적으로 로드된다", async ({ page }) => {
    await page.goto("/");

    // 메인 제목 확인
    await expect(page.getByText("개발과 운영을 간단하게")).toBeVisible();

    // 네비게이션 확인
    await expect(page.getByText("AI Project Agent")).toBeVisible();
  });

  test("모든 기능 카드가 표시된다", async ({ page }) => {
    await page.goto("/");

    // 4개의 주요 기능 카드 확인
    await expect(page.getByText("SQL 튜너")).toBeVisible();
    await expect(page.getByText("E2E 자동 테스터")).toBeVisible();
    await expect(page.getByText("Text2SQL")).toBeVisible();
    await expect(page.getByText("Log 분석기")).toBeVisible();
  });

  test("SQL 튜너 페이지로 이동할 수 있다", async ({ page }) => {
    await page.goto("/");

    // SQL 튜너 카드 클릭
    await page.getByRole("link", { name: /SQL 튜너/ }).click();

    // URL 확인
    await expect(page).toHaveURL("/sql-tuner");

    // 페이지 제목 확인
    await expect(page.getByText("AI 기반 SQL 쿼리 최적화")).toBeVisible();
  });
});
