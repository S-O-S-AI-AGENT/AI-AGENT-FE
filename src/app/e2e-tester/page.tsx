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

interface WorkflowLogFile {
  fileName: string;
  content: string;
  truncated: boolean;
}

interface WorkflowAnalysis {
  statusOverview: string;
  successRate: string;
  rootCauses: string[];
  resolutionSteps: string[];
  risks: string[];
  confidence: string;
  fullReport: string;
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
  workflowLogs: WorkflowLogFile[];
  workflowAnalysis?: WorkflowAnalysis;
}

const MAX_LOG_CHARACTERS = 15000;
const MAX_SAVED_CONFIGS = 10;

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const formatInlineMarkdown = (value: string) => {
  let result = escapeHtml(value);
  result = result.replace(
    /\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline decoration-dashed">$1</a>',
  );
  result = result.replace(
    /`([^`]+)`/g,
    '<code class="llm-inline-code">$1</code>',
  );
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(/\n/g, "<br />");
  return result;
};

const renderMarkdownBlocks = (value: string) => {
  const lines = value.split(/\r?\n/);
  const elements: ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const listIndex = elements.length;
    elements.push(
      <ul key={`list-${listIndex}`} className="mt-2 list-disc space-y-1 pl-5">
        {listBuffer.map((item, idx) => (
          <li
            key={`list-${listIndex}-item-${idx}`}
            dangerouslySetInnerHTML={{
              __html: formatInlineMarkdown(item),
            }}
          />
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^[-*]\s+/, ""));
      return;
    }

    flushList();
    elements.push(
      <p
        key={`para-${index}`}
        className="mt-2 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: formatInlineMarkdown(trimmed),
        }}
      />,
    );
  });

  flushList();
  return elements;
};

interface SavedConfig {
  id: string;
  repoUrl: string;
  includeToken: boolean;
  token?: string;
  createdAt: string;
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

const createResultLog = (summary: ReportData): LogEntry => {
  const details: LogDetail[] = [
    { label: "LLM", value: `${summary.llm.provider} (${summary.llm.model})` },
    { label: "테스트 파일", value: summary.testFile.path },
    { label: "브랜치", value: summary.testFile.branch },
    { label: "결과", value: summary.status },
  ];

  if (summary.workflowAnalysis?.successRate) {
    details.push({
      label: "예상 성공률",
      value: summary.workflowAnalysis.successRate,
    });
  }

  return {
    id: generateLogId(),
    level: summary.status === "success" ? "success" : "warning",
    title: "자동화 완료",
    message:
      summary.status === "success"
        ? "자동화가 성공적으로 완료되었습니다."
        : "자동화는 완료되었지만 경고 사항이 있습니다.",
    details,
    link: {
      href: summary.workflowUrl,
      label: "워크플로우 결과 보기",
    },
    timestamp: new Date().toISOString(),
  };
};

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
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [rememberToken, setRememberToken] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const hasHydratedPreferences = useRef(false);

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
    const savedRepoUrl = localStorage.getItem("e2e-tester-repo-url");
    if (savedRepoUrl) {
      setRepoUrl(savedRepoUrl);
    }
    const shouldRemember = localStorage.getItem("e2e-tester-remember-token");
    if (shouldRemember) {
      setRememberToken(shouldRemember === "true");
    }
    const savedToken = localStorage.getItem("e2e-tester-token");
    if (savedToken && shouldRemember === "true") {
      setGithubToken(savedToken);
    }
    const storedConfigs = localStorage.getItem("e2e-tester-configs");
    if (storedConfigs) {
      try {
        const parsed: SavedConfig[] = JSON.parse(storedConfigs);
        setSavedConfigs(parsed);
      } catch (error) {
        console.warn("저장된 설정을 불러오는 중 오류가 발생했습니다.", error);
      }
    }
    const timer = window.setTimeout(() => {
      hasHydratedPreferences.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!repoUrl) {
      localStorage.removeItem("e2e-tester-repo-url");
      return;
    }
    localStorage.setItem("e2e-tester-repo-url", repoUrl);
  }, [repoUrl]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!hasHydratedPreferences.current) {
      return;
    }
    localStorage.setItem("e2e-tester-remember-token", rememberToken.toString());
    if (!rememberToken) {
      localStorage.removeItem("e2e-tester-token");
      setSavedConfigs((prev) => {
        let changed = false;
        const next = prev.map((config) => {
          if (!config.includeToken) {
            return config;
          }
          changed = true;
          return { ...config, includeToken: false, token: undefined };
        });
        return changed ? next : prev;
      });
      return;
    }
    if (githubToken) {
      localStorage.setItem("e2e-tester-token", githubToken);
    }
  }, [rememberToken, githubToken]);

  useEffect(() => {
    localStorage.setItem("e2e-tester-configs", JSON.stringify(savedConfigs));
  }, [savedConfigs]);

  const addSavedConfig = (config: SavedConfig) => {
    setSavedConfigs((prev) => [config, ...prev].slice(0, MAX_SAVED_CONFIGS));
  };

  const handleSaveConfig = () => {
    if (!repoUrl) {
      return;
    }
    const newConfig: SavedConfig = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `config-${Date.now().toString(36)}`,
      repoUrl,
      includeToken: rememberToken && Boolean(githubToken),
      token: rememberToken ? githubToken : undefined,
      createdAt: new Date().toISOString(),
    };
    addSavedConfig(newConfig);
  };

  const handleApplyConfig = (config: SavedConfig) => {
    setRepoUrl(config.repoUrl);
    if (config.includeToken && config.token) {
      setGithubToken(config.token);
      setRememberToken(true);
    } else {
      setGithubToken("");
    }
  };

  const handleDeleteConfig = (id: string) => {
    setSavedConfigs((prev) => prev.filter((config) => config.id !== id));
  };

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

    // 네트워크 타임아웃 감지를 위한 변수
    let lastActivityTime = Date.now();
    const NETWORK_TIMEOUT = 60000; // 60초 동안 응답이 없으면 타임아웃

    // 타임아웃 체크 인터벌
    const timeoutChecker = setInterval(() => {
      const elapsed = Date.now() - lastActivityTime;
      if (elapsed > NETWORK_TIMEOUT) {
        console.error(`네트워크 타임아웃: ${elapsed}ms 동안 응답 없음`);
        setLogs((prev) => [
          ...prev,
          createErrorLog(
            `네트워크 타임아웃: ${Math.round(elapsed / 1000)}초 동안 서버 응답이 없습니다. 클라우드 환경의 프록시/로드밸런서가 연결을 끊었을 가능성이 있습니다.`,
          ),
        ]);
      }
    }, 10000); // 10초마다 체크

    try {
      console.log("[E2E Tester] 요청 시작:", {
        repoUrl,
        hasToken: !!githubToken,
        timestamp: new Date().toISOString(),
      });

      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => {
        controller.abort();
        console.error("[E2E Tester] Fetch 타임아웃 (5분)");
      }, 300000); // 5분 타임아웃

      const response = await fetch("/api/deploy-e2e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, githubToken }),
        signal: controller.signal,
      });

      clearTimeout(fetchTimeout);
      lastActivityTime = Date.now();

      console.log("[E2E Tester] 응답 수신:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[E2E Tester] HTTP 에러:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `서버 에러 (${response.status}): ${errorText || response.statusText}`,
        );
      }

      if (!response.body) {
        throw new Error("서버로부터 응답 본문을 받지 못했습니다.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let messageCount = 0;

      console.log("[E2E Tester] 스트림 읽기 시작");

      while (true) {
        let readResult;
        try {
          readResult = await reader.read();
          lastActivityTime = Date.now(); // 데이터 수신 시 활동 시간 갱신
        } catch (readError) {
          console.error("[E2E Tester] 스트림 읽기 에러:", {
            error: readError,
            errorName: readError instanceof Error ? readError.name : "Unknown",
            errorMessage:
              readError instanceof Error ? readError.message : String(readError),
            timestamp: new Date().toISOString(),
          });
          throw readError;
        }

        const { done, value } = readResult;

        if (done) {
          console.log("[E2E Tester] 스트림 종료:", {
            totalMessages: messageCount,
            timestamp: new Date().toISOString(),
          });
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.substring(6);
          try {
            const data = JSON.parse(dataStr);
            messageCount++;
            lastActivityTime = Date.now();

            console.log(`[E2E Tester] 메시지 #${messageCount}:`, {
              hasStep: !!data.step,
              hasLog: !!data.log,
              hasError: !!data.error,
              hasResult: !!data.result,
              step: data.step,
              logLevel: data.log?.level,
              timestamp: new Date().toISOString(),
            });

            if (data.step) {
              setStep(data.step);
            }
            if (data.log) {
              setLogs((prev) => [...prev, normalizeLog(data.log)]);
            }
            if (data.error) {
              console.error("[E2E Tester] 서버 에러 수신:", data.error);
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
            console.error("[E2E Tester] JSON 파싱 에러:", {
              error: parseError,
              rawData: dataStr.substring(0, 200),
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    } catch (error) {
      console.error("[E2E Tester] 최종 에러:", {
        error,
        errorType: error?.constructor?.name,
        errorName: error instanceof Error ? error.name : "Unknown",
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      let errorMessage = "알 수 없는 오류가 발생했습니다.";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "요청 시간이 초과되었습니다 (5분). 저장소가 너무 크거나 서버 응답이 느릴 수 있습니다.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = `네트워크 연결 실패: ${error.message}. 클라우드 환경에서는 프록시/로드밸런서 설정을 확인하세요.`;
        } else if (error.message.includes("NetworkError")) {
          errorMessage = `네트워크 에러: ${error.message}. 서버와의 연결이 끊어졌습니다.`;
        } else {
          errorMessage = error.message;
        }
      }

      setLogs((prev) => [
        ...prev,
        createErrorLog(errorMessage),
        createErrorLog(
          `상세 정보: ${error instanceof Error ? error.name : typeof error} - ${String(error)}`,
        ),
      ]);
      setStep("error");
    } finally {
      clearInterval(timeoutChecker);
      setIsLoading(false);
      console.log("[E2E Tester] 요청 완료:", {
        timestamp: new Date().toISOString(),
      });
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
                <label
                  className={cn(
                    "mt-3 flex items-center gap-2 text-sm font-medium",
                    isDarkMode ? "text-slate-300" : "text-black",
                  )}
                >
                  <input
                    type="checkbox"
                    className={cn(
                      "h-4 w-4 rounded border",
                      isDarkMode
                        ? "border-slate-600 bg-slate-900"
                        : "border-slate-300 bg-white",
                    )}
                    checked={rememberToken}
                    onChange={(event) => setRememberToken(event.target.checked)}
                  />
                  토큰 저장 허용 (개인 기기에서만 사용하세요)
                </label>
                <p
                  className={cn(
                    "mt-2 text-sm font-medium",
                    isDarkMode ? "text-slate-400" : "text-black",
                  )}
                >
                  비공개 저장소 분석 또는 이슈 생성을 위해 토큰이 필요할 수
                  있습니다. 기본적으로는 저장되지 않으며, 위 옵션을 선택하면
                  현재 브라우저 로컬 스토리지에 암호화 없이 보관됩니다.
                </p>
              </div>
            </div>

            <div
              className={cn(
                "rounded-3xl border p-4",
                isDarkMode
                  ? "border-slate-800 bg-slate-900/70"
                  : "border-slate-200 bg-slate-50/80",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3
                    className={cn(
                      "text-sm font-bold",
                      isDarkMode ? "text-slate-100" : "text-black",
                    )}
                  >
                    저장된 설정
                  </h3>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isDarkMode ? "text-slate-400" : "text-slate-600",
                    )}
                  >
                    자주 사용하는 저장소 정보를 저장해 두고 빠르게 불러올 수
                    있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={!repoUrl}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition",
                    isDarkMode
                      ? "bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 disabled:bg-slate-800 disabled:text-slate-500"
                      : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 disabled:bg-slate-100 disabled:text-slate-400",
                  )}
                >
                  <Icons.Save className="h-4 w-4" /> 현재 입력 저장
                </button>
              </div>

              {savedConfigs.length === 0 ? (
                <p
                  className={cn(
                    "mt-4 text-sm",
                    isDarkMode ? "text-slate-500" : "text-slate-600",
                  )}
                >
                  아직 저장된 설정이 없습니다.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {savedConfigs.map((config) => {
                    const created = new Date(config.createdAt).toLocaleString(
                      "ko-KR",
                      {
                        hour12: false,
                      },
                    );
                    return (
                      <li
                        key={config.id}
                        className={cn(
                          "flex flex-col gap-3 rounded-2xl border p-3 text-sm sm:flex-row sm:items-center sm:justify-between",
                          isDarkMode
                            ? "border-slate-800 bg-slate-950/40"
                            : "border-slate-200 bg-white",
                        )}
                      >
                        <div className="space-y-1">
                          <p className="font-semibold">{config.repoUrl}</p>
                          <p
                            className={cn(
                              "text-xs font-medium",
                              isDarkMode ? "text-slate-500" : "text-slate-600",
                            )}
                          >
                            저장 시각: {created}
                          </p>
                          {config.includeToken && (
                            <p
                              className={cn(
                                "text-xs font-medium",
                                isDarkMode
                                  ? "text-amber-300"
                                  : "text-amber-600",
                              )}
                            >
                              토큰 포함 저장됨
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApplyConfig(config)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition",
                              isDarkMode
                                ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                                : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200",
                            )}
                          >
                            <Icons.ArrowRight className="h-3.5 w-3.5" />{" "}
                            불러오기
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteConfig(config.id)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition",
                              isDarkMode
                                ? "bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
                                : "bg-rose-100 text-rose-600 hover:bg-rose-200",
                            )}
                          >
                            <Icons.Trash className="h-3.5 w-3.5" /> 삭제
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
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

                  {report.workflowAnalysis && (
                    <div
                      className={cn(
                        "mt-6 rounded-2xl border p-4 text-sm",
                        isDarkMode
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200/60 bg-slate-50/80",
                      )}
                    >
                      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h4
                          className={cn(
                            "text-xs font-bold uppercase tracking-wide",
                            isDarkMode ? "text-slate-400" : "text-slate-600",
                          )}
                        >
                          로그 기반 AI 분석
                        </h4>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          {report.workflowAnalysis.successRate && (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-3 py-1",
                                isDarkMode
                                  ? "border-emerald-500/40 text-emerald-200"
                                  : "border-emerald-200 text-emerald-600",
                              )}
                            >
                              성공률 {report.workflowAnalysis.successRate}
                            </span>
                          )}
                          {report.workflowAnalysis.confidence && (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-3 py-1",
                                isDarkMode
                                  ? "border-indigo-500/40 text-indigo-200"
                                  : "border-indigo-200 text-indigo-600",
                              )}
                            >
                              신뢰도 {report.workflowAnalysis.confidence}
                            </span>
                          )}
                        </div>
                      </header>

                      {report.workflowAnalysis.statusOverview && (
                        <p
                          className={cn(
                            "mt-4 text-base font-semibold",
                            isDarkMode ? "text-slate-100" : "text-slate-900",
                          )}
                        >
                          {report.workflowAnalysis.statusOverview}
                        </p>
                      )}

                      <div className="mt-4 space-y-4">
                        {report.workflowAnalysis.rootCauses.length > 0 && (
                          <section
                            className={cn(
                              "rounded-2xl border p-4",
                              isDarkMode
                                ? "border-rose-900/40 bg-rose-950/30 text-rose-200"
                                : "border-rose-200/40 bg-rose-50 text-rose-700",
                            )}
                          >
                            <header className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                              <Icons.AlertTriangle className="h-4 w-4" /> 원인
                              분석
                            </header>
                            <ul className="mt-3 space-y-2 pl-4 text-sm list-disc">
                              {report.workflowAnalysis.rootCauses.map(
                                (cause, index) => (
                                  <li
                                    key={`cause-${index}`}
                                    dangerouslySetInnerHTML={{
                                      __html: formatInlineMarkdown(cause),
                                    }}
                                  />
                                ),
                              )}
                            </ul>
                          </section>
                        )}

                        {report.workflowAnalysis.resolutionSteps.length > 0 && (
                          <section
                            className={cn(
                              "rounded-2xl border p-4",
                              isDarkMode
                                ? "border-emerald-900/40 bg-emerald-950/30 text-emerald-200"
                                : "border-emerald-200/40 bg-emerald-50 text-emerald-700",
                            )}
                          >
                            <header className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                              <Icons.CheckCircle className="h-4 w-4" /> 해결
                              방법
                            </header>
                            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                              {report.workflowAnalysis.resolutionSteps.map(
                                (stepItem, index) => (
                                  <li
                                    key={`resolution-${index}`}
                                    dangerouslySetInnerHTML={{
                                      __html: formatInlineMarkdown(stepItem),
                                    }}
                                  />
                                ),
                              )}
                            </ol>
                          </section>
                        )}

                        {report.workflowAnalysis.risks.length > 0 && (
                          <section
                            className={cn(
                              "rounded-2xl border p-4",
                              isDarkMode
                                ? "border-amber-900/40 bg-amber-950/30 text-amber-200"
                                : "border-amber-200/40 bg-amber-50 text-amber-700",
                            )}
                          >
                            <header className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                              <Icons.AlertCircle className="h-4 w-4" /> 남은
                              리스크
                            </header>
                            <ul className="mt-3 space-y-2 pl-4 text-sm list-disc">
                              {report.workflowAnalysis.risks.map(
                                (risk, index) => (
                                  <li
                                    key={`risk-${index}`}
                                    dangerouslySetInnerHTML={{
                                      __html: formatInlineMarkdown(risk),
                                    }}
                                  />
                                ),
                              )}
                            </ul>
                          </section>
                        )}
                      </div>

                      {report.workflowAnalysis.fullReport && (
                        <div
                          className={cn(
                            "mt-4 rounded-xl border p-4 text-sm",
                            isDarkMode
                              ? "border-slate-800/70 bg-slate-900/60"
                              : "border-slate-200/60 bg-white",
                          )}
                        >
                          <h5 className="text-xs font-bold uppercase tracking-wide">
                            상세 보고서
                          </h5>
                          <div className="mt-2 space-y-2">
                            {renderMarkdownBlocks(
                              report.workflowAnalysis.fullReport,
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {report.workflowLogs.length > 0 && (
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
                        GitHub Actions 세부 로그
                      </h4>
                      <div className="mt-3 space-y-2">
                        {report.workflowLogs.map((logFile) => (
                          <details
                            key={logFile.fileName}
                            className={cn(
                              "group rounded-xl border",
                              isDarkMode
                                ? "border-slate-800 bg-slate-950/50"
                                : "border-slate-200 bg-white",
                            )}
                          >
                            <summary
                              className={cn(
                                "flex cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm font-semibold",
                                isDarkMode
                                  ? "text-slate-200"
                                  : "text-slate-800",
                              )}
                            >
                              <span className="truncate">
                                {logFile.fileName}
                              </span>
                              {logFile.truncated && (
                                <span
                                  className={cn(
                                    "text-xs",
                                    isDarkMode
                                      ? "text-amber-300"
                                      : "text-amber-600",
                                  )}
                                >
                                  (마지막 {MAX_LOG_CHARACTERS.toLocaleString()}
                                  자만 표시)
                                </span>
                              )}
                            </summary>
                            <pre
                              className={cn(
                                "max-h-72 overflow-y-auto px-4 py-3 text-xs leading-relaxed",
                                isDarkMode
                                  ? "bg-slate-950 text-slate-200"
                                  : "bg-slate-100 text-slate-800",
                              )}
                            >
                              <code>{logFile.content}</code>
                            </pre>
                          </details>
                        ))}
                      </div>
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
