"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Icons } from "@/components/Icons";
import { Stepper } from "@/components/Stepper";

type Step =
  | "idle"
  | "analyzing"
  | "generating_script"
  | "creating_workflow"
  | "running_workflow"
  | "creating_issue"
  | "done"
  | "error";

interface LogEntry {
  type: "log" | "error" | "result";
  message: string;
}

const automationSteps = [
  { id: "idle", name: "대기" },
  { id: "analyzing", name: "분석" },
  { id: "generating_script", name: "스크립트 생성" },
  { id: "creating_workflow", name: "워크플로우 생성" },
  { id: "running_workflow", name: "실행" },
  { id: "creating_issue", name: "리포트 생성" },
  { id: "done", name: "완료" },
];

export default function E2ETesterPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("e2e-tester-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
    const token = localStorage.getItem("github_token");
    if (token) {
      setGithubToken(token);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!repoUrl) {
      setLogs([{ type: "error", message: "GitHub 저장소 URL을 입력하세요." }]);
      return;
    }
    setIsLoading(true);
    setLogs([]);
    setStep("analyzing"); // Start with the first logical step

    try {
      const response = await fetch("/api/deploy-e2e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, githubToken }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.step) {
                setStep(data.step);
              }
              if (data.log) {
                setLogs((prev) => [
                  ...prev,
                  { type: "log", message: data.log },
                ]);
              }
              if (data.error) {
                setLogs((prev) => [
                  ...prev,
                  { type: "error", message: data.error },
                ]);
                setStep("error");
              }
              if (data.result) {
                setLogs((prev) => [
                  ...prev,
                  { type: "result", message: data.result },
                ]);
                setStep("done");
              }
            } catch (e) {
              console.error("Failed to parse stream data:", e);
            }
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      setLogs((prev) => [...prev, { type: "error", message: errorMessage }]);
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50"
      }`}
    >
      <PageHeader
        title="E2E / TestFlight 자동화"
        description="GitHub 저장소를 분석하여 TestFlight 배포를 위한 Fastlane 스크립트와 GitHub Actions 워크플로우를 자동으로 생성하고 실행합니다."
        icon="✈️"
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        storageKey="e2e-tester-dark-mode"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mt-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="repoUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                GitHub 저장소 URL
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="repoUrl"
                  id="repoUrl"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="githubToken"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                GitHub 토큰 (선택 사항)
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="githubToken"
                  id="githubToken"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  비공개 저장소 분석 또는 이슈 생성을 위해 토큰이 필요할 수
                  있습니다. 토큰은 저장되지 않습니다.
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="-ml-1 mr-3 h-5 w-5 text-white" />
                    자동화 진행 중...
                  </>
                ) : (
                  "자동화 시작"
                )}
              </button>
            </div>
          </form>
        </div>

        {(isLoading || logs.length > 0) && (
          <div className="mt-16 max-w-4xl mx-auto">
            <Stepper currentStep={step} steps={automationSteps} />
            <div className="mt-12 p-4 bg-gray-100 dark:bg-gray-800 rounded-md max-h-96 overflow-y-auto">
              <ul className="space-y-2">
                {logs.map((log, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-700 dark:text-gray-300 font-mono"
                  >
                    {log.type === "error" ? (
                      <span className="text-red-500">
                        <Icons.AlertTriangle className="inline-block mr-2 h-4 w-4" />
                        {log.message}
                      </span>
                    ) : log.type === "result" ? (
                      <span className="text-green-500">
                        <Icons.CheckCircle className="inline-block mr-2 h-4 w-4" />
                        <a
                          href={log.message}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-green-400"
                        >
                          자동화 결과 확인 (GitHub Issue)
                        </a>
                      </span>
                    ) : (
                      <span>{log.message}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
