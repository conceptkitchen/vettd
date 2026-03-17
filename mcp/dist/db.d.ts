/**
 * Graded MCP — Neon database connection for learned patterns.
 * Only active when DATABASE_URL environment variable is set.
 * Ported from web/app/lib/db.ts for Node.js/MCP usage.
 */
export interface DBLearnedPattern {
    id?: number;
    pattern: string;
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    learned_from: string;
    learned_at?: string;
    validated: boolean;
    source: string;
}
/**
 * Save a learned pattern to the database. Upserts on pattern uniqueness.
 */
export declare function saveLearnedPattern(p: Omit<DBLearnedPattern, "id" | "learned_at">): Promise<boolean>;
/**
 * Get all validated learned patterns from the database.
 */
export declare function getPersistedPatterns(): Promise<DBLearnedPattern[]>;
/**
 * Get count of persisted learned patterns.
 */
export declare function getPersistedPatternCount(): Promise<number>;
/**
 * Check if database is available.
 */
export declare function isDatabaseConfigured(): boolean;
