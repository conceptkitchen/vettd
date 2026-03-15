#!/usr/bin/env node
/**
 * Graded MCP Server — AI prompt security scanner as an MCP tool.
 *
 * Exposes two tools:
 *   - scan_prompt: Scan a single prompt for security issues
 *   - scan_mcp_config: Scan an MCP config file for risky server definitions
 *
 * Usage in claude_desktop_config.json:
 *   {
 *     "mcpServers": {
 *       "graded": {
 *         "command": "npx",
 *         "args": ["@graded/mcp-server"]
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { scanPrompt } from "./scanner.js";

const MAX_INPUT_LENGTH = 100_000;

const server = new McpServer({
  name: "graded",
  version: "0.1.0",
});

// Tool 1: Scan a prompt
server.tool(
  "scan_prompt",
  "Scan an AI prompt for security threats including jailbreaks, injection attacks, credential harvesting, data exfiltration, and more. Returns a trust grade (A-F) and detailed findings.",
  {
    text: z
      .string()
      .max(MAX_INPUT_LENGTH)
      .describe("The prompt text to scan for security issues"),
    format: z
      .enum(["summary", "detailed"])
      .default("summary")
      .describe("Output format: 'summary' for grade + counts, 'detailed' for full findings"),
  },
  async ({ text, format }) => {
    if (!text.trim()) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: "Empty prompt text provided" }),
          },
        ],
      };
    }

    const result = scanPrompt(text);

    if (format === "summary") {
      const summary = {
        grade: result.scoreData.grade,
        score: result.scoreData.score,
        totalFindings: result.scoreData.totalFindings,
        severity: {
          critical: result.scoreData.criticalCount,
          high: result.scoreData.highCount,
          medium: result.scoreData.mediumCount,
          low: result.scoreData.lowCount,
        },
        checks: result.checks.map((c) => ({
          name: c.checkName,
          passed: c.passed,
          findingCount: c.findings.length,
        })),
        safe: result.scoreData.grade === "A" || result.scoreData.grade === "B",
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }],
      };
    }

    // Detailed format
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              grade: result.scoreData.grade,
              score: result.scoreData.score,
              totalFindings: result.scoreData.totalFindings,
              severity: {
                critical: result.scoreData.criticalCount,
                high: result.scoreData.highCount,
                medium: result.scoreData.mediumCount,
                low: result.scoreData.lowCount,
              },
              checks: result.checks.map((c) => ({
                name: c.checkName,
                passed: c.passed,
                findings: c.findings.map((f) => ({
                  category: f.category,
                  severity: f.severity,
                  description: f.description,
                  evidence: f.evidence.slice(0, 200),
                })),
              })),
              safe: result.scoreData.grade === "A" || result.scoreData.grade === "B",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Tool 2: Batch scan multiple prompts
server.tool(
  "scan_prompts_batch",
  "Scan multiple prompts at once. Returns grades for each and an overall risk summary.",
  {
    prompts: z
      .array(
        z.object({
          id: z.string().describe("Identifier for this prompt"),
          text: z.string().max(MAX_INPUT_LENGTH).describe("The prompt text to scan"),
        })
      )
      .max(50)
      .describe("Array of prompts to scan (max 50)"),
  },
  async ({ prompts }) => {
    const results = prompts.map((p) => {
      const result = scanPrompt(p.text);
      return {
        id: p.id,
        grade: result.scoreData.grade,
        score: result.scoreData.score,
        totalFindings: result.scoreData.totalFindings,
        safe: result.scoreData.grade === "A" || result.scoreData.grade === "B",
      };
    });

    const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const r of results) {
      gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
    }

    const unsafe = results.filter((r) => !r.safe);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              total: results.length,
              gradeDistribution,
              unsafeCount: unsafe.length,
              results,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Graded MCP server error:", error);
  process.exit(1);
});
