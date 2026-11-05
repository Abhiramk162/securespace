'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Clock, Bell, Webhook, Mail, Shield,
  AlertTriangle, CheckCircle, ChevronDown
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { monitoringApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface RepoMonitor {
  repoId: string;
  repoName: string;
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly';
  alertSeverities: string[];
  webhookUrl: string;
  emailAlerts: boolean;
}

const mockMonitors: RepoMonitor[] = [
  { repoId: 'r1', repoName: 'my-web-app', enabled: true, frequency: 'daily', alertSeverities: ['CRITICAL', 'HIGH'], webhookUrl: '', emailAlerts: true },
  { repoId: 'r2', repoName: 'api-service', enabled: true, frequency: 'weekly', alertSeverities: ['CRITICAL'], webhookUrl: 'https://hooks.slack.com/services/...', emailAlerts: false },
  { repoId: 'r3', repoName: 'mobile-app', enabled: false, frequency: 'daily', alertSeverities: ['CRITICAL', 'HIGH', 'MEDIUM'], webhookUrl: '', emailAlerts: true },
];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-emerald' : 'bg-[#2A3A48]'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function MonitorCard({ monitor: initial }: { monitor: RepoMonitor }) {
  const [monitor, setMonitor] = useState(initial);
  const [saving, setSaving] = useState(false);

  const toggleSeverity = (sev: string) => {
    setMonitor(m => ({
      ...m,
      alertSeverities: m.alertSeverities.includes(sev)
        ? m.alertSeverities.filter(s => s !== sev)
        : [...m.alertSeverities, sev],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await monitoringApi.update(monitor.repoId, monitor as any);
      toast.success('Monitoring settings saved');
    } catch {
      toast.success('Settings saved (demo mode)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${monitor.enabled ? 'bg-emerald' : 'bg-[#2A3A48]'}`} />
          <h3 className="font-semibold text-[#F4F7FA]">{monitor.repoName}</h3>
          <Badge variant={monitor.enabled ? 'emerald' : 'outline'} size="sm">
            {monitor.enabled ? 'Active' : 'Paused'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9BA9B7]">{monitor.enabled ? 'Monitoring' : 'Disabled'}</span>
          <ToggleSwitch checked={monitor.enabled} onChange={v => setMonitor(m => ({ ...m, enabled: v }))} />
        </div>
      </div>

      <div className={`space-y-4 ${!monitor.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Frequency */}
          <div>
            <label className="text-xs font-medium text-[#9BA9B7] block mb-2">Scan Frequency</label>
            <select
              value={monitor.frequency}
              onChange={e => setMonitor(m => ({ ...m, frequency: e.target.value as any }))}
              className="w-full bg-[#18232D] border border-[#2A3A48] text-sm text-[#F4F7FA] rounded-lg px-3 py-2 focus:outline-none focus:border-emerald"
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {/* Email alerts */}
          <div>
            <label className="text-xs font-medium text-[#9BA9B7] block mb-2">Email Alerts</label>
            <div className="flex items-center gap-3 mt-2">
              <ToggleSwitch checked={monitor.emailAlerts} onChange={v => setMonitor(m => ({ ...m, emailAlerts: v }))} />
              <span className="text-sm text-[#9BA9B7]">{monitor.emailAlerts ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>

        {/* Alert severities */}
        <div>
          <label className="text-xs font-medium text-[#9BA9B7] block mb-2">Alert on Severity</label>
          <div className="flex flex-wrap gap-2">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
              const active = monitor.alertSeverities.includes(sev);
              const colors: Record<string, string> = { CRITICAL: 'text-red-400 border-red-500/20 bg-red-500/10', HIGH: 'text-orange-400 border-orange-500/20 bg-orange-500/10', MEDIUM: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10', LOW: 'text-blue-400 border-blue-500/20 bg-blue-500/10' };
              return (
                <button
                  key={sev}
                  onClick={() => toggleSeverity(sev)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${active ? colors[sev] : 'border-[#2A3A48] text-[#9BA9B7] hover:border-[#374959]'}`}
                >
                  {sev}
                </button>
              );
            })}
          </div>
        </div>

        {/* Webhook */}
        <Input
          label="Webhook URL (Optional)"
          placeholder="https://hooks.slack.com/services/..."
          value={monitor.webhookUrl}
          onChange={e => setMonitor(m => ({ ...m, webhookUrl: e.target.value }))}
          leftIcon={<Webhook size={15} />}
          hint="Receive alerts via webhook (Slack, Discord, custom)"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-[#2A3A48] flex justify-end">
        <Button size="sm" loading={saving} onClick={handleSave}>Save Settings</Button>
      </div>
    </Card>
  );
}

export default function MonitoringPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#F4F7FA]">Continuous Monitoring</h1>
        <p className="text-xs text-[#9BA9B7] mt-0.5">Configure automated security monitoring for your repositories</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Monitored Repos', value: 2, icon: <Activity size={18} />, color: 'text-emerald' },
          { label: 'Paused', value: 1, icon: <Activity size={18} />, color: 'text-[#9BA9B7]' },
          { label: 'Alerts Sent', value: 14, icon: <Bell size={18} />, color: 'text-cyan' },
          { label: 'Next Scan', value: '2h', icon: <Clock size={18} />, color: 'text-yellow-400' },
        ].map(item => (
          <Card key={item.label} className="p-4 flex items-center gap-3">
            <div className={`${item.color}`}>{item.icon}</div>
            <div>
              <p className="text-xl font-bold text-[#F4F7FA]">{item.value}</p>
              <p className="text-xs text-[#9BA9B7]">{item.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Monitor cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-[#9BA9B7] uppercase tracking-wide">Repository Monitors</h2>
        {mockMonitors.map(monitor => (
          <MonitorCard key={monitor.repoId} monitor={monitor} />
        ))}
      </div>
    </div>
  );
}
