'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface SeverityPieChartProps {
  data: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  className?: string;
}

const COLORS = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#3B82F6',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-[#202C37] border border-[#2A3A48] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold capitalize" style={{ color: COLORS[name as keyof typeof COLORS] }}>
        {name}
      </p>
      <p className="text-sm font-bold text-[#F4F7FA]">{value}</p>
    </div>
  );
};

export default function SeverityPieChart({ data, className }: SeverityPieChartProps) {
  const chartData = useMemo(() => [
    { name: 'critical', value: data.critical },
    { name: 'high', value: data.high },
    { name: 'medium', value: data.medium },
    { name: 'low', value: data.low },
  ].filter(d => d.value > 0), [data]);

  const total = data.critical + data.high + data.medium + data.low;

  if (total === 0) {
    return (
      <div className={cn('flex items-center justify-center h-40', className)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-emerald/30 flex items-center justify-center mx-auto mb-2">
            <span className="text-emerald text-2xl font-bold">✓</span>
          </div>
          <p className="text-sm text-[#9BA9B7]">No vulnerabilities</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xl font-bold text-[#F4F7FA]">{total}</p>
            <p className="text-xs text-[#9BA9B7]">Total</p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[entry.name as keyof typeof COLORS] }} />
            <span className="text-xs text-[#9BA9B7] capitalize">{entry.name}</span>
            <span className="text-xs font-semibold text-[#F4F7FA]">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
