import json
import re
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional

class ManifestParser:
    @staticmethod
    def parse_package_json(content: str) -> List[Dict[str, Any]]:
        """Parses npm package.json"""
        results = []
        try:
            data = json.loads(content)
            deps = data.get("dependencies", {})
            for name, ver in deps.items():
                clean_ver = re.sub(r'[\^~>=<]', '', ver).strip()
                results.append({
                    "name": name,
                    "version": clean_ver or "1.0.0",
                    "ecosystem": "npm",
                    "dependency_type": "direct",
                    "parent_dependency": None
                })
            dev_deps = data.get("devDependencies", {})
            for name, ver in dev_deps.items():
                clean_ver = re.sub(r'[\^~>=<]', '', ver).strip()
                results.append({
                    "name": name,
                    "version": clean_ver or "1.0.0",
                    "ecosystem": "npm",
                    "dependency_type": "direct",
                    "parent_dependency": None
                })
        except Exception:
            pass
        return results

    @staticmethod
    def parse_package_lock_json(content: str) -> List[Dict[str, Any]]:
        """Parses npm package-lock.json (handles v1, v2, v3 formats)"""
        results = []
        try:
            data = json.loads(content)
            # v2/v3 packages object
            if "packages" in data and isinstance(data["packages"], dict):
                for pkg_path, info in data["packages"].items():
                    if not pkg_path:  # root project
                        continue
                    name = info.get("name")
                    if not name:
                        parts = pkg_path.split("node_modules/")
                        name = parts[-1] if parts else pkg_path
                    ver = info.get("version", "1.0.0")
                    is_dev = info.get("dev", False)
                    # if nested in node_modules, transitive
                    is_transitive = pkg_path.count("node_modules/") > 1
                    parent = None
                    if is_transitive:
                        parts = pkg_path.split("node_modules/")
                        if len(parts) >= 2:
                            parent = parts[-2].rstrip('/')
                    results.append({
                        "name": name,
                        "version": ver,
                        "ecosystem": "npm",
                        "dependency_type": "transitive" if is_transitive else "direct",
                        "parent_dependency": parent
                    })
            # v1 dependencies object fallback
            elif "dependencies" in data and isinstance(data["dependencies"], dict):
                def walk_v1(deps_dict, parent_name=None):
                    for name, details in deps_dict.items():
                        ver = details.get("version", "1.0.0")
                        results.append({
                            "name": name,
                            "version": ver,
                            "ecosystem": "npm",
                            "dependency_type": "transitive" if parent_name else "direct",
                            "parent_dependency": parent_name
                        })
                        if "dependencies" in details:
                            walk_v1(details["dependencies"], name)
                walk_v1(data["dependencies"])
        except Exception:
            pass
        return results

    @staticmethod
    def parse_requirements_txt(content: str) -> List[Dict[str, Any]]:
        """Parses PyPI requirements.txt"""
        results = []
        lines = content.splitlines()
        for line in lines:
            line = line.strip()
            if not line or line.startswith("#") or line.startswith("-"):
                continue
            # match name and version operator
            match = re.match(r"^([a-zA-Z0-9_\-\.]+)(?:[=<>~~!]+([a-zA-Z0-9_\-\.]+))?", line)
            if match:
                name = match.group(1).strip()
                version = match.group(2).strip() if match.group(2) else "1.0.0"
                results.append({
                    "name": name,
                    "version": version,
                    "ecosystem": "PyPI",
                    "dependency_type": "direct",
                    "parent_dependency": None
                })
        return results

    @staticmethod
    def parse_pipfile_lock(content: str) -> List[Dict[str, Any]]:
        """Parses Pipfile.lock"""
        results = []
        try:
            data = json.loads(content)
            for section in ["default", "develop"]:
                pkgs = data.get(section, {})
                for name, info in pkgs.items():
                    ver = info.get("version", "").replace("==", "").strip()
                    results.append({
                        "name": name,
                        "version": ver or "1.0.0",
                        "ecosystem": "PyPI",
                        "dependency_type": "direct" if section == "default" else "direct",
                        "parent_dependency": None
                    })
        except Exception:
            pass
        return results

    @staticmethod
    def parse_poetry_lock(content: str) -> List[Dict[str, Any]]:
        """Parses poetry.lock (TOML format)"""
        results = []
        current_pkg = {}
        for line in content.splitlines():
            line = line.strip()
            if line == "[[package]]":
                if current_pkg and "name" in current_pkg:
                    results.append(current_pkg)
                current_pkg = {"ecosystem": "PyPI", "dependency_type": "direct", "parent_dependency": None}
            elif current_pkg:
                if line.startswith("name = "):
                    current_pkg["name"] = line.split("=")[1].strip().strip('"\'')
                elif line.startswith("version = "):
                    current_pkg["version"] = line.split("=")[1].strip().strip('"\'')
                elif line.startswith("category = "):
                    cat = line.split("=")[1].strip().strip('"\'')
                    if cat != "main":
                        current_pkg["dependency_type"] = "transitive"
        if current_pkg and "name" in current_pkg:
            results.append(current_pkg)
        return results

    @staticmethod
    def parse_pom_xml(content: str) -> List[Dict[str, Any]]:
        """Parses Maven pom.xml"""
        results = []
        try:
            # strip namespaces for easy parsing
            clean_xml = re.sub(r'\sxmlns="[^"]+"', '', content, count=1)
            root = ET.fromstring(clean_xml)
            for dep in root.findall(".//dependency"):
                group_id = dep.find("groupId")
                artifact_id = dep.find("artifactId")
                version = dep.find("version")
                scope = dep.find("scope")
                
                if group_id is not None and artifact_id is not None:
                    g = group_id.text.strip() if group_id.text else ""
                    a = artifact_id.text.strip() if artifact_id.text else ""
                    v = version.text.strip() if (version is not None and version.text) else "1.0.0"
                    pkg_name = f"{g}:{a}" if g else a
                    results.append({
                        "name": pkg_name,
                        "version": v,
                        "ecosystem": "Maven",
                        "dependency_type": "direct",
                        "parent_dependency": None
                    })
        except Exception:
            pass
        return results

    @staticmethod
    def parse_composer_lock(content: str) -> List[Dict[str, Any]]:
        """Parses PHP composer.lock"""
        results = []
        try:
            data = json.loads(content)
            for section in ["packages", "packages-dev"]:
                for pkg in data.get(section, []):
                    results.append({
                        "name": pkg.get("name", "unknown"),
                        "version": pkg.get("version", "1.0.0").lstrip("v"),
                        "ecosystem": "Packagist",
                        "dependency_type": "direct" if section == "packages" else "transitive",
                        "parent_dependency": None
                    })
        except Exception:
            pass
        return results

    @staticmethod
    def parse_cargo_lock(content: str) -> List[Dict[str, Any]]:
        """Parses Rust Cargo.lock"""
        results = []
        current_pkg = {}
        for line in content.splitlines():
            line = line.strip()
            if line == "[[package]]":
                if current_pkg and "name" in current_pkg:
                    results.append(current_pkg)
                current_pkg = {"ecosystem": "crates.io", "dependency_type": "direct", "parent_dependency": None}
            elif current_pkg:
                if line.startswith("name = "):
                    current_pkg["name"] = line.split("=")[1].strip().strip('"\'')
                elif line.startswith("version = "):
                    current_pkg["version"] = line.split("=")[1].strip().strip('"\'')
        if current_pkg and "name" in current_pkg:
            results.append(current_pkg)
        return results

    @classmethod
    def parse_file(cls, filename: str, content: str) -> List[Dict[str, Any]]:
        """Auto-detects format from filename and parses"""
        lower = filename.lower()
        if lower.endswith("package-lock.json"):
            return cls.parse_package_lock_json(content)
        elif lower.endswith("package.json"):
            return cls.parse_package_json(content)
        elif "requirements" in lower and lower.endswith(".txt"):
            return cls.parse_requirements_txt(content)
        elif lower.endswith("pipfile.lock"):
            return cls.parse_pipfile_lock(content)
        elif lower.endswith("poetry.lock"):
            return cls.parse_poetry_lock(content)
        elif lower.endswith("pom.xml"):
            return cls.parse_pom_xml(content)
        elif lower.endswith("composer.lock"):
            return cls.parse_composer_lock(content)
        elif lower.endswith("cargo.lock"):
            return cls.parse_cargo_lock(content)
        # fallback by content inspection
        if content.strip().startswith("{") and "dependencies" in content:
            return cls.parse_package_json(content)
        return cls.parse_requirements_txt(content)
