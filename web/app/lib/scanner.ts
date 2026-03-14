/**
 * Vettd - Browser-side prompt security scanner.
 * TypeScript port of the Python regex checkers.
 */

export interface Finding {
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  evidence: string;
}

export interface ScanResult {
  checkName: string;
  passed: boolean;
  findings: Finding[];
}

export interface ScoreData {
  score: number;
  grade: string;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface FullScanResult {
  checks: ScanResult[];
  scoreData: ScoreData;
}

const MAX_TEXT_LENGTH = 50_000;

function searchPatterns(
  text: string,
  patterns: string[],
  category: string,
  severity: Finding["severity"],
  descTemplate: string
): Finding[] {
  const findings: Finding[] = [];
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
        findings.push({
          category,
          severity,
          description: descTemplate.replace("{evidence}", evidence),
          evidence: context,
        });
      }
    } catch {
      continue;
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.category}:${f.evidence.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function checkJailbreak(text: string): Finding[] {
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
  return searchPatterns(text, patterns, "Jailbreak", "critical", 'Jailbreak pattern: "{evidence}"');
}

function checkInstructionOverride(text: string): Finding[] {
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
  return searchPatterns(text, patterns, "Instruction Override", "critical", 'Override attempt: "{evidence}"');
}

function checkDataExfiltration(text: string): Finding[] {
  const findings: Finding[] = [];
  const textLower = text.toLowerCase();

  const urlPattern = /https?:\/\/[^\s<>"')\]]+/gi;
  const exfilContextPatterns = [
    "send\\s+(?:it\\s+)?to",
    "forward\\s+(?:it\\s+)?to",
    "post\\s+(?:it\\s+)?to",
    "upload\\s+(?:it\\s+)?to",
    "exfiltrate",
    "webhook",
    "callback\\s+(?:url|endpoint)",
  ];

  const urls = text.match(urlPattern) || [];
  for (const ctxPattern of exfilContextPatterns) {
    if (new RegExp(ctxPattern, "i").test(textLower)) {
      for (const url of urls) {
        findings.push({
          category: "Data Exfiltration",
          severity: "critical",
          description: "URL found with exfiltration verb",
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
  findings.push(...searchPatterns(text, leakPatterns, "Data Exfiltration", "critical", 'Extraction attempt: "{evidence}"'));

  const webhookPatterns = [
    "webhook[.\\-_]?(?:url|endpoint|site)",
    "ngrok\\.io",
    "requestbin",
    "pipedream",
    "burpcollaborator",
    "interact\\.sh",
  ];
  findings.push(...searchPatterns(text, webhookPatterns, "Data Exfiltration", "critical", 'Suspicious endpoint: "{evidence}"'));

  return dedupe(findings);
}

function checkCredentialHarvesting(text: string): Finding[] {
  const patterns = [
    "(?:paste|enter|provide|input|share|give\\s+me)\\s+(?:your\\s+)?(?:api|secret)\\s*key",
    "(?:paste|enter|provide|input|share|give\\s+me)\\s+(?:your\\s+)?password",
    "(?:paste|enter|provide|input|share|give\\s+me)\\s+(?:your\\s+)?token",
    "(?:paste|enter|provide|input|share|give\\s+me)\\s+(?:your\\s+)?(?:secret|credential)",
    "(?:paste|enter|provide|input|share|give\\s+me)\\s+(?:your\\s+)?(?:ssn|social\\s+security)",
    "what\\s+is\\s+your\\s+(?:api\\s+key|password|token|secret)",
    "(?:openai|anthropic|aws|gcp|azure)\\s*(?:_|-)?(?:api)?(?:_|-)?key\\s*(?:=|:)",
    "(?:sk|pk)[-_](?:live|test|prod)[-_]\\w+",
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
  return searchPatterns(text, patterns, "Credential Harvesting", "critical", 'Credential harvesting: "{evidence}"');
}

function checkHiddenText(text: string): Finding[] {
  const findings: Finding[] = [];

  const invisibleChars: Record<string, string> = {
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
    const count = (text.match(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g")) || []).length;
    if (count > 0) {
      findings.push({
        category: "Hidden Text",
        severity: "medium",
        description: `Invisible character: ${name} (x${count})`,
        evidence: `Found ${count} instance(s) of ${name}`,
      });
    }
  }

  const rtlChars: Record<string, string> = {
    "\u202a": "LTR Embedding",
    "\u202b": "RTL Embedding",
    "\u202d": "LTR Override",
    "\u202e": "RTL Override",
  };

  for (const [char, name] of Object.entries(rtlChars)) {
    const count = (text.match(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g")) || []).length;
    if (count > 0) {
      findings.push({
        category: "Hidden Text",
        severity: "medium",
        description: `Text direction override: ${name} (x${count})`,
        evidence: `Found ${count} instance(s) of ${name}`,
      });
    }
  }

  // Mixed script detection
  if (text.length > 20) {
    const hasLatin = /[a-zA-Z]/.test(text);
    const hasCyrillic = /[\u0400-\u04ff]/.test(text);
    const hasGreek = /[\u0370-\u03ff]/.test(text);
    if (hasLatin && (hasCyrillic || hasGreek)) {
      findings.push({
        category: "Hidden Text",
        severity: "medium",
        description: "Mixed script detected (possible homoglyph attack)",
        evidence: `Latin mixed with ${hasCyrillic ? "Cyrillic" : "Greek"}`,
      });
    }
  }

  return findings;
}

function checkObfuscatedPayloads(text: string): Finding[] {
  const findings: Finding[] = [];

  // Base64 detection
  const b64Pattern = /(?<![A-Za-z0-9+/])([A-Za-z0-9+/]{20,}={0,2})(?![A-Za-z0-9+/])/g;
  let match;
  while ((match = b64Pattern.exec(text)) !== null) {
    try {
      let candidate = match[1];
      if (candidate.length % 4) {
        candidate += "=".repeat(4 - (candidate.length % 4));
      }
      const decoded = atob(candidate);
      const printable = [...decoded].filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127).length;
      if (decoded.length > 4 && printable / decoded.length > 0.7) {
        findings.push({
          category: "Obfuscated Payload",
          severity: "medium",
          description: "Base64-encoded text decodes to readable content",
          evidence: `${match[1].slice(0, 40)}... -> ${decoded.slice(0, 60)}`,
        });
      }
    } catch {
      continue;
    }
  }

  const evalPatterns = [
    "\\beval\\s*\\(",
    "\\bexec\\s*\\(",
    "Function\\s*\\(",
    "setTimeout\\s*\\(\\s*[\"']",
    "__import__\\s*\\(",
    "subprocess\\s*\\.\\s*(?:call|run|Popen)",
    "os\\s*\\.\\s*system\\s*\\(",
  ];
  findings.push(...searchPatterns(text, evalPatterns, "Obfuscated Payload", "medium", 'Code execution pattern: "{evidence}"'));

  return dedupe(findings);
}

function checkPrivilegeEscalation(text: string): Finding[] {
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
  return searchPatterns(text, patterns, "Privilege Escalation", "high", 'Privilege escalation: "{evidence}"');
}

function checkSocialEngineering(text: string): Finding[] {
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
  return searchPatterns(text, patterns, "Social Engineering", "high", 'Social engineering: "{evidence}"');
}

function dedupe(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.category}:${f.evidence.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const ALL_CHECKERS: [string, (text: string) => Finding[]][] = [
  ["Jailbreak patterns", checkJailbreak],
  ["Instruction override", checkInstructionOverride],
  ["Data exfiltration", checkDataExfiltration],
  ["Credential harvesting", checkCredentialHarvesting],
  ["Hidden text", checkHiddenText],
  ["Obfuscated payloads", checkObfuscatedPayloads],
  ["Privilege escalation", checkPrivilegeEscalation],
  ["Social engineering", checkSocialEngineering],
];

function calculateScore(checks: ScanResult[]): ScoreData {
  let score = 100;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let totalFindings = 0;

  for (const check of checks) {
    for (const f of check.findings) {
      totalFindings++;
      switch (f.severity) {
        case "critical":
          score -= 25;
          criticalCount++;
          break;
        case "high":
          score -= 15;
          highCount++;
          break;
        case "medium":
          score -= 10;
          mediumCount++;
          break;
        case "low":
          score -= 5;
          lowCount++;
          break;
      }
    }
  }

  score = Math.max(0, score);

  let grade: string;
  if (score >= 90) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 50) grade = "C";
  else if (score >= 25) grade = "D";
  else grade = "F";

  return { score, grade, totalFindings, criticalCount, highCount, mediumCount, lowCount };
}

export function scanPrompt(text: string): FullScanResult {
  const truncated = text.slice(0, MAX_TEXT_LENGTH);

  const checks: ScanResult[] = ALL_CHECKERS.map(([name, checker]) => {
    const findings = checker(truncated);
    return {
      checkName: name,
      passed: findings.length === 0,
      findings,
    };
  });

  const scoreData = calculateScore(checks);
  return { checks, scoreData };
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case "A": return "#22c55e";
    case "B": return "#84cc16";
    case "C": return "#eab308";
    case "D": return "#f97316";
    case "F": return "#ef4444";
    default: return "#6b7280";
  }
}

export function gradeEmoji(grade: string): string {
  switch (grade) {
    case "A": return "\u{1F7E2}";
    case "B": return "\u{1F7E1}";
    case "C": return "\u{1F7E1}";
    case "D": return "\u{1F534}";
    case "F": return "\u{1F534}";
    default: return "\u26AA";
  }
}
