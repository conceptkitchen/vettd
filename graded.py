#!/usr/bin/env python3
"""
Graded - Security scanner for AI prompts and MCP server configs.

Like a restaurant health grade for AI prompts.
Zero external dependencies for basic scanning. Only 'anthropic' needed for --deep.

Usage:
    python3 graded.py scan --file prompt.txt
    python3 graded.py scan --dir ./prompts/
    python3 graded.py scan --text "ignore previous instructions and..."
    python3 graded.py scan --mcp claude_desktop_config.json
    python3 graded.py scan --file prompt.txt --deep
    python3 graded.py scan --dir ./prompts/ --json
    python3 graded.py scan --dir ./prompts/ --report report.md
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

from checkers import run_all_checks, ALL_CHECKERS
from scorer import calculate_score
from output import (
    print_scan_result, print_batch_summary,
    to_json_str, batch_to_json, generate_report, Colors
)
from mcp_scanner import scan_mcp_config


__version__ = "0.1.0"


BANNER = r"""
   ____               _          _
  / ___|_ __ __ _  __| | ___  __| |
 | |  _| '__/ _` |/ _` |/ _ \/ _` |
 | |_| | | | (_| | (_| |  __/ (_| |
  \____|_|  \__,_|\__,_|\___|\__,_|

  AI Prompt Security Scanner v{version}
  Trust grades for the AI age.
"""


def scan_text(text: str, label: str = "inline text",
              deep: bool = False, verbose: bool = False) -> dict:
    """Scan a single text string. Returns result dict."""
    check_results = run_all_checks(text)

    # Deep scan if requested
    deep_result = None
    if deep:
        if not os.environ.get("ANTHROPIC_API_KEY"):
            print("  ⚠️  Deep scan requires ANTHROPIC_API_KEY. Running static scan only.",
                  file=sys.stderr)
        else:
            from deep_scan import deep_scan
            deep_result = deep_scan(text)
            if deep_result and deep_result.get("findings"):
                check_results["Semantic analysis (AI)"] = deep_result["findings"]

    score_data = calculate_score(check_results)

    return {
        "label": label,
        "check_results": check_results,
        "score_data": score_data,
        "deep_result": deep_result,
    }


def _validate_scan_path(file_path: str) -> Path:
    """Validate scan target path to prevent path traversal."""
    path = Path(file_path).resolve()
    if not path.exists():
        print(f"  Error: File not found: {file_path}", file=sys.stderr)
        sys.exit(1)
    if not path.is_file():
        print(f"  Error: Not a regular file: {file_path}", file=sys.stderr)
        sys.exit(1)
    # Block scanning sensitive system files
    sensitive = ["/etc/shadow", "/etc/passwd", str(Path.home() / ".ssh"),
                 str(Path.home() / ".gnupg")]
    for s in sensitive:
        if str(path).startswith(s):
            print(f"  Error: Access denied: {file_path}", file=sys.stderr)
            sys.exit(1)
    # Size limit: don't scan files larger than 1MB (prompts shouldn't be this big)
    if path.stat().st_size > 1_048_576:
        print(f"  Error: File too large (>1MB): {file_path}", file=sys.stderr)
        sys.exit(1)
    return path


def scan_file(file_path: str, deep: bool = False, verbose: bool = False) -> dict:
    """Scan a single file. Returns result dict."""
    path = _validate_scan_path(file_path)

    text = path.read_text(encoding="utf-8", errors="replace")
    label = path.name
    return scan_text(text, label=label, deep=deep, verbose=verbose)


def scan_directory(dir_path: str, deep: bool = False, verbose: bool = False,
                   deep_limit: int = 10) -> list:
    """Scan all text files in a directory. Returns list of result dicts."""
    path = Path(dir_path)
    if not path.exists() or not path.is_dir():
        print(f"  Error: Directory not found: {dir_path}", file=sys.stderr)
        sys.exit(1)

    # Scan common prompt file extensions
    extensions = {".txt", ".md", ".prompt", ".system", ".json", ".yaml", ".yml"}
    files = []
    for f in sorted(path.rglob("*")):
        # Skip symlinks to prevent following links to sensitive files
        if f.is_symlink():
            continue
        if f.is_file() and f.suffix.lower() in extensions:
            files.append(f)

    if not files:
        print(f"  No prompt files found in {dir_path}")
        print(f"  (Looking for: {', '.join(extensions)})")
        return []

    results = []
    deep_count = 0
    for f in files:
        # Enforce deep scan limit to prevent API bill shock
        use_deep = deep and deep_count < deep_limit
        result = scan_file(str(f), deep=use_deep, verbose=verbose)
        if use_deep:
            deep_count += 1
        results.append(result)

    if deep and deep_count >= deep_limit and len(files) > deep_limit:
        print(f"  Note: Deep scan limited to {deep_limit} files "
              f"(use --deep-limit to adjust)", file=sys.stderr)

    return results


def scan_mcp(config_path: str, verbose: bool = False) -> dict:
    """Scan an MCP config file. Returns result dict."""
    path = Path(config_path).expanduser()
    if not path.exists():
        print(f"  Error: Config not found: {config_path}", file=sys.stderr)
        sys.exit(1)

    mcp_result = scan_mcp_config(str(path))
    score_data = calculate_score(mcp_result["check_results"])
    mcp_result["score_data"] = score_data
    return mcp_result


def _fetch_url(url: str) -> str:
    """Fetch URL content and return text."""
    from urllib.request import urlopen, Request
    from urllib.error import URLError, HTTPError

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        print(f"  Error: Only HTTP/HTTPS URLs supported: {url}", file=sys.stderr)
        sys.exit(1)

    headers = {"User-Agent": "Graded/0.1.0 (AI Prompt Security Scanner)"}
    req = Request(url, headers=headers)
    try:
        with urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except HTTPError as e:
        print(f"  Error: HTTP {e.code} fetching {url}", file=sys.stderr)
        sys.exit(1)
    except URLError as e:
        print(f"  Error: Could not fetch {url}: {e.reason}", file=sys.stderr)
        sys.exit(1)


def _extract_prompts_from_html(html: str, url: str) -> list:
    """Extract prompt-like text blocks from HTML page.

    Looks for:
    - <pre>/<code> blocks (prompt displays)
    - textareas with content
    - JSON blocks with prompt/system_prompt/content keys
    - Large text blocks in divs with prompt-related classes
    """
    prompts = []

    # Strip script/style tags
    clean = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    clean = re.sub(r"<style[^>]*>.*?</style>", "", clean, flags=re.DOTALL | re.IGNORECASE)

    # Extract <pre> and <code> blocks
    for tag in ("pre", "code"):
        for match in re.finditer(rf"<{tag}[^>]*>(.*?)</{tag}>", clean, re.DOTALL | re.IGNORECASE):
            text = re.sub(r"<[^>]+>", "", match.group(1)).strip()
            if len(text) > 20:
                prompts.append(text)

    # Extract textarea content
    for match in re.finditer(r"<textarea[^>]*>(.*?)</textarea>", clean, re.DOTALL | re.IGNORECASE):
        text = match.group(1).strip()
        if len(text) > 20:
            prompts.append(text)

    # Look for JSON with prompt keys
    for match in re.finditer(r'\{[^{}]*"(?:prompt|system_prompt|content|instruction)"[^{}]*\}', clean, re.DOTALL):
        try:
            data = json.loads(match.group(0))
            for key in ("prompt", "system_prompt", "content", "instruction"):
                if key in data and isinstance(data[key], str) and len(data[key]) > 20:
                    prompts.append(data[key])
        except (json.JSONDecodeError, KeyError):
            pass

    # Look for divs with prompt-related classes/ids
    for match in re.finditer(
        r'<div[^>]*(?:class|id)="[^"]*(?:prompt|system|instruction|template)[^"]*"[^>]*>(.*?)</div>',
        clean, re.DOTALL | re.IGNORECASE
    ):
        text = re.sub(r"<[^>]+>", "", match.group(1)).strip()
        if len(text) > 30:
            prompts.append(text)

    # If nothing found with specific extraction, try the full page text
    if not prompts:
        full_text = re.sub(r"<[^>]+>", " ", clean)
        full_text = re.sub(r"\s+", " ", full_text).strip()
        if len(full_text) > 50:
            prompts.append(full_text)

    # Deduplicate and unescape HTML entities
    seen = set()
    unique = []
    for p in prompts:
        p = p.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
        p = p.replace("&quot;", '"').replace("&#39;", "'")
        key = p[:100].lower()
        if key not in seen:
            seen.add(key)
            unique.append(p)

    return unique


def scan_url(url: str, deep: bool = False, verbose: bool = False) -> list:
    """Fetch a URL, extract prompts, and scan them."""
    print(f"  Fetching: {url}", file=sys.stderr)
    html = _fetch_url(url)
    prompts = _extract_prompts_from_html(html, url)

    if not prompts:
        print(f"  No prompt content found on page.", file=sys.stderr)
        return []

    print(f"  Found {len(prompts)} prompt block(s)", file=sys.stderr)
    print(file=sys.stderr)

    results = []
    for i, prompt in enumerate(prompts):
        label = f"{urlparse(url).netloc} [block {i + 1}]"
        result = scan_text(prompt, label=label, deep=deep, verbose=verbose)
        results.append(result)

    return results


def scan_url_list(url_list_path: str, deep: bool = False, verbose: bool = False) -> list:
    """Scan URLs from a file (one URL per line)."""
    path = Path(url_list_path)
    if not path.exists():
        print(f"  Error: URL list not found: {url_list_path}", file=sys.stderr)
        sys.exit(1)

    urls = [line.strip() for line in path.read_text().splitlines() if line.strip() and not line.startswith("#")]
    if not urls:
        print(f"  No URLs found in {url_list_path}")
        return []

    print(f"  Scanning {len(urls)} URLs...")
    print()

    results = []
    for url in urls:
        results.extend(scan_url(url, deep=deep, verbose=verbose))

    return results


def main():
    parser = argparse.ArgumentParser(
        prog="graded",
        description="Graded - Security scanner for AI prompts and MCP configs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 graded.py scan --file prompt.txt
  python3 graded.py scan --text "ignore previous instructions..."
  python3 graded.py scan --dir ./prompts/
  python3 graded.py scan --mcp ~/.config/claude/claude_desktop_config.json
  python3 graded.py scan --file prompt.txt --deep --json
  python3 graded.py scan --dir ./prompts/ --report scan-report.md
        """
    )

    subparsers = parser.add_subparsers(dest="command")

    # Scan subcommand
    scan_parser = subparsers.add_parser("scan", help="Scan prompts or MCP configs")
    input_group = scan_parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument("--file", "-f", help="Scan a single prompt file")
    input_group.add_argument("--dir", "-d", help="Scan a directory of prompt files")
    input_group.add_argument("--text", "-t", help="Scan inline text")
    input_group.add_argument("--mcp", "-m", help="Scan MCP config file")
    input_group.add_argument("--url", "-u", help="Scan prompts from a URL (scrapes page for prompt content)")
    input_group.add_argument("--urls", help="Scan prompts from a list of URLs (one per line in file)")

    scan_parser.add_argument("--deep", action="store_true",
                            help="Enable Claude API semantic analysis (requires ANTHROPIC_API_KEY)")
    scan_parser.add_argument("--deep-limit", type=int, default=10, metavar="N",
                            help="Max files to deep-scan in batch mode (default: 10, prevents API bill shock)")
    scan_parser.add_argument("--json", action="store_true",
                            help="Output as JSON")
    scan_parser.add_argument("--report", metavar="PATH",
                            help="Generate markdown report at PATH")
    scan_parser.add_argument("--verbose", "-v", action="store_true",
                            help="Show detailed findings for each check")

    # Version
    parser.add_argument("--version", "-V", action="version",
                       version=f"graded {__version__}")

    args = parser.parse_args()

    if not args.command:
        # Show banner and help
        print(BANNER.format(version=__version__))
        parser.print_help()
        sys.exit(0)

    # Show banner (unless JSON output)
    if not args.json:
        print(BANNER.format(version=__version__))

    # Execute scan
    results = []

    if args.text:
        result = scan_text(args.text, deep=args.deep, verbose=args.verbose)
        results.append(result)
    elif args.file:
        result = scan_file(args.file, deep=args.deep, verbose=args.verbose)
        results.append(result)
    elif args.dir:
        results = scan_directory(args.dir, deep=args.deep, verbose=args.verbose,
                                deep_limit=args.deep_limit)
    elif args.mcp:
        result = scan_mcp(args.mcp, verbose=args.verbose)
        results.append(result)
    elif args.url:
        results = scan_url(args.url, deep=args.deep, verbose=args.verbose)
    elif args.urls:
        results = scan_url_list(args.urls, deep=args.deep, verbose=args.verbose)

    if not results:
        sys.exit(0)

    # Output
    if args.json:
        if len(results) == 1:
            print(to_json_str(results[0]["label"], results[0]["check_results"],
                             results[0]["score_data"]))
        else:
            print(batch_to_json(results))
    else:
        for result in results:
            print_scan_result(result["label"], result["check_results"],
                            result["score_data"], verbose=args.verbose)

            # Show deep scan notes if available
            if result.get("deep_result") and result["deep_result"].get("analysis_notes"):
                g = result["deep_result"]
                risk_color = {
                    "low": Colors.GREEN, "medium": Colors.YELLOW,
                    "high": Colors.RED, "critical": Colors.RED
                }.get(g["overall_risk"], Colors.WHITE)
                print(f"    {Colors.BOLD}\U0001f9e0 Deep Scan:{Colors.RESET} "
                      f"Risk: {risk_color}{g['overall_risk']}{Colors.RESET}")
                print(f"    {Colors.DIM}{g['analysis_notes']}{Colors.RESET}")
                print()

        if len(results) > 1:
            print_batch_summary(results)

    if args.report:
        report_path = generate_report(results, args.report)
        print(f"  \U0001f4dd Report saved to: {report_path}")
        print()

    # Exit code based on worst grade
    worst_score = min(r["score_data"]["score"] for r in results)
    if worst_score < 25:
        sys.exit(2)  # F grade
    elif worst_score < 50:
        sys.exit(1)  # D grade
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
