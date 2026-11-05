'use client';

import { useEffect, useState } from 'react';
import {
  History, Shield, Clock, FileText, ArrowRight,
  CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ScanHistoryPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/scans');
      setScans(res.data);
    } catch {
      toast.error('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3A48] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold mb-1">
            <History size={13} />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F4F7FA]">Scan History & Audit Logs</h1>
          <p className="text-xs text-[#9BA9B7]">
            Complete historical timeline of automated checks, manifest uploads, and vulnerability remediation changes.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          onClick={fetchScans}
        >
          Refresh Logs
        </Button>
      </div>

      {/* History Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18232D] text-[#9BA9B7] border-b border-[#2A3A48] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Manifest Files</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Dependencies</th>
                <th className="p-4">Vulnerabilities</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3A48]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#9BA9B7]">Loading scan logs...</td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#9BA9B7]">No scans recorded yet.</td>
                </tr>
              ) : (
                scans.map((s) => (
                  <tr key={s.id} className="hover:bg-[#18232D]/40 transition-colors">
                    <td className="p-4 font-mono text-[#D1D5DB]">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {s.manifest_files?.map((f: string, i: number) => (
                          <Badge key={i} variant="outline" size="sm">{f}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-[#9BA9B7] font-mono">{s.duration_seconds}s</td>
                    <td className="p-4 font-bold text-[#F4F7FA]">{s.total_dependencies}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-red-400 font-bold">{s.critical_count} crit</span>
                        <span className="text-[#6B7C8E]">&bull;</span>
                        <span className="text-orange-400 font-bold">{s.high_count} high</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-extrabold ${s.risk_score >= 80 ? 'text-emerald' : s.risk_score >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                        {Math.round(s.risk_score)}/100
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="secondary" onClick={() => window.location.href = `/reports?scan=${s.id}`}>
                        View Report
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
