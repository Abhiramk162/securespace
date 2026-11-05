'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Code2, Shield, Cpu, GraduationCap, FlaskConical, Users,
  Github, Bell, BellOff, ChevronRight, ChevronLeft, CheckCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'developer', label: 'Developer', icon: <Code2 size={22} />, desc: 'Building software products' },
  { value: 'security_engineer', label: 'Security Engineer', icon: <Shield size={22} />, desc: 'Dedicated security focus' },
  { value: 'devops', label: 'DevOps', icon: <Cpu size={22} />, desc: 'Infrastructure & pipelines' },
  { value: 'student', label: 'Student', icon: <GraduationCap size={22} />, desc: 'Learning & exploring' },
  { value: 'researcher', label: 'Researcher', icon: <FlaskConical size={22} />, desc: 'Security research' },
  { value: 'other', label: 'Other', icon: <Users size={22} />, desc: 'Something else' },
];

const INTERESTS = [
  'Open Source Security', 'Dependency Management', 'CVE Tracking',
  'Code Review', 'DevSecOps', 'Threat Intelligence', 'Compliance', 'Supply Chain Security',
];

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [notifs, setNotifs] = useState({ critical: true, high: true, weekly: true });
  const [completing, setCompleting] = useState(false);
  const [userName, setUserName] = useState('there');

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const complete = async () => {
    setCompleting(true);
    try {
      await authApi.completeOnboarding({ role, interests, notifications: { critical: notifs.critical, high: notifs.high, weekly: notifs.weekly } });
      toast.success('Setup complete! Welcome to SecureSphere 🚀');
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally { setCompleting(false); }
  };

  return (
    <div className="min-h-screen bg-[#101820] bg-grid flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald to-cyan flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <span className="font-bold text-[#F4F7FA] text-lg">SecureSphere</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between mb-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={cn('flex-1 h-1 rounded-full mx-0.5 transition-all duration-500',
              i + 1 <= step ? 'bg-emerald' : 'bg-[#2A3A48]')} />
          ))}
        </div>
        <p className="text-xs text-[#9BA9B7] text-center">Step {step} of {TOTAL_STEPS}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-[#202C37] border border-[#2A3A48] rounded-2xl shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="p-8"
          >
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald to-cyan flex items-center justify-center mx-auto mb-5">
                  <Zap size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#F4F7FA] mb-3">Welcome to SecureSphere, {userName}!</h2>
                <p className="text-[#9BA9B7] mb-8 leading-relaxed">
                  Let's take 2 minutes to personalize your security workspace. We'll set up your profile, connect your tools, and configure alerts.
                </p>
                <Button onClick={next} className="w-full" rightIcon={<ChevronRight size={16} />}>Get Started</Button>
              </div>
            )}

            {/* Step 2: Role */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-[#F4F7FA] mb-1">What's your role?</h2>
                <p className="text-sm text-[#9BA9B7] mb-6">We'll tailor your experience to your needs.</p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <button key={r.value} onClick={() => setRole(r.value)}
                      className={cn('p-4 rounded-xl border text-left transition-all',
                        role === r.value ? 'border-emerald bg-emerald/10' : 'border-[#2A3A48] hover:border-[#374959]')}>
                      <div className={cn('mb-2', role === r.value ? 'text-emerald' : 'text-[#9BA9B7]')}>{r.icon}</div>
                      <p className="text-sm font-semibold text-[#F4F7FA]">{r.label}</p>
                      <p className="text-xs text-[#9BA9B7] mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Interests */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-[#F4F7FA] mb-1">What are you interested in?</h2>
                <p className="text-sm text-[#9BA9B7] mb-6">Select all that apply — we'll highlight relevant features.</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(i => (
                    <button key={i} onClick={() => toggleInterest(i)}
                      className={cn('px-4 py-2 rounded-full border text-sm transition-all',
                        interests.includes(i) ? 'border-emerald bg-emerald/10 text-emerald' : 'border-[#2A3A48] text-[#9BA9B7] hover:border-[#374959]')}>
                      {interests.includes(i) && <CheckCircle size={12} className="inline mr-1.5" />}
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: GitHub */}
            {step === 4 && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#18232D] border border-[#2A3A48] flex items-center justify-center mx-auto mb-5">
                  <Github size={28} className="text-[#F4F7FA]" />
                </div>
                <h2 className="text-xl font-bold text-[#F4F7FA] mb-3">Connect GitHub</h2>
                <p className="text-[#9BA9B7] mb-8 leading-relaxed">
                  Connect your GitHub account to automatically discover repositories and trigger scans on every push.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => authApi.githubOAuth()} variant="secondary" className="w-full" leftIcon={<Github size={16} />}>
                    Connect GitHub Account
                  </Button>
                  <Button onClick={next} variant="ghost" className="w-full text-[#9BA9B7]">
                    Skip for now
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Notifications */}
            {step === 5 && (
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#18232D] border border-[#2A3A48] flex items-center justify-center mb-5">
                  <Bell size={24} className="text-emerald" />
                </div>
                <h2 className="text-xl font-bold text-[#F4F7FA] mb-1">Notification Preferences</h2>
                <p className="text-sm text-[#9BA9B7] mb-6">Stay informed about what matters most.</p>
                <div className="space-y-3 mb-8">
                  {[
                    { key: 'critical', label: 'Critical vulnerability alerts', desc: 'Immediate notification for CVSS 9+' },
                    { key: 'high', label: 'High severity alerts', desc: 'Alerts for high-impact vulnerabilities' },
                    { key: 'weekly', label: 'Weekly security digest', desc: 'Summary every Monday morning' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-[#18232D] rounded-xl border border-[#2A3A48]">
                      <div>
                        <p className="text-sm font-medium text-[#F4F7FA]">{label}</p>
                        <p className="text-xs text-[#9BA9B7] mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof notifs] }))}
                        className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          notifs[key as keyof typeof notifs] ? 'bg-emerald' : 'bg-[#2A3A48]')}>
                        <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                          notifs[key as keyof typeof notifs] ? 'translate-x-6' : 'translate-x-1')} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button loading={completing} onClick={complete} className="w-full" rightIcon={<Zap size={16} />}>
                  Complete Setup
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step > 1 && step < 5 && (
          <div className="px-8 pb-6 flex justify-between">
            <Button variant="ghost" onClick={back} leftIcon={<ChevronLeft size={16} />}>Back</Button>
            <Button onClick={next} rightIcon={<ChevronRight size={16} />}>
              {step === 4 ? 'Skip' : 'Continue'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
