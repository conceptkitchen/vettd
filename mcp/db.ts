/**
 * Graded MCP — Neon database connection for learned patterns.
 * Only active when DATABASE_URL environment variable is set.
 * Ported from web/app/lib/db.ts for Node.js/MCP usage.
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

function getSQL() {
  if (!DATABASE_URL) {
    return null;
  }
  return neon(DATABASE_URL);
}

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
export async function saveLearnedPattern(p: Omit<DBLearnedPattern, "id" | "learned_at">): Promise<boolean> {
  const sql = getSQL();
  if (!sql) return false;

  try {
    await sql`
      INSERT INTO learned_patterns (pattern, category, severity, description, learned_from, validated, source)
      VALUES (${p.pattern}, ${p.category}, ${p.severity}, ${p.description}, ${p.learned_from}, ${p.validated}, ${p.source})
      ON CONFLICT (pattern) DO NOTHING
    `;
    return true;
  } catch (e) {
    console.error("Failed to save learned pattern:", e);
    return false;
  }
}

/**
 * Get all validated learned patterns from the database.
 */
export async function getPersistedPatterns(): Promise<DBLearnedPattern[]> {
  const sql = getSQL();
  if (!sql) return [];

  try {
    const rows = await sql`
      SELECT id, pattern, category, severity, description, learned_from, learned_at, validated, source
      FROM learned_patterns
      WHERE validated = true
      ORDER BY learned_at DESC
    `;
    return rows as DBLearnedPattern[];
  } catch (e) {
    console.error("Failed to get persisted patterns:", e);
    return [];
  }
}

/**
 * Get count of persisted learned patterns.
 */
export async function getPersistedPatternCount(): Promise<number> {
  const sql = getSQL();
  if (!sql) return 0;

  try {
    const rows = await sql`SELECT COUNT(*)::int as count FROM learned_patterns WHERE validated = true`;
    return rows[0]?.count ?? 0;
  } catch (e) {
    console.error("Failed to count persisted patterns:", e);
    return 0;
  }
}

/**
 * Check if database is available.
 */
export function isDatabaseConfigured(): boolean {
  return !!DATABASE_URL;
}
