'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle, Shield, CheckCircle, Search, Filter,
  ExternalLink, ArrowUpRight, Zap, RefreshCw, AlertOctagon
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function PackageRiskPage() {
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/risk/packages');
      setRisks(res.data);
    } catch {
      toast.error('Failed to load package risk evaluation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const filtered = risks.filter(r => {
    const matchesSearch = r.package_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterClass === 'ALL' || r.risk_classification === filterClass;
    return matchesSearch && matchesFilter;
  });

  const getClassificationBadge = (cls: string) => {
    switch (cls) {
      case 'MALICIOUS':
        return <Badge variant="critical">MALICIOUS</Badge>;
      case 'HIGH_RISK':
        return <Badge variant="critical">HIGH RISK</Badge>;
      case 'SUSPICIOUS':
        return <Badge variant="warning">SUSPICIOUS</Badge>;
      case 'MEDIUM_RISK':
        return <Badge variant="warning">MEDIUM RISK</Badge>;
      default:
        return <Badge variant="emerald">CLEAN</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3A48] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-1">
            <AlertOctagon size={13} />
            <span>Supply Chain Risk Modeling</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F4F7FA]">Package Risk Analyzer</h1>
          <p className="text-xs text-[#9BA9B7]">
            Evaluate known malicious packages, typosquatting indicators, maintainer abandonment, and anomalous releases.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          onClick={fetchRisks}
        >
          Re-Analyze
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search package name (e.g. lodash, log4j-core)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'HIGH_RISK', 'MEDIUM_RISK', 'CLEAN'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterClass(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                filterClass === f
                  ? 'bg-emerald text-[#101820]'
                  : 'bg-[#18232D] text-[#9BA9B7] border border-[#2A3A48] hover:text-[#F4F7FA]'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Package Risks Cards */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-[#18232D] rounded-xl animate-pulse" />
          <div className="h-32 bg-[#18232D] rounded-xl animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <CheckCircle size={36} className="mx-auto text-emerald mb-2" />
          <h3 className="font-bold text-base text-[#F4F7FA]">No elevated risk packages matching criteria</h3>
          <p className="text-xs text-[#9BA9B7] mt-1">All queried packages are within acceptable parameters.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isHigh = item.risk_score >= 70;
            return (
              <Card key={item.id} className="p-5 hover:border-[#374959] transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-base text-[#F4F7FA] font-mono">{item.package_name}</span>
                      <span className="text-xs text-[#9BA9B7] font-mono">v{item.version}</span>
                      <Badge variant="outline" size="sm">{item.ecosystem}</Badge>
                      {getClassificationBadge(item.risk_classification)}
                    </div>

                    {/* Evidence Badges */}
                    <div className="mt-3 space-y-1.5">
                      <p className="text-xs font-semibold text-[#9BA9B7]">Identified Risk Signals & Evidence:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.evidence?.map((ev: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18232D] border border-[#2A3A48] text-[11px] text-[#D1D5DB]"
                          >
                            <AlertTriangle size={12} className={isHigh ? 'text-red-400' : 'text-yellow-400'} />
                            <span>{ev}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Impact & Action */}
                    <div className="mt-4 grid md:grid-cols-2 gap-3 text-xs bg-[#18232D] p-3 rounded-xl border border-[#2A3A48]">
                      <div>
                        <strong className="text-red-400 block mb-0.5">Potential Exploitation Impact:</strong>
                        <span className="text-[#9BA9B7]">{item.potential_impact || 'Privilege escalation or service disruption'}</span>
                      </div>
                      <div>
                        <strong className="text-emerald block mb-0.5">Recommended Remediation Action:</strong>
                        <span className="text-[#9BA9B7]">{item.recommended_action || 'Upgrade to the verified patched version'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center sm:text-right flex-shrink-0 bg-[#18232D] sm:bg-transparent p-3 rounded-lg border border-[#2A3A48] sm:border-0">
                    <div className="text-2xl font-black" style={{ color: isHigh ? '#EF4444' : item.risk_score >= 40 ? '#F97316' : '#20B486' }}>
                      {Math.round(item.risk_score)}<span className="text-xs text-[#9BA9B7]">/100</span>
                    </div>
                    <span className="text-[10px] text-[#9BA9B7] uppercase font-bold tracking-wider">Package Risk</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
