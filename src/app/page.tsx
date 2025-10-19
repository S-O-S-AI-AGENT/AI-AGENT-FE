"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("homepage-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("homepage-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const features = [
    {
      icon: "🛠️",
      title: "SQL 튜너",
      description: "AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다.",
      href: "/sql-tuner",
      gradient: "from-blue-500 to-cyan-600",
      stats: "성능 향상 최대 10배",
    },
    {
      icon: "💬",
      title: "Text2SQL",
      description:
        "자연어로 SQL 쿼리를 생성하고 데이터베이스를 쉽게 조회합니다.",
      href: "/text2sql",
      gradient: "from-purple-500 to-pink-600",
      stats: "정확도 95%",
    },
    {
      icon: "🧪",
      title: "E2E 자동 테스터",
      description:
        "Playwright를 활용한 자동화된 엔드투엔드 테스트를 구성합니다.",
      href: "/e2e-tester",
      gradient: "from-purple-500 to-blue-600",
      stats: "테스트 커버리지 90%",
    },
    {
      icon: "📊",
      title: "로그 분석기",
      description: "시스템 로그를 분석하여 이슈와 패턴을 자동으로 탐지합니다.",
      href: "/log-analyzer",
      gradient: "from-orange-500 to-red-600",
      stats: "이슈 탐지율 99%",
    },
    {
      icon: "🎨",
      title: "Figma 디자인 생성기",
      description: "AI가 Figma를 활용하여 자동으로 UI/UX 디자인을 생성합니다.",
      href: "/figma-generator",
      gradient: "from-pink-500 to-rose-600",
      stats: "5만+ 디자인 생성",
    },
    {
      icon: "🚀",
      title: "코드베이스 생성기",
      description:
        "프로젝트 요구사항을 분석하여 최적화된 코드베이스를 자동 생성합니다.",
      href: "/codebase-generator",
      gradient: "from-cyan-500 to-teal-600",
      stats: "2만+ 프로젝트 생성",
    },
    {
      icon: "🔍",
      title: "AI 코드 분석기",
      description:
        "AI를 활용하여 코드 품질을 분석하고 개선점을 GitHub 이슈로 생성합니다.",
      href: "/code-analyzer",
      gradient: "from-indigo-500 to-purple-600",
      stats: "품질 향상 보장",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900"
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Project Agent
                </h1>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  개발자를 위한 AI 도구 모음
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="#features"
                  className={`transition-colors duration-200 hover:scale-105 ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  도구
                </Link>
                <Link
                  href="/features"
                  className={`transition-colors duration-200 hover:scale-105 ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  기능
                </Link>
                <Link
                  href="/guide"
                  className={`transition-colors duration-200 hover:scale-105 ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  가이드
                </Link>
              </nav>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                  isDarkMode
                    ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isDarkMode ? "🌙" : "☀️"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
                <span className="text-5xl">🚀</span>
              </div>
              <h1
                className={`text-6xl md:text-8xl font-bold mb-8 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                개발의 미래는
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  AI와 함께
                </span>
              </h1>
              <p
                className={`text-2xl md:text-3xl mb-12 leading-relaxed max-w-5xl mx-auto ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                SQL 최적화, E2E 테스트, 로그 분석부터 디자인 생성까지
                <br />
                <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  6가지 전문 AI 도구
                </span>
                로 개발 생산성을 혁신하세요
              </p>

              {/* Key Benefits */}
              <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
                <div
                  className={`p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white/70 border-gray-200"
                  }`}
                >
                  <div className="text-4xl mb-4">⚡</div>
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    즉시 사용 가능
                  </h3>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    설치나 설정 없이 브라우저에서 바로 시작
                  </p>
                </div>
                <div
                  className={`p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white/70 border-gray-200"
                  }`}
                >
                  <div className="text-4xl mb-4">🤖</div>
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    AI 기반 자동화
                  </h3>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    반복 작업을 지능적으로 자동화
                  </p>
                </div>
                <div
                  className={`p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white/70 border-gray-200"
                  }`}
                >
                  <div className="text-4xl mb-4">📈</div>
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    생산성 향상
                  </h3>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    개발 시간 단축과 품질 향상을 동시에
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Link
                href="#features"
                className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
              >
                🛠️ 도구 둘러보기
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
              <Link
                href="/features"
                className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 border-2 hover:scale-105 flex items-center justify-center gap-3 ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                ✨ 상세 기능 보기
              </Link>
            </div>

            {/* Impressive Stats */}
            <div
              className={`rounded-3xl p-12 backdrop-blur-sm border ${
                isDarkMode
                  ? "bg-gray-800/30 border-gray-700"
                  : "bg-white/50 border-gray-200"
              }`}
            >
              <h3
                className={`text-3xl font-bold mb-12 text-center ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                개발자들이 선택한 이유
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: "⚡", label: "AI 기반 도구", value: "6개" },
                  { icon: "🚀", label: "성능 향상", value: "최대 10배" },
                  { icon: "🔧", label: "자동화율", value: "100%" },
                  { icon: "💡", label: "활성 사용자", value: "10,000+" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`p-8 rounded-2xl ${
                      isDarkMode
                        ? "bg-gray-800/50 border border-gray-700"
                        : "bg-white/70 border border-gray-200"
                    } backdrop-blur-sm transition-all duration-300 hover:scale-105`}
                  >
                    <div className="text-4xl mb-4">{stat.icon}</div>
                    <div
                      className={`text-3xl font-bold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {stat.value}
                    </div>
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2
              className={`text-5xl md:text-6xl font-bold mb-8 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🛠️ 강력한 AI 도구들
            </h2>
            <p
              className={`text-2xl max-w-4xl mx-auto ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              각 도구는 개발의 특정 영역에 특화되어 있으며,
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                실제 개발 현장에서 검증된 AI 기술
              </span>
              을 바탕으로 만들어졌습니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href} className="group block">
                <div
                  className={`h-full p-10 rounded-3xl transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? "bg-gray-800/70 border border-gray-700 hover:bg-gray-800/90"
                      : "bg-white/80 border border-gray-200 hover:bg-white/90"
                  } backdrop-blur-sm shadow-lg hover:shadow-2xl`}
                >
                  <div className="text-center">
                    <div
                      className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-4xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                    >
                      {feature.icon}
                    </div>
                    <h3
                      className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-lg leading-relaxed mb-6 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {feature.description}
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300 group-hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
                      }`}
                    >
                      <span className="font-semibold">{feature.stats}</span>
                    </div>
                    <div className="mt-6">
                      <span
                        className={`inline-flex items-center gap-2 text-lg font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                      >
                        사용해보기
                        <span className="group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto text-center">
            <h2
              className={`text-5xl md:text-6xl font-bold mb-8 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              💡 왜 AI Project Agent인가?
            </h2>
            <div
              className={`rounded-3xl p-16 backdrop-blur-sm border ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-gray-700"
                  : "bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-3xl">⚡</span>
                <span className="text-3xl">🤖</span>
                <span className="text-3xl">🚀</span>
              </div>
              <p
                className={`text-2xl leading-relaxed mb-12 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                개발자의 시간은 소중합니다. 반복적인 작업에 시간을 낭비하지
                말고,
                <br />
                <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  창의적이고 가치 있는 작업에 집중하세요.
                </span>
                <br />
                AI Project Agent가 나머지는 처리해드립니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="#features"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  🚀 지금 시작하기
                </Link>
                <Link
                  href="/guide"
                  className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-200 border-2 hover:scale-105 ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  📚 사용법 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t py-12 ${
          isDarkMode
            ? "bg-gray-900/50 border-gray-700"
            : "bg-white/50 border-gray-200"
        } backdrop-blur-sm`}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">⚡</span>
            <span
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              AI Project Agent
            </span>
          </div>
          <p
            className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            개발자를 위한 AI 도구 모음 • 생산성 혁신 • 무료 사용
          </p>
          <div className="flex justify-center gap-8">
            <Link
              href="/features"
              className={`transition-colors duration-200 hover:scale-105 ${
                isDarkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              기능 소개
            </Link>
            <Link
              href="/guide"
              className={`transition-colors duration-200 hover:scale-105 ${
                isDarkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              사용 가이드
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
