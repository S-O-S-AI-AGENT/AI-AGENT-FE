import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Octokit } from "@octokit/rest";

type Step =
  | "analyzing"
  | "generating_script"
  | "creating_workflow"
  | "running_workflow"
  | "creating_issue";

export async function POST(request: NextRequest) {
  const { repoUrl, githubToken } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const writer = {
        write: (chunk: string) => controller.enqueue(encoder.encode(chunk)),
        close: () => controller.close(),
      };

      const streamResponse = (step: Step, data: object) => {
        const jsonString = JSON.stringify({ step, ...data });
        writer.write(`data: ${jsonString}\n\n`);
      };

      const streamLog = (log: string) => {
        const jsonString = JSON.stringify({ log });
        writer.write(`data: ${jsonString}\n\n`);
      };

      const streamError = (error: string) => {
        const jsonString = JSON.stringify({ error });
        writer.write(`data: ${jsonString}\n\n`);
        writer.close();
      };

      const streamResult = (resultUrl: string) => {
        const jsonString = JSON.stringify({ result: resultUrl });
        writer.write(`data: ${jsonString}\n\n`);
        writer.close();
      };

      try {
        const urlMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
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

        // 1. 저장소 분석
        streamResponse("analyzing", {});
        streamLog(`저장소 분석 시작: ${owner}/${repo}`);
        const repoContent = await getRepoContent(octokit, owner, repo);
        if (!repoContent) {
          streamError("저장소 내용을 가져오는 데 실패했습니다.");
          return;
        }
        streamLog("저장소 분석 완료.");

        // 2. TestFlight 스크립트 생성
        streamResponse("generating_script", {});
        streamLog("AI를 사용하여 TestFlight 배포 스크립트 생성 중...");
        const modelId = "gemini-2.5-pro";
        const scriptPrompt = `
          다음은 '${owner}/${repo}' 저장소의 내용입니다. 이 프로젝트를 위한 TestFlight 배포 Fastlane 스크립트(Fastfile)를 생성해주세요.
          주요 정보:
          - Apple ID: {{APPLE_ID}}
          - App Identifier: {{APP_IDENTIFIER}}
          - Git URL: ${repoUrl}

          스크립트는 다음을 포함해야 합니다:
          1. 의존성 설치 (bundler)
          2. 인증서 및 프로비저닝 프로파일 관리 (match)
          3. 빌드 번호 자동 증가
          4. 앱 빌드 (gym)
          5. TestFlight에 업로드 (pilot)

          스크립트만 제공하고 다른 설명은 생략해주세요.

          저장소 내용:
          ${repoContent.substring(0, 30000)}
        `;

        const scriptResult = await genAI.models.generateContent({
          model: modelId,
          contents: [{ role: "user", parts: [{ text: scriptPrompt }] }],
        });

        if (!scriptResult.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error("AI로부터 유효한 스크립트를 생성하지 못했습니다.");
        }

        const fastfileContent = scriptResult.candidates[0].content.parts[0].text
          .replace(/```ruby\n?|```/g, "")
          .trim();
        streamLog("Fastfile 생성 완료.");

        // 3. GitHub Actions 워크플로우 생성
        streamResponse("creating_workflow", {});
        streamLog("GitHub Actions 워크플로우 파일 생성 중...");
        const workflowContent = `
name: Deploy to TestFlight

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: macos-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '2.7'
          bundler-cache: true

      - name: Run Fastlane
        run: bundle exec fastlane ios deploy
        env:
          APPLE_ID: \${{ secrets.APPLE_ID }}
          APP_IDENTIFIER: \${{ secrets.APP_IDENTIFIER }}
          FASTLANE_USER: \${{ secrets.FASTLANE_USER }}
          FASTLANE_PASSWORD: \${{ secrets.FASTLANE_PASSWORD }}
          MATCH_PASSWORD: \${{ secrets.MATCH_PASSWORD }}
          MATCH_GIT_URL: \${{ secrets.MATCH_GIT_URL }}
          MATCH_GIT_BASIC_AUTHORIZATION: \${{ secrets.MATCH_GIT_BASIC_AUTHORIZATION }}
`;
        const branchName = `feature/testflight-automation-${Date.now()}`;
        const mainBranch = await octokit.repos.getBranch({
          owner,
          repo,
          branch: "main",
        });
        await octokit.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: mainBranch.data.commit.sha,
        });

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: "fastlane/Fastfile",
          message: "feat: Add Fastfile for TestFlight deployment",
          content: Buffer.from(fastfileContent).toString("base64"),
          branch: branchName,
        });
        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: ".github/workflows/deploy.yml",
          message: "feat: Add GitHub Actions workflow for TestFlight",
          content: Buffer.from(workflowContent).toString("base64"),
          branch: branchName,
        });
        streamLog(
          `새 브랜치 '${branchName}'에 Fastfile 및 워크플로우 파일 추가 완료.`,
        );

        const pr = await octokit.pulls.create({
          owner,
          repo,
          title: "feat: TestFlight 배포 자동화",
          head: branchName,
          base: "main",
          body: "AI가 생성한 TestFlight 배포 자동화 스크립트 및 워크플로우입니다.",
        });
        await octokit.pulls.merge({ owner, repo, pull_number: pr.data.number });
        streamLog("Pull Request 생성 및 병합 완료.");

        // 4. 워크플로우 실행 대기
        streamResponse("running_workflow", {});
        streamLog("워크플로우 실행을 기다리는 중... (최대 10분)");

        let workflowRun;
        for (let i = 0; i < 60; i++) {
          // 10분 (60 * 10초)
          await new Promise((resolve) => setTimeout(resolve, 10000));
          const runs = await octokit.actions.listWorkflowRunsForRepo({
            owner,
            repo,
            event: "push",
            branch: "main",
          });
          workflowRun = runs.data.workflow_runs[0];
          if (
            workflowRun &&
            workflowRun.status !== "in_progress" &&
            workflowRun.status !== "queued"
          ) {
            break;
          }
          streamLog(`워크플로우 상태: ${workflowRun?.status || "대기 중"}...`);
        }

        if (
          !workflowRun ||
          workflowRun.status === "in_progress" ||
          workflowRun.status === "queued"
        ) {
          throw new Error("워크플로우 실행 시간이 초과되었습니다.");
        }
        streamLog(`워크플로우 실행 완료. 결과: ${workflowRun.conclusion}`);

        // 5. 결과 이슈 생성
        streamResponse("creating_issue", {});
        const issueTitle = `TestFlight 배포 자동화 결과 (${new Date().toLocaleDateString()})`;
        const issueBody = `
## ✈️ TestFlight 배포 자동화 보고서

- **저장소**: ${repoUrl}
- **실행 시간**: ${new Date().toLocaleString()}
- **워크플로우 실행 결과**: ${workflowRun.conclusion}
- **워크플로우 로그**: ${workflowRun.html_url}

### 생성된 파일
- \`fastlane/Fastfile\`
- \`.github/workflows/deploy.yml\`

### 다음 단계
- GitHub 저장소의 Secrets에 필요한 환경변수들을 설정해주세요.
- 배포 성공 여부를 TestFlight에서 확인해주세요.
`;
        const issue = await octokit.issues.create({
          owner,
          repo,
          title: issueTitle,
          body: issueBody,
        });
        streamLog("결과 보고서 이슈 생성 완료.");

        streamResult(issue.data.html_url);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        console.error("E2E 자동화 오류:", error);
        streamError(errorMessage);
      } finally {
        // The controller is automatically closed when the stream is cancelled or errored.
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function getRepoContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string = "",
): Promise<string> {
  try {
    const response = await octokit.repos.getContent({ owner, repo, path });
    if (Array.isArray(response.data)) {
      let content = "";
      for (const file of response.data) {
        if (file.type === "file") {
          content += `\n--- File: ${file.path} ---\n`;
          content += await getRepoContent(octokit, owner, repo, file.path);
        }
      }
      return content;
    } else if (response.data.type === "file" && response.data.content) {
      return Buffer.from(response.data.content, "base64").toString("utf-8");
    }
    return "";
  } catch (error) {
    console.error(`Error fetching repo content for path ${path}:`, error);
    return "";
  }
}
