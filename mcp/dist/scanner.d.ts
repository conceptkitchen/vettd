/**
 * Graded Scanner Core — shared between MCP server, API, and npm package.
 * TypeScript port of the Python regex checkers.
 * Base patterns (120) + Augustus open source patterns (62) + Hybrid threat categories (3)
 */
export declare const BASE_PATTERN_COUNT = 120;
export declare const HYBRID_PATTERN_COUNT = 30;
export declare const TOTAL_STATIC_PATTERNS: number;
export interface Finding {
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    evidence: string;
}
export interface CheckResult {
    checkName: string;
    passed: boolean;
    findings: Finding[];
}
export interface ScoreData {
    score: number;
    grade: string;
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
}
export interface ScanResult {
    checks: CheckResult[];
    scoreData: ScoreData;
}
/**
 * Main scan function. Runs all base checkers + Augustus patterns + hybrid threats.
 * Optionally accepts extra learned patterns from Neon DB.
 */
export declare function scanPrompt(text: string, extraPatterns?: Array<{
    pattern: string;
    category: string;
    severity: Finding["severity"];
    description: string;
}>): ScanResult;
