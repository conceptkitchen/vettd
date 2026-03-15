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
export {};
