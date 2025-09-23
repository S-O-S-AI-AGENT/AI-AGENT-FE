"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icons } from "../../components/Icons";

export default function FeaturesPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("features-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("features-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const features = [
    {
      icon: "🛠️",
      title: "SQL 튜너",
      description: "AI 기반 SQL 쿼리 최적화 및 성능 분석",
      href: "/sql-tuner",
      gradient: "from-blue-500 to-cyan-600",
      features: [
        "실행 계획 자동 분석",
        "인덱스 최적화 제안",
        "쿼리 성능 비교",
        "병목 지점 식별",
      ],
      stats: { users: "15K+", improvement: "60%" },
    },
    {
      icon: "💬",
      title: "Text2SQL",
      description: "자연어를 SQL 쿼리로 변환",
      href: "/text2sql",
      gradient: "from-purple-500 to-pink-600",
      features: [
        "자연어 이해",
        "복잡한 조인 지원",
        "스키마 자동 인식",
        "히스토리 관리",
      ],
      stats: { users: "12K+", accuracy: "95%" },
    },
    {
      icon: "🧪",
      title: "E2E 자동 테스터",
      description: "Playwright 기반 자동화 테스트",
      href: "/e2e-tester",
      gradient: "from-purple-500 to-blue-600",
      features: [
        "시각적 테스트 빌더",
        "자동 코드 생성",
        "CI/CD 통합",
        "실행 결과 리포트",
      ],
      stats: { users: "8K+", coverage: "90%" },
    },
    {
      icon: "📊",
      title: "로그 분석기",
      description: "AI 기반 로그 패턴 분석 및 이슈 탐지",
      href: "/log-analyzer",
      gradient: "from-orange-500 to-red-600",
      features: [
        "실시간 패턴 탐지",
        "자동 이슈 분류",
        "개선 권장사항",
        "시각화 대시보드",
      ],
      stats: { users: "10K+", detection: "99%" },
    },
    {
      icon: "🎨",
      title: "Figma 디자인 생성기",
      description: "AI 기반 UI/UX 디자인 자동 생성",
      href: "/figma-generator",
      gradient: "from-pink-500 to-rose-600",
      features: [
        "자동 컴포넌트 생성",
        "디자인 시스템 적용",
        "반응형 레이아웃",
        "프로토타입 생성",
      ],
      stats: { users: "5K+", designs: "50K+" },
    },
    {
      icon: "🚀",
      title: "코드베이스 생성기",
      description: "스마트 프로젝트 스캐폴딩",
      href: "/codebase-generator",
      gradient: "from-cyan-500 to-teal-600",
      features: [
        "기술 스택 추천",
        "Best Practice 적용",
        "의존성 자동 관리",
        "문서 자동 생성",
      ],
      stats: { users: "7K+", projects: "25K+" },
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
      {/* Header */}
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
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  기능 소개
                </h1>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  AI Project Agent의 모든 기능
                </p>
              </div>
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

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            개발을 혁신하는
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              6가지 AI 도구
            </span>
          </h2>
          <p
            className={`text-xl mb-12 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            각 도구는 개발 프로세스의 특정 영역에 특화되어 있으며,
            <br />
            함께 사용할 때 최대의 시너지를 발휘합니다.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                    : "bg-white/70 border-gray-200 hover:bg-white/90"
                }`}
              >
                <div className="flex items-start gap-6">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-2xl">{feature.icon}</span>
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
                      className={`text-lg mb-6 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {feature.description}
                    </p>

                    {/* Features List */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Icons.CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 mb-6">
                      {Object.entries(feature.stats).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div
                            className={`text-2xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                          >
                            {value}
                          </div>
                          <div
                            className={`text-xs uppercase tracking-wide ${
                              isDarkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {key === "users"
                              ? "사용자"
                              : key === "improvement"
                              ? "성능 향상"
                              : key === "accuracy"
                              ? "정확도"
                              : key === "coverage"
                              ? "커버리지"
                              : key === "detection"
                              ? "탐지율"
                              : key === "designs"
                              ? "생성된 디자인"
                              : key === "projects"
                              ? "생성된 프로젝트"
                              : key}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={feature.href}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 bg-gradient-to-r ${feature.gradient} text-white shadow-lg hover:shadow-xl`}
                    >
                      사용하기
                      <Icons.ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div
            className={`rounded-2xl p-12 backdrop-blur-sm border ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-gray-700"
                : "bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200"
            }`}
          >
            <h3
              className={`text-3xl font-bold mb-6 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              지금 바로 시작해보세요
            </h3>
            <p
              className={`text-xl mb-8 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              모든 도구는 무료로 사용할 수 있으며, 별도의 설치나 설정이 필요하지
              않습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                🏠 홈으로 돌아가기
              </Link>
              <Link
                href="/guide"
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 border-2 hover:scale-105 ${
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
      </section>
    </div>
  );
}
