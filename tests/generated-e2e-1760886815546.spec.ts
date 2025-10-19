import { test, expect } from '@playwright/test';

test.describe('AI Agent 핵심 기능 End-to-End 테스트', () => {

  test('사용자는 메인 페이지에서 SQL 튜너로 이동하여 쿼리를 튜닝하고 결과를 확인할 수 있다', async ({ page }) => {
    // 1. 메인 페이지 접속
    await page.goto('/');

    // 2. 페이지의 기본 요소들이 보이는지 확인
    await expect(page).toHaveTitle(/AI Project Agent - 개발 및 운영 도구/);
    await expect(page.getByRole('heading', { name: 'AI 기반 개발 및 운영 자동화' })).toBeVisible();

    // 3. 기능 카드 중 'SQL 튜너'를 찾아 클릭
    const sqlTunerLink = page.getByRole('link', { name: 'SQL 튜너 AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다.' });
    await expect(sqlTunerLink).toBeVisible();
    await sqlTunerLink.click();

    // 4. SQL 튜너 페이지로 이동했는지 URL과 제목으로 확인
    await expect(page).toHaveURL('/sql-tuner');
    await expect(page.getByRole('heading', { name: 'SQL Tuner' })).toBeVisible();

    // 5. 최적화할 SQL 쿼리를 입력
    const inputQuery = "SELECT * FROM employees WHERE department = 'Sales' AND salary > 50000;";
    const queryInputArea = page.getByPlaceholder('최적화할 SQL 쿼리를 입력하세요...');
    await expect(queryInputArea).toBeVisible();
    await queryInputArea.fill(inputQuery);

    // 6. '튜닝 시작' 버튼을 클릭하여 API 요청 전송
    const tuneButton = page.getByRole('button', { name: /튜닝 시작/i });
    await expect(tuneButton).toBeVisible();
    await tuneButton.click();

    // 7. 결과가 표시될 때까지 대기하고 확인
    // API 응답 시간을 고려하여 충분한 타임아웃을 설정
    const resultHeading = page.getByRole('heading', { name: '튜닝 결과' });
    await expect(resultHeading).toBeVisible({ timeout: 20000 });

    const resultCodeBlock = page.locator('pre > code');
    await expect(resultCodeBlock).toBeVisible();

    // 8. 결과 내용에 최적화 제안(예: INDEX)이 포함되어 있는지 확인
    await expect(resultCodeBlock).toContainText(/CREATE INDEX/i);
    await expect(resultCodeBlock).toContainText(/ON employees/i);

    // 9. 원래 쿼리의 주요 부분이 결과에 포함되어 있는지 확인
    await expect(resultCodeBlock).toContainText(/SELECT \* FROM employees/);
  });

  test('사용자는 메인 페이지에서 Text2SQL로 이동하여 자연어 질의를 SQL로 변환할 수 있다', async ({ page }) => {
    // 1. 메인 페이지 접속
    await page.goto('/');
    
    // 2. 기능 카드 중 'Text2SQL'을 찾아 클릭
    const text2SqlLink = page.getByRole('link', { name: 'Text2SQL 자연어로 SQL 쿼리를 생성하고 데이터베이스를 쉽게 조회합니다.' });
    await expect(text2SqlLink).toBeVisible();
    await text2SqlLink.click();

    // 3. Text2SQL 페이지로 이동했는지 URL과 제목으로 확인
    await expect(page).toHaveURL('/text2sql');
    await expect(page.getByRole('heading', { name: 'Text to SQL' })).toBeVisible();

    // 4. 변환할 자연어 질의를 입력
    const naturalLanguageQuery = "30세 이상인 사용자들의 이름을 찾아줘";
    const queryInputArea = page.getByPlaceholder('SQL로 변환할 자연어 질문을 입력하세요...');
    await expect(queryInputArea).toBeVisible();
    await queryInputArea.fill(naturalLanguageQuery);

    // 5. 'SQL 생성' 버튼을 클릭
    const generateButton = page.getByRole('button', { name: /SQL 생성/i });
    await expect(generateButton).toBeVisible();
    await generateButton.click();

    // 6. SQL 변환 결과가 표시될 때까지 대기
    const resultHeading = page.getByRole('heading', { name: '생성된 SQL 쿼리' });
    await expect(resultHeading).toBeVisible({ timeout: 20000 });

    const resultCodeBlock = page.locator('pre > code');
    await expect(resultCodeBlock).toBeVisible();

    // 7. 결과 내용에 SQL 키워드가 포함되어 있는지 확인
    await expect(resultCodeBlock).toContainText(/SELECT/i);
    await expect(resultCodeBlock).toContainText(/FROM/i);
    await expect(resultCodeBlock).toContainText(/WHERE/i);
    await expect(resultCodeBlock).toContainText(/>=/);
    await expect(resultCodeBlock).toContainText(/30/);
  });
});