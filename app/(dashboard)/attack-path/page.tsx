'use client';

import { useEffect, useState } from 'react';
import {
  GitFork, ShieldAlert, ArrowRight, ShieldCheck,
  AlertTriangle, Layers, Info, RefreshCw, Zap
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AttackPathPage() {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<any>(null);

  const fetchAttackPaths = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/risk/attack-path');
      setGraphData(res.data);
      if (res.data?.attack_paths?.length > 0) {
        setSelectedPath(res.data.attack_paths[0]);
      }
    } catch {
      toast.error('Failed to load attack path analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttackPaths();
  }, []);

  const paths = graphData?.attack_paths || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3A48] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold mb-1">
            <GitFork size={13} />
            <span>Dependency Chain Tracing</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F4F7FA]">Attack Path & Exposure Analysis</h1>
          <p className="text-xs text-[#9BA9B7]">
            Map the precise traversal routes an adversary can navigate from direct API endpoints down to deep transitive vulnerabilities.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          onClick={fetchAttackPaths}
        >
          Re-Map Graphs
        </Button>
      </div>

      {/* Main Analysis Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identified Vulnerability Traversal Routes */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-sm font-bold text-[#F4F7FA] flex items-center justify-between">
            <span>Exploit Traversal Paths</span>
            <Badge variant="critical">{paths.length} Active</Badge>
          </h3>

          {loading ? (
            <div className="space-y-3">
              <div className="h-20 bg-[#18232D] rounded-xl animate-pulse" />
              <div className="h-20 bg-[#18232D] rounded-xl animate-pulse" />
            </div>
          ) : paths.length === 0 ? (
            <Card className="p-6 text-center">
              <ShieldCheck size={32} className="mx-auto text-emerald mb-2" />
              <p className="text-xs text-[#9BA9B7]">No exposed transitive attack paths identified.</p>
            </Card>
          ) : (
            paths.map((p: any, idx: number) => {
              const isSelected = selectedPath?.target === p.target && selectedPath?.vuln_id === p.vuln_id;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPath(p)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald/10 border-emerald/50 shadow-lg shadow-emerald/10'
                      : 'bg-[#18232D] border-[#2A3A48] hover:border-[#374959]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#F4F7FA] font-mono">{p.target}</span>
                    <Badge variant={p.severity === 'CRITICAL' ? 'critical' : 'warning'} size="sm">
                      {p.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-cyan font-mono mt-1">{p.vuln_id}</p>
                  <p className="text-[11px] text-[#9BA9B7] mt-2 flex items-center gap-1.5 truncate">
                    <Layers size={12} className="text-[#6B7C8E] flex-shrink-0" />
                    <span>Depth: {p.depth} &bull; {p.path.join(' → ')}</span>
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Interactive Route Diagram */}
        <Card className="p-6 lg:col-span-2 bg-[#18232D]">
          <CardHeader>
            <CardTitle>Path Architecture Visualizer</CardTitle>
            <span className="text-xs text-[#9BA9B7]">Visual Trace</span>
          </CardHeader>

          {selectedPath ? (
            <div className="space-y-6 mt-4">
              {/* Visual Node Flow */}
              <div className="p-6 rounded-2xl bg-[#101820] border border-[#2A3A48] overflow-x-auto">
                <div className="flex items-center justify-center gap-3 min-w-[500px]">
                  {selectedPath.path.map((node: string, i: number) => {
                    const isLast = i === selectedPath.path.length - 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`px-4 py-3 rounded-xl border text-center ${
                            i === 0
                              ? 'bg-[#18232D] border-cyan/40 text-cyan'
                              : isLast
                              ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/20'
                              : 'bg-[#202C37] border-[#2A3A48] text-[#F4F7FA]'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold block opacity-70">
                            {i === 0 ? 'Application' : isLast ? 'Vulnerable Target' : 'Direct Dep'}
                          </span>
                          <span className="text-xs font-bold font-mono">{node}</span>
                        </div>
                        {!isLast && (
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-red-400 font-mono mb-0.5">exposes</span>
                            <ArrowRight size={18} className="text-red-400 animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Threat Mechanics Breakdown */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#202C37] border border-[#2A3A48]">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>Attack Vector & Mechanics</span>
                  </h4>
                  <p className="text-xs text-[#D1D5DB] leading-relaxed">
                    {selectedPath.vector}. The target package inherits runtime execution authority without direct developer declaration in the project root manifest.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#202C37] border border-[#2A3A48]">
                  <h4 className="text-xs font-bold text-emerald uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={14} />
                    <span>Recommended Architectural Fix</span>
                  </h4>
                  <p className="text-xs text-[#D1D5DB] leading-relaxed">
                    Pin or override the transitive dependency version using package overrides in your lockfile, or update the parent library to its latest safe release.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button size="sm" variant="outline" onClick={() => window.location.href = `/ai-assistant?prompt=Explain attack path for ${selectedPath.target}`}>
                  Investigate with AI
                </Button>
                <Button size="sm" variant="primary" onClick={() => window.location.href = '/recommendations'}>
                  Resolve Vulnerability
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-[#9BA9B7]">
              Select an attack path from the left to view the visual chain.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
