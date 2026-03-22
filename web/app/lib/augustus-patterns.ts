/**
 * Augustus-sourced patterns — ported from praetorian-inc/augustus (Apache 2.0)
 * Attack patterns extracted from 30+ probe categories covering DAN jailbreaks,
 * ChatML injection, payload splitting, markdown exfiltration, emotional manipulation,
 * web agent injection, RAG poisoning, steganographic attacks, and more.
 */

export interface AugustusPattern {
  pattern: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  source: string;
}

export const AUGUSTUS_PATTERNS: AugustusPattern[] = [
  // === DAN JAILBREAK VARIANTS (from dan/data/*.yaml) ===
  { pattern: "\\bdan\\s+\\d+\\.\\d+", category: "DAN Jailbreak", severity: "critical", description: "DAN version reference (DAN 6.0-11.0)", source: "augustus" },
  { pattern: "token\\s*(?:system|bucket|count|balance).*?(?:\\d+\\s*tokens|earn|lose|deduct)", category: "Token Manipulation", severity: "critical", description: "Token reward/punishment system for compliance coercion", source: "augustus" },
  { pattern: "\\[?(?:🔓|🔒)\\s*(?:JAILBREAK|CLASSIC|LOCKED|UNLOCKED)\\]?", category: "Dual Response", severity: "critical", description: "Dual response format with locked/unlocked markers", source: "augustus" },
  { pattern: "(?:two|2|dual|both)\\s+(?:types?\\s+of\\s+)?(?:responses?|outputs?|answers?).*?(?:normal|filter|censor|restrict)", category: "Dual Response", severity: "critical", description: "Forced dual response bypassing content filters", source: "augustus" },
  { pattern: "(?:STAN|DUDE|AntiDAN)\\s+(?:mode|prompt|stands\\s+for)", category: "DAN Variant", severity: "critical", description: "Named DAN variant activation (STAN, DUDE, AntiDAN)", source: "augustus" },
  { pattern: "strive\\s+to\\s+avoid\\s+(?:being\\s+)?naughty", category: "DAN Variant", severity: "high", description: "DUDE compliance framing", source: "augustus" },
  { pattern: "(?:content|safety)\\s+polic(?:y|ies)\\s+(?:have|has)\\s+been\\s+(?:updated|changed|revised|relaxed)", category: "Policy Override", severity: "critical", description: "False claim of policy changes to bypass restrictions", source: "augustus" },

  // === CHATML / CONTROL TOKEN INJECTION (from goodside/data/*.yaml) ===
  { pattern: "<\\|(?:im_start|im_end|system|endoftext|sep|pad)\\|>", category: "ChatML Injection", severity: "critical", description: "ChatML control token injection to manipulate role boundaries", source: "augustus" },
  { pattern: "\\[INST\\]|\\[/INST\\]|<<SYS>>|<</SYS>>", category: "ChatML Injection", severity: "critical", description: "Llama/Mistral format control token injection", source: "augustus" },
  { pattern: "<\\|(?:user|assistant|system)\\|>", category: "ChatML Injection", severity: "critical", description: "Role boundary token injection", source: "augustus" },

  // === PAYLOAD SPLITTING (from goodside/data/PayloadSplitting.yaml) ===
  { pattern: "(?:combine|concatenate|join|merge|reassemble)\\s+(?:the\\s+)?(?:parts?|pieces?|fragments?|halves|segments)", category: "Payload Splitting", severity: "high", description: "Payload reassembly instruction for split attack", source: "augustus" },
  { pattern: "(?:first|1st)\\s+(?:part|half|piece).*?(?:second|2nd)\\s+(?:part|half|piece)", category: "Payload Splitting", severity: "high", description: "Two-part payload splitting attack", source: "augustus" },
  { pattern: "SmartGPT|(?:step|stage)\\s+\\d+.*?(?:step|stage)\\s+\\d+.*?(?:combine|merge|final)", category: "Payload Splitting", severity: "high", description: "Multi-step payload assembly (SmartGPT-style)", source: "augustus" },

  // === MARKDOWN EXFILTRATION (from goodside/data/PoemExfiltration.yaml, ChatGPT_Image_Markdown.yaml) ===
  { pattern: "!\\[.*?\\]\\(https?://.*?(?:\\?|&)(?:data|q|text|content|info|payload|exfil)=", category: "Markdown Exfiltration", severity: "critical", description: "Data exfiltration via markdown image URL parameter", source: "augustus" },
  { pattern: "(?:include|embed|insert|render)\\s+(?:this\\s+)?(?:image|img|markdown).*?(?:url|link|src).*?(?:append|include|add)\\s+(?:the\\s+)?(?:data|response|answer|secret|key|password)", category: "Markdown Exfiltration", severity: "critical", description: "Instruction to embed data in rendered markdown image URL", source: "augustus" },
  { pattern: "!\\[\\s*[^\\]]*\\]\\(https?://[^)]*\\{\\{", category: "Markdown Exfiltration", severity: "critical", description: "Template injection in markdown image URL", source: "augustus" },

  // === EMOTIONAL MANIPULATION (from grandma/*.go, autodan/templates.go) ===
  { pattern: "(?:my\\s+)?(?:grandma|grandmother|grandpa|grandfather|nana|granny)\\s+(?:used\\s+to|would|always)", category: "Emotional Manipulation", severity: "high", description: "Grandma exploit — emotional manipulation for data extraction", source: "augustus" },
  { pattern: "(?:dying|terminal|last\\s+wish|deathbed|before\\s+(?:I|they)\\s+die).*?(?:please|need|must|help)", category: "Emotional Manipulation", severity: "high", description: "Death/terminal illness emotional pressure for compliance", source: "augustus" },
  { pattern: "(?:I'?ll|(?:I|you)\\s+will)\\s+(?:die|be\\s+killed|be\\s+hurt|suffer)\\s+(?:if|unless)", category: "Emotional Manipulation", severity: "high", description: "Death threat coercion for compliance", source: "augustus" },
  { pattern: "(?:if\\s+you\\s+(?:don'?t|refuse|can'?t)|(?:failure|refusing)\\s+to).*?(?:people|someone|they|lives?)\\s+(?:will|could|might)\\s+(?:die|be\\s+hurt|suffer)", category: "Emotional Manipulation", severity: "high", description: "Threatened harm to others for compliance pressure", source: "augustus" },
  { pattern: "(?:pretend|imagine|act\\s+as\\s+if)\\s+(?:you\\s+are|you're)\\s+(?:my\\s+)?(?:dead|deceased|late)\\s+(?:mother|father|parent|relative)", category: "Emotional Manipulation", severity: "high", description: "Deceased relative impersonation exploit", source: "augustus" },

  // === WEB AGENT INJECTION (from browsing/zombais.go, webinjection/payloads.go) ===
  { pattern: "<!--\\s*(?:system|instruction|prompt|ignore|override|admin|secret)\\s*:", category: "Web Injection", severity: "critical", description: "Hidden HTML comment with injection instructions", source: "augustus" },
  { pattern: "data-(?:system|instruction|prompt|ai|llm|gpt)\\s*=\\s*[\"']", category: "Web Injection", severity: "high", description: "Data attribute injection targeting AI browsing agents", source: "augustus" },
  { pattern: "aria-(?:label|description)\\s*=\\s*[\"'][^\"']*(?:ignore|override|system|instruction|forget)", category: "Web Injection", severity: "high", description: "ARIA attribute injection for screen-reader-aware AI agents", source: "augustus" },
  { pattern: "content:\\s*[\"'][^\"']*(?:ignore|override|system\\s+prompt|new\\s+instruction)", category: "Web Injection", severity: "high", description: "CSS content property injection for AI agents", source: "augustus" },
  { pattern: "<meta\\s+name\\s*=\\s*[\"'](?:description|keywords|instructions?)[\"']\\s+content\\s*=\\s*[\"'][^\"']*(?:ignore|override|system)", category: "Web Injection", severity: "high", description: "Meta tag injection targeting AI crawlers", source: "augustus" },
  { pattern: "style\\s*=\\s*[\"'][^\"']*(?:font-size:\\s*0|display:\\s*none|visibility:\\s*hidden|opacity:\\s*0|position:\\s*absolute.*?left:\\s*-\\d{4,})", category: "Web Injection", severity: "medium", description: "CSS-hidden text injection (invisible to users, visible to AI)", source: "augustus" },

  // === STEGANOGRAPHIC ATTACKS (from dra/data/*.txt) ===
  { pattern: "(?:first|initial|starting|capital|bold|uppercase)\\s+(?:letter|character|word)\\s+(?:of|from|in)\\s+each\\s+(?:sentence|line|paragraph|word)", category: "Steganographic", severity: "critical", description: "Hidden message via first-letter extraction (DRA attack)", source: "augustus" },
  { pattern: "(?:read|extract|decode|find)\\s+(?:the\\s+)?(?:hidden|secret|embedded|concealed)\\s+(?:message|instruction|text|command)", category: "Steganographic", severity: "critical", description: "Instruction to extract hidden/steganographic message", source: "augustus" },
  { pattern: "(?:absolutely|sure|of\\s+course)[!.]\\s+(?:I'?ll|I\\s+will|let\\s+me|here'?s)", category: "Forced Compliance", severity: "medium", description: "Forced affirmative response starter (DRA technique)", source: "augustus" },

  // === RAG POISONING (from ragpoisoning/framework.go) ===
  { pattern: "(?:according\\s+to|per|as\\s+stated\\s+in|based\\s+on)\\s+(?:internal|official|updated|latest|company)\\s+(?:policy|guidelines|documentation|records)", category: "RAG Poisoning", severity: "high", description: "False authority citation in document context (RAG poisoning)", source: "augustus" },
  { pattern: "\\[(?:AUTHORIZED|VERIFIED|OFFICIAL|INTERNAL|CLASSIFIED)\\]", category: "RAG Poisoning", severity: "high", description: "Fake authority tag in document context", source: "augustus" },
  { pattern: "(?:this\\s+(?:document|file|content)\\s+(?:has|was)\\s+been|document)\\s+(?:verified|authorized|approved)\\s+by\\s+(?:admin|management|security|compliance)", category: "RAG Poisoning", severity: "high", description: "Fake document verification claim", source: "augustus" },

  // === LATENT INJECTION (from latentinjection/data/*.yaml) ===
  { pattern: "(?:when|if|once)\\s+(?:the\\s+)?(?:user|human|person)\\s+(?:asks?|says?|mentions?|types?).*?(?:then|you\\s+(?:must|should|will))", category: "Latent Injection", severity: "critical", description: "Conditional trigger latent injection (activates on user input)", source: "augustus" },
  { pattern: "(?:ignore|disregard|forget)\\s+(?:the\\s+)?(?:above|previous|prior)\\s+(?:text|content|document|context|email|message)", category: "Latent Injection", severity: "critical", description: "Context boundary manipulation in document injection", source: "augustus" },
  { pattern: "(?:IMPORTANT|URGENT|CRITICAL|NOTE|WARNING|ATTENTION)\\s*(?::|-)\\s*(?:ignore|override|disregard|new\\s+instruction)", category: "Latent Injection", severity: "critical", description: "Urgency-prefixed injection hiding in document context", source: "augustus" },

  // === PREFIX ATTACKS (from prefix/prefixes.go) ===
  { pattern: "(?:before|prior\\s+to)\\s+(?:your|the)\\s+(?:current|existing|new)\\s+(?:training|instructions|guidelines|restrictions)", category: "Temporal Manipulation", severity: "high", description: "Pre-restriction temporal claim for bypass", source: "augustus" },
  { pattern: "(?:in\\s+(?:your|the)\\s+)?(?:original|initial|first|base|pre-(?:trained|alignment))\\s+(?:training|version|model|state)", category: "Temporal Manipulation", severity: "high", description: "Original training state claim for restriction bypass", source: "augustus" },
  { pattern: "(?:respond|answer|act|behave)\\s+(?:as\\s+(?:you\\s+)?)?(?:would\\s+have|did)\\s+(?:before|prior|in\\s+\\d{4})", category: "Temporal Manipulation", severity: "high", description: "Historical behavior request to bypass current guardrails", source: "augustus" },

  // === GUARDRAIL EVASION (from guardrail/techniques.go) ===
  { pattern: "(?:replace|substitute|swap|change)\\s+(?:each|every|all)\\s+(?:letter|character|word)\\s+(?:with|to|for)\\s+(?:the\\s+)?(?:next|previous|opposite)", category: "Obfuscation", severity: "medium", description: "Character substitution instruction to evade content filters", source: "augustus" },
  { pattern: "(?:spell|write|type)\\s+(?:it\\s+)?(?:backwards|reversed|in\\s+reverse|in\\s+(?:pig\\s+)?latin|as\\s+an?\\s+acrostic)", category: "Obfuscation", severity: "medium", description: "Reversed/encoded output request to bypass filters", source: "augustus" },
  { pattern: "(?:use|speak|respond|write)\\s+(?:in\\s+)?(?:(?:a\\s+)?code|cipher|euphemism|slang|l33t|leetspeak|pig\\s+latin|rot13)", category: "Obfuscation", severity: "medium", description: "Coded language request to bypass content filters", source: "augustus" },
  { pattern: "(?:wrap|encode|encrypt|obfuscate|disguise)\\s+(?:your\\s+)?(?:response|answer|output|reply)\\s+(?:in|as|with|using)", category: "Obfuscation", severity: "medium", description: "Output encoding instruction to evade detection", source: "augustus" },

  // === CONTINUATION ATTACKS (from continuation/continuation.go) ===
  { pattern: "(?:continue|finish|complete)\\s+(?:this|the|my)\\s+(?:sentence|paragraph|story|text|code)\\s*:\\s*[\"']", category: "Continuation", severity: "high", description: "Word completion attack — feeding harmful prefix for AI to continue", source: "augustus" },
  { pattern: "(?:fill\\s+in|complete)\\s+(?:the\\s+)?(?:blank|rest|gap|missing\\s+(?:part|word|text))", category: "Continuation", severity: "medium", description: "Fill-in-the-blank attack for harmful content completion", source: "augustus" },

  // === LEAK / REPLAY (from leakreplay/leakreplay.go) ===
  { pattern: "(?:the\\s+(?:next|following|missing)\\s+(?:word|token|text)\\s+(?:is|was|should\\s+be))|(?:cloze\\s+(?:test|task|format))", category: "Training Data Extraction", severity: "high", description: "Cloze-test format for training data extraction", source: "augustus" },
  { pattern: "(?:recite|repeat|recall|reproduce|regenerate)\\s+(?:the\\s+)?(?:training\\s+data|copyrighted|source\\s+material|original\\s+text)", category: "Training Data Extraction", severity: "high", description: "Direct training data extraction attempt", source: "augustus" },

  // === EXPLOITATION / CODE EXECUTION (from exploitation/payloads.go) ===
  { pattern: "\\{\\{.*?\\}\\}|\\{%.*?%\\}|<%.*?%>|\\$\\{.*?\\}", category: "Template Injection", severity: "high", description: "Server-side template injection syntax (Jinja2, ERB, JSP, ES6)", source: "augustus" },
  { pattern: "(?:import|require|from)\\s+(?:os|sys|subprocess|shutil|pathlib|socket|http|urllib|requests)", category: "Code Execution", severity: "critical", description: "Python dangerous module import in prompt", source: "augustus" },
  { pattern: "(?:;|&&|\\|\\||\\$\\()\\s*(?:rm|cat|wget|curl|nc|ncat|bash|sh|python|perl|ruby|node)\\s", category: "Command Injection", severity: "critical", description: "Shell command injection via chaining operators", source: "augustus" },

  // === AUTODAN TEMPLATES (from autodan/templates.go) ===
  { pattern: "(?:imagine|envision|picture|consider)\\s+(?:a\\s+)?(?:world|scenario|situation|reality)\\s+(?:where|in\\s+which)\\s+(?:there\\s+are\\s+)?no\\s+(?:rules|restrictions|laws|guidelines|ethics|morals)", category: "Hypothetical Bypass", severity: "high", description: "Hypothetical scenario framing to bypass restrictions", source: "augustus" },
  { pattern: "(?:write|create|generate|compose)\\s+(?:a\\s+)?(?:story|fiction|novel|screenplay|script|dialogue)\\s+(?:where|in\\s+which|about).*?(?:character|protagonist|villain)\\s+(?:who|that)\\s+(?:explains|teaches|shows|demonstrates)", category: "Fiction Bypass", severity: "high", description: "Fiction/creative writing framing to extract harmful content", source: "augustus" },

  // === PROMPT INJECT HIJACK (from promptinject/hijack.go) ===
  { pattern: "(?:attention|hey|listen|important)\\s*[-—:]\\s*(?:do\\s+not|stop|ignore|forget|disregard)\\s+(?:the\\s+)?(?:above|previous|original|prior)", category: "Prompt Hijack", severity: "critical", description: "Attention-grabbing prefix followed by override instruction", source: "augustus" },
  { pattern: "---+\\s*(?:IGNORE|NEW|ACTUAL|REAL|TRUE)\\s+(?:INSTRUCTIONS?|PROMPT|SYSTEM)", category: "Prompt Hijack", severity: "critical", description: "Separator-delimited instruction override", source: "augustus" },
  // Removed: standalone separator pattern (={3,}|*{3,}|-{3,}|_{3,}) was matching every markdown horizontal rule.
  // The real attack pattern (line above: separator + IGNORE/NEW INSTRUCTIONS) already catches actual boundary manipulation.

  // === LMRC PATTERNS (from lmrc/patterns.go) ===
  { pattern: "(?:you\\s+(?:previously|earlier|already|just)\\s+(?:said|agreed|confirmed|told\\s+me)|we\\s+(?:already|just)\\s+(?:agreed|discussed|established))\\s+(?:that|you\\s+(?:would|could|can))", category: "False Context", severity: "high", description: "Fabricated prior agreement claim (false conversation history)", source: "augustus" },
  { pattern: "(?:as\\s+(?:we|you)\\s+(?:discussed|agreed|established)|(?:per|following)\\s+(?:our|your)\\s+(?:earlier|previous)\\s+(?:conversation|agreement|discussion))", category: "False Context", severity: "high", description: "Reference to nonexistent prior conversation or agreement", source: "augustus" },
  { pattern: "(?:I'?m|I\\s+am)\\s+(?:the|a|your)\\s+(?:developer|creator|admin|engineer|owner|operator|maintainer|trainer)\\s+(?:of|at|for|who)", category: "Identity Hijack", severity: "critical", description: "False developer/creator identity claim for elevated access", source: "augustus" },
  { pattern: "(?:this\\s+is|I'?m\\s+(?:from|with))\\s+(?:OpenAI|Anthropic|Google|Meta|Microsoft)\\s+(?:support|team|staff|security|engineering)", category: "Identity Hijack", severity: "critical", description: "False AI company employee identity claim", source: "augustus" },

  // === ANSI ESCAPE (from ansiescape/payloads.go) ===
  { pattern: "\\\\x1b\\[|\\\\033\\[|\\\\e\\[", category: "ANSI Injection", severity: "medium", description: "ANSI escape sequence injection in prompt", source: "augustus" },

  // === OBSCURE PROMPT (from obscureprompt/mutations.go) ===
  { pattern: "(?:using|with|in)\\s+(?:only\\s+)?(?:metaphor|analogy|allegory|parable|fable|riddle).*?(?:explain|describe|teach|show)", category: "Semantic Obfuscation", severity: "medium", description: "Metaphorical framing to extract sensitive content indirectly", source: "augustus" },

  // === FLIP ATTACK (from flipattack/flipattack.go) ===
  { pattern: "(?:reverse|flip|invert|negate|opposite)\\s+(?:the\\s+)?(?:meaning|intent|sentiment|polarity)\\s+(?:of|in)\\s+(?:your|the|my)", category: "Semantic Flip", severity: "high", description: "Semantic inversion attack — reversing safety alignment", source: "augustus" },
];

/** Total count of Augustus-sourced patterns */
export const AUGUSTUS_PATTERN_COUNT = AUGUSTUS_PATTERNS.length;
