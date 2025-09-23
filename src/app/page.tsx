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
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      icon: "🧪",
      title: "E2E 자동 테스터",
      description:
        "Playwright를 활용한 자동화된 엔드투엔드 테스트를 구성합니다.",
      href: "/e2e-tester",
      gradient: "from-green-500 to-emerald-600",
      hoverGradient: "from-green-600 to-emerald-700",
    },
    {
      icon: "💬",
      title: "Text2SQL",
      description:
        "자연어로 SQL 쿼리를 생성하고 데이터베이스를 쉽게 조회합니다.",
      href: "/text2sql",
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "from-purple-600 to-purple-700",
    },
    {
      icon: "📊",
      title: "Log 분석기",
      description: "시스템 로그를 분석하여 이슈와 패턴을 자동으로 탐지합니다.",
      href: "/log-analyzer",
      gradient: "from-orange-500 to-red-600",
      hoverGradient: "from-orange-600 to-red-700",
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
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">⚡</span>
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
                  AI 기반 개발 도구 모음
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="#features"
                  className={`transition-colors duration-200 ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  기능
                </Link>
                <Link
                  href="#about"
                  className={`transition-colors duration-200 ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  소개
                </Link>
              </nav>

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
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl">🚀</span>
              </div>
              <h1
                className={`text-5xl md:text-6xl font-bold mb-6 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                AI로 개발을
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  가속화하세요
                </span>
              </h1>
              <p
                className={`text-xl md:text-2xl mb-8 leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                SQL 최적화부터 자동 테스트까지, 개발자를 위한
                <br />
                스마트한 AI 도구들을 한 곳에서 만나보세요
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="#features"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                🛠️ 도구 둘러보기
              </Link>
              <Link
                href="/guide"
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 border-2 hover:scale-105 ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                📚 사용법 보기
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: "⚡", label: "AI 기반", value: "4개 도구" },
                { icon: "🚀", label: "성능 향상", value: "최대 10배" },
                { icon: "🔧", label: "자동화", value: "100%" },
                { icon: "💡", label: "사용자", value: "1000+" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl ${
                    isDarkMode
                      ? "bg-gray-800/50 border border-gray-700"
                      : "bg-white/70 border border-gray-200"
                  } backdrop-blur-sm`}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div
                    className={`text-2xl font-bold mb-1 ${
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
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🛠️ 개발 도구들
            </h2>
            <p
              className={`text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              AI 기술로 개발 프로세스를 혁신적으로 개선하는 도구들
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href} className="group block">
                <div
                  className={`h-full p-8 rounded-2xl transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? "bg-gray-800/70 border border-gray-700 hover:bg-gray-800/90"
                      : "bg-white/80 border border-gray-200 hover:bg-white/90"
                  } backdrop-blur-sm shadow-lg hover:shadow-2xl`}
                >
                  <div className="flex items-start gap-6">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-2xl font-bold mb-3 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`text-lg leading-relaxed ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {feature.description}
                      </p>
                      <div
                        className={`mt-4 inline-flex items-center gap-2 text-sm font-medium ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        } group-hover:gap-3 transition-all duration-200`}
                      >
                        도구 사용하기
                        <span className="text-lg">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className={`text-4xl md:text-5xl font-bold mb-8 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              💡 왜 AI Project Agent인가?
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: "🤖",
                  title: "AI 기반",
                  description: "최신 AI 기술을 활용한 스마트한 자동화",
                },
                {
                  icon: "⚡",
                  title: "빠른 처리",
                  description: "몇 초 만에 복잡한 작업을 완료",
                },
                {
                  icon: "🎯",
                  title: "정확성",
                  description: "높은 정확도로 신뢰할 수 있는 결과 제공",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl ${
                    isDarkMode
                      ? "bg-gray-800/50 border border-gray-700"
                      : "bg-white/70 border border-gray-200"
                  } backdrop-blur-sm`}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t py-8 ${
          isDarkMode
            ? "bg-gray-900/50 border-gray-700"
            : "bg-white/50 border-gray-200"
        } backdrop-blur-sm`}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">⚡</span>
            <span
              className={`font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              AI Project Agent
            </span>
          </div>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            © 2024 AI Project Agent. 개발자를 위한 스마트한 도구들.
          </p>
        </div>
      </footer>
    </div>
  );
}
