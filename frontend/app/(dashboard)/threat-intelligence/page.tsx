'use client';

import { useEffect, useState } from 'react';
import {
  Globe2, Shield, Search, ExternalLink, Filter,
  AlertTriangle, RefreshCw, Layers
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ThreatIntelligencePage() {
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ecoFilter, setEcoFilter] = useState('all');

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/threats/advisories', {
        params: { ecosystem: ecoFilter, search }
      });
      setAdvisories(res.data);
    } catch {
      toast.error('Failed to load global advisories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, [ecoFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchThreats();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3A48] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold mb-1">
            <Globe2 size={13} />
            <span>Global CVE & OSV Feed</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F4F7FA]">Threat Intelligence Center</h1>
          <p className="text-xs text-[#9BA9B7]">
            Real-time feed of open-source vulnerabilities reported across Google OSV, GitHub Advisory Database, and NVD.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          onClick={fetchThreats}
        >
          Refresh Feed
        </Button>
      </div>

      {/* Search and Filters */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search CVE, package name, or vulnerability keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'npm', 'PyPI', 'Maven'].map((eco) => (
            <button
              type="button"
              key={eco}
              onClick={() => setEcoFilter(eco)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase transition-all ${
                ecoFilter === eco
                  ? 'bg-emerald text-[#101820]'
                  : 'bg-[#18232D] text-[#9BA9B7] border border-[#2A3A48] hover:text-[#F4F7FA]'
              }`}
            >
              {eco}
            </button>
          ))}
          <Button type="submit" size="sm" variant="primary">Search</Button>
        </div>
      </form>

      {/* Advisory Feed List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-28 bg-[#18232D] rounded-xl animate-pulse" />
            <div className="h-28 bg-[#18232D] rounded-xl animate-pulse" />
          </div>
        ) : advisories.length === 0 ? (
          <Card className="p-12 text-center">
            <Shield size={36} className="mx-auto text-[#6B7C8E] mb-2" />
            <p className="text-xs text-[#9BA9B7]">No advisories found matching your query.</p>
          </Card>
        ) : (
          advisories.map((adv) => (
            <Card key={adv.id} className="p-5 hover:border-cyan/40 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-sm text-[#F4F7FA] font-mono">{adv.cve_id}</span>
                    <Badge variant={adv.severity === 'CRITICAL' ? 'critical' : 'warning'} size="sm">
                      {adv.severity}
                    </Badge>
                    <Badge variant="outline" size="sm">{adv.ecosystem}</Badge>
                    <span className="text-xs text-emerald font-mono font-semibold">{adv.package}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#F4F7FA] mt-2">{adv.title}</h3>
                  <p className="text-xs text-[#D1D5DB] mt-1 leading-relaxed">{adv.summary}</p>

                  <div className="mt-3 flex items-center gap-4 text-[11px] text-[#9BA9B7]">
                    <span>Source: <strong className="text-[#F4F7FA]">{adv.source}</strong></span>
                    <span>Published: {adv.published}</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between flex-shrink-0">
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-red-400">CVSS {adv.cvss}</span>
                    <p className="text-[10px] text-[#9BA9B7] uppercase font-bold">Severity Score</p>
                  </div>
                  <a
                    href={adv.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18232D] border border-[#2A3A48] hover:border-emerald text-emerald text-xs font-semibold mt-3 transition-colors"
                  >
                    <span>Official Advisory</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
