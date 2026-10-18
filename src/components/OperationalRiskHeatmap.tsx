import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Cell,
} from 'recharts';
import { CanteenSummary, CanteenRecord, RiskThresholds } from '../types/canteen';
import { useLanguage } from '../context/LanguageContext';
import {
  Flame,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Package,
  Layers,
  LayoutGrid,
  TrendingUp,
  Info,
  Maximize2,
  X,
  ExternalLink,
} from 'lucide-react';

interface OperationalRiskHeatmapProps {
  summary: CanteenSummary[];
  records?: CanteenRecord[];
  thresholds?: RiskThresholds;
}

type ViewMode = 'matrix' | 'scatter' | 'list';
type RiskZoneFilter = 'all' | 'critical' | 'overstock' | 'extra_order' | 'safe';

// Definition of Matrix Heatmap bins
interface HeatCell {
  invBinIndex: number;
  extraBinIndex: number;
  invLabel: string;
  extraLabel: string;
  canteens: Array<{
    canteen: string;
    inventory_ratio_pct: number;
    extra_order_pct: number;
    cumulativeRiskScore: number;
    ending_inventory_value: number;
    pr3_value: number;
    riskZone: 'critical' | 'overstock' | 'extra_order' | 'safe';
  }>;
  riskIntensity: number; // 0 to 1
  zone: 'critical' | 'overstock' | 'extra_order' | 'safe';
}

export const OperationalRiskHeatmap: React.FC<OperationalRiskHeatmapProps> = ({
  summary,
  records = [],
  thresholds,
}) => {
  const { language, t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [filterZone, setFilterZone] = useState<RiskZoneFilter>('all');
  const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<HeatCell | null>(null);

  // Dynamic thresholds or standard defaults
  const invHighThreshold = thresholds?.inventory_high ?? 20.0;
  const extraOrderHighThreshold = thresholds?.pr3_high ?? 10.0;

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
  };

  // Compute enriched canteen risk profiles
  const enrichedData = useMemo(() => {
    return summary.map((item) => {
      const invRatio = item.inventory_ratio_pct;
      const extraPct = item.extra_order_pct;

      // Normalized indices relative to operational thresholds
      const normExtra = extraPct / (extraOrderHighThreshold || 10);
      const normInv = invRatio / (invHighThreshold || 20);

      // Cumulative risk score calculation (0 - 100)
      // If both are above threshold, synergy factor adds compounding penalty
      let cumulativeScore = Math.round(normExtra * 38 + normInv * 42);
      if (normExtra >= 1.0 && normInv >= 1.0) {
        cumulativeScore += 20; // Compound risk bonus
      }
      cumulativeScore = Math.min(100, Math.max(5, cumulativeScore));

      // Classify operational risk quadrant / zone
      let riskZone: 'critical' | 'overstock' | 'extra_order' | 'safe' = 'safe';
      let riskZoneTitle = language === 'ko' ? '안정적 최적 통제' : 'Vận hành tối ưu';
      let riskZoneBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

      if (invRatio >= invHighThreshold && extraPct >= extraOrderHighThreshold) {
        riskZone = 'critical';
        riskZoneTitle = language === 'ko' ? '심각한 복합 누적 리스크' : 'Rủi ro Kép Tích Lũy';
        riskZoneBadgeColor = 'bg-rose-50 text-rose-700 border-rose-300';
      } else if (invRatio >= invHighThreshold) {
        riskZone = 'overstock';
        riskZoneTitle = language === 'ko' ? '재고 과다 및 정체 위험' : 'Nguy cơ ứ đọng kho';
        riskZoneBadgeColor = 'bg-amber-50 text-amber-700 border-amber-300';
      } else if (extraPct >= extraOrderHighThreshold) {
        riskZone = 'extra_order';
        riskZoneTitle = language === 'ko' ? '추가/긴급발주 과다 위험' : 'Nguy cơ đặt hàng phát sinh';
        riskZoneBadgeColor = 'bg-orange-50 text-orange-700 border-orange-300';
      }

      return {
        ...item,
        cumulativeRiskScore: cumulativeScore,
        riskZone,
        riskZoneTitle,
        riskZoneBadgeColor,
        isCritical: riskZone === 'critical',
      };
    });
  }, [summary, invHighThreshold, extraOrderHighThreshold, language]);

  // Filtered canteen list based on risk zone button
  const filteredCanteens = useMemo(() => {
    if (filterZone === 'all') return enrichedData;
    return enrichedData.filter((c) => c.riskZone === filterZone);
  }, [enrichedData, filterZone]);

  // Overall system metrics for operational risk
  const stats = useMemo(() => {
    const total = enrichedData.length;
    const criticalCount = enrichedData.filter((c) => c.riskZone === 'critical').length;
    const overstockCount = enrichedData.filter((c) => c.riskZone === 'overstock').length;
    const extraOrderCount = enrichedData.filter((c) => c.riskZone === 'extra_order').length;
    const safeCount = enrichedData.filter((c) => c.riskZone === 'safe').length;

    const avgInvRatio = total > 0 
      ? Math.round((enrichedData.reduce((a, b) => a + b.inventory_ratio_pct, 0) / total) * 10) / 10 
      : 0;
    const avgExtraOrder = total > 0 
      ? Math.round((enrichedData.reduce((a, b) => a + b.extra_order_pct, 0) / total) * 10) / 10 
      : 0;
    const criticalInventoryValue = enrichedData
      .filter((c) => c.riskZone === 'critical')
      .reduce((a, b) => a + b.ending_inventory_value, 0);

    return {
      total,
      criticalCount,
      overstockCount,
      extraOrderCount,
      safeCount,
      avgInvRatio,
      avgExtraOrder,
      criticalInventoryValue,
    };
  }, [enrichedData]);

  // Heatmap Matrix grid configuration (4x4 Grid)
  // X axis: Extra Order % bins (<5%, 5-10%, 10-18%, >18%)
  // Y axis: Inventory Ratio % bins (<10%, 10-18%, 18-25%, >25%)
  const extraBins = [
    { label: '< 5%', min: 0, max: 5, desc: 'Đặt hàng tối ưu' },
    { label: '5% - 10%', min: 5, max: 10, desc: 'Mức bình thường' },
    { label: '10% - 18%', min: 10, max: 18, desc: 'Phát sinh cao' },
    { label: '> 18%', min: 18, max: 9999, desc: 'Phát sinh đột biến' },
  ];

  const invBins = [
    { label: '> 25%', min: 25, max: 9999, desc: 'Tồn kho báo động' },
    { label: '18% - 25%', min: 18, max: 25, desc: 'Tồn kho cao' },
    { label: '10% - 18%', min: 10, max: 18, desc: 'Tồn kho trung bình' },
    { label: '< 10%', min: 0, max: 10, desc: 'Kiểm soát tốt' },
  ];

  const heatmapMatrix = useMemo(() => {
    const grid: HeatCell[][] = [];

    invBins.forEach((invB, rowIdx) => {
      const row: HeatCell[] = [];
      extraBins.forEach((extB, colIdx) => {
        // Find canteens that fall in this bucket
        const matching = enrichedData.filter((c) => {
          const invMatch = c.inventory_ratio_pct >= invB.min && c.inventory_ratio_pct < invB.max;
          const extMatch = c.extra_order_pct >= extB.min && c.extra_order_pct < extB.max;
          return invMatch && extMatch;
        });

        // Determine cell zone and heat intensity (0 to 1)
        // High rowIdx means lower inventory; low rowIdx (0) means high inventory (>25%)
        // High colIdx (3) means high extra order (>18%)
        const invWeight = 3 - rowIdx; // 3 for >25%, 0 for <10%
        const extraWeight = colIdx;   // 3 for >18%, 0 for <5%

        const combinedIntensity = (invWeight * 1.1 + extraWeight * 1.0) / 6.3; // 0 to 1

        let zone: 'critical' | 'overstock' | 'extra_order' | 'safe' = 'safe';
        if (invWeight >= 2 && extraWeight >= 2) {
          zone = 'critical';
        } else if (invWeight >= 2) {
          zone = 'overstock';
        } else if (extraWeight >= 2) {
          zone = 'extra_order';
        }

        row.push({
          invBinIndex: rowIdx,
          extraBinIndex: colIdx,
          invLabel: invB.label,
          extraLabel: extB.label,
          canteens: matching.map((m) => ({
            canteen: m.canteen,
            inventory_ratio_pct: m.inventory_ratio_pct,
            extra_order_pct: m.extra_order_pct,
            cumulativeRiskScore: m.cumulativeRiskScore,
            ending_inventory_value: m.ending_inventory_value,
            pr3_value: m.pr3_value,
            riskZone: m.riskZone,
          })),
          riskIntensity: combinedIntensity,
          zone,
        });
      });
      grid.push(row);
    });

    return grid;
  }, [enrichedData]);

  // Color generator for heatmap cells
  const getCellColorStyles = (cell: HeatCell) => {
    const hasCanteen = cell.canteens.length > 0;
    const intensity = cell.riskIntensity;

    if (!hasCanteen) {
      if (cell.zone === 'critical') return 'bg-rose-50/50 border-rose-100 text-rose-300';
      if (cell.zone === 'overstock') return 'bg-amber-50/40 border-amber-100 text-amber-300';
      if (cell.zone === 'extra_order') return 'bg-orange-50/40 border-orange-100 text-orange-300';
      return 'bg-slate-50/60 border-slate-100 text-slate-300';
    }

    // Has canteens: rich distinct heatmap gradient
    if (cell.zone === 'critical' || intensity >= 0.7) {
      return 'bg-gradient-to-br from-rose-500 to-rose-700 text-white border-rose-600 shadow-xs hover:from-rose-600 hover:to-rose-800';
    }
    if (cell.zone === 'overstock' || intensity >= 0.45) {
      return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-500 shadow-xs hover:from-amber-500 hover:to-amber-700';
    }
    if (cell.zone === 'extra_order' || intensity >= 0.35) {
      return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white border-orange-500 shadow-xs hover:from-orange-500 hover:to-orange-700';
    }
    return 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-xs hover:from-emerald-600 hover:to-teal-700';
  };

  // Recharts Scatter Chart Data
  const scatterData = useMemo(() => {
    return enrichedData.map((item) => ({
      ...item,
      x: item.extra_order_pct,
      y: item.inventory_ratio_pct,
      z: Math.max(120, Math.min(600, Math.round(item.ending_inventory_value / 200000))),
    }));
  }, [enrichedData]);

  // Selected Canteen Full Records Inspection
  const selectedCanteenDetails = useMemo(() => {
    if (!selectedCanteen) return null;
    const summaryItem = enrichedData.find((c) => c.canteen === selectedCanteen);
    const canteenRecords = records.filter((r) => r.canteen === selectedCanteen);
    return {
      summary: summaryItem,
      records: canteenRecords,
    };
  }, [selectedCanteen, enrichedData, records]);

  // Maximum scales for Scatter plot axes
  const maxX = Math.max(30, Math.ceil((Math.max(...enrichedData.map((d) => d.extra_order_pct), 15) + 5) / 5) * 5);
  const maxY = Math.max(40, Math.ceil((Math.max(...enrichedData.map((d) => d.inventory_ratio_pct), 25) + 5) / 5) * 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
              <Flame className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {t.heatmapTitle}
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {language === 'ko' ? '누적 복합 리스크' : 'Rủi ro vận hành tích lũy'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.heatmapSubtitle}
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t.heatmapMatrixTab}</span>
            </button>
            <button
              onClick={() => setViewMode('scatter')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'scatter'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.heatmapScatterTab}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'ko' ? '지표 리스트' : 'Bảng Chỉ số Nhiệt'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Badges Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterZone(filterZone === 'critical' ? 'all' : 'critical')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterZone === 'critical'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200'
              : 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
              {t.heatmapCriticalZone}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-xl font-black text-rose-900">{stats.criticalCount}</span>
            <span className="text-[11px] text-rose-600 font-medium">{language === 'ko' ? '개소' : 'Canteen'}</span>
          </div>
          <p className="text-[10px] text-rose-600 mt-1 line-clamp-1">
            {language === 'ko' ? `재고 > ${invHighThreshold}% & 발주 > ${extraOrderHighThreshold}%` : `Tồn kho > ${invHighThreshold}% & Đặt > ${extraOrderHighThreshold}%`}
          </p>
        </div>

        <div
          onClick={() => setFilterZone(filterZone === 'overstock' ? 'all' : 'overstock')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterZone === 'overstock'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
              : 'bg-amber-50/40 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              {t.heatmapOverstockZone}
            </span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-xl font-black text-amber-900">{stats.overstockCount}</span>
            <span className="text-[11px] text-amber-600 font-medium">{language === 'ko' ? '개소' : 'Canteen'}</span>
          </div>
          <p className="text-[10px] text-amber-600 mt-1 line-clamp-1">
            {language === 'ko' ? `재고 > ${invHighThreshold}%, 발주 정상` : `Tồn kho > ${invHighThreshold}%, Đặt kiểm soát`}
          </p>
        </div>

        <div
          onClick={() => setFilterZone(filterZone === 'extra_order' ? 'all' : 'extra_order')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterZone === 'extra_order'
              ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200'
              : 'bg-orange-50/40 border-orange-200 hover:bg-orange-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider">
              {t.heatmapExtraOrderZone}
            </span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-xl font-black text-orange-900">{stats.extraOrderCount}</span>
            <span className="text-[11px] text-orange-600 font-medium">{language === 'ko' ? '개소' : 'Canteen'}</span>
          </div>
          <p className="text-[10px] text-orange-600 mt-1 line-clamp-1">
            {language === 'ko' ? `발주 > ${extraOrderHighThreshold}%, 재고 정상` : `Đặt > ${extraOrderHighThreshold}%, Tồn kho bình thường`}
          </p>
        </div>

        <div
          onClick={() => setFilterZone(filterZone === 'safe' ? 'all' : 'safe')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterZone === 'safe'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
              : 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              {t.heatmapOptimalZone}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-xl font-black text-emerald-900">{stats.safeCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium">{language === 'ko' ? '개소' : 'Canteen'}</span>
          </div>
          <p className="text-[10px] text-emerald-600 mt-1 line-clamp-1">
            {language === 'ko' ? '재고 및 발주 모두 정상 범위' : 'Tồn kho & đặt hàng đều an toàn'}
          </p>
        </div>
      </div>

      {/* VIEW 1: MATRIX HEATMAP 4x4 */}
      {viewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">{language === 'ko' ? '세로축 (Y):' : 'Trục Tung (Y):'}</span>
              <span>{language === 'ko' ? '기말재고 계수/비율' : 'Tỷ lệ tồn kho (inventory_ratio_pct)'}</span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-slate-700">{language === 'ko' ? '가로축 (X):' : 'Trục Hoành (X):'}</span>
              <span>{language === 'ko' ? '추가발주(PR3) 비율' : 'Tỷ lệ đặt hàng quá mức (extra_order_pct)'}</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                <span>{language === 'ko' ? '안심' : 'An toàn'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-xs bg-amber-400"></span>
                <span>{language === 'ko' ? '재고과다' : 'Ứ đọng kho'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-xs bg-orange-400"></span>
                <span>{language === 'ko' ? '추가발주' : 'Phát sinh đơn'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-xs bg-rose-600"></span>
                <span className="font-semibold text-rose-700">{language === 'ko' ? '복합 위험' : 'Rủi ro Kép Tích Lũy'}</span>
              </span>
            </div>
          </div>

          {/* Matrix Container */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40 p-4">
            <div className="flex">
              {/* Y Axis Labels (Left) */}
              <div className="flex flex-col justify-between w-28 pr-3 py-6 text-right">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Tồn Kho (Y)
                </div>
                {invBins.map((bin) => (
                  <div key={bin.label} className="h-20 flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-700">{bin.label}</span>
                    <span className="text-[10px] text-slate-400 truncate">{bin.desc}</span>
                  </div>
                ))}
              </div>

              {/* Grid 4x4 */}
              <div className="flex-1 space-y-2">
                {heatmapMatrix.map((row, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-4 gap-2 h-20">
                    {row.map((cell, colIdx) => {
                      const colorClass = getCellColorStyles(cell);
                      const isHotZone = cell.zone === 'critical' && cell.canteens.length > 0;

                      return (
                        <div
                          key={colIdx}
                          onClick={() => {
                            if (cell.canteens.length > 0) {
                              setSelectedCell(cell);
                            }
                          }}
                          className={`relative rounded-lg border p-2 transition-all cursor-pointer flex flex-col justify-between ${colorClass} ${
                            isHotZone ? 'ring-2 ring-rose-400 animate-pulse' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium opacity-80">
                              {cell.invLabel} × {cell.extraLabel}
                            </span>
                            {cell.canteens.length > 0 && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                  cell.zone === 'critical'
                                    ? 'bg-rose-900 text-white'
                                    : 'bg-black/20 text-white'
                                }`}
                              >
                                {cell.canteens.length}
                              </span>
                            )}
                          </div>

                          {/* Canteen names inside cell */}
                          {cell.canteens.length > 0 ? (
                            <div className="space-y-0.5 my-auto overflow-hidden">
                              <div className="flex flex-wrap gap-1">
                                {cell.canteens.slice(0, 2).map((c) => (
                                  <span
                                    key={c.canteen}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCanteen(c.canteen);
                                    }}
                                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-white/20 hover:bg-white/40 backdrop-blur-xs transition-colors truncate max-w-full inline-block"
                                    title={`${c.canteen}: Tồn ${c.inventory_ratio_pct}%, Đặt ${c.extra_order_pct}%`}
                                  >
                                    {c.canteen}
                                  </span>
                                ))}
                                {cell.canteens.length > 2 && (
                                  <span className="text-[9px] font-bold opacity-90 self-center">
                                    +{cell.canteens.length - 2} khác
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center my-auto text-[10px] opacity-40 font-mono">
                              —
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[9px] opacity-80 pt-0.5">
                            <span>
                              {cell.zone === 'critical'
                                ? (language === 'ko' ? '🚨 위험' : '🚨 Nguy cấp')
                                : cell.zone === 'overstock'
                                ? (language === 'ko' ? '📦 과다' : '📦 Ứ đọng')
                                : cell.zone === 'extra_order'
                                ? (language === 'ko' ? '⚡ 추가' : '⚡ Phát sinh')
                                : (language === 'ko' ? '✅ 정상' : '✅ Tối ưu')}
                            </span>
                            {cell.canteens.length > 0 && (
                              <span className="underline text-[9px]">{language === 'ko' ? '상세보기' : 'Xem chi tiết'}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* X Axis Labels (Bottom) */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                  {extraBins.map((bin) => (
                    <div key={bin.label} className="text-center">
                      <div className="text-xs font-bold text-slate-700">{bin.label}</div>
                      <div className="text-[10px] text-slate-400">{bin.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-1">
                  {language === 'ko' ? '추가발주(PR3) 초과 비율 (X축)' : 'Tỷ lệ đặt hàng quá mức / phát sinh (X)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RECHARTS 2D SCATTER HEATMAP */}
      {viewMode === 'scatter' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">{language === 'ko' ? '산점도 열지도 (2D Scatter Plot):' : 'Biểu đồ Phân tán Nhiệt độ (2D Scatter Plot):'}</span> {language === 'ko' ? '각 포인트는 급식소를 나타냅니다. 원의 크기는 재고액, 색상은 누적 리스크 수준입니다.' : 'Mỗi điểm là một Canteen. Kích thước điểm tương ứng với giá trị tồn kho. Màu điểm biểu thị độ nóng của rủi ro tích lũy.'}
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>{language === 'ko' ? '복합 위험 구역 (우측 상단)' : 'Vùng Rủi ro Kép (Góc trên - phải)'}</span>
            </div>
          </div>

          <div className="h-[420px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 40, left: 15 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const c = e.activePayload[0].payload;
                    setSelectedCanteen(c.canteen);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Tỷ lệ đặt hàng quá mức"
                  unit="%"
                  domain={[0, maxX]}
                  label={{
                    value: 'Tỷ lệ đặt hàng quá mức extra_order_pct (%)',
                    position: 'bottom',
                    offset: 20,
                    style: { fontSize: 12, fill: '#64748b', fontWeight: 600 },
                  }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Tỷ lệ tồn kho"
                  unit="%"
                  domain={[0, maxY]}
                  label={{
                    value: 'Tỷ lệ tồn kho inventory_ratio_pct (%)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    style: { fontSize: 12, fill: '#64748b', fontWeight: 600 },
                  }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <ZAxis type="number" dataKey="z" range={[80, 450]} name="Giá trị tồn kho" />

                {/* Risk Quadrant Reference Areas */}
                {/* 1. Critical Zone (Top-Right): High Inv & High Extra */}
                <ReferenceArea
                  x1={extraOrderHighThreshold}
                  x2={maxX}
                  y1={invHighThreshold}
                  y2={maxY}
                  fill="#fee2e2"
                  fillOpacity={0.45}
                  stroke="#fca5a5"
                  strokeDasharray="2 2"
                />

                {/* 2. Overstock Zone (Top-Left): High Inv & Low Extra */}
                <ReferenceArea
                  x1={0}
                  x2={extraOrderHighThreshold}
                  y1={invHighThreshold}
                  y2={maxY}
                  fill="#fef3c7"
                  fillOpacity={0.3}
                />

                {/* 3. Extra Order Spike Zone (Bottom-Right): Low Inv & High Extra */}
                <ReferenceArea
                  x1={extraOrderHighThreshold}
                  x2={maxX}
                  y1={0}
                  y2={invHighThreshold}
                  fill="#ffedd5"
                  fillOpacity={0.3}
                />

                {/* Threshold Reference Lines */}
                <ReferenceLine
                  x={extraOrderHighThreshold}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Ngưỡng Đặt Quá Mức (${extraOrderHighThreshold}%)`,
                    position: 'insideTopRight',
                    fill: '#b91c1c',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <ReferenceLine
                  y={invHighThreshold}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Ngưỡng Tồn Kho Cao (${invHighThreshold}%)`,
                    position: 'insideRight',
                    fill: '#b45309',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />

                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isCritical = data.riskZone === 'critical';

                      return (
                        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-2 max-w-xs">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                            <span className="font-bold text-sm text-indigo-300">
                              {data.canteen}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCritical
                                  ? 'bg-rose-500 text-white'
                                  : data.riskZone === 'overstock'
                                  ? 'bg-amber-500 text-white'
                                  : data.riskZone === 'extra_order'
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-emerald-500 text-white'
                              }`}
                            >
                              {data.riskZoneTitle}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Hệ số Tồn / GR:</span>
                              <span
                                className={`font-mono font-bold ${
                                  data.inventory_ratio_pct >= invHighThreshold
                                    ? 'text-rose-400'
                                    : 'text-emerald-300'
                                }`}
                              >
                                {data.inventory_to_gr_ratio !== undefined ? data.inventory_to_gr_ratio.toFixed(2) : (data.ending_inventory_value / (data.gr_value || 1)).toFixed(2)} ({data.inventory_ratio_pct}%)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Hệ số Tồn / GI:</span>
                              <span className="font-mono text-indigo-300 font-semibold">
                                {data.inventory_to_gi_ratio !== undefined ? data.inventory_to_gi_ratio.toFixed(2) : (data.ending_inventory_value / (data.gi_value || 1)).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Tỷ lệ đặt quá mức (PR3):</span>
                              <span
                                className={`font-mono font-bold ${
                                  data.extra_order_pct >= extraOrderHighThreshold
                                    ? 'text-rose-400'
                                    : 'text-emerald-300'
                                }`}
                              >
                                {data.extra_order_pct}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Điểm Rủi Ro Tích Lũy:</span>
                              <span className="font-mono font-bold text-amber-300">
                                {data.cumulativeRiskScore} / 100
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-800 pt-1">
                              <span className="text-slate-400">Giá trị tồn kho cuối kỳ:</span>
                              <span className="font-mono text-slate-200">
                                {formatVND(data.ending_inventory_value)} ₫
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Tồn kho / suất ăn:</span>
                              <span className="font-mono text-indigo-300 font-semibold">
                                {formatVND(data.inventory_value_per_meal)} ₫
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 pt-1 italic text-center border-t border-slate-800">
                            Nhấp để xem bảng phân tích chi tiết canteen này
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Scatter name="Canteens" data={scatterData}>
                  {scatterData.map((entry, index) => {
                    let fill = '#10b981'; // green
                    if (entry.riskZone === 'critical') fill = '#e11d48'; // crimson
                    else if (entry.riskZone === 'overstock') fill = '#f59e0b'; // amber
                    else if (entry.riskZone === 'extra_order') fill = '#ea580c'; // orange

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fill}
                        stroke="#ffffff"
                        strokeWidth={2}
                        className="cursor-pointer transition-transform hover:scale-125"
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 3: CANTEEN HEAT RISK RANKING TABLE */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Bảng xếp hạng Canteen theo <strong>Chỉ số Rủi ro Vận hành Tích lũy</strong> giảm dần
            </span>
            <span className="font-medium text-slate-700">
              Hiển thị {filteredCanteens.length} / {enrichedData.length} Canteen
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3">Canteen</th>
                  <th className="px-3 py-3 text-center">Phân loại Vùng Rủi Ro</th>
                  <th className="px-3 py-3 text-right" title="Hệ số Tồn kho/GR = Tồn cuối / GR | Tồn kho/GI = Tồn cuối / GI">Hệ số Tồn (GR / GI)</th>
                  <th className="px-3 py-3 text-right">Đặt Quá Mức (extra_order_pct)</th>
                  <th className="px-3 py-3 text-center">Điểm Rủi Ro Tích Lũy</th>
                  <th className="px-3 py-3 text-right">Giá trị Tồn Kho</th>
                  <th className="px-3 py-3 text-right">Tồn / Suất</th>
                  <th className="px-3 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCanteens
                  .sort((a, b) => b.cumulativeRiskScore - a.cumulativeRiskScore)
                  .map((item) => (
                    <tr
                      key={item.canteen}
                      onClick={() => setSelectedCanteen(item.canteen)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        item.riskZone === 'critical' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              item.riskZone === 'critical'
                                ? 'bg-rose-500'
                                : item.riskZone === 'overstock'
                                ? 'bg-amber-500'
                                : item.riskZone === 'extra_order'
                                ? 'bg-orange-500'
                                : 'bg-emerald-500'
                            }`}
                          ></span>
                          <span>{item.canteen}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${item.riskZoneBadgeColor}`}
                        >
                          {item.riskZoneTitle}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono">
                        <span
                          className={`font-semibold ${
                            item.inventory_ratio_pct >= invHighThreshold
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-800'
                          }`}
                        >
                          GR: {item.inventory_to_gr_ratio !== undefined ? item.inventory_to_gr_ratio.toFixed(2) : (item.ending_inventory_value / (item.gr_value || 1)).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block" title="Hệ số Tồn kho cuối / GI xuất kho">
                          GI: {item.inventory_to_gi_ratio !== undefined ? item.inventory_to_gi_ratio.toFixed(2) : (item.ending_inventory_value / (item.gi_value || 1)).toFixed(2)}
                        </span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full ml-auto mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              item.inventory_ratio_pct >= invHighThreshold
                                ? 'bg-rose-500'
                                : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (item.inventory_ratio_pct / 30) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono">
                        <span
                          className={`font-semibold ${
                            item.extra_order_pct >= extraOrderHighThreshold
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-700'
                          }`}
                        >
                          {item.extra_order_pct}%
                        </span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full ml-auto mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              item.extra_order_pct >= extraOrderHighThreshold
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (item.extra_order_pct / 20) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-mono">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            item.cumulativeRiskScore >= 70
                              ? 'bg-rose-100 text-rose-800'
                              : item.cumulativeRiskScore >= 45
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.cumulativeRiskScore}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-700">
                        {formatVND(item.ending_inventory_value)} ₫
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-indigo-700">
                        {formatVND(item.inventory_value_per_meal)} ₫
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCanteen(item.canteen);
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors inline-flex items-center space-x-1"
                        >
                          <span>Soi chi tiết</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operational Risk Insight Box */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-slate-900 font-bold">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>{language === 'ko' ? '운영 리스크 복합 감사 분석의 의미' : 'Ý nghĩa nghiệp vụ kiểm toán rủi ro vận hành tích lũy'}</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          {language === 'ko' ? (
            <>
              <strong>재고율</strong>과 <strong>추가발주율(PR3)</strong> 간의 상관관계는 급식소 공급망 통제 수준을 보여주는 핵심 척도입니다. 
              한 급식소에서 높은 재고율(&gt; {invHighThreshold}%)과 지속적인 계획 외 추가발주(&gt; {extraOrderHighThreshold}%)가 동시에 발생하면, 
              이는 <strong>이중 손실 및 정체 위험</strong>을 의미합니다: 기존 재고가 소진되지 않았음에도 계속 발주하여 유통기한 초과 폐기 및 식재료 원가 상승을 초래합니다.
            </>
          ) : (
            <>
              Tương quan giữa <strong>Tỷ lệ tồn kho</strong> và <strong>Tỷ lệ đặt hàng quá mức (PR3)</strong> là tấm gương phản chiếu mức độ kiểm soát chuỗi cung ứng tại bếp ăn.
              Khi một Canteen vừa có tỷ lệ tồn kho cao (&gt; {invHighThreshold}%), vừa liên tục phát sinh đơn hàng ngoài kế hoạch (&gt; {extraOrderHighThreshold}%), 
              đây là dấu hiệu <strong>lãng phí kép và mất kiểm soát định mức</strong>: kho chưa giải phóng nhưng vẫn mua thêm, gây áp lực hết hạn nguyên liệu và đội chi phí bữa ăn.
            </>
          )}
        </p>
      </div>

      {/* MODAL 1: HEATMAP CELL DRILLDOWN */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-2">
                <span className="p-1 bg-indigo-100 rounded-md text-indigo-600">
                  <Maximize2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'ko' ? '열지도 셀 심층 분석' : 'Phân tích Ô Ma Trận Nhiệt'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ko' ? '재고율' : 'Tồn kho'}: {selectedCell.invLabel} | {language === 'ko' ? '추가발주' : 'Đặt quá mức'}: {selectedCell.extraLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">{language === 'ko' ? '구역 리스크 상태:' : 'Trạng thái rủi ro vùng:'}</span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedCell.zone === 'critical'
                      ? (language === 'ko' ? '🚨 복합 누적 리스크 구역' : '🚨 Vùng Rủi Ro Kép Tích Lũy')
                      : selectedCell.zone === 'overstock'
                      ? (language === 'ko' ? '📦 재고 과다 및 정체 구역' : '📦 Vùng Nguy Cơ Ứ Đọng Tồn Kho')
                      : selectedCell.zone === 'extra_order'
                      ? (language === 'ko' ? '⚡ 추가/긴급발주 과다 구역' : '⚡ Vùng Phát Sinh Đơn Hàng Cao')
                      : (language === 'ko' ? '✅ 안정적 정상 운영 구역' : '✅ Vùng Vận Hành Ổn Định')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500">{language === 'ko' ? '해당 급식소 수:' : 'Số lượng đơn vị:'}</span>
                  <div className="text-base font-black text-indigo-600">
                    {selectedCell.canteens.length} {language === 'ko' ? '개소' : 'Canteen'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {language === 'ko' ? '해당 셀 내 급식소 목록:' : 'Danh sách Canteen trong ô này:'}
                </h5>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedCell.canteens.map((c) => (
                    <div
                      key={c.canteen}
                      onClick={() => {
                        setSelectedCell(null);
                        setSelectedCanteen(c.canteen);
                      }}
                      className="p-3 hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-2">
                          <span>{c.canteen}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
                            {language === 'ko' ? `점수 ${c.cumulativeRiskScore}` : `Điểm ${c.cumulativeRiskScore}`}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'ko' ? '재고율' : 'Tồn kho'}: <strong className="text-slate-700">{c.inventory_ratio_pct}%</strong> | {language === 'ko' ? '추가발주' : 'Đặt quá mức'}: <strong className="text-slate-700">{c.extra_order_pct}%</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-slate-700 font-semibold">
                          {formatVND(c.ending_inventory_value)} ₫
                        </div>
                        <span className="text-[10px] text-indigo-600 font-medium">{language === 'ko' ? '상세보기 →' : 'Bấm soi chi tiết →'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                {language === 'ko' ? '닫기' : 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CANTEEN DETAIL INSPECTOR */}
      {selectedCanteenDetails && selectedCanteenDetails.summary && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-3">
                <span className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                  <Flame className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {language === 'ko' ? `급식소 운영 리스크 프로필: ${selectedCanteenDetails.summary.canteen}` : `Hồ sơ Rủi ro Vận hành: ${selectedCanteenDetails.summary.canteen}`}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'ko' ? '기말재고, 추가발주 및 PR3 절차 준수율 종합 진단' : 'Đánh giá chi tiết tương quan Tồn kho, Đặt phát sinh & Quy trình PR3'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCanteen(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Status Alert */}
              <div
                className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                  selectedCanteenDetails.summary.riskZone === 'critical'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : selectedCanteenDetails.summary.riskZone === 'overstock'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : selectedCanteenDetails.summary.riskZone === 'extra_order'
                    ? 'bg-orange-50 border-orange-300 text-orange-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-current" />
                <div className="space-y-1">
                  <div className="font-bold text-sm">
                    {language === 'ko' ? `위험 분류: ${selectedCanteenDetails.summary.riskZoneTitle}` : `Phân loại: ${selectedCanteenDetails.summary.riskZoneTitle}`}
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {language === 'ko' ? (
                      selectedCanteenDetails.summary.riskZone === 'critical'
                        ? '재고 과다와 대량 추가발주가 동시 발생하는 심각한 복합 리스크 상태입니다. 메뉴 표준화 및 기존 재고 우선 소진 조치가 시급합니다.'
                        : selectedCanteenDetails.summary.riskZone === 'overstock'
                        ? '재고 보유율이 높으나 추가발주는 통제 범위 내에 있습니다. 신규 발주 전 기존 재고를 조리에 적극 투입하세요.'
                        : selectedCanteenDetails.summary.riskZone === 'extra_order'
                        ? '계획 외 추가발주(PR3) 비율이 비정상적으로 높습니다. 식단 변경 빈도와 식수 변동 원인을 점검하세요.'
                        : '재고율과 추가발주율이 모두 규정 범위 내에서 안정적으로 통제되고 있습니다.'
                    ) : (
                      selectedCanteenDetails.summary.riskZone === 'critical'
                        ? 'Đơn vị đang tích lũy đồng thời 2 yếu tố rủi ro nghiêm trọng: Tồn kho vượt ngưỡng an toàn và liên tục đặt hàng phát sinh PR3. Cần kiểm toán lại định mức thực đơn và giải phóng hàng tồn ngay.'
                        : selectedCanteenDetails.summary.riskZone === 'overstock'
                        ? 'Đơn vị có lượng hàng tồn kho cao nhưng tỷ lệ đặt hàng phát sinh trong tầm kiểm soát. Cần ưu tiên luân chuyển nguyên liệu và xuất kho chế biến trước khi tạo đơn mới.'
                        : selectedCanteenDetails.summary.riskZone === 'extra_order'
                        ? 'Đơn vị có lượng đặt hàng phát sinh PR3 cao bất thường so với thực đơn kế hoạch. Cần kiểm tra nguyên nhân thay đổi thực đơn hoặc thiếu hụt nguyên vật liệu.'
                        : 'Đơn vị duy trì kỷ luật vận hành rất tốt, tỷ lệ tồn kho và tỷ lệ đơn hàng phát sinh đều nằm trong hạn mức cho phép.'
                    )}
                  </p>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium">{language === 'ko' ? '재고 계수' : 'Hệ Số Tồn Kho'}</span>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                    GR: {selectedCanteenDetails.summary.inventory_to_gr_ratio !== undefined ? selectedCanteenDetails.summary.inventory_to_gr_ratio.toFixed(2) : (selectedCanteenDetails.summary.ending_inventory_value / (selectedCanteenDetails.summary.gr_value || 1)).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-indigo-700 font-mono font-medium block">
                    GI: {selectedCanteenDetails.summary.inventory_to_gi_ratio !== undefined ? selectedCanteenDetails.summary.inventory_to_gi_ratio.toFixed(2) : (selectedCanteenDetails.summary.ending_inventory_value / (selectedCanteenDetails.summary.gi_value || 1)).toFixed(2)} ({selectedCanteenDetails.summary.inventory_ratio_pct}%)
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium">{language === 'ko' ? '추가발주 비율' : 'Tỷ lệ Đặt Quá Mức'}</span>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {selectedCanteenDetails.summary.extra_order_pct}%
                  </div>
                  <span className="text-[10px] text-slate-400">{language === 'ko' ? `기준: < ${extraOrderHighThreshold}%` : `Ngưỡng: < ${extraOrderHighThreshold}%`}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium">{language === 'ko' ? '1식당 재고' : 'Tồn Kho / Suất Ăn'}</span>
                  <div className="text-base font-bold text-indigo-700 font-mono mt-0.5">
                    {formatVND(selectedCanteenDetails.summary.inventory_value_per_meal)} ₫
                  </div>
                  <span className="text-[10px] text-slate-400">{language === 'ko' ? '기말 환산' : 'Cuối kỳ'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium">{language === 'ko' ? 'PR3 절차 위반' : 'Vi Phạm PR3 vs Suất'}</span>
                  <div className="text-base font-bold text-rose-600 font-mono mt-0.5">
                    {selectedCanteenDetails.summary.pr3_mismatch_count} {language === 'ko' ? '일' : 'ngày'}
                  </div>
                  <span className="text-[10px] text-slate-400">{language === 'ko' ? '식수 감소 시 PR3 증가' : 'Suất giảm nhưng PR3 tăng'}</span>
                </div>
              </div>

              {/* Financial & Volume Summary */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-xs">
                  {language === 'ko' ? '재무 및 식수 수지 요약:' : 'Cân đối tài chính & sản lượng bếp ăn:'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">{language === 'ko' ? '기말 재고액:' : 'Giá trị tồn kho cuối kỳ:'}</span>
                    <div className="font-mono font-bold text-slate-800">
                      {formatVND(selectedCanteenDetails.summary.ending_inventory_value)} ₫
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">{language === 'ko' ? '총 입고액 (GR):' : 'Tổng nhập kho (GR):'}</span>
                    <div className="font-mono font-bold text-slate-800">
                      {formatVND(selectedCanteenDetails.summary.gr_value)} ₫
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">{language === 'ko' ? '추가발주액 (PR3):' : 'Đơn hàng phát sinh (PR3):'}</span>
                    <div className="font-mono font-bold text-slate-800">
                      {formatVND(selectedCanteenDetails.summary.pr3_value)} ₫
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">{language === 'ko' ? '확정 식수:' : 'Số suất ăn xác nhận:'}</span>
                    <div className="font-mono font-bold text-slate-800">
                      {selectedCanteenDetails.summary.confirmed_meals.toLocaleString('vi-VN')} {language === 'ko' ? '식' : 'suất'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">{language === 'ko' ? '1식당 재료비:' : 'Chi phí NVL / suất ăn:'}</span>
                    <div className="font-mono font-bold text-indigo-700">
                      {formatVND(selectedCanteenDetails.summary.material_cost_per_meal)} ₫
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">{language === 'ko' ? '고위험 일수:' : 'Số ngày rủi ro cao:'}</span>
                    <div className="font-mono font-bold text-rose-600">
                      {selectedCanteenDetails.summary.high_risk_days} / {selectedCanteenDetails.summary.total_days} {language === 'ko' ? '일' : 'ngày'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedCanteen(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {language === 'ko' ? '프로필 닫기' : 'Đóng hồ sơ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
