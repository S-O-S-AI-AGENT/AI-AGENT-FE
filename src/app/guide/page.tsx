"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Guide() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("guide-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("guide-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  const sections = [
    { id: "overview", title: "개요", icon: "📚" },
    { id: "sql-tuner", title: "SQL 튜너", icon: "🛠️" },
    { id: "text2sql", title: "Text2SQL", icon: "💬" },
    { id: "log-analyzer", title: "Log 분석기", icon: "📊" },
    { id: "e2e-tester", title: "E2E 테스터", icon: "🧪" },
    { id: "figma-generator", title: "Figma 생성기", icon: "🎨" },
    { id: "codebase-generator", title: "코드베이스 생성기", icon: "🚀" },
    { id: "tips", title: "팁 & 트릭", icon: "💡" },
  ];

  const guideContent = {
    overview: {
      title: "AI Project Agent 사용 가이드",
      content: (
        <div className="space-y-8">
          <div>
            <h3
              className={`text-2xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🚀 시작하기
            </h3>
            <p
              className={`text-lg mb-6 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {" "}
              AI Project Agent는 개발자를 위한 6가지 핵심 도구를 제공합니다. 각
              도구는 AI 기술을 활용하여 개발 프로세스를 효율화합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "🛠️",
                title: "SQL 튜너",
                description: "SQL 쿼리를 AI가 분석하여 성능을 최적화합니다.",
                features: [
                  "쿼리 성능 분석",
                  "인덱스 최적화 제안",
                  "실행 계획 개선",
                ],
              },
              {
                icon: "💬",
                title: "Text2SQL",
                description: "자연어 질문을 SQL 쿼리로 자동 변환합니다.",
                features: ["자연어 처리", "스키마 기반 변환", "쿼리 검증"],
              },
              {
                icon: "📊",
                title: "Log 분석기",
                description: "로그 파일을 분석하여 이슈와 패턴을 탐지합니다.",
                features: ["자동 패턴 탐지", "이슈 분류", "해결책 제안"],
              },
              {
                icon: "🧪",
                title: "E2E 테스터",
                description: "Playwright 기반 자동화 테스트를 구성합니다.",
                features: [
                  "시각적 테스트 구성",
                  "다중 브라우저 지원",
                  "결과 리포트",
                ],
              },
              {
                icon: "🎨",
                title: "Figma 디자인 생성기",
                description:
                  "AI가 Figma를 활용하여 자동으로 UI/UX 디자인을 생성합니다.",
                features: [
                  "프로젝트 요구사항 분석",
                  "자동 컴포넌트 생성",
                  "Figma 파일 출력",
                ],
              },
              {
                icon: "🚀",
                title: "코드베이스 생성기",
                description:
                  "프로젝트 요구사항을 분석하여 최적화된 코드베이스를 생성합니다.",
                features: [
                  "기술 스택 자동 선정",
                  "프로젝트 구조 생성",
                  "개발 컨벤션 적용",
                ],
              },
            ].map((tool, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${
                  isDarkMode
                    ? "bg-gray-800/70 border border-gray-700"
                    : "bg-white/80 border border-gray-200"
                } backdrop-blur-sm`}
              >
                <div className="text-4xl mb-4">{tool.icon}</div>
                <h4
                  className={`text-xl font-bold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tool.title}
                </h4>
                <p
                  className={`mb-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {tool.description}
                </p>
                <ul className="space-y-1">
                  {tool.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-2 text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    "sql-tuner": {
      title: "🛠️ SQL 튜너 사용법",
      content: (
        <div className="space-y-8">
          <div
            className={`p-6 rounded-xl ${
              isDarkMode
                ? "bg-blue-900/20 border border-blue-700/30"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-blue-300" : "text-blue-900"
              }`}
            >
              📋 단계별 가이드
            </h3>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "SQL 쿼리 입력",
                  desc: "최적화하고 싶은 SQL 쿼리를 입력창에 붙여넣기",
                },
                {
                  step: 2,
                  title: "분석 실행",
                  desc: "'쿼리 분석' 버튼을 클릭하여 AI 분석 시작",
                },
                {
                  step: 3,
                  title: "결과 확인",
                  desc: "최적화된 쿼리와 성능 개선 사항 검토",
                },
                {
                  step: 4,
                  title: "적용",
                  desc: "제안된 인덱스와 최적화된 쿼리를 데이터베이스에 적용",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isDarkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h4
                      className={`font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              💡 활용 팁
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "복잡한 JOIN 쿼리에서 가장 큰 성능 향상을 얻을 수 있습니다",
                "인덱스 제안을 적용하기 전에 테스트 환경에서 먼저 검증하세요",
                "대용량 테이블 쿼리의 경우 LIMIT를 활용한 점진적 최적화를 권장합니다",
                "WHERE 절의 조건 순서도 성능에 큰 영향을 미칠 수 있습니다",
              ].map((tip, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    💡 {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    text2sql: {
      title: "💬 Text2SQL 사용법",
      content: (
        <div className="space-y-8">
          <div
            className={`p-6 rounded-xl ${
              isDarkMode
                ? "bg-purple-900/20 border border-purple-700/30"
                : "bg-purple-50 border border-purple-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-purple-300" : "text-purple-900"
              }`}
            >
              🎯 사용 방법
            </h3>
            <div className="space-y-6">
              <div>
                <h4
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  1. 데이터베이스 스키마 설정
                </h4>
                <p
                  className={`text-sm mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  먼저 테이블 구조를 입력하여 AI가 정확한 쿼리를 생성할 수
                  있도록 합니다.
                </p>
                <div
                  className={`p-3 rounded-lg font-mono text-sm ${
                    isDarkMode
                      ? "bg-gray-800 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  CREATE TABLE users (id INT, name VARCHAR(100), email
                  VARCHAR(100));
                </div>
              </div>

              <div>
                <h4
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  2. 자연어 질문 입력
                </h4>
                <p
                  className={`text-sm mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  평소 말하는 방식으로 데이터에 대한 질문을 입력합니다.
                </p>
                <div className="space-y-2">
                  {[
                    "지난 달에 가장 많이 주문한 고객은?",
                    "평균 주문 금액이 10만원 이상인 사용자들",
                    "이번 주 신규 가입자 수를 알려주세요",
                  ].map((example, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              ⚡ 고급 기능
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white/70"
                } border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <h4
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  📝 쿼리 히스토리
                </h4>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  이전에 생성한 쿼리들을 재사용하고 수정할 수 있습니다.
                </p>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white/70"
                } border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <h4
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  🔍 쿼리 실행
                </h4>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  생성된 SQL을 바로 복사하여 데이터베이스에서 실행할 수
                  있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    "log-analyzer": {
      title: "📊 Log 분석기 사용법",
      content: (
        <div className="space-y-8">
          <div
            className={`p-6 rounded-xl ${
              isDarkMode
                ? "bg-orange-900/20 border border-orange-700/30"
                : "bg-orange-50 border border-orange-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-orange-300" : "text-orange-900"
              }`}
            >
              📋 로그 분석 과정
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "로그 파일 업로드",
                  desc: "분석할 로그 파일을 드래그 앤 드롭하거나 파일 선택",
                  icon: "📁",
                },
                {
                  title: "자동 파싱",
                  desc: "AI가 로그 형식을 자동으로 인식하고 구조화",
                  icon: "🔍",
                },
                {
                  title: "패턴 분석",
                  desc: "에러 패턴, 성능 이슈, 보안 위험 등을 자동 탐지",
                  icon: "📈",
                },
                {
                  title: "결과 리포트",
                  desc: "발견된 이슈들과 해결 방안을 시각적으로 제공",
                  icon: "📊",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h4
                      className={`font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🎯 지원하는 로그 형식
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Apache/Nginx", format: "access.log, error.log" },
                { name: "Application", format: "JSON, Plain text" },
                { name: "System", format: "syslog, Windows Event" },
                { name: "Database", format: "MySQL, PostgreSQL" },
                { name: "Docker", format: "Container logs" },
                { name: "Kubernetes", format: "Pod, Service logs" },
              ].map((log, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-800/50 border border-gray-700"
                      : "bg-white/70 border border-gray-200"
                  }`}
                >
                  <h4
                    className={`font-semibold mb-1 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {log.name}
                  </h4>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {log.format}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    "e2e-tester": {
      title: "🧪 E2E 테스터 사용법",
      content: (
        <div className="space-y-8">
          <div
            className={`p-6 rounded-xl ${
              isDarkMode
                ? "bg-green-900/20 border border-green-700/30"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-green-300" : "text-green-900"
              }`}
            >
              🎬 테스트 시나리오 작성
            </h3>
            <div className="space-y-6">
              <div>
                <h4
                  className={`font-semibold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  기본 액션들
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { action: "navigate", icon: "🌐", desc: "특정 URL로 이동" },
                    { action: "click", icon: "👆", desc: "요소 클릭" },
                    {
                      action: "fill",
                      icon: "✍️",
                      desc: "입력 필드에 텍스트 입력",
                    },
                    {
                      action: "expect",
                      icon: "✅",
                      desc: "요소 존재 여부 확인",
                    },
                    { action: "wait", icon: "⏳", desc: "지정된 시간 대기" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{item.icon}</span>
                        <span
                          className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.action}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4
                  className={`font-semibold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  📝 테스트 시나리오 예시
                </h4>
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {" "}
                  <h5
                    className={`font-medium mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    로그인 플로우 테스트
                  </h5>
                  <div className="space-y-2 text-sm">
                    {[
                      { step: "navigate", value: "https://myapp.com/login" },
                      {
                        step: "fill",
                        selector: "#email",
                        value: "user@example.com",
                      },
                      {
                        step: "fill",
                        selector: "#password",
                        value: "password123",
                      },
                      { step: "click", selector: "#login-button" },
                      {
                        step: "expect",
                        selector: ".welcome-message",
                        value: "환영합니다",
                      },
                    ].map((step, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {" "}
                        <span className="font-mono">
                          {step.step}(
                          {step.selector ? `"${step.selector}", ` : ""} &quot;
                          {step.value}&quot;)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🎯 베스트 프랙티스
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "명확하고 고유한 CSS 셀렉터 사용",
                "동적 콘텐츠 로딩을 위한 적절한 대기 시간 설정",
                "테스트 단계를 논리적 순서로 구성",
                "예상 결과를 구체적으로 정의",
                "테스트 실패 시 스크린샷 확인",
                "다양한 브라우저에서 테스트 실행",
              ].map((tip, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-800/50 border border-gray-700"
                      : "bg-white/70 border border-gray-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    ✅ {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>{" "}
        </div>
      ),
    },
    "figma-generator": {
      title: "🎨 Figma 디자인 생성기 사용법",
      content: (
        <div className="space-y-8">
          <div
            className={`p-6 rounded-xl ${
              isDarkMode
                ? "bg-pink-900/20 border border-pink-700/30"
                : "bg-pink-50 border border-pink-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-pink-300" : "text-pink-900"
              }`}
            >
              🎯 디자인 생성 과정
            </h3>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "프로젝트 정보 입력",
                  desc: "프로젝트 타입, 산업 분야, 디자인 스타일 선택",
                  icon: "📋",
                },
                {
                  step: 2,
                  title: "요구사항 설정",
                  desc: "타겟 사용자, 필요한 컴포넌트, 색상 선호도 입력",
                  icon: "⚙️",
                },
                {
                  step: 3,
                  title: "AI 디자인 생성",
                  desc: "설정된 조건에 따라 AI가 자동으로 디자인 생성",
                  icon: "🤖",
                },
                {
                  step: 4,
                  title: "Figma 파일 출력",
                  desc: "완성된 디자인을 Figma 파일로 다운로드",
                  icon: "📁",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isDarkMode
                          ? "bg-pink-600 text-white"
                          : "bg-pink-600 text-white"
                      }`}
                    >
                      {item.step}
                    </div>
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h4
                      className={`font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🎨 지원하는 디자인 유형
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "웹 애플리케이션", desc: "대시보드, SaaS 플랫폼" },
                { name: "모바일 앱", desc: "iOS, Android 네이티브 디자인" },
                { name: "랜딩 페이지", desc: "마케팅, 프로덕트 소개 페이지" },
                { name: "이커머스", desc: "온라인 쇼핑몰, 마켓플레이스" },
                { name: "포트폴리오", desc: "개인, 기업 포트폴리오 사이트" },
                { name: "관리자 패널", desc: "백오피스, 관리 시스템" },
              ].map((type, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-800/50 border border-gray-700"
                      : "bg-white/70 border border-gray-200"
                  }`}
                >
                  <h4
                    className={`font-semibold mb-1 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {type.name}
                  </h4>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {type.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              💡 디자인 팁
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "명확한 브랜드 가이드라인 제공하기",
                "타겟 사용자를 구체적으로 정의하기",
                "참고할 만한 디자인 예시 첨부하기",
                "필수 기능과 선택 기능 구분하기",
                "반응형 디자인 요구사항 명시하기",
                "접근성 가이드라인 고려하기",
              ].map((tip, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-800/50" : "bg-white/70"
                  } border ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    ✨ {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    "codebase-generator": {
      title: "🚀 코드베이스 생성기 사용법",
      content: (
        <div className="space-y-8">
          <div
            className={`p-6 rounded-xl ${
              isDarkMode
                ? "bg-cyan-900/20 border border-cyan-700/30"
                : "bg-cyan-50 border border-cyan-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-cyan-300" : "text-cyan-900"
              }`}
            >
              🛠️ 4단계 프로젝트 생성
            </h3>
            <div className="space-y-6">
              {[
                {
                  step: "1단계",
                  title: "프로젝트 정보",
                  items: ["프로젝트명 입력", "상세 설명 작성"],
                  icon: "📝",
                },
                {
                  step: "2단계",
                  title: "팀 & 난이도",
                  items: ["타겟 사용자 정의", "팀 규모 선택", "난이도 설정"],
                  icon: "👥",
                },
                {
                  step: "3단계",
                  title: "플랫폼 & 기능",
                  items: ["지원 플랫폼 선택", "필요 기능 체크"],
                  icon: "🔧",
                },
                {
                  step: "4단계",
                  title: "기술 스택",
                  items: [
                    "AI 추천 받기",
                    "프레임워크 선택",
                    "데이터베이스 선택",
                  ],
                  icon: "⚙️",
                },
              ].map((phase, index) => (
                <div key={index}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{phase.icon}</span>
                    <div>
                      <h4
                        className={`font-semibold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {phase.step}: {phase.title}
                      </h4>
                    </div>
                  </div>
                  <ul className="ml-8 space-y-1">
                    {phase.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className={`flex items-center gap-2 text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span className="text-cyan-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🎯 지원하는 프로젝트 유형
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  type: "웹 애플리케이션",
                  tech: "React, Vue, Angular + Node.js",
                  use: "SaaS, 관리 시스템, 포털",
                },
                {
                  type: "모바일 앱",
                  tech: "React Native, Flutter",
                  use: "iOS/Android 네이티브 앱",
                },
                {
                  type: "API 서버",
                  tech: "Express, FastAPI, Spring Boot",
                  use: "백엔드 API, 마이크로서비스",
                },
                {
                  type: "데스크톱 앱",
                  tech: "Electron, Tauri",
                  use: "크로스 플랫폼 데스크톱",
                },
                {
                  type: "풀스택 앱",
                  tech: "Next.js, Nuxt.js",
                  use: "통합된 프론트엔드 + 백엔드",
                },
                {
                  type: "정적 사이트",
                  tech: "Gatsby, Hugo, Jekyll",
                  use: "블로그, 포트폴리오, 문서",
                },
              ].map((project, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-800/50 border border-gray-700"
                      : "bg-white/70 border border-gray-200"
                  }`}
                >
                  <h4
                    className={`font-semibold mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {project.type}
                  </h4>
                  <p
                    className={`text-xs mb-1 ${
                      isDarkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    🔧 {project.tech}
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    💡 {project.use}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              ⚡ AI 추천 시스템
            </h3>
            <div
              className={`p-6 rounded-lg ${
                isDarkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white/70 border border-gray-200"
              }`}
            >
              <p
                className={`mb-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                AI가 프로젝트 정보를 분석하여 최적의 기술 스택을 추천합니다:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5
                    className={`font-semibold mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    🧠 분석 요소
                  </h5>
                  <ul
                    className={`space-y-1 text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <li>• 프로젝트 복잡도</li>
                    <li>• 팀 규모 및 경험</li>
                    <li>• 성능 요구사항</li>
                    <li>• 확장성 필요성</li>
                  </ul>
                </div>
                <div>
                  <h5
                    className={`font-semibold mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    📦 포함 항목
                  </h5>
                  <ul
                    className={`space-y-1 text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <li>• 프로젝트 구조</li>
                    <li>• 설정 파일들</li>
                    <li>• 기본 컴포넌트</li>
                    <li>• 개발 도구 설정</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    tips: {
      title: "💡 팁 & 트릭",
      content: (
        <div className="space-y-8">
          <div>
            <h3
              className={`text-2xl font-bold mb-6 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🚀 생산성 향상 팁
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "⌨️",
                  title: "키보드 단축키",
                  tips: [
                    "Ctrl+Enter: 쿼리 실행",
                    "Ctrl+S: 현재 작업 저장",
                    "Ctrl+Z: 실행 취소",
                    "Tab: 자동 완성",
                  ],
                },
                {
                  icon: "🔄",
                  title: "워크플로우",
                  tips: [
                    "템플릿을 활용한 빠른 시작",
                    "히스토리 기능으로 재사용",
                    "결과를 즉시 복사하여 활용",
                    "다크 모드로 눈의 피로 감소",
                  ],
                },
                {
                  icon: "🎯",
                  title: "정확도 향상",
                  tips: [
                    "구체적인 질문과 조건 명시",
                    "테이블 스키마 정확히 입력",
                    "단계별로 나누어 테스트",
                    "결과 검증 후 적용",
                  ],
                },
                {
                  icon: "⚡",
                  title: "성능 최적화",
                  tips: [
                    "큰 파일은 청크 단위로 처리",
                    "불필요한 데이터 필터링",
                    "인덱스 활용 극대화",
                    "병렬 처리 옵션 활용",
                  ],
                },
              ].map((section, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl ${
                    isDarkMode
                      ? "bg-gray-800/70 border border-gray-700"
                      : "bg-white/80 border border-gray-200"
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{section.icon}</span>
                    <h4
                      className={`text-lg font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {section.title}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <li
                        key={tipIndex}
                        className={`flex items-start gap-2 text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`p-6 rounded-xl ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30"
                : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🆘 문제 해결
            </h3>
            <div className="space-y-4">
              {[
                {
                  problem: "SQL 쿼리가 느려요",
                  solution: "인덱스 추가, WHERE 절 최적화, JOIN 조건 확인",
                },
                {
                  problem: "Text2SQL 결과가 부정확해요",
                  solution:
                    "스키마 정보를 더 자세히 입력, 질문을 더 구체적으로 작성",
                },
                {
                  problem: "로그 분석이 실패해요",
                  solution:
                    "로그 형식 확인, 파일 크기 제한 확인, 인코딩 문제 점검",
                },
                {
                  problem: "E2E 테스트가 실패해요",
                  solution:
                    "셀렉터 정확성 확인, 대기 시간 조정, 동적 요소 처리",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-800/50" : "bg-white/70"
                  }`}
                >
                  <h5
                    className={`font-semibold mb-1 ${
                      isDarkMode ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    ❓ {item.problem}
                  </h5>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    💡 {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  };

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
                ← 홈으로
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📚</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    사용법 가이드
                  </h1>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    AI Project Agent 완전 활용법
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
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <div
                className={`sticky top-8 rounded-xl p-4 ${
                  isDarkMode
                    ? "bg-gray-800/70 border border-gray-700"
                    : "bg-white/80 border border-gray-200"
                } backdrop-blur-sm`}
              >
                <h3
                  className={`font-semibold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  📑 목차
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                        activeSection === section.id
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-600 text-white"
                          : isDarkMode
                          ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span className="text-sm font-medium">
                        {section.title}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div
                className={`rounded-xl p-8 ${
                  isDarkMode
                    ? "bg-gray-800/70 border border-gray-700"
                    : "bg-white/80 border border-gray-200"
                } backdrop-blur-sm`}
              >
                <h2
                  className={`text-3xl font-bold mb-6 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {
                    guideContent[activeSection as keyof typeof guideContent]
                      .title
                  }
                </h2>
                {
                  guideContent[activeSection as keyof typeof guideContent]
                    .content
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
