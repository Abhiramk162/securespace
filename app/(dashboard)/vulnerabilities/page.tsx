'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, ChevronDown, ChevronUp, ExternalLink, AlertTriangle,
  CheckCircle, Filter, X, Lightbulb, BookOpen, Code2
} from 'lucide-react';
import { SeverityBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { vulnsApi, aiApi } from '@/lib/api';
import { timeAgo, getOsvUrl, getNvdUrl } from '@/lib/utils';
import type { Vulnerability, Severity } from '@/lib/types';
import toast from 'react-hot-toast';

// Mock vulnerabilities
const mockVulns: Vulnerability[] = [
  {
    id: 'v1', scanId: 's1', repositoryId: 'r1',
    osvId: 'GHSA-jfh8-c2jp-hdp8', cveId: 'CVE-2024-29041',
    packageName: 'express', packageVersion: '4.18.2', ecosystem: 'npm',
    severity: 'HIGH', cvssScore: 7.5,
    title: 'Express.js Open Redirect Vulnerability',
    description: 'Versions of Express.js prior to 4.19.2 and pre-release alpha and beta versions before 5.0.0-beta.3 are affected by an open redirect vulnerability using malformed URLs.',
    affectedVersions: ['< 4.19.2'], fixedVersion: '4.19.2',
    references: ['https://github.com/expressjs/express/security/advisories/GHSA-jfh8-c2jp-hdp8'],
    publishedAt: '2024-03-25T00:00:00Z', modifiedAt: '2024-03-25T00:00:00Z', isFixed: false,
  },
  {
    id: 'v2', scanId: 's1', repositoryId: 'r1',
    osvId: 'GHSA-29mw-wpgm-hmr9', cveId: 'CVE-2024-28863',
    packageName: 'node-tar', packageVersion: '6.1.11', ecosystem: 'npm',
    severity: 'CRITICAL', cvssScore: 9.1,
    title: 'node-tar Path Traversal Vulnerability',
    description: 'node-tar prior to version 6.2.1 has a path traversal vulnerability via the prefix option. A specially crafted tarball could potentially result in directories being created in locations outside the extraction destination.',
    affectedVersions: ['< 6.2.1'], fixedVersion: '6.2.1',
    references: ['https://github.com/npm/node-tar/security/advisories/GHSA-29mw-wpgm-hmr9'],
    publishedAt: '2024-03-21T00:00:00Z', modifiedAt: '2024-03-22T00:00:00Z', isFixed: false,
  },
  {
    id: 'v3', scanId: 's1', repositoryId: 'r1',
    osvId: 'GHSA-cxjh-pqwp-8mfp', cveId: 'CVE-2024-21538',
    packageName: 'cross-spawn', packageVersion: '7.0.3', ecosystem: 'npm',
    severity: 'MEDIUM', cvssScore: 5.6,
    title: 'cross-spawn ReDoS Vulnerability',
    description: 'Versions of the package cross-spawn before 7.0.5 are vulnerable to Regular Expression Denial of Service (ReDoS) due to improper input sanitization.',
    affectedVersions: ['< 7.0.5'], fixedVersion: '7.0.5',
    references: ['https://github.com/nicolo-ribaudo/cross-spawn/security/advisories'],
    publishedAt: '2024-11-08T00:00:00Z', modifiedAt: '2024-11-08T00:00:00Z', isFixed: false,
  },
  {
    id: 'v4', scanId: 's1', repositoryId: 'r1',
    osvId: 'PYSEC-2024-123', cveId: 'CVE-2024-35195',
    packageName: 'requests', packageVersion: '2.31.0', ecosystem: 'PyPI',
    severity: 'MEDIUM', cvssScore: 5.9,
    title: 'requests Proxy Credential Leak',
    description: 'When making requests through a Requests Session, if the first request is made with verify=False to disable cert verification, all subsequent requests to the same origin will continue ignoring cert verification regardless of the value of verify.',
    affectedVersions: ['< 2.32.0'], fixedVersion: '2.32.0',
    references: ['https://github.com/psf/requests/security/advisories/GHSA-9wx4-h78v-vm56'],
    publishedAt: '2024-05-20T00:00:00Z', modifiedAt: '2024-05-21T00:00:00Z', isFixed: false,
  },
  {
    id: 'v5', scanId: 's1', repositoryId: 'r1',
    osvId: 'GHSA-rv95-896h-c2vc', cveId: 'CVE-2022-24999',
    packageName: 'qs', packageVersion: '6.5.2', ecosystem: 'npm',
    severity: 'HIGH', cvssScore: 7.5,
    title: 'qs Prototype Pollution',
    description: 'qs before 6.10.3 allows attackers to cause a Node process hang for an Express application because an __ proto__ key can be used. In many typical Express use cases, an unauthenticated remote attacker can place the attack payload in the query string of the URL that is used to visit the application.',
    affectedVersions: ['< 6.10.3'], fixedVersion: '6.11.0',
    references: ['https://github.com/ljharb/qs/issues/438'],
    publishedAt: '2022-11-26T00:00:00Z', modifiedAt: '2022-12-02T00:00:00Z', isFixed: true,
  },
];

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

function VulnDetailPanel({ vuln, onClose }: { vuln: Vulnerability; onClose: () => void }) {
  const [aiExplanation, setAiExplanation] = useState<string>(vuln.aiExplanation ?? '');
  const [loadingAI, setLoadingAI] = useState(false);

  const loadAI = async () => {
    setLoadingAI(true);
    try {
      const res = await aiApi.explain(vuln.id);
      setAiExplanation(res.explanation);
    } catch {
      setAiExplanation(
        `**${vuln.title}** affects ${vuln.packageName}@${vuln.packageVersion}. ` +
        `This is a ${vuln.severity.toLowerCase()} severity vulnerability with CVSS score ${vuln.cvssScore ?? 'N/A'}. ` +
        `${vuln.description} ` +
        (vuln.fixedVersion ? `\n\n**Fix:** Upgrade to version ${vuln.fixedVersion}.` : '')
      );
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#18232D] border border-[#2A3A48] rounded-xl p-5 mx-1 mb-1 mt-1"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Details */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-[#F4F7FA] mb-1">{vuln.title}</h4>
            <p className="text-xs text-[#9BA9B7] leading-relaxed">{vuln.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-[#9BA9B7] mb-1">Package</p>
              <code className="text-sm font-mono text-cyan">{vuln.packageName}@{vuln.packageVersion}</code>
            </div>
            {vuln.fixedVersion && (
              <div>
                <p className="text-xs text-[#9BA9B7] mb-1">Fixed in</p>
                <code className="text-sm font-mono text-emerald">{vuln.fixedVersion}</code>
              </div>
            )}
            {vuln.cvssScore && (
              <div>
                <p className="text-xs text-[#9BA9B7] mb-1">CVSS Score</p>
                <span className="text-sm font-bold text-[#F4F7FA]">{vuln.cvssScore.toFixed(1)}</span>
              </div>
            )}
            <div>
              <p className="text-xs text-[#9BA9B7] mb-1">Published</p>
              <span className="text-sm text-[#F4F7FA]">{timeAgo(vuln.publishedAt)}</span>
            </div>
          </div>

          {/* References */}
          {vuln.references.length > 0 && (
            <div>
              <p className="text-xs text-[#9BA9B7] mb-2">References</p>
              <div className="space-y-1">
                {vuln.cveId && (
                  <a href={getNvdUrl(vuln.cveId)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-cyan hover:underline">
                    <ExternalLink size={11} /> {vuln.cveId} (NVD)
                  </a>
                )}
                {vuln.osvId && (
                  <a href={getOsvUrl(vuln.osvId)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-cyan hover:underline">
                    <ExternalLink size={11} /> {vuln.osvId} (OSV)
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Explanation */}
        <div className="bg-[#101820] border border-[#2A3A48] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald to-cyan flex items-center justify-center">
                <Lightbulb size={12} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-[#F4F7FA]">AI Analysis</span>
            </div>
            {!aiExplanation && (
              <Button size="sm" variant="outline" loading={loadingAI} onClick={loadAI}>
                Analyze
              </Button>
            )}
          </div>
          {aiExplanation ? (
            <p className="text-xs text-[#9BA9B7] leading-relaxed">{aiExplanation}</p>
          ) : (
            <div className="text-center py-4">
              <Lightbulb size={24} className="text-[#2A3A48] mx-auto mb-2" />
              <p className="text-xs text-[#9BA9B7]">Click Analyze to get an AI-powered explanation and fix recommendation</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function VulnerabilitiesPage() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'fixed' | 'unfixed'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    vulnsApi.list()
      .then(r => setVulns(r.items))
      .catch(() => setVulns(mockVulns))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vulns.filter(v => {
    const matchSearch = !search || v.packageName.toLowerCase().includes(search.toLowerCase()) ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.cveId?.includes(search) || v.osvId?.includes(search);
    const matchSeverity = severityFilter === 'ALL' || v.severity === severityFilter;
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'fixed' ? v.isFixed : !v.isFixed);
    return matchSearch && matchSeverity && matchStatus;
  });

  const counts = {
    critical: vulns.filter(v => v.severity === 'CRITICAL' && !v.isFixed).length,
    high: vulns.filter(v => v.severity === 'HIGH' && !v.isFixed).length,
    medium: vulns.filter(v => v.severity === 'MEDIUM' && !v.isFixed).length,
    low: vulns.filter(v => v.severity === 'LOW' && !v.isFixed).length,
  };

  const handleMarkFixed = (id: string) => {
    vulnsApi.markFixed(id).catch(() => {});
    setVulns(prev => prev.map(v => v.id === id ? { ...v, isFixed: true } : v));
    toast.success('Marked as fixed');
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#F4F7FA]">Vulnerabilities</h1>
        <p className="text-xs text-[#9BA9B7] mt-0.5">{filtered.length} vulnerabilities found</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Critical', count: counts.critical, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', sev: 'CRITICAL' as Severity },
          { label: 'High', count: counts.high, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', sev: 'HIGH' as Severity },
          { label: 'Medium', count: counts.medium, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', sev: 'MEDIUM' as Severity },
          { label: 'Low', count: counts.low, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', sev: 'LOW' as Severity },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => setSeverityFilter(severityFilter === item.sev ? 'ALL' : item.sev)}
            className={`p-3 rounded-xl border text-left transition-all ${item.bg} ${severityFilter === item.sev ? 'ring-1 ring-inset' : 'hover:opacity-80'}`}
          >
            <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
            <p className="text-xs text-[#9BA9B7] mt-0.5">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search CVE, package, keyword..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={15} />}
          wrapperClassName="flex-1 min-w-48 max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="bg-[#18232D] border border-[#2A3A48] text-sm text-[#F4F7FA] rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald"
        >
          <option value="ALL">All Status</option>
          <option value="unfixed">Unfixed</option>
          <option value="fixed">Fixed</option>
        </select>
        {(severityFilter !== 'ALL' || statusFilter !== 'ALL' || search) && (
          <Button size="sm" variant="ghost" leftIcon={<X size={14} />}
            onClick={() => { setSeverityFilter('ALL'); setStatusFilter('ALL'); setSearch(''); }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-[#202C37] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Shield size={40} className="text-[#2A3A48] mx-auto mb-4" />
          <p className="text-sm text-[#9BA9B7]">No vulnerabilities match your filters</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-[#9BA9B7] uppercase tracking-wide">
            <div className="col-span-1">Severity</div>
            <div className="col-span-3">Package</div>
            <div className="col-span-2">ID</div>
            <div className="col-span-3">Title</div>
            <div className="col-span-1">CVSS</div>
            <div className="col-span-2">Actions</div>
          </div>

          {filtered.map(vuln => (
            <div key={vuln.id}>
              <Card
                className={`px-4 py-3 cursor-pointer transition-all ${expandedId === vuln.id ? 'border-emerald/30 rounded-b-none' : ''} ${vuln.isFixed ? 'opacity-60' : ''}`}
                onClick={() => setExpandedId(expandedId === vuln.id ? null : vuln.id)}
              >
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-12 md:col-span-1">
                    <SeverityBadge severity={vuln.severity} />
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <code className="text-sm text-cyan font-mono">{vuln.packageName}</code>
                    <span className="text-xs text-[#9BA9B7] ml-1">@{vuln.packageVersion}</span>
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <span className="text-xs font-mono text-[#9BA9B7]">
                      {vuln.cveId ?? vuln.osvId ?? 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <span className="text-sm text-[#F4F7FA] line-clamp-1">{vuln.title}</span>
                  </div>
                  <div className="col-span-6 md:col-span-1">
                    {vuln.cvssScore ? (
                      <span className="text-sm font-bold text-[#F4F7FA]">{vuln.cvssScore.toFixed(1)}</span>
                    ) : (
                      <span className="text-xs text-[#9BA9B7]">—</span>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-2 flex items-center gap-2 justify-end">
                    {!vuln.isFixed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<CheckCircle size={13} />}
                        onClick={(e) => { e.stopPropagation(); handleMarkFixed(vuln.id); }}
                      >
                        Fix
                      </Button>
                    )}
                    {vuln.isFixed && (
                      <span className="text-xs text-emerald flex items-center gap-1">
                        <CheckCircle size={12} /> Fixed
                      </span>
                    )}
                    {expandedId === vuln.id ? <ChevronUp size={16} className="text-[#9BA9B7]" /> : <ChevronDown size={16} className="text-[#9BA9B7]" />}
                  </div>
                </div>
              </Card>

              <AnimatePresence>
                {expandedId === vuln.id && (
                  <VulnDetailPanel vuln={vuln} onClose={() => setExpandedId(null)} />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
