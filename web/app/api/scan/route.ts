import { NextRequest, NextResponse } from "next/server";
import { scanPrompt } from "../../lib/scanner";

const MAX_INPUT_LENGTH = 100_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.text || typeof body.text !== "string") {
      return NextResponse.json(
        { error: "Missing required field: text (string)" },
        { status: 400 }
      );
    }

    if (body.text.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters` },
        { status: 400 }
      );
    }

    const result = scanPrompt(body.text);

    const format = body.format === "detailed" ? "detailed" : "summary";

    if (format === "summary") {
      return NextResponse.json({
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
