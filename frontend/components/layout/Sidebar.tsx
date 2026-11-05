'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShieldAlert, FolderGit2, ScanLine, PackageSearch,
  ShieldCheck, AlertTriangle, Crosshair, Bot, Globe2, GitFork,
  Sparkles, FileText, History, BellRing, Link2, UserCircle,
  Settings, HelpCircle, ChevronLeft, ChevronRight, LogOut, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth';

interface NavSection {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { href: '/security-overview', label: 'Security Overview', icon: <ShieldAlert size={18} /> },
      { href: '/projects', label: 'My Projects', icon: <FolderGit2 size={18} /> },
    ],
  },
  {
    title: 'SECURITY ANALYSIS',
    items: [
      { href: '/scanner', label: 'Repository Scanner', icon: <ScanLine size={18} /> },
      { href: '/dependencies', label: 'Dependency Intelligence', icon: <PackageSearch size={18} /> },
      { href: '/vulnerabilities', label: 'Vulnerability Analysis', icon: <ShieldCheck size={18} /> },
      { href: '/package-risk', label: 'Package Risk Analyzer', icon: <AlertTriangle size={18} /> },
      { href: '/threat-detection', label: 'Threat Detection', icon: <Crosshair size={18} /> },
    ],
  },
  {
    title: 'AI & INTELLIGENCE',
    items: [
      { href: '/ai-assistant', label: 'AI Security Assistant', icon: <Bot size={18} /> },
      { href: '/threat-intelligence', label: 'Threat Intelligence', icon: <Globe2 size={18} /> },
      { href: '/attack-path', label: 'Attack Path Analysis', icon: <GitFork size={18} /> },
      { href: '/recommendations', label: 'Security Recommendations', icon: <Sparkles size={18} /> },
    ],
  },
  {
    title: 'REPORTING',
    items: [
      { href: '/reports', label: 'Security Reports', icon: <FileText size={18} /> },
      { href: '/scan-history', label: 'Scan History', icon: <History size={18} /> },
      { href: '/monitoring', label: 'Monitoring & Alerts', icon: <BellRing size={18} /> },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { href: '/integrations', label: 'Integrations', icon: <Link2 size={18} /> },
      { href: '/profile', label: 'My Profile', icon: <UserCircle size={18} /> },
      { href: '/settings', label: 'Settings', icon: <Settings size={18} /> },
      { href: '/docs', label: 'Help & Documentation', icon: <HelpCircle size={18} /> },
    ],
  },
];

interface SidebarProps {
  user?: { fullName: string; email: string; avatarUrl?: string };
  badgeCounts?: Record<string, number>;
}

export default function Sidebar({ user, badgeCounts = {} }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-[#18232D] border-r border-[#2A3A48] flex-shrink-0 z-30 select-none"
    >
      {/* Brand Header */}
      <div className={cn('flex items-center gap-3 px-4 py-4 border-b border-[#2A3A48]', collapsed && 'justify-center')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald to-cyan flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald/20">
          <Zap size={20} className="text-[#101820] fill-[#101820]" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col"
            >
              <span className="font-extrabold text-[#F4F7FA] text-base tracking-tight leading-none">
                Secure<span className="text-emerald">Sphere</span>
              </span>
              <span className="text-[10px] text-[#9BA9B7] tracking-wider uppercase font-semibold mt-0.5">
                SecOps Intelligence
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 py-3 px-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2A3A48]">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <p className="px-2 text-[10px] font-bold text-[#6B7C8E] uppercase tracking-wider mb-1">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              const count = badgeCounts[item.href];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group relative',
                    active
                      ? 'bg-emerald/15 text-emerald border border-emerald/30 font-semibold'
                      : 'text-[#9BA9B7] hover:bg-[#202C37] hover:text-[#F4F7FA]'
                  )}
                >
                  <span className={cn('flex-shrink-0', active ? 'text-emerald' : 'text-[#9BA9B7] group-hover:text-cyan')}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="text-xs truncate">{item.label}</span>
                      {count !== undefined && count > 0 && (
                        <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.2 font-bold min-w-[18px] text-center">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Active Indicator Bar */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald rounded-r-full" />
                  )}

                  {/* Hover Tooltip for Collapsed State */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#202C37] border border-[#2A3A48] rounded-md text-xs text-[#F4F7FA] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer Card */}
      <div className="border-t border-[#2A3A48] p-3 bg-[#131D26]">
        <div className={cn('flex items-center gap-2.5', collapsed ? 'justify-center' : 'justify-between')}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald/20 border border-emerald/40 flex items-center justify-center text-emerald text-xs font-bold flex-shrink-0">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F4F7FA] truncate">
                  {user?.fullName || 'Security Analyst'}
                </p>
                <p className="text-[11px] text-[#9BA9B7] truncate">
                  {user?.email || 'analyst@securesphere.io'}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-md text-[#9BA9B7] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 bg-[#202C37] border border-[#2A3A48] rounded-full flex items-center justify-center text-[#9BA9B7] hover:text-emerald hover:border-emerald/50 transition-all z-40 shadow-md"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </motion.aside>
  );
}
