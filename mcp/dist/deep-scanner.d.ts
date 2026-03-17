/**
 * Graded Deep Scanner for MCP — AI-powered semantic analysis.
 * Uses Kalibr REST API for outcome-aware multi-model routing.
 * Falls back to direct Anthropic API if Kalibr not configured.
 *
 * Ported from web/app/lib/deep-scanner.ts for Node.js/MCP usage.
 * Includes XML boundary sandboxing from deep_scan.py.
 */
interface DeepFinding {
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    evidence: string;
}
export interface DeepScanResult {
    findings: DeepFinding[];
    summary: string;
    confidence: number;
    model?: string;
    routedBy?: "kalibr" | "direct";
}
/**
 * Main entry - routes through Kalibr if configured, otherwise direct
 */
export declare function deepScan(text: string): Promise<DeepScanResult>;
export {};
