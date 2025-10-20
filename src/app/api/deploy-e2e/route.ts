import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Octokit } from "@octokit/rest";

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

          branchName = `feature/e2e-${Date.now()}`;
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

          testFileName = `generated-e2e-${Date.now()}.spec.ts`;
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
            message: `PR #${pr.data.number}가 생성되었습니다.`,
            level: "success",
            link: { href: pr.data.html_url, label: "PR 바로가기" },
          });

          const merge = await octokit.pulls.merge({
            owner,
            repo,
            pull_number: pr.data.number,
          });

          mergeCommitSha = merge.data.sha ?? "";

          streamLog({
            title: "Pull Request 병합",
            message: "새로운 테스트가 기본 브랜치에 병합되었습니다.",
            level: "success",
            details: [
              { label: "병합 커밋", value: mergeCommitSha.substring(0, 7) },
              { label: "기본 브랜치", value: snapshot.defaultBranch },
            ],
          });

          streamResponse("running_tests");

          const workflowRun = await waitForWorkflowRun({
            octokit,
            owner,
            repo,
            branch: snapshot.defaultBranch,
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

  const files = tree.tree
    .filter((item) => item.type === "blob" && item.path)
    .map((item) => item.path as string);

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

### Covered scenarios
${intentsList}

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
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const runs = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      event: "push",
      branch,
    });

    const workflowRun = runs.data.workflow_runs.find(
      (run) => run.head_sha === commitSha,
    );

    if (workflowRun) {
      if (workflowRun.status === "completed") {
        const durationMs = Date.now() - start;
        onPoll({
          message: "워크플로우가 완료되었습니다.",
          details: [
            { label: "결과", value: workflowRun.conclusion ?? "unknown" },
            {
              label: "소요 시간",
              value: `${Math.round(durationMs / 1000)}초`,
            },
          ],
        });
        return workflowRun;
      }

      onPoll({
        message: "워크플로우가 실행 중입니다...",
        details: [
          { label: "현재 상태", value: workflowRun.status ?? "unknown" },
          {
            label: "대기열 위치",
            value: workflowRun.run_number?.toString() ?? "-",
          },
        ],
      });
    } else {
      onPoll({
        message: "워크플로우 실행을 기다리는 중입니다...",
      });
    }
  }

  throw new Error("워크플로우 실행이 10분 내에 완료되지 않았습니다.");
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
