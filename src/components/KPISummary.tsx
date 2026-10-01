import React from 'react';
import { 
  PackageCheck, 
  AlertTriangle, 
  Warehouse, 
  UtensilsCrossed, 
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface KPISummaryProps {
  totalGr: number;
  totalPlan: number;
  totalPr3: number;
  totalOrders: number;
  endingInventory: number;
  totalMeals: number;
  totalGi: number;
  highRiskCount: number;
  totalRecords: number;
  pr3MismatchCount?: number;
}

export const KPISummary: React.FC<KPISummaryProps> = ({
  totalGr,
  totalPlan,
  totalPr3,
  totalOrders,
  endingInventory,
  totalMeals,
  totalGi,
  highRiskCount,
  totalRecords,
  pr3MismatchCount = 0,
}) => {
  const grVsPlanPct = totalPlan > 0 ? ((totalGr - totalPlan) / totalPlan) * 100 : 0;
  const pr3Pct = totalOrders > 0 ? (totalPr3 / totalOrders) * 100 : 0;
  const costPerMeal = totalMeals > 0 ? totalGi / totalMeals : 0;
  const inventoryPerMeal = totalMeals > 0 ? Math.round(endingInventory / totalMeals) : 0;
  const highRiskRatio = totalRecords > 0 ? (highRiskCount / totalRecords) * 100 : 0;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num) + ' ₫';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. GR Value */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tổng Nhập Kho (GR)
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
          {formatVND(totalGr)}
        </div>
        <div className="flex items-center text-xs">
          <span
            className={`inline-flex items-center font-medium px-2 py-0.5 rounded-full mr-2 ${
              grVsPlanPct > 10
                ? 'bg-rose-50 text-rose-700'
                : grVsPlanPct > 0
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {grVsPlanPct >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {grVsPlanPct > 0 ? '+' : ''}{grVsPlanPct.toFixed(1)}%
          </span>
          <span className="text-slate-500">vs kế hoạch menu</span>
        </div>
      </div>

      {/* 2. PR3 Ratio & Process Compliance */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            PR3 / Tổng Đặt Hàng
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
          {pr3Pct.toFixed(1)}%
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{formatVND(totalPr3)}</span>
          {pr3MismatchCount > 0 ? (
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 animate-pulse" title="Phát hiện trường hợp vi phạm quy trình: Suất ăn giảm nhưng đơn PR3 lại tăng">
              ⚠️ {pr3MismatchCount} ca vi phạm QT
            </span>
          ) : (
            <span className="text-slate-400">Đơn phát sinh</span>
          )}
        </div>
      </div>

      {/* 3. Ending Inventory & Value per Meal */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tồn Kho Cuối Kỳ & /Suất
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Warehouse className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2 flex items-baseline justify-between">
          <span>{formatVND(endingInventory)}</span>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
            {formatVND(inventoryPerMeal)}/suất
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Tỷ lệ tồn / GR: <strong className="text-slate-700">{totalGr > 0 ? ((endingInventory / totalGr) * 100).toFixed(1) : 0}%</strong></span>
          <span className="text-[11px] text-slate-400 font-medium">Định mức an toàn</span>
        </div>
      </div>

      {/* 4. Cost Per Meal */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Chi Phí NVL / Suất
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
          {formatVND(costPerMeal)}
        </div>
        <div className="flex items-center text-xs text-slate-500">
          <span>Tổng suất ăn: </span>
          <span className="font-semibold text-slate-700 ml-1">
            {new Intl.NumberFormat('vi-VN').format(totalMeals)}
          </span>
        </div>
      </div>

      {/* 5. High Risk Entries */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Dòng Rủi Ro Cao
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-rose-600 tracking-tight mb-2">
          {highRiskCount} <span className="text-sm font-normal text-slate-400">/ {totalRecords}</span>
        </div>
        <div className="flex items-center text-xs">
          <span className={`font-semibold ${highRiskCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {highRiskRatio.toFixed(1)}%
          </span>
          <span className="text-slate-500 ml-1">tổng số ca theo dõi</span>
        </div>
      </div>
    </div>
  );
};
