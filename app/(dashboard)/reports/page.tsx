'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Download, Trash2, Clock, CheckCircle,
  Loader2, AlertCircle, FileJson, FileCode
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { reportsApi } from '@/lib/api';
import { timeAgo, formatDateTime } from '@/lib/utils';
import type { Report } from '@/lib/types';
import toast from 'react-hot-toast';

const mockReports: Report[] = [
  {
    id: 'r1', userId: 'u1', title: 'Full Security Audit - my-web-app',
    type: 'full', format: 'json', status: 'ready',
    generatedAt: new Date(Date.now() - 3600000).toISOString(),
    summary: { criticalCount: 4, highCount: 12, mediumCount: 21, lowCount: 10, riskScore: 72, repositoryName: 'my-web-app', topFindings: ['Critical: node-tar path traversal', 'High: express open redirect'] },
  },
  {
    id: 'r2', userId: 'u1', title: 'Executive Summary - api-service',
    type: 'executive', format: 'pdf', status: 'ready',
    generatedAt: new Date(Date.now() - 86400000).toISOString(),
    summary: { criticalCount: 0, highCount: 3, mediumCount: 8, lowCount: 5, riskScore: 45, repositoryName: 'api-service', topFindings: ['High: requests cert bypass'] },
  },
  {
    id: 'r3', userId: 'u1', title: 'Dependency Report - mobile-app',
    type: 'dependency', format: 'html', status: 'generating',
    summary: { criticalCount: 0, highCount: 0, mediumCount: 2, lowCount: 3, riskScore: 20, topFindings: [] },
  },
];

function FormatIcon({ format }: { format: string }) {
  const icons: Record<string, React.ReactNode> = {
    json: <FileJson size={16} className="text-cyan" />,
    pdf: <FileText size={16} className="text-red-400" />,
    html: <FileCode size={16} className="text-orange-400" />,
  };
  return <>{icons[format] ?? <FileText size={16} />}</>;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'ready') return <CheckCircle size={14} className="text-emerald" />;
  if (status === 'generating') return <Loader2 size={14} className="text-cyan animate-spin" />;
  return <AlertCircle size={14} className="text-red-400" />;
}

function ReportCard({ report, onDelete }: { report: Report; onDelete: (id: string) => void }) {
  const handleDownload = async () => {
    try {
      const blob = await reportsApi.download(report.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/ /g, '-')}.${report.format}`;
      a.click();
    } catch {
      toast.error('Download not available in demo mode');
    }
  };

  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#18232D] border border-[#2A3A48] flex items-center justify-center flex-shrink-0">
            <FormatIcon format={report.format} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[#F4F7FA] truncate">{report.title}</h3>
              <div className="flex items-center gap-1.5">
                <StatusIcon status={report.status} />
                <span className="text-xs capitalize text-[#9BA9B7]">{report.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <Badge variant="outline" size="sm">{report.type.replace('_', ' ')}</Badge>
              <Badge variant="outline" size="sm">{report.format.toUpperCase()}</Badge>
              {report.summary.riskScore > 0 && (
                <span className="text-xs text-[#9BA9B7]">Risk: {report.summary.riskScore}/100</span>
              )}
              {report.generatedAt && (
                <span className="text-xs text-[#9BA9B7] flex items-center gap-1">
                  <Clock size={11} /> {timeAgo(report.generatedAt)}
                </span>
              )}
            </div>
            {report.summary.topFindings.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {report.summary.topFindings.slice(0, 2).map((f, i) => (
                  <p key={i} className="text-xs text-[#9BA9B7]">• {f}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {report.status === 'ready' && (
            <Button size="sm" variant="secondary" leftIcon={<Download size={13} />} onClick={handleDownload}>
              Download
            </Button>
          )}
          <Button
            size="icon"
            variant="danger"
            onClick={() => { reportsApi.delete(report.id).catch(() => {}); onDelete(report.id); toast.success('Report deleted'); }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ type: 'full', format: 'json' });

  useEffect(() => {
    reportsApi.list()
      .then(setReports)
      .catch(() => setReports(mockReports))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const report = await reportsApi.generate({ type: form.type as any, format: form.format as any });
      setReports(prev => [report, ...prev]);
      setModalOpen(false);
      toast.success('Report generation started!');
    } catch {
      // Demo mode
      const demoReport: Report = {
        id: Date.now().toString(),
        userId: 'u1',
        title: `${form.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Report`,
        type: form.type as any,
        format: form.format as any,
        status: 'generating',
        summary: { criticalCount: 4, highCount: 12, mediumCount: 21, lowCount: 10, riskScore: 62, topFindings: [] },
      };
      setReports(prev => [demoReport, ...prev]);
      setModalOpen(false);
      toast.success('Report generation started!');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F4F7FA]">Security Reports</h1>
          <p className="text-xs text-[#9BA9B7] mt-0.5">{reports.length} reports generated</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Generate Report
        </Button>
      </div>

      {/* Report summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Ready', count: reports.filter(r => r.status === 'ready').length, color: 'text-emerald', icon: <CheckCircle size={18} /> },
          { label: 'Generating', count: reports.filter(r => r.status === 'generating').length, color: 'text-cyan', icon: <Loader2 size={18} className="animate-spin" /> },
          { label: 'Total Reports', count: reports.length, color: 'text-[#9BA9B7]', icon: <FileText size={18} /> },
        ].map(item => (
          <Card key={item.label} className="p-4 flex items-center gap-3">
            <div className={`${item.color}`}>{item.icon}</div>
            <div>
              <p className="text-xl font-bold text-[#F4F7FA]">{item.count}</p>
              <p className="text-xs text-[#9BA9B7]">{item.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-[#202C37] rounded-xl animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="py-20 text-center">
          <FileText size={40} className="text-[#2A3A48] mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[#F4F7FA] mb-2">No reports yet</h3>
          <p className="text-sm text-[#9BA9B7] mb-6">Generate your first security report to get a comprehensive overview.</p>
          <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Generate First Report</Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {reports.map(r => (
            <ReportCard key={r.id} report={r} onDelete={(id) => setReports(prev => prev.filter(r => r.id !== id))} />
          ))}
        </motion.div>
      )}

      {/* Generate modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate Security Report" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#F4F7FA] block mb-2">Report Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'full', label: 'Full Security Audit', desc: 'Comprehensive analysis' },
                { value: 'executive', label: 'Executive Summary', desc: 'High-level overview' },
                { value: 'dependency', label: 'Dependency Report', desc: 'Package health' },
                { value: 'vulnerability', label: 'Vulnerability Report', desc: 'CVE details' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                  className={`p-3 text-left rounded-lg border transition-all ${form.type === opt.value ? 'border-emerald bg-emerald/10' : 'border-[#2A3A48] hover:border-[#374959]'}`}
                >
                  <p className="text-xs font-semibold text-[#F4F7FA]">{opt.label}</p>
                  <p className="text-xs text-[#9BA9B7] mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#F4F7FA] block mb-2">Format</label>
            <div className="flex gap-2">
              {[
                { value: 'json', label: 'JSON', icon: <FileJson size={14} /> },
                { value: 'pdf', label: 'PDF', icon: <FileText size={14} /> },
                { value: 'html', label: 'HTML', icon: <FileCode size={14} /> },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, format: opt.value }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm transition-all ${form.format === opt.value ? 'border-emerald bg-emerald/10 text-emerald' : 'border-[#2A3A48] text-[#9BA9B7] hover:border-[#374959]'}`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button loading={generating} onClick={handleGenerate} className="flex-1">Generate Report</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
