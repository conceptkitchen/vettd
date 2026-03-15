/**
 * Graded Scanner Core — shared between MCP server, API, and npm package.
 * TypeScript port of the Python regex checkers.
 */
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
export declare function scanPrompt(text: string): ScanResult;
