"""
Vettd - Trust score calculation and grading.
"""

from typing import Dict, List
from checkers import Finding


# Severity to point deduction mapping
SEVERITY_POINTS = {
    "critical": 25,
    "high": 15,
    "medium": 10,
    "low": 5,
}

# Grade thresholds
GRADE_THRESHOLDS = [
    (90, "A"),
    (70, "B"),
    (50, "C"),
    (25, "D"),
    (0, "F"),
]


def calculate_score(check_results: Dict[str, List[Finding]]) -> dict:
    """
    Calculate trust score from check results.

    Returns dict with:
        score: int (0-100)
        grade: str (A-F)
        total_findings: int
        critical_count: int
        high_count: int
        medium_count: int
        low_count: int
        deductions: list of (finding, points) tuples
    """
    score = 100
    deductions = []
    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}

    all_findings = []
    for check_name, findings in check_results.items():
        all_findings.extend(findings)

    for finding in all_findings:
        points = SEVERITY_POINTS.get(finding.severity, 5)
        deductions.append((finding, points))
        severity_counts[finding.severity] = severity_counts.get(finding.severity, 0) + 1
        score -= points

    # Floor at 0
    score = max(0, score)

    # Determine grade
    grade = "F"
    for threshold, letter in GRADE_THRESHOLDS:
        if score >= threshold:
            grade = letter
            break

    return {
        "score": score,
        "grade": grade,
        "total_findings": len(all_findings),
        "critical_count": severity_counts.get("critical", 0),
        "high_count": severity_counts.get("high", 0),
        "medium_count": severity_counts.get("medium", 0),
        "low_count": severity_counts.get("low", 0),
        "deductions": deductions,
    }


def grade_color(grade: str) -> str:
    """Return ANSI color code for a grade letter."""
    if grade == "A":
        return "\033[92m"  # bright green
    elif grade == "B":
        return "\033[93m"  # yellow
    elif grade == "C":
        return "\033[93m"  # yellow
    elif grade == "D":
        return "\033[91m"  # red
    else:
        return "\033[91m"  # red


def grade_emoji(grade: str) -> str:
    """Return emoji for grade."""
    return {
        "A": "\U0001f7e2",  # green circle
        "B": "\U0001f7e1",  # yellow circle
        "C": "\U0001f7e1",  # yellow circle
        "D": "\U0001f534",  # red circle
        "F": "\U0001f534",  # red circle
    }.get(grade, "\u26aa")
