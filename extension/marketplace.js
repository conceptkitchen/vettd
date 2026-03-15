/**
 * Graded Marketplace Scanner — scans visible prompts on prompt marketplaces
 * and shows inline grade badges next to each one.
 */

(function () {
  if (document.getElementById("graded-marketplace-active")) return;

  const marker = document.createElement("div");
  marker.id = "graded-marketplace-active";
  marker.style.display = "none";
  document.body.appendChild(marker);

  const BADGE_ATTR = "data-graded";
  let scanQueue = [];
  let scanning = false;

  function createInlineBadge(grade, score, findings) {
    const badge = document.createElement("div");
    badge.className = "graded-inline-badge";

    const colors = { A: "#22c55e", B: "#84cc16", C: "#eab308", D: "#f97316", F: "#ef4444" };
    const color = colors[grade] || "#6b7280";

    badge.innerHTML = `
      <span style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 6px;
        background: #111;
        border: 1px solid ${color};
        color: ${color};
        font-family: 'SF Mono', Consolas, monospace;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        position: relative;
        z-index: 10000;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      ">
        <span style="font-size: 14px; font-weight: 900;">${grade}</span>
        <span style="opacity: 0.7; font-weight: 400;">${score}/100</span>
        ${findings > 0 ? `<span style="opacity: 0.5; font-size: 10px;">(${findings})</span>` : ""}
      </span>
    `;

    // Tooltip on hover
    const tooltip = document.createElement("div");
    tooltip.style.cssText = `
      display: none;
      position: absolute;
      bottom: 100%;
      left: 0;
      margin-bottom: 4px;
      padding: 6px 10px;
      background: #111;
      border: 1px solid #333;
      border-radius: 6px;
      color: #ccc;
      font-size: 10px;
      font-family: 'SF Mono', Consolas, monospace;
      white-space: nowrap;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;
    tooltip.textContent = `Graded: ${grade} (${score}/100) — ${findings} finding${findings !== 1 ? "s" : ""}`;
    badge.style.position = "relative";
    badge.appendChild(tooltip);

    badge.addEventListener("mouseenter", () => { tooltip.style.display = "block"; });
    badge.addEventListener("mouseleave", () => { tooltip.style.display = "none"; });

    return badge;
  }

  function findPromptBlocks() {
    const blocks = [];

    // <pre> and <code> blocks (common on GitHub, docs)
    document.querySelectorAll("pre, code").forEach((el) => {
      if (el.getAttribute(BADGE_ATTR)) return;
      const text = (el.innerText || el.textContent || "").trim();
      if (text.length > 30) {
        blocks.push({ element: el, text });
      }
    });

    // Cards/items on FlowGPT, PromptBase (look for common patterns)
    const cardSelectors = [
      // FlowGPT
      '[class*="prompt-card"]', '[class*="PromptCard"]',
      '[class*="prompt-content"]', '[class*="prompt-text"]',
      // PromptBase
      '[class*="listing"]', '[class*="prompt-detail"]',
      // Generic
      '[class*="card"] p', '[class*="Card"] p',
      'article p', '.description', '.prompt-body',
    ];

    for (const sel of cardSelectors) {
      try {
        document.querySelectorAll(sel).forEach((el) => {
          if (el.getAttribute(BADGE_ATTR)) return;
          const text = (el.innerText || el.textContent || "").trim();
          if (text.length > 30) {
            blocks.push({ element: el, text });
          }
        });
      } catch (e) {
        continue;
      }
    }

    // Textareas with content
    document.querySelectorAll("textarea").forEach((el) => {
      if (el.getAttribute(BADGE_ATTR)) return;
      const text = el.value.trim();
      if (text.length > 30) {
        blocks.push({ element: el, text });
      }
    });

    // Deduplicate by element
    const seen = new Set();
    return blocks.filter((b) => {
      if (seen.has(b.element)) return false;
      seen.add(b.element);
      return true;
    });
  }

  function processQueue() {
    if (scanning || scanQueue.length === 0) return;
    scanning = true;

    const batch = scanQueue.splice(0, 10); // Process 10 at a time

    for (const { element, text } of batch) {
      if (element.getAttribute(BADGE_ATTR)) continue;
      element.setAttribute(BADGE_ATTR, "scanned");

      const result = gradedScan(text);
      const badge = createInlineBadge(result.grade, result.score, result.total);

      // Insert badge before or after the element
      if (element.tagName === "PRE" || element.tagName === "CODE") {
        element.parentNode.insertBefore(badge, element);
      } else {
        // Try to insert at the beginning of the element
        if (element.firstChild) {
          element.insertBefore(badge, element.firstChild);
        } else {
          element.appendChild(badge);
        }
      }
    }

    scanning = false;

    // Continue if more in queue
    if (scanQueue.length > 0) {
      setTimeout(processQueue, 100);
    }
  }

  function scanPage() {
    const blocks = findPromptBlocks();
    if (blocks.length === 0) return;

    scanQueue.push(...blocks);
    processQueue();
  }

  // Summary badge at bottom right
  function showSummaryBadge(total, gradeDistribution) {
    let existing = document.getElementById("graded-badge");
    if (existing) existing.remove();

    const badge = document.createElement("div");
    badge.id = "graded-badge";

    const worstGrade = ["F", "D", "C", "B", "A"].find((g) => gradeDistribution[g] > 0) || "A";
    const colors = { A: "#22c55e", B: "#84cc16", C: "#eab308", D: "#f97316", F: "#ef4444" };
    const color = colors[worstGrade];

    const unsafe = (gradeDistribution.D || 0) + (gradeDistribution.F || 0);

    badge.innerHTML = `
      <div class="graded-pill" style="border-color: ${color};">
        <div class="graded-grade" style="color: ${color}; border-color: ${color};">${total}</div>
        <div>
          <div class="graded-label">Graded</div>
          <div class="graded-score" style="color: ${color};">${unsafe > 0 ? unsafe + " unsafe" : "All safe"}</div>
        </div>
      </div>
    `;
    document.body.appendChild(badge);
  }

  // Initial scan
  function initialScan() {
    // Wait for page to settle
    setTimeout(() => {
      scanPage();

      // Update summary
      const graded = document.querySelectorAll(`[${BADGE_ATTR}]`);
      if (graded.length > 0) {
        const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        graded.forEach((el) => {
          const badge = el.previousSibling || el.firstChild;
          if (badge && badge.classList && badge.classList.contains("graded-inline-badge")) {
            const letter = badge.querySelector("span span")?.textContent;
            if (letter && dist[letter] !== undefined) dist[letter]++;
          }
        });
        showSummaryBadge(graded.length, dist);
      }
    }, 2000);
  }

  // Watch for dynamic content (SPAs)
  const observer = new MutationObserver(() => {
    setTimeout(scanPage, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Start
  if (document.readyState === "complete") {
    initialScan();
  } else {
    window.addEventListener("load", initialScan);
  }
})();
