"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";

type ReportData = {
  workflowUrl: string;
  status: string;
  llm: { provider: string; model: string };
  testFile: { path: string; branch: string };
  testIntents: string[];
  scriptPreview: string;
  repoUrl: string;
  issueUrl?: string;
  llmRawResponse?: string;
};

export default function E2EReportPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("e2e-tester-dark-mode");
    if (saved) setIsDarkMode(JSON.parse(saved));
    try {
      const last = localStorage.getItem("e2e-last-report");
      if (last) setReport(JSON.parse(last));
    } catch {}
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-500",
        isDarkMode
          ? "dark bg-slate-950 text-slate-100"
          : "bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900",
      )}
    >
      <PageHeader
        title="E2E 자동화 리포트"
        description="마지막 자동화 실행의 상세 리포트입니다."
        icon="📋"
        isDarkMode={isDarkMode}
        setIsDarkMode={(v: boolean) => {
          setIsDarkMode(v);
          localStorage.setItem("e2e-tester-dark-mode", JSON.stringify(v));
        }}
        storageKey="e2e-tester-dark-mode"
      />

      <main className="container mx-auto px-4 py-10">
        <section className="mx-auto w-full max-w-3xl space-y-6 rounded-3xl border px-6 py-8 shadow-xl bg-white dark:bg-slate-900 dark:border-slate-800">
          <header>
            <h2 className="text-2xl font-semibold">마지막 자동화 실행</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              최근에 실행한 자동화의 결과를 보여줍니다.
            </p>
          </header>

          {!report && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm dark:border-slate-800 dark:bg-slate-900/60">
              리포트가 없습니다. 먼저 자동화를 실행하세요.
            </div>
          )}

          {report && (
            <div className="grid gap-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h3 className="font-semibold">요약</h3>
                <p className="mt-2 text-sm">
                  상태: <strong>{report.status}</strong>
                </p>
                <p className="mt-1 text-sm">
                  LLM:{" "}
                  <strong>
                    {report.llm?.provider} ({report.llm?.model})
                  </strong>
                </p>
                <p className="mt-1 text-sm">
                  테스트 파일: <strong>{report.testFile?.path}</strong>
                </p>
                <p className="mt-1 text-sm">
                  브랜치: <strong>{report.testFile?.branch}</strong>
                </p>
                {report.issueUrl && (
                  <p className="mt-2 text-sm">
                    이슈:{" "}
                    <a
                      href={report.issueUrl}
                      target="_blank"
                      className="text-indigo-600"
                    >
                      {report.issueUrl}
                    </a>
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h4 className="font-semibold">테스트 시나리오</h4>
                <ol className="mt-2 list-decimal pl-5">
                  {report.testIntents?.map((i: string, idx: number) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h4 className="font-semibold">스크립트 미리보기</h4>
                <pre
                  className={cn(
                    "mt-2 rounded-2xl p-3 text-xs shadow-inner",
                    isDarkMode
                      ? "bg-slate-900 text-slate-100"
                      : "bg-white text-slate-900",
                  )}
                >
                  <code>{report.scriptPreview}</code>
                </pre>

                {report.llmRawResponse && (
                  <details className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60">
                    <summary className="cursor-pointer font-semibold">
                      LLM 원문 응답 (원문)
                    </summary>
                    <pre
                      className={cn(
                        "mt-2 rounded-2xl p-3 text-xs",
                        isDarkMode
                          ? "bg-slate-800 text-slate-100"
                          : "bg-white text-slate-900",
                      )}
                    >
                      <code>{report.llmRawResponse}</code>
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
