"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icons } from "../../components/Icons";

export default function LogAnalyzer() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("log-analyzer-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("log-analyzer-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  const [logContent, setLogContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary: {
      totalLines: number;
      errorCount: number;
      warnCount: number;
      infoCount: number;
      timeRange: string;
    };
    issues: Array<{
      type: string;
      title: string;
      category: string;
      description: string;
      impact: string;
      count: number;
      firstOccurrence: string;
      recommendations: string[];
    }>;
    patterns: Array<{
      description: string;
      frequency: number;
      pattern: string;
    }>;
    recommendations: string[];
  } | null>(null);
  const [filter, setFilter] = useState("all");

  const sampleLog = `2024-12-23 10:15:32 INFO  [UserService] User authentication successful: user_id=12345
2024-12-23 10:15:45 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds
2024-12-23 10:15:46 WARN  [DatabaseService] Retrying database connection (attempt 1/3)
2024-12-23 10:15:52 INFO  [DatabaseService] Database connection restored
2024-12-23 10:16:01 ERROR [PaymentService] Payment processing failed: insufficient_funds, user_id=12345
2024-12-23 10:16:05 INFO  [NotificationService] Email sent successfully: payment_failed_notification
2024-12-23 10:16:32 INFO  [UserService] User logout: user_id=12345
2024-12-23 10:17:15 ERROR [APIService] Rate limit exceeded: client_ip=192.168.1.100
2024-12-23 10:17:45 WARN  [SecurityService] Multiple failed login attempts detected: client_ip=192.168.1.200
2024-12-23 10:18:00 ERROR [DatabaseService] Connection timeout: Could not connect to database after 30 seconds`;

  const handleAnalyze = async () => {
    if (!logContent.trim()) return;

    setIsAnalyzing(true);

    // AI 분석 시뮬레이션
    setTimeout(() => {
      const lines = logContent.split("\\n");
      const errorCount = lines.filter((line) => line.includes("ERROR")).length;
      const warnCount = lines.filter((line) => line.includes("WARN")).length;
      const infoCount = lines.filter((line) => line.includes("INFO")).length;

      const mockAnalysis = {
        summary: {
          totalLines: lines.length,
          errorCount,
          warnCount,
          infoCount,
          timeRange: "2024-12-23 10:15:32 - 10:18:00",
        },
        issues: [
          {
            type: "critical",
            title: "데이터베이스 연결 실패",
            category: "Database Connection",
            description: "데이터베이스 연결이 반복적으로 실패하고 있습니다",
            impact: "높음",
            count: 2,
            firstOccurrence: "2024-12-23 10:15:45",
            recommendations: [
              "데이터베이스 연결 풀 설정을 확인하고 타임아웃 값을 조정하세요",
              "네트워크 연결 상태를 점검하세요",
            ],
          },
          {
            type: "warning",
            title: "보안 위험 탐지",
            category: "Security",
            description: "여러 번의 로그인 실패 시도가 감지되었습니다",
            impact: "중간",
            count: 1,
            firstOccurrence: "2024-12-23 10:17:45",
            recommendations: [
              "IP 차단 정책을 검토하세요",
              "보안 모니터링을 강화하세요",
            ],
          },
          {
            type: "error",
            title: "API 요청 제한 초과",
            category: "API Management",
            description: "클라이언트의 API 요청이 제한을 초과했습니다",
            impact: "낮음",
            count: 1,
            firstOccurrence: "2024-12-23 10:17:15",
            recommendations: ["요청 제한 정책을 재검토하세요"],
          },
        ],
        patterns: [
          {
            description: "데이터베이스 연결 실패 → 재시도 → 복구",
            frequency: 1,
            pattern: "ERROR → WARN → INFO",
          },
          {
            description: "결제 실패 → 알림 발송",
            frequency: 1,
            pattern: "Payment failure → Notification",
          },
        ],
        recommendations: [
          "데이터베이스 모니터링 도구 설정",
          "자동 복구 메커니즘 도입 검토",
          "보안 이벤트 실시간 알림 설정",
          "성능 임계값 설정 및 자동 스케일링 구성",
        ],
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setLogContent(content);
      };
      reader.readAsText(file);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <Icons.XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <Icons.AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <Icons.XCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Icons.CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "높음":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "중간":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "낮음":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredIssues =
    analysis?.issues.filter((issue) => {
      if (filter === "all") return true;
      return issue.type === filter;
    }) || [];
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-orange-900 text-white"
          : "bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 text-gray-900"
      }`}
    >
      {/* Enhanced Header */}
      <header
        className={`border-b backdrop-blur-xl transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-900/80 border-gray-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icons.ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <Icons.Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Log Analyzer
                  </h1>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    AI 기반 로그 분석
                  </p>
                </div>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isDarkMode
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isDarkMode ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>{" "}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h2
              className={`text-4xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              📊 AI 기반 로그 분석
            </h2>{" "}
            <p
              className={`text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              로그 파일을 업로드하거나 직접 입력하여 패턴을 분석하고 이슈를
              탐지합니다
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 로그 입력 영역 */}
            <div className="lg:col-span-2 space-y-6">
              {" "}
              {/* 파일 업로드 */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  로그 파일 업로드
                </h3>
                <div className="flex flex-wrap gap-4">
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-2">
                    <Icons.Upload />
                    파일 선택
                    <input
                      type="file"
                      className="hidden"
                      accept=".log,.txt"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <button
                    onClick={() => setLogContent(sampleLog)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    샘플 로그 사용
                  </button>
                </div>
              </div>{" "}
              {/* 로그 내용 입력 */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  로그 내용
                </h3>{" "}
                <textarea
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  placeholder="로그 내용을 입력하거나 파일을 업로드하세요..."
                  className={`w-full h-64 p-4 font-mono text-sm rounded border resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    isDarkMode
                      ? "bg-slate-900 text-white border-slate-700 placeholder-slate-400"
                      : "bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-500"
                  }`}
                />
                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {
                      logContent.split("\n").filter((line) => line.trim())
                        .length
                    }{" "}
                    라인
                  </span>
                  <button
                    onClick={handleAnalyze}
                    disabled={!logContent.trim() || isAnalyzing}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Icons.Search />
                        로그 분석
                      </>
                    )}
                  </button>
                </div>
              </div>{" "}
              {/* 분석 결과 */}
              {analysis && (
                <div
                  className={`rounded-lg shadow-lg p-6 ${
                    isDarkMode ? "bg-slate-800" : "bg-white"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-6 ${
                      isDarkMode ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    분석 결과
                  </h3>

                  {/* 요약 통계 */}
                  <div className="mb-6">
                    <h4
                      className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                        isDarkMode ? "text-slate-100" : "text-slate-900"
                      }`}
                    >
                      <Icons.TrendingUp />
                      로그 요약
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {analysis.summary.totalLines}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          총 로그
                        </div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {analysis.summary.errorCount}
                        </div>
                        <div className="text-sm text-red-600">에러</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {analysis.summary.warnCount}
                        </div>
                        <div className="text-sm text-yellow-600">경고</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analysis.summary.infoCount}
                        </div>
                        <div className="text-sm text-green-600">정보</div>
                      </div>
                    </div>
                  </div>

                  {/* 이슈 목록 */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        탐지된 이슈
                      </h4>
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                      >
                        <option value="all">전체</option>
                        <option value="critical">심각</option>
                        <option value="warning">경고</option>
                        <option value="error">오류</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      {filteredIssues.map((issue, index: number) => (
                        <div
                          key={index}
                          className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getIssueIcon(issue.type)}
                              <h5 className="font-semibold text-slate-900 dark:text-slate-100">
                                {issue.title}
                              </h5>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
                                  issue.impact,
                                )}`}
                              >
                                {issue.impact}
                              </span>
                            </div>
                            <span className="text-sm text-slate-500">
                              {issue.count}회 발생
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mb-3">
                            {issue.description}
                          </p>
                          <div className="text-sm text-slate-500 mb-3">
                            <strong>카테고리:</strong> {issue.category} |{" "}
                            <strong>최초 발생:</strong> {issue.firstOccurrence}
                          </div>
                          <div>
                            <strong className="text-sm text-slate-900 dark:text-slate-100">
                              권장사항:
                            </strong>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 mt-1 ml-4">
                              {issue.recommendations.map(
                                (rec: string, recIndex: number) => (
                                  <li key={recIndex} className="list-disc">
                                    {rec}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {" "}
              {/* 패턴 분석 */}
              {analysis && (
                <div
                  className={`rounded-lg shadow-lg p-6 ${
                    isDarkMode ? "bg-slate-800" : "bg-white"
                  }`}
                >
                  <h4
                    className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    패턴 분석
                  </h4>
                  <div className="space-y-3">
                    {analysis.patterns.map((pattern, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          isDarkMode ? "bg-slate-700" : "bg-slate-50"
                        }`}
                      >
                        <div
                          className={`font-medium ${
                            isDarkMode ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {pattern.description} ({pattern.frequency}회)
                        </div>
                        <div
                          className={`text-sm font-mono ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {pattern.pattern}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}{" "}
              {/* 권장사항 */}
              {analysis && (
                <div
                  className={`rounded-lg shadow-lg p-6 ${
                    isDarkMode ? "bg-slate-800" : "bg-white"
                  }`}
                >
                  <h4
                    className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    시스템 개선 권장사항
                  </h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.map(
                      (recommendation: string, index: number) => (
                        <li
                          key={index}
                          className={`flex items-start gap-2 text-sm ${
                            isDarkMode ? "text-slate-400" : "text-slate-700"
                          }`}
                        >
                          <Icons.CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{recommendation}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
              {/* 사용법 */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                <h5 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  📊 분석 기능
                </h5>
                <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                  <li>• 자동 에러/경고 패턴 탐지</li>
                  <li>• 시간대별 이슈 분석</li>
                  <li>• 반복 패턴 식별</li>
                  <li>• 개선 권장사항 제시</li>
                  <li>• 실시간 로그 모니터링 지원</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
