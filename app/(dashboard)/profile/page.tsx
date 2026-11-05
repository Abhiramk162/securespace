'use client';

import { useEffect, useState } from 'react';
import {
  UserCircle, Mail, Shield, Briefcase, Lock,
  Save, Check, Sparkles, Key
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({
    full_name: '',
    email: '',
    role: '',
    professional_interests: '',
    username: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/auth/me')
      .then(res => setProfile(res.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/auth/profile', {
        full_name: profile.full_name,
        role: profile.role,
        professional_interests: profile.professional_interests
      });
      toast.success('Profile saved successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#2A3A48] pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold mb-1">
          <UserCircle size={13} />
          <span>Operator Profile</span>
        </div>
        <h1 className="text-2xl font-bold text-[#F4F7FA]">My Profile & Workspace Identity</h1>
        <p className="text-xs text-[#9BA9B7]">
          Manage your operator credentials, professional security specializations, and workspace role.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-[#2A3A48]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald to-cyan flex items-center justify-center text-white text-2xl font-bold">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F4F7FA]">{profile.full_name || 'Security Operator'}</h3>
              <p className="text-xs text-[#9BA9B7]">{profile.email}</p>
              <span className="text-[10px] text-cyan bg-cyan/10 border border-cyan/30 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                {profile.role || 'Cybersecurity Architect'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
            <Input
              label="Username"
              value={profile.username}
              disabled
            />
            <Input
              label="Email Address"
              value={profile.email}
              disabled
            />
            <Input
              label="Assigned Role"
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9BA9B7] uppercase tracking-wider mb-1.5">
              Professional Interests & Security Scope
            </label>
            <textarea
              rows={3}
              value={profile.professional_interests}
              onChange={(e) => setProfile({ ...profile, professional_interests: e.target.value })}
              className="w-full bg-[#18232D] border border-[#2A3A48] rounded-lg px-3 py-2 text-sm text-[#F4F7FA] focus:outline-none focus:border-emerald"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving} leftIcon={<Save size={15} />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
