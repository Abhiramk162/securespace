'use client';

import { useEffect, useState } from 'react';
import {
  Sparkles, CheckCircle2, ShieldAlert, ArrowRight,
  TrendingUp, Terminal, Copy, Check, ExternalLink
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RecommendationsPage() {
  const [vulns, setVulns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/vulnerabilities');
      setVulns(res.data);
    } catch {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      await api.patch(`/api/vulnerabilities/${id}/status`, {
        status: 'resolved',
        notes: 'Remediated via SecureSphere Recommendation Center'
      });
      toast.success('Vulnerability marked as resolved! Security score improved.');
      fetchRecommendations();
    } catch {
      toast.error('Failed to update vulnerability status');
    }
  };

  const copyCommand = (cmd: string, id: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    toast.success('Upgrade command copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const unresolved = vulns.filter(v => v.status !== 'resolved');
  const resolved = vulns.filter(v => v.status === 'resolved');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3A48] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold mb-1">
            <Sparkles size={13} />
            <span>Remediation Roadmap</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F4F7FA]">Security Recommendations Center</h1>
          <p className="text-xs text-[#9BA9B7]">
            Prioritized engineering fixes and verified dependency upgrades to rapidly elevate your security posture.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-[#9BA9B7]">Remediation Progress</p>
            <p className="text-sm font-bold text-emerald">
              {resolved.length} of {vulns.length} Resolved ({vulns.length > 0 ? Math.round((resolved.length / vulns.length) * 100) : 100}%)
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-32 bg-[#18232D] rounded-xl animate-pulse" />
            <div className="h-32 bg-[#18232D] rounded-xl animate-pulse" />
          </div>
        ) : unresolved.length === 0 ? (
          <Card className="p-12 text-center bg-[#18232D]">
            <CheckCircle2 size={40} className="mx-auto text-emerald mb-3" />
            <h3 className="text-lg font-bold text-[#F4F7FA]">All security recommendations applied!</h3>
            <p className="text-xs text-[#9BA9B7] mt-1">
              Your software dependencies are currently patched against all known advisories.
            </p>
          </Card>
        ) : (
          unresolved.map((v) => {
            const isCrit = v.severity === 'CRITICAL';
            const cmd = v.ecosystem === 'npm'
              ? `npm install ${v.package_name}@${v.fixed_version || 'latest'}`
              : `pip install ${v.package_name}>=${v.fixed_version || '2.0.0'}`;

            return (
              <Card key={v.id} className="p-5 hover:border-emerald/40 transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm text-[#F4F7FA] font-mono">{v.vuln_id}</span>
                      <Badge variant={isCrit ? 'critical' : 'warning'} size="sm">
                        {v.severity}
                      </Badge>
                      <Badge variant="outline" size="sm">{v.ecosystem}</Badge>
                      <span className="text-xs text-cyan font-mono font-bold">
                        {v.package_name} ({v.installed_version} &rarr; {v.fixed_version || 'Latest Secure'})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#F4F7FA] mt-2">{v.summary}</h3>

                    {/* Developer Fix Command Box */}
                    <div className="mt-3 p-3 rounded-lg bg-[#101820] border border-[#2A3A48] flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2 overflow-x-auto text-emerald">
                        <Terminal size={14} className="text-[#6B7C8E] flex-shrink-0" />
                        <span>{cmd}</span>
                      </div>
                      <button
                        onClick={() => copyCommand(cmd, v.id)}
                        className="ml-3 p-1.5 text-[#9BA9B7] hover:text-[#F4F7FA] rounded bg-[#18232D] border border-[#2A3A48] flex-shrink-0"
                        title="Copy command"
                      >
                        {copiedId === v.id ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#9BA9B7] mt-2">
                      Score Impact: Resolving this issue will restore <strong className="text-emerald">+{isCrit ? '25' : '12'} points</strong> to your security score.
                    </p>
                  </div>

                  <div className="flex items-center md:flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<CheckCircle2 size={14} />}
                      onClick={() => handleResolve(v.id)}
                    >
                      Mark Resolved
                    </Button>
                    <a
                      href={v.advisory_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#9BA9B7] hover:text-cyan flex items-center gap-1 mt-1"
                    >
                      <span>Advisory</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
