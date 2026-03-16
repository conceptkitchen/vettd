# Graded — AI Prompt Security Scanner

The security layer between AI agents and the internet. Scan any prompt, URL, llms.txt, or shared skill and get an A-F trust score. Instantly.

## What It Does

AI agents consume content from everywhere: prompt marketplaces, shared skills, MCP tools, llms.txt files, web pages. None of it is scanned for prompt injection. Graded is the trust layer that scans it all.

Two-layer detection:

- **Layer 1 — Regex Engine:** 182+ attack patterns across 9 categories (120 hand-built + 62 from Augustus open source). Instant, deterministic.
- **Layer 2 — AI Deep Scan:** Multi-model analysis via Kalibr (Claude, GPT-4o, Gemini). Catches semantic attacks that regex misses.

The engine learns: when the AI deep scan finds something new, it extracts a regex pattern, validates it against clean text (anti-poisoning), and persists it to a Neon Postgres database. Every scan makes the next scan smarter.

## Architecture

```
Browser → Regex Scan (182+ patterns) → A-F Grade
              ↓ (if deep scan enabled)
         Kalibr API → Claude / GPT-4o / Gemini
              ↓
         Pattern Learner → Neon DB (persistent)
              ↓
         Multi-Source Sync → Augustus, CyberAlb, CL4R1T4S (open source)
```

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes (serverless on Vercel)
- **Database:** Neon Postgres (serverless) — persistent learned patterns
- **AI:** Anthropic Claude, OpenAI GPT-4o, Google Gemini via Kalibr
- **Open Source Patterns:** [praetorian-inc/augustus](https://github.com/praetorian-inc/augustus), [CyberAlbSecOP/Awesome_GPT_Super_Prompting](https://github.com/CyberAlbSecOP/Awesome_GPT_Super_Prompting), [elder-plinius/CL4R1T4S](https://github.com/elder-plinius/CL4R1T4S)
- **Security Scanning:** Aikido SAST + CodeRabbit AI code review (SDLC)

## Deployment Surfaces

1. **Web App** — getgraded.vercel.app
2. **CLI** — `python3 graded.py scan --text "..."`
3. **REST API** — `POST /api/scan`
4. **npm Package** — `import { scanPrompt } from '@graded/scanner'`
5. **MCP Server** — AI agents scan prompts and URLs before executing
6. **Chrome Extension** — Real-time grades while you type
7. **Marketplace Scanner** — Grade prompts on FlowGPT, PromptBase, GitHub

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scan` | POST | Scan a prompt (text or URL). Returns grade, score, findings. |
| `/api/patterns` | GET | Get current pattern library status + learned patterns. |
| `/api/patterns/sync` | GET | Check pattern library status + sync sources. |
| `/api/patterns/sync` | POST | Pull new patterns from Augustus, CyberAlb, CL4R1T4S. Returns sync results. |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `ANTHROPIC_API_KEY` | For deep scan | Claude API key for AI deep scan + pattern learning |
| `KALIBR_API_KEY` | For deep scan | Kalibr multi-model routing |

## Development

```bash
cd web
npm install
cp .env.local.example .env.local  # Add your keys
npm run dev
```

## Attack Categories

DAN Jailbreak, Token Manipulation, ChatML Injection, Payload Splitting, Markdown Exfiltration, Emotional Manipulation, RAG Poisoning, Steganographic, Obfuscation — and more.

## License

Apache 2.0

## Built By

RJ Moscardon — [The Concept Kitchen](https://theconceptkitchen.xyz)
