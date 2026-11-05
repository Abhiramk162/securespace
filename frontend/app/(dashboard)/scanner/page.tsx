'use client';

import { useState, useRef } from 'react';
import {
  ScanLine, Upload, GitBranch, ArrowRight, ShieldCheck,
  AlertTriangle, CheckCircle2, Clock, Zap, FileCode, Check
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const SCAN_STEPS = [
  'Validating repository manifest structure',
  'Parsing package versions & direct/transitive bindings',
  'Executing Google OSV & GitHub Security Advisory queries',
  'Computing CVSS exposure & composite risk scoring',
  'Generating AI remediation blueprints'
];

export default function ScannerPage() {
  const [gitUrl, setGitUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateProgress = async () => {
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 400));
    }
  };

  const handleGitScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitUrl) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }
    setScanning(true);
    setScanResult(null);
    setCurrentStep(0);

    try {
      // 1. Create or register repo
      const repoRes = await api.post('/api/repositories', {
        name: gitUrl.split('/').pop()?.replace('.git', '') || 'scanned-repo',
        url: gitUrl,
        ecosystem: gitUrl.includes('python') || gitUrl.includes('django') ? 'PyPI' : 'npm'
      });

      // 2. Animate steps
      const progressPromise = simulateProgress();

      // 3. Trigger actual scan
      const scanRes = await api.post(`/api/scans/run/${repoRes.data.id}`);
      await progressPromise;

      setScanResult(scanRes.data);
      toast.success('Security scan completed successfully!');
    } catch (err: any) {
      toast.error('Scan encountered an error. Falling back to demo results.');
      // Fallback to demo scan
      const demoRes = await api.post('/api/repositories/demo/seed');
      const scanRes = await api.post(`/api/scans/run/${demoRes.data.id}`);
      setScanResult(scanRes.data);
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanResult(null);
    setCurrentStep(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('repository_name', file.name.split('.')[0]);

    try {
      const progressPromise = simulateProgress();
      const res = await api.post('/api/scans/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await progressPromise;
      setScanResult(res.data);
      toast.success(`Successfully analyzed ${file.name}!`);
    } catch (err: any) {
      toast.error('Failed to parse uploaded manifest');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="border-b border-[#2A3A48] pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold mb-1">
          <ScanLine size={13} />
          <span>Vulnerability Detection Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-[#F4F7FA]">Repository Security Scanner</h1>
        <p className="text-xs text-[#9BA9B7]">
          Analyze lockfiles and manifest configurations directly against Google OSV, NVD, and GitHub Security Advisories.
        </p>
      </div>

      {/* Input Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub URL Scan */}
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="text-emerald" size={18} />
              <CardTitle>Scan Remote GitHub Repository</CardTitle>
            </div>
          </CardHeader>
          <form onSubmit={handleGitScan} className="space-y-4">
            <p className="text-xs text-[#9BA9B7]">
              Inspect public repositories or enterprise sources for known CVEs and malicious transitive subdependencies.
            </p>
            <Input
              placeholder="https://github.com/organization/repository"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              disabled={scanning}
            />
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setGitUrl('https://github.com/acme-corp/ecommerce-cloud-platform')}
                className="text-[11px] text-cyan hover:underline"
              >
                Use sample vulnerable repo URL
              </button>
              <Button type="submit" loading={scanning} leftIcon={<ScanLine size={15} />}>
                Start Repository Scan
              </Button>
            </div>
          </form>
        </Card>

        {/* Manifest File Upload */}
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="text-cyan" size={18} />
              <CardTitle>Upload Lockfile / Manifest</CardTitle>
            </div>
          </CardHeader>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#2A3A48] hover:border-cyan/50 rounded-xl p-8 text-center cursor-pointer bg-[#18232D]/40 transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".json,.txt,.lock,.xml"
            />
            <FileCode size={36} className="mx-auto text-[#6B7C8E] group-hover:text-cyan transition-colors mb-2" />
            <p className="text-sm font-semibold text-[#F4F7FA]">Click or Drag & Drop manifest file</p>
            <p className="text-[11px] text-[#9BA9B7] mt-1">
              Supports <strong className="text-[#F4F7FA]">package.json, requirements.txt, poetry.lock, pom.xml, Cargo.lock, composer.lock</strong>
            </p>
            <p className="text-[10px] text-emerald mt-2 font-mono">
              🛡️ Safe: Static inspection only. Code is never executed.
            </p>
          </div>
        </Card>
      </div>

      {/* Live Scan Progress Indicator */}
      {scanning && (
        <Card className="p-6 bg-gradient-to-r from-[#18232D] to-[#202C37] border-emerald/30 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald/20 flex items-center justify-center">
              <ScanLine className="text-emerald animate-spin" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F4F7FA]">Analyzing Open-Source Manifests</h3>
              <p className="text-xs text-emerald font-medium">{SCAN_STEPS[currentStep]}</p>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {SCAN_STEPS.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs">
                {idx < currentStep ? (
                  <Check size={14} className="text-emerald font-bold" />
                ) : idx === currentStep ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan border-t-transparent animate-spin" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-[#2A3A48]" />
                )}
                <span className={idx <= currentStep ? 'text-[#F4F7FA] font-medium' : 'text-[#6B7C8E]'}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Scan Results Banner & Quick Findings */}
      {scanResult && (
        <div className="space-y-6">
          <Card className="p-6 bg-[#18232D] border-emerald/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3A48] pb-4">
              <div>
                <span className="text-xs font-bold text-emerald uppercase tracking-wider">Scan Completed</span>
                <h3 className="text-lg font-bold text-[#F4F7FA] mt-0.5">{scanResult.scan_summary}</h3>
                <p className="text-xs text-[#9BA9B7]">
                  Scanned in {scanResult.duration_seconds}s &bull; Manifests: {scanResult.manifest_files?.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/reports'}>
                  Export PDF Report
                </Button>
                <Button size="sm" variant="primary" onClick={() => window.location.href = '/vulnerabilities'}>
                  Inspect Findings
                </Button>
              </div>
            </div>

            {/* Score & Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-5 text-center">
              <div className="p-3 rounded-lg bg-[#202C37]">
                <span className="text-[11px] text-[#9BA9B7] uppercase font-semibold">Security Score</span>
                <p className="text-2xl font-extrabold text-emerald mt-1">{Math.round(scanResult.risk_score)}/100</p>
              </div>
              <div className="p-3 rounded-lg bg-[#202C37]">
                <span className="text-[11px] text-[#9BA9B7] uppercase font-semibold">Dependencies</span>
                <p className="text-2xl font-extrabold text-[#F4F7FA] mt-1">{scanResult.total_dependencies}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#202C37]">
                <span className="text-[11px] text-red-400 uppercase font-semibold">Critical CVEs</span>
                <p className="text-2xl font-extrabold text-red-400 mt-1">{scanResult.critical_count}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#202C37]">
                <span className="text-[11px] text-orange-400 uppercase font-semibold">High Severity</span>
                <p className="text-2xl font-extrabold text-orange-400 mt-1">{scanResult.high_count}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#202C37]">
                <span className="text-[11px] text-yellow-400 uppercase font-semibold">Medium Severity</span>
                <p className="text-2xl font-extrabold text-yellow-400 mt-1">{scanResult.medium_count}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
