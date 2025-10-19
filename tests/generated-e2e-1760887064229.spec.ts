import { test, expect } from '@playwright/test';

/**
 * 이 테스트 스크립트는 AI Agent 웹 애플리케이션의 핵심 사용자 여정을 검증합니다.
 * 시나리오:
 * 1. 사용자가 메인 페이지에 접속합니다.
 * 2. 메인 페이지에서 'SQL 튜너' 기능 카드를 클릭하여 해당 페이지로 이동합니다.
 * 3. SQL 튜너 페이지에서 최적화가 필요한 SQL 쿼리를 입력합니다.
 * 4. '튜닝' 버튼을 클릭하여 AI 분석을 요청합니다.
 * 5. 분석이 완료된 후, 최적화된 SQL 쿼리와 설명이 결과 영역에 표시되는지 확인합니다.
 */
test.describe('AI Agent Core Feature: SQL Tuner E2E Test', () => {
  test('should navigate to the SQL Tuner, submit a query, and display the optimized result', async ({ page }) => {
    // 1. 메인 페이지('/')로 이동합니다.
    await page.goto('/');

    // 메인 페이지의 제목이 'AI Project Agent'인지 확인하여 페이지가 올바르게 로드되었는지 검증합니다.
    await expect(page.getByRole('heading', { name: 'AI Project Agent' })).toBeVisible();

    // 2. 'SQL 튜너' 기능으로 연결되는 링크를 클릭합니다.
    // 사용자가 여러 기능 중 'SQL 튜너'를 선택하는 과정을 시뮬레이션합니다.
    const sqlTunerLink = page.getByRole('link', { name: 'SQL 튜너' });
    await expect(sqlTunerLink).toBeVisible();
    await sqlTunerLink.click();

    // 3. '/sql-tuner' 페이지로 이동했는지 URL과 페이지 헤더를 통해 확인합니다.
    await page.waitForURL('/sql-tuner');
    await expect(page).toHaveURL('/sql-tuner');
    await expect(page.getByRole('heading', { name: 'SQL Tuner' })).toBeVisible();

    // 4. 최적화할 샘플 SQL 쿼리를 텍스트 입력란에 입력합니다.
    // monaco-editor를 사용하는 것을 가정하고, 해당 에디터 영역을 찾아 클릭 후 입력합니다.
    const queryInputArea = page.locator('.monaco-editor').first();
    await expect(queryInputArea).toBeVisible();
    await queryInputArea.click();
    const sampleQuery = "SELECT * FROM users u, posts p WHERE u.id = p.user_id AND u.status = 'active';";
    await page.keyboard.type(sampleQuery);
    
    // 입력된 쿼리가 정상적으로 들어갔는지 확인합니다.
    await expect(page.getByText(sampleQuery)).toBeVisible();

    // 5. '튜닝' 또는 '최적화' 버튼을 클릭하여 분석을 시작합니다.
    // 버튼 텍스트가 변경될 가능성을 고려하여 정규식을 사용합니다.
    const tuneButton = page.getByRole('button', { name: /튜닝 시작|최적화/i });
    await expect(tuneButton).toBeEnabled();
    await tuneButton.click();

    // 6. 로딩 인디케이터가 나타났다가 사라지는 것을 기다립니다.
    // 비동기 API 호출이 진행 중임을 나타내는 UI 피드백을 확인합니다.
    const loadingSpinner = page.locator('svg.animate-spin');
    await expect(loadingSpinner).toBeVisible();
    await expect(loadingSpinner).toBeHidden({ timeout: 20000 }); // API 응답 시간을 고려하여 타임아웃을 넉넉하게 설정합니다.

    // 7. 결과가 표시되는 영역을 확인합니다.
    // '결과' 또는 '최적화된 쿼리'와 같은 부제목이 나타나는지 확인합니다.
    const resultHeading = page.getByRole('heading', { name: /결과|최적화/i });
    await expect(resultHeading).toBeVisible();

    // 결과가 CodeBlock 컴포넌트(pre > code) 내에 렌더링되는지 확인합니다.
    const resultCodeBlock = page.locator('pre > code').first();
    await expect(resultCodeBlock).toBeVisible();

    // 결과 내용에 최적화와 관련된 핵심 키워드(예: 'JOIN', 'INDEX')가 포함되어 있는지 검증합니다.
    // 이는 AI가 유의미한 분석 결과를 반환했음을 암시합니다.
    await expect(resultCodeBlock).toContainText(/INNER JOIN/i);
    await expect(resultCodeBlock).toContainText(/INDEX/i);
  });
});