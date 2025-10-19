import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

interface AnalysisResult {
  summary: string;
  issues: Array<{
    type: "bug" | "performance" | "security" | "maintainability" | "style";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    location?: string;
    suggestion?: string;
  }>;
  recommendations: string[];
  codeQuality: {
    score: number;
    metrics: {
      complexity: number;
      maintainability: number;
      security: number;
      performance: number;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { code, fileName, language } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "분석할 코드를 제공해주세요." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const model = "gemini-2.0-flash-exp";

    const prompt = `
당신은 전문적인 코드 리뷰어입니다. 제공된 코드를 철저히 분석하고 다음 형식의 JSON으로 응답해주세요:

{
  "summary": "코드의 전반적인 요약과 주요 기능 설명",
  "issues": [
    {
      "type": "bug|performance|security|maintainability|style",
      "severity": "low|medium|high|critical",
      "title": "문제 제목",
      "description": "문제 상세 설명",
      "location": "문제가 발생한 위치 (선택사항)",
      "suggestion": "개선 제안 (선택사항)"
    }
  ],
  "recommendations": ["개선 권고사항들"],
  "codeQuality": {
    "score": 85,
    "metrics": {
      "complexity": 70,
      "maintainability": 80,
      "security": 90,
      "performance": 85
    }
  }
}

분석할 코드:
언어: ${language || "Unknown"}
파일명: ${fileName || "Unknown"}

\`\`\`${language || ""}
${code}
\`\`\`

다음 관점에서 분석해주세요:
1. 코드 품질 및 구조
2. 성능 최적화 가능성
3. 보안 취약점
4. 유지보수성
5. 코딩 스타일 및 컨벤션
6. 잠재적 버그
7. 개선 제안사항

반드시 유효한 JSON 형식으로만 응답해주세요.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json(
        { error: "AI로부터 유효한 응답을 받지 못했습니다." },
        { status: 500 },
      );
    }

    const responseText = response.candidates[0].content.parts[0].text;

    // JSON 파싱 시도
    let analysisResult: AnalysisResult;
    try {
      // ```json``` 마크다운 제거
      const cleanedResponse = responseText
        .replace(/```json\n?|```\n?/g, "")
        .trim();
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      return NextResponse.json(
        { error: "AI 응답 파싱에 실패했습니다.", rawResponse: responseText },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      metadata: {
        fileName,
        language,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("코드 분석 오류:", error);
    return NextResponse.json(
      { error: "코드 분석 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
