"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";

interface DesignRequest {
  projectType: string;
  industry: string;
  targetAudience: string;
  style: string;
  components: string[];
  colors: string;
  requirements: string;
}

interface GeneratedDesign {
  id: string;
  title: string;
  figmaUrl: string;
  thumbnail: string;
  components: string[];
  timestamp: string;
}

const PROJECT_TYPES = [
  { value: "web-app", label: "웹 애플리케이션", icon: "💻" },
  { value: "mobile-app", label: "모바일 앱", icon: "📱" },
  { value: "landing-page", label: "랜딩 페이지", icon: "🌐" },
  { value: "dashboard", label: "대시보드", icon: "📊" },
  { value: "e-commerce", label: "이커머스", icon: "🛒" },
  { value: "portfolio", label: "포트폴리오", icon: "🎨" },
];

const DESIGN_STYLES = [
  { value: "modern", label: "모던", icon: "✨" },
  { value: "minimal", label: "미니멀", icon: "⚪" },
  { value: "corporate", label: "기업형", icon: "🏢" },
  { value: "creative", label: "크리에이티브", icon: "🎭" },
  { value: "tech", label: "테크", icon: "🔧" },
  { value: "elegant", label: "우아한", icon: "💎" },
];

const INDUSTRIES = [
  { value: "tech", label: "기술/IT", icon: "💻" },
  { value: "finance", label: "금융", icon: "💰" },
  { value: "healthcare", label: "헬스케어", icon: "🏥" },
  { value: "education", label: "교육", icon: "📚" },
  { value: "retail", label: "리테일", icon: "🛍️" },
  { value: "startup", label: "스타트업", icon: "🚀" },
];

const COMMON_COMPONENTS = [
  "Header/Navigation",
  "Hero Section",
  "Feature Cards",
  "Testimonials",
  "Contact Form",
  "Footer",
  "Button Set",
  "Modal/Dialog",
  "Data Table",
  "Charts/Graphs",
];

export default function FigmaGeneratorPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "history">(
    "generate"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [designRequest, setDesignRequest] = useState<DesignRequest>({
    projectType: "",
    industry: "",
    targetAudience: "",
    style: "",
    components: [],
    colors: "",
    requirements: "",
  });
  const [generatedDesigns, setGeneratedDesigns] = useState<GeneratedDesign[]>(
    []
  );

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("figma-generator-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "figma-generator-dark-mode",
      JSON.stringify(isDarkMode)
    );
  }, [isDarkMode]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("figma-generator-history");
    if (saved) {
      setGeneratedDesigns(JSON.parse(saved));
    }
  }, []);

  const handleComponentToggle = (component: string) => {
    setDesignRequest((prev) => ({
      ...prev,
      components: prev.components.includes(component)
        ? prev.components.filter((c) => c !== component)
        : [...prev.components, component],
    }));
  };

  const handleGenerate = async () => {
    if (!designRequest.projectType || !designRequest.style) {
      alert("프로젝트 타입과 디자인 스타일을 선택해주세요.");
      return;
    }

    setIsGenerating(true);

    // 시뮬레이션된 디자인 생성 (실제로는 Figma API 연동)
    setTimeout(() => {
      const newDesign: GeneratedDesign = {
        id: Date.now().toString(),
        title: `${designRequest.projectType} 디자인`,
        figmaUrl: "https://figma.com/file/generated-design",
        thumbnail: "🎨",
        components: designRequest.components,
        timestamp: new Date().toLocaleString("ko-KR"),
      };

      const updatedDesigns = [newDesign, ...generatedDesigns];
      setGeneratedDesigns(updatedDesigns);
      localStorage.setItem(
        "figma-generator-history",
        JSON.stringify(updatedDesigns)
      );

      setIsGenerating(false);
      setActiveTab("history");
    }, 3000);
  };

  const clearHistory = () => {
    setGeneratedDesigns([]);
    localStorage.removeItem("figma-generator-history");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-pink-900 text-white"
          : "bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 text-gray-900"
      }`}
    >
      <PageHeader
        title="Figma 디자인 생성기"
        description="AI가 Figma를 활용하여 자동으로 UI/UX 디자인을 생성합니다"
        icon="🎨"
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        storageKey="figma-generator-dark-mode"
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
                  ? "bg-pink-600 text-white shadow-lg"
                  : "bg-pink-500 text-white shadow-lg"
                : isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            🎨 디자인 생성
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "history"
                ? isDarkMode
                  ? "bg-pink-600 text-white shadow-lg"
                  : "bg-pink-500 text-white shadow-lg"
                : isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📚 디자인 히스토리 ({generatedDesigns.length})
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
            <div className="space-y-8">
              {/* Project Type */}
              <div>
                <label
                  className={`block text-lg font-semibold mb-4 ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  📋 프로젝트 타입 *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() =>
                        setDesignRequest((prev) => ({
                          ...prev,
                          projectType: type.value,
                        }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        designRequest.projectType === type.value
                          ? "border-pink-500 bg-pink-500/10"
                          : isDarkMode
                          ? "border-gray-600 hover:border-gray-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div
                        className={`font-medium ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {type.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div>
                <label
                  className={`block text-lg font-semibold mb-4 ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  🏢 산업 분야
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry.value}
                      onClick={() =>
                        setDesignRequest((prev) => ({
                          ...prev,
                          industry: industry.value,
                        }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        designRequest.industry === industry.value
                          ? "border-pink-500 bg-pink-500/10"
                          : isDarkMode
                          ? "border-gray-600 hover:border-gray-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-2xl mb-2">{industry.icon}</div>
                      <div
                        className={`font-medium ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {industry.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Style */}
              <div>
                <label
                  className={`block text-lg font-semibold mb-4 ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  ✨ 디자인 스타일 *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {DESIGN_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() =>
                        setDesignRequest((prev) => ({
                          ...prev,
                          style: style.value,
                        }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        designRequest.style === style.value
                          ? "border-pink-500 bg-pink-500/10"
                          : isDarkMode
                          ? "border-gray-600 hover:border-gray-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-2xl mb-2">{style.icon}</div>
                      <div
                        className={`font-medium ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {style.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label
                  className={`block text-lg font-semibold mb-2 ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  👥 타겟 사용자
                </label>
                <input
                  type="text"
                  value={designRequest.targetAudience}
                  onChange={(e) =>
                    setDesignRequest((prev) => ({
                      ...prev,
                      targetAudience: e.target.value,
                    }))
                  }
                  placeholder="예: 20-30대 직장인, 기술에 관심이 많은 사용자"
                  className={`w-full p-4 rounded-xl border-2 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-pink-500"
                  } focus:outline-none`}
                />
              </div>

              {/* Components */}
              <div>
                <label
                  className={`block text-lg font-semibold mb-4 ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  🧩 포함할 컴포넌트
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COMMON_COMPONENTS.map((component) => (
                    <button
                      key={component}
                      onClick={() => handleComponentToggle(component)}
                      className={`p-3 rounded-lg border-2 text-sm transition-all duration-200 ${
                        designRequest.components.includes(component)
                          ? "border-pink-500 bg-pink-500/10 text-pink-600"
                          : isDarkMode
                          ? "border-gray-600 text-gray-300 hover:border-gray-500"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {component}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Preference */}
              <div>
                <label
                  className={`block text-lg font-semibold mb-2 ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  🎨 색상 선호도
                </label>
                <input
                  type="text"
                  value={designRequest.colors}
                  onChange={(e) =>
                    setDesignRequest((prev) => ({
                      ...prev,
                      colors: e.target.value,
                    }))
                  }
                  placeholder="예: 파란색 계열, 따뜻한 톤, 모노크롬"
                  className={`w-full p-4 rounded-xl border-2 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-pink-500"
                  } focus:outline-none`}
                />
              </div>

              {/* Additional Requirements */}
              <div>
                <label
                  className={`block text-lg font-semibold mb-2 ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  📝 추가 요구사항
                </label>
                <textarea
                  value={designRequest.requirements}
                  onChange={(e) =>
                    setDesignRequest((prev) => ({
                      ...prev,
                      requirements: e.target.value,
                    }))
                  }
                  placeholder="디자인에 대한 추가적인 요구사항이나 특별한 기능을 입력해주세요..."
                  rows={4}
                  className={`w-full p-4 rounded-xl border-2 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-pink-500"
                  } focus:outline-none resize-none`}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  !designRequest.projectType ||
                  !designRequest.style
                }
                className={`w-full p-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  isGenerating ||
                  !designRequest.projectType ||
                  !designRequest.style
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white hover:scale-105 shadow-lg hover:shadow-xl"
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    디자인 생성 중...
                  </div>
                ) : (
                  "🎨 Figma 디자인 생성하기"
                )}
              </button>
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
                🎨 생성된 디자인들
              </h3>
              {generatedDesigns.length > 0 && (
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

            {generatedDesigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  아직 생성된 디자인이 없습니다
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  첫 번째 디자인을 생성해보세요!
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {generatedDesigns.map((design) => (
                  <div
                    key={design.id}
                    className={`p-6 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      isDarkMode
                        ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700/70"
                        : "bg-white/50 border-gray-200 hover:bg-white/70"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{design.thumbnail}</div>
                        <div>
                          <h4
                            className={`text-lg font-semibold ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {design.title}
                          </h4>
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {design.timestamp}
                          </p>
                        </div>
                      </div>
                      <a
                        href={design.figmaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                      >
                        Figma에서 열기 →
                      </a>
                    </div>

                    {design.components.length > 0 && (
                      <div>
                        <h5
                          className={`text-sm font-medium mb-2 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          포함된 컴포넌트:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {design.components.map((component, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-xs ${
                                isDarkMode
                                  ? "bg-gray-600 text-gray-300"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {component}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
