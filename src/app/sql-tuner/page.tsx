"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icons } from "../../components/Icons";

export default function SQLTuner() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("sql-tuner-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sql-tuner-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  const [originalSQL, setOriginalSQL] = useState("");
  const [optimizedSQL, setOptimizedSQL] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    improvements: { type: string; impact: string; description: string }[];
    performance: {
      originalTime: string;
      optimizedTime: string;
      improvement: string;
    };
  } | null>(null);

  const handleAnalyze = async () => {
    if (!originalSQL.trim()) return;

    setIsAnalyzing(true);

    // 시뮬레이션: 실제로는 AI API를 호출
    setTimeout(() => {
      const mockOptimizedSQL = `-- 최적화된 쿼리
SELECT 
    u.id, 
    u.name, 
    COUNT(o.id) as order_count
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
    AND o.status = 'completed'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC
LIMIT 100;

-- 인덱스 추천
-- CREATE INDEX idx_users_created_at ON users(created_at);
-- CREATE INDEX idx_orders_user_status ON orders(user_id, status);`;

      const mockAnalysis = {
        improvements: [
          {
            type: "인덱스 최적화",
            impact: "높음",
            description:
              "user_id와 status에 복합 인덱스를 추가하면 조인 성능이 85% 향상됩니다.",
          },
          {
            type: "쿼리 구조 개선",
            impact: "중간",
            description:
              "WHERE 절을 HAVING 절보다 먼저 처리하도록 순서를 조정했습니다.",
          },
          {
            type: "메모리 사용량 감소",
            impact: "낮음",
            description:
              "필요한 컬럼만 SELECT하여 메모리 사용량을 20% 줄였습니다.",
          },
        ],
        performance: {
          originalTime: "2.3초",
          optimizedTime: "0.4초",
          improvement: "475%",
        },
      };

      setOptimizedSQL(mockOptimizedSQL);
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 text-gray-900"
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
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <Icons.Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    SQL 튜너
                  </h1>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    AI 기반 쿼리 최적화
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
              🛠️ AI 기반 SQL 쿼리 최적화
            </h2>            <p className={`${
              isDarkMode ? "text-slate-400" : "text-slate-700"
            }`}>
              SQL 쿼리를 입력하면 AI가 성능을 분석하고 최적화된 쿼리를
              제안합니다.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* 입력 영역 */}
            <div className="space-y-4">              <h3 className={`text-xl font-semibold ${
                isDarkMode ? "text-slate-100" : "text-slate-900"
              }`}>
                원본 SQL 쿼리
              </h3>                <div className={`rounded-lg shadow-lg p-4 ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}>
                <textarea
                  value={originalSQL}
                  onChange={(e) => setOriginalSQL(e.target.value)}
                  placeholder="SQL 쿼리를 입력하세요..."
                  className={`w-full h-64 p-4 font-mono text-sm rounded border resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? "bg-slate-900 text-white border-slate-700 placeholder-slate-400" 
                      : "bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-500"
                  }`}
                />
                <div className="flex justify-between items-center mt-4">                  <span className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}>
                    {originalSQL.length} 문자
                  </span>
                  <button
                    onClick={handleAnalyze}
                    disabled={!originalSQL.trim() || isAnalyzing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Icons.Play />
                        최적화 분석
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 결과 영역 */}
            <div className="space-y-4">              <h3 className={`text-xl font-semibold ${
                isDarkMode ? "text-slate-100" : "text-slate-900"
              }`}>
                최적화된 SQL 쿼리
              </h3>
              <div className={`rounded-lg shadow-lg p-4 ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}>
                <textarea
                  value={optimizedSQL}
                  readOnly
                  placeholder="최적화된 쿼리가 여기에 표시됩니다..."
                  className={`w-full h-64 p-4 font-mono text-sm rounded border resize-none ${
                    isDarkMode 
                      ? "bg-slate-900 text-white border-slate-700 placeholder-slate-400" 
                      : "bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-500"
                  }`}
                />
                {optimizedSQL && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(optimizedSQL)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      복사
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 분석 결과 */}
          {analysis && (
            <div className="mt-8 grid md:grid-cols-2 gap-8">              {/* 성능 개선 사항 */}
              <div className={`rounded-lg shadow-lg p-6 ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}>
                <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                }`}>
                  <Icons.TrendingUp />
                  개선 사항
                </h4>
                <div className="space-y-4">
                  {" "}
                  {analysis.improvements.map(
                    (
                      improvement: {
                        type: string;
                        impact: string;
                        description: string;
                      },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-4"
                      >
                        <div className="flex items-center gap-2 mb-1">                          <span className={`font-medium ${
                            isDarkMode ? "text-slate-100" : "text-slate-900"
                          }`}>
                            {improvement.type}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              improvement.impact === "높음"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : improvement.impact === "중간"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }`}
                          >
                            {improvement.impact}
                          </span>
                        </div>                        <p className={`text-sm ${
                          isDarkMode ? "text-slate-400" : "text-slate-700"
                        }`}>
                          {improvement.description}
                        </p>
                      </div>
                    )
                  )}
                </div>              </div>

              {/* 성능 지표 */}
              <div className={`rounded-lg shadow-lg p-6 ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}>
                <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                }`}>
                  <Icons.Clock />
                  성능 지표
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`${
                      isDarkMode ? "text-slate-400" : "text-slate-700"
                    }`}>
                      기존 실행 시간
                    </span>
                    <span className={`font-mono text-lg ${
                      isDarkMode ? "text-slate-100" : "text-slate-900"
                    }`}>
                      {analysis.performance.originalTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${
                      isDarkMode ? "text-slate-400" : "text-slate-700"
                    }`}>
                      최적화 후 시간
                    </span>
                    <span className="font-mono text-lg text-green-600 font-semibold">
                      {analysis.performance.optimizedTime}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${
                        isDarkMode ? "text-slate-100" : "text-slate-900"
                      }`}>
                        성능 향상
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {analysis.performance.improvement}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}          {/* 도움말 */}
          <div className={`mt-8 rounded-lg p-6 ${
            isDarkMode ? "bg-blue-900/20" : "bg-blue-50"
          }`}>
            <div className="flex items-start gap-3">
              <Icons.AlertCircle />
              <div>
                <h5 className={`font-semibold mb-2 ${
                  isDarkMode ? "text-blue-100" : "text-blue-900"
                }`}>
                  사용 팁
                </h5>
                <ul className={`text-sm space-y-1 ${
                  isDarkMode ? "text-blue-200" : "text-blue-800"
                }`}>
                  <li>
                    • 완전한 SQL 쿼리를 입력해주세요 (SELECT, FROM, WHERE 등)
                  </li>
                  <li>
                    • 테이블 스키마 정보가 있으면 더 정확한 최적화가 가능합니다
                  </li>
                  <li>• 복잡한 조인이나 서브쿼리도 분석 가능합니다</li>
                  <li>
                    • 인덱스 추천사항을 참고하여 데이터베이스를 최적화하세요
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
