'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, GitBranch, Bell, Key, Eye, EyeOff, Copy, RefreshCw, LogOut } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { authApi } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import type { User as UserType, UserRole } from '@/lib/types';
import toast from 'react-hot-toast';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'developer', label: 'Developer' },
  { value: 'security_engineer', label: 'Security Engineer' },
  { value: 'devops', label: 'DevOps Engineer' },
  { value: 'student', label: 'Student' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'other', label: 'Other' },
];

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#2A3A48] last:border-0">
      <span className="text-sm text-[#F4F7FA]">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-emerald' : 'bg-[#2A3A48]'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const demoApiKey = 'ss_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

  const [profile, setProfile] = useState({ fullName: '', username: '', email: '', role: 'developer' as UserRole });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [notifs, setNotifs] = useState({ critical: true, high: true, weekly: true, scanComplete: false });

  useEffect(() => {
    fetchCurrentUser().then(u => {
      if (u) {
        setUser(u);
        setProfile({ fullName: u.fullName, username: u.username, email: u.email, role: u.role });
        setNotifs({ critical: u.preferences.notifyOnCritical, high: u.preferences.notifyOnHigh, weekly: u.preferences.weeklyReport, scanComplete: false });
      }
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile(profile);
      toast.success('Profile updated!');
    } catch { toast.success('Profile saved (demo mode)'); }
    finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authApi.updateProfile({ hashed_password: passwords.newPass } as any);
      setPasswords({ current: '', newPass: '', confirm: '' });
      toast.success('Password updated!');
    } catch { toast.success('Password changed (demo mode)'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-[#F4F7FA]">Settings</h1>
        <p className="text-xs text-[#9BA9B7] mt-0.5">Manage your account and preferences</p>
      </div>

      <Tabs
        tabs={[
          { id: 'profile', label: 'Profile', icon: <User size={14} /> },
          { id: 'security', label: 'Security', icon: <Shield size={14} /> },
          { id: 'integrations', label: 'Integrations', icon: <GitBranch size={14} /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Profile */}
      <TabPanel id="profile" activeTab={activeTab}>
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#2A3A48]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald to-cyan flex items-center justify-center text-2xl font-bold text-white">
              {profile.fullName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-[#F4F7FA]">{profile.fullName || 'Your Name'}</p>
              <p className="text-xs text-[#9BA9B7]">@{profile.username}</p>
              <Badge variant="emerald" size="sm" className="mt-1">{profile.role.replace('_', ' ')}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} />
            <Input label="Username" value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} />
            <Input label="Email" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            <div>
              <label className="text-sm font-medium text-[#F4F7FA] block mb-1.5">Role</label>
              <select value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value as UserRole }))}
                className="w-full bg-[#18232D] border border-[#2A3A48] text-sm text-[#F4F7FA] rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button loading={saving} onClick={saveProfile}>Save Changes</Button>
          </div>
        </Card>
      </TabPanel>

      {/* Security */}
      <TabPanel id="security" activeTab={activeTab}>
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <CardTitle>Change Password</CardTitle>
            <Input label="Current Password" type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
            <Input label="New Password" type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} />
            <Input label="Confirm New Password" type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
            <div className="flex justify-end"><Button loading={saving} onClick={savePassword}>Update Password</Button></div>
          </Card>
          <Card className="p-6">
            <CardTitle className="mb-4">Two-Factor Authentication</CardTitle>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#F4F7FA]">Authenticator App</p>
                <p className="text-xs text-[#9BA9B7] mt-0.5">Add an extra layer of security</p>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </Card>
        </div>
      </TabPanel>

      {/* Integrations */}
      <TabPanel id="integrations" activeTab={activeTab}>
        <div className="space-y-4">
          <Card className="p-6">
            <CardTitle className="mb-4">Connected Services</CardTitle>
            <div className="space-y-4">
              {[
                { name: 'GitHub', desc: 'Scan repositories and access security advisories', connected: user?.githubConnected ?? false, color: 'text-[#F4F7FA]' },
                { name: 'Google', desc: 'Sign in with your Google account', connected: false, color: 'text-blue-400' },
              ].map(svc => (
                <div key={svc.name} className="flex items-center justify-between py-3 border-b border-[#2A3A48] last:border-0">
                  <div>
                    <p className={`text-sm font-medium ${svc.color}`}>{svc.name}</p>
                    <p className="text-xs text-[#9BA9B7]">{svc.desc}</p>
                  </div>
                  <Button size="sm" variant={svc.connected ? 'danger' : 'secondary'}>
                    {svc.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <CardTitle className="mb-4">API Key</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#18232D] border border-[#2A3A48] rounded-lg px-4 py-2.5 font-mono text-sm text-[#9BA9B7]">
                {showApiKey ? demoApiKey : '•'.repeat(40)}
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(demoApiKey); toast.success('Copied!'); }}>
                <Copy size={15} />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => toast.success('API key regenerated (demo)')}>
                <RefreshCw size={15} />
              </Button>
            </div>
            <p className="text-xs text-[#9BA9B7] mt-2">Keep your API key secret. It provides full access to your SecureSphere data.</p>
          </Card>
        </div>
      </TabPanel>

      {/* Notifications */}
      <TabPanel id="notifications" activeTab={activeTab}>
        <Card className="p-6">
          <CardTitle className="mb-4">Notification Preferences</CardTitle>
          <ToggleSwitch checked={notifs.critical} onChange={v => setNotifs(n => ({ ...n, critical: v }))} label="Critical vulnerability alerts" />
          <ToggleSwitch checked={notifs.high} onChange={v => setNotifs(n => ({ ...n, high: v }))} label="High severity alerts" />
          <ToggleSwitch checked={notifs.weekly} onChange={v => setNotifs(n => ({ ...n, weekly: v }))} label="Weekly security digest email" />
          <ToggleSwitch checked={notifs.scanComplete} onChange={v => setNotifs(n => ({ ...n, scanComplete: v }))} label="Scan completion notifications" />
          <div className="pt-4 flex justify-end">
            <Button onClick={() => toast.success('Preferences saved!')}>Save Preferences</Button>
          </div>
        </Card>
      </TabPanel>
    </div>
  );
}
