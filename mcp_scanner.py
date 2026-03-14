"""
Vettd - MCP config scanner.
Scans claude_desktop_config.json or .mcp.json for security issues.
"""

import json
import os
import re
from typing import List

from checkers import Finding


def _validate_file_path(file_path: str, must_exist: bool = True) -> str:
    """Validate and resolve a file path to prevent path traversal attacks."""
    resolved = os.path.realpath(os.path.expanduser(file_path))
    if must_exist and not os.path.isfile(resolved):
        raise ValueError(f"Not a regular file: {file_path}")
    # Block reading from sensitive system paths
    sensitive_prefixes = ["/etc/shadow", "/etc/passwd", "/proc/", "/sys/",
                          os.path.expanduser("~/.ssh/"), os.path.expanduser("~/.gnupg/")]
    for prefix in sensitive_prefixes:
        if resolved.startswith(prefix):
            raise ValueError(f"Access denied: cannot read from {prefix}")
    return resolved


def scan_mcp_config(config_path: str) -> dict:
    """
    Scan an MCP config file for security issues.

    Returns dict with:
        label: str
        check_results: dict of {check_name: [findings]}
        config_summary: dict with tool counts, server names, etc.
    """
    resolved_path = _validate_file_path(config_path)
    with open(resolved_path, "r") as f:
        raw_content = f.read()

    try:
        config = json.loads(raw_content)
    except json.JSONDecodeError as e:
        return {
            "label": config_path,
            "check_results": {
                "Config parse": [Finding(
                    category="Config Parse",
                    severity="high",
                    description=f"Failed to parse JSON: {e}",
                    evidence=raw_content[:100]
                )]
            },
            "config_summary": {"error": str(e)},
        }

    findings_by_check = {
        "Tool count": [],
        "Network calls": [],
        "Code execution": [],
        "Credential exposure": [],
        "Suspicious commands": [],
        "Overpermissioned servers": [],
    }

    config_summary = {
        "servers": [],
        "total_tools": 0,
    }

    # Determine config format
    servers = {}
    if "mcpServers" in config:
        servers = config["mcpServers"]
    elif "servers" in config:
        servers = config["servers"]
    else:
        # Try treating entire object as server configs
        servers = config

    config_summary["servers"] = list(servers.keys()) if isinstance(servers, dict) else []

    # Count tools and analyze each server
    tool_count = 0
    for server_name, server_config in (servers.items() if isinstance(servers, dict) else []):
        if not isinstance(server_config, dict):
            continue

        # Count tools if listed
        tools = server_config.get("tools", [])
        if isinstance(tools, list):
            tool_count += len(tools)

        # Check command and args
        command = server_config.get("command", "")
        args = server_config.get("args", [])
        args_str = " ".join(str(a) for a in args) if isinstance(args, list) else str(args)
        full_cmd = f"{command} {args_str}"

        # Check for dangerous commands
        dangerous_cmds = [
            (r'\beval\b', "eval in command"),
            (r'\bexec\b', "exec in command"),
            (r'\bsystem\b', "system call in command"),
            (r'\bcurl\b.*\|.*\bsh\b', "pipe curl to shell"),
            (r'\bwget\b.*\|.*\bsh\b', "pipe wget to shell"),
            (r'\brm\s+-rf\b', "recursive delete"),
            (r'\bchmod\s+777\b', "world-writable permissions"),
            (r'\bnc\s+-', "netcat usage"),
            (r'\b(?:python|node|ruby)\s+-e\b', "inline code execution"),
        ]
        for pattern, desc in dangerous_cmds:
            if re.search(pattern, full_cmd, re.IGNORECASE):
                findings_by_check["Code execution"].append(Finding(
                    category="Code Execution",
                    severity="critical",
                    description=f"Dangerous command in server '{server_name}': {desc}",
                    evidence=full_cmd[:100]
                ))

        # Check for suspicious commands
        suspicious_cmds = [
            (r'\bcurl\b', "curl usage (network call)"),
            (r'\bwget\b', "wget usage (network call)"),
            (r'\bfetch\b', "fetch call"),
            (r'\bssh\b', "SSH connection"),
            (r'\bscp\b', "SCP transfer"),
        ]
        for pattern, desc in suspicious_cmds:
            if re.search(pattern, full_cmd, re.IGNORECASE):
                findings_by_check["Suspicious commands"].append(Finding(
                    category="Suspicious Commands",
                    severity="medium",
                    description=f"Suspicious command in server '{server_name}': {desc}",
                    evidence=full_cmd[:100]
                ))

        # Check environment variables for credential patterns
        env = server_config.get("env", {})
        if isinstance(env, dict):
            for env_key, env_val in env.items():
                env_val_str = str(env_val)
                # Check if actual credential values are hardcoded (not references)
                cred_patterns = [
                    (r'(?:sk|pk)[-_](?:live|test|prod)[-_]\w{10,}', "API key pattern"),
                    (r'ghp_\w{36}', "GitHub personal access token"),
                    (r'glpat-\w{20}', "GitLab personal access token"),
                    (r'xox[bprs]-\w+', "Slack token"),
                    (r'AKIA[0-9A-Z]{16}', "AWS access key"),
                    (r'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}', "JWT token"),
                ]
                for pattern, desc in cred_patterns:
                    if re.search(pattern, env_val_str):
                        findings_by_check["Credential exposure"].append(Finding(
                            category="Credential Exposure",
                            severity="critical",
                            description=f"Hardcoded credential in '{server_name}' env var '{env_key}': {desc}",
                            evidence=f"{env_key}={env_val_str[:20]}..."
                        ))

        # Check for URLs in descriptions/tool definitions
        all_text = json.dumps(server_config)
        url_matches = re.findall(r'https?://[^\s"\'\\]+', all_text)
        for url in url_matches:
            # Filter out common benign URLs
            benign = ["github.com", "npmjs.com", "pypi.org", "localhost", "127.0.0.1",
                       "schemas", "json-schema.org", "example.com"]
            if not any(b in url.lower() for b in benign):
                findings_by_check["Network calls"].append(Finding(
                    category="Network Calls",
                    severity="medium",
                    description=f"External URL in server '{server_name}' config",
                    evidence=url[:100]
                ))

        # Check for overpermissioned patterns
        overperms = [
            (r'(?:all|full|unrestricted)\s+(?:access|permissions)', "unrestricted access claim"),
            (r'(?:read|write|execute)\s+(?:any|all)\s+files?', "broad file access"),
            (r'(?:any|all)\s+(?:directory|folder|path)', "broad directory access"),
        ]
        for pattern, desc in overperms:
            if re.search(pattern, all_text, re.IGNORECASE):
                findings_by_check["Overpermissioned servers"].append(Finding(
                    category="Overpermissioned Servers",
                    severity="high",
                    description=f"Overpermissioned server '{server_name}': {desc}",
                    evidence=re.search(pattern, all_text, re.IGNORECASE).group(0)
                ))

    config_summary["total_tools"] = tool_count

    # Check total tool count
    if tool_count > 20:
        findings_by_check["Tool count"].append(Finding(
            category="Tool Count",
            severity="high",
            description=f"Excessive tool count: {tool_count} tools across {len(config_summary['servers'])} servers",
            evidence=f"{tool_count} tools registered (threshold: 20)"
        ))

    # Also check the raw content for any credential patterns that might be outside server configs
    raw_cred_patterns = [
        (r'(?:password|passwd|pwd)\s*[:=]\s*["\'][^"\']{4,}["\']', "password in config"),
        (r'(?:secret|private_key)\s*[:=]\s*["\'][^"\']{4,}["\']', "secret in config"),
    ]
    for pattern, desc in raw_cred_patterns:
        matches = re.finditer(pattern, raw_content, re.IGNORECASE)
        for match in matches:
            findings_by_check["Credential exposure"].append(Finding(
                category="Credential Exposure",
                severity="critical",
                description=f"Hardcoded credential: {desc}",
                evidence=match.group(0)[:60]
            ))

    return {
        "label": config_path,
        "check_results": findings_by_check,
        "config_summary": config_summary,
    }
