"use client";

import { useEffect, useState } from "react";
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

const levelStyles: Record<
  LogLevel,
  { icon: ReactNode; badge: string; border: string; text: string }
> = {
  info: {
    icon: <Icons.Zap className="h-4 w-4" />,
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
    border: "border-blue-200 dark:border-blue-900/60",
    text: "text-blue-800 dark:text-blue-100",
  },
  success: {
    icon: <Icons.CheckCircle className="h-4 w-4" />,
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
    border: "border-emerald-200 dark:border-emerald-900/60",
    text: "text-emerald-800 dark:text-emerald-100",
  },
  warning: {
    icon: <Icons.AlertTriangle className="h-4 w-4" />,
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
    border: "border-amber-200 dark:border-amber-900/60",
    text: "text-amber-800 dark:text-amber-100",
  },
  error: {
    icon: <Icons.XCircle className="h-4 w-4" />,
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
    border: "border-rose-200 dark:border-rose-900/60",
    text: "text-rose-800 dark:text-rose-100",
  },
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
            "mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-3xl border px-6 py-8 shadow-xl backdrop-blur-sm transition-colors duration-300 sm:px-10",
            isDarkMode
              ? "border-slate-800/80 bg-slate-900/70"
              : "border-slate-200 bg-white/80",
          )}
        >
          <header className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              저장소를 분석하고 테스트를 자동으로 생성하세요
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              GitHub 저장소 URL을 입력하면 Gemini{" "}
              <span className="font-medium text-indigo-600 dark:text-indigo-300">
                (모델: gemini-2.5-pro)
              </span>
              가 Playwright 테스트 스크립트를 작성하고, 프로젝트에 PR을 생성한
              후 GitHub Actions 워크플로우를 실행합니다.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="repoUrl"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  GitHub 저장소 URL
                </label>
                <input
                  type="url"
                  name="repoUrl"
                  id="repoUrl"
                  required
                  className={cn(
                    "mt-2 w-full rounded-2xl border px-4 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2",
                    isDarkMode
                      ? "border-slate-700 bg-slate-900/80 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/50"
                      : "border-slate-200 bg-white text-slate-900 focus:border-indigo-400 focus:ring-indigo-400/40",
                  )}
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="githubToken"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  GitHub 토큰 (선택 사항)
                </label>
                <input
                  type="password"
                  name="githubToken"
                  id="githubToken"
                  className={cn(
                    "mt-2 w-full rounded-2xl border px-4 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2",
                    isDarkMode
                      ? "border-slate-700 bg-slate-900/80 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/50"
                      : "border-slate-200 bg-white text-slate-900 focus:border-indigo-400 focus:ring-indigo-400/40",
                  )}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
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
                className={cn(
                  "max-h-[28rem] overflow-y-auto rounded-3xl border p-6 shadow-inner transition-colors",
                  isDarkMode
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-slate-200 bg-white",
                )}
              >
                <header className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    실시간 로그
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {logs.length} entries
                  </span>
                </header>
                <ul className="space-y-4">
                  {logs.map((log) => {
                    const styles = levelStyles[log.level];
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
                                  <span className="text-sm font-semibold">
                                    {log.title}
                                  </span>
                                )}
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  {formatTimestamp(log.timestamp)}
                                </span>
                              </div>
                            </div>
                            <p className={cn("leading-relaxed", styles.text)}>
                              {log.message}
                            </p>
                            {log.details && log.details.length > 0 && (
                              <dl className="grid gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/60 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/40">
                                {log.details.map((detail) => (
                                  <div
                                    key={`${log.id}-${detail.label}`}
                                    className="flex justify-between gap-3"
                                  >
                                    <dt className="font-medium text-slate-500 dark:text-slate-400">
                                      {detail.label}
                                    </dt>
                                    <dd className="text-right text-slate-600 dark:text-slate-300">
                                      {detail.value}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                            {log.codeBlock && (
                              <pre className="rounded-2xl bg-slate-900/90 p-4 text-xs text-slate-100 shadow-inner">
                                <code>{log.codeBlock}</code>
                              </pre>
                            )}
                            {log.link && (
                              <a
                                href={log.link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 underline decoration-indigo-300 decoration-2 underline-offset-4 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
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
                    <h3 className="text-lg font-semibold">자동화 리포트</h3>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                        report.status === "success"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
                      )}
                    >
                      {report.status}
                    </span>
                  </header>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50/80 p-4 text-sm dark:bg-slate-900/60">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        모델 정보
                      </h4>
                      <p className="mt-2 text-slate-700 dark:text-slate-200">
                        {report.llm.provider} · {report.llm.model}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        테스트 스크립트는 Gemini가 저장소 컨텍스트를 분석해
                        생성했습니다.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50/80 p-4 text-sm dark:bg-slate-900/60">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        생성 아티팩트
                      </h4>
                      <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-200">
                        <li>
                          테스트 파일:{" "}
                          <span className="font-medium">
                            {report.testFile.path}
                          </span>
                        </li>
                        <li>브랜치: {report.testFile.branch}</li>
                      </ul>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        <a
                          href={report.workflowUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-indigo-200 px-3 py-1 font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-500/40 dark:text-indigo-200 dark:hover:bg-indigo-900/40"
                        >
                          워크플로우 로그 보기
                        </a>
                        {report.issueUrl && (
                          <a
                            href={report.issueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-200 dark:hover:bg-rose-900/40"
                          >
                            실패 리포트 확인
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {report.testIntents.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        테스트 시나리오 개요
                      </h4>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-200">
                        {report.testIntents.map((intent, index) => (
                          <li key={`${intent}-${index}`}>{intent}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="mt-6 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      스크립트 미리보기
                    </h4>
                    <pre className="mt-3 max-h-64 overflow-y-auto rounded-2xl bg-slate-900/90 p-4 text-xs text-slate-100 shadow-inner">
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
