import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type SuggestedAction =
  | { type: "fill"; selector: string; value: string }
  | { type: "click"; selector: string }
  | { type: "expectVisible"; selector: string }
  | { type: "waitForSelector"; selector: string }
  | { type: "waitForTimeout"; ms: number };

type RouteSuggestion = {
  path: string;
  actions: SuggestedAction[];
};

function readTextContent(html: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\n\r\t\s\S]*?)<\/${tag}>`, "gi");
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    // Strip tags inside and trim
    const raw = m[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (raw) results.push(raw);
  }
  return results;
}

export async function GET() {
  try {
    const root = process.cwd();
    const appDir = path.join(root, "src", "app");
    const suggestions: RouteSuggestion[] = [];

    if (!fs.existsSync(appDir)) {
      return NextResponse.json({ routes: [] });
    }

    // include root
    const rootPage = path.join(appDir, "page.tsx");
    const candidates: { route: string; file: string }[] = [];
    if (fs.existsSync(rootPage)) {
      candidates.push({ route: "/", file: rootPage });
    }

    // first-level routes only (align with generator scope)
    const entries = fs.readdirSync(appDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;
      if (name === "api" || name.startsWith("(") || name.startsWith("_"))
        continue;
      const file = path.join(appDir, name, "page.tsx");
      if (fs.existsSync(file)) {
        candidates.push({ route: `/${name}`, file });
      }
    }

    for (const c of candidates) {
      try {
        const content = fs.readFileSync(c.file, "utf8");
        const actions: SuggestedAction[] = [];

        // Heuristics: heading -> expectVisible
        const h1s = readTextContent(content, "h1");
        if (h1s.length) {
          actions.push({ type: "expectVisible", selector: `text=${h1s[0]}` });
        }

        // Buttons by text
        const buttons = readTextContent(content, "button");
        const prioritized =
          buttons.find((t) => /실행|start|run|submit/i.test(t)) || buttons[0];
        if (prioritized) {
          actions.push({
            type: "click",
            selector: `button:has-text("${prioritized}")`,
          });
        }

        // Inputs/textarea
        if (/\btextarea\b/i.test(content)) {
          actions.push({ type: "fill", selector: "textarea", value: "test" });
        } else if (/\b<input(?![^>]*type=\"hidden\")[^>]*>/i.test(content)) {
          actions.push({ type: "fill", selector: "input", value: "test" });
        }

        // data-testid presence -> expectVisible
        const testIdMatch = content.match(/data-testid=["']([^"']+)["']/);
        if (testIdMatch) {
          actions.push({
            type: "expectVisible",
            selector: `[data-testid=\"${testIdMatch[1]}\"]`,
          });
        }

        suggestions.push({ path: c.route, actions });
      } catch {
        // ignore single route errors
      }
    }

    return NextResponse.json({ routes: suggestions });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
