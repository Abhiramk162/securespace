from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/threats", tags=["Threat Intelligence"])

GLOBAL_ADVISORIES = [
    {
        "id": "GHSA-j2ge-4vdv-qmwl",
        "cve_id": "CVE-2021-44228",
        "title": "Log4j Remote Code Execution (Log4Shell)",
        "ecosystem": "Maven",
        "package": "org.apache.logging.log4j:log4j-core",
        "severity": "CRITICAL",
        "cvss": 10.0,
        "published": "2021-12-10",
        "summary": "JNDI lookup features do not protect against attacker-controlled LDAP endpoints allowing arbitrary remote code execution.",
        "source": "OSV / GitHub Advisory Database",
        "url": "https://nvd.nist.gov/vuln/detail/CVE-2021-44228"
    },
    {
        "id": "GHSA-jf85-cpcp-j695",
        "cve_id": "CVE-2019-10744",
        "title": "Prototype Pollution in lodash defaultsDeep",
        "ecosystem": "npm",
        "package": "lodash",
        "severity": "CRITICAL",
        "cvss": 9.1,
        "published": "2019-07-26",
        "summary": "Prototype pollution vulnerability allows attackers to modify Object.prototype causing denial of service or remote code execution.",
        "source": "OSV / NVD",
        "url": "https://nvd.nist.gov/vuln/detail/CVE-2019-10744"
    },
    {
        "id": "GHSA-8q59-q68h-6hv4",
        "cve_id": "CVE-2020-14343",
        "title": "Arbitrary Code Execution in PyYAML FullLoader",
        "ecosystem": "PyPI",
        "package": "PyYAML",
        "severity": "CRITICAL",
        "cvss": 9.8,
        "published": "2020-07-27",
        "summary": "Untrusted YAML documents parsed via load() or FullLoader allow arbitrary Python execution.",
        "source": "OSV / PyPI Advisory",
        "url": "https://nvd.nist.gov/vuln/detail/CVE-2020-14343"
    },
    {
        "id": "GHSA-cph5-m8f7-6c5x",
        "cve_id": "CVE-2021-3749",
        "title": "Regular Expression Denial of Service in axios",
        "ecosystem": "npm",
        "package": "axios",
        "severity": "HIGH",
        "cvss": 7.5,
        "published": "2021-08-31",
        "summary": "ReDoS vulnerability when parsing untrusted URLs with specially crafted comment syntax.",
        "source": "OSV / GitHub Advisory",
        "url": "https://nvd.nist.gov/vuln/detail/CVE-2021-3749"
    },
    {
        "id": "GHSA-j8r2-6x86-q33q",
        "cve_id": "CVE-2023-32681",
        "title": "Proxy-Authorization Header Leak in requests",
        "ecosystem": "PyPI",
        "package": "requests",
        "severity": "MEDIUM",
        "cvss": 6.1,
        "published": "2023-05-23",
        "summary": "Requests forwards Proxy-Authorization header during HTTPS redirect chains to external targets.",
        "source": "OSV / PyPI Advisory",
        "url": "https://nvd.nist.gov/vuln/detail/CVE-2023-32681"
    },
    {
        "id": "GHSA-27h2-hvpr-p74q",
        "cve_id": "CVE-2022-23529",
        "title": "Remote Code Execution in jsonwebtoken verify",
        "ecosystem": "npm",
        "package": "jsonwebtoken",
        "severity": "CRITICAL",
        "cvss": 9.8,
        "published": "2022-12-21",
        "summary": "Passing crafted key objects allows attacker to trigger arbitrary code execution during secret verification.",
        "source": "OSV / NVD",
        "url": "https://nvd.nist.gov/vuln/detail/CVE-2022-23529"
    }
]

@router.get("/advisories")
def get_threat_advisories(
    ecosystem: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None
):
    results = GLOBAL_ADVISORIES
    if ecosystem and ecosystem != "all":
        results = [a for a in results if a["ecosystem"].lower() == ecosystem.lower()]
    if severity and severity != "all":
        results = [a for a in results if a["severity"].lower() == severity.lower()]
    if search:
        s = search.lower()
        results = [a for a in results if s in a["package"].lower() or s in a["cve_id"].lower() or s in a["title"].lower()]
    return results
