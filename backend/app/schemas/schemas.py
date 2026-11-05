from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Authentication Schemas ---
class UserCreate(BaseModel):
    full_name: str
    username: str
    email: str
    password: str
    role: Optional[str] = "Security Engineer"
    professional_interests: Optional[str] = "AppSec, Vulnerability Management"

class UserLogin(BaseModel):
    email: str  # email or username
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    professional_interests: Optional[str] = None
    avatar_url: Optional[str] = None
    notification_preferences: Optional[Dict[str, Any]] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: Optional[str]
    professional_interests: Optional[str]
    avatar_url: Optional[str]
    github_connected: bool
    github_username: Optional[str]
    notification_preferences: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None


# --- Repository Schemas ---
class RepositoryCreate(BaseModel):
    name: str
    url: str
    ecosystem: Optional[str] = "npm"
    description: Optional[str] = None
    default_branch: Optional[str] = "main"

class RepositoryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    full_name: str
    description: Optional[str]
    url: str
    default_branch: str
    ecosystem: str
    is_demo: bool
    last_scanned_at: Optional[datetime]
    risk_score: float
    created_at: datetime

    class Config:
        from_attributes = True


# --- Vulnerability Schemas ---
class VulnerabilityResponse(BaseModel):
    id: int
    scan_id: int
    dependency_id: Optional[int]
    vuln_id: str
    package_name: str
    ecosystem: str
    installed_version: str
    affected_range: Optional[str]
    severity: str
    cvss_score: Optional[float]
    summary: str
    details: Optional[str]
    published_at: Optional[str]
    fixed_version: Optional[str]
    advisory_url: Optional[str]
    remediation_instructions: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class VulnerabilityStatusUpdate(BaseModel):
    status: str  # unresolved, resolved, ignored
    notes: Optional[str] = None


# --- Dependency Schemas ---
class DependencyResponse(BaseModel):
    id: int
    scan_id: int
    repository_id: int
    name: str
    version: str
    ecosystem: str
    dependency_type: str
    parent_dependency: Optional[str]
    latest_version: Optional[str]
    license: Optional[str]
    is_vulnerable: bool
    risk_score: float
    repository_url: Optional[str]
    vulnerabilities: Optional[List[VulnerabilityResponse]] = []

    class Config:
        from_attributes = True


# --- Package Risk Schemas ---
class PackageRiskResponse(BaseModel):
    id: int
    scan_id: int
    package_name: str
    ecosystem: str
    version: str
    risk_score: float
    risk_classification: str
    evidence: List[Any]
    potential_impact: Optional[str]
    recommended_action: Optional[str]

    class Config:
        from_attributes = True


# --- Scan Schemas ---
class ScanCreate(BaseModel):
    repository_id: int

class ScanResponse(BaseModel):
    id: int
    repository_id: int
    user_id: int
    status: str
    risk_score: float
    total_dependencies: int
    total_vulnerabilities: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    duration_seconds: float
    manifest_files: List[Any]
    scan_summary: Optional[str]
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ScanDetailResponse(ScanResponse):
    dependencies: List[DependencyResponse] = []
    vulnerabilities: List[VulnerabilityResponse] = []
    package_risks: List[PackageRiskResponse] = []


# --- AI Chat Schemas ---
class AIQueryRequest(BaseModel):
    message: str
    repository_id: Optional[int] = None
    vulnerability_id: Optional[str] = None
    package_name: Optional[str] = None
    conversation_id: Optional[int] = None

class AIMessageResponse(BaseModel):
    id: int
    sender: str
    content: str
    citations: Optional[List[Any]] = []
    created_at: datetime

    class Config:
        from_attributes = True

class AIConversationResponse(BaseModel):
    id: int
    title: str
    repository_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    messages: List[AIMessageResponse] = []

    class Config:
        from_attributes = True


# --- Report Schemas ---
class ReportGenerateRequest(BaseModel):
    repository_id: int
    scan_id: Optional[int] = None
    report_type: Optional[str] = "executive"  # executive, technical, audit

class ReportResponse(BaseModel):
    id: int
    user_id: int
    repository_id: int
    scan_id: int
    title: str
    report_type: str
    file_format: str
    risk_score: float
    summary: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    severity: str
    is_read: bool
    link: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Monitoring Schemas ---
class MonitoringScheduleCreate(BaseModel):
    repository_id: int
    frequency: str = "daily"  # daily, weekly, manual
    is_active: bool = True

class MonitoringScheduleResponse(BaseModel):
    id: int
    repository_id: int
    frequency: str
    is_active: bool
    last_run_at: Optional[datetime]
    next_run_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Integration Schemas ---
class IntegrationUpdate(BaseModel):
    service_name: str
    is_connected: bool
    config_metadata: Optional[Dict[str, Any]] = None

class IntegrationResponse(BaseModel):
    id: int
    service_name: str
    is_connected: bool
    config_metadata: Optional[Dict[str, Any]]
    updated_at: datetime

    class Config:
        from_attributes = True
