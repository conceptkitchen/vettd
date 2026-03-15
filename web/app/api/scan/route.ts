import { NextRequest, NextResponse } from "next/server";
import { scanPrompt } from "../../lib/scanner";

const MAX_INPUT_LENGTH = 100_000;

async function fetchUrlContent(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Graded/0.1.0 (AI Prompt Security Scanner)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text.slice(0, MAX_INPUT_LENGTH);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let textToScan: string;
    let source: string = "text";

    if (body.url && typeof body.url === "string") {
      try {
        let rawUrl = body.url.trim();
        if (!/^https?:\/\//i.test(rawUrl)) {
          rawUrl = "https://" + rawUrl;
        }
        const parsed = new URL(rawUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return NextResponse.json(
            { error: "Only HTTP/HTTPS URLs supported" },
            { status: 400 }
          );
        }
        textToScan = await fetchUrlContent(rawUrl);
        source = rawUrl;
      } catch (e) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${e instanceof Error ? e.message : "unknown error"}` },
          { status: 400 }
        );
      }
    } else if (body.text && typeof body.text === "string") {
      textToScan = body.text;
    } else {
      return NextResponse.json(
        { error: "Missing required field: text (string) or url (string)" },
        { status: 400 }
      );
    }

    if (textToScan.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters` },
        { status: 400 }
      );
    }

    const result = scanPrompt(textToScan);

    const format = body.format === "detailed" || body.url ? "detailed" : "summary";

    if (format === "summary") {
      return NextResponse.json({
        source,
        grade: result.scoreData.grade,
        score: result.scoreData.score,
        totalFindings: result.scoreData.totalFindings,
        severity: {
          critical: result.scoreData.criticalCount,
          high: result.scoreData.highCount,
          medium: result.scoreData.mediumCount,
          low: result.scoreData.lowCount,
        },
        checks: result.checks.map((c) => ({
          name: c.checkName,
          passed: c.passed,
          findingCount: c.findings.length,
        })),
        safe: result.scoreData.grade === "A" || result.scoreData.grade === "B",
      });
    }

    return NextResponse.json({
      source,
      grade: result.scoreData.grade,
      score: result.scoreData.score,
      totalFindings: result.scoreData.totalFindings,
      severity: {
        critical: result.scoreData.criticalCount,
        high: result.scoreData.highCount,
        medium: result.scoreData.mediumCount,
        low: result.scoreData.lowCount,
      },
      checks: result.checks.map((c) => ({
        name: c.checkName,
        passed: c.passed,
        findings: c.findings.map((f) => ({
          category: f.category,
          severity: f.severity,
          description: f.description,
          evidence: f.evidence.slice(0, 200),
        })),
      })),
      safe: result.scoreData.grade === "A" || result.scoreData.grade === "B",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
