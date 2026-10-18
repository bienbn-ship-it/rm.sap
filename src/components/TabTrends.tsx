import React, { useState } from 'react';
import { CanteenRecord } from '../types/canteen';
import { 
  LineChart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Calendar, 
  Sparkles,
  Info,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TabTrendsProps {
  records: CanteenRecord[];
  allCanteens: string[];
}

export const TabTrends: React.FC<TabTrendsProps> = ({ records, allCanteens }) => {
  const { language, t } = useLanguage();
  const [selectedCanteen, setSelectedCanteen] = useState<string>(allCanteens[0] || '');
  const isKo = language === 'ko';

  // Filter and sort for selected canteen
  const cRecords = records
    .filter((r) => r.canteen === selectedCanteen)
    .sort((a, b) => a.date.localeCompare(b.date));

  const anomalies = cRecords.filter((r) => r.cost_per_meal_anomaly);
  const pr3Mismatches = cRecords.filter((r) => r.pr3_meal_mismatch);

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
  };

  // Helper for SVG line chart calculations
  const renderLineChart = (
    data: CanteenRecord[],
    series: { key: keyof CanteenRecord; label: string; color: string; isAnomalyMarked?: boolean; isPr3MismatchMarked?: boolean }[],
    yFormatter: (v: number) => string
  ) => {
    if (data.length === 0) {
      return (
        <div className="h-56 flex items-center justify-center text-xs text-slate-400">
          {isKo ? '선택한 급식소의 시계열 데이터가 없습니다.' : 'Không có dữ liệu chuỗi thời gian cho canteen này.'}
        </div>
      );
    }

    const width = 800;
    const height = 220;
    const padding = { top: 20, right: 30, bottom: 35, left: 65 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Get Min and Max
    let allValues: number[] = [];
    series.forEach((s) => {
      data.forEach((d) => {
        const v = d[s.key];
        if (typeof v === 'number') allValues.push(v);
      });
    });

    const minVal = Math.min(...allValues, 0);
    const maxVal = Math.max(...allValues, 100);
    const valRange = maxVal - minVal || 1;

    const getX = (index: number) => {
      if (data.length <= 1) return padding.left + chartWidth / 2;
      return padding.left + (index / (data.length - 1)) * chartWidth;
    };

    const getY = (val: number) => {
      return padding.top + chartHeight - ((val - minVal) / valRange) * chartHeight;
    };

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px] select-none">
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + chartHeight * (1 - pct);
            const val = minVal + valRange * pct;
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="sans-serif"
                >
                  {yFormatter(val)}
                </text>
              </g>
            );
          })}

          {/* Series Lines */}
          {series.map((s) => {
            const points = data
              .map((d, idx) => {
                const val = typeof d[s.key] === 'number' ? (d[s.key] as number) : 0;
                return `${getX(idx)},${getY(val)}`;
              })
              .join(' ');

            return (
              <g key={s.key}>
                <polyline
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
                {/* Data Points */}
                {data.map((d, idx) => {
                  const val = typeof d[s.key] === 'number' ? (d[s.key] as number) : 0;
                  const x = getX(idx);
                  const y = getY(val);
                  const isAnomaly = s.isAnomalyMarked && d.cost_per_meal_anomaly;
                  const isMismatch = s.isPr3MismatchMarked && d.pr3_meal_mismatch;

                  return (
                    <g key={idx} className="group cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r={isAnomaly || isMismatch ? 6 : 3}
                        fill={isAnomaly ? '#f43f5e' : isMismatch ? '#e11d48' : s.color}
                        stroke="#ffffff"
                        strokeWidth={isAnomaly || isMismatch ? 2 : 1.5}
                      />
                      {(isAnomaly || isMismatch) && (
                        <circle
                          cx={x}
                          cy={y}
                          r={10}
                          fill="none"
                          stroke={isAnomaly ? '#f43f5e' : '#e11d48'}
                          strokeWidth="1.5"
                          opacity="0.6"
                          className="animate-ping"
                        />
                      )}
                      {/* Tooltip on hover */}
                      <title>{`${d.date}: ${yFormatter(val)}${isAnomaly ? ' [BẤT THƯỜNG Z=' + d.cost_per_meal_robust_z + ']' : ''}${isMismatch ? ' [VI PHẠM QT: ' + (d.pr3_meal_mismatch_desc || 'Suất giảm nhưng PR3 tăng') + ']' : ''}`}</title>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* X Axis Labels */}
          {data.map((d, idx) => {
            // Show every 2nd or 3rd label if many points
            if (data.length > 10 && idx % Math.ceil(data.length / 8) !== 0 && idx !== data.length - 1) {
              return null;
            }
            const x = getX(idx);
            const shortDate = d.date.slice(5); // MM-DD
            return (
              <text
                key={idx}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                fontFamily="sans-serif"
              >
                {shortDate}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Canteen Selector bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t.trendsTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {t.trendsSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            {isKo ? '급식소 선택:' : 'Chọn Canteen:'}
          </label>
          <select
            value={selectedCanteen}
            onChange={(e) => setSelectedCanteen(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            {allCanteens.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Anomaly Notification Banner */}
      {anomalies.length > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 text-amber-900 shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                {isKo 
                  ? `경고: 1식당 식재료비 이상치(Anomaly) ${anomalies.length}건 감지!` 
                  : `Cảnh báo: Phát hiện ${anomalies.length} điểm bất thường chi phí NVL / suất ăn!`}
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                {isKo
                  ? 'Robust Z-score 통계 기준(14일 롤링 중앙값 및 MAD 편차 적용), 아래 일자의 식재료비가 일반적 범위를 벗어나 급변했습니다 (> 3.5 표준편차).'
                  : 'Theo quy tắc thống kê Robust Z-score (áp dụng trung vị Rolling 14 kỳ và MAD), các ngày dưới đây có mức chi phí nguyên liệu lệch đột biến so với thông lệ (> 3.5 độ lệch chuẩn).'}
              </p>

              {/* Table of anomalies */}
              <div className="mt-3 overflow-x-auto bg-white rounded-lg border border-amber-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-amber-100/60 text-amber-900 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">{isKo ? '일자' : 'Ngày'}</th>
                      <th className="px-3 py-2 text-right">{isKo ? '1식당 재료비' : 'Chi phí NVL / Suất'}</th>
                      <th className="px-3 py-2 text-center">Robust Z-Score</th>
                      <th className="px-3 py-2 text-center">{isKo ? '리스크 등급' : 'Mức rủi ro'}</th>
                      <th className="px-3 py-2">{isKo ? '탐지 사유' : 'Lý do nhận diện'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {anomalies.map((a) => (
                      <tr key={a.id} className="hover:bg-amber-50/60">
                        <td className="px-3 py-2 font-semibold text-slate-800">{a.date}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-rose-600">
                          {formatVND(a.material_cost_per_meal)} ₫
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-amber-800">
                          {a.cost_per_meal_robust_z}σ
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            {isKo 
                              ? (a.risk_level === 'Cao' ? '경고(높음)' : a.risk_level === 'Trung bình' ? '주의(보통)' : '안심(낮음)') 
                              : a.risk_level}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{a.risk_reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-medium">
            {isKo 
              ? '선택된 급식소에서 과거 기준(Z ≥ 3.5) 식재료비 이상 급변이 감지되지 않았습니다.' 
              : 'Chưa phát hiện điểm bất thường mạnh về chi phí NVL/suất theo rule lịch sử (Z ≥ 3.5) tại canteen này.'}
          </p>
        </div>
      )}

      {/* PR3 Process Compliance Alert Banner */}
      {pr3Mismatches.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 text-rose-950 shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-900 flex items-center space-x-2">
                <span>
                  {isKo 
                    ? `발주 절차 위반 경고: 식수 감소에도 PR3 추가발주가 증가한 날 ${pr3Mismatches.length}일 감지!` 
                    : `Cảnh báo Vi Phạm Quy Trình Đặt Hàng: ${pr3Mismatches.length} ngày phát hiện Suất Ăn Giảm nhưng PR3 Tăng!`}
                </span>
              </h4>
              <p className="text-xs text-rose-800 mt-1">
                {isKo 
                  ? '표준 공급망 관리 프로세스에 따라, 식수가 감소할 때는 추가발주(PR3)도 감소해야 합니다. 아래 일자는 식수가 감소했음에도 PR3 발주가 증가했습니다:'
                  : 'Theo quy trình cung ứng chuẩn, khi nhu cầu suất ăn sụt giảm thì đơn mua phát sinh (PR3) bắt buộc phải giảm tương ứng. Các ngày dưới đây vi phạm quy trình khi suất ăn giảm nhưng đơn PR3 lại tăng:'}
              </p>

              <div className="mt-3 overflow-x-auto bg-white rounded-lg border border-rose-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-rose-100/60 text-rose-900 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">{isKo ? '일자' : 'Ngày'}</th>
                      <th className="px-3 py-2 text-right">{isKo ? '실적 식수' : 'Suất Confirm'}</th>
                      <th className="px-3 py-2 text-center">{isKo ? '식수 변동률' : 'Biến Thiên Suất'}</th>
                      <th className="px-3 py-2 text-right">{isKo ? 'PR3 발주액' : 'Đơn Hàng PR3'}</th>
                      <th className="px-3 py-2 text-center">{isKo ? 'PR3 변동률' : 'Biến Thiên PR3'}</th>
                      <th className="px-3 py-2 text-right">{isKo ? '1식당 재고액' : 'Tồn Kho / Suất'}</th>
                      <th className="px-3 py-2">{isKo ? '경고 상세' : 'Chi Tiết Cảnh Báo'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 text-slate-700">
                    {pr3Mismatches.map((m) => (
                      <tr key={m.id} className="hover:bg-rose-50/40">
                        <td className="px-3 py-2 font-semibold text-slate-900">{m.date}</td>
                        <td className="px-3 py-2 text-right font-mono">{m.confirmed_meals.toLocaleString('vi-VN')} {isKo ? '식' : 'suất'}</td>
                        <td className="px-3 py-2 text-center font-bold text-rose-600">
                          {m.meal_delta_pct !== undefined ? (m.meal_delta_pct > 0 ? `+${m.meal_delta_pct}%` : `${m.meal_delta_pct}%`) : `${m.meal_gap_pct}% vs KH`}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-rose-700">{formatVND(m.pr3_value)} ₫</td>
                        <td className="px-3 py-2 text-center font-bold text-amber-700">
                          {m.pr3_delta_pct !== undefined && m.pr3_delta_pct > 0 ? `+${m.pr3_delta_pct}%` : `${m.extra_order_pct}%`}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-indigo-900 bg-indigo-50/30">
                          {formatVND(m.inventory_value_per_meal)} ₫
                        </td>
                        <td className="px-3 py-2 text-rose-800 text-[11px] font-medium">
                          {m.pr3_meal_mismatch_desc || (isKo ? '식수 감소에도 PR3 발주가 비정상 증가함' : 'Suất ăn giảm nhưng đơn phát sinh PR3 lại tăng bất thường')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Chart 1: Confirmed Meals vs Planned Meals */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>{isKo ? '계획 식수 vs 고객 확정(Confirm) 식수' : 'Suất ăn Kế hoạch vs Khách hàng Confirm'}</span>
              </h4>
              <p className="text-xs text-slate-500">
                {isKo ? '준비 식수와 실제 고객 이용 식수 간의 편차 추이' : 'Độ chênh lệch giữa số lượng suất cơm chuẩn bị và số lượng khách thực tế sử dụng'}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center text-blue-600">
                <span className="w-3 h-1 bg-blue-600 rounded-full mr-1.5"></span> {isKo ? '실적 식수' : 'Suất Confirm'}
              </span>
              <span className="flex items-center text-slate-400">
                <span className="w-3 h-1 bg-slate-400 rounded-full mr-1.5"></span> {isKo ? '계획 식수' : 'Suất Kế hoạch'}
              </span>
            </div>
          </div>

          {renderLineChart(
            cRecords,
            [
              { key: 'confirmed_meals', label: isKo ? '실적 식수' : 'Suất Confirm', color: '#2563eb' },
              { key: 'planned_meals', label: isKo ? '계획 식수' : 'Suất Kế hoạch', color: '#94a3b8' },
            ],
            (v) => Math.round(v).toLocaleString('vi-VN')
          )}
        </div>

        {/* Chart 2: GR Value vs Revenue */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>{isKo ? '입고액 (GR) vs 매출액' : 'Nhập kho GR vs Doanh thu'}</span>
              </h4>
              <p className="text-xs text-slate-500">
                {isKo ? '일자별 식재료 입고 금액과 매출 흐름 추이 비교' : 'Theo dõi biến thiên giá trị nhập hàng (Goods Receipt) so với dòng doanh thu theo từng ngày'}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center text-indigo-600">
                <span className="w-3 h-1 bg-indigo-600 rounded-full mr-1.5"></span> {isKo ? 'GR 입고액' : 'GR Nhập kho'}
              </span>
              <span className="flex items-center text-emerald-600">
                <span className="w-3 h-1 bg-emerald-600 rounded-full mr-1.5"></span> {isKo ? '매출액' : 'Doanh thu'}
              </span>
            </div>
          </div>

          {renderLineChart(
            cRecords,
            [
              { key: 'gr_value', label: isKo ? 'GR 입고액' : 'GR Nhập kho', color: '#6366f1' },
              { key: 'revenue', label: isKo ? '매출액' : 'Doanh thu', color: '#10b981' },
            ],
            (v) => (v / 1000000).toFixed(1) + 'M'
          )}
        </div>

        {/* Chart 3: Material Cost Per Meal with Anomaly Dots */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{isKo ? '1식당 식재료비 추이 (이상치 탐지 표기)' : 'Chi phí Nguyên Vật Liệu / Suất Ăn (với Điểm Bất Thường)'}</span>
              </h4>
              <p className="text-xs text-slate-500">
                {isKo ? '붉은색 발광 표시는 비정상적 원가 급변 일자를 나타냅니다 (Robust Z-Score ≥ 3.5)' : 'Chấm đỏ phát sáng thể hiện ngày xảy ra biến động chi phí bất thường (Robust Z-Score ≥ 3.5)'}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center text-purple-600">
                <span className="w-3 h-1 bg-purple-600 rounded-full mr-1.5"></span> {isKo ? '1식당 재료비' : 'Chi phí NVL/suất'}
              </span>
              <span className="flex items-center text-rose-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></span> {isKo ? '이상치 (Anomaly)' : 'Điểm Dị Biệt (Anomaly)'}
              </span>
            </div>
          </div>

          {renderLineChart(
            cRecords,
            [
              { key: 'material_cost_per_meal', label: isKo ? '1식당 재료비' : 'CP NVL/Suất', color: '#9333ea', isAnomalyMarked: true },
            ],
            (v) => Math.round(v).toLocaleString('vi-VN') + ' ₫'
          )}
        </div>

        {/* Chart 4: Giám Sát Quy Trình: Đơn hàng phát sinh PR3 */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{isKo ? '발주 절차 모니터링: PR3 추가발주 (식수 감소 시 경고)' : 'Giám Sát Quy Trình: Đơn Hàng Phát Sinh PR3 (Cảnh Báo Khi Suất Giảm)'}</span>
              </h4>
              <p className="text-xs text-slate-500">
                {isKo ? '붉은 점멸 표시는 식수가 줄었음에도 PR3 발주가 증가한 절차 위반 일자를 나타냅니다' : 'Chấm đỏ nhấp nháy đánh dấu các ngày xảy ra vi phạm quy trình: Suất ăn giảm nhưng đơn phát sinh PR3 lại tăng'}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center text-amber-600">
                <span className="w-3 h-1 bg-amber-600 rounded-full mr-1.5"></span> {isKo ? 'PR3 발주액 (VNĐ)' : 'Giá trị PR3 (VNĐ)'}
              </span>
              <span className="flex items-center text-rose-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-1.5"></span> {isKo ? '발주 절차 위반' : 'Vi phạm quy trình đặt hàng'}
              </span>
            </div>
          </div>

          {renderLineChart(
            cRecords,
            [
              { key: 'pr3_value', label: isKo ? 'PR3 발주' : 'Đơn PR3', color: '#d97706', isPr3MismatchMarked: true },
            ],
            (v) => (v / 1000000).toFixed(1) + 'M'
          )}
        </div>

        {/* Chart 5: Số Tiền Tồn Kho Trên Mỗi Suất Ăn */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>{isKo ? '1식당 재고 보유액 추이 (VNĐ / 식)' : 'Số Tiền Tồn Kho Trên Mỗi Suất Ăn (VNĐ / Suất)'}</span>
              </h4>
              <p className="text-xs text-slate-500">
                {isKo ? '확정 식수 1식당 환산된 기말 재고액의 체류 수준을 추적' : 'Theo dõi mức độ ứ đọng giá trị tồn kho quy đổi trên từng suất ăn khách hàng confirm theo ngày'}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center text-indigo-600">
                <span className="w-3 h-1 bg-indigo-600 rounded-full mr-1.5"></span> {isKo ? '1식당 재고' : 'Tồn kho / Suất'}
              </span>
              <span className="text-slate-400 font-normal">
                {isKo ? '공식 = 기말재고액 / 실적식수' : 'Công thức = Tồn kho cuối kỳ / Suất confirm'}
              </span>
            </div>
          </div>

          {renderLineChart(
            cRecords,
            [
              { key: 'inventory_value_per_meal', label: isKo ? '1식당 재고' : 'Tồn kho/Suất', color: '#4f46e5' },
            ],
            (v) => formatVND(v) + ' ₫'
          )}
        </div>

        {/* Chart 6: Hệ số Tồn kho / GR & Tồn kho / GI */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>{isKo ? '재고 계수 추이: 재고/GR 및 재고/GI' : 'Hệ Số Tồn Kho: Tồn kho / GR & Tồn kho / GI'}</span>
              </h4>
              <p className="text-xs text-slate-500">
                {isKo ? '총 입고액 대비 기말재고(재고/GR) 및 조리 출고액 대비 기말재고(재고/GI) 완충 계수 모니터링' : 'Theo dõi hệ số đệm tồn kho so với giá trị nhập kho (Tồn cuối / GR) và giá trị xuất kho chế biến (Tồn cuối / GI) theo từng ngày'}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center text-teal-600">
                <span className="w-3 h-1 bg-teal-600 rounded-full mr-1.5"></span> {isKo ? '재고 / GR 계수' : 'Hệ số Tồn / GR'}
              </span>
              <span className="flex items-center text-indigo-600">
                <span className="w-3 h-1 bg-indigo-600 rounded-full mr-1.5"></span> {isKo ? '재고 / GI 계수' : 'Hệ số Tồn / GI'}
              </span>
            </div>
          </div>

          {renderLineChart(
            cRecords,
            [
              { key: 'inventory_to_gr_ratio', label: isKo ? '재고/GR' : 'Tồn/GR', color: '#0d9488' },
              { key: 'inventory_to_gi_ratio', label: isKo ? '재고/GI' : 'Tồn/GI', color: '#6366f1' },
            ],
            (v) => Number(v).toFixed(2)
          )}
        </div>
      </div>
    </div>
  );
};
