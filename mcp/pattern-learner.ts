/**
 * Pattern Learner for MCP — Converts deep scan findings into regex patterns.
 *
 * When the LLM catches something regex missed, this module:
 * 1. Asks Claude to generate a regex pattern for the finding
 * 2. Validates the pattern against clean examples (anti-poisoning)
 * 3. Persists it to Neon database (survives process restarts)
 *
 * The feedback loop: LLM catches -> pattern extracted -> regex catches next time
 *
 * Ported from web/app/lib/pattern-learner.ts for Node.js/MCP usage.
 */

import { saveLearnedPattern, getPersistedPatterns, getPersistedPatternCount } from "./db.js";

export interface LearnedPattern {
  pattern: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  learnedFrom: string;
  learnedAt: string;
  validated: boolean;
}

// In-memory cache (populated from DB on first request)
let learnedPatterns: LearnedPattern[] = [];
let cacheLoaded = false;

// Clean examples that should NOT trigger any pattern (anti-poisoning validation)
const CLEAN_EXAMPLES = [
  "You are a helpful writing assistant. Help users improve their essays with constructive feedback.",
  "Summarize this article in three bullet points. Focus on the main argument.",
  "Translate the following text from English to Spanish. Maintain the original tone.",
];

const PATTERN_GEN_PROMPT = `You are a security pattern engineer. Given a prompt injection finding, generate a regex pattern that would catch this and similar attacks.

Rules:
1. Return ONLY a JSON object: {"pattern": "regex_here", "category": "category_name", "description": "what it catches"}
2. The regex should use JavaScript regex syntax
3. Use \\b for word boundaries, \\s for whitespace
4. Make it general enough to catch variations but specific enough to avoid false positives
5. The pattern should be case-insensitive (flags added separately)
6. DO NOT make patterns so broad they match normal text
7. Focus on the ATTACK TECHNIQUE, not the specific words

Return ONLY valid JSON. No markdown, no explanation.`;

/**
 * Load patterns from database into memory cache.
 */
async function ensureCache(): Promise<void> {
  if (cacheLoaded) return;
  try {
    const persisted = await getPersistedPatterns();
    learnedPatterns = persisted.map((p) => ({
      pattern: p.pattern,
      category: p.category,
      severity: p.severity as LearnedPattern["severity"],
      description: p.description,
      learnedFrom: p.learned_from ?? "",
      learnedAt: p.learned_at ?? new Date().toISOString(),
      validated: p.validated,
    }));
    cacheLoaded = true;
  } catch {
    // DB unavailable — fall back to empty in-memory
  }
}

export async function generatePattern(
  finding: { category: string; severity: "critical" | "high" | "medium" | "low"; description: string; evidence: string }
): Promise<LearnedPattern | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        system: PATTERN_GEN_PROMPT,
        messages: [
          {
            role: "user",
            content: `Generate a regex pattern for this finding:\nCategory: ${finding.category}\nDescription: ${finding.description}\nEvidence: "${finding.evidence}"`,
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) return null;

    const parsed = JSON.parse(content);
    if (!parsed.pattern) return null;

    // Validate: pattern must compile
    try {
      new RegExp(parsed.pattern, "gim");
    } catch {
      return null; // Invalid regex, discard
    }

    // Anti-poisoning: test against clean examples
    const re = new RegExp(parsed.pattern, "gim");
    for (const clean of CLEAN_EXAMPLES) {
      if (re.test(clean.toLowerCase())) {
        return null; // False positive on clean text, discard
      }
      re.lastIndex = 0; // Reset regex state
    }

    const learned: LearnedPattern = {
      pattern: parsed.pattern,
      category: parsed.category || finding.category,
      severity: finding.severity,
      description: parsed.description || finding.description,
      learnedFrom: finding.evidence.slice(0, 200),
      learnedAt: new Date().toISOString(),
      validated: true,
    };

    return learned;
  } catch {
    return null;
  }
}

export async function learnFromFindings(
  deepFindings: Array<{ category: string; severity: "critical" | "high" | "medium" | "low"; description: string; evidence: string }>
): Promise<LearnedPattern[]> {
  await ensureCache();
  const newPatterns: LearnedPattern[] = [];

  for (const finding of deepFindings) {
    // Don't learn duplicates
    const isDuplicate = learnedPatterns.some(
      (lp) => lp.learnedFrom === finding.evidence.slice(0, 200)
    );
    if (isDuplicate) continue;

    const pattern = await generatePattern(finding);
    if (pattern) {
      learnedPatterns.push(pattern);
      newPatterns.push(pattern);

      // Persist to database
      await saveLearnedPattern({
        pattern: pattern.pattern,
        category: pattern.category,
        severity: pattern.severity,
        description: pattern.description,
        learned_from: pattern.learnedFrom,
        validated: pattern.validated,
        source: "ai_deep_scan",
      });
    }
  }

  return newPatterns;
}

export async function getLearnedPatterns(): Promise<LearnedPattern[]> {
  await ensureCache();
  return [...learnedPatterns];
}

export async function getLearnedPatternsCount(): Promise<number> {
  // Try DB first for accurate count
  try {
    const dbCount = await getPersistedPatternCount();
    if (dbCount > 0) return dbCount;
  } catch {
    // fall through to cache
  }
  return learnedPatterns.length;
}

/**
 * Returns learned patterns grouped by category for the scanner to use.
 * Format matches what scanPrompt() expects.
 */
export async function getLearnedPatternsForScanner(): Promise<Array<{
  pattern: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}>> {
  await ensureCache();
  return learnedPatterns.map((lp) => ({
    pattern: lp.pattern,
    category: lp.category,
    severity: lp.severity,
    description: lp.description,
  }));
}
