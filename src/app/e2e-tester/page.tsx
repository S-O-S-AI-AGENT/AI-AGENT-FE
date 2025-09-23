"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icons } from "../../components/Icons";

interface TestStep {
  action: "navigate" | "click" | "fill" | "expect" | "wait";
  selector: string;
  value: string;
}

interface Test {
  id: number;
  name: string;
  url: string;
  steps: TestStep[];
  status: "idle" | "running" | "passed" | "failed";
}

interface TestResult {
  testId: number;
  testName: string;
  status: "passed" | "failed";
  duration: number;
  error?: string;
  screenshot?: string;
}

export default function E2ETester() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tests, setTests] = useState<Test[]>([
    {
      id: 1,
      name: "로그인 플로우 테스트",
      url: "https://example.com/login",
      steps: [
        {
          action: "navigate",
          selector: "",
          value: "https://example.com/login",
        },
        { action: "fill", selector: "#email", value: "test@example.com" },
        { action: "fill", selector: "#password", value: "password123" },
        { action: "click", selector: "#login-button", value: "" },
        { action: "expect", selector: ".welcome-message", value: "환영합니다" },
      ],
      status: "idle",
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState<"tests" | "results">("tests");

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("e2e-tester-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("e2e-tester-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const addTest = () => {
    const newTest: Test = {
      id: Date.now(),
      name: "새 테스트",
      url: "",
      steps: [{ action: "navigate", selector: "", value: "" }],
      status: "idle",
    };
    setTests([...tests, newTest]);
  };

  const updateTest = (testId: number, field: string, value: string) => {
    setTests(
      tests.map((test) =>
        test.id === testId ? { ...test, [field]: value } : test
      )
    );
  };

  const addStep = (testId: number) => {
    setTests(
      tests.map((test) => {
        if (test.id === testId) {
          return {
            ...test,
            steps: [
              ...test.steps,
              { action: "click", selector: "", value: "" },
            ],
          };
        }
        return test;
      })
    );
  };

  const updateStep = (
    testId: number,
    stepIndex: number,
    field: string,
    value: string
  ) => {
    setTests(
      tests.map((test) => {
        if (test.id === testId) {
          const updatedSteps = test.steps.map((step, index) =>
            index === stepIndex ? { ...step, [field]: value } : step
          );
          return { ...test, steps: updatedSteps };
        }
        return test;
      })
    );
  };

  const removeStep = (testId: number, stepIndex: number) => {
    setTests(
      tests.map((test) => {
        if (test.id === testId) {
          return {
            ...test,
            steps: test.steps.filter((_, index) => index !== stepIndex),
          };
        }
        return test;
      })
    );
  };

  const deleteTest = (testId: number) => {
    setTests(tests.filter((test) => test.id !== testId));
  };

  const runTests = async () => {
    setIsRunning(true);
    setActiveTab("results");
    const mockResults: TestResult[] = [];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];

      // 테스트 실행 시뮬레이션
      setTests((prev) =>
        prev.map((t) =>
          t.id === test.id ? { ...t, status: "running" as const } : t
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const success = Math.random() > 0.3; // 70% 성공률

      setTests((prev) =>
        prev.map((t) =>
          t.id === test.id
            ? {
                ...t,
                status: success ? ("passed" as const) : ("failed" as const),
              }
            : t
        )
      );

      mockResults.push({
        testId: test.id,
        testName: test.name,
        status: success ? "passed" : "failed",
        duration: Math.floor(Math.random() * 3000) + 1000,
        error: success
          ? undefined
          : "요소를 찾을 수 없습니다: .welcome-message",
        screenshot: success ? undefined : "/api/screenshot/error.png",
      });
    }

    setResults(mockResults);
    setIsRunning(false);
  };

  const actionIcons = {
    navigate: "🌐",
    click: "👆",
    fill: "✍️",
    expect: "✅",
    wait: "⏳",
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white"
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
                <Icons.ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <Icons.TestTube className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    E2E 자동 테스터
                  </h1>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Playwright 기반 자동화 테스트
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
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-8">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("tests")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "tests"
                    ? isDarkMode
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-purple-600 text-white shadow-lg"
                    : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                🧪 테스트 관리
              </button>
              <button
                onClick={() => setActiveTab("results")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "results"
                    ? isDarkMode
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-purple-600 text-white shadow-lg"
                    : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                📊 실행 결과 {results.length > 0 && `(${results.length})`}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={addTest}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Icons.Plus className="h-4 w-4" />새 테스트
              </button>
              <button
                onClick={runTests}
                disabled={isRunning || tests.length === 0}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    실행 중...
                  </>
                ) : (
                  <>
                    <Icons.Play className="h-4 w-4" />
                    모든 테스트 실행
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tests Tab */}
          {activeTab === "tests" && (
            <div className="space-y-6">
              {tests.length === 0 ? (
                <div
                  className={`text-center py-16 rounded-2xl ${
                    isDarkMode ? "bg-gray-800/50" : "bg-white/70"
                  } backdrop-blur-sm border ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Icons.TestTube className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    테스트가 없습니다
                  </h3>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } mb-6`}
                  >
                    새 테스트를 추가하여 E2E 테스트를 시작해보세요
                  </p>
                  <button
                    onClick={addTest}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    첫 번째 테스트 만들기
                  </button>
                </div>
              ) : (
                tests.map((test) => (
                  <div
                    key={test.id}
                    className={`rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
                      isDarkMode
                        ? "bg-gray-800/70 border border-gray-700"
                        : "bg-white/80 border border-gray-200"
                    } backdrop-blur-sm p-6`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          value={test.name}
                          onChange={(e) =>
                            updateTest(test.id, "name", e.target.value)
                          }
                          className={`text-xl font-bold bg-transparent border-b-2 border-transparent hover:border-purple-300 focus:border-purple-500 focus:outline-none transition-colors duration-200 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                          placeholder="테스트 이름"
                        />
                        <div className="flex items-center gap-2">
                          {test.status === "idle" && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              <Icons.Clock className="h-4 w-4" />
                              <span className="text-sm">대기중</span>
                            </div>
                          )}
                          {test.status === "running" && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                              <span className="text-sm">실행중</span>
                            </div>
                          )}
                          {test.status === "passed" && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                              <Icons.CheckCircle className="h-4 w-4" />
                              <span className="text-sm">성공</span>
                            </div>
                          )}
                          {test.status === "failed" && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
                              <Icons.XCircle className="h-4 w-4" />
                              <span className="text-sm">실패</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTest(test.id)}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                          isDarkMode
                            ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            : "text-red-500 hover:text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <Icons.Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mb-6">
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        🌐 시작 URL
                      </label>
                      <input
                        type="url"
                        value={test.url}
                        onChange={(e) =>
                          updateTest(test.id, "url", e.target.value)
                        }
                        placeholder="https://example.com"
                        className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                            : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                        } focus:outline-none focus:ring-4`}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          📝 테스트 단계
                        </h4>
                        <button
                          onClick={() => addStep(test.id)}
                          className={`text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                            isDarkMode
                              ? "text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                              : "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          }`}
                        >
                          <Icons.Plus className="h-4 w-4" />
                          단계 추가
                        </button>
                      </div>

                      {test.steps.map((step, stepIndex) => (
                        <div
                          key={stepIndex}
                          className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                            isDarkMode
                              ? "bg-gray-700/50 hover:bg-gray-700/70"
                              : "bg-gray-50/50 hover:bg-gray-50"
                          }`}
                        >
                          <div className="text-2xl">
                            {actionIcons[step.action]}
                          </div>

                          <select
                            value={step.action}
                            onChange={(e) =>
                              updateStep(
                                test.id,
                                stepIndex,
                                "action",
                                e.target.value
                              )
                            }
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="navigate">이동</option>
                            <option value="click">클릭</option>
                            <option value="fill">입력</option>
                            <option value="expect">확인</option>
                            <option value="wait">대기</option>
                          </select>

                          {step.action !== "navigate" && (
                            <input
                              type="text"
                              value={step.selector}
                              onChange={(e) =>
                                updateStep(
                                  test.id,
                                  stepIndex,
                                  "selector",
                                  e.target.value
                                )
                              }
                              placeholder="CSS 셀렉터"
                              className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors duration-200 ${
                                isDarkMode
                                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                              }`}
                            />
                          )}

                          <input
                            type="text"
                            value={step.value}
                            onChange={(e) =>
                              updateStep(
                                test.id,
                                stepIndex,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder={
                              step.action === "navigate"
                                ? "URL"
                                : step.action === "fill"
                                ? "입력값"
                                : step.action === "wait"
                                ? "시간(ms)"
                                : "예상값"
                            }
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors duration-200 ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                          />

                          <button
                            onClick={() => removeStep(test.id, stepIndex)}
                            className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                              isDarkMode
                                ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                : "text-red-500 hover:text-red-600 hover:bg-red-50"
                            }`}
                          >
                            <Icons.Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && (
            <div
              className={`rounded-2xl shadow-xl p-6 ${
                isDarkMode
                  ? "bg-gray-800/70 border border-gray-700"
                  : "bg-white/80 border border-gray-200"
              } backdrop-blur-sm`}
            >
              <h3
                className={`text-xl font-semibold mb-6 flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Icons.Settings className="h-6 w-6" />
                📊 테스트 실행 결과
              </h3>

              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div
                      key={result.testId}
                      className={`p-4 rounded-xl border-l-4 transition-all duration-200 ${
                        result.status === "passed"
                          ? isDarkMode
                            ? "border-green-500 bg-green-900/20"
                            : "border-green-500 bg-green-50"
                          : isDarkMode
                          ? "border-red-500 bg-red-900/20"
                          : "border-red-500 bg-red-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xl ${
                              result.status === "passed" ? "✅" : "❌"
                            }`}
                          >
                            {result.status === "passed" ? "✅" : "❌"}
                          </span>
                          <span
                            className={`font-semibold ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {result.testName}
                          </span>
                        </div>
                        <span
                          className={`text-sm px-3 py-1 rounded-full font-medium ${
                            result.status === "passed"
                              ? isDarkMode
                                ? "bg-green-800 text-green-200"
                                : "bg-green-200 text-green-800"
                              : isDarkMode
                              ? "bg-red-800 text-red-200"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {result.status === "passed" ? "성공" : "실패"}
                        </span>
                      </div>
                      <div
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        ⏱️ 실행 시간: {result.duration}ms
                      </div>
                      {result.error && (
                        <div
                          className={`text-sm mt-2 p-2 rounded-lg ${
                            isDarkMode
                              ? "text-red-300 bg-red-900/30"
                              : "text-red-600 bg-red-100"
                          }`}
                        >
                          🚨 오류: {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Icons.TestTube className="h-8 w-8 text-white" />
                  </div>
                  <h4
                    className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    아직 실행된 테스트가 없습니다
                  </h4>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } mb-4`}
                  >
                    테스트를 실행하면 결과가 여기에 표시됩니다
                  </p>
                  <button
                    onClick={() => setActiveTab("tests")}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    테스트 관리로 이동
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Help Cards */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div
              className={`rounded-xl p-6 ${
                isDarkMode
                  ? "bg-green-900/20 border border-green-700/30"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <h4
                className={`font-semibold mb-3 ${
                  isDarkMode ? "text-green-300" : "text-green-900"
                }`}
              >
                🧪 지원하는 액션
              </h4>
              <ul
                className={`text-sm space-y-2 ${
                  isDarkMode ? "text-green-200" : "text-green-800"
                }`}
              >
                <li className="flex items-center gap-2">
                  <span>🌐</span> <strong>이동</strong>: 페이지로 이동
                </li>
                <li className="flex items-center gap-2">
                  <span>👆</span> <strong>클릭</strong>: 요소 클릭
                </li>
                <li className="flex items-center gap-2">
                  <span>✍️</span> <strong>입력</strong>: 텍스트 입력
                </li>
                <li className="flex items-center gap-2">
                  <span>✅</span> <strong>확인</strong>: 요소 존재 확인
                </li>
                <li className="flex items-center gap-2">
                  <span>⏳</span> <strong>대기</strong>: 지정 시간 대기
                </li>
              </ul>
            </div>

            <div
              className={`rounded-xl p-6 ${
                isDarkMode
                  ? "bg-blue-900/20 border border-blue-700/30"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <h5
                className={`font-semibold mb-3 ${
                  isDarkMode ? "text-blue-300" : "text-blue-900"
                }`}
              >
                💡 사용 팁
              </h5>
              <ul
                className={`text-sm space-y-2 ${
                  isDarkMode ? "text-blue-200" : "text-blue-800"
                }`}
              >
                <li className="flex items-start gap-2">
                  <span>📝</span> CSS 셀렉터를 정확히 입력하세요
                </li>
                <li className="flex items-start gap-2">
                  <span>⏰</span> 동적 콘텐츠는 대기 시간을 추가하세요
                </li>
                <li className="flex items-start gap-2">
                  <span>🔄</span> 테스트 순서를 논리적으로 구성하세요
                </li>
                <li className="flex items-start gap-2">
                  <span>🎯</span> 예상 결과를 명확히 정의하세요
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
