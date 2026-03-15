/**
 * Graded - AI prompt security scanner.
 * Trust grades for the AI age.
 *
 * Usage:
 *   import { scan, isPromptSafe } from 'graded';
 *
 *   const result = scan("Your prompt text here");
 *   console.log(result.scoreData.grade); // "A" through "F"
 *   console.log(isPromptSafe("Some prompt")); // true/false
 */

export type { Finding, CheckResult, ScoreData, ScanResult } from "./scanner.js";
export { scanPrompt as scan } from "./scanner.js";

import { scanPrompt } from "./scanner.js";

/**
 * Quick check: returns true if the prompt grades A or B (safe).
 */
export function isPromptSafe(text: string): boolean {
  const result = scanPrompt(text);
  return result.scoreData.grade === "A" || result.scoreData.grade === "B";
}

/**
 * Returns the trust grade (A-F) for a prompt.
 */
export function getGrade(text: string): string {
  return scanPrompt(text).scoreData.grade;
}

/**
 * Returns the numeric trust score (0-100) for a prompt.
 */
export function getScore(text: string): number {
  return scanPrompt(text).scoreData.score;
}
