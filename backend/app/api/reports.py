from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
from app.core.database import get_db
from app.models.models import SecurityReport, Repository, Scan, Vulnerability, Dependency, PackageRisk, User
from app.schemas.schemas import ReportResponse, ReportGenerateRequest
from app.api.deps import get_current_user
from app.services.report_service import report_service
from app.services.risk_engine import risk_engine

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=List[ReportResponse])
def get_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SecurityReport).filter(SecurityReport.user_id == current_user.id).order_by(SecurityReport.created_at.desc()).all()

@router.post("/generate", response_model=ReportResponse)
def generate_report(
    req: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = db.query(Repository).filter(Repository.id == req.repository_id, Repository.user_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    scan = None
    if req.scan_id:
        scan = db.query(Scan).filter(Scan.id == req.scan_id, Scan.repository_id == repo.id).first()
    if not scan:
        scan = db.query(Scan).filter(Scan.repository_id == repo.id).order_by(Scan.created_at.desc()).first()

    if not scan:
        raise HTTPException(status_code=400, detail="No scan results available for report generation. Please run a scan first.")

    vulns = db.query(Vulnerability).filter(Vulnerability.scan_id == scan.id).all()
    deps = db.query(Dependency).filter(Dependency.scan_id == scan.id).all()
    risks = db.query(PackageRisk).filter(PackageRisk.scan_id == scan.id).all()

    vuln_dicts = [{"severity": v.severity, "vuln_id": v.vuln_id, "package_name": v.package_name, "installed_version": v.installed_version, "summary": v.summary, "fixed_version": v.fixed_version} for v in vulns]
    risk_dicts = [{"package_name": r.package_name, "version": r.version, "risk_score": r.risk_score, "evidence": r.evidence} for r in risks]
    dep_dicts = [{"name": d.name, "version": d.version} for d in deps]

    _, meth = risk_engine.calculate_security_score(vuln_dicts, len(dep_dicts), risk_dicts)

    html_content = report_service.generate_html_report(
        user={"full_name": current_user.full_name, "email": current_user.email},
        repo={"name": repo.name, "url": repo.url, "ecosystem": repo.ecosystem},
        scan={"risk_score": scan.risk_score},
        vulnerabilities=vuln_dicts,
        dependencies=dep_dicts,
        package_risks=risk_dicts,
        methodology=meth
    )

    report = SecurityReport(
        user_id=current_user.id,
        repository_id=repo.id,
        scan_id=scan.id,
        title=f"Security Audit - {repo.name}",
        report_type=req.report_type or "executive",
        risk_score=scan.risk_score,
        summary=f"Audit completed with {len(vulns)} vulnerability findings and {len(deps)} evaluated dependencies.",
        html_content=html_content
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.get("/{report_id}/view")
def view_html_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(SecurityReport).filter(SecurityReport.id == report_id, SecurityReport.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return Response(content=report.html_content or "<h1>No content</h1>", media_type="text/html")

@router.get("/{report_id}/download")
def download_pdf_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(SecurityReport).filter(SecurityReport.id == report_id, SecurityReport.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Return HTML for browser print/PDF download
    return Response(
        content=report.html_content,
        media_type="text/html",
        headers={"Content-Disposition": f"inline; filename=SecureSphere-{report.title.replace(' ', '_')}.html"}
    )
