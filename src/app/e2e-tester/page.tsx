"use client";

import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import PageHeader from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Icons } from "@/components/Icons";
import { Stepper } from "@/components/Stepper";
import { cn } from "@/lib/utils";

type Step =
  | "idle"
  | "analyzing"
  | "generating_test_script"
  | "creating_pull_request"
  | "running_tests"
  | "reporting_results"
  | "done"
  | "error";

type LogLevel = "info" | "success" | "warning" | "error";

interface LogDetail {
  label: string;
  value: string;
}

interface LogEntry {
  id: string;
  level: LogLevel;
  title?: string;
  message: string;
  details?: LogDetail[];
  codeBlock?: string;
  link?: { href: string; label: string };
  timestamp: string;
  isExpanded?: boolean;
}

interface ReportData {
  workflowUrl: string;
  status: string;
  llm: { provider: string; model: string };
  testFile: { path: string; branch: string };
  testIntents: string[];
  scriptPreview: string;
  repoUrl: string;
  issueUrl?: string;
}

const automationSteps: { id: Step; name: string }[] = [
  { id: "idle", name: "대기" },
  { id: "analyzing", name: "저장소 분석" },
  { id: "generating_test_script", name: "테스트 생성" },
  { id: "creating_pull_request", name: "PR 생성" },
  { id: "running_tests", name: "테스트 실행" },
  { id: "reporting_results", name: "결과 정리" },
  { id: "done", name: "완료" },
];

const getLevelStyles = (
  level: LogLevel,
  isDark: boolean,
): { icon: ReactNode; badge: string; border: string; text: string } => {
  const stylesMap = {
    info: {
      icon: <Icons.Zap className="h-4 w-4" />,
      badge: isDark
        ? "bg-blue-900/40 text-blue-200"
        : "bg-blue-100 text-blue-700",
      border: isDark ? "border-blue-900/60" : "border-blue-200",
      text: isDark ? "text-blue-100" : "text-blue-800",
    },
    success: {
      icon: <Icons.CheckCircle className="h-4 w-4" />,
      badge: isDark
        ? "bg-emerald-900/40 text-emerald-200"
        : "bg-emerald-100 text-emerald-700",
      border: isDark ? "border-emerald-900/60" : "border-emerald-200",
      text: isDark ? "text-emerald-100" : "text-emerald-800",
    },
    warning: {
      icon: <Icons.AlertTriangle className="h-4 w-4" />,
      badge: isDark
        ? "bg-amber-900/40 text-amber-200"
        : "bg-amber-100 text-amber-700",
      border: isDark ? "border-amber-900/60" : "border-amber-200",
      text: isDark ? "text-amber-100" : "text-amber-800",
    },
    error: {
      icon: <Icons.XCircle className="h-4 w-4" />,
      badge: isDark
        ? "bg-rose-900/40 text-rose-200"
        : "bg-rose-100 text-rose-700",
      border: isDark ? "border-rose-900/60" : "border-rose-200",
      text: isDark ? "text-rose-100" : "text-rose-800",
    },
  };
  return stylesMap[level];
};

const generateLogId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeLog = (input: unknown): LogEntry => {
  if (typeof input === "string") {
    return {
      id: generateLogId(),
      level: "info",
      message: input,
      timestamp: new Date().toISOString(),
    };
  }

  if (typeof input === "object" && input !== null) {
    const logObject = input as Partial<LogEntry> & {
      level?: LogLevel;
      title?: string;
      message?: string;
      timestamp?: string;
      details?: LogDetail[];
      codeBlock?: string;
      link?: { href: string; label: string };
    };

    return {
      id: generateLogId(),
      level: logObject.level ?? "info",
      title: logObject.title,
      message: logObject.message ?? "",
      details: logObject.details,
      codeBlock: logObject.codeBlock,
      link: logObject.link,
      timestamp: logObject.timestamp ?? new Date().toISOString(),
      isExpanded: logObject.codeBlock ? false : undefined, // codeBlock이 있으면 기본적으로 접힌 상태
    };
  }

  return {
    id: generateLogId(),
    level: "info",
    message: JSON.stringify(input),
    timestamp: new Date().toISOString(),
  };
};

const createErrorLog = (message: string): LogEntry => ({
  id: generateLogId(),
  level: "error",
  title: "에러",
  message,
  timestamp: new Date().toISOString(),
});

const createResultLog = (summary: ReportData): LogEntry => ({
  id: generateLogId(),
  level: summary.status === "success" ? "success" : "warning",
  title: "자동화 완료",
  message:
    summary.status === "success"
      ? "자동화가 성공적으로 완료되었습니다."
      : "자동화는 완료되었지만 경고 사항이 있습니다.",
  details: [
    { label: "LLM", value: `${summary.llm.provider} (${summary.llm.model})` },
    { label: "테스트 파일", value: summary.testFile.path },
    { label: "브랜치", value: summary.testFile.branch },
    { label: "결과", value: summary.status },
  ],
  link: {
    href: summary.workflowUrl,
    label: "워크플로우 결과 보기",
  },
  timestamp: new Date().toISOString(),
});

const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function E2ETesterPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const toggleLogExpanded = (logId: string) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === logId ? { ...log, isExpanded: !log.isExpanded } : log,
      ),
    );
  };

  // 새 로그가 추가될 때 자동 스크롤
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

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
      setLogs([createErrorLog("GitHub 저장소 URL을 입력하세요.")]);
      return;
    }
    setIsLoading(true);
    setLogs([]);
    setReport(null);
    setStep("analyzing");

    try {
      const response = await fetch("/api/deploy-e2e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, githubToken }),
      });

      if (!response.body) {
        throw new Error("서버로부터 응답을 받지 못했습니다.");
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
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.substring(6);
          try {
            const data = JSON.parse(dataStr);
            if (data.step) {
              setStep(data.step);
            }
            if (data.log) {
              setLogs((prev) => [...prev, normalizeLog(data.log)]);
            }
            if (data.error) {
              setLogs((prev) => [...prev, createErrorLog(data.error)]);
              setStep("error");
            }
            if (data.result) {
              const summary = data.result as ReportData;
              setReport(summary);
              setLogs((prev) => [...prev, createResultLog(summary)]);
              setStep("done");
            }
          } catch (parseError) {
            console.error("스트림 데이터를 파싱하지 못했습니다:", parseError);
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      setLogs((prev) => [...prev, createErrorLog(errorMessage)]);
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-500",
        isDarkMode
          ? "dark bg-slate-950 text-slate-100"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900",
      )}
    >
      <PageHeader
        title="E2E 테스트 자동화"
        description="LLM을 활용해 Playwright 테스트를 생성하고 GitHub Actions 워크플로우로 실행합니다."
        icon="🧪"
        isDarkMode={isDarkMode}
        setIsDarkMode={(value) => {
          setIsDarkMode(value);
          localStorage.setItem("e2e-tester-dark-mode", JSON.stringify(value));
        }}
        storageKey="e2e-tester-dark-mode"
      />

      <main className="container mx-auto px-4 py-10">
        <section
          className={cn(
            "mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-3xl border px-6 py-8 shadow-xl backdrop-blur-sm transition-colors duration-300 sm:px-12",
            isDarkMode
              ? "border-slate-800/80 bg-slate-900/70"
              : "border-slate-200 bg-white/80",
          )}
        >
          <header className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              저장소를 분석하고 테스트를 자동으로 생성하세요
            </h2>
            <p
              className={cn(
                "mt-3 text-base font-medium",
                isDarkMode ? "text-slate-300" : "text-black",
              )}
            >
              GitHub 저장소 URL을 입력하면 Gemini{" "}
              <span
                className={cn(
                  "font-bold",
                  isDarkMode ? "text-indigo-300" : "text-indigo-600",
                )}
              >
                (모델: gemini-2.5-pro)
              </span>
              가 Playwright 테스트 스크립트와 GitHub Actions 워크플로우를
              생성하여 PR로 제출합니다. PR은 자동으로 병합되지 않으니 검토 후
              직접 병합하세요.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="repoUrl"
                  className={cn(
                    "block text-base font-bold",
                    isDarkMode ? "text-slate-200" : "text-black",
                  )}
                >
                  GitHub 저장소 URL
                </label>
                <input
                  type="url"
                  name="repoUrl"
                  id="repoUrl"
                  required
                  className={cn(
                    "mt-2 w-full rounded-2xl border px-4 py-3 text-base font-medium shadow-sm transition focus:outline-none focus:ring-2",
                    isDarkMode
                      ? "border-slate-700 bg-slate-900/80 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/50"
                      : "border-slate-200 bg-white text-black focus:border-indigo-400 focus:ring-indigo-400/40",
                  )}
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="githubToken"
                  className={cn(
                    "block text-base font-bold",
                    isDarkMode ? "text-slate-200" : "text-black",
                  )}
                >
                  GitHub 토큰 (선택 사항)
                </label>
                <input
                  type="password"
                  name="githubToken"
                  id="githubToken"
                  className={cn(
                    "mt-2 w-full rounded-2xl border px-4 py-3 text-base font-medium shadow-sm transition focus:outline-none focus:ring-2",
                    isDarkMode
                      ? "border-slate-700 bg-slate-900/80 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/50"
                      : "border-slate-200 bg-white text-black focus:border-indigo-400 focus:ring-indigo-400/40",
                  )}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                />
                <p
                  className={cn(
                    "mt-2 text-sm font-medium",
                    isDarkMode ? "text-slate-400" : "text-black",
                  )}
                >
                  비공개 저장소 분석 또는 이슈 생성을 위해 토큰이 필요할 수
                  있습니다. 토큰은 로컬 스토리지에 저장되지 않으며, 브라우저
                  메모리에서만 사용됩니다.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="h-5 w-5 text-white" />
                  자동화 진행 중...
                </>
              ) : (
                <>
                  <Icons.Play className="h-5 w-5" /> 자동화 시작
                </>
              )}
            </button>
          </form>

          {(isLoading || logs.length > 0) && (
            <section className="mt-6 space-y-8">
              <Stepper currentStep={step} steps={automationSteps} />

              <div
                ref={logContainerRef}
                className={cn(
                  "max-h-[28rem] overflow-y-auto rounded-3xl border p-6 shadow-inner transition-colors scroll-smooth",
                  isDarkMode
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-slate-200 bg-white",
                )}
              >
                <header className="mb-4 flex items-center justify-between">
                  <h3
                    className={cn(
                      "text-xl font-bold",
                      isDarkMode ? "text-slate-200" : "text-black",
                    )}
                  >
                    실시간 로그
                  </h3>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDarkMode ? "text-slate-500" : "text-black",
                    )}
                  >
                    {logs.length} entries
                  </span>
                </header>
                <ul className="space-y-4">
                  {logs.map((log) => {
                    const styles = getLevelStyles(log.level, isDarkMode);
                    return (
                      <li
                        key={log.id}
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-sm shadow-sm transition-colors",
                          styles.border,
                          isDarkMode ? "bg-slate-900/70" : "bg-white",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs",
                              styles.badge,
                            )}
                          >
                            {styles.icon}
                          </span>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {log.title && (
                                  <span
                                    className={cn(
                                      "text-base font-bold",
                                      isDarkMode
                                        ? "text-slate-100"
                                        : "text-black",
                                    )}
                                  >
                                    {log.title}
                                  </span>
                                )}
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    isDarkMode
                                      ? "text-slate-500"
                                      : "text-black",
                                  )}
                                >
                                  {formatTimestamp(log.timestamp)}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={cn(
                                    "flex-1 text-base font-medium leading-relaxed",
                                    styles.text,
                                  )}
                                >
                                  {log.message}
                                </p>
                                {log.codeBlock && (
                                  <button
                                    onClick={() => toggleLogExpanded(log.id)}
                                    className={cn(
                                      "flex flex-none items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all hover:scale-105",
                                      isDarkMode
                                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900",
                                    )}
                                  >
                                    {log.isExpanded ? (
                                      <>
                                        <span>접기</span>
                                        <span className="text-[10px]">▲</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>펼치기</span>
                                        <span className="text-[10px]">▼</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            {log.details && log.details.length > 0 && (
                              <dl
                                className={cn(
                                  "grid gap-2 rounded-2xl border px-3 py-2 text-sm",
                                  isDarkMode
                                    ? "border-slate-800 bg-slate-900/40"
                                    : "border-slate-200/60 bg-slate-50/60",
                                )}
                              >
                                {log.details.map((detail) => (
                                  <div
                                    key={`${log.id}-${detail.label}`}
                                    className="flex justify-between gap-3"
                                  >
                                    <dt
                                      className={cn(
                                        "font-bold",
                                        isDarkMode
                                          ? "text-slate-400"
                                          : "text-black",
                                      )}
                                    >
                                      {detail.label}
                                    </dt>
                                    <dd
                                      className={cn(
                                        "text-right font-semibold",
                                        isDarkMode
                                          ? "text-slate-300"
                                          : "text-black",
                                      )}
                                    >
                                      {detail.value}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                            {log.codeBlock && log.isExpanded && (
                              <div
                                className={cn(
                                  "animate-in slide-in-from-top-2 fade-in-0 duration-200 rounded-2xl p-4 text-xs shadow-inner border",
                                  isDarkMode
                                    ? "bg-slate-900/90 text-slate-100 border-slate-700"
                                    : "bg-slate-100 text-slate-900 border-slate-300",
                                )}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span
                                    className={cn(
                                      "text-[10px] font-bold uppercase tracking-wider",
                                      isDarkMode
                                        ? "text-slate-400"
                                        : "text-slate-600",
                                    )}
                                  >
                                    {log.title?.includes("LLM") ||
                                    log.title?.includes("프롬프트")
                                      ? "프롬프트 / 응답"
                                      : "코드 미리보기"}
                                  </span>
                                </div>
                                <pre className="overflow-x-auto max-h-96 overflow-y-auto">
                                  <code className="text-xs leading-relaxed">
                                    {log.codeBlock}
                                  </code>
                                </pre>
                              </div>
                            )}
                            {log.link && (
                              <a
                                href={log.link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "inline-flex items-center gap-1 text-sm font-semibold underline decoration-2 underline-offset-4 transition",
                                  isDarkMode
                                    ? "text-indigo-300 decoration-indigo-400 hover:text-indigo-200"
                                    : "text-indigo-600 decoration-indigo-300 hover:text-indigo-500",
                                )}
                              >
                                {log.link.label}
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {report && (
                <section
                  className={cn(
                    "rounded-3xl border p-6 shadow-lg transition-colors",
                    isDarkMode
                      ? "border-slate-800 bg-slate-900/70"
                      : "border-slate-200 bg-white",
                  )}
                >
                  <header className="mb-4 flex items-center justify-between">
                    <h3
                      className={cn(
                        "text-xl font-bold",
                        isDarkMode ? "text-slate-200" : "text-black",
                      )}
                    >
                      자동화 리포트
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                        report.status === "success"
                          ? isDarkMode
                            ? "bg-emerald-900/40 text-emerald-200"
                            : "bg-emerald-100 text-emerald-700"
                          : isDarkMode
                          ? "bg-amber-900/40 text-amber-200"
                          : "bg-amber-100 text-amber-700",
                      )}
                    >
                      {report.status}
                    </span>
                  </header>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div
                      className={cn(
                        "rounded-2xl p-4 text-sm",
                        isDarkMode ? "bg-slate-900/60" : "bg-slate-50/80",
                      )}
                    >
                      <h4
                        className={cn(
                          "text-xs font-bold uppercase tracking-wide",
                          isDarkMode ? "text-slate-400" : "text-slate-600",
                        )}
                      >
                        모델 정보
                      </h4>
                      <p
                        className={cn(
                          "mt-2 font-semibold",
                          isDarkMode ? "text-slate-200" : "text-black",
                        )}
                      >
                        {report.llm.provider} · {report.llm.model}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-xs font-medium",
                          isDarkMode ? "text-slate-400" : "text-slate-600",
                        )}
                      >
                        테스트 스크립트는 Gemini가 저장소 컨텍스트를 분석해
                        생성했습니다.
                      </p>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl p-4 text-sm",
                        isDarkMode ? "bg-slate-900/60" : "bg-slate-50/80",
                      )}
                    >
                      <h4
                        className={cn(
                          "text-xs font-bold uppercase tracking-wide",
                          isDarkMode ? "text-slate-400" : "text-slate-600",
                        )}
                      >
                        생성 아티팩트
                      </h4>
                      <ul
                        className={cn(
                          "mt-2 space-y-1 font-medium",
                          isDarkMode ? "text-slate-200" : "text-black",
                        )}
                      >
                        <li>
                          테스트 파일:{" "}
                          <span className="font-bold">
                            {report.testFile.path}
                          </span>
                        </li>
                        <li>
                          브랜치:{" "}
                          <span className="font-bold">
                            {report.testFile.branch}
                          </span>
                        </li>
                      </ul>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        <a
                          href={report.workflowUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-3 py-1 font-bold transition",
                            isDarkMode
                              ? "border-indigo-500/40 text-indigo-200 hover:bg-indigo-900/40"
                              : "border-indigo-200 text-indigo-600 hover:bg-indigo-50",
                          )}
                        >
                          워크플로우 로그 보기
                        </a>
                        {report.issueUrl && (
                          <a
                            href={report.issueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-3 py-1 font-bold transition",
                              isDarkMode
                                ? "border-rose-500/40 text-rose-200 hover:bg-rose-900/40"
                                : "border-rose-200 text-rose-600 hover:bg-rose-50",
                            )}
                          >
                            실패 리포트 확인
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {report.testIntents.length > 0 && (
                    <div
                      className={cn(
                        "mt-6 rounded-2xl border p-4 text-sm",
                        isDarkMode
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200/60 bg-slate-50/80",
                      )}
                    >
                      <h4
                        className={cn(
                          "text-xs font-bold uppercase tracking-wide",
                          isDarkMode ? "text-slate-400" : "text-slate-600",
                        )}
                      >
                        테스트 시나리오 개요
                      </h4>
                      <ol
                        className={cn(
                          "mt-2 list-decimal space-y-1 pl-5 font-medium",
                          isDarkMode ? "text-slate-200" : "text-black",
                        )}
                      >
                        {report.testIntents.map((intent, index) => (
                          <li key={`${intent}-${index}`}>{intent}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div
                    className={cn(
                      "mt-6 rounded-2xl border p-4 text-sm",
                      isDarkMode
                        ? "border-slate-800 bg-slate-900/60"
                        : "border-slate-200/60 bg-slate-50/80",
                    )}
                  >
                    <h4
                      className={cn(
                        "text-xs font-bold uppercase tracking-wide",
                        isDarkMode ? "text-slate-400" : "text-slate-600",
                      )}
                    >
                      스크립트 미리보기
                    </h4>
                    <pre
                      className={cn(
                        "mt-3 max-h-64 overflow-y-auto rounded-2xl p-4 text-xs shadow-inner",
                        isDarkMode
                          ? "bg-slate-900/90 text-slate-100"
                          : "bg-slate-100 text-slate-900",
                      )}
                    >
                      <code>{report.scriptPreview}</code>
                    </pre>
                  </div>
                </section>
              )}
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
