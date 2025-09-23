import { test, expect } from "@playwright/test";

test.describe("SQL 튜너", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sql-tuner");
  });

  test("SQL 튜너 페이지가 정상적으로 로드된다", async ({ page }) => {
    await expect(page.getByText("SQL 튜너")).toBeVisible();
    await expect(page.getByText("AI 기반 SQL 쿼리 최적화")).toBeVisible();
  });

  test("SQL 쿼리를 입력하고 분석할 수 있다", async ({ page }) => {
    const sqlQuery = "SELECT * FROM users WHERE id = 1";

    // SQL 입력
    await page.getByPlaceholder("SQL 쿼리를 입력하세요...").fill(sqlQuery);

    // 분석 버튼 클릭
    await page.getByRole("button", { name: "최적화 분석" }).click();

    // 로딩 상태 확인
    await expect(page.getByText("분석 중...")).toBeVisible();
  });

  test("홈으로 돌아가기 버튼이 작동한다", async ({ page }) => {
    await page.getByRole("link").first().click();
    await expect(page).toHaveURL("/");
  });
});
