// ============================================================
// Shared TypeScript types for SecureSphere
// ============================================================

// ─── Auth ────────────────────────────────────────────────────
export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  githubConnected: boolean;
  createdAt: string;
  emailVerified: boolean;
  preferences: UserPreferences;
}

export type UserRole = 'developer' | 'security_engineer' | 'devops' | 'student' | 'researcher' | 'other';

export interface UserPreferences {
  interests: string[];
  notifyOnCritical: boolean;
  notifyOnHigh: boolean;
  weeklyReport: boolean;
  theme: 'dark';
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt?: string;
}

export interface LoginPayload {
  identifier: string; // email or username
  password: string;
  rememberMe: boolean;
}

export interface RegisterPayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

// ─── Repository ──────────────────────────────────────────────
export interface Repository {
  id: string;
  userId: string;
  name: string;
  fullName: string; // e.g. "owner/repo"
  url: string;
  description?: string;
  language?: string;
  stars?: number;
  isPrivate: boolean;
  lastScannedAt?: string;
  lastScanId?: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  status: RepoStatus;
  createdAt: string;
}

export type RepoStatus = 'active' | 'scanning' | 'error' | 'pending';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'safe';

// ─── Scan ────────────────────────────────────────────────────
export interface Scan {
  id: string;
  repositoryId: string;
  status: ScanStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  dependenciesScanned: number;
  vulnerabilitiesFound: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  error?: string;
}

export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed';

// ─── Vulnerability ───────────────────────────────────────────
export interface Vulnerability {
  id: string;
  scanId: string;
  repositoryId: string;
  osvId?: string;
  cveId?: string;
  ghsaId?: string;
  packageName: string;
  packageVersion: string;
  ecosystem: Ecosystem;
  severity: Severity;
  cvssScore?: number;
  title: string;
  description: string;
  affectedVersions: string[];
  fixedVersion?: string;
  references: string[];
  publishedAt: string;
  modifiedAt: string;
  aiExplanation?: string;
  aiFixSuggestion?: string;
  isFixed: boolean;
}

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type Ecosystem = 'npm' | 'PyPI' | 'Maven' | 'Go' | 'RubyGems' | 'NuGet' | 'Cargo' | 'Hex' | 'Pub' | 'Other';

// ─── Dependency ──────────────────────────────────────────────
export interface Dependency {
  id: string;
  repositoryId: string;
  name: string;
  version: string;
  latestVersion?: string;
  ecosystem: Ecosystem;
  isOutdated: boolean;
  isDirect: boolean;
  depth: number;
  license?: string;
  licenseRisk: 'safe' | 'moderate' | 'restrictive' | 'unknown';
  vulnerabilityCount: number;
  riskScore: number;
  dependents: string[]; // package names that depend on this
  dependencies: string[]; // package names this depends on
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  label: string;
  version: string;
  riskScore: number;
  severity?: Severity;
  isDirect: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────
export interface DashboardStats {
  overallRiskScore: number;
  riskLevel: RiskLevel;
  totalRepositories: number;
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalDependencies: number;
  outdatedDependencies: number;
  lastScanAt?: string;
  recentActivity: ActivityItem[];
  trendData: TrendPoint[];
  topVulnerablePackages: TopPackage[];
}

export interface ActivityItem {
  id: string;
  type: 'scan_complete' | 'vuln_found' | 'repo_added' | 'fix_available' | 'alert';
  title: string;
  description: string;
  severity?: Severity;
  timestamp: string;
  repositoryName?: string;
}

export interface TrendPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TopPackage {
  name: string;
  ecosystem: Ecosystem;
  criticalCount: number;
  highCount: number;
  totalVulns: number;
  riskScore: number;
}

// ─── AI ──────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relatedVulns?: string[]; // vuln IDs
}

export interface AIExplanation {
  vulnerabilityId: string;
  explanation: string;
  riskContext: string;
  fixSuggestion: string;
  codeExample?: string;
  references: string[];
}

// ─── Reports ─────────────────────────────────────────────────
export interface Report {
  id: string;
  userId: string;
  repositoryId?: string;
  title: string;
  type: 'full' | 'executive' | 'dependency' | 'vulnerability';
  format: 'json' | 'pdf' | 'html';
  status: 'generating' | 'ready' | 'failed';
  generatedAt?: string;
  downloadUrl?: string;
  scanId?: string;
  summary: ReportSummary;
}

export interface ReportSummary {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  riskScore: number;
  repositoryName?: string;
  topFindings: string[];
}

// ─── API Response Wrapper ─────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

// ─── Monitoring ───────────────────────────────────────────────
export interface MonitoringConfig {
  id: string;
  repositoryId: string;
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly';
  alertSeverities: Severity[];
  webhookUrl?: string;
  emailAlerts: boolean;
}
