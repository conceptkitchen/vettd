"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  // SLIDE 1: HOOK — The scare
  {
    id: "hook",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-lg sm:text-xl text-zinc-400 uppercase tracking-widest mb-6">
          OWASP TOP 10 FOR AI
        </div>
        <div className="text-4xl sm:text-6xl font-black text-red-500 leading-tight mb-6 max-w-2xl">
          Prompt injection is #1. Still. Two years running.
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
        <div className="text-4xl sm:text-6xl font-bold text-white mb-8 leading-tight">
          Prompts everywhere.
          <br />
          <span className="text-zinc-500">Zero security scanning.</span>
        </div>
        <div className="max-w-2xl space-y-3 text-base sm:text-lg text-zinc-400">
          <p>260K prompts on marketplaces. Shared skills on GitHub. llms.txt files on websites. MCP tools agents download autonomously.</p>
          <p>Every one of them can contain prompt injection. <span className="text-red-400 font-semibold">Nobody checks.</span></p>
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
            <div className="text-sm text-zinc-400">tools scanning prompts, llms.txt, or shared skills before agents consume them.</div>
          </div>
          <div className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50 text-center">
            <div className="text-3xl sm:text-4xl font-black text-yellow-400 mb-2">&infin;</div>
            <div className="text-sm text-zinc-400">Websites, repos, and marketplaces agents download from. No human review.</div>
          </div>
        </div>
        <p className="text-base sm:text-lg text-zinc-400 text-center max-w-lg">
          The attack surface just went from <span className="text-white font-semibold">&quot;person pastes text&quot;</span> to <span className="text-red-400 font-semibold">&quot;agents chain-download code without looking.&quot;</span>
        </p>
      </div>
    ),
  },
  // SLIDE 5: MARKET — TAM/SAM/SOM
  {
    id: "market",
    content: (
      <div className="flex flex-col items-center justify-start h-full px-4 sm:px-6 pt-6 sm:pt-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
          The <span className="text-green-500">market.</span>
        </h2>
        <div className="flex flex-col items-center gap-3 max-w-2xl w-full mb-6">
          {/* TAM */}
          <div className="w-full border border-zinc-700 rounded-xl p-4 bg-zinc-900/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">TAM &mdash; AI Security</div>
              <div className="text-sm text-zinc-400">Every AI deployment needs prompt-level security. OWASP #1 risk, two years running.</div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-green-400 ml-4 whitespace-nowrap">$5.5B</div>
          </div>
          {/* SAM */}
          <div className="w-full border border-zinc-700 rounded-xl p-4 bg-zinc-900/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">SAM &mdash; Prompt &amp; Content Security</div>
              <div className="text-sm text-zinc-400">500K+ MCP servers. 260K marketplace prompts. 50K+ teams building AI agents.</div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-yellow-400 ml-4 whitespace-nowrap">$800M</div>
          </div>
          {/* SOM */}
          <div className="w-full border border-zinc-700 rounded-xl p-4 bg-zinc-900/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">SOM &mdash; Year 1</div>
              <div className="text-sm text-zinc-400">125 paid customers across Builder, Shield, and Verified tiers.</div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-purple-400 ml-4 whitespace-nowrap">$112K</div>
          </div>
        </div>
        <div className="border border-zinc-800 rounded-lg px-4 py-3 bg-zinc-900/20 max-w-2xl text-center">
          <div className="text-sm sm:text-base text-zinc-300 font-semibold mb-1">
            AI agent adoption is a hockey stick. AI security adoption is flat.
          </div>
          <div className="text-lg sm:text-xl text-white font-bold">
            The gap between them is the opportunity.
          </div>
          <div className="text-[10px] text-zinc-600 mt-2">
            1B+ AI API calls/day. Zero pre-execution scanning. At $0.001/scan = $365M/year addressable.
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 6: PRODUCT — Two layers + proof (merged)
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
            <div className="text-2xl font-bold text-white">212+</div>
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
      <div className="flex flex-col items-center justify-start h-full px-4 sm:px-6 pt-6 sm:pt-10">
        <h2 className="text-xl sm:text-3xl font-bold text-white mb-4 sm:mb-8 text-center">
          They scan the pipes. <span className="text-green-500">We scan what flows through them.</span>
        </h2>
        <div className="w-full max-w-2xl">
          <table className="w-full text-[11px] sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-1 sm:py-2 px-1 sm:px-3 text-zinc-500"></th>
                <th className="py-1 sm:py-2 px-1 sm:px-3 text-zinc-500">mcp-scan</th>
                <th className="py-1 sm:py-2 px-1 sm:px-3 text-zinc-500">Invariant</th>
                <th className="py-1 sm:py-2 px-1 sm:px-3 text-zinc-500">PromptSec</th>
                <th className="py-1 sm:py-2 px-1 sm:px-3 text-green-400 font-bold">Graded</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["MCP Servers", "✓", "✓", "✓", "✓"],
                ["Tool Configs", "✓", "✓", "—", "—"],
                ["API Endpoints", "—", "~", "✓", "—"],
                ["URL / llms.txt Scanning", "—", "—", "—", "✓"],
                ["Shared Prompts", "—", "—", "—", "✓"],
                ["Trust Grading (A-F)", "—", "—", "~", "✓"],
                ["Multi-Model Routing", "—", "—", "—", "✓"],
                ["AI Deep Scan", "—", "—", "~", "✓"],
                ["Auto-Learning", "—", "—", "—", "✓"],
                ["MCP Tool for Agents", "—", "—", "—", "✓"],
                ["4-Gate CaMeL SDK", "—", "—", "—", "✓"],
              ].map(([feature, ...vals], i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  <td className="py-1 sm:py-2 px-1 sm:px-3 text-zinc-300 font-medium">{feature}</td>
                  {vals.map((v, j) => (
                    <td key={j} className={`py-1 sm:py-2 px-1 sm:px-3 text-center ${j === 3 ? (v === "✓" ? "text-green-400 font-bold" : "text-zinc-600") : v === "✓" ? "text-zinc-400" : v === "~" ? "text-yellow-600" : "text-zinc-700"}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 sm:mt-6 text-xs sm:text-sm text-zinc-500 text-center">
          Security middleware for AI. <span className="text-white font-semibold">The layer between every agent and the content it consumes.</span>
        </p>
        <div className="mt-3 sm:mt-4 px-3 py-3 sm:px-4 sm:py-4 border border-green-800/50 rounded-lg bg-green-950/10 max-w-2xl">
          <div className="text-[10px] sm:text-xs text-green-400 uppercase tracking-widest mb-2 sm:mb-3 text-center font-bold">🧬 The engine gets smarter 3 ways</div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center text-[10px] sm:text-xs">
            <div>
              <div className="text-white font-bold mb-1">Base Engine</div>
              <div className="text-zinc-500">120 hand-built + 62 open source + 30 hybrid. 11 attack categories.</div>
            </div>
            <div>
              <div className="text-white font-bold mb-1">Open Source Sync</div>
              <div className="text-zinc-500">3 repos: Augustus, CyberAlb, CL4R1T4S. New research, absorbed automatically.</div>
            </div>
            <div>
              <div className="text-white font-bold mb-1">AI Deep Scan</div>
              <div className="text-zinc-500">Kalibr routes to the best model. New findings become permanent patterns.</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 8: TRACTION — Proof points
  {
    id: "traction",
    content: (
      <div className="flex flex-col items-center justify-start h-full px-4 sm:px-6 pt-6 sm:pt-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
          Already <span className="text-green-500">in production.</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 max-w-2xl w-full mb-4">
          <div className="border border-green-800 rounded-xl p-3 bg-green-950/20 text-center">
            <div className="text-3xl font-black text-green-400 mb-1">7</div>
            <div className="text-xs text-zinc-400 font-medium">Live surfaces</div>
            <div className="text-[10px] text-zinc-600 mt-1">Web, CLI, API, npm, MCP server, Chrome extension, marketplace scanner</div>
          </div>
          <div className="border border-purple-800 rounded-xl p-3 bg-purple-950/20 text-center">
            <div className="text-3xl font-black text-purple-400 mb-1">212+</div>
            <div className="text-xs text-zinc-400 font-medium">Attack patterns</div>
            <div className="text-[10px] text-zinc-600 mt-1">3 sources: hand-built + open source + AI-generated hybrid</div>
          </div>
          <div className="border border-yellow-800 rounded-xl p-3 bg-yellow-950/20 text-center">
            <div className="text-3xl font-black text-yellow-400 mb-1">4</div>
            <div className="text-xs text-zinc-400 font-medium">Gate CaMeL SDK</div>
            <div className="text-[10px] text-zinc-600 mt-1">Input &rarr; Tool &rarr; Data &rarr; Output. Full interception pipeline, live in production.</div>
          </div>
          <div className="border border-blue-800 rounded-xl p-3 bg-blue-950/20 text-center">
            <div className="text-3xl font-black text-blue-400 mb-1">6</div>
            <div className="text-xs text-zinc-400 font-medium">MCP tools</div>
            <div className="text-[10px] text-zinc-600 mt-1">Prompt, URL, batch, response, data, config. Full scan surface for any agent.</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="px-3 py-1 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-[10px] sm:text-xs font-bold tracking-wide">
            🏆 Kalibr Resilience Challenge Winner
          </div>
          <div className="px-3 py-1 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 text-[10px] sm:text-xs font-bold tracking-wide">
            🏆 Protocol Labs AI Safety Prize
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="px-3 py-1 rounded-full border border-green-500/40 bg-green-500/10 text-green-400 text-[10px] sm:text-xs font-bold tracking-wide">
            Open source on GitHub
          </div>
          <div className="px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900/50 text-zinc-400 text-[10px] sm:text-xs">
            Live in production on our own AI agent
          </div>
          <div className="px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-[10px] sm:text-xs font-bold tracking-wide">
            3 design partner conversations
          </div>
        </div>
      </div>
    ),
  },
  // SLIDE 8: BUSINESS MODEL — Four tiers
  {
    id: "business",
    content: (
      <div className="flex flex-col items-center justify-start h-full px-4 sm:px-6 pt-6 sm:pt-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
          How much do you <span className="text-green-500">trust your AI?</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full mb-4">
          <div className="border border-green-800 rounded-xl p-3 bg-green-950/20 text-center">
            <div className="text-green-400 text-[10px] uppercase tracking-widest mb-1 font-bold">Open</div>
            <div className="text-lg font-bold text-white mb-1">Free</div>
            <div className="text-xs text-zinc-400 mb-2">See what your AI is consuming.</div>
            <div className="text-[10px] text-zinc-600">Web, CLI, Chrome, MCP &bull; 50 scans/day</div>
            <div className="text-[10px] text-green-400/60 mt-1 font-medium">Developers &bull; Researchers</div>
          </div>
          <div className="border border-purple-800 rounded-xl p-3 bg-purple-950/20 text-center">
            <div className="text-purple-400 text-[10px] uppercase tracking-widest mb-1 font-bold">Builder</div>
            <div className="text-lg font-bold text-white mb-1">$29<span className="text-xs text-zinc-500">/mo</span></div>
            <div className="text-xs text-zinc-400 mb-2">Protect your agent at scale.</div>
            <div className="text-[10px] text-zinc-600">10K scans/mo &bull; 100 deep scans &bull; Webhooks</div>
            <div className="text-[10px] text-purple-400/60 mt-1 font-medium">Indie AI builders &bull; Solopreneurs</div>
          </div>
          <div className="border border-yellow-800 rounded-xl p-3 bg-yellow-950/20 text-center">
            <div className="text-yellow-400 text-[10px] uppercase tracking-widest mb-1 font-bold">Shield</div>
            <div className="text-lg font-bold text-white mb-1">$149<span className="text-xs text-zinc-500">/mo</span></div>
            <div className="text-xs text-zinc-400 mb-2">4-gate middleware for production.</div>
            <div className="text-[10px] text-zinc-600">50K scans &bull; CaMeL SDK &bull; Audit log &bull; 5 seats</div>
            <div className="text-[10px] text-yellow-400/60 mt-1 font-medium">AI startups &bull; Engineering teams</div>
          </div>
          <div className="border border-red-800 rounded-xl p-3 bg-red-950/20 text-center">
            <div className="text-red-400 text-[10px] uppercase tracking-widest mb-1 font-bold">Verified</div>
            <div className="text-lg font-bold text-white mb-1">$499<span className="text-xs text-zinc-500">/mo</span></div>
            <div className="text-xs text-zinc-400 mb-2">Trust badges for your platform.</div>
            <div className="text-[10px] text-zinc-600">Unlimited &bull; Badges &bull; Threat feed &bull; Custom SLA</div>
            <div className="text-[10px] text-red-400/60 mt-1 font-medium">Marketplaces &bull; Platforms</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-500 mt-1">
          <span className="text-green-400">Free tools</span>
          <span className="text-zinc-600">&rarr;</span>
          <span className="text-purple-400">API integration</span>
          <span className="text-zinc-600">&rarr;</span>
          <span className="text-yellow-400">Production middleware</span>
          <span className="text-zinc-600">&rarr;</span>
          <span className="text-red-400">Platform certification</span>
        </div>
        <p className="text-xs text-zinc-500 text-center max-w-lg mt-3">
          Land with free scans. Expand as agents go to production. <span className="text-white font-semibold">Every Shield customer becomes a distribution channel.</span>
        </p>
      </div>
    ),
  },
  // SLIDE 9: TEAM + ASK
  {
    id: "team",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-3xl sm:text-5xl font-bold text-white mb-4">
          RJ Moscardon
        </div>
        <div className="text-lg sm:text-xl text-zinc-400 mb-4">
          Solo founder. 92 expert AI consultants and agents. 21 purpose-built teams.
        </div>
        <div className="text-sm text-zinc-500 mb-6 max-w-md italic">
          I built an AI agent that runs my entire business. Then I realized anyone could inject instructions into the prompts it consumes. So I built Graded.
        </div>
        <div className="max-w-lg space-y-3 text-sm text-zinc-400 mb-8">
          <p>Open source engine. 212+ attack patterns. 6 MCP tools. 7 deployment surfaces. Multi-model deep scan via <span className="text-purple-400">Kalibr</span>.</p>
        </div>
        <div className="border border-green-800 rounded-xl p-6 bg-green-950/20 max-w-md w-full">
          <div className="text-green-400 text-xs uppercase tracking-widest mb-3 font-bold">Raising</div>
          <div className="text-2xl font-bold text-white mb-3">$500K pre-seed</div>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>Post-money SAFE</p>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-zinc-500">
              <div className="border border-zinc-800 rounded px-2 py-1">Design partners</div>
              <div className="border border-zinc-800 rounded px-2 py-1">Marketplace integrations</div>
              <div className="border border-zinc-800 rounded px-2 py-1">Engineering hire #1</div>
            </div>
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
          <a href="https://getgraded.vercel.app" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="block font-mono text-green-400 mt-2 hover:text-green-300 transition-colors">getgraded.vercel.app</a>
          <a href="https://github.com/conceptkitchen/graded" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="block font-mono text-zinc-500 hover:text-zinc-300 transition-colors">github.com/conceptkitchen/graded</a>
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
