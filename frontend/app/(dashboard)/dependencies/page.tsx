'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, TrendingUp, AlertTriangle, CheckCircle, ChevronUp, ChevronDown,
  Search, ArrowUp, Shield
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Progress from '@/components/ui/Progress';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { ecosystemConfig } from '@/lib/utils';
import type { Dependency } from '@/lib/types';

const mockDeps: Dependency[] = [
  { id: '1', repositoryId: 'r1', name: 'express', version: '4.18.2', latestVersion: '4.19.2', ecosystem: 'npm', isOutdated: true, isDirect: true, depth: 0, license: 'MIT', licenseRisk: 'safe', vulnerabilityCount: 2, riskScore: 72, dependents: [], dependencies: ['qs', 'body-parser'] },
  { id: '2', repositoryId: 'r1', name: 'lodash', version: '4.17.15', latestVersion: '4.17.21', ecosystem: 'npm', isOutdated: true, isDirect: true, depth: 0, license: 'MIT', licenseRisk: 'safe', vulnerabilityCount: 7, riskScore: 85, dependents: [], dependencies: [] },
  { id: '3', repositoryId: 'r1', name: 'react', version: '18.3.1', latestVersion: '18.3.1', ecosystem: 'npm', isOutdated: false, isDirect: true, depth: 0, license: 'MIT', licenseRisk: 'safe', vulnerabilityCount: 0, riskScore: 5, dependents: [], dependencies: [] },
  { id: '4', repositoryId: 'r1', name: 'requests', version: '2.31.0', latestVersion: '2.32.0', ecosystem: 'PyPI', isOutdated: true, isDirect: true, depth: 0, license: 'Apache-2.0', licenseRisk: 'safe', vulnerabilityCount: 1, riskScore: 48, dependents: [], dependencies: [] },
  { id: '5', repositoryId: 'r1', name: 'axios', version: '1.7.2', latestVersion: '1.7.4', ecosystem: 'npm', isOutdated: true, isDirect: true, depth: 0, license: 'MIT', licenseRisk: 'safe', vulnerabilityCount: 0, riskScore: 20, dependents: [], dependencies: [] },
  { id: '6', repositoryId: 'r1', name: 'qs', version: '6.5.2', latestVersion: '6.11.0', ecosystem: 'npm', isOutdated: true, isDirect: false, depth: 1, license: 'BSD-3-Clause', licenseRisk: 'safe', vulnerabilityCount: 1, riskScore: 65, dependents: ['express'], dependencies: [] },
  { id: '7', repositoryId: 'r1', name: 'body-parser', version: '1.20.2', latestVersion: '1.20.3', ecosystem: 'npm', isOutdated: true, isDirect: false, depth: 1, license: 'MIT', licenseRisk: 'safe', vulnerabilityCount: 0, riskScore: 15, dependents: ['express'], dependencies: [] },
  { id: '8', repositoryId: 'r1', name: 'flask', version: '2.3.2', latestVersion: '3.0.3', ecosystem: 'PyPI', isOutdated: true, isDirect: true, depth: 0, license: 'BSD-3-Clause', licenseRisk: 'safe', vulnerabilityCount: 0, riskScore: 25, dependents: [], dependencies: ['werkzeug'] },
];

function EcosystemBadge({ ecosystem }: { ecosystem: string }) {
  const cfg = ecosystemConfig[ecosystem] ?? { label: ecosystem, color: '#6B7280' };
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-[#2A3A48] text-[#9BA9B7]">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ dep }: { dep: Dependency }) {
  if (dep.vulnerabilityCount > 0) {
    return <Badge variant="critical" dot>Vulnerable</Badge>;
  }
  if (dep.isOutdated) {
    return <Badge variant="medium" dot>Outdated</Badge>;
  }
  return <Badge variant="emerald" dot>Up to date</Badge>;
}

export default function DependenciesPage() {
  const [deps, setDeps] = useState<Dependency[]>(mockDeps);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'riskScore' | 'vulnerabilityCount'>('riskScore');
  const [sortAsc, setSortAsc] = useState(false);

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(false); }
  };

  const filtered = deps.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'outdated') return matchSearch && d.isOutdated;
    if (activeTab === 'vulnerable') return matchSearch && d.vulnerabilityCount > 0;
    if (activeTab === 'direct') return matchSearch && d.isDirect;
    return matchSearch;
  }).sort((a, b) => {
    const mult = sortAsc ? 1 : -1;
    if (sortBy === 'name') return mult * a.name.localeCompare(b.name);
    if (sortBy === 'riskScore') return mult * (a.riskScore - b.riskScore);
    return mult * (a.vulnerabilityCount - b.vulnerabilityCount);
  });

  const stats = {
    total: deps.length,
    outdated: deps.filter(d => d.isOutdated).length,
    vulnerable: deps.filter(d => d.vulnerabilityCount > 0).length,
    direct: deps.filter(d => d.isDirect).length,
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    sortBy === col
      ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
      : <ChevronDown size={12} className="opacity-30" />
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#F4F7FA]">Dependencies</h1>
        <p className="text-xs text-[#9BA9B7] mt-0.5">Package health and dependency intelligence</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Packages', value: stats.total, icon: <Package size={18} />, color: 'text-cyan', bg: 'bg-cyan/10' },
          { label: 'Direct', value: stats.direct, icon: <Package size={18} />, color: 'text-emerald', bg: 'bg-emerald/10' },
          { label: 'Outdated', value: stats.outdated, icon: <TrendingUp size={18} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Vulnerable', value: stats.vulnerable, icon: <Shield size={18} />, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(item => (
          <Card key={item.label} className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0`}>
              {item.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-[#F4F7FA]">{item.value}</p>
              <p className="text-xs text-[#9BA9B7]">{item.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Tabs
          tabs={[
            { id: 'all', label: 'All', badge: stats.total },
            { id: 'direct', label: 'Direct', badge: stats.direct },
            { id: 'outdated', label: 'Outdated', badge: stats.outdated },
            { id: 'vulnerable', label: 'Vulnerable', badge: stats.vulnerable },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <Input
          placeholder="Search packages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={15} />}
          wrapperClassName="flex-1 min-w-48 max-w-xs"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A3A48] bg-[#18232D]">
                {[
                  { key: 'name', label: 'Package' },
                  { key: null, label: 'Ecosystem' },
                  { key: null, label: 'Version → Latest' },
                  { key: null, label: 'Status' },
                  { key: 'vulnerabilityCount', label: 'Vulns' },
                  { key: 'riskScore', label: 'Risk Score' },
                  { key: null, label: 'License' },
                ].map(({ key, label }) => (
                  <th
                    key={label}
                    onClick={() => key && toggleSort(key as typeof sortBy)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-[#9BA9B7] uppercase tracking-wide whitespace-nowrap ${key ? 'cursor-pointer hover:text-[#F4F7FA]' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {key && <SortIcon col={key as typeof sortBy} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3A48]/50">
              {filtered.map(dep => (
                <motion.tr
                  key={dep.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#18232D]/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-[#F4F7FA]">{dep.name}</code>
                      {!dep.isDirect && (
                        <span className="text-[10px] text-[#9BA9B7] border border-[#2A3A48] px-1.5 py-0.5 rounded">transitive</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <EcosystemBadge ecosystem={dep.ecosystem} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs font-mono text-[#9BA9B7]">{dep.version}</code>
                      {dep.isOutdated && dep.latestVersion && (
                        <>
                          <ArrowUp size={12} className="text-yellow-400" />
                          <code className="text-xs font-mono text-yellow-400">{dep.latestVersion}</code>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge dep={dep} />
                  </td>
                  <td className="px-4 py-3">
                    {dep.vulnerabilityCount > 0 ? (
                      <span className="text-sm font-bold text-red-400">{dep.vulnerabilityCount}</span>
                    ) : (
                      <span className="text-sm text-emerald">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <Progress
                        value={dep.riskScore}
                        size="sm"
                        color={dep.riskScore >= 70 ? 'critical' : dep.riskScore >= 40 ? 'medium' : 'low'}
                        className="w-16"
                      />
                      <span className="text-xs font-mono text-[#F4F7FA]">{dep.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${dep.licenseRisk === 'safe' ? 'text-emerald' : dep.licenseRisk === 'restrictive' ? 'text-red-400' : 'text-[#9BA9B7]'}`}>
                      {dep.license ?? 'Unknown'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Package size={36} className="text-[#2A3A48] mx-auto mb-3" />
              <p className="text-sm text-[#9BA9B7]">No dependencies match your search</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
