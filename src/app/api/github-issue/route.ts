import { NextRequest, NextResponse } from "next/server";

interface IssueData {
  type: "bug" | "performance" | "security" | "maintainability" | "style";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  location?: string;
  suggestion?: string;
}

interface CreateIssueRequest {
  fileName: string;
  language: string;
  analysis: {
    summary: string;
    issues: IssueData[];
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
  };
}

function getSeverityLabel(severity: string): string {
  const labels = {
    critical: "🔴 Critical",
    high: "🟠 High",
    medium: "🟡 Medium",
    low: "🟢 Low",
  };
  return labels[severity as keyof typeof labels] || severity;
}

function getTypeEmoji(type: string): string {
  const emojis = {
    bug: "🐛",
    performance: "⚡",
    security: "🔒",
    maintainability: "🔧",
    style: "🎨",
  };
  return emojis[type as keyof typeof emojis] || "📝";
}

export async function POST(request: NextRequest) {
  try {
    const { fileName, language, analysis }: CreateIssueRequest =
      await request.json();

    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;

    if (!githubToken || !githubOwner || !githubRepo) {
      return NextResponse.json(
        { error: "GitHub 설정이 완료되지 않았습니다." },
        { status: 500 },
      );
    }

    // 이슈 제목 생성
    const issueTitle = `🔍 코드 분석 결과: ${fileName}`;

    // 이슈 본문 생성
    const issueBody = `
# 코드 분석 보고서

## 📊 개요
- **파일명**: \`${fileName}\`
- **언어**: ${language}
- **분석 일시**: ${new Date().toLocaleString("ko-KR")}
- **코드 품질 점수**: ${analysis.codeQuality.score}/100

## 📈 품질 지표
- **복잡도**: ${analysis.codeQuality.metrics.complexity}/100
- **유지보수성**: ${analysis.codeQuality.metrics.maintainability}/100
- **보안성**: ${analysis.codeQuality.metrics.security}/100
- **성능**: ${analysis.codeQuality.metrics.performance}/100

## 📋 요약
${analysis.summary}

## 🚨 발견된 문제점

${
  analysis.issues.length === 0
    ? "✅ 발견된 문제가 없습니다!"
    : analysis.issues
        .map(
          (issue, index) => `
### ${index + 1}. ${getTypeEmoji(issue.type)} ${issue.title}
- **유형**: ${issue.type}
- **심각도**: ${getSeverityLabel(issue.severity)}
${issue.location ? `- **위치**: ${issue.location}` : ""}
- **설명**: ${issue.description}
${issue.suggestion ? `- **제안**: ${issue.suggestion}` : ""}
`,
        )
        .join("\n")
}

## 💡 권장사항

${
  analysis.recommendations.length === 0
    ? "현재 추가 권장사항이 없습니다."
    : analysis.recommendations
        .map((rec, index) => `${index + 1}. ${rec}`)
        .join("\n")
}

---
*이 보고서는 AI 기반 코드 분석 도구에 의해 자동 생성되었습니다.*
`;

    // GitHub API를 통해 이슈 생성
    const githubResponse = await fetch(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${githubToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: [
            "code-analysis",
            ...analysis.issues.map((issue) => `${issue.type}`),
            ...analysis.issues.map((issue) => `severity:${issue.severity}`),
          ].filter((label, index, self) => self.indexOf(label) === index), // 중복 제거
        }),
      },
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      console.error("GitHub API 오류:", errorData);
      return NextResponse.json(
        { error: "GitHub 이슈 생성에 실패했습니다.", details: errorData },
        { status: githubResponse.status },
      );
    }

    const issueData = await githubResponse.json();

    return NextResponse.json({
      success: true,
      issue: {
        number: issueData.number,
        url: issueData.html_url,
        title: issueData.title,
      },
    });
  } catch (error) {
    console.error("이슈 생성 오류:", error);
    return NextResponse.json(
      { error: "이슈 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
