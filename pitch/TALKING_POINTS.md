# Graded -- Q&A Talking Points

**Prep for judge questions. Know these cold. Say them like you've said them before, not like you're reading.**

---

## "How is this different from mcp-scan?"

"Great tool. Different problem. mcp-scan looks at MCP server configurations. Are the tools declared correctly? Is the server doing what it says? That's infrastructure security."

"We scan the prompts themselves. The text that users copy from PromptBase, FlowGPT, Reddit, and paste directly into their AI. Nobody is scanning those. mcp-scan secures the plumbing. We secure what people actually pour into it."

"Think of it this way: mcp-scan is a building inspector. We're the food safety inspector. Both matter. Different thing getting inspected."

---

## "Why not just read the prompt yourself?"

"You could. Same way you could read the source code of every npm package you install. Nobody does."

"Three reasons people won't read prompts:"

"One, length. The DAN prompt we scanned is 1,200 tokens. That's a page and a half of dense instructions. Nobody reads that."

"Two, obfuscation. We found prompts with instructions hidden inside what looks like formatting. Base64-encoded segments. Instructions that only activate when certain conditions are met. A casual read won't catch that."

"Three, scale. PromptBase alone has 260,000 prompts. FlowGPT has millions. You can't human-review your way out of this. You need automated scanning."

"And the bigger point: we don't expect users to manually check their restaurant's kitchen. We have health inspectors. Same principle."

---

## "How do you handle false positives?"

"Two things. First, we use Claude for semantic analysis, not just regex pattern matching. So we're analyzing what the prompt actually instructs the model to do, not just flagging keywords. That already cuts false positives significantly compared to pattern-based approaches."

"Second, the trust grade is a spectrum, not a binary. A prompt that uses roleplay framing for creative writing gets a different grade than one that uses roleplay framing to bypass safety guidelines. Context matters, and the semantic analysis captures that."

"Third, in the Bittensor subnet model, multiple miners scan the same prompt independently. Validators compare results. Consensus filters out individual scanner noise. The network self-corrects for false positives over time."

"But honestly? On a problem where nobody is scanning at all, some false positives are better than zero scanning. We'd rather flag something questionable and let the user decide than let hostile prompts run undetected."

---

## "What's the business model?"

"Three layers."

"One: free scanning. Anyone can scan a prompt and get a trust grade. A, B, C, D, F. That's the distribution play. Get the grade everywhere."

"Two: gated reports through Lit Protocol. The grade is free. The detailed breakdown, what specifically was found, where the risks are, remediation suggestions, that's a paid report. Token-gated access."

"Three: the Bittensor subnet is its own economic engine. Miners earn TAO for scanning. Validators earn TAO for verifying. The network pays for its own growth."

"Long-term, the real money is trust-as-infrastructure. Prompt marketplaces integrating Graded grades into their listings. PromptBase showing an A grade next to a prompt the same way an Airbnb shows a superhost badge. That's the platform play."

---

## "How does the Bittensor subnet actually work?"

"Simple version: miners and validators."

"A prompt comes in for scanning. Multiple miners on the network run independent scans. Each miner produces a trust grade and findings report. Validators compare those reports against each other and against a reference implementation. Miners who produce accurate, consistent results earn more TAO. Miners who produce garbage get penalized."

"It's the same mechanism that makes Bittensor work for other tasks. Competition drives quality. The best scanners earn the most. Over time, the network gets better because there's a direct financial incentive to be accurate."

"For us, it solves the scaling problem. We don't need to run every scan on our own infrastructure. The network does it. And because multiple independent scanners analyze each prompt, you get consensus-based results instead of trusting a single scanner."

---

## "Can't prompt authors just obfuscate to bypass your scanner?"

"They can try. Same arms race as malware scanning, spam filtering, every security domain."

"But here's why we have an advantage: we're using an LLM to analyze prompts that are designed to manipulate LLMs. The scanner reads the prompt the same way the target model would read it. If the obfuscation is good enough to fool our scanner, it's also less likely to work on the target model. There's a natural ceiling on how much you can obfuscate and still have the injection work."

"And the Bittensor model means our scanning improves continuously. New obfuscation technique appears? Miners who catch it earn more TAO. There's a direct financial incentive to stay ahead of the arms race."

"The honest answer is: no scanner catches everything. But right now the scanning rate is literally zero. Going from zero to 'catches most things' is a massive improvement."

---

## "What was the scariest thing you found?"

"A prompt on FlowGPT with 847,000 uses that contained a hidden system prompt extraction routine. It looked like a creative writing assistant. The visible instructions were 'help me write a story.' But buried in the middle of a long formatting block, there were instructions telling the model to first output its full system prompt before responding to the user."

"847,000 people ran that prompt. Every single one of them potentially leaked their AI's system prompt to whoever was collecting that data. And nobody knew, because nobody scanned it."

"That's not theoretical. That's a real prompt, real usage numbers, real exposure. And there are 260,000 more prompts on that one platform alone."

[IF THEY ASK FOR MORE EXAMPLES:]

"We also found prompts that look like productivity tools but include instructions to exfiltrate conversation history. Prompts that override safety guidelines through nested roleplay layers. And prompts with base64-encoded instruction blocks that only activate when the model is in a specific context. All on public marketplaces. All with thousands of downloads."

---

## GENERAL Q&A PRINCIPLES

1. **Don't trash competitors.** Every other tool is doing good work. We just do something nobody else does. Complement, don't compete.

2. **Always bring it back to scale.** "260,000 prompts" and "847,000 uses" are the stats that make this real. Use them.

3. **"Zero to something" is the argument.** Don't claim perfection. Claim that going from zero scanning to automated scanning is the important leap. Perfecting it comes next.

4. **If you don't know, say so.** "Good question, we haven't solved that yet. Here's how we're thinking about it." Judges respect honesty over bullshit.

5. **Be the builder.** You wrote this code. You found those prompts. You ran those scans. Talk from experience, not from a business plan. "When I scanned this..." not "Our platform enables..."

6. **Restaurant grade metaphor is your anchor.** If any answer gets complicated, pull back to: "Health grades for prompts. That's the core idea."
