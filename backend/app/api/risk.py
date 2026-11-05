from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import PackageRisk, Scan, Repository, User, Dependency, Vulnerability
from app.schemas.schemas import PackageRiskResponse
from app.api.deps import get_current_user
from app.services.risk_engine import risk_engine

router = APIRouter(prefix="/risk", tags=["Risk Analysis"])

@router.get("/packages", response_model=List[PackageRiskResponse])
def get_package_risks(
    repo_id: Optional[int] = None,
    scan_id: Optional[int] = None,
    classification: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PackageRisk).join(Scan).filter(Scan.user_id == current_user.id)
    if repo_id:
        query = query.filter(Scan.repository_id == repo_id)
    if scan_id:
        query = query.filter(PackageRisk.scan_id == scan_id)
    if classification:
        query = query.filter(PackageRisk.risk_classification == classification)

    return query.order_by(PackageRisk.risk_score.desc()).limit(200).all()

@router.get("/attack-path")
def get_attack_path(
    repo_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find latest scan for user or repository
    query = db.query(Scan).filter(Scan.user_id == current_user.id, Scan.status == "completed")
    if repo_id:
        query = query.filter(Scan.repository_id == repo_id)
    latest_scan = query.order_by(Scan.created_at.desc()).first()

    if not latest_scan:
        return {"nodes": [], "edges": [], "attack_paths": [], "total_paths": 0}

    deps = db.query(Dependency).filter(Dependency.scan_id == latest_scan.id).all()
    vulns = db.query(Vulnerability).filter(Vulnerability.scan_id == latest_scan.id).all()

    deps_dicts = [
        {"name": d.name, "version": d.version, "dependency_type": d.dependency_type, "parent_dependency": d.parent_dependency}
        for d in deps
    ]
    vulns_dicts = [
        {"package_name": v.package_name, "vuln_id": v.vuln_id, "severity": v.severity, "status": v.status}
        for v in vulns
    ]

    graph = risk_engine.build_attack_paths(deps_dicts, vulns_dicts)
    graph["scan_id"] = latest_scan.id
    graph["repository_id"] = latest_scan.repository_id
    return graph
