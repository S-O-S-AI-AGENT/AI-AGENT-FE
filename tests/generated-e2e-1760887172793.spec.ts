import { test, expect } from '@playwright/test';

test.describe('AI Agent 핵심 기능 테스트', () => {

  test('사용자는 메인 페이지에서 SQL 튜너 기능으로 이동하여 SQL을 최적화할 수 있다', async ({ page }) => {
    // 1. 메인 페이지 접속
    await page.goto('/');

    // 2. 페이지 타이틀 및 주요 기능 카드 확인
    await expect(page).toHaveTitle(/AI Project Agent/);
    await expect(page.getByRole('heading', { name: 'AI Project Agent' })).toBeVisible();
    
    const sqlTunerCard = page.getByRole('link', { name: /SQL 튜너/ });
    await expect(sqlTunerCard).toBeVisible();
    await expect(page.getByText('AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다.')).toBeVisible();

    // 3. SQL 튜너 기능 카드를 클릭하여 페이지 이동
    await sqlTunerCard.click();

    // 4. SQL 튜너 페이지로 이동했는지 URL과 제목으로 확인
    await expect(page).toHaveURL('/sql-tuner');
    await expect(page.getByRole('heading', { name: 'SQL Tuner' })).toBeVisible();

    // 5. 최적화할 SQL 쿼리 입력
    const queryInput = page.getByRole('textbox'); // Monaco Editor는 textbox role을 가집니다.
    await expect(queryInput).toBeVisible();
    await queryInput.fill('SELECT * FROM products JOIN categories ON products.category_id = categories.id WHERE products.price > 10000;');

    // 6. '쿼리 최적화' 버튼 클릭
    await page.getByRole('button', { name: '쿼리 최적화' }).click();

    // 7. 결과가 나타날 때까지 대기하고, 결과 블록이 보이는지 확인
    // 로딩 스피너가 사라질 때까지 기다릴 수 있습니다.
    await expect(page.locator('svg.animate-spin')).not.toBeVisible({ timeout: 15000 });

    // "최적화된 쿼리"와 같은 결과 헤더가 나타나는지 확인
    await expect(page.getByRole('heading', { name: '최적화된 쿼리' })).toBeVisible({ timeout: 10000 });

    // 결과 코드 블록에 예상되는 키워드(예: 'SELECT', 'JOIN')가 포함되어 있는지 확인
    const resultBlock = page.locator('pre > code');
    await expect(resultBlock).toBeVisible();
    await expect(resultBlock).toContainText(/SELECT/i);
    await expect(resultBlock).toContainText(/JOIN/i);

    // 8. 메인 페이지로 돌아가는 링크 클릭
    await page.getByRole('link', { name: 'AI Project Agent' }).first().click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'AI Project Agent' })).toBeVisible();
  });

  test('사용자는 메인 페이지에서 Text2SQL 기능으로 이동하여 자연어 쿼리를 실행할 수 있다', async ({ page }) => {
    // 1. 메인 페이지 접속
    await page.goto('/');

    // 2. Text2SQL 기능 카드 확인 및 클릭
    const text2sqlCard = page.getByRole('link', { name: /Text2SQL/ });
    await expect(text2sqlCard).toBeVisible();
    await text2sqlCard.click();

    // 3. Text2SQL 페이지로 이동했는지 URL과 제목으로 확인
    await expect(page).toHaveURL('/text2sql');
    await expect(page.getByRole('heading', { name: 'Text2SQL' })).toBeVisible();

    // 4. 데이터베이스 스키마와 자연어 질문 입력
    const schemaInput = page.getByPlaceholder('여기에 데이터베이스 스키마를 붙여넣으세요...');
    const questionInput = page.getByPlaceholder('SQL로 변환할 질문을 입력하세요...');
    
    await expect(schemaInput).toBeVisible();
    await expect(questionInput).toBeVisible();

    const sampleSchema = `CREATE TABLE users (
      id INT PRIMARY KEY,
      name VARCHAR(100),
      signup_date DATE
    );`;
    const sampleQuestion = '지난 달에 가입한 사용자의 수를 알려줘';
    
    await schemaInput.fill(sampleSchema);
    await questionInput.fill(sampleQuestion);
    
    // 5. 'SQL 생성' 버튼 클릭
    await page.getByRole('button', { name: 'SQL 생성' }).click();

    // 6. 결과 확인
    // 로딩 상태가 사라지는 것을 기다립니다.
    await expect(page.locator('svg.animate-spin')).not.toBeVisible({ timeout: 15000 });
    
    // "생성된 SQL 쿼리" 헤더가 나타나는지 확인
    await expect(page.getByRole('heading', { name: '생성된 SQL 쿼리' })).toBeVisible({ timeout: 10000 });
    
    // 결과 코드 블록에 예상되는 SQL 구문이 포함되어 있는지 확인
    const resultBlock = page.locator('pre > code');
    await expect(resultBlock).toBeVisible();
    await expect(resultBlock).toContainText(/SELECT COUNT/i);
    await expect(resultBlock).toContainText(/FROM users/i);
    await expect(resultBlock).toContainText(/WHERE/i);
  });
});