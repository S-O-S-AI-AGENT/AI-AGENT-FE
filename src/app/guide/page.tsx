"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function GuidePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeGuide, setActiveGuide] = useState("sql-tuner");

  useEffect(() => {
    const saved = localStorage.getItem("guide-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("guide-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const guides = [
    {
      id: "sql-tuner",
      title: "SQL 튜너 가이드",
      icon: "🛠️",
      sections: [
        {
          title: "시작하기",
          content: [
            "SQL 튜너는 AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다.",
            "느린 쿼리를 입력하면 자동으로 분석하여 개선된 쿼리를 제안합니다.",
          ],
        },
        {
          title: "사용 방법",
          steps: [
            "최적화하고 싶은 SQL 쿼리를 입력창에 붙여넣기",
            "데이터베이스 스키마 정보 제공 (선택사항)",
            "'분석 시작' 버튼 클릭",
            "AI가 제안하는 최적화된 쿼리 및 개선 사항 확인",
          ],
        },
        {
          title: "주요 기능",
          features: [
            "인덱스 추천: 성능 향상을 위한 인덱스 제안",
            "쿼리 재작성: 더 효율적인 쿼리 구조로 변환",
            "실행 계획 분석: 쿼리 실행 과정 시각화",
            "성능 비교: 최적화 전후 성능 비교",
          ],
        },
        {
          title: "활용 팁",
          tips: [
            "스키마 정보를 제공하면 더 정확한 최적화가 가능합니다",
            "복잡한 JOIN은 서브쿼리로 분리해보세요",
            "WHERE 절의 조건 순서가 성능에 영향을 줄 수 있습니다",
          ],
        },
      ],
    },
    {
      id: "log-analyzer",
      title: "로그 분석기 가이드",
      icon: "📊",
      sections: [
        {
          title: "시작하기",
          content: [
            "로그 분석기는 시스템 로그를 AI로 분석하여 이슈와 패턴을 자동으로 탐지합니다.",
            "대량의 로그 데이터에서 중요한 정보를 빠르게 찾아냅니다.",
          ],
        },
        {
          title: "사용 방법",
          steps: [
            "분석하고 싶은 로그 파일을 업로드하거나 텍스트로 붙여넣기",
            "로그 형식 선택 (JSON, Plain Text, Nginx, Apache 등)",
            "'분석 시작' 버튼 클릭",
            "탐지된 에러, 경고, 패턴 및 해결 방안 확인",
          ],
        },
        {
          title: "주요 기능",
          features: [
            "에러 탐지: 로그에서 에러 메시지 자동 추출",
            "패턴 분석: 반복되는 문제 패턴 식별",
            "타임라인 시각화: 시간대별 이벤트 분포 확인",
            "해결 방안 제시: AI가 문제 해결을 위한 구체적인 조치 제안",
          ],
        },
        {
          title: "활용 팁",
          tips: [
            "타임스탬프가 포함된 로그가 더 정확한 분석을 제공합니다",
            "여러 서버의 로그를 통합하여 분석하면 전체 시스템 이슈를 파악할 수 있습니다",
            "정기적으로 로그를 분석하여 트렌드를 모니터링하세요",
          ],
        },
      ],
    },
    {
      id: "e2e-tester",
      title: "E2E 자동 테스터 가이드",
      icon: "🧪",
      sections: [
        {
          title: "시작하기",
          content: [
            "E2E 자동 테스터는 Playwright를 활용한 엔드투엔드 테스트를 자동으로 생성합니다.",
            "GitHub 저장소를 분석하여 주요 사용자 시나리오에 대한 테스트 코드를 생성합니다.",
          ],
        },
        {
          title: "사용 방법",
          steps: [
            "GitHub 저장소 URL 입력",
            "GitHub Personal Access Token 제공 (저장소 접근용)",
            "테스트할 주요 시나리오 설명 (선택사항)",
            "'자동화 시작' 버튼 클릭",
            "생성된 테스트 코드 및 실행 결과 확인",
          ],
        },
        {
          title: "주요 기능",
          features: [
            "자동 테스트 생성: AI가 코드베이스를 분석하여 테스트 시나리오 생성",
            "GitHub Actions 통합: PR에 자동으로 테스트 실행",
            "실시간 로그: 테스트 생성 및 실행 과정 실시간 모니터링",
            "워크플로우 분석: 테스트 실패 시 원인 분석 및 해결 방안 제시",
          ],
        },
        {
          title: "활용 팁",
          tips: [
            "프로젝트의 README나 문서에 주요 기능이 잘 설명되어 있으면 더 정확한 테스트가 생성됩니다",
            "테스트 시나리오를 구체적으로 작성하면 맞춤형 테스트를 얻을 수 있습니다",
            "정기적으로 테스트를 실행하여 회귀 버그를 조기에 발견하세요",
          ],
        },
      ],
    },
  ];

  const currentGuide = guides.find((g) => g.id === activeGuide);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b backdrop-blur-xl transition-colors duration-300 sticky top-0 z-50 ${
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
                className={`flex items-center gap-2 transition-colors ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <span className="text-2xl">←</span>
                <span className="font-semibold">홈으로</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1
                className={`text-xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                📚 사용 가이드
              </h1>
            </div>
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
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div
              className={`rounded-2xl p-4 sticky top-24 ${
                isDarkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white border border-gray-200 shadow-lg"
              }`}
            >
              <h2
                className={`text-lg font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                도구 선택
              </h2>
              <nav className="space-y-2">
                {guides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => setActiveGuide(guide.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      activeGuide === guide.id
                        ? isDarkMode
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-indigo-500 text-white shadow-lg"
                        : isDarkMode
                        ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-2xl">{guide.icon}</span>
                    <span className="font-semibold">{guide.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {currentGuide && (
              <div
                className={`rounded-2xl p-8 ${
                  isDarkMode
                    ? "bg-gray-800/50 border border-gray-700"
                    : "bg-white border border-gray-200 shadow-lg"
                }`}
              >
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-5xl">{currentGuide.icon}</span>
                  <h2
                    className={`text-3xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {currentGuide.title}
                  </h2>
                </div>

                <div className="space-y-8">
                  {currentGuide.sections.map((section, idx) => (
                    <section key={idx}>
                      <h3
                        className={`text-xl font-bold mb-4 ${
                          isDarkMode ? "text-indigo-300" : "text-indigo-600"
                        }`}
                      >
                        {section.title}
                      </h3>

                      {section.content && (
                        <div className="space-y-3">
                          {section.content.map((text, i) => (
                            <p
                              key={i}
                              className={`text-base leading-relaxed ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {text}
                            </p>
                          ))}
                        </div>
                      )}

                      {section.steps && (
                        <ol
                          className={`space-y-3 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {section.steps.map((step, i) => (
                            <li
                              key={i}
                              className="flex gap-3 items-start text-base"
                            >
                              <span
                                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isDarkMode
                                    ? "bg-indigo-600 text-white"
                                    : "bg-indigo-500 text-white"
                                }`}
                              >
                                {i + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      )}

                      {section.features && (
                        <ul
                          className={`space-y-3 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {section.features.map((feature, i) => (
                            <li
                              key={i}
                              className="flex gap-3 items-start text-base"
                            >
                              <span className="text-xl flex-shrink-0">✨</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.tips && (
                        <ul
                          className={`space-y-3 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {section.tips.map((tip, i) => (
                            <li
                              key={i}
                              className="flex gap-3 items-start text-base"
                            >
                              <span className="text-xl flex-shrink-0">💡</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </div>

                {/* Quick Link to Tool */}
                <div className="mt-12 pt-8 border-t border-gray-300">
                  <Link
                    href={`/${currentGuide.id}`}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                      isDarkMode
                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
                        : "bg-indigo-500 text-white hover:bg-indigo-600"
                    }`}
                  >
                    <span>{currentGuide.icon}</span>
                    <span>
                      {currentGuide.title.replace(" 가이드", "")} 사용하기
                    </span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
