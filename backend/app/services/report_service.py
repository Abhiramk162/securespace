import os
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ReportService:
    @staticmethod
    def generate_html_report(
        user: Dict[str, Any],
        repo: Dict[str, Any],
        scan: Dict[str, Any],
        vulnerabilities: List[Dict[str, Any]],
        dependencies: List[Dict[str, Any]],
        package_risks: List[Dict[str, Any]],
        methodology: Dict[str, Any]
    ) -> str:
        """Generates a professional, print-ready, styled HTML executive report"""
        score = scan.get("risk_score", 100.0)
        grade = "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 50 else "D" if score >= 30 else "F"
        score_color = "#20B486" if score >= 80 else "#E5A93C" if score >= 50 else "#EF4444"

        crit_count = sum(1 for v in vulnerabilities if v.get("severity") == "CRITICAL")
        high_count = sum(1 for v in vulnerabilities if v.get("severity") == "HIGH")
        med_count = sum(1 for v in vulnerabilities if v.get("severity") == "MEDIUM")
        low_count = sum(1 for v in vulnerabilities if v.get("severity") == "LOW")

        vuln_rows = ""
        for v in vulnerabilities[:30]:
            sev_color = "#EF4444" if v.get("severity") == "CRITICAL" else "#F97316" if v.get("severity") == "HIGH" else "#EAB308" if v.get("severity") == "MEDIUM" else "#3B82F6"
            vuln_rows += f"""
            <tr style="border-bottom: 1px solid #2A3A48;">
                <td style="padding: 10px; font-weight: bold; color: {sev_color};">{v.get('severity')}</td>
                <td style="padding: 10px; font-family: monospace; color: #48C8D5;">{v.get('vuln_id')}</td>
                <td style="padding: 10px; font-weight: 600;">{v.get('package_name')} <span style="color: #9BA9B7; font-size: 11px;">v{v.get('installed_version')}</span></td>
                <td style="padding: 10px; font-size: 12px; color: #D1D5DB;">{v.get('summary', '')[:120]}</td>
                <td style="padding: 10px; font-family: monospace; color: #20B486;">{v.get('fixed_version') or 'N/A'}</td>
            </tr>
            """

        risk_rows = ""
        for pr in package_risks[:15]:
            risk_rows += f"""
            <tr style="border-bottom: 1px solid #2A3A48;">
                <td style="padding: 8px; font-weight: 600;">{pr.get('package_name')}</td>
                <td style="padding: 8px; font-family: monospace;">{pr.get('version')}</td>
                <td style="padding: 8px; font-weight: bold; color: {'#EF4444' if pr.get('risk_score', 0) > 60 else '#20B486'};">{pr.get('risk_score')}/100</td>
                <td style="padding: 8px; font-size: 12px; color: #9BA9B7;">{', '.join(pr.get('evidence', []))}</td>
            </tr>
            """

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SecureSphere Executive Security Audit Report</title>
<style>
    body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #101820;
        color: #F4F7FA;
        margin: 0;
        padding: 40px;
    }}
    .header {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #20B486;
        padding-bottom: 20px;
        margin-bottom: 30px;
    }}
    .logo {{
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: #F4F7FA;
    }}
    .logo span {{ color: #20B486; }}
    .badge {{
        background: #18232D;
        border: 1px solid #2A3A48;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        color: #48C8D5;
    }}
    .score-card {{
        background: #18232D;
        border: 1px solid #2A3A48;
        border-radius: 12px;
        padding: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 30px;
    }}
    .score-number {{
        font-size: 56px;
        font-weight: 900;
        color: {score_color};
    }}
    .stats-grid {{
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 30px;
    }}
    .stat-box {{
        background: #202C37;
        border: 1px solid #2A3A48;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
    }}
    .stat-val {{
        font-size: 24px;
        font-weight: 800;
    }}
    .stat-lbl {{
        font-size: 11px;
        text-transform: uppercase;
        color: #9BA9B7;
        letter-spacing: 0.5px;
        margin-top: 4px;
    }}
    table {{
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        margin-bottom: 30px;
        background: #18232D;
        border-radius: 8px;
        overflow: hidden;
    }}
    th {{
        background: #202C37;
        padding: 12px 10px;
        text-align: left;
        font-size: 12px;
        text-transform: uppercase;
        color: #9BA9B7;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #2A3A48;
    }}
    h2 {{
        color: #F4F7FA;
        font-size: 18px;
        border-left: 4px solid #20B486;
        padding-left: 10px;
        margin-top: 30px;
        margin-bottom: 12px;
    }}
    .footer {{
        margin-top: 50px;
        border-top: 1px solid #2A3A48;
        padding-top: 20px;
        font-size: 11px;
        color: #9BA9B7;
        display: flex;
        justify-content: space-between;
    }}
    @media print {{
        body {{ background-color: #ffffff; color: #111827; padding: 20px; }}
        .header {{ border-bottom: 2px solid #10b981; }}
        .logo {{ color: #111827; }}
        .score-card, .stat-box, table {{ background: #f9fafb; border: 1px solid #e5e7eb; }}
        th {{ background: #f3f4f6; color: #4b5563; }}
        tr {{ border-bottom: 1px solid #e5e7eb !important; }}
    }}
</style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">SECURE<span>SPHERE</span></div>
            <div style="font-size: 12px; color: #9BA9B7; margin-top: 4px;">AI-Powered Open-Source Security Intelligence Platform</div>
        </div>
        <div>
            <div class="badge">CONFIDENTIAL AUDIT REPORT</div>
        </div>
    </div>

    <div class="score-card">
        <div>
            <div style="font-size: 12px; text-transform: uppercase; color: #9BA9B7; letter-spacing: 1px;">Target Repository</div>
            <div style="font-size: 24px; font-weight: bold; margin-top: 4px; color: #F4F7FA;">{repo.get('name')}</div>
            <div style="font-size: 13px; color: #9BA9B7; margin-top: 2px;">{repo.get('url')} &bull; Ecosystem: {repo.get('ecosystem')}</div>
            <div style="font-size: 12px; color: #48C8D5; margin-top: 8px;">Audited by: {user.get('full_name')} ({user.get('email')}) &bull; Date: {datetime.utcnow().strftime('%B %d, %Y')}</div>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; color: #9BA9B7;">Security Rating</div>
            <div class="score-number">{int(score)}<span style="font-size: 24px; color: #9BA9B7;">/100</span></div>
            <div style="font-size: 14px; font-weight: bold; color: {score_color};">Grade: {grade}</div>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-val" style="color: #EF4444;">{crit_count}</div>
            <div class="stat-lbl">Critical CVEs</div>
        </div>
        <div class="stat-box">
            <div class="stat-val" style="color: #F97316;">{high_count}</div>
            <div class="stat-lbl">High Severity</div>
        </div>
        <div class="stat-box">
            <div class="stat-val" style="color: #EAB308;">{med_count}</div>
            <div class="stat-lbl">Medium Severity</div>
        </div>
        <div class="stat-box">
            <div class="stat-val" style="color: #48C8D5;">{len(dependencies)}</div>
            <div class="stat-lbl">Total Dependencies</div>
        </div>
    </div>

    <h2>Verified Vulnerability Findings (OSV / NVD / CVE)</h2>
    <table>
        <thead>
            <tr>
                <th>Severity</th>
                <th>Identifier</th>
                <th>Package & Installed</th>
                <th>Vulnerability Summary</th>
                <th>Remediation Fix</th>
            </tr>
        </thead>
        <tbody>
            {vuln_rows if vuln_rows else '<tr><td colspan="5" style="padding: 16px; text-align: center; color: #20B486;">No vulnerabilities detected. Clean codebase.</td></tr>'}
        </tbody>
    </table>

    <h2>Package Risk & Supply Chain Intelligence</h2>
    <table>
        <thead>
            <tr>
                <th>Package</th>
                <th>Version</th>
                <th>Risk Score</th>
                <th>Identified Evidence & Signals</th>
            </tr>
        </thead>
        <tbody>
            {risk_rows if risk_rows else '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #20B486;">All evaluated packages within trusted risk baseline.</td></tr>'}
        </tbody>
    </table>

    <h2>Scoring Methodology & Security Assurance</h2>
    <div style="background: #18232D; border: 1px solid #2A3A48; border-radius: 8px; padding: 18px; font-size: 13px; line-height: 1.6; color: #D1D5DB;">
        The SecureSphere Security Score evaluates verified CVE vulnerability findings directly against the Open Source Vulnerability (OSV) API, GitHub Security Advisories, and CVSS v3.1 vector standards. Base score starts at 100.0 with standardized deductions: Critical severity (-25 pts), High severity (-12 pts), Medium severity (-5 pts), Low severity (-2 pts), and Supply Chain / Typosquatting risk (-10 pts).
    </div>

    <div class="footer">
        <div>Generated by SecureSphere AI Platform &bull; Certified Open-Source Security Audit</div>
        <div>Page 1 of 1 &bull; {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</div>
    </div>
</body>
</html>
        """
        return html

    @staticmethod
    def generate_pdf_report(
        user: Dict[str, Any],
        repo: Dict[str, Any],
        scan: Dict[str, Any],
        vulnerabilities: List[Dict[str, Any]],
        dependencies: List[Dict[str, Any]],
        output_path: str
    ) -> str:
        """Generates a binary PDF report using ReportLab"""
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#101820'),
            spaceAfter=6
        )
        meta_style = ParagraphStyle(
            'MetaStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#555555'),
            spaceAfter=15
        )
        h2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#20B486'),
            spaceBefore=12,
            spaceAfter=8
        )

        elements = []
        elements.append(Paragraph("SecureSphere Executive Security Audit", title_style))
        elements.append(Paragraph(f"Repository: <b>{repo.get('name')}</b> | Date: {datetime.utcnow().strftime('%B %d, %Y')} | Auditor: {user.get('full_name')}", meta_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#20B486'), spaceAfter=15))

        # Metrics Table
        crit = sum(1 for v in vulnerabilities if v.get("severity") == "CRITICAL")
        high = sum(1 for v in vulnerabilities if v.get("severity") == "HIGH")
        med = sum(1 for v in vulnerabilities if v.get("severity") == "MEDIUM")
        score = scan.get("risk_score", 100.0)

        metrics_data = [
            ["Security Score", "Total Dependencies", "Critical CVEs", "High Severity", "Medium Severity"],
            [f"{int(score)}/100", str(len(dependencies)), str(crit), str(high), str(med)]
        ]
        t_metrics = Table(metrics_data, colWidths=[108]*5)
        t_metrics.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#18232D')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#FFFFFF')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#F4F7FA')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CCCCCC')),
        ]))
        elements.append(t_metrics)
        elements.append(Spacer(1, 15))

        # Findings table
        elements.append(Paragraph("Top Vulnerability Findings", h2_style))
        vuln_data = [["Severity", "CVE / ID", "Package", "Installed", "Fixed Version"]]
        for v in vulnerabilities[:20]:
            vuln_data.append([
                v.get("severity", "HIGH"),
                v.get("vuln_id", "N/A"),
                v.get("package_name", ""),
                v.get("installed_version", ""),
                v.get("fixed_version") or "N/A"
            ])

        t_vulns = Table(vuln_data, colWidths=[80, 120, 140, 90, 110])
        t_vulns.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#202C37')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#FFFFFF')),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ]))
        elements.append(t_vulns)

        doc.build(elements)
        return output_path

report_service = ReportService()
