import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question, schema } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "질문이 필요합니다." },
        { status: 400 }
      );
    }

    // TODO: 실제 AI API 호출로 대체
    // 현재는 Mock 데이터 반환
    let mockSQL = "";

    if (question.includes("매출") || question.includes("총액")) {
      mockSQL = `-- ${question}
SELECT 
    SUM(price) as total_revenue,
    COUNT(*) as total_orders
FROM orders 
WHERE order_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND status = 'completed';`;
    } else if (question.includes("고객") || question.includes("사용자")) {
      mockSQL = `-- ${question}
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.price) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;`;
    } else {
      mockSQL = `-- ${question}
SELECT *
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY u.created_at DESC;`;
    }

    const response = {
      sql: mockSQL,
      explanation: "자연어 질문을 바탕으로 생성된 SQL 쿼리입니다.",
      confidence: 0.95,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "SQL 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
