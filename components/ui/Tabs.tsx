'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs({ tabs, activeTab, onChange, className, size = 'md' }: TabsProps) {
  const [internal, setInternal] = useState(tabs[0]?.id);
  const current = activeTab ?? internal;
  const handleChange = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
  };

  return (
    <div className={cn('flex gap-1 bg-[#18232D] border border-[#2A3A48] rounded-lg p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className={cn(
            'flex items-center gap-2 font-medium rounded-md transition-all duration-200',
            sizes[size],
            current === tab.id
              ? 'bg-[#202C37] text-[#F4F7FA] shadow-sm'
              : 'text-[#9BA9B7] hover:text-[#F4F7FA] hover:bg-[#202C37]/50'
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && (
            <span className={cn(
              'text-xs rounded-full px-1.5 py-0.5 font-semibold',
              current === tab.id ? 'bg-emerald/20 text-emerald' : 'bg-[#2A3A48] text-[#9BA9B7]'
            )}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, activeTab, children, className }: TabPanelProps) {
  if (id !== activeTab) return null;
  return <div className={className}>{children}</div>;
}
