'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, AlertCircle, Info, TrendingUp, TrendingDown,
  GitBranch, Package, Clock, Plus, ArrowRight, Zap
} from 'lucide-react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { SeverityBadge } from '@/components/ui/Badge';
import RiskScoreGauge from '@/components/charts/RiskScoreGauge';
import VulnerabilityTrendChart from '@/components/charts/VulnerabilityTrendChart';
import SeverityPieChart from '@/components/charts/SeverityPieChart';
import { dashboardApi } from '@/lib/api';
import { timeAgo, formatNumber } from '@/lib/utils';
import type { DashboardStats } from '@/lib/types';

// ─── Mock data for initial / empty state ─────────────────────
const mockStats: DashboardStats = {
  overallRiskScore: 62,
  riskLevel: 'high',
  totalRepositories: 3,
  totalVulnerabilities: 47,
  criticalCount: 4,
  highCount: 12,
  mediumCount: 21,
  lowCount: 10,
  totalDependencies: 284,
  outdatedDependencies: 38,
  lastScanAt: new Date(Date.now() - 3600000).toISOString(),
  recentActivity: [
    { id: '1', type: 'scan_complete', title: 'Scan completed', description: 'my-web-app — 47 vulnerabilities found', severity: 'HIGH', timestamp: new Date(Date.now() - 3600000).toISOString(), repositoryName: 'my-web-app' },
    { id: '2', type: 'vuln_found', title: 'Critical CVE detected', description: 'CVE-2024-1234 in lodash@4.17.15', severity: 'CRITICAL', timestamp: new Date(Date.now() - 7200000).toISOString(), repositoryName: 'api-service' },
    { id: '3', type: 'fix_available', title: 'Fix available', description: 'Update express to 4.19.2 to patch 3 vulnerabilities', severity: 'HIGH', timestamp: new Date(Date.now() - 86400000).toISOString(), repositoryName: 'my-web-app' },
    { id: '4', type: 'repo_added', title: 'Repository added', description: 'api-service connected and scanned', timestamp: new Date(Date.now() - 172800000).toISOString() },
    { id: '5', type: 'alert', title: 'High severity alert', description: 'New GHSA advisory affects 2 of your packages', severity: 'HIGH', timestamp: new Date(Date.now() - 259200000).toISOString() },
  ],
  trendData: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
    critical: Math.floor(Math.random() * 3) + 2,
    high: Math.floor(Math.random() * 8) + 8,
    medium: Math.floor(Math.random() * 10) + 15,
    low: Math.floor(Math.random() * 6) + 7,
  })),
  topVulnerablePackages: [
    { name: 'lodash', ecosystem: 'npm', criticalCount: 2, highCount: 3, totalVulns: 7, riskScore: 85 },
    { name: 'express', ecosystem: 'npm', criticalCount: 1, highCount: 2, totalVulns: 5, riskScore: 72 },
    { name: 'requests', ecosystem: 'PyPI', criticalCount: 0, highCount: 4, totalVulns: 4, riskScore: 60 },
    { name: 'django', ecosystem: 'PyPI', criticalCount: 1, highCount: 1, totalVulns: 3, riskScore: 55 },
  ],
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  change?: number;
  href?: string;
}

function StatCard({ label, value, icon, color, bg, change, href }: StatCardProps) {
  const content = (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-[#9BA9B7] font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold text-[#F4F7FA]">{formatNumber(value)}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${change > 0 ? 'text-red-400' : 'text-emerald'}`}>
            {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(change)} from last scan</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`} style={{ color }}>
        {icon}
      </div>
    </div>
  );

  if (href) {
    return (
      <Card hover className="p-5 cursor-pointer">
        <Link href={href}>{content}</Link>
      </Card>
    );
  }

  return <Card className="p-5">{content}</Card>;
}

function ActivityIcon({ type }: { type: string }) {
  const configs = {
    scan_complete: { icon: <Shield size={14} />, color: 'text-emerald', bg: 'bg-emerald/10' },
    vuln_found:    { icon: <AlertTriangle size={14} />, color: 'text-red-400', bg: 'bg-red-500/10' },
    fix_available: { icon: <Zap size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    repo_added:    { icon: <GitBranch size={14} />, color: 'text-cyan', bg: 'bg-cyan/10' },
    alert:         { icon: <AlertCircle size={14} />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  };
  const cfg = configs[type as keyof typeof configs] ?? configs.alert;
  return (
    <div className={`w-7 h-7 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0`}>
      {cfg.icon}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch(() => setStats(mockStats))
      .finally(() => setLoading(false));
  }, []);

  const data = stats ?? mockStats;

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-28 bg-[#202C37] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-72 bg-[#202C37] rounded-xl lg:col-span-2" />
          <div className="h-72 bg-[#202C37] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F4F7FA]">Security Dashboard</h1>
          {data.lastScanAt && (
            <p className="text-xs text-[#9BA9B7] mt-0.5">
              Last scan: {timeAgo(data.lastScanAt)}
            </p>
          )}
        </div>
        <Link href="/repositories">
          <Button leftIcon={<Plus size={16} />} size="sm">New Scan</Button>
        </Link>
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard label="Critical" value={data.criticalCount} icon={<Shield size={22} />} color="#EF4444" bg="bg-red-500/15" change={2} href="/vulnerabilities?severity=CRITICAL" />
        <StatCard label="High" value={data.highCount} icon={<AlertTriangle size={22} />} color="#F97316" bg="bg-orange-500/15" change={-1} href="/vulnerabilities?severity=HIGH" />
        <StatCard label="Medium" value={data.mediumCount} icon={<AlertCircle size={22} />} color="#EAB308" bg="bg-yellow-500/15" href="/vulnerabilities?severity=MEDIUM" />
        <StatCard label="Low" value={data.lowCount} icon={<Info size={22} />} color="#3B82F6" bg="bg-blue-500/15" href="/vulnerabilities?severity=LOW" />
      </motion.div>

      {/* Middle row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Risk score + trend */}
        <Card className="p-6 lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Overview</CardTitle>
            <Badge variant={data.riskLevel === 'critical' || data.riskLevel === 'high' ? 'critical' : data.riskLevel === 'medium' ? 'medium' : 'emerald'}>
              {data.totalRepositories} Repositories
            </Badge>
          </CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <RiskScoreGauge score={data.overallRiskScore} size="md" />
            </div>
            <div className="flex-1 w-full">
              <p className="text-xs text-[#9BA9B7] mb-3 font-medium">7-Day Vulnerability Trend</p>
              <VulnerabilityTrendChart data={data.trendData} />
            </div>
          </div>
        </Card>

        {/* Activity timeline */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <span className="text-xs text-[#9BA9B7]">Last 7 days</span>
          </CardHeader>
          <div className="space-y-3">
            {data.recentActivity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <ActivityIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#F4F7FA] truncate">{item.title}</p>
                  <p className="text-xs text-[#9BA9B7] truncate">{item.description}</p>
                  <p className="text-[10px] text-[#9BA9B7]/60 mt-0.5">{timeAgo(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Bottom row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Top vulnerable packages */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Top Vulnerable Packages</CardTitle>
            <Link href="/vulnerabilities" className="text-xs text-emerald hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {data.topVulnerablePackages.map((pkg, i) => (
              <div key={pkg.name} className="flex items-center gap-3">
                <span className="text-xs text-[#9BA9B7] w-4 font-mono">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[#F4F7FA]">{pkg.name}</span>
                    <Badge variant="outline" size="sm">{pkg.ecosystem}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {pkg.criticalCount > 0 && <span className="text-xs text-red-400">{pkg.criticalCount} critical</span>}
                    {pkg.highCount > 0 && <span className="text-xs text-orange-400">{pkg.highCount} high</span>}
                    <span className="text-xs text-[#9BA9B7]">{pkg.totalVulns} total</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold" style={{ color: pkg.riskScore >= 70 ? '#EF4444' : pkg.riskScore >= 50 ? '#F97316' : '#EAB308' }}>
                    {pkg.riskScore}
                  </span>
                  <p className="text-[10px] text-[#9BA9B7]">risk</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Severity distribution + dependency health */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Vulnerability Distribution</CardTitle>
            <span className="text-xs text-[#9BA9B7]">{data.totalVulnerabilities} total</span>
          </CardHeader>
          <SeverityPieChart
            data={{
              critical: data.criticalCount,
              high: data.highCount,
              medium: data.mediumCount,
              low: data.lowCount,
            }}
          />
          <div className="mt-4 pt-4 border-t border-[#2A3A48] grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#F4F7FA]">{data.totalDependencies}</p>
              <p className="text-xs text-[#9BA9B7]">Dependencies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{data.outdatedDependencies}</p>
              <p className="text-xs text-[#9BA9B7]">Outdated</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
