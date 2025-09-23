"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";

interface ProjectRequirements {
  projectName: string;
  description: string;
  targetUsers: string;
  teamSize: number;
  difficulty: string;
  features: string[];
  platforms: string[];
  preferences: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
}

interface GeneratedCodebase {
  id: string;
  projectName: string;
  framework: string;
  structure: ProjectStructure[];
  dependencies: string[];
  conventions: string[];
  timestamp: string;
  downloadUrl: string;
}

interface ProjectStructure {
  type: "folder" | "file";
  name: string;
  path: string;
  children?: ProjectStructure[];
}

const DIFFICULTY_LEVELS = [
  {
    value: "beginner",
    label: "초급",
    icon: "🌱",
    description: "간단한 기능, 학습 목적",
  },
  {
    value: "intermediate",
    label: "중급",
    icon: "🚀",
    description: "복합 기능, 실무 적용",
  },
  {
    value: "advanced",
    label: "고급",
    icon: "⚡",
    description: "복잡한 시스템, 확장 가능",
  },
  {
    value: "enterprise",
    label: "엔터프라이즈",
    icon: "🏢",
    description: "대규모 시스템, 높은 안정성",
  },
];

const TEAM_SIZES = [
  { value: 1, label: "개인 (1명)", icon: "👤" },
  { value: 2, label: "소규모 (2-3명)", icon: "👥" },
  { value: 5, label: "중간 (4-8명)", icon: "👨‍👩‍👧‍👦" },
  { value: 10, label: "대규모 (8명 이상)", icon: "🏢" },
];

const COMMON_FEATURES = [
  "사용자 인증/로그인",
  "데이터베이스 연동",
  "API 통신",
  "파일 업로드",
  "실시간 통신",
  "결제 시스템",
  "검색 기능",
  "관리자 패널",
  "다국어 지원",
  "푸시 알림",
  "데이터 시각화",
  "소셜 로그인",
];

const PLATFORMS = [
  { value: "web", label: "웹", icon: "🌐" },
  { value: "mobile", label: "모바일", icon: "📱" },
  { value: "desktop", label: "데스크톱", icon: "💻" },
  { value: "api", label: "API 서버", icon: "🔌" },
];

const FRAMEWORK_OPTIONS = {
  frontend: [
    { value: "react", label: "React", icon: "⚛️" },
    { value: "vue", label: "Vue.js", icon: "💚" },
    { value: "angular", label: "Angular", icon: "🔺" },
    { value: "svelte", label: "Svelte", icon: "🧡" },
    { value: "next", label: "Next.js", icon: "▲" },
  ],
  backend: [
    { value: "node", label: "Node.js", icon: "💚" },
    { value: "python", label: "Python/Django", icon: "🐍" },
    { value: "java", label: "Spring Boot", icon: "☕" },
    { value: "csharp", label: "ASP.NET", icon: "🔷" },
    { value: "go", label: "Go", icon: "🐹" },
  ],
  database: [
    { value: "postgresql", label: "PostgreSQL", icon: "🐘" },
    { value: "mysql", label: "MySQL", icon: "🗄️" },
    { value: "mongodb", label: "MongoDB", icon: "🍃" },
    { value: "redis", label: "Redis", icon: "🔴" },
    { value: "sqlite", label: "SQLite", icon: "💎" },
  ],
};

export default function CodebaseGeneratorPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "history">(
    "generate"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [requirements, setRequirements] = useState<ProjectRequirements>({
    projectName: "",
    description: "",
    targetUsers: "",
    teamSize: 1,
    difficulty: "",
    features: [],
    platforms: [],
    preferences: {
      frontend: "",
      backend: "",
      database: "",
      deployment: "",
    },
  });
  const [generatedProjects, setGeneratedProjects] = useState<
    GeneratedCodebase[]
  >([]);

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("codebase-generator-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "codebase-generator-dark-mode",
      JSON.stringify(isDarkMode)
    );
  }, [isDarkMode]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("codebase-generator-history");
    if (saved) {
      setGeneratedProjects(JSON.parse(saved));
    }
  }, []);

  const handleFeatureToggle = (feature: string) => {
    setRequirements((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setRequirements((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };
  const generateRecommendedStack = () => {
    const { difficulty, teamSize } = requirements;

    let recommendations = {
      frontend: "react",
      backend: "node",
      database: "postgresql",
      deployment: "vercel",
    };

    // 난이도별 추천
    if (difficulty === "beginner") {
      recommendations = {
        ...recommendations,
        frontend: "next",
        backend: "node",
        database: "sqlite",
      };
    } else if (difficulty === "enterprise") {
      recommendations = {
        ...recommendations,
        backend: "java",
        database: "postgresql",
      };
    }

    // 팀 규모별 추천
    if (teamSize >= 5) {
      recommendations = {
        ...recommendations,
        backend: "java",
        database: "postgresql",
      };
    }

    setRequirements((prev) => ({
      ...prev,
      preferences: recommendations,
    }));
  };

  const handleGenerate = async () => {
    if (!requirements.projectName || !requirements.difficulty) {
      alert("프로젝트명과 난이도를 입력해주세요.");
      return;
    }

    setIsGenerating(true);

    // 시뮬레이션된 코드베이스 생성
    setTimeout(() => {
      const mockStructure: ProjectStructure[] = [
        {
          type: "folder",
          name: "src",
          path: "/src",
          children: [
            { type: "folder", name: "components", path: "/src/components" },
            { type: "folder", name: "pages", path: "/src/pages" },
            { type: "folder", name: "utils", path: "/src/utils" },
            { type: "file", name: "App.tsx", path: "/src/App.tsx" },
            { type: "file", name: "index.tsx", path: "/src/index.tsx" },
          ],
        },
        { type: "file", name: "package.json", path: "/package.json" },
        { type: "file", name: "README.md", path: "/README.md" },
        { type: "file", name: ".gitignore", path: "/.gitignore" },
      ];

      const newProject: GeneratedCodebase = {
        id: Date.now().toString(),
        projectName: requirements.projectName,
        framework: requirements.preferences.frontend || "React",
        structure: mockStructure,
        dependencies: ["react", "typescript", "tailwindcss", "axios"],
        conventions: [
          "TypeScript 사용",
          "ESLint + Prettier 설정",
          "컴포넌트 기반 아키텍처",
          "Git Flow 브랜치 전략",
        ],
        timestamp: new Date().toLocaleString("ko-KR"),
        downloadUrl: "#download",
      };

      const updatedProjects = [newProject, ...generatedProjects];
      setGeneratedProjects(updatedProjects);
      localStorage.setItem(
        "codebase-generator-history",
        JSON.stringify(updatedProjects)
      );

      setIsGenerating(false);
      setActiveTab("history");
    }, 4000);
  };

  const clearHistory = () => {
    setGeneratedProjects([]);
    localStorage.removeItem("codebase-generator-history");
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return requirements.projectName && requirements.description;
      case 2:
        return requirements.targetUsers && requirements.difficulty;
      case 3:
        return requirements.platforms.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-cyan-900 text-white"
          : "bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 text-gray-900"
      }`}
    >
      <PageHeader
        title="코드베이스 생성기"
        description="프로젝트 요구사항을 분석하여 최적화된 코드베이스를 자동 생성합니다"
        icon="🚀"
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        storageKey="codebase-generator-dark-mode"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div
          className={`flex rounded-xl p-1 mb-8 ${
            isDarkMode ? "bg-gray-800/50" : "bg-white/50"
          } backdrop-blur-sm border ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "generate"
                ? isDarkMode
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "bg-cyan-500 text-white shadow-lg"
                : isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            🚀 프로젝트 생성
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "history"
                ? isDarkMode
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "bg-cyan-500 text-white shadow-lg"
                : isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📚 생성된 프로젝트 ({generatedProjects.length})
          </button>
        </div>

        {activeTab === "generate" && (
          <div
            className={`p-8 rounded-2xl ${
              isDarkMode
                ? "bg-gray-800/50 border border-gray-700"
                : "bg-white/70 border border-gray-200"
            } backdrop-blur-xl shadow-xl`}
          >
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep >= step
                          ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white"
                          : isDarkMode
                          ? "bg-gray-700 text-gray-400"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`w-24 h-1 mx-2 ${
                          currentStep > step
                            ? "bg-gradient-to-r from-cyan-500 to-teal-500"
                            : isDarkMode
                            ? "bg-gray-700"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {currentStep === 1 && "1단계: 프로젝트 기본 정보"}
                  {currentStep === 2 && "2단계: 타겟 사용자 & 난이도"}
                  {currentStep === 3 && "3단계: 플랫폼 & 기능"}
                  {currentStep === 4 && "4단계: 기술 스택 선택"}
                </h3>
              </div>
            </div>

            <div className="space-y-8">
              {/* Step 1: 기본 정보 */}
              {currentStep === 1 && (
                <>
                  <div>
                    <label
                      className={`block text-lg font-semibold mb-2 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      📝 프로젝트명 *
                    </label>
                    <input
                      type="text"
                      value={requirements.projectName}
                      onChange={(e) =>
                        setRequirements((prev) => ({
                          ...prev,
                          projectName: e.target.value,
                        }))
                      }
                      placeholder="예: 온라인 쇼핑몰, 할일 관리 앱, 블로그 플랫폼"
                      className={`w-full p-4 rounded-xl border-2 transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500"
                      } focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-lg font-semibold mb-2 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      📄 프로젝트 설명 *
                    </label>
                    <textarea
                      value={requirements.description}
                      onChange={(e) =>
                        setRequirements((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="프로젝트의 목적, 주요 기능, 해결하고자 하는 문제를 자세히 설명해주세요..."
                      rows={4}
                      className={`w-full p-4 rounded-xl border-2 transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500"
                      } focus:outline-none resize-none`}
                    />
                  </div>
                </>
              )}

              {/* Step 2: 사용자 & 난이도 */}
              {currentStep === 2 && (
                <>
                  <div>
                    <label
                      className={`block text-lg font-semibold mb-2 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      👥 타겟 사용자 *
                    </label>
                    <input
                      type="text"
                      value={requirements.targetUsers}
                      onChange={(e) =>
                        setRequirements((prev) => ({
                          ...prev,
                          targetUsers: e.target.value,
                        }))
                      }
                      placeholder="예: 20-30대 직장인, 개발자, 학생, 소상공인"
                      className={`w-full p-4 rounded-xl border-2 transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500"
                      } focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-lg font-semibold mb-4 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      👨‍💻 개발팀 규모
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {TEAM_SIZES.map((size) => (
                        <button
                          key={size.value}
                          onClick={() =>
                            setRequirements((prev) => ({
                              ...prev,
                              teamSize: size.value,
                            }))
                          }
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                            requirements.teamSize === size.value
                              ? "border-cyan-500 bg-cyan-500/10"
                              : isDarkMode
                              ? "border-gray-600 hover:border-gray-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="text-2xl mb-2">{size.icon}</div>
                          <div
                            className={`font-medium text-sm ${
                              isDarkMode ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            {size.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-lg font-semibold mb-4 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      📊 프로젝트 난이도 *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {DIFFICULTY_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          onClick={() =>
                            setRequirements((prev) => ({
                              ...prev,
                              difficulty: level.value,
                            }))
                          }
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                            requirements.difficulty === level.value
                              ? "border-cyan-500 bg-cyan-500/10"
                              : isDarkMode
                              ? "border-gray-600 hover:border-gray-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{level.icon}</span>
                            <span
                              className={`font-semibold ${
                                isDarkMode ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              {level.label}
                            </span>
                          </div>
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {level.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: 플랫폼 & 기능 */}
              {currentStep === 3 && (
                <>
                  <div>
                    <label
                      className={`block text-lg font-semibold mb-4 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      📱 지원할 플랫폼 *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {PLATFORMS.map((platform) => (
                        <button
                          key={platform.value}
                          onClick={() => handlePlatformToggle(platform.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                            requirements.platforms.includes(platform.value)
                              ? "border-cyan-500 bg-cyan-500/10"
                              : isDarkMode
                              ? "border-gray-600 hover:border-gray-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="text-2xl mb-2">{platform.icon}</div>
                          <div
                            className={`font-medium ${
                              isDarkMode ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            {platform.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-lg font-semibold mb-4 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      🔧 필요한 기능들
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {COMMON_FEATURES.map((feature) => (
                        <button
                          key={feature}
                          onClick={() => handleFeatureToggle(feature)}
                          className={`p-3 rounded-lg border-2 text-sm transition-all duration-200 ${
                            requirements.features.includes(feature)
                              ? "border-cyan-500 bg-cyan-500/10 text-cyan-600"
                              : isDarkMode
                              ? "border-gray-600 text-gray-300 hover:border-gray-500"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: 기술 스택 */}
              {currentStep === 4 && (
                <>
                  <div className="mb-6">
                    <button
                      onClick={generateRecommendedStack}
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    >
                      🤖 AI 추천 기술 스택 적용
                    </button>
                  </div>

                  {Object.entries(FRAMEWORK_OPTIONS).map(
                    ([category, options]) => (
                      <div key={category}>
                        <label
                          className={`block text-lg font-semibold mb-4 ${
                            isDarkMode ? "text-gray-200" : "text-gray-800"
                          }`}
                        >
                          {category === "frontend" && "🎨 프론트엔드"}
                          {category === "backend" && "⚙️ 백엔드"}
                          {category === "database" && "🗄️ 데이터베이스"}
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                          {options.map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                setRequirements((prev) => ({
                                  ...prev,
                                  preferences: {
                                    ...prev.preferences,
                                    [category]: option.value,
                                  },
                                }))
                              }
                              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                                requirements.preferences[
                                  category as keyof typeof requirements.preferences
                                ] === option.value
                                  ? "border-cyan-500 bg-cyan-500/10"
                                  : isDarkMode
                                  ? "border-gray-600 hover:border-gray-500"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <div className="text-2xl mb-2">{option.icon}</div>
                              <div
                                className={`font-medium text-sm ${
                                  isDarkMode ? "text-gray-200" : "text-gray-800"
                                }`}
                              >
                                {option.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    currentStep === 1
                      ? "bg-gray-400 cursor-not-allowed"
                      : isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ← 이전
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    disabled={!canProceedToNext()}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      !canProceedToNext()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white hover:scale-105"
                    }`}
                  >
                    다음 →
                  </button>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isGenerating
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white hover:scale-105 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        코드베이스 생성 중...
                      </div>
                    ) : (
                      "🚀 코드베이스 생성하기"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div
            className={`p-8 rounded-2xl ${
              isDarkMode
                ? "bg-gray-800/50 border border-gray-700"
                : "bg-white/70 border border-gray-200"
            } backdrop-blur-xl shadow-xl`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                🚀 생성된 프로젝트들
              </h3>
              {generatedProjects.length > 0 && (
                <button
                  onClick={clearHistory}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  🗑️ 히스토리 삭제
                </button>
              )}
            </div>

            {generatedProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚀</div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  아직 생성된 프로젝트가 없습니다
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  첫 번째 프로젝트를 생성해보세요!
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {generatedProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-6 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      isDarkMode
                        ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700/70"
                        : "bg-white/50 border-gray-200 hover:bg-white/70"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4
                          className={`text-xl font-semibold mb-2 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {project.projectName}
                        </h4>
                        <div className="flex items-center gap-4 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              isDarkMode
                                ? "bg-cyan-600/20 text-cyan-400"
                                : "bg-cyan-100 text-cyan-700"
                            }`}
                          >
                            {project.framework}
                          </span>
                          <span
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {project.timestamp}
                          </span>
                        </div>
                      </div>
                      <a
                        href={project.downloadUrl}
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                      >
                        다운로드 →
                      </a>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5
                          className={`text-sm font-medium mb-2 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          주요 의존성:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {project.dependencies.map((dep, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
                                isDarkMode
                                  ? "bg-gray-600 text-gray-300"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5
                          className={`text-sm font-medium mb-2 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          적용된 컨벤션:
                        </h5>
                        <ul
                          className={`text-xs space-y-1 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {project.conventions.map((convention, index) => (
                            <li key={index}>• {convention}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
