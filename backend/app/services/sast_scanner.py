"""Real static application security testing (SAST) scanner over project artifacts."""
import re
from typing import Dict, List, Tuple

SAST_RULES: List[Tuple[str, str, str, str, str, re.Pattern]] = [
    (
        "critical",
        "Hardcoded Secret or API Key",
        "CWE-798",
        "Potential hardcoded credential, API key, or private token detected in source code.",
        "Move secrets to environment variables or a secret manager and reference via os.getenv().",
        re.compile(r"""(?i)(api_key|secret_key|password|access_token)\s*=\s*['"][^'"]{8,}['"]"""),
    ),
    (
        "critical",
        "Dynamic Code Execution (eval/exec)",
        "CWE-95",
        "Use of eval() or exec() can allow arbitrary code injection if tainted input reaches it.",
        "Replace eval/exec with safe parsers (json.loads, ast.literal_eval) or explicit dispatch tables.",
        re.compile(r"""\b(eval|exec)\s*\("""),
    ),
    (
        "high",
        "OS Command Injection Risk (shell=True)",
        "CWE-78",
        "Subprocess invocation with shell=True exposes the host to shell metacharacter injection.",
        "Pass argument lists directly to subprocess.run(..., shell=False).",
        re.compile(r"""subprocess\.\w+\([^)]*shell\s*=\s*True"""),
    ),
    (
        "high",
        "Potential SQL Injection via String Interpolation",
        "CWE-89",
        "SQL query appears to interpolate variables directly instead of using bound parameters.",
        "Use SQLAlchemy ORM queries or parameterized text() queries with bindparams.",
        re.compile(r"""(?i)(SELECT|INSERT|UPDATE|DELETE)\s+.+?(f['"]|%s|\+\s*\w+)"""),
    ),
    (
        "medium",
        "Permissive Wildcard CORS Origin",
        "CWE-942",
        "CORS allow_origins contains wildcard '*', allowing any origin to make cross-origin requests.",
        "Restrict allow_origins to explicit trusted frontend origins via environment configuration.",
        re.compile(r"""allow_origins\s*=\s*\[\s*['"]\*['"]\s*\]"""),
    ),
    (
        "medium",
        "Unsafe HTML Injection (dangerouslySetInnerHTML)",
        "CWE-79",
        "Rendering raw HTML via dangerouslySetInnerHTML creates Cross-Site Scripting (XSS) exposure.",
        "Render structured React JSX or sanitize HTML with DOMPurify before rendering.",
        re.compile(r"""dangerouslySetInnerHTML"""),
    ),
    (
        "low",
        "TLS Certificate Verification Disabled",
        "CWE-295",
        "Outbound HTTP request disables SSL/TLS certificate verification (verify=False).",
        "Remove verify=False so TLS certificates are validated against trusted CAs.",
        re.compile(r"""verify\s*=\s*False"""),
    ),
]


def scan_artifacts(artifacts: List[Dict[str, str]]) -> Dict:
    """Scan artifact file contents for real SAST findings with line numbers and severity counts."""
    findings: List[Dict] = []
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}

    for art in artifacts:
        file_path = art.get("file_path") or art.get("path") or "unknown"
        content = art.get("content") or ""
        if not content:
            continue
        # Skip scanning generated test files or markdown docs for password fixtures
        lower_path = file_path.lower()
        if lower_path.endswith(".md") or lower_path.endswith(".json"):
            continue

        lines = content.splitlines()
        for line_idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            if stripped.startswith("#") or stripped.startswith("//"):
                continue
            for severity, title, cwe_id, description, suggested_fix, pattern in SAST_RULES:
                if pattern.search(line):
                    # Skip obvious placeholder env examples
                    if "your_" in line.lower() or "placeholder" in line.lower() or "example" in line.lower():
                        continue
                    counts[severity] += 1
                    findings.append({
                        "severity": severity,
                        "title": title,
                        "description": description,
                        "affected_file": file_path,
                        "line_number": line_idx,
                        "cwe_id": cwe_id,
                        "suggested_fix": suggested_fix,
                    })

    total = sum(counts.values())
    if counts["critical"] > 0:
        risk_level = "critical"
    elif counts["high"] > 0:
        risk_level = "high"
    elif counts["medium"] > 0:
        risk_level = "medium"
    else:
        risk_level = "low"

    summary = (
        f"Static analysis scanned {len(artifacts)} artifact(s): "
        f"{counts['critical']} Critical, {counts['high']} High, "
        f"{counts['medium']} Medium, {counts['low']} Low findings."
    )
    return {
        "total_vulnerabilities": total,
        "critical_count": counts["critical"],
        "high_count": counts["high"],
        "medium_count": counts["medium"],
        "low_count": counts["low"],
        "risk_level": risk_level,
        "summary": summary,
        "findings": findings,
    }
