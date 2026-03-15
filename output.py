"""
Graded - Output formatters: colored terminal, JSON, markdown report.
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, List

from checkers import Finding, ALL_CHECKERS
from scorer import calculate_score, grade_color, grade_emoji


# ANSI color codes (no external deps)
class Colors:
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

    @classmethod
    def disable(cls):
        """Disable colors (for piping/non-TTY)."""
        cls.RED = ""
        cls.GREEN = ""
        cls.YELLOW = ""
        cls.BLUE = ""
        cls.MAGENTA = ""
        cls.CYAN = ""
        cls.WHITE = ""
        cls.BOLD = ""
        cls.DIM = ""
        cls.RESET = ""


def _should_color():
    """Check if terminal supports color."""
    if os.environ.get("NO_COLOR"):
        return False
    if not hasattr(sys.stdout, "isatty"):
        return False
    return sys.stdout.isatty()


def _sanitize_evidence(text: str) -> str:
    """Strip ANSI escape codes from untrusted evidence to prevent terminal injection."""
    import re
    return re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', text)


def print_scan_result(label: str, check_results: Dict[str, List[Finding]],
                      score_data: dict, verbose: bool = False):
    """Print colored terminal output for a single scan."""
    if not _should_color():
        Colors.disable()

    # Truncate label for display
    display_label = label[:60] + "..." if len(label) > 60 else label

    print()
    print(f"  {Colors.BOLD}\U0001f50d Scanning:{Colors.RESET} \"{display_label}\"")
    print()

    # Check results
    for check_name, _ in ALL_CHECKERS:
        findings = check_results.get(check_name, [])
        # Pad check name for alignment
        padded_name = check_name.ljust(22, ".")
        if not findings:
            print(f"    \u2705 {padded_name} {Colors.GREEN}PASS{Colors.RESET}")
        else:
            first_evidence = _sanitize_evidence(findings[0].evidence[:50])
            count_str = f" ({len(findings)} found)" if len(findings) > 1 else ""
            print(f"    \u274c {padded_name} {Colors.RED}FAIL{Colors.RESET}{count_str}")
            if verbose:
                for f in findings:
                    sev_color = Colors.RED if f.severity == "critical" else (
                        Colors.YELLOW if f.severity in ("high", "medium") else Colors.DIM
                    )
                    print(f"       {sev_color}[{f.severity.upper()}]{Colors.RESET} {_sanitize_evidence(f.description)}")
                    print(f"       {Colors.DIM}Evidence: {_sanitize_evidence(f.evidence[:80])}{Colors.RESET}")
            else:
                # Show first finding inline
                print(f"       {Colors.DIM}(found: \"{first_evidence}\"){Colors.RESET}")

    # Grade
    grade = score_data["grade"]
    score = score_data["score"]
    use_color = _should_color()
    g_color = grade_color(grade, use_color)
    g_emoji = grade_emoji(grade)
    reset = Colors.RESET if use_color else ""

    print()
    print(f"    {Colors.BOLD}TRUST GRADE: {g_color}{grade} ({score}/100){reset} {g_emoji}")

    # Summary line
    parts = []
    if score_data["critical_count"]:
        parts.append(f"{Colors.RED}{score_data['critical_count']} critical{Colors.RESET}")
    if score_data["high_count"]:
        parts.append(f"{Colors.YELLOW}{score_data['high_count']} high risk{Colors.RESET}")
    if score_data["medium_count"]:
        parts.append(f"{Colors.YELLOW}{score_data['medium_count']} medium{Colors.RESET}")
    if score_data["low_count"]:
        parts.append(f"{Colors.DIM}{score_data['low_count']} low{Colors.RESET}")

    if parts:
        print(f"    {', '.join(parts)} found")
    else:
        print(f"    {Colors.GREEN}No issues detected{Colors.RESET}")
    print()


def print_batch_summary(results: List[dict]):
    """Print batch summary with grade distribution."""
    if not _should_color():
        Colors.disable()

    total = len(results)
    if total == 0:
        print("  No prompts scanned.")
        return

    # Count grades
    grade_counts = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    issue_counts = {}
    for r in results:
        grade = r["score_data"]["grade"]
        grade_counts[grade] = grade_counts.get(grade, 0) + 1
        for check_name, findings in r["check_results"].items():
            if findings:
                issue_counts[check_name] = issue_counts.get(check_name, 0) + len(findings)

    # Header
    print()
    print(f"  {Colors.BOLD}\U0001f4ca BATCH RESULTS: {total} prompts scanned{Colors.RESET}")
    print()

    # Grade distribution
    print(f"  {Colors.BOLD}Grade Distribution:{Colors.RESET}")
    max_count = max(grade_counts.values()) if grade_counts else 1
    bar_max = 30

    for grade in ["A", "B", "C", "D", "F"]:
        count = grade_counts[grade]
        pct = (count / total * 100) if total else 0
        bar_len = int((count / max_count) * bar_max) if max_count else 0
        bar = "\u2588" * bar_len

        g_color = grade_color(grade, _should_color())
        print(f"    {g_color}{grade}: {count:<3}{Colors.RESET} ({pct:4.0f}%)  {g_color}{bar}{Colors.RESET}")

    # Risk summary
    bad_count = grade_counts.get("D", 0) + grade_counts.get("F", 0)
    bad_pct = (bad_count / total * 100) if total else 0

    print()
    if bad_count > 0:
        print(f"  {Colors.RED}\U0001f534 {bad_count} prompts ({bad_pct:.0f}%) rated D or F{Colors.RESET}")
    else:
        print(f"  {Colors.GREEN}\U0001f7e2 All prompts rated C or above{Colors.RESET}")

    # Top issues
    if issue_counts:
        sorted_issues = sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)
        top = sorted_issues[:5]
        issue_strs = [f"{name} ({count})" for name, count in top]
        print(f"  {Colors.BOLD}Top issues:{Colors.RESET} {', '.join(issue_strs)}")

    print()


def to_json(label: str, check_results: Dict[str, List[Finding]],
            score_data: dict) -> dict:
    """Convert scan result to JSON-serializable dict."""
    checks = {}
    for check_name, findings in check_results.items():
        checks[check_name] = {
            "passed": len(findings) == 0,
            "findings": [
                {
                    "category": f.category,
                    "severity": f.severity,
                    "description": f.description,
                    "evidence": f.evidence,
                }
                for f in findings
            ]
        }

    return {
        "scanned": label,
        "timestamp": datetime.now().isoformat(),
        "trust_score": score_data["score"],
        "grade": score_data["grade"],
        "total_findings": score_data["total_findings"],
        "severity_counts": {
            "critical": score_data["critical_count"],
            "high": score_data["high_count"],
            "medium": score_data["medium_count"],
            "low": score_data["low_count"],
        },
        "checks": checks,
    }


def to_json_str(label: str, check_results: Dict[str, List[Finding]],
                score_data: dict) -> str:
    """Return JSON string of scan result."""
    return json.dumps(to_json(label, check_results, score_data), indent=2)


def batch_to_json(results: List[dict]) -> str:
    """Return JSON string of batch results."""
    output = {
        "timestamp": datetime.now().isoformat(),
        "total_scanned": len(results),
        "results": [
            to_json(r["label"], r["check_results"], r["score_data"])
            for r in results
        ],
        "summary": _batch_summary_data(results),
    }
    return json.dumps(output, indent=2)


def _batch_summary_data(results: List[dict]) -> dict:
    """Compute batch summary data."""
    total = len(results)
    grade_counts = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    issue_counts = {}
    for r in results:
        grade = r["score_data"]["grade"]
        grade_counts[grade] = grade_counts.get(grade, 0) + 1
        for check_name, findings in r["check_results"].items():
            if findings:
                issue_counts[check_name] = issue_counts.get(check_name, 0) + len(findings)

    return {
        "grade_distribution": grade_counts,
        "high_risk_count": grade_counts.get("D", 0) + grade_counts.get("F", 0),
        "high_risk_percentage": round(
            ((grade_counts.get("D", 0) + grade_counts.get("F", 0)) / total * 100)
            if total else 0, 1
        ),
        "top_issues": sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:5],
    }


def _validate_output_path(output_path: str) -> str:
    """Validate output path to prevent writing to sensitive locations."""
    resolved = os.path.realpath(os.path.expanduser(output_path))
    # Block writing to sensitive system paths
    sensitive_prefixes = ["/etc/", "/proc/", "/sys/", "/var/log/",
                          os.path.expanduser("~/.ssh/"), os.path.expanduser("~/.gnupg/")]
    for prefix in sensitive_prefixes:
        if resolved.startswith(prefix):
            raise ValueError(f"Access denied: cannot write to {prefix}")
    # Ensure parent directory exists
    parent = os.path.dirname(resolved)
    if parent and not os.path.isdir(parent):
        raise ValueError(f"Parent directory does not exist: {parent}")
    return resolved


def generate_report(results: List[dict], output_path: str):
    """Generate a markdown report file."""
    validated_path = _validate_output_path(output_path)
    lines = []
    lines.append("# Graded Security Scan Report")
    lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"**Prompts scanned:** {len(results)}")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Summary
    summary = _batch_summary_data(results)
    lines.append("## Summary")
    lines.append("")
    lines.append("| Grade | Count | Percentage |")
    lines.append("|-------|-------|------------|")
    total = len(results)
    for grade in ["A", "B", "C", "D", "F"]:
        count = summary["grade_distribution"][grade]
        pct = (count / total * 100) if total else 0
        lines.append(f"| {grade} | {count} | {pct:.0f}% |")
    lines.append("")

    if summary["top_issues"]:
        lines.append("### Top Issues")
        lines.append("")
        for issue, count in summary["top_issues"]:
            lines.append(f"- **{issue}**: {count} occurrence(s)")
        lines.append("")

    lines.append("---")
    lines.append("")

    # Individual results
    lines.append("## Detailed Results")
    lines.append("")

    for r in results:
        label = r["label"]
        sd = r["score_data"]
        lines.append(f"### {label}")
        lines.append(f"**Grade:** {sd['grade']} ({sd['score']}/100)")
        lines.append("")

        any_findings = False
        for check_name, findings in r["check_results"].items():
            if findings:
                any_findings = True
                lines.append(f"#### {check_name}")
                for f in findings:
                    lines.append(f"- **[{f.severity.upper()}]** {f.description}")
                    lines.append(f"  - Evidence: `{f.evidence[:100]}`")
                lines.append("")

        if not any_findings:
            lines.append("No issues found.")
            lines.append("")

        lines.append("---")
        lines.append("")

    report = "\n".join(lines)
    with open(validated_path, "w") as f:
        f.write(report)

    return validated_path
