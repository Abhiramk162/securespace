from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.models import Vulnerability, Scan, Repository, User, Remediation
from app.schemas.schemas import VulnerabilityResponse, VulnerabilityStatusUpdate
from app.api.deps import get_current_user
from app.services.risk_engine import risk_engine

router = APIRouter(prefix="/vulnerabilities", tags=["Vulnerabilities"])

@router.get("", response_model=List[VulnerabilityResponse])
def get_vulnerabilities(
    repo_id: Optional[int] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Vulnerability).join(Scan).filter(Scan.user_id == current_user.id)
    if repo_id:
        query = query.filter(Scan.repository_id == repo_id)
    if severity:
        query = query.filter(Vulnerability.severity == severity.upper())
    if status:
        query = query.filter(Vulnerability.status == status)
    if search:
        query = query.filter(
            (Vulnerability.package_name.ilike(f"%{search}%")) |
            (Vulnerability.vuln_id.ilike(f"%{search}%")) |
            (Vulnerability.summary.ilike(f"%{search}%"))
        )

    return query.order_by(
        Vulnerability.severity == "CRITICAL",
        Vulnerability.severity == "HIGH",
        Vulnerability.cvss_score.desc()
    ).limit(300).all()

@router.get("/{vuln_id}", response_model=VulnerabilityResponse)
def get_vulnerability(vuln_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    v = db.query(Vulnerability).join(Scan).filter(
        Vulnerability.id == vuln_id,
        Scan.user_id == current_user.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return v

@router.patch("/{vuln_id}/status", response_model=VulnerabilityResponse)
def update_vulnerability_status(
    vuln_id: int,
    status_update: VulnerabilityStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    v = db.query(Vulnerability).join(Scan).filter(
        Vulnerability.id == vuln_id,
        Scan.user_id == current_user.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    v.status = status_update.status
    if status_update.status == "resolved":
        v.resolved_at = datetime.utcnow()
        rem = Remediation(
            user_id=current_user.id,
            vulnerability_id=v.id,
            scan_id=v.scan_id,
            action_taken=f"Marked as {status_update.status}",
            notes=status_update.notes,
            status="completed"
        )
        db.add(rem)

    # Re-calculate parent scan and repository score!
    scan = db.query(Scan).filter(Scan.id == v.scan_id).first()
    if scan:
        all_vulns = db.query(Vulnerability).filter(Vulnerability.scan_id == scan.id).all()
        new_score, _ = risk_engine.calculate_security_score(
            [{"severity": vul.severity, "status": vul.status} for vul in all_vulns],
            scan.total_dependencies
        )
        scan.risk_score = new_score
        repo = db.query(Repository).filter(Repository.id == scan.repository_id).first()
        if repo:
            repo.risk_score = new_score

    db.commit()
    db.refresh(v)
    return v
