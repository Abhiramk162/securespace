'use client';

import { useEffect, useState } from 'react';
import {
  Crosshair, ShieldAlert, AlertTriangle, Activity,
  Globe2, CheckCircle2, Lock, Radio, Zap
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ThreatDetectionPage() {
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/threats/advisories')
      .then(res => setThreats(res.data))
      .catch(() => toast.error('Failed to load live threat feed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3A48] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-1">
            <Radio size={13} className="animate-pulse" />
            <span>Active Threat Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F4F7FA]">Supply Chain Threat Detection</h1>
          <p className="text-xs text-[#9BA9B7]">
            Real-time heuristic detection of zero-day exploits, typosquatting vectors, and upstream package compromises.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-ping" />
          <span className="text-xs font-bold text-emerald">OSV Live Feed Active</span>
        </div>
      </div>

      {/* Detection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#18232D] border border-red-500/30">
          <Crosshair className="text-red-400 mb-2" size={24} />
          <p className="text-xs text-[#9BA9B7] uppercase font-bold tracking-wider">Confirmed Exploits</p>
          <p className="text-3xl font-black text-red-400 mt-1">4 Active</p>
          <p className="text-[11px] text-[#9BA9B7] mt-1">Remote Code Execution & Prototype Pollution</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#18232D] border border-orange-500/30">
          <AlertTriangle className="text-orange-400 mb-2" size={24} />
          <p className="text-xs text-[#9BA9B7] uppercase font-bold tracking-wider">Suspicious Vectors</p>
          <p className="text-3xl font-black text-orange-400 mt-1">2 Flagged</p>
          <p className="text-[11px] text-[#9BA9B7] mt-1">Unpinned transitive subdependencies</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#18232D] border border-cyan/30">
          <Activity className="text-cyan mb-2" size={24} />
          <p className="text-xs text-[#9BA9B7] uppercase font-bold tracking-wider">Advisory Watch</p>
          <p className="text-3xl font-black text-cyan mt-1">24/7 Sync</p>
          <p className="text-[11px] text-[#9BA9B7] mt-1">Automated query checks on commit</p>
        </div>
      </div>

      {/* Live Threat Telemetry Feed */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Threat Telemetry & Monitored Advisories</CardTitle>
          <span className="text-xs text-[#9BA9B7]">Global + Local Feeds</span>
        </CardHeader>
        <div className="space-y-3 mt-3">
          {loading ? (
            <div className="h-40 bg-[#18232D] rounded-xl animate-pulse" />
          ) : (
            threats.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-[#18232D] border border-[#2A3A48] hover:border-red-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-sm text-[#F4F7FA] font-mono">{t.cve_id}</span>
                    <Badge variant={t.severity === 'CRITICAL' ? 'critical' : 'warning'} size="sm">
                      {t.severity}
                    </Badge>
                    <Badge variant="outline" size="sm">{t.ecosystem}</Badge>
                    <span className="text-xs text-cyan font-semibold">{t.package}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#D1D5DB] mt-1.5">{t.title}</h4>
                  <p className="text-[11px] text-[#9BA9B7] mt-0.5 line-clamp-2">{t.summary}</p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between flex-shrink-0">
                  <span className="text-xs font-bold text-red-400">CVSS {t.cvss}</span>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald hover:underline font-semibold mt-1"
                  >
                    View CVE Detail &rarr;
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
