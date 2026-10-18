import React, { useState } from 'react';
import { CanteenSummary, CanteenRecord, RiskThresholds } from '../types/canteen';
import { RiskDonutChart } from './RiskDonutChart';
import { CostPerMealBarChart } from './CostPerMealBarChart';
import { OperationalRiskHeatmap } from './OperationalRiskHeatmap';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  TrendingUp, 
  ArrowUpDown, 
  ShieldAlert, 
  Utensils, 
  DollarSign, 
  Package,
  Printer
} from 'lucide-react';

interface TabDashboardProps {
  summary: CanteenSummary[];
  records?: CanteenRecord[];
  thresholds?: RiskThresholds;
  onOpenVisualReport?: () => void;
}

export const TabDashboard: React.FC<TabDashboardProps> = ({ summary, records = [], thresholds, onOpenVisualReport }) => {
  const { t, language } = useLanguage();
  const [sortField, setSortField] = useState<keyof CanteenSummary>('avg_risk_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [hoveredCanteen, setHoveredCanteen] = useState<string | null>(null);

  const handleSort = (field: keyof CanteenSummary) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedSummary = [...summary].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc 
      ? String(valA).localeCompare(String(valB)) 
      : String(valB).localeCompare(String(valA));
  });

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
  };

  // Max values for chart scaling
  const maxRevenueOrGr = Math.max(
    ...summary.map(s => Math.max(s.gr_value, s.revenue)),
    1000000
  );
  const maxCostPerMeal = Math.max(...summary.map(s => s.material_cost_per_meal), 30000);

  return (
    <div className="space-y-6">
      {/* 1. Main Canteen Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>{language === 'ko' ? '급식소별 핵심 운영 성과 지표 종합' : 'Tổng hợp Bảng chỉ số theo Canteen'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ko' 
                ? '발주, 입출고, 기말 재고, 식단가, 재고 계수 및 복합 리스크 평가' 
                : 'Tổng hợp toàn diện Đặt hàng, Nhập/Xuất kho, Suất ăn, Chi phí và Đánh giá rủi ro'}
            </p>
          </div>
          <div className="flex items-center space-x-2.5 text-xs">
            {onOpenVisualReport && (
              <button
                onClick={onOpenVisualReport}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 flex items-center space-x-1.5 transition-colors shadow-2xs"
                title="Xuất báo cáo điều hành kèm biểu đồ"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.btnExportVisualReport}</span>
              </button>
            )}
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              {summary.length} {language === 'ko' ? '개 급식소' : 'cơ sở vận hành'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th 
                  onClick={() => handleSort('canteen')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>{t.tableCanteen}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('avg_risk_score')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{language === 'ko' ? '평균 리스크점수' : 'Điểm Rủi Ro TB'}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('high_risk_days')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{language === 'ko' ? '고위험 일수' : 'Ngày Rủi Ro Cao'}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('gr_value')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>{t.tableGr}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('revenue')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>{language === 'ko' ? '매출액' : 'Doanh Thu'}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('extra_order_pct')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>{t.tablePr3Extra} (%)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('material_cost_per_meal')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>{t.tableCostPerMeal}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('inventory_value_per_meal')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-right bg-indigo-50/50 text-indigo-900"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>{t.tableInventoryPerMeal}</span>
                    <ArrowUpDown className="w-3 h-3 text-indigo-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('inventory_to_gr_ratio')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-right"
                  title={t.tableInventoryRatioTooltip}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>{t.tableInventoryRatioHeader}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('pr3_mismatch_count')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-center bg-rose-50/50 text-rose-900"
                  title={language === 'ko' ? '식수 감소에도 PR3 발주가 증가한 절차 위반 건수' : 'Số trường hợp vi phạm quy trình: Suất ăn giảm nhưng đơn hàng PR3 lại tăng'}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{t.tablePr3Mismatch}</span>
                    <ArrowUpDown className="w-3 h-3 text-rose-500" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('meal_gap_pct')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>{t.tableMealGap}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('gr_per_revenue_pct')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>{language === 'ko' ? 'GR/매출비율' : 'GR / Doanh thu'}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-3 text-right whitespace-nowrap">{t.tableEndingInventory}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {sortedSummary.map((item) => (
                <tr 
                  key={item.canteen}
                  onMouseEnter={() => setHoveredCanteen(item.canteen)}
                  onMouseLeave={() => setHoveredCanteen(null)}
                  className={`hover:bg-indigo-50/40 transition-colors ${
                    hoveredCanteen === item.canteen ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    {item.canteen}
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
                      {item.avg_risk_score} •{' '}
                      {language === 'ko'
                        ? item.risk_level === 'Cao'
                          ? '고위험'
                          : item.risk_level === 'Trung bình'
                          ? '중위험'
                          : '저위험'
                        : item.risk_level}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <span className={`font-semibold ${item.high_risk_days > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {item.high_risk_days}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        / {item.total_days} {language === 'ko' ? '일' : 'ngày'}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap font-mono">
                    {formatVND(item.gr_value)} ₫
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap font-mono text-slate-800">
                    {formatVND(item.revenue)} ₫
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <span className={`font-semibold ${item.extra_order_pct > 15 ? 'text-rose-600' : item.extra_order_pct > 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                      {item.extra_order_pct}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap font-mono">
                    {formatVND(item.material_cost_per_meal)} ₫
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap font-mono font-bold bg-indigo-50/30">
                    <span className={item.inventory_value_per_meal > 15000 ? 'text-rose-600' : 'text-indigo-900'}>
                      {formatVND(item.inventory_value_per_meal)} ₫
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span className={`font-mono font-semibold ${item.inventory_ratio_pct > 20 ? 'text-rose-600' : 'text-slate-800'}`}>
                        GR: {item.inventory_to_gr_ratio !== undefined ? item.inventory_to_gr_ratio.toFixed(2) : (item.ending_inventory_value / (item.gr_value || 1)).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono" title={language === 'ko' ? '기말재고 / GI 출고액 계수' : 'Hệ số Tồn kho cuối / GI xuất kho'}>
                        GI: {item.inventory_to_gi_ratio !== undefined ? item.inventory_to_gi_ratio.toFixed(2) : (item.ending_inventory_value / (item.gi_value || 1)).toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center whitespace-nowrap bg-rose-50/20">
                    {item.pr3_mismatch_count > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        ⚠️ {item.pr3_mismatch_count} {language === 'ko' ? '건' : 'Trường hợp'}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-normal">0</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <span className={`font-semibold ${Math.abs(item.meal_gap_pct) > 10 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {item.meal_gap_pct > 0 ? '+' : ''}{item.meal_gap_pct}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <span className={`font-semibold ${item.gr_per_revenue_pct > 50 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {item.gr_per_revenue_pct}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap font-mono text-slate-600">
                    {formatVND(item.ending_inventory_value)} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Process Compliance Alert & Inventory per Meal Card */}
      {(() => {
        const pr3Violations = (records || []).filter(r => r.pr3_meal_mismatch);
        const avgInvPerMeal = records && records.length > 0 
          ? Math.round(records.reduce((acc, r) => acc + r.inventory_value_per_meal, 0) / records.length) 
          : 0;

        return (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <span>{language === 'ko' ? 'PR3 발주 절차 모니터링 및 1식당 재고액 관리' : 'Giám Sát Quy Trình Đặt Hàng PR3 & Quản Trị Tồn Kho / Suất Ăn'}</span>
                    {pr3Violations.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        {pr3Violations.length} {language === 'ko' ? '건 절차위반' : 'trường hợp vi phạm quy trình'}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ko'
                      ? '표준 업무절차: 식수가 감소하면 PR3 추가발주도 비례하여 감소해야 함. 식수가 줄었는데 PR3 발주가 증가하면 재고 낭비 유발.'
                      : 'Quy trình chuẩn: Suất ăn giảm thì đơn phát sinh PR3 phải giảm. Nếu suất ăn giảm mà PR3 tăng là bất thường gây tồn kho lãng phí.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                  <span className="text-slate-500">{language === 'ko' ? '평균 1식당 재고액:' : 'Tồn kho TB / suất:'}</span>
                  <strong className="font-mono text-sm">{formatVND(avgInvPerMeal)} ₫</strong>
                </div>
              </div>
            </div>

            {pr3Violations.length > 0 ? (
              <div className="p-4 sm:p-5 space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-rose-50/70 text-rose-950 uppercase font-semibold border-b border-rose-200 text-[11px]">
                      <tr>
                        <th className="px-3 py-2.5">{language === 'ko' ? '일자' : 'Ngày'}</th>
                        <th className="px-3 py-2.5">{t.tableCanteen}</th>
                        <th className="px-3 py-2.5 text-right">{language === 'ko' ? '실적 식수' : 'Suất Confirm'}</th>
                        <th className="px-3 py-2.5 text-center">{language === 'ko' ? '식수 변동률' : 'Biến Thiên Suất Ăn'}</th>
                        <th className="px-3 py-2.5 text-right">{language === 'ko' ? 'PR3 발주액' : 'Giá Trị PR3'}</th>
                        <th className="px-3 py-2.5 text-center">{language === 'ko' ? 'PR3 변동' : 'Biến Thiên PR3'}</th>
                        <th className="px-3 py-2.5 text-right font-bold text-indigo-900">{t.tableInventoryPerMeal}</th>
                        <th className="px-4 py-2.5">{language === 'ko' ? '절차 위반 세부 경고' : 'Cảnh Báo Vi Phạm Quy Trình'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100 text-slate-700 font-medium">
                      {pr3Violations.slice(0, 10).map((v) => (
                        <tr key={v.id} className="hover:bg-rose-50/40 transition-colors">
                          <td className="px-3 py-2.5 font-semibold text-slate-900 whitespace-nowrap">{v.date}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-800 whitespace-nowrap">{v.canteen}</td>
                          <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">{v.confirmed_meals.toLocaleString('vi-VN')} {language === 'ko' ? '식' : 'suất'}</td>
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                              {v.meal_delta_pct !== undefined ? (v.meal_delta_pct > 0 ? `+${v.meal_delta_pct}%` : `${v.meal_delta_pct}%`) : `${v.meal_gap_pct}% vs KH`}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap text-rose-700 font-bold">{formatVND(v.pr3_value)} ₫</td>
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              {v.pr3_delta_pct !== undefined && v.pr3_delta_pct > 0 ? `+${v.pr3_delta_pct}%` : `${v.extra_order_pct}% tổng đơn`}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold whitespace-nowrap text-indigo-900 bg-indigo-50/20">
                            {formatVND(v.inventory_value_per_meal)} ₫
                          </td>
                          <td className="px-4 py-2.5 text-rose-800 text-xs">
                            {language === 'ko'
                              ? '식수 감소에도 불구하고 추가발주(PR3) 금액이 비정상적으로 증가함'
                              : (v.pr3_meal_mismatch_desc || 'Suất ăn sụt giảm nhưng đơn hàng phát sinh PR3 lại tăng vọt')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
                  <span className="font-bold shrink-0">{language === 'ko' ? '💡 업무 절차 원칙:' : '💡 Nguyên lý quy trình:'}</span>
                  <span>
                    {language === 'ko'
                      ? '식수가 줄면 식재료 소진 수요도 줄어듭니다. 추가발주(PR3)가 계속 늘어난다는 것은 과잉 구매 또는 식단 메뉴 계획과의 불일치가 발생하고 있음을 뜻하며, 이는 1식당 재고비용 급증으로 이어집니다.'
                      : 'Khi số suất ăn giảm, nhu cầu tiêu thụ thực phẩm sụt giảm theo. Việc đơn đặt hàng phát sinh (PR3) vẫn tiếp tục tăng chứng tỏ có tình trạng mua dư thừa hoặc thiếu đồng bộ giữa bộ phận đặt hàng và kế hoạch thực đơn, dẫn đến tồn kho/suất ăn tăng cao.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-emerald-700 bg-emerald-50/40 flex items-center justify-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">
                  {language === 'ko'
                    ? '발주 절차 준수 양호: 식수 감소 시 추가발주(PR3)가 불필요하게 증가한 사례가 없습니다.'
                    : 'Quy trình đặt hàng tuân thủ tốt: Không có trường hợp nào suất ăn giảm mà đơn hàng phát sinh PR3 lại tăng.'}
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* 3. Recharts Material Cost Per Meal Distribution Chart */}
      <CostPerMealBarChart 
        summary={summary} 
        records={records} 
        thresholds={thresholds} 
      />

      {/* 4. Operational Risk Heatmap: inventory_ratio_pct vs extra_order_pct */}
      <OperationalRiskHeatmap
        summary={summary}
        records={records}
        thresholds={thresholds}
      />

      {/* 5. Secondary Analytical Charts (Risk Donut & GR vs Revenue) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Chart - Phân bổ mức độ rủi ro */}
        <RiskDonutChart records={records} />

        {/* Chart 2: GR vs Revenue comparison */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ko' ? 'GR(입고) 및 매출액 비교' : 'So sánh GR (Nhập hàng) & Doanh thu'}</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'ko' ? '급식소별 매출액 대비 식재료 입고 비용 비중 분석' : 'Tỷ trọng chi phí nhập hàng so với doanh thu từng canteen'}
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm mr-1"></span> GR
                </span>
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm mr-1"></span> {language === 'ko' ? '매출액' : 'Doanh thu'}
                </span>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="space-y-3.5 pt-1">
              {summary.map((item) => {
                const grWidth = Math.min(100, (item.gr_value / maxRevenueOrGr) * 100);
                const revWidth = Math.min(100, (item.revenue / maxRevenueOrGr) * 100);

                return (
                  <div key={item.canteen} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="truncate max-w-[200px]" title={item.canteen}>
                        {item.canteen}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        GR/{language === 'ko' ? '매출' : 'DT'}: {item.gr_per_revenue_pct}%
                      </span>
                    </div>
                    {/* Bars */}
                    <div className="space-y-1">
                      {/* GR Bar */}
                      <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex items-center">
                        <div
                          style={{ width: `${Math.max(grWidth, 2)}%` }}
                          className="h-full bg-blue-500 rounded-full transition-all duration-300 flex items-center justify-end pr-1.5"
                        >
                          {grWidth > 25 && (
                            <span className="text-[9px] text-white font-medium">
                              {formatVND(item.gr_value)}
                            </span>
                          )}
                        </div>
                        {grWidth <= 25 && (
                          <span className="text-[9px] text-slate-600 ml-1.5 font-medium">
                            {formatVND(item.gr_value)}
                          </span>
                        )}
                      </div>
                      {/* Revenue Bar */}
                      <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex items-center">
                        <div
                          style={{ width: `${Math.max(revWidth, 2)}%` }}
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300 flex items-center justify-end pr-1.5"
                        >
                          {revWidth > 25 && (
                            <span className="text-[9px] text-white font-medium">
                              {formatVND(item.revenue)}
                            </span>
                          )}
                        </div>
                        {revWidth <= 25 && (
                          <span className="text-[9px] text-slate-600 ml-1.5 font-medium">
                            {formatVND(item.revenue)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{language === 'ko' ? '총 GR:' : 'Tổng GR:'} {formatVND(summary.reduce((a, c) => a + c.gr_value, 0))} ₫</span>
            <span className="font-semibold text-slate-700">
              {language === 'ko' ? '총 매출액:' : 'DT:'} {formatVND(summary.reduce((a, c) => a + c.revenue, 0))} ₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
