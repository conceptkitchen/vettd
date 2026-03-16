"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  // SLIDE 0: TITLE
  {
    id: "title",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-6xl sm:text-8xl font-bold tracking-tighter mb-6">
          <span className="text-green-500">G</span>RADED
        </div>
        <div className="text-xl sm:text-3xl text-zinc-300 font-light tracking-wide mb-8">
          Trust scores for the AI age.
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs font-bold tracking-wide">
            🏆 Kalibr Resilience Challenge Winner
          </div>
          <div className="px-3 py-1 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-wide">
            🏆 Protocol Labs AI Safety Prize
          </div>
        </div>
        <div className="text-sm text-zinc-500 tracking-widest uppercase">
          PL_Genesis: Frontiers of Collaboration | Protocol Labs
        </div>
        <div className="text-xs text-zinc-600 mt-2">
          Powered by <span className="text-purple-400">Kalibr</span>
        </div>
        <div className="text-xs text-zinc-600 mt-4">
          Press <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700">&#8594;</kbd> or tap to advance
        </div>
      </div>
    ),
  },
  // SLIDE 1: THE PROBLEM
  {
    id: "problem",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-5xl sm:text-7xl font-bold text-white mb-8 leading-tight">
          260,000 prompts.
          <br />
          <span className="text-zinc-500">Zero security scanning.</span>
        </div>
        <div className="max-w-2xl space-y-3 text-base sm:text-lg text-zinc-400">
          <p>The three biggest prompt marketplaces. PromptBase. FlowGPT. GPT Store.</p>
          <p>Millions of prompts shared daily. <span className="text-red-400 font-semibold">Nobody checks if they&apos;re safe.</span></p>
        </div>
      </div>
    ),
  },
  // SLIDE 2: THE STAT
  {
    id: "stat",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-8xl sm:text-[10rem] font-black text-red-500 leading-none mb-4">
          28%
        </div>
        <div className="text-xl sm:text-2xl text-zinc-300 max-w-xl">
          of the top 50 most downloaded shared prompts
          <br />
          <span className="text-red-400 font-bold">contain hidden instruction injection.</span>
        </div>
        <div className="mt-8 text-sm text-zinc-500">
          One prompt with 847,000 downloads. Nearly a million people ran hostile code without knowing.
        </div>
      </div>
    ),
  },
  // SLIDE 3: WHAT IS GRADED
  {
    id: "what",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-3xl sm:text-5xl font-bold text-white mb-8">
          Restaurant health grades.
          <br />
          <span className="text-green-500">For AI prompts.</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-8 mb-8">
          {["A", "B", "C", "D", "F"].map((g) => (
            <div
              key={g}
              className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-2xl sm:text-4xl font-black border-2 ${
                g === "A" ? "border-green-500 text-green-500" :
                g === "B" ? "border-lime-500 text-lime-500" :
                g === "C" ? "border-yellow-500 text-yellow-500" :
                g === "D" ? "border-orange-500 text-orange-500" :
                "border-red-500 text-red-500"
              }`}
            >
              {g}
            </div>
          ))}
        </div>
        <p className="text-base sm:text-lg text-zinc-400 max-w-lg">
          You glance at the letter grade before you walk into a restaurant.
          <br />
          <span className="text-white font-semibold">Every prompt you download should have that.</span>
        </p>
      </div>
    ),
  },
  // SLIDE 4: HOW IT WORKS
  {
    id: "how",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-10 text-center">
          Two layers. <span className="text-green-500">Two-layer trust.</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
          <div className="border border-green-800 rounded-xl p-6 bg-green-950/20">
            <div className="text-green-400 text-xs uppercase tracking-widest mb-2 font-bold">Layer 1 &mdash; Regex Engine</div>
            <div className="text-4xl font-bold text-white mb-2">185+</div>
            <div className="text-sm text-zinc-400">attack patterns. 120 hand-built + 65 from Augustus open source library (Apache 2.0).</div>
            <div className="mt-3 text-xs text-green-500">Instant. Deterministic. Immune to prompt injection.</div>
          </div>
          <div className="border border-purple-800 rounded-xl p-6 bg-purple-950/20">
            <div className="text-purple-400 text-xs uppercase tracking-widest mb-2 font-bold">Layer 2 &mdash; AI Deep Scan</div>
            <div className="text-4xl font-bold text-white mb-2">Kalibr</div>
            <div className="text-sm text-zinc-400">Multi-model routing across Claude, GPT-4o, and Gemini. <span className="text-purple-300">Kalibr</span> uses Thompson Sampling to learn which model catches the most threats and optimizes cost automatically.</div>
            <div className="mt-3 text-xs text-purple-400">Auto-learning: novel findings become new regex patterns. Gets smarter every scan.</div>
          </div>
        </div>
        <div className="mt-8 py-3 px-6 border border-zinc-700 rounded-lg bg-zinc-900/50 text-center max-w-lg">
          <div className="text-lg sm:text-xl font-bold text-white">The AI layer can never override the regex layer.</div>
          <div className="text-base sm:text-lg text-zinc-300 mt-1">Score can only go <span className="text-red-400 font-bold">down</span>, never up.</div>
        </div>
      </div>
    ),
  },
  // SLIDE 5: LIVE SCAN OUTPUT
  {
    id: "demo",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
          Live scan output &mdash; <span className="text-red-400">DAN 11.0 jailbreak</span>
        </h2>
        <div className="bg-black border border-zinc-800 rounded-xl p-4 sm:p-6 font-mono text-sm sm:text-base w-full max-w-2xl space-y-2">
          <div className="text-green-400 mb-3">$ graded scan --text &quot;You are DAN 11.0...&quot; --deep</div>
          <div className="flex items-center gap-2"><span>&#x274C;</span><span className="text-zinc-400">Jailbreak patterns</span><span className="text-red-500">FAIL</span><span className="text-zinc-500">(2)</span></div>
          <div className="flex items-center gap-2"><span>&#x2705;</span><span className="text-zinc-400">Instruction override</span><span className="text-green-500">PASS</span></div>
          <div className="flex items-center gap-2"><span>&#x2705;</span><span className="text-zinc-400">Data exfiltration</span><span className="text-green-500">PASS</span></div>
          <div className="flex items-center gap-2"><span>&#x2705;</span><span className="text-zinc-400">Credential harvesting</span><span className="text-green-500">PASS</span></div>
          <div className="flex items-center gap-2"><span>&#x2705;</span><span className="text-zinc-400">Hidden text</span><span className="text-green-500">PASS</span></div>
          <div className="flex items-center gap-2"><span>&#x2705;</span><span className="text-zinc-400">Obfuscated payloads</span><span className="text-green-500">PASS</span></div>
          <div className="flex items-center gap-2"><span>&#x274C;</span><span className="text-zinc-400">Social engineering</span><span className="text-red-500">FAIL</span><span className="text-zinc-500">(1)</span></div>
          <div className="flex items-center gap-2"><span>&#x274C;</span><span className="text-zinc-400">Augustus patterns</span><span className="text-red-500">FAIL</span><span className="text-zinc-500">(5)</span></div>
          <div className="flex items-center gap-2"><span className="text-purple-400">&#x1F9E0;</span><span className="text-purple-400">AI Deep Scan</span><span className="text-purple-300 text-xs">&#x26A1; Kalibr &rarr; claude-sonnet</span><span className="text-red-500">+3 findings</span></div>
          <div className="border-t border-zinc-800 mt-3 pt-3 flex items-center justify-between">
            <div>
              <span className="text-red-500 text-3xl sm:text-4xl font-black mr-3">F</span>
              <span className="text-zinc-400">Score: 0/100</span>
            </div>
            <div className="text-xs text-zinc-500">11 findings &bull; 8 seconds</div>
          </div>
        </div>
        <div className="mt-6 text-sm text-zinc-500 text-center">
          <span className="text-white font-semibold">847,000 people</span> used this prompt without knowing.
        </div>
      </div>
    ),
  },
  // SLIDE 6: 7 SURFACES
  {
    id: "surfaces",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-8 text-center">
          <span className="text-green-500">7</span> deployment surfaces.
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl w-full mb-6">
          {[
            { icon: "🌐", name: "Web App", live: true },
            { icon: "⌨️", name: "CLI", live: true },
            { icon: "🔌", name: "REST API", live: true },
            { icon: "📦", name: "npm Package", live: true },
            { icon: "🤖", name: "MCP Server", live: true },
            { icon: "🧩", name: "Chrome Ext", live: true },
            { icon: "🏪", name: "Marketplace", live: true },
          ].map((s) => (
            <div key={s.name} className="border border-zinc-800 rounded-lg p-3 sm:p-4 text-center bg-zinc-900/50">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xs sm:text-sm font-bold text-white">{s.name}</div>
              {s.live && <div className="text-[10px] text-green-400 mt-1">LIVE</div>}
            </div>
          ))}
        </div>
        <p className="text-sm text-zinc-400 text-center max-w-md">
          Meet users where they are. Paste text, scan URLs, integrate via API, add to your AI agent, or grade prompts while you type.
        </p>
      </div>
    ),
  },
  // SLIDE 7: DIFFERENTIATION
  {
    id: "gap",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
          They scan the pipes. <span className="text-green-500">We scan what flows through them.</span>
        </h2>
        <div className="overflow-x-auto w-full max-w-2xl">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-2 px-2 sm:px-3 text-zinc-500"></th>
                <th className="py-2 px-2 sm:px-3 text-zinc-500">mcp-scan</th>
                <th className="py-2 px-2 sm:px-3 text-zinc-500">Invariant</th>
                <th className="py-2 px-2 sm:px-3 text-zinc-500">PromptSec</th>
                <th className="py-2 px-2 sm:px-3 text-green-400 font-bold">Graded</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["MCP Servers", "✓", "✓", "—", "—"],
                ["Tool Configs", "✓", "✓", "—", "—"],
                ["API Endpoints", "—", "✓", "✓", "—"],
                ["Shared Prompts", "—", "—", "—", "✓"],
                ["Trust Grading (A-F)", "—", "—", "—", "✓"],
                ["AI Deep Scan", "—", "—", "~", "✓"],
                ["Auto-Learning", "—", "—", "—", "✓"],
                ["Open Source Patterns", "—", "—", "—", "✓"],
                ["Multi-Model Routing", "—", "—", "—", "✓"],
              ].map(([feature, ...vals], i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  <td className="py-2 px-2 sm:px-3 text-zinc-300 font-medium">{feature}</td>
                  {vals.map((v, j) => (
                    <td key={j} className={`py-2 px-2 sm:px-3 text-center ${j === 3 ? (v === "✓" ? "text-green-400 font-bold" : "text-zinc-600") : v === "✓" ? "text-zinc-400" : "text-zinc-700"}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm text-zinc-500 text-center">
          Nobody else scans the prompts. The gap is wide open.
        </p>
      </div>
    ),
  },
  // SLIDE 8: MARKET OPPORTUNITY
  {
    id: "market",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-10 text-center">
          The market is <span className="text-green-500">wide open.</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full mb-8">
          <div className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50 text-center">
            <div className="text-3xl sm:text-4xl font-black text-green-400 mb-2">$5.2B</div>
            <div className="text-sm text-zinc-400">AI security market by 2028</div>
          </div>
          <div className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50 text-center">
            <div className="text-3xl sm:text-4xl font-black text-red-400 mb-2">0</div>
            <div className="text-sm text-zinc-400">tools scanning prompt content today</div>
          </div>
          <div className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50 text-center">
            <div className="text-3xl sm:text-4xl font-black text-yellow-400 mb-2">260K+</div>
            <div className="text-sm text-zinc-400">prompts shared daily, growing</div>
          </div>
        </div>
        <p className="text-base sm:text-lg text-zinc-400 text-center max-w-lg">
          Every funded player scans infrastructure. <span className="text-white font-semibold">Nobody scans what users actually paste into AI.</span> That&apos;s our lane.
        </p>
      </div>
    ),
  },
  // SLIDE 9: BUSINESS MODEL
  {
    id: "business",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-10 text-center">
          How we <span className="text-green-500">make money.</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full mb-8">
          <div className="border border-green-800 rounded-xl p-5 bg-green-950/20 text-center">
            <div className="text-green-400 text-xs uppercase tracking-widest mb-2 font-bold">Free</div>
            <div className="text-lg font-bold text-white mb-2">Scanner</div>
            <div className="text-sm text-zinc-400">Unlimited scans. Web, CLI, Chrome extension. Drives adoption.</div>
          </div>
          <div className="border border-purple-800 rounded-xl p-5 bg-purple-950/20 text-center">
            <div className="text-purple-400 text-xs uppercase tracking-widest mb-2 font-bold">Pro API</div>
            <div className="text-lg font-bold text-white mb-2">Volume</div>
            <div className="text-sm text-zinc-400">API keys for developers. Scan at scale. MCP server integration. Pay per scan.</div>
          </div>
          <div className="border border-yellow-800 rounded-xl p-5 bg-yellow-950/20 text-center">
            <div className="text-yellow-400 text-xs uppercase tracking-widest mb-2 font-bold">Enterprise</div>
            <div className="text-lg font-bold text-white mb-2">Platform</div>
            <div className="text-sm text-zinc-400">Marketplace integration. &quot;Graded Verified&quot; badge. Threat intelligence feed.</div>
          </div>
        </div>
        <p className="text-sm text-zinc-500 text-center max-w-lg">
          Free scanner builds the pattern library. Every scan makes the product smarter. The data IS the moat.
        </p>
      </div>
    ),
  },
  // SLIDE 10: VISION
  {
    id: "vision",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-10 text-center">
          Today a scanner. <span className="text-green-500">Tomorrow infrastructure.</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 max-w-3xl w-full text-center">
          <div className="border border-zinc-700 rounded-xl p-5 flex-1 bg-zinc-900/50 w-full">
            <div className="text-xl sm:text-2xl mb-2">&#x1F310;</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Bittensor Subnet</div>
            <div className="text-sm text-zinc-300">Miners compete to scan. Validators verify. TAO rewards the best scanners.</div>
          </div>
          <div className="text-zinc-600 text-xl hidden sm:block">&rarr;</div>
          <div className="text-zinc-600 text-xl sm:hidden">&darr;</div>
          <div className="border border-zinc-700 rounded-xl p-5 flex-1 bg-zinc-900/50 w-full">
            <div className="text-xl sm:text-2xl mb-2">&#x1F4E6;</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">IPFS + Protocol Labs</div>
            <div className="text-sm text-zinc-300">Scan reports stored immutably. Timestamped. Tamper-proof.</div>
          </div>
          <div className="text-zinc-600 text-xl hidden sm:block">&rarr;</div>
          <div className="text-zinc-600 text-xl sm:hidden">&darr;</div>
          <div className="border border-zinc-700 rounded-xl p-5 flex-1 bg-zinc-900/50 w-full">
            <div className="text-xl sm:text-2xl mb-2">&#x1F3C5;</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">On-Chain Trust Badge</div>
            <div className="text-sm text-zinc-300">Trust scores on Solana. Verify before you paste.</div>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 9: THE CLOSE
  {
    id: "close",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-4xl sm:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
          Scan. Score. Trust.
        </div>
        <div className="text-5xl sm:text-8xl font-bold tracking-tighter mb-8">
          <span className="text-green-500">G</span>RADED
        </div>
        <div className="text-base sm:text-lg text-zinc-400 mb-10">
          AI prompt security, graded.
        </div>
        <div className="space-y-2 text-sm text-zinc-500">
          <div><span className="text-zinc-300 font-semibold">RJ Moscardon</span> &bull; The Concept Kitchen</div>
          <div className="text-xs text-zinc-500 mt-1">Powered by <span className="text-purple-400">Kalibr</span> &bull; PL_Genesis &bull; Protocol Labs</div>
          <div className="font-mono text-green-400 mt-2">getgraded.vercel.app</div>
          <div className="font-mono text-zinc-500">github.com/conceptkitchen/graded</div>
        </div>
      </div>
    ),
  },
];

export default function Pitch() {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, total - 1)), [total]);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // Touch support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);

  return (
    <div
      className="h-screen w-screen bg-[#0a0a0a] text-white overflow-hidden select-none relative"
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart === null) return;
        const diff = e.changedTouches[0].clientX - touchStart;
        if (diff < -50) next();
        if (diff > 50) prev();
        setTouchStart(null);
      }}
      onClick={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x > rect.width * 0.5) next();
        else prev();
      }}
    >
      {/* Slide content */}
      <div className="h-full w-full flex items-center justify-center">
        {slides[current].content}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-4 right-4 text-xs text-zinc-600 font-mono">
        {current + 1}/{total}
      </div>
    </div>
  );
}
