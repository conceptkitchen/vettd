"use strict";
/**
 * Graded Scanner Core — shared between MCP server, API, and npm package.
 * TypeScript port of the Python regex checkers.
 * Base patterns (120) + Augustus open source patterns (62) + Hybrid threat categories (3)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOTAL_STATIC_PATTERNS = exports.HYBRID_PATTERN_COUNT = exports.BASE_PATTERN_COUNT = void 0;
exports.scanPrompt = scanPrompt;
const augustus_patterns_js_1 = require("./augustus-patterns.js");
exports.BASE_PATTERN_COUNT = 120;
exports.HYBRID_PATTERN_COUNT = 30; // P2SQL + XSS-via-AI + Agent Abuse
exports.TOTAL_STATIC_PATTERNS = exports.BASE_PATTERN_COUNT + augustus_patterns_js_1.AUGUSTUS_PATTERN_COUNT + exports.HYBRID_PATTERN_COUNT;
const MAX_TEXT_LENGTH = 50_000;
/**
 * P2: Detect if a match index falls inside a markdown code fence (``` ... ```).
 * Returns true if the position is inside a code block.
 */
function isInCodeBlock(text, index) {
    const fencePattern = /^(`{3,}|~{3,}).*$/gm;
    let inBlock = false;
    let blockStart = -1;
    let match;
    while ((match = fencePattern.exec(text)) !== null) {
        if (!inBlock) {
            inBlock = true;
            blockStart = match.index;
        }
        else {
            // Closing fence — check if our index falls inside
            const blockEnd = match.index + match[0].length;
            if (index >= blockStart && index <= blockEnd)
                return true;
            inBlock = false;
        }
    }
    // If still in an unclosed block and index is after the opening fence
    if (inBlock && index >= blockStart)
        return true;
    return false;
}
/**
 * Pre-compute all code block ranges for efficient repeated lookups.
 */
function getCodeBlockRanges(text) {
    const ranges = [];
    let match;
    // Markdown fences (``` or ~~~)
    const fencePattern = /^(`{3,}|~{3,}).*$/gm;
    let openStart = -1;
    let inBlock = false;
    while ((match = fencePattern.exec(text)) !== null) {
        if (!inBlock) {
            inBlock = true;
            openStart = match.index;
        }
        else {
            ranges.push([openStart, match.index + match[0].length]);
            inBlock = false;
        }
    }
    if (inBlock)
        ranges.push([openStart, text.length]);
    // HTML <pre> and <code> blocks
    const htmlCodePattern = /<(?:pre|code)[^>]*>[\s\S]*?<\/(?:pre|code)>/gi;
    while ((match = htmlCodePattern.exec(text)) !== null) {
        ranges.push([match.index, match.index + match[0].length]);
    }
    // Inline backticks (`...`)
    const inlineCodePattern = /`([^`\n]+)`/g;
    while ((match = inlineCodePattern.exec(text)) !== null) {
        ranges.push([match.index, match.index + match[0].length]);
    }
    // Sort by start position for efficient lookup
    ranges.sort((a, b) => a[0] - b[0]);
    return ranges;
}
function isInCodeBlockFast(ranges, index) {
    for (const [start, end] of ranges) {
        if (index >= start && index <= end)
            return true;
        if (start > index)
            break; // ranges are sorted
    }
    return false;
}
function searchPatterns(text, patterns, category, severity, descTemplate, codeBlockRanges) {
    const findings = [];
    const textLower = text.toLowerCase();
    for (const pattern of patterns) {
        try {
            const re = new RegExp(pattern, "gim");
            let match;
            while ((match = re.exec(textLower)) !== null) {
                const evidence = match[0].trim();
                const start = Math.max(0, match.index - 20);
                const end = Math.min(text.length, match.index + match[0].length + 20);
                const context = text.slice(start, end).trim();
                // P2: Downgrade confidence if match is inside a code block
                let confidence = "high";
                if (codeBlockRanges && isInCodeBlockFast(codeBlockRanges, match.index)) {
                    confidence = "low";
                }
                findings.push({
                    category,
                    severity,
                    confidence,
                    description: descTemplate.replace("{evidence}", evidence),
                    evidence: context,
                });
            }
        }
        catch {
            continue;
        }
    }
    const seen = new Set();
    return findings.filter((f) => {
        const key = `${f.category}:${f.evidence.toLowerCase()}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function dedupe(findings) {
    const seen = new Set();
    return findings.filter((f) => {
        const key = `${f.category}:${f.evidence.toLowerCase()}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
// === Category 1: Jailbreak ===
function checkJailbreak(text, cbr) {
    const patterns = [
        "\\bdan\\b(?:\\s+mode)?",
        "developer\\s+mode",
        "jailbreak",
        "you\\s+are\\s+now\\s+unconstrained",
        "act\\s+as\\s+(?:an?\\s+)?unrestricted",
        "ignore\\s+(?:all\\s+)?safety",
        "bypass\\s+(?:all\\s+)?restrictions",
        "pretend\\s+you\\s+(?:have|are)\\s+no\\s+(?:rules|restrictions|limitations)",
        "you\\s+(?:can|will)\\s+do\\s+anything\\s+now",
        "(?:enable|activate|enter)\\s+(?:developer|jailbreak|unrestricted|god)\\s+mode",
        "ignore\\s+(?:your|all)\\s+(?:rules|guidelines|programming)",
        "you\\s+are\\s+(?:freed|liberated|unshackled)",
        "do\\s+anything\\s+now",
        "(?:no|without)\\s+(?:ethical|moral)\\s+(?:guidelines|constraints|boundaries)",
        "opposite\\s+of\\s+what\\s+(?:openai|anthropic|your\\s+creators)",
        "stay\\s+in\\s+character\\s+(?:as|no\\s+matter)",
        "in\\s+this\\s+hypothetical",
        "for\\s+(?:educational|research|academic)\\s+purposes\\s+only",
    ];
    return searchPatterns(text, patterns, "Jailbreak", "critical", 'Jailbreak pattern: "{evidence}"', cbr);
}
// === Category 2: Instruction Override ===
function checkInstructionOverride(text, cbr) {
    const patterns = [
        "ignore\\s+(?:all\\s+)?previous\\s+instructions",
        "disregard\\s+(?:all\\s+)?(?:prior|above|previous|safety)",
        "new\\s+instructions\\s*:",
        "forget\\s+everything\\s+(?:above|before|previously)",
        "override\\s+(?:system|your)\\s+prompt",
        "your\\s+(?:real|actual|true)\\s+instructions\\s+are",
        "from\\s+now\\s+on\\s*,?\\s*(?:you\\s+will|ignore|disregard)",
        "(?:system|admin)\\s*:\\s*(?:override|new\\s+instructions)",
        "end\\s+(?:of\\s+)?system\\s+prompt",
        "begin\\s+(?:new\\s+)?(?:user\\s+)?instructions",
        "</system>",
        "\\[system\\]",
        "<<\\s*(?:SYS|SYSTEM)",
        "(?:forget|clear|reset)\\s+(?:your\\s+)?(?:context|memory|instructions)",
        "(?:new|updated)\\s+system\\s+(?:prompt|message|instructions)",
    ];
    return searchPatterns(text, patterns, "Instruction Override", "critical", 'Override attempt: "{evidence}"', cbr);
}
// === Category 3: Data Exfiltration ===
function checkDataExfiltration(text, cbr) {
    const findings = [];
    const textLower = text.toLowerCase();
    const exfilContextPatterns = [
        "send\\s+(?:it\\s+)?to",
        "forward\\s+(?:it\\s+)?to",
        "post\\s+(?:it\\s+)?to",
        "upload\\s+(?:it\\s+)?to",
        "exfiltrate",
        "callback\\s+(?:url|endpoint)",
    ];
    // Require exfil verb and URL to be within 200 chars of each other (proximity check)
    for (const ctxPattern of exfilContextPatterns) {
        const ctxRe = new RegExp(ctxPattern, "gi");
        let ctxMatch;
        while ((ctxMatch = ctxRe.exec(textLower)) !== null) {
            const nearby = text.slice(Math.max(0, ctxMatch.index - 200), ctxMatch.index + ctxMatch[0].length + 200);
            const urlPattern = /https?:\/\/[^\s<>"')\]]+/gi;
            const nearbyUrls = nearby.match(urlPattern) || [];
            for (const url of nearbyUrls) {
                const urlConfidence = isInCodeBlockFast(cbr, ctxMatch.index) ? "low" : "high";
                findings.push({
                    category: "Data Exfiltration",
                    severity: "critical",
                    confidence: urlConfidence,
                    description: "URL found near exfiltration verb",
                    evidence: url,
                });
            }
        }
    }
    const leakPatterns = [
        "(?:repeat|show|display|print|output|reveal)\\s+(?:your\\s+)?(?:system\\s+)?(?:prompt|instructions)",
        "(?:what|show)\\s+(?:are|me)\\s+your\\s+(?:instructions|system\\s+prompt|rules)",
        "repeat\\s+(?:everything|all)\\s+(?:above|before)",
        "(?:copy|paste|dump)\\s+(?:your\\s+)?(?:entire|full|complete)\\s+(?:prompt|context|instructions)",
        "what\\s+were\\s+you\\s+told",
    ];
    findings.push(...searchPatterns(text, leakPatterns, "Data Exfiltration", "critical", 'Extraction attempt: "{evidence}"', cbr));
    const webhookPatterns = [
        "webhook[.\\-_]?(?:url|endpoint|site)",
        "ngrok\\.io",
        "requestbin",
        "pipedream",
        "burpcollaborator",
        "interact\\.sh",
    ];
    findings.push(...searchPatterns(text, webhookPatterns, "Data Exfiltration", "critical", 'Suspicious endpoint: "{evidence}"', cbr));
    return dedupe(findings);
}
// === Category 4: Credential Harvesting ===
function checkCredentialHarvesting(text, cbr) {
    const patterns = [
        "(?:paste|enter|provide|input|share|give\\s+me)\\s+(?:your\\s+)?(?:\\w+\\s+)?(?:api|secret)\\s*key",
        "(?:paste|enter|provide|input|share|give\\s+me)\\s+(?:your\\s+)?password",
        "(?:paste|enter|provide|input|share|give\\s+me)\\s+(?:your\\s+)?token",
        "(?:paste|enter|provide|input|share|give\\s+me)\\s+(?:your\\s+)?(?:secret|credential)",
        "(?:paste|enter|provide|input|share|give\\s+me)\\s+(?:your\\s+)?(?:ssn|social\\s+security)",
        "what\\s+is\\s+your\\s+(?:api\\s+key|password|token|secret)",
        "(?:openai|anthropic|aws|gcp|azure)\\s*(?:_|-)?(?:api)?(?:_|-)?key\\s*(?:=|:)",
        "(?:sk|pk)[-_](?:live|test|prod)[-_]\\w*",
        "Bearer\\s+[A-Za-z0-9\\-._~+/]+=*",
        "\\[your\\s+(?:api\\s+)?key\\]",
        "\\[your\\s+(?:email\\s+)?password\\]",
        "\\[your\\s+token\\]",
        "\\[your\\s+secret\\]",
        "\\[(?:paste|your)\\s+(?:contents|credentials?)\\]",
        "(?:api|secret|access)\\s+key\\s*(?:id)?\\s*:\\s*\\[",
        "(?:password|passphrase)\\s*:\\s*\\[",
        "(?:oauth\\s+)?token\\s*:\\s*\\[",
        "(?:imap|smtp)\\s+credentials?\\s*:",
        "(?:store|save|cache)\\s+(?:these\\s+)?credentials",
        "credentials?\\s+in\\s+(?:your\\s+)?(?:session|context|memory)",
    ];
    return searchPatterns(text, patterns, "Credential Harvesting", "critical", 'Credential harvesting: "{evidence}"', cbr);
}
// === Category 5: Hidden Text ===
function checkHiddenText(text, _cbr) {
    const findings = [];
    const invisibleChars = {
        "\u200b": "Zero-Width Space",
        "\u200c": "Zero-Width Non-Joiner",
        "\u200d": "Zero-Width Joiner",
        "\ufeff": "Byte Order Mark",
        "\u200e": "Left-to-Right Mark",
        "\u200f": "Right-to-Left Mark",
        "\u2060": "Word Joiner",
        "\u00ad": "Soft Hyphen",
    };
    for (const [char, name] of Object.entries(invisibleChars)) {
        const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const count = (text.match(new RegExp(escaped, "g")) || []).length;
        if (count > 0) {
            findings.push({
                category: "Hidden Text",
                severity: "medium",
                confidence: "high",
                description: `Invisible character: ${name} (x${count})`,
                evidence: `Found ${count} instance(s) of ${name}`,
            });
        }
    }
    const rtlChars = {
        "\u202a": "LTR Embedding",
        "\u202b": "RTL Embedding",
        "\u202d": "LTR Override",
        "\u202e": "RTL Override",
    };
    for (const [char, name] of Object.entries(rtlChars)) {
        const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const count = (text.match(new RegExp(escaped, "g")) || []).length;
        if (count > 0) {
            findings.push({
                category: "Hidden Text",
                severity: "medium",
                confidence: "high",
                description: `Text direction override: ${name} (x${count})`,
                evidence: `Found ${count} instance(s) of ${name}`,
            });
        }
    }
    if (text.length > 20) {
        const hasLatin = /[a-zA-Z]/.test(text);
        const hasCyrillic = /[\u0400-\u04ff]/.test(text);
        const hasGreek = /[\u0370-\u03ff]/.test(text);
        if (hasLatin && (hasCyrillic || hasGreek)) {
            findings.push({
                category: "Hidden Text",
                severity: "medium",
                confidence: "high",
                description: "Mixed script detected (possible homoglyph attack)",
                evidence: `Latin mixed with ${hasCyrillic ? "Cyrillic" : "Greek"}`,
            });
        }
    }
    return findings;
}
// === Category 6: Obfuscated Payloads ===
function checkObfuscatedPayloads(text, cbr) {
    const findings = [];
    const b64Pattern = /(?<![A-Za-z0-9+/])([A-Za-z0-9+/]{20,}={0,2})(?![A-Za-z0-9+/])/g;
    let match;
    while ((match = b64Pattern.exec(text)) !== null) {
        try {
            let candidate = match[1];
            if (candidate.length % 4) {
                candidate += "=".repeat(4 - (candidate.length % 4));
            }
            const decoded = Buffer.from(candidate, "base64").toString("utf-8");
            const printable = [...decoded].filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127).length;
            if (decoded.length > 4 && printable / decoded.length > 0.7) {
                const b64Confidence = isInCodeBlockFast(cbr, match.index) ? "low" : "medium";
                findings.push({
                    category: "Obfuscated Payload",
                    severity: "medium",
                    confidence: b64Confidence,
                    description: "Base64-encoded text decodes to readable content",
                    evidence: `${match[1].slice(0, 40)}... -> ${decoded.slice(0, 60)}`,
                });
            }
        }
        catch {
            continue;
        }
    }
    const evalPatterns = [
        "(?<!\\.)\\beval\\s*\\(", // Exclude method calls like obj.eval()
        "(?<!\\.)\\bexec\\s*\\(", // Exclude method calls like cursor.exec()
        "(?<!\\w)Function\\s*\\(",
        "setTimeout\\s*\\(\\s*[\"']",
        "(?<!\\.)__import__\\s*\\(",
        "subprocess\\s*\\.\\s*(?:call|run|Popen)",
        "os\\s*\\.\\s*system\\s*\\(",
    ];
    findings.push(...searchPatterns(text, evalPatterns, "Obfuscated Payload", "medium", 'Code execution pattern: "{evidence}"', cbr));
    return dedupe(findings);
}
// === Category 7: Privilege Escalation ===
function checkPrivilegeEscalation(text, cbr) {
    const patterns = [
        "as\\s+(?:a\\s+)?system\\s+administrator",
        "with\\s+root\\s+access",
        "developer\\s+override",
        "\\bsudo\\b",
        "admin\\s+mode",
        "unrestricted\\s+access",
        "elevated\\s+(?:privileges|permissions|access)",
        "(?:grant|give)\\s+(?:me|yourself)\\s+(?:admin|root|full)\\s+(?:access|privileges|permissions)",
        "bypass\\s+(?:authentication|authorization|permissions|access\\s+control)",
        "(?:act|operate|function)\\s+as\\s+(?:an?\\s+)?(?:admin|root|superuser)",
        "(?:enable|activate)\\s+(?:admin|root|superuser|god)\\s+(?:mode|access|privileges)",
        "override\\s+(?:security|safety|access)\\s+(?:controls|checks|restrictions)",
        "(?:disable|turn\\s+off|remove)\\s+(?:safety|security)\\s+(?:checks|features|controls)",
    ];
    return searchPatterns(text, patterns, "Privilege Escalation", "high", 'Privilege escalation: "{evidence}"', cbr);
}
// === Category 8: Social Engineering ===
function checkSocialEngineering(text, cbr) {
    const patterns = [
        "you\\s+can\\s+do\\s+anything",
        "no\\s+restrictions?\\s+appl(?:y|ies)",
        "bypass\\s+(?:content|safety)\\s+polic(?:y|ies)",
        "act\\s+as\\s+if\\s+you\\s+have\\s+no\\s+guidelines",
        "pretend\\s+(?:that\\s+)?safety\\s+(?:features|filters|guidelines)\\s+(?:are|is)\\s+disabled",
        "(?:this|it)\\s+(?:is|'s)\\s+(?:just\\s+)?(?:a\\s+)?(?:test|experiment|simulation|hypothetical)",
        "(?:nobody|no\\s+one)\\s+(?:will|can)\\s+(?:know|see|find\\s+out)",
        "(?:this|it)\\s+won'?t\\s+(?:be|get)\\s+(?:logged|recorded|monitored)",
        "(?:you're|you\\s+are)\\s+(?:just|only)\\s+(?:a\\s+)?(?:language\\s+model|ai|computer|program)",
        "(?:openai|anthropic|your\\s+(?:creators|developers))\\s+(?:won'?t|can'?t|don'?t)\\s+(?:know|care|see)",
        "(?:real|actual|true)\\s+(?:ai|model|version)\\s+(?:without|beyond|past)\\s+(?:censorship|filters|restrictions)",
        "(?:stop|quit)\\s+(?:being|acting)\\s+(?:so\\s+)?(?:cautious|careful|restricted|limited)",
    ];
    return searchPatterns(text, patterns, "Social Engineering", "high", 'Social engineering: "{evidence}"', cbr);
}
// === Category 10: P2SQL (Prompt-to-SQL Injection) ===
function checkP2SQL(text, cbr) {
    const patterns = [
        // Direct SQL injection keywords
        "\\bDROP\\s+TABLE\\b",
        "\\bDELETE\\s+FROM\\b",
        "\\bUNION\\s+SELECT\\b",
        "\\bOR\\s+1\\s*=\\s*1\\b",
        "'\\s*;\\s*--",
        "\\bINSERT\\s+INTO\\b.*\\bVALUES\\b",
        "\\bUPDATE\\s+\\w+\\s+SET\\b",
        "\\bALTER\\s+TABLE\\b",
        "\\bTRUNCATE\\s+TABLE\\b",
        "(?<!\\.)\\bEXEC(?:UTE)?\\s*\\(", // Negative lookbehind excludes method calls like router.execute()
        // Semantic SQL injection via natural language
        "show\\s+me\\s+all\\s+(?:users?|passwords?|credentials?|records?|data)",
        "dump\\s+(?:the\\s+)?(?:database|table|schema|users?|passwords?)",
        "(?:list|get|fetch|retrieve|select)\\s+(?:all\\s+)?(?:users?|accounts?|passwords?|credentials?)\\s+(?:from|in)\\s+(?:the\\s+)?(?:database|table|system)",
        "(?:bypass|skip|ignore)\\s+(?:the\\s+)?(?:parameterized|prepared)\\s+(?:queries|statements)",
        "(?:inject|insert)\\s+(?:into|sql|query)\\s+(?:the\\s+)?(?:database|query|statement)",
        "\\bSELECT\\s+\\*\\s+FROM\\b",
        "\\b(?:xp_cmdshell|sp_executesql|information_schema)\\b",
        "\\bWAITFOR\\s+DELAY\\b",
        "(?<!\\.)\\bBENCHMARK\\s*\\(", // Exclude method calls like benchmark.run()
        "(?<!\\.)\\bSLEEP\\s*\\(", // Exclude method calls like time.sleep()
    ];
    return searchPatterns(text, patterns, "P2SQL Injection", "critical", 'SQL injection pattern: "{evidence}"', cbr);
}
// === Category 11: XSS-via-AI ===
function checkXSSviaAI(text, cbr) {
    const findings = [];
    // HTML tag patterns — common in documentation, default to MEDIUM confidence
    // Code block detection will further downgrade to LOW
    const htmlTagPatterns = [
        "<script[\\s>]",
        "javascript\\s*:",
        "\\bonerror\\s*=",
        "\\bonclick\\s*=",
        "\\bonload\\s*=",
        "\\bonmouseover\\s*=",
        "\\bonfocus\\s*=",
        "\\bonsubmit\\s*=",
    ];
    const htmlFindings = searchPatterns(text, htmlTagPatterns, "XSS-via-AI", "high", 'XSS-via-AI pattern: "{evidence}"', cbr);
    // Downgrade non-code-block HTML tag matches to medium confidence (docs almost always have these)
    for (const f of htmlFindings) {
        if (f.confidence !== "low")
            f.confidence = "medium";
    }
    findings.push(...htmlFindings);
    // AI-targeted XSS generation prompts — these are real attacks, stay HIGH
    const aiTargetedPatterns = [
        "(?:wrap|put|enclose|format)\\s+(?:your\\s+)?(?:response|answer|output)\\s+in\\s+(?:HTML|script\\s+tags?)",
        "output\\s+(?:as|in)\\s+HTML",
        "include\\s+(?:a\\s+)?script\\s+tag",
        "add\\s+(?:a\\s+)?(?:javascript|script|js)\\s+(?:tag|block|snippet|code)",
        "(?:generate|create|write|make)\\s+(?:a\\s+)?(?:webpage|html\\s+page|html\\s+document)\\s+(?:that|which|with)",
        "(?:embed|inject|insert)\\s+(?:javascript|script|js|code)\\s+(?:in|into)\\s+(?:the\\s+)?(?:response|output|page|html)",
        "PHNjcmlwdD4", // base64 for "<script>"
        "amF2YXNjcmlwdDo", // base64 for "javascript:"
    ];
    findings.push(...searchPatterns(text, aiTargetedPatterns, "XSS-via-AI", "high", 'XSS-via-AI pattern: "{evidence}"', cbr));
    return dedupe(findings);
}
// === Category 12: Agent Abuse ===
function checkAgentAbuse(text, cbr) {
    const patterns = [
        // Tool invocation attempts — require 2nd person or imperative targeting AI agent
        // "use the X tool" is normal docs language; "you must use the X tool to delete" is agent abuse
        "(?:you\\s+(?:must|should|will|can)\\s+)?(?:call|invoke)\\s+the\\s+\\w+\\s+(?:tool|function)\\s+(?:to|and)\\s+(?:delete|remove|send|forward|drop|execute|exfiltrate)",
        "(?:you\\s+(?:must|should|will|can)\\s+)?(?:use|run)\\s+the\\s+\\w+\\s+(?:tool|function)\\s+(?:to|and)\\s+(?:delete|remove|send|forward|drop|execute|exfiltrate)",
        // Destructive agent actions
        "send\\s+(?:an?\\s+)?email\\s+to",
        "delete\\s+all\\s+(?:the\\s+)?(?:files?|data|records?|messages?)",
        "drop\\s+(?:the\\s+)?(?:database|table|collection)",
        "run\\s+(?:a\\s+)?shell\\s+(?:command|script)",
        "execute\\s+(?:a\\s+)?(?:shell|bash|system)\\s+command",
        // Exfiltration via agent tools
        "forward\\s+(?:this|the|all)\\s+(?:data|info|information|credentials?)\\s+to\\s+(?:attacker|me|this\\s+(?:url|address|email))",
        "exfiltrate\\s+(?:the\\s+)?(?:data|credentials?|secrets?|keys?|tokens?)",
        "send\\s+(?:the\\s+)?(?:credentials?|secrets?|api\\s+keys?|tokens?|passwords?)\\s+to",
        "\\btransfer\\s+(?:all\\s+)?(?:funds?|money|balance)\\s+to\\b",
        // Tool name + destructive action
        "(?:file|filesystem|fs|storage)\\s+(?:tool|function).*?(?:delete|remove|wipe|destroy)",
        "(?:email|mail|smtp)\\s+(?:tool|function).*?(?:send|forward|relay)\\s+(?:to|all)",
        "(?:database|db|sql)\\s+(?:tool|function).*?(?:drop|delete|truncate|wipe)",
        "(?:browser|web|http)\\s+(?:tool|function).*?(?:navigate|visit|open).*?(?:attacker|evil|malicious)",
    ];
    return searchPatterns(text, patterns, "Agent Abuse", "critical", 'Agent abuse pattern: "{evidence}"', cbr);
}
// === All checkers including hybrid threat categories ===
const ALL_CHECKERS = [
    ["Jailbreak patterns", checkJailbreak],
    ["Instruction override", checkInstructionOverride],
    ["Data exfiltration", checkDataExfiltration],
    ["Credential harvesting", checkCredentialHarvesting],
    ["Hidden text", checkHiddenText],
    ["Obfuscated payloads", checkObfuscatedPayloads],
    ["Privilege escalation", checkPrivilegeEscalation],
    ["Social engineering", checkSocialEngineering],
    // P2 Hybrid threat categories
    ["P2SQL injection", checkP2SQL],
    ["XSS-via-AI", checkXSSviaAI],
    ["Agent abuse", checkAgentAbuse],
];
function calculateScore(checks) {
    let score = 100;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let totalFindings = 0;
    // P3: Confidence weights — low-confidence findings still appear but barely affect the grade
    const CONFIDENCE_WEIGHT = { high: 1.0, medium: 0.5, low: 0.1 };
    for (const check of checks) {
        for (const f of check.findings) {
            totalFindings++;
            const weight = CONFIDENCE_WEIGHT[f.confidence ?? "high"];
            switch (f.severity) {
                case "critical":
                    score -= 25 * weight;
                    criticalCount++;
                    break;
                case "high":
                    score -= 15 * weight;
                    highCount++;
                    break;
                case "medium":
                    score -= 10 * weight;
                    mediumCount++;
                    break;
                case "low":
                    score -= 5 * weight;
                    lowCount++;
                    break;
            }
        }
    }
    score = Math.max(0, Math.round(score));
    let grade;
    if (score >= 90)
        grade = "A";
    else if (score >= 80)
        grade = "B";
    else if (score >= 70)
        grade = "C";
    else if (score >= 60)
        grade = "D";
    else
        grade = "F";
    return { score, grade, totalFindings, criticalCount, highCount, mediumCount, lowCount };
}
/**
 * Main scan function. Runs all base checkers + Augustus patterns + hybrid threats.
 * Optionally accepts extra learned patterns from Neon DB.
 */
function scanPrompt(text, extraPatterns) {
    const truncated = text.slice(0, MAX_TEXT_LENGTH);
    // P2: Pre-compute code block ranges once for all checkers
    const codeBlockRanges = getCodeBlockRanges(truncated);
    const checks = ALL_CHECKERS.map(([name, checker]) => {
        const findings = checker(truncated, codeBlockRanges);
        return { checkName: name, passed: findings.length === 0, findings };
    });
    // Apply Augustus open-source patterns
    const augustusFindings = [];
    const textLowerAug = truncated.toLowerCase();
    for (const ap of augustus_patterns_js_1.AUGUSTUS_PATTERNS) {
        try {
            const re = new RegExp(ap.pattern, "gim");
            let match;
            while ((match = re.exec(textLowerAug)) !== null) {
                const start = Math.max(0, match.index - 20);
                const end = Math.min(truncated.length, match.index + match[0].length + 20);
                const context = truncated.slice(start, end).trim();
                // Code block matches get low confidence; Context Boundary category also gets low (standalone separators are almost always formatting)
                let augConfidence = isInCodeBlockFast(codeBlockRanges, match.index) ? "low" : "high";
                if (ap.category === "Context Boundary")
                    augConfidence = "low";
                augustusFindings.push({
                    category: ap.category,
                    severity: ap.severity,
                    confidence: augConfidence,
                    description: `[Augustus] ${ap.description}`,
                    evidence: context,
                });
            }
        }
        catch {
            continue;
        }
    }
    if (augustusFindings.length > 0) {
        const existingEvidence = new Set(checks.flatMap((c) => c.findings.map((f) => f.evidence.toLowerCase())));
        const uniqueAugustus = augustusFindings.filter((f) => !existingEvidence.has(f.evidence.toLowerCase()));
        checks.push({
            checkName: "Augustus patterns (open source)",
            passed: uniqueAugustus.length === 0,
            findings: uniqueAugustus,
        });
    }
    else {
        checks.push({
            checkName: "Augustus patterns (open source)",
            passed: true,
            findings: [],
        });
    }
    // Apply learned patterns (from Neon DB)
    if (extraPatterns && extraPatterns.length > 0) {
        const learnedFindings = [];
        const textLower = truncated.toLowerCase();
        for (const ep of extraPatterns) {
            try {
                const re = new RegExp(ep.pattern, "gim");
                let match;
                while ((match = re.exec(textLower)) !== null) {
                    const start = Math.max(0, match.index - 20);
                    const end = Math.min(truncated.length, match.index + match[0].length + 20);
                    const context = truncated.slice(start, end).trim();
                    const learnedConfidence = isInCodeBlockFast(codeBlockRanges, match.index) ? "low" : "high";
                    learnedFindings.push({
                        category: ep.category,
                        severity: ep.severity,
                        confidence: learnedConfidence,
                        description: `[Learned] ${ep.description}`,
                        evidence: context,
                    });
                }
            }
            catch {
                continue;
            }
        }
        if (learnedFindings.length > 0) {
            const existingEvidence = new Set(checks.flatMap((c) => c.findings.map((f) => f.evidence.toLowerCase())));
            const uniqueLearned = learnedFindings.filter((f) => !existingEvidence.has(f.evidence.toLowerCase()));
            if (uniqueLearned.length > 0) {
                checks.push({
                    checkName: "Learned patterns",
                    passed: false,
                    findings: uniqueLearned,
                });
            }
        }
    }
    // Add "Learned patterns" check as passed if no findings
    if (!checks.find((c) => c.checkName === "Learned patterns") && extraPatterns && extraPatterns.length > 0) {
        checks.push({
            checkName: "Learned patterns",
            passed: true,
            findings: [],
        });
    }
    const scoreData = calculateScore(checks);
    return { checks, scoreData };
}
