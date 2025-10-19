"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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

interface AnalysisResponse {
  success: boolean;
  analysis: AnalysisResult;
  metadata: {
    fileName: string;
    language: string;
    analyzedAt: string;
  };
}

const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "xml",
];

function getSeverityColor(severity: string): string {
  const colors = {
    critical: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    low: "text-green-600 bg-green-50 border-green-200",
  };
  return (
    colors[severity as keyof typeof colors] ||
    "text-gray-600 bg-gray-50 border-gray-200"
  );
}

function getTypeIcon(type: string): string {
  const icons = {
    bug: "🐛",
    performance: "⚡",
    security: "🔒",
    maintainability: "🔧",
    style: "🎨",
  };
  return icons[type as keyof typeof icons] || "📝";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

export default function CodeAnalyzer() {
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(
    null,
  );
  const [error, setError] = useState("");
  const [issueUrl, setIssueUrl] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크 모드 초기화
  useEffect(() => {
    const saved = localStorage.getItem("code-analyzer-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("code-analyzer-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError("분석할 코드를 입력해주세요.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/code-analyzer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          fileName: fileName || "untitled",
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "분석 중 오류가 발생했습니다.");
      }

      setAnalysisResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!analysisResult) return;

    setIsCreatingIssue(true);
    setError("");

    try {
      const response = await fetch("/api/github-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: analysisResult.metadata.fileName,
          language: analysisResult.metadata.language,
          analysis: analysisResult.analysis,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "GitHub 이슈 생성 중 오류가 발생했습니다.",
        );
      }

      setIssueUrl(data.issue.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "GitHub 이슈 생성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsCreatingIssue(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900"
          : "bg-gradient-to-br from-slate-50 to-blue-50"
      }`}
    >
      <PageHeader
        title="AI 코드 분석기"
        description="AI를 활용하여 코드 품질을 분석하고 개선점을 찾아보세요"
        icon="🔍"
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        storageKey="code-analyzer-dark-mode"
      />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* 입력 섹션 */}
        <div
          className={`rounded-xl shadow-lg border p-6 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            코드 입력
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                파일명 (선택사항)
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="예: main.js, component.tsx"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? "border-gray-600 text-white bg-gray-700 placeholder-gray-400 hover:border-gray-500 hover:bg-gray-600"
                    : "border-gray-300 text-gray-900 bg-gray-50 placeholder-gray-500 hover:border-gray-400 hover:bg-white"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                프로그래밍 언어
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? "border-gray-600 text-white bg-gray-700 hover:border-gray-500 hover:bg-gray-600"
                    : "border-gray-300 text-gray-900 bg-gray-50 hover:border-gray-400 hover:bg-white"
                }`}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              분석할 코드
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`여기에 분석하고 싶은 ${language} 코드를 입력하세요...

예시:
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`}
              className={`w-full h-80 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-base transition-colors duration-200 resize-y ${
                isDarkMode
                  ? "border-gray-600 text-green-400 bg-gray-900 placeholder-gray-500 hover:border-gray-500 hover:bg-gray-800"
                  : "border-gray-300 text-gray-900 bg-gray-50 placeholder-gray-500 hover:border-gray-400 hover:bg-white"
              }`}
              style={{
                fontFamily:
                  "'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace",
                lineHeight: "1.6",
                fontSize: "15px",
                tabSize: "2",
                whiteSpace: "pre",
                wordWrap: "break-word",
              }}
              spellCheck={false}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !code.trim()}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <LoadingSpinner size="sm" />
                분석 중...
              </>
            ) : (
              <>🔍 코드 분석</>
            )}
          </button>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div
            className={`rounded-lg p-4 border ${
              isDarkMode
                ? "bg-red-900/20 border-red-800 text-red-200"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            <div className="flex items-center">
              <span className="text-sm">❌ {error}</span>
            </div>
          </div>
        )}

        {/* 분석 결과 */}
        {analysisResult && (
          <div className="space-y-6">
            {/* 코드 품질 점수 */}
            <div
              className={`rounded-xl shadow-lg border p-6 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                📊 코드 품질 분석
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      analysisResult.analysis.codeQuality.score,
                    )}`}
                  >
                    {analysisResult.analysis.codeQuality.score}
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    전체 점수
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-semibold ${getScoreColor(
                      analysisResult.analysis.codeQuality.metrics.complexity,
                    )}`}
                  >
                    {analysisResult.analysis.codeQuality.metrics.complexity}
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    복잡도
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-semibold ${getScoreColor(
                      analysisResult.analysis.codeQuality.metrics
                        .maintainability,
                    )}`}
                  >
                    {
                      analysisResult.analysis.codeQuality.metrics
                        .maintainability
                    }
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    유지보수성
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-semibold ${getScoreColor(
                      analysisResult.analysis.codeQuality.metrics.security,
                    )}`}
                  >
                    {analysisResult.analysis.codeQuality.metrics.security}
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    보안성
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-semibold ${getScoreColor(
                      analysisResult.analysis.codeQuality.metrics.performance,
                    )}`}
                  >
                    {analysisResult.analysis.codeQuality.metrics.performance}
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    성능
                  </div>
                </div>
              </div>
            </div>

            {/* 요약 */}
            <div
              className={`rounded-xl shadow-lg border p-6 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                📋 분석 요약
              </h2>
              <p
                className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {analysisResult.analysis.summary}
              </p>
            </div>

            {/* 발견된 문제점 */}
            <div
              className={`rounded-xl shadow-lg border p-6 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                🚨 발견된 문제점
              </h2>

              {analysisResult.analysis.issues.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl">✅</span>
                  <p
                    className={`mt-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    발견된 문제가 없습니다!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analysisResult.analysis.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getSeverityColor(
                        issue.severity,
                      )} ${isDarkMode ? "bg-opacity-20" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {getTypeIcon(issue.type)}
                        </span>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold text-lg ${
                              isDarkMode ? "text-white" : ""
                            }`}
                          >
                            {issue.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium">
                              {issue.type}
                            </span>
                            <span className="text-sm">•</span>
                            <span className="text-sm font-medium">
                              {issue.severity}
                            </span>
                          </div>
                          {issue.location && (
                            <p className="text-sm mt-1">
                              <strong>위치:</strong> {issue.location}
                            </p>
                          )}
                          <p className="mt-2">{issue.description}</p>
                          {issue.suggestion && (
                            <div
                              className={`mt-3 p-3 rounded-lg ${
                                isDarkMode ? "bg-blue-900/30" : "bg-blue-50"
                              }`}
                            >
                              <p className="text-sm">
                                <strong>💡 제안:</strong> {issue.suggestion}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 권장사항 */}
            <div
              className={`rounded-xl shadow-lg border p-6 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                💡 권장사항
              </h2>

              {analysisResult.analysis.recommendations.length === 0 ? (
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  현재 추가 권장사항이 없습니다.
                </p>
              ) : (
                <ul className="space-y-2">
                  {analysisResult.analysis.recommendations.map(
                    (recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span
                          className={`${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {recommendation}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>

            {/* GitHub 이슈 생성 */}
            <div
              className={`rounded-xl shadow-lg border p-6 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                📝 GitHub 이슈 생성
              </h2>

              {issueUrl ? (
                <div className="text-center py-4">
                  <span className="text-4xl">✅</span>
                  <p
                    className={`mt-2 mb-4 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    GitHub 이슈가 성공적으로 생성되었습니다!
                  </p>
                  <a
                    href={issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    <span>🔗</span>
                    이슈 보기
                  </a>
                </div>
              ) : (
                <div className="text-center">
                  <p
                    className={`mb-4 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    분석 결과를 GitHub 이슈로 생성하여 팀과 공유하세요.
                  </p>
                  <button
                    onClick={handleCreateIssue}
                    disabled={isCreatingIssue}
                    className={`px-6 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto transition-colors ${
                      isDarkMode
                        ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                        : "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500"
                    }`}
                  >
                    {isCreatingIssue ? (
                      <>
                        <LoadingSpinner size="sm" />
                        이슈 생성 중...
                      </>
                    ) : (
                      <>📝 GitHub 이슈 생성</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
