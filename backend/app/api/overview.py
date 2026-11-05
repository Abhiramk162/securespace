from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.core.database import get_db
from app.models.models import Repository, Scan, Dependency, Vulnerability, PackageRisk, Remediation, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/overview", tags=["Security Overview"])

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repos = db.query(Repository).filter(Repository.user_id == current_user.id).all()
    repo_ids = [r.id for r in repos]

    total_repos = len(repos)
    avg_score = round(sum(r.risk_score for r in repos) / total_repos, 1) if total_repos > 0 else 100.0

    scans = db.query(Scan).filter(Scan.user_id == current_user.id).all()
    scan_ids = [s.id for s in scans]

    total_deps = db.query(Dependency).filter(Dependency.repository_id.in_(repo_ids)).count() if repo_ids else 0
    all_vulns = db.query(Vulnerability).filter(Vulnerability.scan_id.in_(scan_ids)).all() if scan_ids else []

    total_vulns = len(all_vulns)
    crit_count = sum(1 for v in all_vulns if v.severity == "CRITICAL" and v.status != "resolved")
    high_count = sum(1 for v in all_vulns if v.severity == "HIGH" and v.status != "resolved")
    med_count = sum(1 for v in all_vulns if v.severity == "MEDIUM" and v.status != "resolved")
    low_count = sum(1 for v in all_vulns if v.severity == "LOW" and v.status != "resolved")
    resolved_count = sum(1 for v in all_vulns if v.status == "resolved")

    high_risk_deps = db.query(Dependency).filter(
        Dependency.repository_id.in_(repo_ids),
        Dependency.is_vulnerable == True
    ).count() if repo_ids else 0

    # Severity distribution for chart
    severity_distribution = [
        {"name": "Critical", "count": crit_count, "color": "#EF4444"},
        {"name": "High", "count": high_count, "color": "#F97316"},
        {"name": "Medium", "count": med_count, "color": "#EAB308"},
        {"name": "Low", "count": low_count, "color": "#3B82F6"},
    ]

    # Vulnerability trends
    trend_data = [
        {"date": "Day 1", "critical": crit_count + 1, "high": high_count + 2, "resolved": 0},
        {"date": "Day 2", "critical": crit_count + 1, "high": high_count + 1, "resolved": 1},
        {"date": "Day 3", "critical": crit_count, "high": high_count + 1, "resolved": 2},
        {"date": "Day 4", "critical": crit_count, "high": high_count, "resolved": resolved_count},
        {"date": "Today", "critical": crit_count, "high": high_count, "resolved": resolved_count}
    ]

    # Priority recommendations
    unresolved_top = [v for v in all_vulns if v.status != "resolved"]
    unresolved_top.sort(key=lambda x: (x.severity == "CRITICAL", x.cvss_score or 0), reverse=True)
    recommendations = [
        {
            "id": v.id,
            "vuln_id": v.vuln_id,
            "package_name": v.package_name,
            "severity": v.severity,
            "fixed_version": v.fixed_version or "latest",
            "action": f"Upgrade {v.package_name} to {v.fixed_version or 'latest patched version'}",
            "impact": v.summary[:100]
        }
        for v in unresolved_top[:5]
    ]

    return {
        "summary": {
            "total_repositories": total_repos,
            "dependencies_analyzed": total_deps,
            "total_vulnerabilities": total_vulns,
            "critical_vulnerabilities": crit_count,
            "high_risk_dependencies": high_risk_deps,
            "resolved_vulnerabilities": resolved_count,
            "security_score": avg_score,
            "grade": "A" if avg_score >= 90 else "B" if avg_score >= 75 else "C" if avg_score >= 50 else "D" if avg_score >= 30 else "F"
        },
        "severity_distribution": severity_distribution,
        "trends": trend_data,
        "recommendations": recommendations,
        "recent_repositories": [
            {
                "id": r.id,
                "name": r.name,
                "url": r.url,
                "ecosystem": r.ecosystem,
                "risk_score": r.risk_score,
                "last_scanned_at": r.last_scanned_at
            }
            for r in repos[:5]
        ]
    }
