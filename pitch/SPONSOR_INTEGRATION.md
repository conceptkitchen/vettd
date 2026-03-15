# Graded -- Sponsor Integration Map

**How each hackathon sponsor's technology fits into Graded. This isn't name-dropping. Every integration is real and specific.**

---

## Protocol Labs -- IPFS for Immutable Scan Reports

**What they do:** Protocol Labs builds IPFS, a decentralized file storage network where content is addressed by hash, making files immutable and permanently verifiable.

**How Graded uses it:** Every scan report gets pinned to IPFS with a content hash. When Graded grades a prompt, that report exists permanently. Nobody can alter it after the fact. The prompt author can't claim "that finding was wrong" because the original scan is immutable and timestamped.

**Why it matters:** Trust requires receipts. If a prompt gets graded B today and something changes, the historical record is on IPFS. Auditable. Permanent. No central server to tamper with.

---

## Bittensor -- Subnet for Decentralized Scanning

**What they do:** Bittensor is a decentralized AI network where miners compete to perform tasks and validators verify quality. Best performers earn TAO tokens.

**How Graded uses it:** A dedicated Graded subnet where miners run independent prompt scans. Multiple miners analyze the same prompt. Validators compare results for consensus. Accurate scanners earn more TAO. Bad scanners get penalized. The network gets smarter over time because there's money on the line.

**Why it matters:** Centralized scanning doesn't scale to millions of prompts, and it introduces a single point of trust. The subnet means scanning is distributed, competitive, and self-improving. No single entity controls the grades. The network does.

---

## Solana -- On-Chain Trust Score Registry

**What they do:** Solana is a high-throughput blockchain with sub-second finality and negligible transaction costs.

**How Graded uses it:** Trust grades (A through F) are registered on Solana as on-chain data. Each prompt gets a unique identifier linked to its trust score. Marketplaces, browser extensions, and integrations can query the chain for a prompt's grade without trusting Graded's API.

**Why it matters:** The trust score can't live in our database. If we control the grades, we're just another gatekeeper. Putting scores on-chain makes them verifiable by anyone. A browser extension checks Solana directly. No middleman. No trust required.

---

## Metaplex -- Trust Badge as Compressed NFT

**What they do:** Metaplex provides the standard for NFTs on Solana, including compressed NFTs (cNFTs) that can be minted at massive scale for fractions of a cent each.

**How Graded uses it:** When a prompt earns a trust grade, a compressed NFT trust badge is minted. Prompt authors can display this badge on their listing. It's verifiable on-chain. "This prompt was scanned by the Graded network and graded A." Think verified checkmarks, but for prompt safety.

**Why it matters:** Badges create a visible trust layer on prompt marketplaces. An author who submits their prompts for scanning and earns an A gets a badge that builds reputation. It's the health grade in the restaurant window, but digital and on-chain.

---

## Lit Protocol -- Access-Gated Detailed Reports

**What they do:** Lit Protocol enables token-gated and condition-gated access to content. You can encrypt data and set decryption conditions (hold a token, meet a condition, pay a fee).

**How Graded uses it:** The trust grade (A through F) is free and public. The full scan report, every finding, every risk detail, remediation suggestions, is gated behind Lit Protocol. Users who need the deep-dive pay for access or hold the right token. The grade gives you the signal. The gated report gives you the intelligence.

**Why it matters:** This is the business model. Free grades drive adoption. Gated reports drive revenue. Lit Protocol handles the access control without Graded running a paywall server. Decentralized access for decentralized scanning.

---

## ElevenLabs -- Voice Narration of Scan Results (Stretch Goal)

**What they do:** ElevenLabs provides AI voice synthesis with natural-sounding text-to-speech in multiple voices and languages.

**How Graded uses it:** Accessibility play. Scan results narrated as audio. "This prompt received a grade of C. Two warnings were detected: role override attempt and potential data exfiltration. We recommend reviewing the flagged sections before use." Useful for visually impaired users, for voice-first workflows, or for integration into podcasts and content about prompt safety.

**Why it matters:** Makes scan results consumable beyond the terminal. Not everyone reads security reports. Voice narration makes the output accessible and shareable. It's a stretch feature, but it shows the platform thinking beyond CLI-only.

---

## VESSL.AI -- Scale Scanning Compute (Stretch Goal)

**What they do:** VESSL.AI provides infrastructure for running and scaling AI workloads, including model serving and batch processing.

**How Graded uses it:** Batch scanning at scale. When Graded crawls an entire marketplace (260,000 prompts on PromptBase, millions on FlowGPT), the compute needs to scale horizontally. VESSL.AI handles the infrastructure for running thousands of concurrent Claude-powered scans without managing the infra ourselves.

**Why it matters:** The vision requires scanning entire marketplaces, not just individual prompts. That's a compute scaling problem. VESSL.AI handles the burst capacity so the scanning network can process marketplace-scale volumes.

---

## INTEGRATION SUMMARY (for pitch reference)

| Sponsor | Role in Graded | One-liner |
|---------|--------------|-----------|
| Protocol Labs | Report storage | Scan reports on IPFS. Immutable receipts. |
| Bittensor | Scanning network | Miners scan, validators verify, TAO rewards accuracy. |
| Solana | Trust registry | On-chain grades. Verifiable by anyone. |
| Metaplex | Trust badges | Compressed NFT badges for scanned prompts. |
| Lit Protocol | Access control | Free grade, gated deep-dive report. |
| ElevenLabs | Voice output | Audio narration of scan results. |
| VESSL.AI | Compute scaling | Infrastructure for marketplace-scale scanning. |

---

## JUDGE NOTE

If a judge asks "how does [sponsor] fit in?" -- don't reach. ElevenLabs and VESSL.AI are stretch goals and labeled as such. The core five (Protocol Labs, Bittensor, Solana, Metaplex, Lit Protocol) are structural to the architecture. They're not bolted on. They're the reason it works as a decentralized system instead of just another API.
