'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCurrentUser } from '@/lib/auth';
import type { User } from '@/lib/types';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { Zap } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#101820] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald to-cyan flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Zap size={22} className="text-white" />
        </div>
        <p className="text-sm text-[#9BA9B7]">Loading SecureSphere...</p>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (!u) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      } else {
        setUser(u);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#101820] overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
