#!/usr/bin/env node
/**
 * Graded MCP Server — AI prompt security scanner as an MCP tool.
 *
 * Exposes six tools with human-in-the-loop consent:
 *   - scan_prompt: Scan a single prompt for security issues (with optional deep scan)
 *   - scan_url: Fetch and scan a URL (llms.txt, web pages, shared skills)
 *   - scan_prompts_batch: Batch scan multiple prompts
 *   - scan_response: Scan LLM output for echo attacks, encoded payloads, credential leaks
 *   - scan_data: Scan tool call results for embedded injection in structured data
 *   - scan_mcp_config: Scan an MCP config file/JSON for risky server definitions
 *
 * Action directives (returned in every scan response):
 *   - "allow" (A grade): Safe to consume
 *   - "review" (B/C grades): Pause and show findings to user before proceeding
 *   - "block" (D/F grades): Do not consume without explicit user override
 *
 * Environment variables (optional):
 *   - DATABASE_URL: Neon DB connection for learned patterns
 *   - KALIBR_API_KEY: Kalibr routing for deep scan
 *   - ANTHROPIC_API_KEY: For deep scan (Anthropic models)
 *   - OPENAI_API_KEY: For deep scan (OpenAI models)
 *   - GOOGLE_API_KEY: For deep scan (Google models)
 */
export {};
