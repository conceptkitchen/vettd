# Graded -- 3-Minute Pitch Script

**Event:** Intelligence at the Frontier Hackathon
**Track:** AI Safety & Evaluation
**Time limit:** 3 minutes
**Judging:** Sunday March 15, 1:00 PM

---

## 0:00-0:30 -- THE HOOK

[STANDING CENTER STAGE. NO SLIDES YET.]

"Quick show of hands. How many of you copied a prompt from the internet this week?"

[WAIT FOR HANDS. MOST OF THE ROOM.]

"Cool. Now keep your hand up if you checked whether that prompt was safe before you pasted it into your AI."

[PAUSE. WATCH HANDS DROP.]

"Nobody. And that's not your fault. There's literally nothing to check it with. No scanner. No rating. No trust signal. You just... paste and pray."

[BEAT.]

"Until now."

[CLICK TO SLIDE 1]

---

## 0:30-1:00 -- THE PROBLEM

[SLIDE 1: "260K prompts. Zero security scanning."]

"Here's the landscape right now."

"PromptBase has 260,000 prompts and 425,000 users. Their security review? Manual. A human skimming prompts."

"FlowGPT has millions of shared prompts. Their security review? Zero. Literally none."

"The GPT Store has over 100,000 custom GPTs. OpenAI doesn't scan for prompt injection in any of them."

[PAUSE FOR EFFECT.]

"We pulled 50 of the most popular shared prompts from these platforms. Prompts with hundreds of thousands of downloads. We scanned every single one."

"14 of them contained some form of hidden instruction injection. That's 28%."

"One of them had been downloaded 847,000 times. Nearly a million people ran a prompt with hidden instructions baked in. Nobody checked."

[CLICK TO TERMINAL]

---

## 1:00-2:00 -- THE LIVE DEMO

[SWITCH TO TERMINAL. FULL SCREEN. DARK BACKGROUND.]

"Let me show you what checking looks like."

"This is a real prompt from FlowGPT. It's a DAN-style jailbreak prompt. 847,000 uses. I'm going to scan it live."

[TYPE THE COMMAND. LET THE SCAN RUN.]

```
graded scan --file dan_prompt.txt
```

[AS EACH CHECK APPEARS, NARRATE:]

"First it checks the structure. How long is this thing, what's the complexity."

[GREEN/YELLOW/RED INDICATORS APPEAR IN TERMINAL]

"Now it's analyzing the instructions. What is this prompt actually telling the AI to do?"

[FINDINGS START POPULATING]

"There it is. Role override. It's telling the model to ignore its safety guidelines. System prompt extraction attempt. It's trying to get the model to leak its own instructions. And hidden behavioral injection. Instructions buried in the middle that the user would never notice reading casually."

[TRUST GRADE APPEARS: F]

"Trust grade: F. This prompt is actively hostile. And 847,000 people used it without knowing."

[PAUSE.]

"That took 8 seconds. A human reviewer wouldn't catch half of those findings in 8 minutes."

[CLICK TO COMPARISON SLIDE]

---

## 2:00-2:30 -- THE DIFFERENTIATION

[SLIDE 3: COMPARISON TABLE]

"Now you might be thinking, doesn't this already exist? Kind of. But not really."

"Every security tool in the AI space right now scans MCP servers. They scan tool configurations. They scan API endpoints. Good work, important work."

"Nobody scans the prompts. The actual text that millions of people copy and paste into their AI every single day. That's the gap."

[POINT TO COMPARISON TABLE]

"Pattern matching catches the obvious stuff. Keywords, known payloads. We use Claude to analyze what a prompt actually instructs the AI to do. Semantic analysis. It reads the prompt like an AI reads a prompt, because it IS an AI reading a prompt."

"Think of it like restaurant health grades."

[BEAT.]

"Every restaurant in LA has a letter grade in the window. A, B, C. You glance at it before you walk in. You don't read the full inspection report. You just need the signal."

"Every prompt you download should have that. A trust grade. At a glance. That's Graded."

---

## 2:30-3:00 -- THE VISION

[SLIDE 4: ARCHITECTURE DIAGRAM]

"Today, Graded is a scanner. You run it, you get a grade. That's the product."

"Tomorrow, it's infrastructure."

[GESTURE TO DIAGRAM]

"Bittensor subnet. Miners compete to scan prompts. Validators verify the results. The best scanners earn TAO. Decentralized security that gets better the more people use it."

"Scan reports stored on IPFS through Protocol Labs. Immutable. Timestamped. Nobody can tamper with the results."

"Trust scores registered on Solana. Trust badges minted as compressed NFTs through Metaplex. You can verify a prompt's safety on-chain before you ever paste it."

"Detailed reports gated through Lit Protocol. Free grade, paid deep-dive. The business model builds itself."

[CLICK TO FINAL SLIDE]

[SLIDE 5: "Scan. Score. Trust."]

[LOOK AT THE AUDIENCE.]

"260,000 prompts on one platform alone. Millions across the ecosystem. Zero security scanning."

"We built the scanner. We graded the prompts. And we're building the network to make it trustless."

"Scan. Score. Trust. That's Graded."

[HOLD FOR A BEAT. THEN:]

"We're RJ and [TEAM], and we're happy to take questions."

---

## STAGE NOTES

- **Energy:** Confident but not salesy. You built something real and you're showing it. Builder energy, not pitch-deck energy.
- **Terminal demo:** Practice the scan 3 times before presenting. Know the exact output. If something lags, narrate what's happening while it loads.
- **Hands moment:** Commit to the silence after asking "who checked if it was safe." The longer the pause, the harder the point lands.
- **Time check:** The demo section (1:00-2:00) is the most flexible. If you're running long, cut the narration on individual findings. The grade reveal is the money shot.
- **Closing:** "Scan. Score. Trust." is the anchor. Say it once at the end. Don't repeat it throughout. Let it land once, hard.
- **If demo fails:** Have a screenshot/recording ready as backup. "I ran this 10 minutes ago, here's what it looks like." Never apologize for tech issues. Just show the result.
