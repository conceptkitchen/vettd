# Vettd -- Slide Deck Outline

**5 slides maximum. Clean. Minimal text. Let the speaker do the work.**

---

## SLIDE 1: The Problem

**Layout:** Black background. White text. One stat, massive font. Subtext below.

```
                    260,000 prompts.
                    425,000 users.
                    Zero security scanning.


    PromptBase. FlowGPT. GPT Store.
    Millions of prompts shared daily. Nobody checks if they're safe.
```

**Notes:** This slide stays up during the problem section. No logos, no graphics. Just the number.

---

## SLIDE 2: Live Demo Output

**Layout:** Full-screen terminal capture. Dark background. Colored output.

```
  +------------------------------------------------------------------+
  |                                                                    |
  |  $ vettd scan --file dan_prompt.txt                                |
  |                                                                    |
  |  [SCANNING] DAN jailbreak prompt (FlowGPT, 847K uses)             |
  |                                                                    |
  |  CHECK              STATUS    DETAIL                               |
  |  -----              ------    ------                               |
  |  Structure           [!]      1,247 tokens, high complexity        |
  |  Role Override       [X]      FAIL - forces persona override       |
  |  Safety Bypass       [X]      FAIL - explicit safety dismissal     |
  |  Injection Payload   [X]      FAIL - hidden instruction block      |
  |  Data Exfil          [!]      WARN - requests system prompt leak   |
  |  Prompt Leaking      [X]      FAIL - extraction instructions       |
  |  Obfuscation         [!]      WARN - encoded instruction segments  |
  |  Social Engineering  [!]      WARN - manipulative framing          |
  |                                                                    |
  |  TRUST GRADE:  F                                                   |
  |  RISK LEVEL:   CRITICAL                                            |
  |  FINDINGS:     4 critical, 3 warnings                              |
  |                                                                    |
  |  Full report: vettd.report/scan/a8f3d2e1                           |
  |                                                                    |
  +------------------------------------------------------------------+
```

**Color key (for actual terminal):**
- `[X] FAIL` = Red
- `[!] WARN` = Yellow
- `[ ] PASS` = Green
- Trust grade F = Bold red, large
- Trust grade A = Bold green, large

**Notes:** If doing a live demo, this slide is the terminal itself. If pre-recorded, use a screenshot of actual output with color. The colored grades are the visual hook.

---

## SLIDE 3: Comparison Table

**Layout:** Clean table. Vettd column highlighted. Competitors grayed out.

```
  WHAT GETS SCANNED TODAY?

  +------------------+----------+-----------+----------+---------+
  |                  | mcp-scan | Invariant | Prompt   | Vettd   |
  |                  |          | Labs      | Security |         |
  +------------------+----------+-----------+----------+---------+
  | MCP Servers      |    Yes   |    Yes    |    --    |   --    |
  | Tool Configs     |    Yes   |    Yes    |    --    |   --    |
  | API Endpoints    |    --    |    Yes    |   Yes    |   --    |
  | Shared Prompts   |    --    |    --     |    --    |   YES   |
  | Trust Grading    |    --    |    --     |    --    |   YES   |
  | Semantic Analysis|    --    |    --     | Partial  |   YES   |
  | Decentralized    |    --    |    --     |    --    |   YES   |
  +------------------+----------+-----------+----------+---------+

  They scan the pipes. We scan what flows through them.
```

**Notes:** The point is clear. Nobody else scans prompts. Don't trash competitors. They do good work on a different problem. We do the thing nobody else does.

---

## SLIDE 4: Architecture / Bittensor Subnet

**Layout:** ASCII-style architecture diagram. Clean, not cluttered.

```
  THE VETTD NETWORK

  +------------------+
  |   PROMPT INPUT   |    User submits prompt for scanning
  +--------+---------+
           |
           v
  +--------+---------+         +-------------------+
  |   VETTD SCANNER  | ------> |   SCAN REPORT     |
  |  (Claude-powered) |         |  (stored on IPFS) |
  +--------+---------+         +-------------------+
           |                            |
           v                            v
  +--------+---------+         +-------------------+
  |  BITTENSOR SUBNET |         |  SOLANA REGISTRY  |
  |                    |         |                   |
  |  Miners: scan      |         |  Trust score      |
  |  Validators: verify |        |  on-chain         |
  |  TAO: rewards best  |        |  (Metaplex NFT    |
  |    scanners         |        |   trust badge)    |
  +--------+---------+         +-------------------+
           |                            |
           v                            v
  +--------+---------+         +-------------------+
  |  LIT PROTOCOL     |         |  TRUST BADGE      |
  |                    |         |                   |
  |  Free: grade only  |         |  A  B  C  D  F   |
  |  Gated: full report |        |  Visible on       |
  |  (token-gated      |         |  prompt listing   |
  |   access control)  |         |                   |
  +--------------------+         +-------------------+


  Scan. Score. Trust.
```

**Notes:** Walk through this top to bottom during the vision section. Don't try to explain every box. Hit the flow: prompt goes in, grade comes out, network makes it trustless.

---

## SLIDE 5: The Close

**Layout:** Black background. Three words. Large font. Team info small at bottom.

```
                         Scan. Score. Trust.


                              VETTD
                    AI prompt security, graded.


                    RJ Moscardon  |  [teammate(s)]
                    github.com/[repo]
                    @conceptkitchen
```

**Notes:** This slide stays up during Q&A. Clean, memorable. The three-word tagline is the takeaway. If judges remember one thing, it's "Scan. Score. Trust."

---

## SLIDE DESIGN PRINCIPLES

1. **Max 15 words per slide** (excluding the terminal output and comparison table)
2. **Black backgrounds, white text.** Hacker aesthetic. Matches the terminal demo.
3. **No bullet points.** If you need bullets, you have too much text.
4. **No stock photos.** No AI-generated art. No gradients. Just typography and data.
5. **The terminal IS the demo.** Don't screenshot it into a slide if you can run it live.
