from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(100), default="Security Lead")
    professional_interests = Column(String(500), default="Application Security, Dependency Intelligence")
    avatar_url = Column(String(500), nullable=True)
    github_connected = Column(Boolean, default=False)
    github_username = Column(String(100), nullable=True)
    github_access_token = Column(String(255), nullable=True)
    notification_preferences = Column(JSON, default=lambda: {"email": True, "critical_alerts": True, "weekly_digest": True})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    repositories = relationship("Repository", back_populates="owner", cascade="all, delete-orphan")
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("SecurityReport", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="user", cascade="all, delete-orphan")
    integrations = relationship("IntegrationSetting", back_populates="user", cascade="all, delete-orphan")


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(500), unique=True, index=True, nullable=False)
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(255), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(500), nullable=False)
    default_branch = Column(String(100), default="main")
    ecosystem = Column(String(100), default="npm")  # npm, PyPI, Maven, Packagist, Cargo
    is_demo = Column(Boolean, default=False)
    last_scanned_at = Column(DateTime, nullable=True)
    risk_score = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="repositories")
    scans = relationship("Scan", back_populates="repository", cascade="all, delete-orphan")
    dependencies = relationship("Dependency", back_populates="repository", cascade="all, delete-orphan")
    monitoring = relationship("MonitoringSchedule", back_populates="repository", uselist=False, cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="pending")  # pending, processing, analyzing, completed, failed
    risk_score = Column(Float, default=100.0)
    total_dependencies = Column(Integer, default=0)
    total_vulnerabilities = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    duration_seconds = Column(Float, default=0.0)
    manifest_files = Column(JSON, default=list)  # list of files scanned
    scan_summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="scans")
    user = relationship("User", back_populates="scans")
    dependencies = relationship("Dependency", back_populates="scan", cascade="all, delete-orphan")
    vulnerabilities = relationship("Vulnerability", back_populates="scan", cascade="all, delete-orphan")
    package_risks = relationship("PackageRisk", back_populates="scan", cascade="all, delete-orphan")


class Dependency(Base):
    __tablename__ = "dependencies"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    version = Column(String(100), nullable=False)
    ecosystem = Column(String(100), nullable=False)
    dependency_type = Column(String(50), default="direct")  # direct, transitive
    parent_dependency = Column(String(255), nullable=True)
    latest_version = Column(String(100), nullable=True)
    license = Column(String(100), default="MIT")
    is_vulnerable = Column(Boolean, default=False)
    risk_score = Column(Float, default=0.0)
    repository_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="dependencies")
    repository = relationship("Repository", back_populates="dependencies")
    vulnerabilities = relationship("Vulnerability", back_populates="dependency")


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    dependency_id = Column(Integer, ForeignKey("dependencies.id"), nullable=True)
    vuln_id = Column(String(100), nullable=False, index=True)  # CVE-..., GHSA-...
    package_name = Column(String(255), nullable=False, index=True)
    ecosystem = Column(String(100), nullable=False)
    installed_version = Column(String(100), nullable=False)
    affected_range = Column(String(255), nullable=True)
    severity = Column(String(50), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    cvss_score = Column(Float, nullable=True)
    summary = Column(Text, nullable=False)
    details = Column(Text, nullable=True)
    published_at = Column(String(100), nullable=True)
    fixed_version = Column(String(100), nullable=True)
    advisory_url = Column(String(500), nullable=True)
    remediation_instructions = Column(Text, nullable=True)
    status = Column(String(50), default="unresolved")  # unresolved, resolved, ignored
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="vulnerabilities")
    dependency = relationship("Dependency", back_populates="vulnerabilities")


class PackageRisk(Base):
    __tablename__ = "package_risks"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    package_name = Column(String(255), nullable=False, index=True)
    ecosystem = Column(String(100), nullable=False)
    version = Column(String(100), nullable=False)
    risk_score = Column(Float, default=0.0)  # 0 to 100
    risk_classification = Column(String(50), default="LOW_RISK")  # MALICIOUS, SUSPICIOUS, HIGH_RISK, MEDIUM_RISK, LOW_RISK, CLEAN
    evidence = Column(JSON, default=list)
    potential_impact = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="package_risks")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)
    title = Column(String(255), default="Security Investigation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="ai_conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"), nullable=False)
    sender = Column(String(50), default="user")  # user, assistant
    content = Column(Text, nullable=False)
    citations = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("AIConversation", back_populates="messages")


class SecurityReport(Base):
    __tablename__ = "security_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), default="executive")  # executive, technical, audit
    file_format = Column(String(20), default="pdf")
    risk_score = Column(Float, default=100.0)
    summary = Column(Text, nullable=True)
    html_content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), default="vulnerability")  # vulnerability, advisory, scan_completed, alert
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(50), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    is_read = Column(Boolean, default=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Remediation(Base):
    __tablename__ = "remediations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vulnerability_id = Column(Integer, ForeignKey("vulnerabilities.id"), nullable=False)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    action_taken = Column(String(255), nullable=False)
    status = Column(String(50), default="completed")  # pending, completed, dismissed
    notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, default=datetime.utcnow)


class MonitoringSchedule(Base):
    __tablename__ = "monitoring_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    frequency = Column(String(50), default="daily")  # daily, weekly, manual
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="monitoring")


class IntegrationSetting(Base):
    __tablename__ = "integration_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_name = Column(String(100), nullable=False)  # github, osv, gemini, openai, email
    is_connected = Column(Boolean, default=False)
    config_metadata = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="integrations")
