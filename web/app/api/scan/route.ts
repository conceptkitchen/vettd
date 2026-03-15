import { NextRequest, NextResponse } from "next/server";
import { scanPrompt } from "../../lib/scanner";
import { deepScan, DeepScanResult } from "../../lib/deep-scanner";
import { learnFromFindings, getLearnedPatternsForScanner, getLearnedPatternsCount } from "../../lib/pattern-learner";

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

    // Get learned patterns (from previous deep scans in this server instance)
    const learnedPatterns = getLearnedPatternsForScanner();

    // Run regex scan with both base + learned patterns
    const result = scanPrompt(textToScan, learnedPatterns);
    const format = body.format === "detailed" || body.url ? "detailed" : "summary";
    const isDeep = body.deep === true;

    // Run deep scan if requested
    let deepFindings: { category: string; severity: "critical" | "high" | "medium" | "low"; description: string; evidence: string }[] = [];
    let deepSummary: string | null = null;
    let deepConfidence: number | null = null;
    let deepError: string | null = null;
    let deepModel: string | null = null;
    let deepRoutedBy: string | null = null;

    if (isDeep) {
      try {
        const deepResult: DeepScanResult = await deepScan(textToScan);
        deepFindings = deepResult.findings;
        deepSummary = deepResult.summary;
        deepConfidence = deepResult.confidence;
        deepModel = deepResult.model || null;
        deepRoutedBy = deepResult.routedBy || null;
      } catch (e) {
        deepError = e instanceof Error ? e.message : "Deep scan failed";
      }
    }

    // Merge deep findings into the regex results for combined scoring
    let combinedScore = result.scoreData.score;
    let combinedGrade = result.scoreData.grade;
    let combinedTotal = result.scoreData.totalFindings;
    const severityCounts = {
      critical: result.scoreData.criticalCount,
      high: result.scoreData.highCount,
      medium: result.scoreData.mediumCount,
      low: result.scoreData.lowCount,
    };

    // Add deep findings that aren't duplicates of regex findings
    const uniqueDeepFindings = deepFindings.filter((df) => {
      return !result.checks.some((check) =>
        check.findings.some(
          (f) =>
            f.category === df.category &&
            f.evidence === df.evidence
        )
      );
    });

    for (const f of uniqueDeepFindings) {
      combinedTotal++;
      severityCounts[f.severity]++;
      const penalty =
        f.severity === "critical" ? 25 : f.severity === "high" ? 15 : f.severity === "medium" ? 10 : 5;
      combinedScore = Math.max(0, combinedScore - penalty);
    }

    if (combinedScore >= 90) combinedGrade = "A";
    else if (combinedScore >= 70) combinedGrade = "B";
    else if (combinedScore >= 50) combinedGrade = "C";
    else if (combinedScore >= 25) combinedGrade = "D";
    else combinedGrade = "F";

    // LEARN: If deep scan found things regex missed, generate new patterns
    let patternsLearned = 0;
    if (isDeep && uniqueDeepFindings.length > 0 && !deepError) {
      const newPatterns = await learnFromFindings(uniqueDeepFindings);
      patternsLearned = newPatterns.length;
    }

    const responseData: Record<string, unknown> = {
      source,
      grade: isDeep ? combinedGrade : result.scoreData.grade,
      score: isDeep ? combinedScore : result.scoreData.score,
      totalFindings: isDeep ? combinedTotal : result.scoreData.totalFindings,
      severity: isDeep ? severityCounts : {
        critical: result.scoreData.criticalCount,
        high: result.scoreData.highCount,
        medium: result.scoreData.mediumCount,
        low: result.scoreData.lowCount,
      },
      checks: result.checks.map((c) => {
        if (format === "summary" && !isDeep) {
          return { name: c.checkName, passed: c.passed, findingCount: c.findings.length };
        }
        return {
          name: c.checkName,
          passed: c.passed,
          findings: c.findings.map((f) => ({
            category: f.category,
            severity: f.severity,
            description: f.description,
            evidence: f.evidence.slice(0, 200),
          })),
        };
      }),
      safe: (isDeep ? combinedGrade : result.scoreData.grade) === "A" ||
        (isDeep ? combinedGrade : result.scoreData.grade) === "B",
      patternLibrary: {
        base: 185,
        learned: getLearnedPatternsCount(),
        total: 185 + getLearnedPatternsCount(),
        newThisScan: patternsLearned,
      },
    };

    if (isDeep) {
      responseData.deep = {
        findings: uniqueDeepFindings.map((f) => ({
          category: f.category,
          severity: f.severity,
          description: f.description,
          evidence: f.evidence.slice(0, 200),
        })),
        summary: deepSummary,
        confidence: deepConfidence,
        error: deepError,
        model: deepModel,
        routedBy: deepRoutedBy,
        additionalFindings: uniqueDeepFindings.length,
      };
    }

    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
