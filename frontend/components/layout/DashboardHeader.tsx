'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, ChevronDown, User, Settings, LogOut, Shield, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth';
import type { User as UserType } from '@/lib/types';

interface DashboardHeaderProps {
  user?: UserType;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  notifications?: number;
}

export default function DashboardHeader({ user, title, subtitle, actions, notifications = 0 }: DashboardHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#18232D] border-b border-[#2A3A48] flex-shrink-0">
      {/* Left: Page title */}
      <div>
        {title && <h1 className="text-lg font-semibold text-[#F4F7FA]">{title}</h1>}
        {subtitle && <p className="text-xs text-[#9BA9B7]">{subtitle}</p>}
      </div>

      {/* Right: Actions + notifications + user */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-[#9BA9B7] hover:bg-[#202C37] hover:text-[#F4F7FA] transition-all"
        >
          <Search size={18} />
        </button>

        {/* Custom actions */}
        {actions}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#9BA9B7] hover:bg-[#202C37] hover:text-[#F4F7FA] transition-all"
          >
            <Bell size={18} />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[#202C37] border border-[#2A3A48] rounded-xl shadow-2xl z-50"
              >
                <div className="p-4 border-b border-[#2A3A48] flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#F4F7FA]">Notifications</span>
                  <span className="text-xs text-emerald cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="p-3 space-y-1 max-h-80 overflow-y-auto">
                  {notifications === 0 ? (
                    <div className="py-6 text-center text-sm text-[#9BA9B7]">No new notifications</div>
                  ) : (
                    <div className="py-2 text-center text-sm text-[#9BA9B7]">
                      {notifications} new notification{notifications > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#2A3A48] mx-1" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#202C37] transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald to-cyan flex items-center justify-center text-white text-xs font-bold">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.fullName?.charAt(0).toUpperCase() ?? 'U'
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[#F4F7FA] leading-tight">{user?.fullName ?? 'User'}</p>
              <p className="text-[10px] text-[#9BA9B7] leading-tight capitalize">{user?.role ?? 'developer'}</p>
            </div>
            <ChevronDown size={14} className="text-[#9BA9B7]" />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-[#202C37] border border-[#2A3A48] rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-[#2A3A48]">
                  <p className="text-sm font-semibold text-[#F4F7FA]">{user?.fullName}</p>
                  <p className="text-xs text-[#9BA9B7]">{user?.email}</p>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9BA9B7] hover:bg-[#2A3A48] hover:text-[#F4F7FA] transition-all"
                  >
                    <User size={15} />
                    Profile & Settings
                  </Link>
                  <Link
                    href="/settings#security"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9BA9B7] hover:bg-[#2A3A48] hover:text-[#F4F7FA] transition-all"
                  >
                    <Shield size={15} />
                    Security
                  </Link>
                </div>
                <div className="p-1.5 border-t border-[#2A3A48]">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click-outside overlay */}
      {(userMenuOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setUserMenuOpen(false); setNotifOpen(false); }}
        />
      )}
    </header>
  );
}
