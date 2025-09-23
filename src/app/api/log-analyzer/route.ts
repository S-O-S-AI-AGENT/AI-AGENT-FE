import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { logs } = await request.json();

    if (!logs) {
      return NextResponse.json(
        { error: "로그 데이터가 필요합니다." },
        { status: 400 }
      );
    }

    // TODO: 실제 AI API 호출로 대체
    // 현재는 Mock 분석 결과 반환
    const lines = logs.split("\n");
    const errorCount = lines.filter((line: string) =>
      line.includes("ERROR")
    ).length;
    const warnCount = lines.filter((line: string) =>
      line.includes("WARN")
    ).length;
    const infoCount = lines.filter((line: string) =>
      line.includes("INFO")
    ).length;

    const mockAnalysis = {
      summary: {
        totalLines: lines.length,
        errorCount,
        warnCount,
        infoCount,
        timeRange: "분석된 시간 범위",
      },
      issues: [
        {
          type: "critical",
          category: "Database Connection",
          message: "데이터베이스 연결 타임아웃이 감지되었습니다",
          count: errorCount,
          impact: "높음",
          suggestion: "데이터베이스 연결 풀 설정을 확인하세요",
          firstOccurrence: new Date().toISOString(),
          affectedService: "DatabaseService",
        },
      ],
      patterns: [
        {
          pattern: "Connection timeout → Retry → Success",
          frequency: 1,
          description: "데이터베이스 연결 복구 패턴",
        },
      ],
      recommendations: [
        "데이터베이스 연결 풀 모니터링 강화",
        "실시간 알림 시스템 구축",
        "자동 복구 메커니즘 도입",
      ],
    };

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    return NextResponse.json(
      { error: "로그 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
