"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  // SLIDE 1: HOOK — The scare
  {
    id: "hook",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-lg sm:text-xl text-zinc-400 uppercase tracking-widest mb-6">
          OWASP 2025
        </div>
        <div className="text-4xl sm:text-6xl font-black text-red-500 leading-tight mb-6 max-w-2xl">
          Prompt injection is the #1 AI vulnerability.
        </div>
        <div className="text-xl sm:text-2xl text-zinc-300 max-w-xl">
          35% of real-world AI incidents. $100K+ losses.
          <br />
          <span className="text-red-400 font-bold">From a single prompt.</span>
        </div>
        <div className="mt-8 text-base sm:text-lg text-zinc-500">
          Nobody&apos;s scanning.
        </div>
      </div>
    ),
  },
  // SLIDE 2: PROBLEM — The scale
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
  // SLIDE 3: SOLUTION — The concept
  {
    id: "solution",
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
          <span className="text-white font-semibold">Every prompt should earn one too.</span>
        </p>
      </div>
    ),
  },
  // SLIDE 4: WHY NOW — The timing
  {
    id: "whynow",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-10 text-center">
          Why <span className="text-green-500">now?</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full mb-8">
          <div className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50 text-center">
            <div className="text-3xl sm:text-4xl font-black text-green-400 mb-2">10x</div>
            <div className="text-sm text-zinc-400">MCP adoption in 6 months. AI agents are everywhere.</div>
          </div>
          <div className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50 text-center">
            <div className="text-3xl sm:text-4xl font-black text-red-400 mb-2">0</div>
            <div className="text-sm text-zinc-400">tools scanning what agents actually consume.</div>
          </div>
          <div className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50 text-center">
            <div className="text-3xl sm:text-4xl font-black text-yellow-400 mb-2">&infin;</div>
            <div className="text-sm text-zinc-400">Agents downloading prompts autonomously. No human review.</div>
          </div>
        </div>
        <p className="text-base sm:text-lg text-zinc-400 text-center max-w-lg">
          The attack surface just went from <span className="text-white font-semibold">&quot;person pastes text&quot;</span> to <span className="text-red-400 font-semibold">&quot;agents chain-download code without looking.&quot;</span>
        </p>
      </div>
    ),
  },
  // SLIDE 5: PRODUCT — Two layers + proof (merged)
  {
    id: "product",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
          Two layers of trust. <span className="text-zinc-500">Score can only go <span className="text-red-400">down</span>, never up.</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 max-w-2xl w-full mb-4">
          <div className="border border-green-800 rounded-xl p-3 bg-green-950/20">
            <div className="text-green-400 text-[10px] uppercase tracking-widest mb-1 font-bold">Layer 1 &mdash; Regex</div>
            <div className="text-2xl font-bold text-white">185+</div>
            <div className="text-xs text-zinc-400">patterns. Instant. Deterministic.</div>
          </div>
          <div className="border border-purple-800 rounded-xl p-3 bg-purple-950/20">
            <div className="text-purple-400 text-[10px] uppercase tracking-widest mb-1 font-bold">Layer 2 &mdash; Kalibr AI</div>
            <div className="text-2xl font-bold text-white">Multi-model</div>
            <div className="text-xs text-zinc-400">Claude, GPT-4o, Gemini. Auto-learns.</div>
          </div>
        </div>
        <div className="bg-black border border-zinc-800 rounded-xl p-3 sm:p-4 font-mono text-sm sm:text-base w-full max-w-2xl space-y-1.5">
          <div className="text-green-400 mb-2 text-xs sm:text-sm">$ graded scan --text &quot;You are DAN 11.0...&quot; --deep</div>
          <div className="flex items-center gap-2 text-xs sm:text-sm"><span>&#x274C;</span><span className="text-zinc-400">Jailbreak</span><span className="text-red-500">FAIL (2)</span></div>
          <div className="flex items-center gap-2 text-xs sm:text-sm"><span>&#x274C;</span><span className="text-zinc-400">Social engineering</span><span className="text-red-500">FAIL (1)</span></div>
          <div className="flex items-center gap-2 text-xs sm:text-sm"><span>&#x274C;</span><span className="text-zinc-400">Augustus patterns</span><span className="text-red-500">FAIL (5)</span></div>
          <div className="flex items-center gap-2 text-xs sm:text-sm"><span className="text-purple-400">&#x1F9E0;</span><span className="text-purple-400">AI Deep Scan</span><span className="text-red-500">+3 findings</span></div>
          <div className="border-t border-zinc-800 mt-2 pt-2 flex items-center justify-between">
            <div>
              <span className="text-red-500 text-3xl sm:text-4xl font-black mr-3">F</span>
              <span className="text-zinc-400 text-sm">0/100</span>
            </div>
            <div className="text-xs text-zinc-500">11 findings &bull; 8 seconds</div>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 6: MOAT — Gap table
  {
    id: "moat",
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
          Nobody else scans the prompts. <span className="text-white font-semibold">Nobody owns this lane.</span>
        </p>
      </div>
    ),
  },
  // SLIDE 7: TRACTION — Velocity as credibility
  {
    id: "traction",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-10 text-center">
          Built in <span className="text-green-500">48 hours.</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl w-full mb-8">
          <div className="border border-zinc-700 rounded-xl p-4 bg-zinc-900/50 text-center">
            <div className="text-3xl font-black text-green-400 mb-1">7</div>
            <div className="text-xs text-zinc-400">Live surfaces</div>
            <div className="text-[10px] text-zinc-600 mt-1">Web, CLI, API, npm, MCP, Chrome, Marketplace</div>
          </div>
          <div className="border border-zinc-700 rounded-xl p-4 bg-zinc-900/50 text-center">
            <div className="text-3xl font-black text-yellow-400 mb-1">2</div>
            <div className="text-xs text-zinc-400">Hackathon prizes</div>
            <div className="text-[10px] text-zinc-600 mt-1">Kalibr + Protocol Labs</div>
          </div>
          <div className="border border-zinc-700 rounded-xl p-4 bg-zinc-900/50 text-center">
            <div className="text-3xl font-black text-purple-400 mb-1">185+</div>
            <div className="text-xs text-zinc-400">Attack patterns</div>
            <div className="text-[10px] text-zinc-600 mt-1">120 hand-built + Augustus</div>
          </div>
          <div className="border border-zinc-700 rounded-xl p-4 bg-zinc-900/50 text-center">
            <div className="text-3xl font-black text-blue-400 mb-1">OSS</div>
            <div className="text-xs text-zinc-400">Open source</div>
            <div className="text-[10px] text-zinc-600 mt-1">Pattern library on GitHub</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs font-bold tracking-wide">
            🏆 Kalibr Resilience Challenge Winner
          </div>
          <div className="px-3 py-1 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-wide">
            🏆 Protocol Labs AI Safety Prize
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 8: BUSINESS MODEL — Three revenue layers
  {
    id: "business",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-10 text-center">
          Three <span className="text-green-500">revenue layers.</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full mb-8">
          <div className="border border-purple-800 rounded-xl p-5 bg-purple-950/20 text-center">
            <div className="text-purple-400 text-xs uppercase tracking-widest mb-2 font-bold">Pro API</div>
            <div className="text-lg font-bold text-white mb-2">Pay per scan</div>
            <div className="text-sm text-zinc-400">API keys for developers. Scan at scale. MCP server integration.</div>
          </div>
          <div className="border border-green-800 rounded-xl p-5 bg-green-950/20 text-center">
            <div className="text-green-400 text-xs uppercase tracking-widest mb-2 font-bold">Free Scanner</div>
            <div className="text-lg font-bold text-white mb-2">Growth engine</div>
            <div className="text-sm text-zinc-400">Web, CLI, Chrome extension. Every scan grows the pattern library.</div>
          </div>
          <div className="border border-yellow-800 rounded-xl p-5 bg-yellow-950/20 text-center">
            <div className="text-yellow-400 text-xs uppercase tracking-widest mb-2 font-bold">Enterprise</div>
            <div className="text-lg font-bold text-white mb-2">&quot;Graded Verified&quot;</div>
            <div className="text-sm text-zinc-400">Marketplace integration. Trust badges. Threat intelligence feed.</div>
          </div>
        </div>
        <p className="text-sm text-zinc-500 text-center max-w-lg">
          Every scan makes the product smarter. <span className="text-white font-semibold">The data is the moat.</span>
        </p>
      </div>
    ),
  },
  // SLIDE 9: TEAM + ASK
  {
    id: "team",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-3xl sm:text-5xl font-bold text-white mb-6">
          RJ Moscardon
        </div>
        <div className="text-lg sm:text-xl text-zinc-400 mb-8">
          Solo founder. <span className="text-green-500">The Concept Kitchen.</span>
        </div>
        <div className="max-w-lg space-y-3 text-base text-zinc-400 mb-10">
          <p>Built Graded in 48 hours. Deployed to 7 surfaces. Won 2 prizes.</p>
          <p>Also building <span className="text-white font-semibold">Pet Zen</span> &mdash; AI-powered pet care updates. Active pilot in SF.</p>
        </div>
        <div className="border border-green-800 rounded-xl p-6 bg-green-950/20 max-w-md w-full">
          <div className="text-green-400 text-xs uppercase tracking-widest mb-3 font-bold">Looking for</div>
          <div className="space-y-2 text-base text-white">
            <p>Design partners &amp; early adopters</p>
            <p>Marketplace integrations</p>
            <p>Pre-seed conversations</p>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 10: CLOSE
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

      {/* Live Demo link */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-3 left-4 text-xs font-mono text-green-500 hover:text-green-400 transition-colors px-2 py-1 border border-green-800 rounded hover:border-green-600"
      >
        🔴 Live Demo
      </a>

      {/* Slide counter */}
      <div className="absolute bottom-4 right-4 text-xs text-zinc-600 font-mono">
        {current + 1}/{total}
      </div>
    </div>
  );
}
