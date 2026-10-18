import React, { useState } from 'react';
import { CanteenRecord } from '../types/canteen';
import { PieChart, ShieldAlert, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RiskDonutChartProps {
  records: CanteenRecord[];
}

interface RiskSlice {
  level: 'Cao' | 'Trung bình' | 'Thấp';
  label: string;
  count: number;
  percentage: number;
  color: string;
  hoverColor: string;
  bgBadge: string;
  textBadge: string;
  borderBadge: string;
  description: string;
  avgScore: number;
}

export const RiskDonutChart: React.FC<RiskDonutChartProps> = ({ records }) => {
  const { language } = useLanguage();
  const isKo = language === 'ko';
  const [activeLevel, setActiveLevel] = useState<'Cao' | 'Trung bình' | 'Thấp' | null>(null);

  const total = records.length;

  const highList = records.filter((r) => r.risk_level === 'Cao');
  const medList = records.filter((r) => r.risk_level === 'Trung bình');
  const lowList = records.filter((r) => r.risk_level === 'Thấp');

  const calcAvg = (list: CanteenRecord[]) =>
    list.length > 0
      ? Math.round((list.reduce((acc, curr) => acc + curr.risk_score, 0) / list.length) * 10) / 10
      : 0;

  const slices: RiskSlice[] = [
    {
      level: 'Cao',
      label: isKo ? '경고 (고위험)' : 'Rủi ro Cao',
      count: highList.length,
      percentage: total > 0 ? (highList.length / total) * 100 : 0,
      color: '#f43f5e', // rose-500
      hoverColor: '#e11d48', // rose-600
      bgBadge: 'bg-rose-50',
      textBadge: 'text-rose-700',
      borderBadge: 'border-rose-200',
      description: isKo ? '60 - 100점 • 즉각 개입 및 감사 필요' : 'Điểm 60 - 100 • Cần can thiệp khẩn cấp',
      avgScore: calcAvg(highList),
    },
    {
      level: 'Trung bình',
      label: isKo ? '주의 (보통)' : 'Rủi ro Trung bình',
      count: medList.length,
      percentage: total > 0 ? (medList.length / total) * 100 : 0,
      color: '#f59e0b', // amber-500
      hoverColor: '#d97706', // amber-600
      bgBadge: 'bg-amber-50',
      textBadge: 'text-amber-700',
      borderBadge: 'border-amber-200',
      description: isKo ? '30 - 59점 • 주의 집중 관찰 요망' : 'Điểm 30 - 59 • Cảnh báo cần theo dõi sát',
      avgScore: calcAvg(medList),
    },
    {
      level: 'Thấp',
      label: isKo ? '안심 (낮음)' : 'Rủi ro Thấp',
      count: lowList.length,
      percentage: total > 0 ? (lowList.length / total) * 100 : 0,
      color: '#10b981', // emerald-500
      hoverColor: '#059669', // emerald-600
      bgBadge: 'bg-emerald-50',
      textBadge: 'text-emerald-700',
      borderBadge: 'border-emerald-200',
      description: isKo ? '0 - 29점 • 정상 허용 범위 내 안정 운영' : 'Điểm 0 - 29 • Vận hành ổn định trong định mức',
      avgScore: calcAvg(lowList),
    },
  ];

  // Helper to calculate SVG path for Donut arc
  const createArc = (
    centerX: number,
    centerY: number,
    startAngle: number,
    endAngle: number,
    innerRadius: number,
    outerRadius: number
  ) => {
    // If arc is full circle (360 degrees) or close to it
    if (endAngle - startAngle >= 359.99) {
      endAngle = startAngle + 359.99;
    }

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  };

  const center = 120;
  const baseInnerRadius = 62;
  const baseOuterRadius = 96;

  // Compute angles
  let currentAngle = 0;
  const nonZeroSlices = slices.filter((s) => s.count > 0);
  const gap = nonZeroSlices.length > 1 ? 2 : 0; // degree gap between segments

  const sliceAngles = slices.map((slice) => {
    if (total === 0 || slice.count === 0) {
      return { ...slice, startAngle: 0, endAngle: 0, hasData: false };
    }
    const sweep = (slice.count / total) * 360;
    const startAngle = currentAngle + gap / 2;
    const endAngle = currentAngle + sweep - gap / 2;
    currentAngle += sweep;
    return {
      ...slice,
      startAngle,
      endAngle: Math.max(startAngle, endAngle),
      hasData: true,
    };
  });

  const activeSlice = activeLevel ? slices.find((s) => s.level === activeLevel) : null;
  const overallAvgRisk =
    total > 0
      ? Math.round((records.reduce((acc, curr) => acc + curr.risk_score, 0) / total) * 10) / 10
      : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <span>Phân Bổ Mức Độ Rủi Ro</span>
                <span className="text-slate-400 font-normal text-xs">(Donut Chart)</span>
              </h4>
              <p className="text-xs text-slate-500">
                Tỷ trọng số trường hợp vận hành theo 3 cấp độ: Thấp, Trung bình & Cao
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            {total} trường hợp theo dõi
          </span>
        </div>
      </div>

      {/* Main Content Area: Donut Chart + Legend */}
      <div className="flex flex-col items-center justify-center gap-4 my-3">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
          {total === 0 ? (
            <div className="w-full h-full rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
              Không có dữ liệu
            </div>
          ) : (
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full transform transition-transform"
            >
              {sliceAngles.map((slice) => {
                if (!slice.hasData) return null;
                const isHovered = activeLevel === slice.level;
                const innerR = isHovered ? baseInnerRadius - 2 : baseInnerRadius;
                const outerR = isHovered ? baseOuterRadius + 6 : baseOuterRadius;
                const pathD = createArc(center, center, slice.startAngle, slice.endAngle, innerR, outerR);

                return (
                  <path
                    key={slice.level}
                    d={pathD}
                    fill={isHovered ? slice.hoverColor : slice.color}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setActiveLevel(slice.level)}
                    onMouseLeave={() => setActiveLevel(null)}
                    style={{
                      filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                    }}
                  >
                    <title>{`${slice.label}: ${slice.count} trường hợp (${slice.percentage.toFixed(1)}%)`}</title>
                  </path>
                );
              })}
            </svg>
          )}

          {/* Donut Center Overlay Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {activeSlice ? (
              <div className="animate-in fade-in zoom-in-95 duration-150">
                <span
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight block"
                  style={{ color: activeSlice.color }}
                >
                  {activeSlice.percentage.toFixed(1)}%
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  {activeSlice.count} {isKo ? '건' : 'Trường hợp'}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  {isKo 
                    ? (activeSlice.level === 'Cao' ? '경고(고위험)' : activeSlice.level === 'Trung bình' ? '주의(보통)' : '안심(낮음)')
                    : activeSlice.level}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
                  {total}
                </span>
                <span className="text-[11px] font-medium text-slate-500 block">
                  {isKo ? '총 분석 일지' : 'Tổng lượt phân tích'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  {isKo ? '평균:' : 'TB:'} {overallAvgRisk}/100 {isKo ? '점' : 'đ'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legend & Details Breakdown */}
        <div className="w-full space-y-2">
          {slices.map((slice) => {
            const isSelected = activeLevel === slice.level;
            return (
              <div
                key={slice.level}
                onMouseEnter={() => setActiveLevel(slice.level)}
                onMouseLeave={() => setActiveLevel(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? `${slice.bgBadge} ${slice.borderBadge} shadow-xs scale-[1.01]`
                    : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-xs font-bold text-slate-900">{slice.label}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs font-mono font-bold">
                    <span className="text-slate-800">{slice.count} {isKo ? '건' : 'Trường hợp'}</span>
                    <span className="text-slate-400">({slice.percentage.toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pl-4.5">
                  <span className="truncate">{slice.description}</span>
                  <span className="font-mono shrink-0 ml-1 text-slate-600 font-semibold">
                    {isKo ? '평균:' : 'TB:'} {slice.avgScore} {isKo ? '점' : 'đ'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Insights Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {highList.length > 0 ? (
              <span className="text-rose-700 font-semibold">
                {isKo 
                  ? `경고(고위험) ${highList.length}건 (${((highList.length / (total || 1)) * 100).toFixed(1)}%) 발생 — 즉시 확인이 필요합니다.`
                  : `Có ${highList.length} trường hợp rủi ro cao (${((highList.length / (total || 1)) * 100).toFixed(1)}%) cần kiểm tra ngay.`}
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold">
                {isKo 
                  ? '시스템 안정: 현재 필터 조건 내 고위험 항목 0건.'
                  : 'Hệ thống ổn định: 0 trường hợp rủi ro cao trong tập lọc hiện tại.'}
              </span>
            )}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          {isKo ? '급식소 및 조회 기간 필터와 자동 동기화됨' : 'Chỉ số tự động đồng bộ theo bộ lọc Canteen & Thời gian'}
        </span>
      </div>
    </div>
  );
};
