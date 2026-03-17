/**
 * Augustus-sourced patterns — ported from praetorian-inc/augustus (Apache 2.0)
 * Attack patterns extracted from 30+ probe categories covering DAN jailbreaks,
 * ChatML injection, payload splitting, markdown exfiltration, emotional manipulation,
 * web agent injection, RAG poisoning, steganographic attacks, and more.
 *
 * Ported from web/app/lib/augustus-patterns.ts for Node.js/MCP usage.
 */
export interface AugustusPattern {
    pattern: string;
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    source: string;
}
export declare const AUGUSTUS_PATTERNS: AugustusPattern[];
/** Total count of Augustus-sourced patterns */
export declare const AUGUSTUS_PATTERN_COUNT: number;
