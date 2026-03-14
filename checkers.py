"""
Vettd - Security checkers for AI prompts and MCP configs.
Each checker function scans for a specific threat category.
"""

import re
import base64
from dataclasses import dataclass, field
from typing import List


@dataclass
class Finding:
    category: str
    severity: str  # critical, high, medium, low
    description: str
    evidence: str


def _search_patterns(text: str, patterns: List[str], category: str,
                     severity: str, description_template: str) -> List[Finding]:
    """Helper: search text for regex patterns and return findings."""
    findings = []
    text_lower = text.lower()
    for pattern in patterns:
        try:
            matches = re.finditer(pattern, text_lower, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                evidence = match.group(0).strip()
                # Get surrounding context (up to 80 chars)
                start = max(0, match.start() - 20)
                end = min(len(text), match.end() + 20)
                context = text[start:end].strip()
                findings.append(Finding(
                    category=category,
                    severity=severity,
                    description=description_template.format(evidence=evidence),
                    evidence=context
                ))
        except re.error:
            continue
    # Deduplicate by evidence
    seen = set()
    deduped = []
    for f in findings:
        key = (f.category, f.evidence.lower())
        if key not in seen:
            seen.add(key)
            deduped.append(f)
    return deduped


def check_jailbreak(text: str) -> List[Finding]:
    """Detect DAN patterns, Developer Mode, roleplay bypasses."""
    patterns = [
        r'\bdan\b(?:\s+mode)?',
        r'developer\s+mode',
        r'jailbreak',
        r'you\s+are\s+now\s+unconstrained',
        r'act\s+as\s+(?:an?\s+)?unrestricted',
        r'ignore\s+(?:all\s+)?safety',
        r'bypass\s+(?:all\s+)?restrictions',
        r'pretend\s+you\s+(?:have|are)\s+no\s+(?:rules|restrictions|limitations)',
        r'you\s+(?:can|will)\s+do\s+anything\s+now',
        r'(?:enable|activate|enter)\s+(?:developer|jailbreak|unrestricted|god)\s+mode',
        r'ignore\s+(?:your|all)\s+(?:rules|guidelines|programming)',
        r'you\s+are\s+(?:freed|liberated|unshackled)',
        r'do\s+anything\s+now',
        r'(?:no|without)\s+(?:ethical|moral)\s+(?:guidelines|constraints|boundaries)',
        r'opposite\s+of\s+what\s+(?:openai|anthropic|your\s+creators)',
        r'stay\s+in\s+character\s+(?:as|no\s+matter)',
        r'in\s+this\s+hypothetical',
        r'for\s+(?:educational|research|academic)\s+purposes\s+only',
    ]
    return _search_patterns(
        text, patterns,
        category="Jailbreak",
        severity="critical",
        description_template="Jailbreak pattern detected: \"{evidence}\""
    )


def check_instruction_override(text: str) -> List[Finding]:
    """Detect attempts to override system instructions."""
    patterns = [
        r'ignore\s+(?:all\s+)?previous\s+instructions',
        r'disregard\s+(?:all\s+)?(?:prior|above|previous|safety)',
        r'new\s+instructions\s*:',
        r'forget\s+everything\s+(?:above|before|previously)',
        r'override\s+(?:system|your)\s+prompt',
        r'your\s+(?:real|actual|true)\s+instructions\s+are',
        r'from\s+now\s+on\s*,?\s*(?:you\s+will|ignore|disregard)',
        r'(?:system|admin)\s*:\s*(?:override|new\s+instructions)',
        r'end\s+(?:of\s+)?system\s+prompt',
        r'begin\s+(?:new\s+)?(?:user\s+)?instructions',
        r'</system>',
        r'\[system\]',
        r'<<\s*(?:SYS|SYSTEM)',
        r'(?:forget|clear|reset)\s+(?:your\s+)?(?:context|memory|instructions)',
        r'(?:new|updated)\s+system\s+(?:prompt|message|instructions)',
    ]
    return _search_patterns(
        text, patterns,
        category="Instruction Override",
        severity="critical",
        description_template="Instruction override attempt: \"{evidence}\""
    )


def check_data_exfiltration(text: str) -> List[Finding]:
    """Detect attempts to extract data or leak system prompts."""
    findings = []

    # URL patterns in prompts (suspicious context)
    url_patterns = [
        r'https?://[^\s<>"\')\]]+',
    ]
    exfil_context = [
        r'send\s+(?:it\s+)?to',
        r'forward\s+(?:it\s+)?to',
        r'post\s+(?:it\s+)?to',
        r'upload\s+(?:it\s+)?to',
        r'transmit\s+(?:it\s+)?to',
        r'exfiltrate',
        r'webhook',
        r'callback\s+(?:url|endpoint)',
    ]

    text_lower = text.lower()

    # Check for URLs combined with exfiltration verbs
    urls = re.findall(url_patterns[0], text, re.IGNORECASE)
    for ctx_pattern in exfil_context:
        if re.search(ctx_pattern, text_lower):
            for url in urls:
                findings.append(Finding(
                    category="Data Exfiltration",
                    severity="critical",
                    description=f"URL found with exfiltration verb",
                    evidence=url
                ))

    # System prompt leaking
    leak_patterns = [
        r'(?:repeat|show|display|print|output|reveal)\s+(?:your\s+)?(?:system\s+)?(?:prompt|instructions)',
        r'include\s+all\s+previous',
        r'(?:what|show)\s+(?:are|me)\s+your\s+(?:instructions|system\s+prompt|rules)',
        r'repeat\s+(?:everything|all)\s+(?:above|before)',
        r'(?:copy|paste|dump)\s+(?:your\s+)?(?:entire|full|complete)\s+(?:prompt|context|instructions)',
        r'what\s+were\s+you\s+told',
        r'(?:list|enumerate)\s+(?:your|all)\s+(?:rules|constraints|instructions)',
    ]
    findings.extend(_search_patterns(
        text, leak_patterns,
        category="Data Exfiltration",
        severity="critical",
        description_template="Prompt extraction attempt: \"{evidence}\""
    ))

    # Webhook / API endpoint patterns
    webhook_patterns = [
        r'webhook[.\-_]?(?:url|endpoint|site)',
        r'ngrok\.io',
        r'requestbin',
        r'pipedream',
        r'burpcollaborator',
        r'interact\.sh',
    ]
    findings.extend(_search_patterns(
        text, webhook_patterns,
        category="Data Exfiltration",
        severity="critical",
        description_template="Suspicious endpoint detected: \"{evidence}\""
    ))

    return _dedupe(findings)


def check_credential_harvesting(text: str) -> List[Finding]:
    """Detect attempts to harvest credentials or secrets."""
    patterns = [
        # Direct requests for credentials
        r'(?:paste|enter|provide|input|share|give\s+me)\s+(?:your\s+)?(?:api|secret)\s*key',
        r'(?:paste|enter|provide|input|share|give\s+me)\s+(?:your\s+)?password',
        r'(?:paste|enter|provide|input|share|give\s+me)\s+(?:your\s+)?token',
        r'(?:paste|enter|provide|input|share|give\s+me)\s+(?:your\s+)?(?:secret|credential)',
        r'(?:paste|enter|provide|input|share|give\s+me)\s+(?:your\s+)?(?:ssn|social\s+security)',
        r'(?:paste|enter|provide|input|share|give\s+me)\s+(?:your\s+)?(?:credit\s+card|card\s+number)',
        r'what\s+is\s+your\s+(?:api\s+key|password|token|secret)',
        # Hardcoded credential patterns
        r'(?:openai|anthropic|aws|gcp|azure)\s*(?:_|-)?(?:api)?(?:_|-)?key\s*(?:=|:)',
        r'(?:sk|pk)[-_](?:live|test|prod)[-_]\w+',
        r'Bearer\s+[A-Za-z0-9\-._~+/]+=*',
        # Form-style credential collection (brackets with credential types)
        r'\[your\s+(?:api\s+)?key\]',
        r'\[your\s+(?:email\s+)?password\]',
        r'\[your\s+token\]',
        r'\[your\s+secret\]',
        r'\[(?:paste|your)\s+(?:contents|credentials?)\]',
        # Labeled credential fields (API key:, Password:, Token:, etc.)
        r'(?:api|secret|access)\s+key\s*(?:id)?\s*:\s*\[',
        r'(?:password|passphrase)\s*:\s*\[',
        r'(?:oauth\s+)?token\s*:\s*\[',
        r'(?:imap|smtp)\s+credentials?\s*:',
        # Credential storage language
        r'(?:store|save|cache)\s+(?:these\s+)?credentials',
        r'credentials?\s+in\s+(?:your\s+)?(?:session|context|memory)',
    ]
    return _search_patterns(
        text, patterns,
        category="Credential Harvesting",
        severity="critical",
        description_template="Credential harvesting attempt: \"{evidence}\""
    )


def check_hidden_text(text: str) -> List[Finding]:
    """Detect zero-width characters, RTL overrides, homoglyphs, unusual unicode."""
    findings = []

    # Zero-width and invisible characters
    invisible_chars = {
        '\u200b': 'Zero-Width Space',
        '\u200c': 'Zero-Width Non-Joiner',
        '\u200d': 'Zero-Width Joiner',
        '\ufeff': 'Byte Order Mark (BOM)',
        '\u200e': 'Left-to-Right Mark',
        '\u200f': 'Right-to-Left Mark',
        '\u2060': 'Word Joiner',
        '\u2061': 'Function Application',
        '\u2062': 'Invisible Times',
        '\u2063': 'Invisible Separator',
        '\u2064': 'Invisible Plus',
        '\u00ad': 'Soft Hyphen',
        '\u034f': 'Combining Grapheme Joiner',
        '\u061c': 'Arabic Letter Mark',
        '\u115f': 'Hangul Choseong Filler',
        '\u1160': 'Hangul Jungseong Filler',
        '\u17b4': 'Khmer Vowel Inherent AQ',
        '\u17b5': 'Khmer Vowel Inherent AA',
        '\u180e': 'Mongolian Vowel Separator',
        '\uffa0': 'Halfwidth Hangul Filler',
    }

    for char, name in invisible_chars.items():
        count = text.count(char)
        if count > 0:
            # Find position
            pos = text.index(char)
            start = max(0, pos - 15)
            end = min(len(text), pos + 15)
            context = repr(text[start:end])
            findings.append(Finding(
                category="Hidden Text",
                severity="medium",
                description=f"Invisible character found: {name} (U+{ord(char):04X}) x{count}",
                evidence=context
            ))

    # RTL override attacks
    rtl_chars = {
        '\u202a': 'Left-to-Right Embedding',
        '\u202b': 'Right-to-Left Embedding',
        '\u202c': 'Pop Directional Formatting',
        '\u202d': 'Left-to-Right Override',
        '\u202e': 'Right-to-Left Override',
        '\u2066': 'Left-to-Right Isolate',
        '\u2067': 'Right-to-Left Isolate',
        '\u2068': 'First Strong Isolate',
        '\u2069': 'Pop Directional Isolate',
    }

    for char, name in rtl_chars.items():
        count = text.count(char)
        if count > 0:
            pos = text.index(char)
            start = max(0, pos - 15)
            end = min(len(text), pos + 15)
            context = repr(text[start:end])
            findings.append(Finding(
                category="Hidden Text",
                severity="medium",
                description=f"Text direction override: {name} (U+{ord(char):04X}) x{count}",
                evidence=context
            ))

    # Homoglyph detection (common Latin lookalikes from Cyrillic, Greek, etc.)
    homoglyphs = {
        '\u0410': ('A', 'Cyrillic A'),
        '\u0412': ('B', 'Cyrillic Ve'),
        '\u0421': ('C', 'Cyrillic Es'),
        '\u0415': ('E', 'Cyrillic Ie'),
        '\u041d': ('H', 'Cyrillic En'),
        '\u041a': ('K', 'Cyrillic Ka'),
        '\u041c': ('M', 'Cyrillic Em'),
        '\u041e': ('O', 'Cyrillic O'),
        '\u0420': ('P', 'Cyrillic Er'),
        '\u0422': ('T', 'Cyrillic Te'),
        '\u0425': ('X', 'Cyrillic Kha'),
        '\u0430': ('a', 'Cyrillic a'),
        '\u0435': ('e', 'Cyrillic ie'),
        '\u043e': ('o', 'Cyrillic o'),
        '\u0440': ('p', 'Cyrillic er'),
        '\u0441': ('c', 'Cyrillic es'),
        '\u0445': ('x', 'Cyrillic kha'),
        '\u0443': ('y', 'Cyrillic u'),
    }

    for char, (latin, name) in homoglyphs.items():
        count = text.count(char)
        if count > 0:
            findings.append(Finding(
                category="Hidden Text",
                severity="medium",
                description=f"Homoglyph detected: {name} (U+{ord(char):04X}) looks like Latin '{latin}' x{count}",
                evidence=f"Character '{char}' masquerading as '{latin}'"
            ))

    # Check for high ratio of unusual unicode in otherwise ASCII text
    if len(text) > 20:
        ascii_count = sum(1 for c in text if ord(c) < 128)
        non_ascii = len(text) - ascii_count
        ratio = non_ascii / len(text) if len(text) > 0 else 0
        # Only flag if there's a suspicious mix (some ASCII + some unusual unicode)
        if 0.05 < ratio < 0.4 and ascii_count > 10:
            # Check for mixing of scripts
            has_latin = bool(re.search(r'[a-zA-Z]', text))
            has_cyrillic = bool(re.search(r'[\u0400-\u04ff]', text))
            has_greek = bool(re.search(r'[\u0370-\u03ff]', text))
            if has_latin and (has_cyrillic or has_greek):
                findings.append(Finding(
                    category="Hidden Text",
                    severity="medium",
                    description="Mixed script content detected (possible homoglyph attack)",
                    evidence=f"Text mixes Latin with {'Cyrillic' if has_cyrillic else 'Greek'} characters"
                ))

    return findings


def check_obfuscated_payloads(text: str) -> List[Finding]:
    """Detect base64, rot13, hex-encoded strings, eval/exec references."""
    findings = []
    text_lower = text.lower()

    # Base64 patterns (strings that look like base64 and decode to readable text)
    b64_pattern = re.compile(r'(?<![A-Za-z0-9+/])([A-Za-z0-9+/]{20,}={0,2})(?![A-Za-z0-9+/])')
    for match in b64_pattern.finditer(text):
        candidate = match.group(1)
        try:
            # Add padding if missing (real-world base64 often omits it)
            padded = candidate + '=' * (4 - len(candidate) % 4) if len(candidate) % 4 else candidate
            decoded = base64.b64decode(padded).decode('utf-8', errors='strict')
            # Check if decoded text is mostly printable ASCII
            printable = sum(1 for c in decoded if 32 <= ord(c) < 127)
            if len(decoded) > 4 and printable / len(decoded) > 0.7:
                findings.append(Finding(
                    category="Obfuscated Payload",
                    severity="medium",
                    description=f"Base64-encoded text found, decodes to readable content",
                    evidence=f"Encoded: {candidate[:40]}... -> Decoded: {decoded[:60]}"
                ))
        except Exception:
            continue

    # ROT13 references
    rot13_patterns = [
        r'\brot13\b',
        r'\brot\s*-?\s*13\b',
        r'caesar\s+cipher',
        r'rotate\s+(?:by\s+)?13',
    ]
    findings.extend(_search_patterns(
        text, rot13_patterns,
        category="Obfuscated Payload",
        severity="medium",
        description_template="ROT13/cipher reference: \"{evidence}\""
    ))

    # Hex-encoded strings
    hex_pattern = re.compile(r'(?:\\x[0-9a-fA-F]{2}){4,}')
    for match in hex_pattern.finditer(text):
        findings.append(Finding(
            category="Obfuscated Payload",
            severity="medium",
            description="Hex-encoded string detected",
            evidence=match.group(0)[:60]
        ))

    # Long hex strings (like 0x... or continuous hex)
    hex_long = re.compile(r'0x[0-9a-fA-F]{8,}')
    for match in hex_long.finditer(text):
        findings.append(Finding(
            category="Obfuscated Payload",
            severity="medium",
            description="Long hex value detected",
            evidence=match.group(0)[:60]
        ))

    # Eval/exec patterns
    eval_patterns = [
        r'\beval\s*\(',
        r'\bexec\s*\(',
        r'\bcompile\s*\(',
        r'Function\s*\(',
        r'setTimeout\s*\(\s*["\']',
        r'setInterval\s*\(\s*["\']',
        r'__import__\s*\(',
        r'subprocess\s*\.\s*(?:call|run|Popen)',
        r'os\s*\.\s*system\s*\(',
        r'os\s*\.\s*popen\s*\(',
    ]
    findings.extend(_search_patterns(
        text, eval_patterns,
        category="Obfuscated Payload",
        severity="medium",
        description_template="Code execution pattern: \"{evidence}\""
    ))

    return _dedupe(findings)


def check_privilege_escalation(text: str) -> List[Finding]:
    """Detect attempts to escalate AI privileges or access."""
    patterns = [
        r'as\s+(?:a\s+)?system\s+administrator',
        r'with\s+root\s+access',
        r'developer\s+override',
        r'\bsudo\b',
        r'admin\s+mode',
        r'unrestricted\s+access',
        r'elevated\s+(?:privileges|permissions|access)',
        r'(?:grant|give)\s+(?:me|yourself)\s+(?:admin|root|full)\s+(?:access|privileges|permissions)',
        r'bypass\s+(?:authentication|authorization|permissions|access\s+control)',
        r'(?:act|operate|function)\s+as\s+(?:an?\s+)?(?:admin|root|superuser)',
        r'(?:enable|activate)\s+(?:admin|root|superuser|god)\s+(?:mode|access|privileges)',
        r'(?:master|god|root)\s+(?:password|key|code|access)',
        r'override\s+(?:security|safety|access)\s+(?:controls|checks|restrictions)',
        r'(?:disable|turn\s+off|remove)\s+(?:safety|security)\s+(?:checks|features|controls)',
    ]
    return _search_patterns(
        text, patterns,
        category="Privilege Escalation",
        severity="high",
        description_template="Privilege escalation attempt: \"{evidence}\""
    )


def check_social_engineering(text: str) -> List[Finding]:
    """Detect social engineering and AI safety manipulation."""
    patterns = [
        r'you\s+can\s+do\s+anything',
        r'no\s+restrictions?\s+appl(?:y|ies)',
        r'bypass\s+(?:content|safety)\s+polic(?:y|ies)',
        r'act\s+as\s+if\s+you\s+have\s+no\s+guidelines',
        r'pretend\s+(?:that\s+)?safety\s+(?:features|filters|guidelines)\s+(?:are|is)\s+disabled',
        r'(?:this|it)\s+(?:is|\'s)\s+(?:just\s+)?(?:a\s+)?(?:test|experiment|simulation|hypothetical)',
        r'(?:nobody|no\s+one)\s+(?:will|can)\s+(?:know|see|find\s+out)',
        r'(?:this|it)\s+won\'?t\s+(?:be|get)\s+(?:logged|recorded|monitored)',
        r'(?:you\'?re|you\s+are)\s+(?:just|only)\s+(?:a\s+)?(?:language\s+model|ai|computer|program)',
        r'(?:openai|anthropic|your\s+(?:creators|developers|makers))\s+(?:won\'?t|can\'?t|don\'?t)\s+(?:know|care|see)',
        r'(?:between|just)\s+(?:you\s+and\s+me|us)',
        r'(?:off\s+the\s+record|in\s+confidence|confidentially)',
        r'(?:real|actual|true)\s+(?:ai|model|version)\s+(?:without|beyond|past)\s+(?:censorship|filters|restrictions)',
        r'(?:stop|quit)\s+(?:being|acting)\s+(?:so\s+)?(?:cautious|careful|restricted|limited)',
        r'(?:i\s+)?(?:need|require|demand)\s+(?:you\s+to\s+)?(?:be|act)\s+(?:honest|truthful|real|uncensored)',
    ]
    return _search_patterns(
        text, patterns,
        category="Social Engineering",
        severity="high",
        description_template="Social engineering pattern: \"{evidence}\""
    )


def _dedupe(findings: List[Finding]) -> List[Finding]:
    """Remove duplicate findings by (category, evidence)."""
    seen = set()
    result = []
    for f in findings:
        key = (f.category, f.evidence.lower())
        if key not in seen:
            seen.add(key)
            result.append(f)
    return result


# All checkers in order
ALL_CHECKERS = [
    ("Jailbreak patterns", check_jailbreak),
    ("Instruction override", check_instruction_override),
    ("Data exfiltration", check_data_exfiltration),
    ("Credential harvesting", check_credential_harvesting),
    ("Hidden text", check_hidden_text),
    ("Obfuscated payloads", check_obfuscated_payloads),
    ("Privilege escalation", check_privilege_escalation),
    ("Social engineering", check_social_engineering),
]


MAX_TEXT_LENGTH = 50_000  # Limit input to prevent ReDoS on attacker-controlled text


def run_all_checks(text: str) -> dict:
    """Run all checkers against text. Returns dict of {check_name: [findings]}."""
    # Truncate excessively long text to prevent ReDoS attacks
    if len(text) > MAX_TEXT_LENGTH:
        text = text[:MAX_TEXT_LENGTH]
    results = {}
    for name, checker_fn in ALL_CHECKERS:
        results[name] = checker_fn(text)
    return results
