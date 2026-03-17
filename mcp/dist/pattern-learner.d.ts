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
export interface LearnedPattern {
    pattern: string;
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    learnedFrom: string;
    learnedAt: string;
    validated: boolean;
}
export declare function generatePattern(finding: {
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    evidence: string;
}): Promise<LearnedPattern | null>;
export declare function learnFromFindings(deepFindings: Array<{
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    evidence: string;
}>): Promise<LearnedPattern[]>;
export declare function getLearnedPatterns(): Promise<LearnedPattern[]>;
export declare function getLearnedPatternsCount(): Promise<number>;
/**
 * Returns learned patterns grouped by category for the scanner to use.
 * Format matches what scanPrompt() expects.
 */
export declare function getLearnedPatternsForScanner(): Promise<Array<{
    pattern: string;
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
}>>;
