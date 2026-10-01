import React, { useState } from 'react';
import { CanteenRecord, RiskThresholds } from '../types/canteen';
import { 
  ShieldAlert, 
  Clock, 
  AlertOctagon, 
  AlertTriangle, 
  ArrowUpDown, 
  Tag, 
  Calendar,
  Filter
} from 'lucide-react';

interface TabRiskMatrixProps {
  records: CanteenRecord[];
  thresholds: RiskThresholds;
}

export const TabRiskMatrix: React.FC<TabRiskMatrixProps> = ({ records, thresholds }) => {
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'PR3_MISMATCH' | 'INV_HIGH' | 'HIGH_RISK' | 'COST_ANOMALY'>('ALL');

  // Sorted by risk score descending
  const sortedRisks = [...records].sort((a, b) => {
    if (b.risk_score !== a.risk_score) {
      return b.risk_score - a.risk_score;
    }
    return b.date.localeCompare(a.date);
  });

  // Near or expired items
  const expiryItems = records
    .filter((r) => r.days_to_expiry !== undefined && r.days_to_expiry <= thresholds.expiry_warning_days)
    .sort((a, b) => (a.days_to_expiry ?? 999) - (b.days_to_expiry ?? 999));

  // Extract all distinct reasons for filtering
  const allReasons = Array.from(
    new Set(
      records
        .flatMap((r) => r.risk_reason.split('; '))
        .filter((r) => r && r.trim().length > 0)
    )
  );

  const pr3MismatchTotal = records.filter(r => r.pr3_meal_mismatch).length;
  const invHighTotal = records.filter(r => r.inventory_value_per_meal > (thresholds.inventory_per_meal_high || 15000)).length;
  const highRiskTotal = records.filter(r => r.risk_level === 'Cao').length;
  const costAnomalyTotal = records.filter(r => r.cost_per_meal_anomaly).length;

  const filteredRisks = sortedRisks.filter((r) => {
    // Quick filter check
    if (quickFilter === 'PR3_MISMATCH' && !r.pr3_meal_mismatch) return false;
    if (quickFilter === 'INV_HIGH' && r.inventory_value_per_meal <= (thresholds.inventory_per_meal_high || 15000)) return false;
    if (quickFilter === 'HIGH_RISK' && r.risk_level !== 'Cao') return false;
    if (quickFilter === 'COST_ANOMALY' && !r.cost_per_meal_anomaly) return false;

    // Reason dropdown check
    if (reasonFilter !== 'ALL' && !r.risk_reason.includes(reasonFilter)) return false;

    return true;
  });

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
  };

  const avgInvPerMeal = records.length > 0
    ? Math.round(records.reduce((acc, r) => acc + r.inventory_value_per_meal, 0) / records.length)
    : 0;
  const maxInvPerMeal = records.length > 0
    ? Math.max(...records.map(r => r.inventory_value_per_meal))
    : 0;

  return (
    <div className="space-y-6">
      {/* 0. Quick Stat Cards for Process & Inventory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setQuickFilter(quickFilter === 'PR3_MISMATCH' ? 'ALL' : 'PR3_MISMATCH')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            quickFilter === 'PR3_MISMATCH'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300'
              : 'bg-white border-slate-200/90 hover:border-rose-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-rose-700">Vi Phạm Quy Trình PR3</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono">
            {pr3MismatchTotal} <span className="text-xs font-normal text-slate-500">ca ghi nhận</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Suất ăn giảm nhưng đơn PR3 lại tăng
          </p>
        </div>

        <div 
          onClick={() => setQuickFilter(quickFilter === 'INV_HIGH' ? 'ALL' : 'INV_HIGH')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            quickFilter === 'INV_HIGH'
              ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300'
              : 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-700">Tồn Kho / Suất Ăn Cao</span>
            <Tag className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-900 font-mono">
            {invHighTotal} <span className="text-xs font-normal text-slate-500">ca vượt ngưỡng</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            TB: <strong className="text-indigo-900">{formatVND(avgInvPerMeal)} ₫</strong> • Max: <strong className="text-rose-600">{formatVND(maxInvPerMeal)} ₫</strong>
          </p>
        </div>

        <div 
          onClick={() => setQuickFilter(quickFilter === 'HIGH_RISK' ? 'ALL' : 'HIGH_RISK')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            quickFilter === 'HIGH_RISK'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300'
              : 'bg-white border-slate-200/90 hover:border-rose-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-rose-700">Dòng Rủi Ro Cao</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono">
            {highRiskTotal} <span className="text-xs font-normal text-slate-500">ca (Điểm ≥ 60)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cần rà soát và kiểm toán nghiệp vụ ngay
          </p>
        </div>

        <div 
          onClick={() => setQuickFilter(quickFilter === 'COST_ANOMALY' ? 'ALL' : 'COST_ANOMALY')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            quickFilter === 'COST_ANOMALY'
              ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300'
              : 'bg-white border-slate-200/90 hover:border-purple-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-purple-700">Dị Biệt Chi Phí / Suất</span>
            <AlertOctagon className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 font-mono">
            {costAnomalyTotal} <span className="text-xs font-normal text-slate-500">ca (|Z| ≥ 3.5)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Biến động chi phí bất thường so với 14 ngày
          </p>
        </div>
      </div>
      {/* 1. Expiry Alert Section (If any) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nguyên Liệu Cận Hạn & Đã Hết Hạn
              </h3>
              <p className="text-xs text-slate-500">
                Cảnh báo các lô hàng có hạn sử dụng còn lại &le; {thresholds.expiry_warning_days} ngày hoặc đã quá hạn
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              {expiryItems.filter(i => (i.days_to_expiry ?? 0) < 0).length} Lô đã hết hạn
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {expiryItems.filter(i => (i.days_to_expiry ?? 0) >= 0).length} Lô cận hạn
            </span>
          </div>
        </div>

        {expiryItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3">Ngày ghi nhận</th>
                  <th className="px-3 py-3">Canteen</th>
                  <th className="px-3 py-3">Tên Nguyên Liệu</th>
                  <th className="px-3 py-3">Hạn Sử Dụng (HSD)</th>
                  <th className="px-3 py-3 text-center">Số Ngày Còn Lại</th>
                  <th className="px-3 py-3 text-center">Trạng Thái</th>
                  <th className="px-3 py-3 text-right">SL Tồn Kho</th>
                  <th className="px-3 py-3 text-center">Mức Rủi Ro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {expiryItems.map((item, idx) => {
                  const days = item.days_to_expiry ?? 0;
                  const isExpired = days < 0;
                  const isUrgent = days >= 0 && days <= 7;

                  return (
                    <tr 
                      key={`${item.id}_exp_${idx}`}
                      className={`hover:bg-slate-50 transition-colors ${
                        isExpired ? 'bg-rose-50/40' : isUrgent ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {item.canteen}
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-900">
                        {item.ingredient || 'Nguyên liệu chưa định danh'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-mono text-slate-600">
                        {item.expiry_date}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span className={`font-mono font-bold text-sm ${
                          isExpired ? 'text-rose-600' : isUrgent ? 'text-amber-600' : 'text-slate-800'
                        }`}>
                          {days < 0 ? `Quá ${Math.abs(days)} ngày` : `${days} ngày`}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isExpired
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isUrgent
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {isExpired ? 'ĐÃ HẾT HẠN' : isUrgent ? 'KHẨN CẤP < 7 NGÀY' : 'CẬN HẠN'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap font-mono">
                        {item.inventory_qty?.toLocaleString('vi-VN') || 0} kg/đv
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            item.risk_level === 'Cao'
                              ? 'bg-rose-100 text-rose-800'
                              : item.risk_level === 'Trung bình'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.risk_level}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Không có nguyên liệu nào cận hạn hoặc quá hạn trong khoảng thời gian đang xét.
          </div>
        )}
      </div>

      {/* 2. Full Risk Prioritized Registry */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bảng Xếp Hạng Nhật Ký Rủi Ro Vận Hành
              </h3>
              <p className="text-xs text-slate-500">
                Sắp xếp theo thứ tự điểm rủi ro từ cao nhất xuống thấp nhất (Thang điểm 0 - 100)
              </p>
            </div>
          </div>

          {/* Filter by reason tag */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Lọc theo Lý do cảnh báo (Tất cả)</option>
              {allReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-3 py-3">Canteen</th>
                <th className="px-3 py-3 text-center">Điểm Rủi Ro</th>
                <th className="px-3 py-3 text-center">Phân Loại</th>
                <th className="px-4 py-3">Lý Do Cảnh Báo Vi Phạm</th>
                <th className="px-3 py-3 text-center bg-rose-50/60 text-rose-900">Quy Trình PR3</th>
                <th className="px-3 py-3 text-right bg-indigo-50/60 text-indigo-950 font-bold">Tồn Kho / Suất</th>
                <th className="px-3 py-3 text-right">% GR vs Kế Hoạch</th>
                <th className="px-3 py-3 text-right">% PR3 Đặt Thêm</th>
                <th className="px-3 py-3 text-right">Tồn kho / GR</th>
                <th className="px-3 py-3 text-right">CP NVL / Suất</th>
                <th className="px-3 py-3 text-right">Lệch Suất (%)</th>
                <th className="px-3 py-3 text-right">GR / Doanh Thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRisks.map((r) => {
                const reasons = r.risk_reason ? r.risk_reason.split('; ') : [];

                return (
                  <tr 
                    key={r.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      r.risk_score >= 60 ? 'bg-rose-50/20' : r.risk_score >= 30 ? 'bg-amber-50/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {r.canteen}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-full text-xs ${
                        r.risk_score >= 60 
                          ? 'bg-rose-100 text-rose-800 font-mono'
                          : r.risk_score >= 30
                          ? 'bg-amber-100 text-amber-800 font-mono'
                          : 'bg-emerald-100 text-emerald-800 font-mono'
                      }`}>
                        {r.risk_score} / 100
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          r.risk_level === 'Cao'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : r.risk_level === 'Trung bình'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {r.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {reasons.length > 0 ? (
                          reasons.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Vận hành bình thường trong ngưỡng</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      {r.pr3_meal_mismatch ? (
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                          title={r.pr3_meal_mismatch_desc || 'Suất ăn giảm nhưng PR3 tăng'}
                        >
                          ⚠️ Vi phạm QT
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Chuẩn</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono font-bold bg-indigo-50/20">
                      <span className={r.inventory_value_per_meal > (thresholds.inventory_per_meal_high || 15000) ? 'text-rose-600 font-bold' : 'text-indigo-900'}>
                        {formatVND(r.inventory_value_per_meal)} ₫
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono">
                      <span className={r.gr_vs_plan_pct > thresholds.gr_over_plan_high ? 'text-rose-600 font-bold' : ''}>
                        {r.gr_vs_plan_pct > 0 ? '+' : ''}{r.gr_vs_plan_pct}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono">
                      <span className={r.extra_order_pct > thresholds.pr3_high ? 'text-rose-600 font-bold' : ''}>
                        {r.extra_order_pct}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono">
                      <span className={r.inventory_ratio_pct > thresholds.inventory_high ? 'text-rose-600 font-bold' : ''}>
                        {r.inventory_ratio_pct}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono">
                      <span className={r.cost_per_meal_anomaly ? 'text-rose-600 font-bold' : ''}>
                        {formatVND(r.material_cost_per_meal)} ₫
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono">
                      <span className={Math.abs(r.meal_gap_pct) > thresholds.meal_gap_high ? 'text-rose-600 font-bold' : ''}>
                        {r.meal_gap_pct > 0 ? '+' : ''}{r.meal_gap_pct}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-mono">
                      <span className={r.gr_per_revenue_pct > thresholds.gr_revenue_high ? 'text-rose-600 font-bold' : ''}>
                        {r.gr_per_revenue_pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
