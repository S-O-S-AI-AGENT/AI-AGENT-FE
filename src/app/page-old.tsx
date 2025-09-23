"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem('homepage-dark-mode');
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('homepage-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  const features = [
    {
      icon: "🛠",
      title: "SQL 튜너",
      description: "AI 기반으로 SQL 쿼리를 최적화하고 성능을 개선합니다.",
      href: "/sql-tuner",
      color: "bg-blue-500",
    },
    {
      icon: "🧪",
      title: "E2E 자동 테스터",
      description:
        "Playwright를 활용한 자동화된 엔드투엔드 테스트를 구성합니다.",
      href: "/e2e-tester",
      color: "bg-green-500",
    },
    {
      icon: "💬",
      title: "Text2SQL",
      description:
        "자연어로 SQL 쿼리를 생성하고 데이터베이스를 쉽게 조회합니다.",
      href: "/text2sql",
      color: "bg-purple-500",
    },
    {
      icon: "📊",
      title: "Log 분석기",
      description: "시스템 로그를 분석하여 이슈와 패턴을 자동으로 탐지합니다.",
      href: "/log-analyzer",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'
    }`}>
      {/* Enhanced Header */}
      <header className={`border-b backdrop-blur-xl transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
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
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  AI 기반 개발 도구 모음
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="#features"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                기능
              </Link>
              <Link
                href="#about"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                소개
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            개발과 운영을 <span className="text-blue-600">간단하게</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto">
            1인 기업과 중소기업을 위한 AI 기반 개발 도구 모음입니다. 복잡한 개발
            작업을 자동화하고 생산성을 극대화하세요.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="#features"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              시작하기 <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-slate-100">
            주요 기능
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <div
                  className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h4 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                  {feature.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100">
              왜 AI Project Agent인가요?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                  빠른 개발
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  AI가 복잡한 작업을 자동화하여 개발 시간을 단축시킵니다.
                </p>
              </div>
              <div className="p-6">
                <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧪</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                  높은 품질
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  자동화된 테스트와 분석으로 코드 품질을 보장합니다.
                </p>
              </div>
              <div className="p-6">
                <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                  쉬운 운영
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  직관적인 인터페이스로 누구나 쉽게 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-semibold">AI Project Agent</span>
          </div>
          <p className="text-slate-400">개발자를 위한 AI 도구 모음 © 2025</p>
        </div>
      </footer>
    </div>
  );
}
