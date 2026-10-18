import React, { useRef } from 'react';
import { 
  Printer, 
  FileDown, 
  X, 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { CanteenSummary, CanteenRecord, RiskThresholds } from '../types/canteen';
import { useLanguage } from '../context/LanguageContext';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: CanteenSummary[];
  records: CanteenRecord[];
  dateStart: string;
  dateEnd: string;
  selectedCanteens: string[];
  thresholds?: RiskThresholds;
  onExportExcel: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  summary,
  records,
  dateStart,
  dateEnd,
  selectedCanteens,
  thresholds,
  onExportExcel,
}) => {
  const { language } = useLanguage();
  const reportRef = useRef<HTMLDivElement>(null);
  const isKo = language === 'ko';

  if (!isOpen) return null;

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
  };

  // Calculations for Executive Summary
  const totalOrders = summary.reduce((acc, s) => acc + s.total_order_value, 0);
  const totalPr1 = summary.reduce((acc, s) => acc + s.pr1_value, 0);
  const totalPr3 = summary.reduce((acc, s) => acc + s.pr3_value, 0);
  const pr3Pct = totalOrders > 0 ? (totalPr3 / totalOrders) * 100 : 0;

  const totalGr = summary.reduce((acc, s) => acc + s.gr_value, 0);
  const totalGi = summary.reduce((acc, s) => acc + s.gi_value, 0);
  const totalPlan = summary.reduce((acc, s) => acc + s.menu_plan_value, 0);
  const endingInventory = summary.reduce((acc, s) => acc + s.ending_inventory_value, 0);

  const inventoryRatioGr = totalGr > 0 ? (endingInventory / totalGr) * 100 : 0;
  const inventoryRatioGi = totalGi > 0 ? (endingInventory / totalGi) * 100 : 0;

  const totalMeals = summary.reduce((acc, s) => acc + s.confirmed_meals, 0);
  const avgCostPerMeal = totalMeals > 0 ? Math.round(totalGi / totalMeals) : 0;
  const avgInvPerMeal = totalMeals > 0 ? Math.round(endingInventory / totalMeals) : 0;

  const pr3MismatchTotal = summary.reduce((acc, s) => acc + s.pr3_mismatch_count, 0);
  const highRiskCanteens = summary.filter((s) => s.avg_risk_score >= 60);
  const medRiskCanteens = summary.filter((s) => s.avg_risk_score >= 35 && s.avg_risk_score < 60);
  const lowRiskCanteens = summary.filter((s) => s.avg_risk_score < 35);

  const highRiskRecords = records.filter((r) => r.risk_level === 'Cao');
  const medRiskRecords = records.filter((r) => r.risk_level === 'Trung bình');
  const lowRiskRecords = records.filter((r) => r.risk_level === 'Thấp');
  const totalRecordsCount = records.length || 1;

  // Donut chart calculations
  const highPct = (highRiskRecords.length / totalRecordsCount) * 100;
  const medPct = (medRiskRecords.length / totalRecordsCount) * 100;
  const lowPct = (lowRiskRecords.length / totalRecordsCount) * 100;

  // Sorted canteens for bar chart
  const sortedByCost = [...summary].sort((a, b) => b.material_cost_per_meal - a.material_cost_per_meal);
  const maxCost = Math.max(...summary.map((s) => s.material_cost_per_meal), 35000);
  const costWarningThreshold = 18000;

  // Top critical canteen
  const topCriticalCanteen = [...summary].sort((a, b) => b.avg_risk_score - a.avg_risk_score)[0];
  const topPr3MismatchCanteen = [...summary].sort((a, b) => b.pr3_mismatch_count - a.pr3_mismatch_count)[0];
  const topInventoryRatioCanteen = [...summary].sort((a, b) => b.inventory_ratio_pct - a.inventory_ratio_pct)[0];

  const currentDateStr = new Date().toLocaleString(isKo ? 'ko-KR' : 'vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    if (!reportRef.current) return;
    const reportHtml = reportRef.current.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>WELSTORY VIỆT NAM - Báo Cáo Quản Trị Rủi Ro & Hiệu Quả Bếp Ăn</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .page-container { max-width: 1080px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="page-container">
    ${reportHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Welstory-Bao-Cao-Rui-Ro-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Sticky Action Toolbar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white px-2 py-1 rounded-md flex items-center justify-center">
              <img src="/wel.webp" alt="Welstory" className="h-5 w-auto object-contain" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                <span>{isKo ? '대시보드 차트 포함 종합 리스크 분석 보고서' : 'Báo Cáo Điều Hành Kèm Biểu Đồ Dashboard'}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isKo ? 'A4 인쇄, PDF 저장 및 독립형 HTML 보고서 다운로드 지원' : 'Hỗ trợ in A4, Lưu file PDF và Tải báo cáo HTML độc lập tích hợp biểu đồ'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
              title="In hoặc Lưu thành file PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isKo ? '인쇄 / PDF 저장' : 'In / Lưu PDF'}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
              title="Tải tập tin HTML hoàn chỉnh kèm biểu đồ"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isKo ? 'HTML 보고서 다운로드' : 'Tải File HTML'}</span>
            </button>

            <button
              onClick={onExportExcel}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center space-x-1.5 border border-slate-700"
              title="Xuất bảng số liệu Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{isKo ? '엑셀' : 'Excel'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-slate-50/50 print:bg-white print:p-0 print:overflow-visible">
          <div 
            ref={reportRef} 
            className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-xl border border-slate-200/90 shadow-sm print:border-none print:shadow-none print:p-0 text-slate-800 space-y-7"
          >
            {/* Header Document & Branding */}
            <div className="border-b-2 border-orange-500/80 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs shrink-0">
                    <img src="/wel.webp" alt="WELSTORY VIỆT NAM" className="h-9 sm:h-11 w-auto object-contain" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-widest text-orange-600 uppercase">
                      WELSTORY VIỆT NAM • RISK & OPERATIONS INTELLIGENCE
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {isKo ? '급식소 운영 리스크 및 식재료 통제 종합 보고서' : 'BÁO CÁO ĐIỀU HÀNH QUẢN TRỊ RỦI RO BẾP ĂN'}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isKo 
                        ? '발주(PR1/PR3) • 입출고/재고(GR/GI) • 식수 적정성 • 이상치 종합 분석' 
                        : 'Phân tích Đặt hàng (PR1/PR3) • Nhập/Xuất/Tồn (GR/GI) • Suất ăn • Bất thường Chi phí'}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right text-xs text-slate-500 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-none border-slate-200">
                  <div className="font-mono font-semibold text-slate-800">
                    Số: <span className="text-orange-600">WEL-RMS-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}</span>
                  </div>
                  <div className="mt-1 flex items-center sm:justify-end space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kỳ báo cáo: <strong className="text-slate-700">{dateStart}</strong> → <strong className="text-slate-700">{dateEnd}</strong></span>
                  </div>
                  <div className="mt-0.5 text-[11px]">
                    Ngày giờ xuất: <span className="font-medium text-slate-700">{currentDateStr}</span>
                  </div>
                  <div className="mt-0.5 text-[11px]">
                    Phạm vi: <strong className="text-slate-800">{summary.length}</strong> Canteen theo dõi
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Executive KPI Scorecard */}
            <div className="print-avoid-break">
              <div className="flex items-center space-x-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  {isKo ? '1. 핵심 경영 지표 요약 (Executive KPIs)' : '1. Tổng Quan Chỉ Số Điều Hành Trọng Yếu'}
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* KPI 1: Orders */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                    <span>{isKo ? '총 발주액 (PR1+PR3)' : 'Tổng Đặt Hàng (PR1+PR3)'}</span>
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {formatVND(totalOrders)} <span className="text-xs font-normal text-slate-500">₫</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>PR3 phát sinh:</span>
                    <strong className={`${pr3Pct > 20 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {formatVND(totalPr3)} ₫ ({pr3Pct.toFixed(1)}%)
                    </strong>
                  </div>
                </div>

                {/* KPI 2: GR vs Plan */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                    <span>{isKo ? '총 입고액 (GR)' : 'Tổng Nhập Kho (GR)'}</span>
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {formatVND(totalGr)} <span className="text-xs font-normal text-slate-500">₫</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Kế hoạch Menu:</span>
                    <strong className="text-slate-700">{formatVND(totalPlan)} ₫</strong>
                  </div>
                </div>

                {/* KPI 3: Ending Inventory */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                    <span>{isKo ? '기말 재고금액' : 'Tồn Kho Cuối Kỳ'}</span>
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {formatVND(endingInventory)} <span className="text-xs font-normal text-slate-500">₫</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Hệ số Tồn/GR:</span>
                    <strong className={`${inventoryRatioGr > 20 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {inventoryRatioGr.toFixed(1)}% (Tồn/GI: {inventoryRatioGi.toFixed(1)}%)
                    </strong>
                  </div>
                </div>

                {/* KPI 4: Cost per Meal */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                    <span>{isKo ? '1식당 식재료비' : 'Chi Phí NL / Suất Ăn'}</span>
                    <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {formatVND(avgCostPerMeal)} <span className="text-xs font-normal text-slate-500">₫/suất</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Tổng suất phục vụ:</span>
                    <strong className="text-slate-700">{totalMeals.toLocaleString('vi-VN')} suất</strong>
                  </div>
                </div>

                {/* KPI 5: Inventory per Meal */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                    <span>{isKo ? '1식당 재고 보유액' : 'Tồn Kho / Suất Ăn'}</span>
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {formatVND(avgInvPerMeal)} <span className="text-xs font-normal text-slate-500">₫/suất</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Ngưỡng an toàn:</span>
                    <strong className="text-slate-700">≤ 15.000 ₫/suất</strong>
                  </div>
                </div>

                {/* KPI 6: Risk & Compliance Alerts */}
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
                  <div className="text-[11px] font-semibold text-rose-800 flex items-center justify-between">
                    <span>{isKo ? '위험 경고 및 절차 위반' : 'Cảnh Báo & Vi Phạm Quy Trình'}</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="text-lg font-bold text-rose-700 font-mono mt-1">
                    {pr3MismatchTotal} <span className="text-xs font-normal text-rose-600">Trường hợp vi phạm PR3</span>
                  </div>
                  <div className="text-[11px] text-rose-700 mt-1 flex items-center justify-between">
                    <span>Canteen Nguy cơ cao:</span>
                    <strong className="text-rose-900 font-bold">{highRiskCanteens.length} / {summary.length} đơn vị</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Visual Charts Grid */}
            <div className="print-avoid-break space-y-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  {isKo ? '2. 대시보드 리스크 시각화 차트 (Risk & Performance Charts)' : '2. Biểu Đồ Trực Quan Hóa Rủi Ro & Hiệu Quả Dashboard'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Chart 1: Donut Chart Vector Representation */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {isKo ? '리스크 등급별 분포 (Donut Chart)' : 'Phân Bổ Mức Độ Rủi Ro (Donut Chart)'}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      Tổng {totalRecordsCount} Trường hợp
                    </span>
                  </div>

                  <div className="flex items-center justify-around py-2">
                    {/* SVG Donut */}
                    <div className="relative w-36 h-36 shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Background ring */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                        
                        {/* Low Risk Segment */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="16"
                          strokeDasharray={`${lowPct * 2.387} 238.7`}
                          strokeDashoffset="0"
                        />
                        {/* Medium Risk Segment */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#f59e0b"
                          strokeWidth="16"
                          strokeDasharray={`${medPct * 2.387} 238.7`}
                          strokeDashoffset={`${-lowPct * 2.387}`}
                        />
                        {/* High Risk Segment */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#f43f5e"
                          strokeWidth="16"
                          strokeDasharray={`${highPct * 2.387} 238.7`}
                          strokeDashoffset={`${-(lowPct + medPct) * 2.387}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">Tỷ lệ rủi ro</span>
                        <span className="text-base font-extrabold text-slate-800 font-mono">
                          {highPct.toFixed(0)}%
                        </span>
                        <span className="text-[10px] text-rose-600 font-semibold">Mức cao</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800">Nguy cơ Cao (≥60đ):</span>
                          <span className="font-mono text-slate-600 ml-1.5 font-bold">
                            {highRiskRecords.length} ({highPct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800">Trung bình (35-59đ):</span>
                          <span className="font-mono text-slate-600 ml-1.5 font-bold">
                            {medRiskRecords.length} ({medPct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800">An toàn (&lt;35đ):</span>
                          <span className="font-mono text-slate-600 ml-1.5 font-bold">
                            {lowRiskRecords.length} ({lowPct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Đánh giá trạng thái:</span>
                    <strong className={highRiskRecords.length > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      {highRiskRecords.length > 0 
                        ? `Có ${highRiskRecords.length} Trường hợp nguy cơ cao cần thanh tra` 
                        : 'Vận hành ổn định trong ngưỡng cho phép'}
                    </strong>
                  </div>
                </div>

                {/* Chart 2: Cost Per Meal Bar Chart */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {isKo ? '급식소별 1식당 식재료비 비교 (Bar Chart)' : 'Chi Phí Thực Phẩm / Suất Theo Canteen (Bar Chart)'}
                    </h3>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200">
                      Ngưỡng: {formatVND(costWarningThreshold)} ₫
                    </span>
                  </div>

                  <div className="space-y-2 py-1">
                    {sortedByCost.slice(0, 6).map((c) => {
                      const pct = Math.min(100, Math.max(10, (c.material_cost_per_meal / maxCost) * 100));
                      const isOver = c.material_cost_per_meal > costWarningThreshold;
                      return (
                        <div key={c.canteen} className="text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-slate-800 truncate max-w-[140px]">
                              {c.canteen}
                            </span>
                            <span className={`font-mono font-bold ${isOver ? 'text-rose-600' : 'text-slate-700'}`}>
                              {formatVND(c.material_cost_per_meal)} ₫
                              {isOver && <span className="text-[10px] ml-1 text-rose-500 font-semibold">⚠️</span>}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                            <div
                              className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-indigo-600'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Trung bình hệ thống:</span>
                    <strong className="text-slate-800 font-mono">{formatVND(avgCostPerMeal)} ₫/suất</strong>
                  </div>
                </div>

              </div>

              {/* Chart 3: Operational Risk Heatmap 4-Quadrants Matrix */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {isKo ? '운영 리스크 4분면 매트릭스 (재고비율 vs PR3 추가발주)' : 'Ma Trận Rủi Ro Vận Hành 4 Phân Vùng (Tồn Kho / GR vs Đơn Phát Sinh PR3)'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Nhận diện các bếp ăn vừa ôm tồn kho cao (&gt;20%) vừa tạo đơn phát sinh ngoài kế hoạch (&gt;15%)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Zone 1: Critical (High Inv & High PR3) */}
                  <div className="p-3 rounded-lg border border-rose-300 bg-rose-50/70">
                    <div className="flex items-center justify-between text-rose-900 font-bold mb-1">
                      <span>VÙNG NGUY CẤP (Tồn kho &gt;20% & PR3 &gt;15%)</span>
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    </div>
                    <p className="text-[11px] text-rose-700 mb-2">
                      Rủi ro kép: Ứ đọng vốn, nguy cơ hư hỏng HSD và thất thoát chi phí cao.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.filter(s => s.inventory_ratio_pct > 20 && (s.pr3_value / (s.total_order_value || 1)) * 100 > 15).length > 0 ? (
                        summary.filter(s => s.inventory_ratio_pct > 20 && (s.pr3_value / (s.total_order_value || 1)) * 100 > 15).map(s => (
                          <span key={s.canteen} className="px-2 py-0.5 rounded-sm bg-rose-200 text-rose-900 font-semibold text-[11px]">
                            {s.canteen} (Điểm: {s.avg_risk_score})
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Không có canteen thuộc vùng này</span>
                      )}
                    </div>
                  </div>

                  {/* Zone 2: Overstock Warning */}
                  <div className="p-3 rounded-lg border border-amber-300 bg-amber-50/70">
                    <div className="flex items-center justify-between text-amber-900 font-bold mb-1">
                      <span>VÙNG Ứ ĐỌNG KHO (Tồn kho &gt;20% & PR3 ≤15%)</span>
                      <Package className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-[11px] text-amber-800 mb-2">
                      Tồn kho cao nhưng kiểm soát đơn tốt. Cần giải phóng nguyên vật liệu trước khi tạo đơn mới.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.filter(s => s.inventory_ratio_pct > 20 && (s.pr3_value / (s.total_order_value || 1)) * 100 <= 15).length > 0 ? (
                        summary.filter(s => s.inventory_ratio_pct > 20 && (s.pr3_value / (s.total_order_value || 1)) * 100 <= 15).map(s => (
                          <span key={s.canteen} className="px-2 py-0.5 rounded-sm bg-amber-200 text-amber-900 font-semibold text-[11px]">
                            {s.canteen} (Tồn/GR: {s.inventory_ratio_pct}%)
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Không có canteen thuộc vùng này</span>
                      )}
                    </div>
                  </div>

                  {/* Zone 3: High PR3 Extra */}
                  <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/70">
                    <div className="flex items-center justify-between text-indigo-900 font-bold mb-1">
                      <span>VÙNG ĐẶT PHÁT SINH CAO (Tồn kho ≤20% & PR3 &gt;15%)</span>
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-[11px] text-indigo-700 mb-2">
                      Lượng đặt hàng phát sinh PR3 cao bất thường so với thực đơn định mức kế hoạch.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.filter(s => s.inventory_ratio_pct <= 20 && (s.pr3_value / (s.total_order_value || 1)) * 100 > 15).length > 0 ? (
                        summary.filter(s => s.inventory_ratio_pct <= 20 && (s.pr3_value / (s.total_order_value || 1)) * 100 > 15).map(s => (
                          <span key={s.canteen} className="px-2 py-0.5 rounded-sm bg-indigo-200 text-indigo-900 font-semibold text-[11px]">
                            {s.canteen} (PR3: {((s.pr3_value / (s.total_order_value || 1)) * 100).toFixed(1)}%)
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Không có canteen thuộc vùng này</span>
                      )}
                    </div>
                  </div>

                  {/* Zone 4: Optimal & Controlled */}
                  <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50/70">
                    <div className="flex items-center justify-between text-emerald-900 font-bold mb-1">
                      <span>VÙNG AN TOÀN & CÂN BẰNG (Tồn kho ≤20% & PR3 ≤15%)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-emerald-700 mb-2">
                      Vận hành chuẩn chỉ tiêu: Tồn kho gối đầu hợp lý, tỷ lệ đặt hàng bám sát kế hoạch.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.filter(s => s.inventory_ratio_pct <= 20 && (s.pr3_value / (s.total_order_value || 1)) * 100 <= 15).length > 0 ? (
                        summary.filter(s => s.inventory_ratio_pct <= 20 && (s.pr3_value / (s.total_order_value || 1)) * 100 <= 15).map(s => (
                          <span key={s.canteen} className="px-2 py-0.5 rounded-sm bg-emerald-200 text-emerald-900 font-semibold text-[11px]">
                            {s.canteen}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Không có canteen</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Detailed Canteen Risk Table */}
            <div className="print-avoid-break">
              <div className="flex items-center space-x-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  {isKo ? '3. 급식소별 운영 세부 지표 및 리스크 분석표' : '3. Bảng Dữ Liệu Chi Tiết Vận Hành Từng Canteen'}
                </h2>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="px-3 py-2.5 text-left">Canteen</th>
                      <th className="px-3 py-2.5 text-right">Tổng Đặt (VNĐ)</th>
                      <th className="px-3 py-2.5 text-right">PR3 (%)</th>
                      <th className="px-3 py-2.5 text-right">Nhập (GR)</th>
                      <th className="px-3 py-2.5 text-right">Tồn Kho (VNĐ)</th>
                      <th className="px-3 py-2.5 text-right">Tồn/GR (%)</th>
                      <th className="px-3 py-2.5 text-right">CP/Suất</th>
                      <th className="px-3 py-2.5 text-center">Vi Phạm PR3</th>
                      <th className="px-3 py-2.5 text-center">Điểm Rủi Ro</th>
                      <th className="px-3 py-2.5 text-center">Đánh Giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {summary.map((s, idx) => {
                      const pr3Ratio = s.total_order_value > 0 ? (s.pr3_value / s.total_order_value) * 100 : 0;
                      const isHigh = s.avg_risk_score >= 60;
                      const isMed = s.avg_risk_score >= 35 && s.avg_risk_score < 60;
                      return (
                        <tr key={s.canteen} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="px-3 py-2 font-bold text-slate-900">
                            {s.canteen}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatVND(s.total_order_value)}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono font-semibold ${pr3Ratio > 15 ? 'text-rose-600' : 'text-slate-600'}`}>
                            {pr3Ratio.toFixed(1)}%
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatVND(s.gr_value)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-700">
                            {formatVND(s.ending_inventory_value)}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono font-semibold ${s.inventory_ratio_pct > 20 ? 'text-rose-600' : 'text-slate-600'}`}>
                            {s.inventory_ratio_pct}%
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-medium">
                            {formatVND(s.material_cost_per_meal)}
                          </td>
                          <td className="px-3 py-2 text-center whitespace-nowrap">
                            {s.pr3_mismatch_count > 0 ? (
                              <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[11px] border border-rose-200">
                                ⚠️ {s.pr3_mismatch_count} Trường hợp
                              </span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center font-mono font-bold">
                            <span className={isHigh ? 'text-rose-600' : isMed ? 'text-amber-600' : 'text-emerald-600'}>
                              {s.avg_risk_score}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isHigh 
                                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                : isMed 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {s.risk_level}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Automated Audit Findings & Strategic Recommendations */}
            <div className="print-avoid-break bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  {isKo ? '4. 종합 진단 의견 및 개선 권고사항 (Findings & Action Plan)' : '4. Nhận Định Rủi Ro & Khuyến Nghị Hành Động Từ Hệ Thống'}
                </h2>
              </div>

              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Điểm nóng kiểm toán đơn hàng PR3: </strong>
                    Toàn hệ thống ghi nhận tổng cộng <strong>{pr3MismatchTotal} Trường hợp vi phạm quy trình</strong> khi số suất ăn thực tế sụt giảm nhưng đơn hàng phát sinh (PR3) vẫn tiếp tục tạo tăng. Đơn vị cần rà soát khẩn cấp nhất là <strong>{topPr3MismatchCanteen?.canteen || 'các canteen'}</strong> ({topPr3MismatchCanteen?.pr3_mismatch_count || 0} Trường hợp).
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-start space-x-2">
                  <Package className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Kiểm soát tồn kho & điều chuyển: </strong>
                    Canteen <strong>{topInventoryRatioCanteen?.canteen || 'có tỷ lệ cao'}</strong> hiện giữ hệ số Tồn/GR cao nhất đạt <strong>{topInventoryRatioCanteen?.inventory_ratio_pct}%</strong> (giá trị {formatVND(topInventoryRatioCanteen?.ending_inventory_value || 0)} ₫). Đề xuất tạm dừng phê duyệt đơn mua mới đối với các mặt hàng gối đầu và áp dụng nguyên tắc FIFO để giải phóng hàng tránh quá hạn.
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block mb-1.5 font-bold">4 Khuyến nghị hành động chuẩn hóa Welstory:</strong>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                    <li>Thực hiện phân quyền duyệt đơn PR3 bắt buộc đối soát kế hoạch suất ăn thời gian thực trước 10:00 sáng hàng ngày.</li>
                    <li>Điều hòa nguyên liệu giữa các canteen trong cùng bán kính 15km khi có biến động khách ăn đột xuất.</li>
                    <li>Kích hoạt kiểm toán chi phí đối với các ngày có Z-Score (|Z| ≥ 3.5) để loại trừ sai số nhập liệu hóa đơn SAP.</li>
                    <li>Tổ chức họp kiểm điểm chất lượng định mức đối với {highRiskCanteens.length} Canteen có điểm rủi ro ≥ 60.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Section 5: Official Signatures */}
            <div className="print-avoid-break pt-4 border-t border-slate-200">
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-800 uppercase tracking-wide">Người Lập Báo Cáo</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Chuyên viên Phân tích Dữ liệu SAP</div>
                  <div className="h-16 flex items-end justify-center">
                    <span className="text-[11px] font-mono text-slate-400 italic">(Đã ký điện tử)</span>
                  </div>
                  <div className="font-semibold text-slate-700">WELSTORY SYSTEM ANALYST</div>
                </div>

                <div>
                  <div className="font-bold text-slate-800 uppercase tracking-wide">Quản Lý Vận Hành Khu Vực</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Area Operations Manager</div>
                  <div className="h-16 flex items-end justify-center">
                    <span className="text-[11px] font-mono text-slate-400 italic">........................................</span>
                  </div>
                  <div className="font-semibold text-slate-700">Xác nhận nghiệp vụ</div>
                </div>

                <div>
                  <div className="font-bold text-slate-800 uppercase tracking-wide">Ban Giám Đốc Phê Duyệt</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">WELSTORY VIỆT NAM</div>
                  <div className="h-16 flex items-end justify-center">
                    <span className="text-[11px] font-mono text-slate-400 italic">........................................</span>
                  </div>
                  <div className="font-semibold text-slate-700">Giám đốc Khối Vận hành</div>
                </div>
              </div>
            </div>

            {/* Footer Copyright */}
            <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
              WELSTORY VIỆT NAM • Hệ thống Quản trị Rủi ro & An toàn Thực phẩm Bếp ăn Doanh nghiệp • Document ID: WEL-RISK-2026
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
