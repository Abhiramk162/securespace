import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';
import type { Severity, RiskLevel } from './types';

// ─── Tailwind class merger ────────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Date helpers ─────────────────────────────────────────────
export const timeAgo = (date: string): string =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatDate = (date: string, pattern = 'MMM d, yyyy'): string =>
  format(new Date(date), pattern);

export const formatDateTime = (date: string): string =>
  format(new Date(date), 'MMM d, yyyy HH:mm');

// ─── Severity helpers ─────────────────────────────────────────
export const severityConfig: Record<Severity, {
  label: string; color: string; bg: string; border: string; textColor: string;
}> = {
  CRITICAL: { label: 'Critical', color: '#EF4444', bg: 'bg-red-500/10', border: 'border-red-500/20', textColor: 'text-red-400' },
  HIGH:     { label: 'High',     color: '#F97316', bg: 'bg-orange-500/10', border: 'border-orange-500/20', textColor: 'text-orange-400' },
  MEDIUM:   { label: 'Medium',   color: '#EAB308', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', textColor: 'text-yellow-400' },
  LOW:      { label: 'Low',      color: '#3B82F6', bg: 'bg-blue-500/10', border: 'border-blue-500/20', textColor: 'text-blue-400' },
  UNKNOWN:  { label: 'Unknown',  color: '#6B7280', bg: 'bg-gray-500/10', border: 'border-gray-500/20', textColor: 'text-gray-400' },
};

export const getSeverityClass = (severity: Severity): string => {
  const cfg = severityConfig[severity];
  return `${cfg.bg} ${cfg.textColor} ${cfg.border} border rounded-full px-2.5 py-0.5 text-xs font-semibold`;
};

// ─── Risk score helpers ───────────────────────────────────────
export const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'safe';
};

export const riskLevelConfig: Record<RiskLevel, {
  label: string; color: string; bg: string; textColor: string; description: string;
}> = {
  critical: { label: 'Critical Risk', color: '#EF4444', bg: 'bg-red-500/10', textColor: 'text-red-400', description: 'Immediate action required' },
  high:     { label: 'High Risk', color: '#F97316', bg: 'bg-orange-500/10', textColor: 'text-orange-400', description: 'Address as soon as possible' },
  medium:   { label: 'Medium Risk', color: '#EAB308', bg: 'bg-yellow-500/10', textColor: 'text-yellow-400', description: 'Review and plan remediation' },
  low:      { label: 'Low Risk', color: '#3B82F6', bg: 'bg-blue-500/10', textColor: 'text-blue-400', description: 'Monitor and patch when convenient' },
  safe:     { label: 'Safe', color: '#20B486', bg: 'bg-emerald/10', textColor: 'text-emerald', description: 'No significant vulnerabilities detected' },
};

// ─── CVSS score helpers ───────────────────────────────────────
export const cvssToSeverity = (score: number): Severity => {
  if (score >= 9.0) return 'CRITICAL';
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  if (score > 0)    return 'LOW';
  return 'UNKNOWN';
};

// ─── Ecosystem icons / labels ─────────────────────────────────
export const ecosystemConfig: Record<string, { label: string; color: string }> = {
  npm:      { label: 'npm',      color: '#CB3837' },
  PyPI:     { label: 'PyPI',     color: '#3775A9' },
  Maven:    { label: 'Maven',    color: '#C71A36' },
  Go:       { label: 'Go',       color: '#00ADD8' },
  RubyGems: { label: 'RubyGems', color: '#E9573F' },
  NuGet:    { label: 'NuGet',    color: '#004880' },
  Cargo:    { label: 'Cargo',    color: '#DEA584' },
  Other:    { label: 'Other',    color: '#6B7280' },
};

// ─── Number formatting ────────────────────────────────────────
export const formatNumber = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
};

// ─── URL helpers ──────────────────────────────────────────────
export const getGitHubUrl = (fullName: string): string =>
  `https://github.com/${fullName}`;

export const getOsvUrl = (id: string): string =>
  `https://osv.dev/vulnerability/${id}`;

export const getNvdUrl = (cveId: string): string =>
  `https://nvd.nist.gov/vuln/detail/${cveId}`;
