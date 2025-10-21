import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Octokit } from "@octokit/rest";
import JSZip, { JSZipObject } from "jszip";

type Step =
  | "analyzing"
  | "generating_test_script"
  | "creating_pull_request"
  | "running_tests"
  | "reporting_results";

type LogLevel = "info" | "success" | "warning" | "error";

type LogDetail = {
  label: string;
  value: string;
};

type StreamLogPayload = {
  title?: string;
  message: string;
  level?: LogLevel;
  details?: LogDetail[];
  codeBlock?: string;
  link?: { href: string; label: string };
};

type AutomationSummary = {
  workflowUrl: string;
  status: string;
  llm: {
    provider: string;
    model: string;
  };
  testFile: {
    path: string;
    branch: string;
  };
  testIntents: string[];
  scriptPreview: string;
  repoUrl: string;
  issueUrl?: string;
  llmRawResponse?: string;
  workflowLogs: WorkflowLogFile[];
  workflowAnalysis?: WorkflowAnalysis;
};

type WorkflowLogFile = {
  fileName: string;
  content: string;
  truncated: boolean;
};

type WorkflowAnalysis = {
  statusOverview: string;
  successRate: string;
  rootCauses: string[];
  resolutionSteps: string[];
  risks: string[];
  confidence: string;
  fullReport: string;
};

interface RepoSnapshot {
  promptContext: string;
  fileCount: number;
  defaultBranch: string;
  importantFiles: { path: string; snippet: string }[];
  frameworks: string[];
}

const MODEL_ID = "gemini-2.5-pro";

export async function POST(request: NextRequest) {
  const { repoUrl, githubToken } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const writer = {
        write: (chunk: string) => controller.enqueue(encoder.encode(chunk)),
        close: () => controller.close(),
      };

      let streamClosed = false;

      const closeStream = () => {
        if (!streamClosed) {
          writer.close();
          streamClosed = true;
        }
      };

      const streamMessage = (payload: object) => {
        if (streamClosed) return;
        writer.write(`data: ${JSON.stringify(payload)}\n\n`);
      };

      const streamResponse = (step: Step, data: object = {}) => {
        streamMessage({ step, ...data });
      };

      const streamLog = (log: StreamLogPayload) => {
        const enriched = {
          ...log,
          level: log.level ?? "info",
          timestamp: new Date().toISOString(),
        };
        streamMessage({ log: enriched });
      };

      const streamError = (error: string) => {
        streamMessage({ error });
        closeStream();
      };

      const streamResult = (summary: AutomationSummary) => {
        streamMessage({ result: summary });
        closeStream();
      };

      const safeRun = async (fn: () => Promise<void>) => {
        try {
          await fn();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.";
          console.error("자동화 오류:", error);
          streamError(message);
          throw error;
        }
      };

      try {
        const urlMatch = repoUrl.match(/github\.com\/(.+?)\/(.+?)(?:\.git)?$/);
        if (!urlMatch) {
          streamError("유효하지 않은 GitHub 저장소 URL입니다.");
          return;
        }
        const [, owner, repo] = urlMatch;

        const octokit = new Octokit({ auth: githubToken });
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          streamError("Gemini API 키가 설정되지 않았습니다.");
          return;
        }
        const genAI = new GoogleGenAI({ apiKey });

        let summary: AutomationSummary | null = null;
        let testScriptContent = "";
        let testIntents: string[] = [];
        let branchName = "";
        let testFileName = "";
        let mergeCommitSha = "";
        let workflowLogs: WorkflowLogFile[] = [];
        let workflowAnalysis: WorkflowAnalysis | null = null;

        await safeRun(async () => {
          streamResponse("analyzing");
          streamLog({
            title: "저장소 분석 준비",
            message: `${owner}/${repo} 저장소 구조를 분석하고 있습니다.`,
          });

          const snapshot = await collectRepoSnapshot(octokit, owner, repo);

          streamLog({
            title: "저장소 분석 완료",
            message: "AI 프롬프트 생성을 위한 핵심 정보를 정리했습니다.",
            details: [
              { label: "기본 브랜치", value: snapshot.defaultBranch },
              { label: "파일 수", value: snapshot.fileCount.toString() },
              {
                label: "주요 프레임워크",
                value: snapshot.frameworks.length
                  ? snapshot.frameworks.join(", ")
                  : "판별되지 않음",
              },
              {
                label: "참조 파일",
                value: snapshot.importantFiles
                  .map((file) => file.path)
                  .join(", "),
              },
            ],
          });

          streamResponse("generating_test_script");

          const prompt = buildTestPrompt({
            repoUrl,
            owner,
            repo,
            snapshot,
          });

          streamLog({
            title: "LLM 호출",
            message:
              "Playwright E2E 테스트 생성을 위해 Gemini 모델에 프롬프트를 전송합니다.",
            details: [
              { label: "LLM 제공자", value: "Google Gemini" },
              { label: "사용 모델", value: MODEL_ID },
              {
                label: "프롬프트 길이",
                value: `${prompt.length.toLocaleString()} chars`,
              },
            ],
          });

          const scriptResult = await genAI.models.generateContent({
            model: MODEL_ID,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });

          // 보조: 원본 LLM 응답 전체를 보관
          const rawLLMResponse = JSON.stringify(scriptResult, null, 2);

          if (!scriptResult.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("AI로부터 유효한 스크립트를 생성하지 못했습니다.");
          }

          testScriptContent = scriptResult.candidates[0].content.parts[0].text
            .replace(/```[a-z]*\n?|```/g, "")
            .trim();

          testIntents = extractTestIntents(testScriptContent);

          streamLog({
            title: "테스트 스크립트 생성 완료",
            message:
              "핵심 사용자 여정을 검증하는 Playwright 테스트가 생성되었습니다.",
            level: "success",
            details: testIntents.length
              ? testIntents.map((intent, index) => ({
                  label: `시나리오 ${index + 1}`,
                  value: intent,
                }))
              : undefined,
            codeBlock: truncateCodeBlock(testScriptContent),
          });

          // LLM의 원문 응답도 스트림으로 전송 (사용자가 전체 응답을 확인할 수 있도록)
          streamLog({
            title: "LLM 원문 응답",
            message: "모델의 전체 응답을 포함합니다.",
            level: "info",
            codeBlock: rawLLMResponse,
          });

          streamResponse("creating_pull_request");
          streamLog({
            title: "Pull Request 준비",
            message: "생성된 테스트 스크립트를 저장소에 반영합니다.",
          });

          const timestamp = Date.now();
          branchName = `feature/e2e-${timestamp}`;
          const mainBranch = await octokit.repos.getBranch({
            owner,
            repo,
            branch: snapshot.defaultBranch,
          });
          await octokit.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branchName}`,
            sha: mainBranch.data.commit.sha,
          });

          testFileName = `generated-e2e-${timestamp}.spec.ts`;

          // 테스트 파일 추가
          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: `tests/${testFileName}`,
            message: `chore: add AI-generated E2E test (${MODEL_ID})`,
            content: Buffer.from(testScriptContent).toString("base64"),
            branch: branchName,
          });

          streamLog({
            title: "테스트 파일 추가",
            message: `tests/${testFileName} 파일을 ${branchName} 브랜치에 추가했습니다.`,
            details: [
              { label: "브랜치", value: branchName },
              { label: "테스트 파일", value: `tests/${testFileName}` },
            ],
          });

          // GitHub Actions workflow 파일 추가
          const workflowContent = `name: E2E Test - ${testFileName.replace(
            ".spec.ts",
            "",
          )}

on:
  push:
    branches: [${branchName}]
  pull_request:
    branches: [${snapshot.defaultBranch}]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  e2e-test:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npx playwright test ${testFileName}
        env:
          CI: true

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${testFileName.replace(".spec.ts", "")}
          path: |
            playwright-report/
            test-results/
          retention-days: 30
`;

          const workflowFileName = `e2e-${timestamp}.yml`;
          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: `.github/workflows/${workflowFileName}`,
            message: `chore: add GitHub Actions workflow for E2E test`,
            content: Buffer.from(workflowContent).toString("base64"),
            branch: branchName,
          });

          streamLog({
            title: "GitHub Actions Workflow 추가",
            message: "E2E 테스트를 위한 워크플로우 파일이 추가되었습니다.",
            level: "success",
            details: [
              { label: "워크플로우", value: workflowFileName },
              { label: "트리거", value: "Push, PR, Manual" },
            ],
          });

          const pr = await octokit.pulls.create({
            owner,
            repo,
            title: `chore: add AI-generated E2E test (${MODEL_ID})`,
            head: branchName,
            base: snapshot.defaultBranch,
            body: buildPullRequestBody({
              repoUrl,
              testFileName,
              testIntents,
              modelId: MODEL_ID,
            }),
          });

          streamLog({
            title: "Pull Request 생성",
            message: `PR #${pr.data.number}가 생성되었습니다. PR을 검토한 후 수동으로 머지할 수 있습니다.`,
            level: "success",
            link: { href: pr.data.html_url, label: "PR 바로가기" },
          });

          streamResponse("running_tests");

          // PR 브랜치의 최신 커밋 SHA 가져오기
          const branch = await octokit.repos.getBranch({
            owner,
            repo,
            branch: branchName,
          });
          mergeCommitSha = branch.data.commit.sha;

          const workflowRun = await waitForWorkflowRun({
            octokit,
            owner,
            repo,
            branch: branchName,
            commitSha: mergeCommitSha,
            onPoll: (status) => {
              streamLog({
                title: "워크플로우 모니터링",
                message: status.message,
                details: status.details,
              });
            },
          });

          streamLog({
            title: "워크플로우 완료",
            message: `테스트 워크플로우가 ${workflowRun.conclusion} 상태로 종료되었습니다.`,
            level: workflowRun.conclusion === "success" ? "success" : "warning",
            link: {
              href: workflowRun.html_url,
              label: "워크플로우 실행 보기",
            },
          });

          streamResponse("reporting_results");

          try {
            streamLog({
              title: "워크플로우 로그 수집",
              message: "GitHub Actions 실행 로그를 다운로드하고 있습니다.",
            });

            workflowLogs = await fetchWorkflowLogs({
              octokit,
              owner,
              repo,
              runId: workflowRun.id,
            });

            const sampleNames = workflowLogs
              .slice(0, 3)
              .map((log) => log.fileName)
              .join(", ");

            streamLog({
              title: "워크플로우 로그 수집 완료",
              message: `${workflowLogs.length}개의 로그 파일을 정리했습니다.`,
              details: sampleNames
                ? [{ label: "샘플", value: truncateText(sampleNames, 120) }]
                : undefined,
            });
          } catch (logError) {
            console.error("워크플로우 로그 수집 실패:", logError);
            streamLog({
              title: "워크플로우 로그 수집 실패",
              message: "GitHub Actions 로그를 가져오지 못했습니다.",
              level: "warning",
            });
          }

          if (workflowLogs.length) {
            try {
              streamLog({
                title: "로그 분석",
                message:
                  "AI가 실행 로그를 분석하고 현재 상태와 해결 방법을 정리합니다.",
              });

              workflowAnalysis = await analyzeWorkflowLogs({
                genAI,
                logs: workflowLogs,
                workflowUrl: workflowRun.html_url,
                repoUrl,
                conclusion: workflowRun.conclusion ?? "unknown",
              });

              if (workflowAnalysis) {
                const analysisDetails: LogDetail[] = [];
                if (workflowAnalysis.statusOverview) {
                  analysisDetails.push({
                    label: "상태",
                    value: truncateText(workflowAnalysis.statusOverview, 120),
                  });
                }
                if (workflowAnalysis.successRate) {
                  analysisDetails.push({
                    label: "예상 성공률",
                    value: workflowAnalysis.successRate,
                  });
                }

                streamLog({
                  title: "로그 분석 완료",
                  message: "실행 상태와 해결 방법 리포트를 생성했습니다.",
                  level: "success",
                  details: analysisDetails.length ? analysisDetails : undefined,
                });
              }
            } catch (analysisError) {
              console.error("로그 분석 실패:", analysisError);
              streamLog({
                title: "로그 분석 실패",
                message:
                  analysisError instanceof Error
                    ? analysisError.message
                    : "LLM 분석 중 알 수 없는 오류가 발생했습니다.",
                level: "warning",
              });
            }
          }

          if (workflowRun.conclusion !== "success") {
            const issue = await octokit.issues.create({
              owner,
              repo,
              title: `E2E 테스트 실패 보고서 (${new Date().toISOString()})`,
              body: buildFailureIssueBody({
                repoUrl,
                workflowUrl: workflowRun.html_url,
                conclusion: workflowRun.conclusion,
                commitSha: mergeCommitSha,
                testFileName,
              }),
              labels: ["bug", "e2e-test-failure"],
            });

            streamLog({
              title: "실패 리포트 생성",
              message: "워크플로우 실패로 자동 이슈를 생성했습니다.",
              level: "warning",
              link: { href: issue.data.html_url, label: "이슈 보기" },
            });

            summary = {
              workflowUrl: workflowRun.html_url,
              status: workflowRun.conclusion ?? "unknown",
              llm: { provider: "Google Gemini", model: MODEL_ID },
              testFile: { path: `tests/${testFileName}`, branch: branchName },
              testIntents,
              scriptPreview: truncateCodeBlock(testScriptContent),
              llmRawResponse: rawLLMResponse,
              repoUrl,
              issueUrl: issue.data.html_url,
              workflowLogs,
              workflowAnalysis: workflowAnalysis ?? undefined,
            };
          } else {
            summary = {
              workflowUrl: workflowRun.html_url,
              status: workflowRun.conclusion ?? "unknown",
              llm: { provider: "Google Gemini", model: MODEL_ID },
              testFile: { path: `tests/${testFileName}`, branch: branchName },
              testIntents,
              scriptPreview: truncateCodeBlock(testScriptContent),
              llmRawResponse: rawLLMResponse,
              repoUrl,
              workflowLogs,
              workflowAnalysis: workflowAnalysis ?? undefined,
            };
          }

          streamLog({
            title: "자동화 결과 정리",
            message: "세부 결과 리포트를 생성했습니다.",
            level: "success",
          });

          if (summary) {
            streamResult(summary);
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error("자동화 중단:", error.message);
        }
      } finally {
        closeStream();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

const MAX_SINGLE_LOG_CHARS = 15000;
const MAX_PROMPT_LOG_CHARS = 60000;

async function fetchWorkflowLogs({
  octokit,
  owner,
  repo,
  runId,
}: {
  octokit: Octokit;
  owner: string;
  repo: string;
  runId: number;
}): Promise<WorkflowLogFile[]> {
  const response = await octokit.actions.downloadWorkflowRunLogs({
    owner,
    repo,
    run_id: runId,
  });

  const buffer = responseDataToBuffer(response.data);
  const zip = await JSZip.loadAsync(buffer);
  const logs: WorkflowLogFile[] = [];

  const entries = Object.entries(zip.files) as [string, JSZipObject][];
  for (const [fileName, file] of entries) {
    if (!file || file.dir) continue;
    if (!fileName.endsWith(".txt")) continue;

    const rawContent = await file.async("string");
    const normalized = rawContent.replace(/\r\n/g, "\n");
    const truncated = normalized.length > MAX_SINGLE_LOG_CHARS;
    const startIndex = truncated ? normalized.length - MAX_SINGLE_LOG_CHARS : 0;
    const content = normalized.substring(startIndex);

    logs.push({
      fileName,
      content,
      truncated,
    });
  }

  return logs.sort((a, b) => a.fileName.localeCompare(b.fileName));
}

async function analyzeWorkflowLogs({
  genAI,
  logs,
  workflowUrl,
  repoUrl,
  conclusion,
}: {
  genAI: GoogleGenAI;
  logs: WorkflowLogFile[];
  workflowUrl: string;
  repoUrl: string;
  conclusion: string;
}): Promise<WorkflowAnalysis | null> {
  if (!logs.length) {
    return null;
  }

  const logSnippet = combineLogsForPrompt(logs, MAX_PROMPT_LOG_CHARS);
  const prompt = [
    "너는 릴리스 엔지니어이자 품질 책임자이며, GitHub Actions 실행 로그를 기반으로 현재 상태를 정확하게 진단하고 해결 전략을 제시해야 한다.",
    `저장소: ${repoUrl}`,
    `워크플로우: ${workflowUrl}`,
    `최종 결론: ${conclusion}`,
    "아래의 로그를 분석하여 다음 정보를 모두 한국어로 정리하고, JSON 형태로만 응답하라.",
    "필수 키: statusOverview (string), successRate (string, 백분율 포함), rootCauses (string[]), resolutionSteps (string[]), risks (string[]), confidence (string), fullReport (string). 불필요한 텍스트나 마크다운은 금지한다.",
    logSnippet,
  ].join("\n\n");

  const result = await genAI.models.generateContent({
    model: MODEL_ID,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const parts = result.candidates?.[0]?.content?.parts ?? [];
  let rawText = "";
  for (const part of parts as Array<{ text?: string }>) {
    if (typeof part.text === "string") {
      rawText += part.text;
    }
  }
  rawText = rawText.trim();

  if (!rawText) {
    return null;
  }

  const parsed = safeParseJson(rawText);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const data = parsed as Record<string, unknown>;

  return {
    statusOverview:
      typeof data.statusOverview === "string" ? data.statusOverview : "",
    successRate: typeof data.successRate === "string" ? data.successRate : "",
    rootCauses: castStringArray(data.rootCauses),
    resolutionSteps: castStringArray(data.resolutionSteps),
    risks: castStringArray(data.risks),
    confidence: typeof data.confidence === "string" ? data.confidence : "",
    fullReport: typeof data.fullReport === "string" ? data.fullReport : rawText,
  };
}

function combineLogsForPrompt(
  logs: WorkflowLogFile[],
  maxLength: number,
): string {
  const joined = logs
    .map((log) => `### ${log.fileName}\n${log.content}`)
    .join("\n\n");
  if (joined.length <= maxLength) {
    return joined;
  }
  return joined.substring(joined.length - maxLength);
}

function responseDataToBuffer(data: unknown): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }
  if (ArrayBuffer.isView(data)) {
    const view = data as ArrayBufferView;
    return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
  }
  if (typeof data === "string") {
    return Buffer.from(data, "utf-8");
  }
  throw new Error("지원되지 않는 로그 응답 형식입니다.");
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end >= start) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function castStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item));
}

function truncateText(value: string, maxLength = 120): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.substring(0, maxLength - 3)}...`;
}

async function collectRepoSnapshot(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<RepoSnapshot> {
  const repoMeta = await octokit.repos.get({ owner, repo });
  const defaultBranch = repoMeta.data.default_branch;

  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: defaultBranch,
    recursive: "1",
  });

  const treeNodes = tree.tree as Array<{
    path?: string | null;
    type?: string | null;
  }>;
  const files: string[] = [];
  for (const node of treeNodes) {
    if (node.type === "blob" && typeof node.path === "string") {
      files.push(node.path);
    }
  }

  const importantCandidates = [
    "package.json",
    "playwright.config.ts",
    "playwright.config.js",
    "src/app/page.tsx",
    "src/pages/index.tsx",
    "src/pages/index.js",
    "src/app/layout.tsx",
  ];

  const importantFiles: { path: string; snippet: string }[] = [];

  for (const candidate of importantCandidates) {
    if (!files.includes(candidate)) continue;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: candidate,
      });
      if ("content" in data && data.content) {
        const decoded = Buffer.from(data.content, "base64").toString("utf-8");
        importantFiles.push({
          path: candidate,
          snippet: decoded.substring(0, 1500),
        });
      }
    } catch (error) {
      console.warn(`중요 파일(${candidate})을 불러오지 못했습니다.`, error);
    }
  }

  const frameworks = detectFrameworks({ files, importantFiles });

  const promptContext = [
    `Repository: ${owner}/${repo}`,
    `Default branch: ${defaultBranch}`,
    `Total files (${files.length}): ${files.slice(0, 80).join(", ")}`,
    ...importantFiles.map((file) => `\n--- ${file.path} ---\n${file.snippet}`),
  ].join("\n\n");

  return {
    promptContext,
    fileCount: files.length,
    defaultBranch,
    importantFiles,
    frameworks,
  };
}

function detectFrameworks({
  files,
  importantFiles,
}: {
  files: string[];
  importantFiles: { path: string; snippet: string }[];
}): string[] {
  const hints: Set<string> = new Set();

  if (files.some((file) => file.startsWith("src/app"))) {
    hints.add("Next.js App Router");
  }
  if (files.some((file) => file.includes("playwright.config"))) {
    hints.add("Playwright");
  }
  if (files.some((file) => file.endsWith(".tsx"))) {
    hints.add("TypeScript");
  }

  const packageJson = importantFiles.find(
    (file) => file.path === "package.json",
  );
  if (packageJson) {
    if (/"next"\s*:\s*"/.test(packageJson.snippet)) {
      hints.add("Next.js");
    }
    if (/"@playwright\/test"/.test(packageJson.snippet)) {
      hints.add("Playwright Test");
    }
  }

  return Array.from(hints);
}

function buildTestPrompt({
  repoUrl,
  owner,
  repo,
  snapshot,
}: {
  repoUrl: string;
  owner: string;
  repo: string;
  snapshot: RepoSnapshot;
}): string {
  return `You are an expert QA engineer writing modern Playwright E2E tests for a Next.js project.

Repository: ${owner}/${repo}
Git URL: ${repoUrl}
Detected frameworks: ${snapshot.frameworks.join(", ")}

Write a single Playwright test file in TypeScript that validates the primary user journey of the application.

Requirements:
- Use the imported { test, expect } from "@playwright/test".
- Cover the most critical end-to-end flow (landing page -> key action -> result validation).
- Use accessible selectors (text, role, data-testid) where possible.
- Add clear test titles and helpful inline comments describing the intent of each step.
- Include waits only when necessary and prefer expect-based assertions.
- Output only the TypeScript code for the test file.

Repository context:
${snapshot.promptContext.substring(0, 32000)}`;
}

function truncateCodeBlock(code: string, limit = 2000): string {
  return code.length > limit ? `${code.substring(0, limit)}\n...` : code;
}

function extractTestIntents(script: string): string[] {
  const intents: string[] = [];
  const regex = /test(?:\.only|\.skip)?\((?:"|')(.*?)(?:"|')/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(script)) !== null) {
    if (match[1]) {
      intents.push(match[1]);
    }
  }
  return intents.slice(0, 5);
}

function buildPullRequestBody({
  repoUrl,
  testFileName,
  testIntents,
  modelId,
}: {
  repoUrl: string;
  testFileName: string;
  testIntents: string[];
  modelId: string;
}): string {
  const intentsList = testIntents.length
    ? testIntents.map((intent) => `- ${intent}`).join("\n")
    : "- 기본 사용자 여정을 검증하는 단일 테스트";

  return `## 🤖 AI Generated Playwright Test

- Source repository: ${repoUrl}
- Model: ${modelId}
- Test file: \`tests/${testFileName}\`
- GitHub Actions workflow: \`.github/workflows/e2e-*.yml\`

### Covered scenarios
${intentsList}

### 📋 What's included
- ✅ Playwright E2E test script
- ✅ GitHub Actions workflow for automated testing
- ✅ Test will run on push and pull request events

### 🔍 Review Guide
Please review the generated test and workflow files before merging.
The workflow will automatically run when you push to this branch.

Generated automatically to keep regression coverage up-to-date.`;
}

async function waitForWorkflowRun({
  octokit,
  owner,
  repo,
  branch,
  commitSha,
  onPoll,
}: {
  octokit: Octokit;
  owner: string;
  repo: string;
  branch: string;
  commitSha: string;
  onPoll: (status: { message: string; details?: LogDetail[] }) => void;
}) {
  const start = Date.now();
  let lastSignature = "";
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const runs = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      event: "push",
      branch,
    });

    const workflowRun = runs.data.workflow_runs.find(
      (run: (typeof runs.data.workflow_runs)[number]) =>
        run.head_sha === commitSha,
    );

    if (workflowRun) {
      const runSignatureBase = `${workflowRun.status}|${
        workflowRun.run_attempt ?? 0
      }|${workflowRun.updated_at ?? ""}`;

      const jobSummary =
        workflowRun.status && workflowRun.status !== "queued"
          ? await summarizeWorkflowJobs({
              octokit,
              owner,
              repo,
              runId: workflowRun.id,
            })
          : null;

      if (workflowRun.status === "completed") {
        const durationMs = Date.now() - start;
        const details: LogDetail[] = [
          { label: "결과", value: workflowRun.conclusion ?? "unknown" },
          {
            label: "소요 시간",
            value: `${Math.round(durationMs / 1000)}초`,
          },
        ];
        if (jobSummary?.details.length) {
          details.push(...jobSummary.details);
        }
        const signature = `${runSignatureBase}|completed|${
          jobSummary?.signature ?? ""
        }`;
        if (signature !== lastSignature) {
          onPoll({
            message: "워크플로우가 완료되었습니다.",
            details,
          });
          lastSignature = signature;
        }
        return workflowRun;
      }

      const statusLabel =
        workflowRun.status === "queued"
          ? "워크플로우가 대기열에 있습니다."
          : "워크플로우 작업이 진행 중입니다.";

      const details: LogDetail[] = [
        { label: "현재 상태", value: workflowRun.status ?? "unknown" },
      ];

      if (workflowRun.run_attempt) {
        details.push({
          label: "실행 시도",
          value: `${workflowRun.run_attempt}`,
        });
      }

      if (workflowRun.created_at) {
        details.push({
          label: "생성 시각",
          value: formatTimeForLog(workflowRun.created_at),
        });
      }

      if (workflowRun.run_started_at) {
        details.push({
          label: "실행 시작",
          value: formatTimeForLog(workflowRun.run_started_at),
        });
      }

      if (jobSummary?.details.length) {
        details.push(...jobSummary.details);
      }

      const signature = `${runSignatureBase}|${jobSummary?.signature ?? ""}`;
      if (signature !== lastSignature) {
        onPoll({
          message: statusLabel,
          details,
        });
        lastSignature = signature;
      }
    } else {
      if (lastSignature !== "waiting") {
        onPoll({
          message: "워크플로우 실행을 기다리는 중입니다...",
        });
        lastSignature = "waiting";
      }
    }
  }

  throw new Error("워크플로우 실행이 10분 내에 완료되지 않았습니다.");
}

type WorkflowJobsSummary = {
  details: LogDetail[];
  signature: string;
};

async function summarizeWorkflowJobs({
  octokit,
  owner,
  repo,
  runId,
}: {
  octokit: Octokit;
  owner: string;
  repo: string;
  runId: number;
}): Promise<WorkflowJobsSummary | null> {
  try {
    const { data } = await octokit.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: runId,
      per_page: 100,
    });

    const jobs = data.jobs ?? [];
    if (!jobs.length) {
      return null;
    }

    const completed = jobs.filter((job) => job.status === "completed");
    const inProgress = jobs.filter((job) => job.status === "in_progress");
    const queued = jobs.filter((job) => job.status === "queued");
    const failing = jobs.find(
      (job) => job.conclusion && job.conclusion !== "success",
    );

    let runningDescription = "";
    if (inProgress.length) {
      const job = inProgress[0];
      const activeStep = job.steps?.find(
        (step) => step.status === "in_progress",
      );
      runningDescription = activeStep
        ? `${job.name} → ${activeStep.name}`
        : job.name;
    }

    const details: LogDetail[] = [
      {
        label: "완료/총 작업",
        value: `${completed.length}/${jobs.length}`,
      },
    ];

    if (runningDescription) {
      details.push({ label: "진행 중", value: runningDescription });
    }

    if (queued.length) {
      const queuedNames = queued.map((job) => job.name).join(", ");
      details.push({ label: "대기 중", value: queuedNames });
    }

    if (failing) {
      details.push({
        label: "문제 감지",
        value: `${failing.name} (${failing.conclusion})`,
      });
    }

    const signature = jobs
      .map((job) => {
        const stepSignature = (job.steps ?? [])
          .map(
            (step) => `${step.number}:${step.status}:${step.conclusion ?? ""}`,
          )
          .join("|");
        return `${job.id}:${job.status}:${
          job.conclusion ?? ""
        }:${stepSignature}`;
      })
      .join(";");

    return { details, signature };
  } catch (error) {
    console.error("워크플로우 작업 요약 실패:", error);
    return null;
  }
}

function formatTimeForLog(isoTime: string): string {
  return new Date(isoTime).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildFailureIssueBody({
  repoUrl,
  workflowUrl,
  conclusion,
  commitSha,
  testFileName,
}: {
  repoUrl: string;
  workflowUrl: string;
  conclusion: string | null;
  commitSha: string;
  testFileName: string;
}): string {
  return `## ❌ 자동화된 E2E 테스트 실패 보고서

- 저장소: ${repoUrl}
- 워크플로우 실행: ${workflowUrl}
- 결과: ${conclusion}
- 병합 커밋: \`${commitSha.substring(0, 7)}\`
- 생성된 테스트: \`tests/${testFileName}\`

워크플로우 로그를 참고하여 실패 원인을 확인해주세요.`;
}
