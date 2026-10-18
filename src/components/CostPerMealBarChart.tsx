import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  LabelList,
} from 'recharts';
import { CanteenSummary, CanteenRecord, RiskThresholds } from '../types/canteen';
import { 
  Utensils, 
  AlertTriangle, 
  Filter, 
  ArrowUpDown,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CostPerMealBarChartProps {
  summary: CanteenSummary[];
  records?: CanteenRecord[];
  thresholds?: RiskThresholds;
}

type SortOption = 'cost_desc' | 'cost_asc' | 'name' | 'risk';

export const CostPerMealBarChart: React.FC<CostPerMealBarChartProps> = ({
  summary,
  records = [],
  thresholds,
}) => {
  const { language } = useLanguage();
  const isKo = language === 'ko';
  const [sortOption, setSortOption] = useState<SortOption>('cost_desc');
  const [filterAnomalyOnly, setFilterAnomalyOnly] = useState<boolean>(false);
  const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
  };

  // Calculate system-wide stats
  const totalMeals = summary.reduce((acc, c) => acc + c.confirmed_meals, 0);
  const totalGi = summary.reduce((acc, c) => acc + c.gi_value, 0);
  
  // Benchmark average: GI / Meals if available, or average of cost_per_meal
  const systemAvgCost = totalMeals > 0 
    ? Math.round(totalGi / totalMeals) 
    : (summary.length > 0 
        ? Math.round(summary.reduce((a, b) => a + b.material_cost_per_meal, 0) / summary.length) 
        : 20000);

  // Warning threshold: custom or default 22,000 VND (or 15% higher than average)
  const warningThreshold = Math.max(22000, Math.round(systemAvgCost * 1.15));

  // Find canteen-level anomaly flags from records (e.g. Z-Score >= 3.5 or high risk)
  const anomalyInfoByCanteen = useMemo(() => {
    const map = new Map<string, { anomalyCount: number; maxZ: number; sampleDate?: string }>();
    for (const r of records) {
      const current = map.get(r.canteen) || { anomalyCount: 0, maxZ: 0 };
      if (r.cost_per_meal_anomaly) {
        current.anomalyCount += 1;
        const z = Math.abs(r.cost_per_meal_robust_z || 0);
        if (z > current.maxZ) {
          current.maxZ = z;
          current.sampleDate = r.date;
        }
      }
      map.set(r.canteen, current);
    }
    return map;
  }, [records]);

  // Enhanced dataset for chart
  const chartData = useMemo(() => {
    let list = summary.map((item) => {
      const anomalyData = anomalyInfoByCanteen.get(item.canteen) || { anomalyCount: 0, maxZ: 0 };
      const diffFromAvg = item.material_cost_per_meal - systemAvgCost;
      const diffPct = systemAvgCost > 0 ? Math.round((diffFromAvg / systemAvgCost) * 1000) / 10 : 0;
      
      const isHigh = item.material_cost_per_meal >= warningThreshold;
      const hasAnomaly = anomalyData.anomalyCount > 0;
      const isAttention = item.material_cost_per_meal > systemAvgCost && !isHigh;

      let statusCategory: 'anomaly' | 'high' | 'attention' | 'optimal' = 'optimal';
      if (hasAnomaly) statusCategory = 'anomaly';
      else if (isHigh) statusCategory = 'high';
      else if (isAttention) statusCategory = 'attention';

      return {
        ...item,
        diffFromAvg,
        diffPct,
        isHigh,
        hasAnomaly,
        anomalyCount: anomalyData.anomalyCount,
        maxZ: anomalyData.maxZ,
        statusCategory,
      };
    });

    if (filterAnomalyOnly) {
      list = list.filter((item) => item.isHigh || item.hasAnomaly || item.statusCategory === 'high');
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortOption === 'cost_desc') {
        return b.material_cost_per_meal - a.material_cost_per_meal;
      }
      if (sortOption === 'cost_asc') {
        return a.material_cost_per_meal - b.material_cost_per_meal;
      }
      if (sortOption === 'risk') {
        return b.avg_risk_score - a.avg_risk_score;
      }
      return a.canteen.localeCompare(b.canteen);
    });
  }, [summary, systemAvgCost, warningThreshold, anomalyInfoByCanteen, filterAnomalyOnly, sortOption]);

  // Statistical extremes
  const maxItem = summary.length > 0
    ? [...summary].sort((a, b) => b.material_cost_per_meal - a.material_cost_per_meal)[0]
    : null;
  const minItem = summary.length > 0
    ? [...summary].sort((a, b) => a.material_cost_per_meal - b.material_cost_per_meal)[0]
    : null;
  const anomalyCountTotal = chartData.filter(d => d.isHigh || d.hasAnomaly).length;

  // Selected item object
  const activeDetail = useMemo(() => {
    if (!selectedCanteen) return null;
    return chartData.find((d) => d.canteen === selectedCanteen) || null;
  }, [selectedCanteen, chartData]);

  // Max value for Y-Axis padding
  const maxCost = Math.max(...summary.map(s => s.material_cost_per_meal), warningThreshold, 25000);
  const yAxisMax = Math.ceil((maxCost * 1.15) / 1000) * 1000;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 max-w-xs z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-2">
            <span className="font-bold text-white text-sm">{data.canteen}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                data.risk_level === 'Cao'
                  ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                  : data.risk_level === 'Trung bình'
                  ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                  : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
              }`}
            >
              {data.risk_level} rủi ro
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400">Chi phí NVL / suất:</span>
              <span className="font-mono font-bold text-base text-amber-300">
                {formatVND(data.material_cost_per_meal)} ₫
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">{isKo ? '전체 시스템 평균 대비:' : 'So với TB toàn hệ thống:'}</span>
              <span
                className={`font-semibold ${
                  data.diffPct > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {data.diffPct > 0 ? `+${data.diffPct}%` : `${data.diffPct}%`} ({data.diffFromAvg > 0 ? '+' : ''}{formatVND(data.diffFromAvg)} ₫)
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">{isKo ? '확정 식수:' : 'Suất ăn xác nhận:'}</span>
              <span className="font-mono text-slate-200">
                {data.confirmed_meals.toLocaleString('vi-VN')} {isKo ? '식' : 'suất'}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">{isKo ? '총 출고액 (GI):' : 'Tổng chi phí xuất kho (GI):'}</span>
              <span className="font-mono text-slate-200">
                {formatVND(data.gi_value)} ₫
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">{isKo ? '1식당 재고:' : 'Tồn kho / suất:'}</span>
              <span className="font-mono text-indigo-300 font-semibold">
                {formatVND(data.inventory_value_per_meal)} ₫
              </span>
            </div>
          </div>

          {/* Anomaly banner if detected */}
          {data.hasAnomaly && (
            <div className="pt-2 border-t border-slate-800 text-[11px] text-rose-300 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{isKo ? `Z-Score 이상치 ${data.anomalyCount}건 감지 (|Z| ≥ 3.5)` : `Phát hiện ${data.anomalyCount} trường hợp dị biệt Z-Score (|Z| ≥ 3.5)`}</span>
            </div>
          )}

          {data.isHigh && !data.hasAnomaly && (
            <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isKo ? `경고 기준 초과 (${formatVND(warningThreshold)} ₫)` : `Vượt ngưỡng cảnh báo (${formatVND(warningThreshold)} ₫)`}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>{isKo ? '급식소별 1식당 식재료비 분포 비교' : 'Phân Phối Chi Phí NVL / Suất Ăn Theo Canteen (Recharts)'}</span>
                {anomalyCountTotal > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    {anomalyCountTotal} {isKo ? '개 급식소 확인 요망' : 'đơn vị cần rà soát'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {isKo ? '급식소별 확정 1식당 평균 출고 식재료비 비교 및 시스템 표준 벤치마크선' : 'Biểu đồ cột so sánh chi phí xuất kho bình quân trên mỗi suất confirm giữa các Canteen, kèm chuẩn định mức hệ thống'}
              </p>
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Filter Toggle */}
          <button
            onClick={() => setFilterAnomalyOnly(!filterAnomalyOnly)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              filterAnomalyOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isKo ? '고비용 / 이상치만 조회' : 'Chỉ xem chi phí cao/bất thường'}</span>
          </button>

          {/* Sort Selector */}
          <div className="inline-flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-0.5">
            <span className="pl-2 pr-1 text-[11px] text-slate-400 flex items-center">
              <ArrowUpDown className="w-3 h-3 mr-1" />
              {isKo ? '정렬:' : 'Sắp xếp:'}
            </span>
            <button
              onClick={() => setSortOption('cost_desc')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                sortOption === 'cost_desc' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={isKo ? '높은 비용순' : 'Chi phí cao nhất xếp trước'}
            >
              {isKo ? '최고비용순' : 'Cao nhất trước'}
            </button>
            <button
              onClick={() => setSortOption('cost_asc')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                sortOption === 'cost_asc' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={isKo ? '낮은 비용순' : 'Chi phí thấp nhất xếp trước'}
            >
              {isKo ? '최저비용순' : 'Thấp nhất trước'}
            </button>
            <button
              onClick={() => setSortOption('name')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                sortOption === 'name' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={isKo ? '이름순 (가나다/A-Z)' : 'Theo tên A-Z'}
            >
              {isKo ? '이름순' : 'Tên A-Z'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 border-b border-slate-200/80 text-xs">
        <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
          <span className="text-slate-500 block mb-0.5 text-[11px]">{isKo ? '시스템 전체 평균:' : 'Định mức TB Hệ Thống:'}</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold font-mono text-indigo-700">{formatVND(systemAvgCost)} ₫</span>
            <span className="text-[10px] text-slate-400">/ {isKo ? '식' : 'suất'}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{isKo ? '비교 기준 벤치마크' : 'Chuẩn tham chiếu đối soát'}</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
          <span className="text-slate-500 block mb-0.5 text-[11px]">{isKo ? '위험 경고 기준선:' : 'Ngưỡng Cảnh Báo Đỏ:'}</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold font-mono text-rose-600">&gt; {formatVND(warningThreshold)} ₫</span>
            <span className="text-[10px] text-slate-400">/ {isKo ? '식' : 'suất'}</span>
          </div>
          <p className="text-[10px] text-rose-600 font-medium mt-0.5">{isKo ? '평균 대비 +15% 초과' : '+15% so với trung bình'}</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
          <span className="text-slate-500 block mb-0.5 text-[11px]">{isKo ? '최고 비용 급식소:' : 'Đơn Vị Chi Phí Cao Nhất:'}</span>
          <div className="truncate font-semibold text-slate-800 text-xs" title={maxItem?.canteen}>
            {maxItem ? maxItem.canteen : 'N/A'}
          </div>
          <div className="text-sm font-bold font-mono text-rose-600">
            {maxItem ? `${formatVND(maxItem.material_cost_per_meal)} ₫` : '0 ₫'}
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
          <span className="text-slate-500 block mb-0.5 text-[11px]">{isKo ? '최저 비용 급식소:' : 'Đơn Vị Tiết Kiệm Nhất:'}</span>
          <div className="truncate font-semibold text-slate-800 text-xs" title={minItem?.canteen}>
            {minItem ? minItem.canteen : 'N/A'}
          </div>
          <div className="text-sm font-bold font-mono text-emerald-600">
            {minItem ? `${formatVND(minItem.material_cost_per_meal)} ₫` : '0 ₫'}
          </div>
        </div>
      </div>

      {/* Main Recharts Section */}
      <div className="p-4 sm:p-5">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 25, right: 30, left: 10, bottom: 25 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  const clickedName = state.activePayload[0].payload.canteen;
                  setSelectedCanteen(selectedCanteen === clickedName ? null : clickedName);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="canteen"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval={0}
                angle={chartData.length > 6 ? -25 : 0}
                textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                height={chartData.length > 6 ? 50 : 30}
              />
              <YAxis
                domain={[0, yAxisMax]}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />

              {/* Reference Lines */}
              <ReferenceLine
                y={systemAvgCost}
                stroke="#6366f1"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `TB Hệ Thống: ${formatVND(systemAvgCost)} ₫`,
                  fill: '#4f46e5',
                  position: 'insideTopLeft',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <ReferenceLine
                y={warningThreshold}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Ngưỡng Cảnh Báo: ${formatVND(warningThreshold)} ₫`,
                  fill: '#e11d48',
                  position: 'insideTopRight',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />

              {/* Bar with Dynamic Color Fill */}
              <Bar
                dataKey="material_cost_per_meal"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
                className="cursor-pointer transition-all duration-200"
              >
                <LabelList
                  dataKey="material_cost_per_meal"
                  position="top"
                  formatter={(val: any) => `${Math.round(Number(val) / 1000)}k`}
                  fill="#475569"
                  fontSize={10}
                  fontWeight={600}
                />
                {chartData.map((entry) => {
                  const isSelected = selectedCanteen === entry.canteen;
                  let fill = '#3b82f6'; // default blue

                  if (entry.hasAnomaly || entry.isHigh) {
                    fill = '#f43f5e'; // rose-500: Anomaly / high risk
                  } else if (entry.material_cost_per_meal > systemAvgCost) {
                    fill = '#f59e0b'; // amber-500: Attention
                  } else {
                    fill = '#10b981'; // emerald-500: Optimal
                  }

                  return (
                    <Cell
                      key={`cell-${entry.canteen}`}
                      fill={fill}
                      opacity={selectedCanteen && !isSelected ? 0.45 : 1}
                      stroke={isSelected ? '#1e293b' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Guide Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
              <span className="text-slate-600 font-medium">Tối ưu (&le; {formatVND(systemAvgCost)} ₫)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
              <span className="text-slate-600 font-medium">Trên TB ({formatVND(systemAvgCost)} - {formatVND(warningThreshold)} ₫)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
              <span className="text-slate-600 font-bold text-rose-700">Bất thường / Vượt ngưỡng (&gt; {formatVND(warningThreshold)} ₫)</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Nhấp vào từng cột để xem phân tích chi tiết của Canteen đó</span>
          </div>
        </div>

        {/* Detail Panel for Selected Canteen */}
        {activeDetail && (
          <div className="mt-4 p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 animate-fade-in text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{activeDetail.canteen}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeDetail.risk_level === 'Cao'
                      ? 'bg-rose-100 text-rose-800'
                      : activeDetail.risk_level === 'Trung bình'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isKo ? '위험 수준:' : 'Mức rủi ro:'}{' '}
                  {isKo
                    ? activeDetail.risk_level === 'Cao'
                      ? '고위험'
                      : activeDetail.risk_level === 'Trung bình'
                      ? '중위험'
                      : '저위험'
                    : activeDetail.risk_level}{' '}
                  ({activeDetail.avg_risk_score} {isKo ? '점' : 'điểm'})
                </span>
                {activeDetail.hasAnomaly && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                    {isKo ? '⚠️ Z-점수 이상치' : '⚠️ Dị biệt Z-Score'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedCanteen(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
              >
                {isKo ? '✕ 닫기' : '✕ Đóng'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-indigo-100">
              <div>
                <span className="text-slate-500 block">{isKo ? '식수당 식자재비:' : 'Chi phí NVL / Suất:'}</span>
                <span className="font-mono font-bold text-sm text-indigo-900">
                  {formatVND(activeDetail.material_cost_per_meal)} ₫
                </span>
                <span className={`block text-[10px] font-medium ${activeDetail.diffPct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {activeDetail.diffPct > 0 ? `+${activeDetail.diffPct}%` : `${activeDetail.diffPct}%`} {isKo ? '평균 대비' : 'vs mức TB'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{isKo ? '식수당 재고금액:' : 'Tồn kho / Suất ăn:'}</span>
                <span className={`font-mono font-bold text-sm ${activeDetail.inventory_value_per_meal > 15000 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatVND(activeDetail.inventory_value_per_meal)} ₫
                </span>
                <span className="text-[10px] text-slate-400 block">{isKo ? '안전 기준: 15,000 ₫' : 'Định mức an toàn: 15.000 ₫'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isKo ? '총 확정 식수:' : 'Tổng Suất Confirm:'}</span>
                <span className="font-mono font-bold text-sm text-slate-800">
                  {activeDetail.confirmed_meals.toLocaleString(isKo ? 'ko-KR' : 'vi-VN')}
                </span>
                <span className="text-[10px] text-slate-400 block">{isKo ? '제공된 총 식수' : 'suất đã phục vụ'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isKo ? 'PR3 프로세스 위반:' : 'Vi phạm QT PR3:'}</span>
                <span className={`font-mono font-bold text-sm ${activeDetail.pr3_mismatch_count > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {activeDetail.pr3_mismatch_count} {isKo ? '건' : 'Trường hợp'}
                </span>
                <span className="text-[10px] text-slate-400 block">{isKo ? '식수 감소에도 PR3 증가' : 'Suất giảm nhưng PR3 tăng'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
