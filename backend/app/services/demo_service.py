from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.models import Repository, Scan, Dependency, Vulnerability, PackageRisk, Notification, MonitoringSchedule
from app.services.osv_service import osv_service
from app.services.risk_engine import risk_engine

DEMO_REPOSITORIES = [
    {
        "name": "ecommerce-cloud-platform",
        "full_name": "acme-corp/ecommerce-cloud-platform",
        "url": "https://github.com/acme-corp/ecommerce-cloud-platform",
        "description": "Production e-commerce microservices, API gateway and checkout processing system.",
        "ecosystem": "npm",
        "manifest_filename": "package-lock.json",
        "packages": [
            {"name": "lodash", "version": "4.17.15", "ecosystem": "npm", "type": "direct", "parent": None},
            {"name": "axios", "version": "0.21.1", "ecosystem": "npm", "type": "direct", "parent": None},
            {"name": "jsonwebtoken", "version": "8.5.1", "ecosystem": "npm", "type": "direct", "parent": None},
            {"name": "minimist", "version": "1.2.0", "ecosystem": "npm", "type": "transitive", "parent": "axios"},
            {"name": "express", "version": "4.17.1", "ecosystem": "npm", "type": "direct", "parent": None},
            {"name": "log4j-core", "version": "2.14.1", "ecosystem": "Maven", "type": "transitive", "parent": "express"},
            {"name": "react", "version": "18.2.0", "ecosystem": "npm", "type": "direct", "parent": None},
            {"name": "next", "version": "14.1.0", "ecosystem": "npm", "type": "direct", "parent": None},
            {"name": "zod", "version": "3.22.4", "ecosystem": "npm", "type": "direct", "parent": None},
            {"name": "tailwindcss", "version": "3.4.1", "ecosystem": "npm", "type": "direct", "parent": None}
        ]
    },
    {
        "name": "fintech-payment-engine",
        "full_name": "apex-financial/fintech-payment-engine",
        "url": "https://github.com/apex-financial/fintech-payment-engine",
        "description": "High-throughput PCI-DSS financial transaction router and ledger synchronization API.",
        "ecosystem": "PyPI",
        "manifest_filename": "requirements.txt",
        "packages": [
            {"name": "pyyaml", "version": "5.3.1", "ecosystem": "PyPI", "type": "direct", "parent": None},
            {"name": "requests", "version": "2.25.1", "ecosystem": "PyPI", "type": "direct", "parent": None},
            {"name": "urllib3", "version": "1.26.4", "ecosystem": "PyPI", "type": "transitive", "parent": "requests"},
            {"name": "flask", "version": "2.0.1", "ecosystem": "PyPI", "type": "direct", "parent": None},
            {"name": "cryptography", "version": "3.4.7", "ecosystem": "PyPI", "type": "direct", "parent": None},
            {"name": "pydantic", "version": "2.6.1", "ecosystem": "PyPI", "type": "direct", "parent": None},
            {"name": "sqlalchemy", "version": "2.0.25", "ecosystem": "PyPI", "type": "direct", "parent": None}
        ]
    }
]

class DemoService:
    @staticmethod
    async def seed_demo_data(db: Session, user_id: int) -> Repository:
        """Seeds the primary hackathon demo repository with complete scan results"""
        # Check if already seeded for this user
        existing = db.query(Repository).filter(
            Repository.user_id == user_id,
            Repository.is_demo == True
        ).first()
        if existing:
            return existing

        demo_def = DEMO_REPOSITORIES[0]
        repo = Repository(
            user_id=user_id,
            name=demo_def["name"],
            full_name=demo_def["full_name"],
            description=demo_def["description"],
            url=demo_def["url"],
            default_branch="main",
            ecosystem=demo_def["ecosystem"],
            is_demo=True,
            risk_score=42.0,
            last_scanned_at=datetime.utcnow()
        )
        db.add(repo)
        db.commit()
        db.refresh(repo)

        # Create Scan record
        scan = Scan(
            repository_id=repo.id,
            user_id=user_id,
            status="completed",
            risk_score=42.0,
            total_dependencies=len(demo_def["packages"]),
            duration_seconds=1.4,
            manifest_files=[demo_def["manifest_filename"]],
            scan_summary="Deep dependency analysis completed. 6 vulnerabilities flagged across direct and transitive dependencies."
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        # Add dependencies and query OSV
        vulns_to_create = []
        risks_to_create = []
        crit_count = 0
        high_count = 0
        med_count = 0
        low_count = 0

        for pkg in demo_def["packages"]:
            dep = Dependency(
                scan_id=scan.id,
                repository_id=repo.id,
                name=pkg["name"],
                version=pkg["version"],
                ecosystem=pkg["ecosystem"],
                dependency_type=pkg["type"],
                parent_dependency=pkg["parent"],
                license="MIT" if "react" in pkg["name"] or "lodash" in pkg["name"] else "Apache-2.0",
                is_vulnerable=False
            )
            db.add(dep)
            db.flush()

            # Query real/fallback OSV
            osv_results = await osv_service.query_package(pkg["name"], pkg["version"], pkg["ecosystem"])
            if osv_results:
                dep.is_vulnerable = True
                dep.risk_score = 85.0 if any(v.get("severity") == "CRITICAL" for v in osv_results) else 65.0
                for ov in osv_results:
                    sev = ov.get("severity", "HIGH").upper()
                    if sev == "CRITICAL":
                        crit_count += 1
                    elif sev == "HIGH":
                        high_count += 1
                    elif sev == "MEDIUM":
                        med_count += 1
                    else:
                        low_count += 1

                    vuln = Vulnerability(
                        scan_id=scan.id,
                        dependency_id=dep.id,
                        vuln_id=ov.get("vuln_id", "CVE-2023-XXXX"),
                        package_name=pkg["name"],
                        ecosystem=pkg["ecosystem"],
                        installed_version=pkg["version"],
                        affected_range=ov.get("affected_range"),
                        severity=sev,
                        cvss_score=ov.get("cvss_score", 8.0),
                        summary=ov.get("summary", "Vulnerability in dependency"),
                        details=ov.get("details"),
                        published_at=ov.get("published_at"),
                        fixed_version=ov.get("fixed_version"),
                        advisory_url=ov.get("advisory_url"),
                        remediation_instructions=ov.get("remediation_instructions"),
                        status="unresolved"
                    )
                    vulns_to_create.append(vuln)

            # Evaluate package risk
            pr_data = risk_engine.evaluate_package_risk(pkg["name"], pkg["version"], pkg["ecosystem"], osv_results)
            pr = PackageRisk(
                scan_id=scan.id,
                package_name=pkg["name"],
                ecosystem=pkg["ecosystem"],
                version=pkg["version"],
                risk_score=pr_data["risk_score"],
                risk_classification=pr_data["risk_classification"],
                evidence=pr_data["evidence"],
                potential_impact=pr_data["potential_impact"],
                recommended_action=pr_data["recommended_action"]
            )
            risks_to_create.append(pr)

        db.add_all(vulns_to_create)
        db.add_all(risks_to_create)

        # Update Scan metrics
        scan.total_vulnerabilities = len(vulns_to_create)
        scan.critical_count = crit_count
        scan.high_count = high_count
        scan.medium_count = med_count
        scan.low_count = low_count

        # Compute accurate score
        calculated_score, _ = risk_engine.calculate_security_score(
            [{"severity": v.severity, "status": "unresolved"} for v in vulns_to_create],
            len(demo_def["packages"]),
            [{"risk_classification": r.risk_classification} for r in risks_to_create]
        )
        scan.risk_score = calculated_score
        repo.risk_score = calculated_score

        # Add initial notification for demonstration
        notif = Notification(
            user_id=user_id,
            type="vulnerability",
            title="Critical Alert: Log4Shell & Lodash Prototype Pollution Flagged",
            message=f"Scan for {repo.name} detected {crit_count} Critical and {high_count} High severity vulnerabilities requiring immediate developer action.",
            severity="CRITICAL",
            link="/vulnerabilities"
        )
        db.add(notif)

        # Add monitoring schedule
        sched = MonitoringSchedule(
            user_id=user_id,
            repository_id=repo.id,
            frequency="daily",
            is_active=True,
            last_run_at=datetime.utcnow(),
            next_run_at=datetime.utcnow()
        )
        db.add(sched)

        db.commit()
        db.refresh(repo)
        return repo

demo_service = DemoService()
