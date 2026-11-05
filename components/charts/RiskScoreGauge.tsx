'use client';

import { useMemo } from 'react';
import { riskLevelConfig, getRiskLevel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';

interface RiskScoreGaugeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function RiskScoreGauge({ score, size = 'md', showLabel = true, className }: RiskScoreGaugeProps) {
  const riskLevel = getRiskLevel(score);
  const config = riskLevelConfig[riskLevel];

  const sizes = {
    sm: { r: 44, strokeWidth: 8, fontSize: 'text-2xl', labelSize: 'text-xs', svgSize: 110 },
    md: { r: 60, strokeWidth: 10, fontSize: 'text-4xl', labelSize: 'text-sm', svgSize: 148 },
    lg: { r: 80, strokeWidth: 12, fontSize: 'text-5xl', labelSize: 'text-base', svgSize: 196 },
  };

  const { r, strokeWidth, fontSize, labelSize, svgSize } = sizes[size];
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  // We only use the bottom 3/4 of a circle (270 degrees)
  const startAngle = 135; // degrees
  const endAngle = 405;   // 135 + 270
  const totalAngle = 270;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number): string => {
    const start = { x: cx + r * Math.cos(toRad(startDeg)), y: cy + r * Math.sin(toRad(startDeg)) };
    const end = { x: cx + r * Math.cos(toRad(endDeg)), y: cy + r * Math.sin(toRad(endDeg)) };
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const fillAngle = startAngle + (score / 100) * totalAngle;

  // Color gradient based on score
  const getColor = (s: number) => {
    if (s >= 80) return '#EF4444';
    if (s >= 60) return '#F97316';
    if (s >= 40) return '#EAB308';
    if (s >= 20) return '#3B82F6';
    return '#20B486';
  };

  const color = getColor(score);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize}>
          {/* Background track */}
          <path
            d={describeArc(cx, cy, r, startAngle, endAngle)}
            fill="none"
            stroke="#2A3A48"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Score fill */}
          {score > 0 && (
            <path
              d={describeArc(cx, cy, r, startAngle, fillAngle)}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${color}60)`,
                transition: 'all 1s ease-out',
              }}
            />
          )}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold text-[#F4F7FA]', fontSize)} style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-[#9BA9B7] mt-0.5">/ 100</span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center -mt-2">
          <span className={cn('font-semibold', labelSize)} style={{ color }}>
            {config.label}
          </span>
          <p className="text-xs text-[#9BA9B7] mt-0.5">{config.description}</p>
        </div>
      )}
    </div>
  );
}
