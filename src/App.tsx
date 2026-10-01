import React, { useState, useEffect, useMemo } from 'react';
import { CanteenRecord, CanteenSummary, RiskThresholds, DEFAULT_THRESHOLDS } from './types/canteen';
import { generateSampleData } from './utils/sampleData';
import { calculateAnomalies, scoreRisks, summarizeByCanteen, parseNumber, parseDate, safeDiv } from './utils/analytics';
import { mapColumns } from './utils/normalize';
import { exportAnalysisExcel, downloadSampleTemplate } from './utils/exportExcel';

import { Header } from './components/Header';
import { KPISummary } from './components/KPISummary';
import { FilterBar } from './components/FilterBar';
import { TabDashboard } from './components/TabDashboard';
import { TabTrends } from './components/TabTrends';
import { TabRiskMatrix } from './components/TabRiskMatrix';
import { TabRawData } from './components/TabRawData';
import { ThresholdSettings } from './components/ThresholdSettings';
import { UploadModal } from './components/UploadModal';
import { FormulaGuideModal } from './components/FormulaGuideModal';

import { 
  LayoutDashboard, 
  TrendingUp, 
  ShieldAlert, 
  Database,
  Building2,
  Calendar,
  AlertTriangle,
  Sparkles,
  Download
} from 'lucide-react';

export default function App() {
  const [thresholds, setThresholds] = useState<RiskThresholds>(DEFAULT_THRESHOLDS);
  const [records, setRecords] = useState<CanteenRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trends' | 'risk' | 'raw'>('dashboard');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isThresholdsOpen, setIsThresholdsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Filters
  const [selectedCanteens, setSelectedCanteens] = useState<string[]>([]);
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Auto-load rich sample dataset on startup
  useEffect(() => {
    handleLoadSample();
  }, []);

  const handleLoadSample = () => {
    const rawSample = generateSampleData();
    const withAnomalies = calculateAnomalies(rawSample);
    const fullyScored = scoreRisks(withAnomalies, thresholds);

    setRecords(fullyScored);

    const cList = Array.from(new Set(fullyScored.map((r) => r.canteen))).sort();
    setSelectedCanteens(cList);

    const dates = fullyScored.map((r) => r.date).filter(Boolean).sort();
    if (dates.length > 0) {
      setDateStart(dates[0]);
      setDateEnd(dates[dates.length - 1]);
    }
  };

  // When thresholds change, re-score records
  const handleThresholdsChange = (newThresholds: RiskThresholds) => {
    setThresholds(newThresholds);
    if (records.length > 0) {
      const reScored = scoreRisks(records, newThresholds);
      setRecords(reScored);
    }
  };

  // Handle uploaded data from file
  const handleDataLoaded = (rawRows: any[], filename: string) => {
    if (!rawRows || rawRows.length === 0) return;

    const headers = Object.keys(rawRows[0]);
    const { mapped } = mapColumns(headers);

    const parsed: CanteenRecord[] = rawRows.map((row, idx) => {
      const date = parseDate(row[mapped['date']]);
      const canteen = String(row[mapped['canteen']] || `Canteen ${idx + 1}`).trim();
      const menu_plan_value = parseNumber(row[mapped['menu_plan_value']]);
      const pr1_value = parseNumber(row[mapped['pr1_value']]);
      const pr3_value = parseNumber(row[mapped['pr3_value']]);
      const gr_value = parseNumber(row[mapped['gr_value']]);
      const gi_value = parseNumber(row[mapped['gi_value']]);
      const ending_inventory_value = parseNumber(row[mapped['ending_inventory_value']]);
      const planned_meals = parseNumber(row[mapped['planned_meals']]);
      const confirmed_meals = parseNumber(row[mapped['confirmed_meals']]);
      const revenue = parseNumber(row[mapped['revenue']]);

      const ingredient = mapped['ingredient'] ? String(row[mapped['ingredient']] || '') : undefined;
      const expiry_date = mapped['expiry_date'] ? parseDate(row[mapped['expiry_date']]) : undefined;
      const qty = mapped['qty'] ? parseNumber(row[mapped['qty']]) : undefined;
      const inventory_qty = mapped['inventory_qty'] ? parseNumber(row[mapped['inventory_qty']]) : undefined;

      const total_order_value = pr1_value + pr3_value;
      const order_vs_plan_pct = Math.round(safeDiv(total_order_value - menu_plan_value, menu_plan_value) * 1000) / 10;
      const extra_order_pct = Math.round(safeDiv(pr3_value, total_order_value) * 1000) / 10;
      const gr_vs_plan_pct = Math.round(safeDiv(gr_value - menu_plan_value, menu_plan_value) * 1000) / 10;
      const inventory_ratio_pct = Math.round(safeDiv(ending_inventory_value, gr_value) * 1000) / 10;
      const material_cost_per_meal = Math.round(safeDiv(gi_value, confirmed_meals));
      const inventory_value_per_meal = Math.round(safeDiv(ending_inventory_value, confirmed_meals));
      const meal_gap = confirmed_meals - planned_meals;
      const meal_gap_pct = Math.round(safeDiv(meal_gap, planned_meals) * 1000) / 10;
      const gr_per_revenue_pct = Math.round(safeDiv(gr_value, revenue) * 1000) / 10;
      const gi_per_revenue_pct = Math.round(safeDiv(gi_value, revenue) * 1000) / 10;

      return {
        id: `${canteen}_${date}_${idx}`,
        date,
        canteen,
        menu_plan_value,
        pr1_value,
        pr3_value,
        gr_value,
        gi_value,
        ending_inventory_value,
        planned_meals,
        confirmed_meals,
        revenue,
        ingredient,
        expiry_date,
        qty,
        inventory_qty,
        total_order_value,
        order_vs_plan_pct,
        extra_order_pct,
        gr_vs_plan_pct,
        inventory_ratio_pct,
        material_cost_per_meal,
        inventory_value_per_meal,
        meal_gap,
        meal_gap_pct,
        gr_per_revenue_pct,
        gi_per_revenue_pct,
        risk_score: 0,
        risk_level: 'Thấp',
        risk_reason: '',
      };
    });

    const withAnomalies = calculateAnomalies(parsed);
    const fullyScored = scoreRisks(withAnomalies, thresholds);

    setRecords(fullyScored);

    const cList = Array.from(new Set(fullyScored.map((r) => r.canteen))).sort();
    setSelectedCanteens(cList);

    const dates = fullyScored.map((r) => r.date).filter(Boolean).sort();
    if (dates.length > 0) {
      setDateStart(dates[0]);
      setDateEnd(dates[dates.length - 1]);
    }
  };

  // Distinct canteens list
  const allCanteens = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.canteen))).sort();
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Canteen filter
      if (selectedCanteens.length > 0 && !selectedCanteens.includes(r.canteen)) {
        return false;
      }
      // Date range filter
      if (dateStart && r.date < dateStart) {
        return false;
      }
      if (dateEnd && r.date > dateEnd) {
        return false;
      }
      // Risk filter
      if (riskFilter !== 'Tất cả' && r.risk_level !== riskFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCanteen = r.canteen.toLowerCase().includes(q);
        const matchReason = r.risk_reason.toLowerCase().includes(q);
        const matchIngredient = r.ingredient ? r.ingredient.toLowerCase().includes(q) : false;
        if (!matchCanteen && !matchReason && !matchIngredient) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedCanteens, dateStart, dateEnd, riskFilter, searchQuery]);

  // Summary by canteen
  const summaries = useMemo(() => {
    return summarizeByCanteen(filteredRecords);
  }, [filteredRecords]);

  // Aggregate Metrics for Top KPI Bar
  const kpiData = useMemo(() => {
    let totalGr = 0;
    let totalPlan = 0;
    let totalPr3 = 0;
    let totalOrders = 0;
    let totalMeals = 0;
    let totalGi = 0;
    let highRiskCount = 0;
    let pr3MismatchCount = 0;

    for (const r of filteredRecords) {
      totalGr += r.gr_value;
      totalPlan += r.menu_plan_value;
      totalPr3 += r.pr3_value;
      totalOrders += r.total_order_value;
      totalMeals += r.confirmed_meals;
      totalGi += r.gi_value;
      if (r.risk_level === 'Cao') {
        highRiskCount++;
      }
      if (r.pr3_meal_mismatch) {
        pr3MismatchCount++;
      }
    }

    // Ending inventory across all canteens (using last recorded per canteen)
    const endingInventory = summaries.reduce((acc, curr) => acc + curr.ending_inventory_value, 0);

    return {
      totalGr,
      totalPlan,
      totalPr3,
      totalOrders,
      endingInventory,
      totalMeals,
      totalGi,
      highRiskCount,
      totalRecords: filteredRecords.length,
      pr3MismatchCount,
    };
  }, [filteredRecords, summaries]);

  // Export handler
  const handleExportExcel = () => {
    exportAnalysisExcel(filteredRecords, summaries);
  };

  const handleToggleCanteen = (canteen: string) => {
    if (selectedCanteens.includes(canteen)) {
      setSelectedCanteens(selectedCanteens.filter((c) => c !== canteen));
    } else {
      setSelectedCanteens([...selectedCanteens, canteen]);
    }
  };

  const handleResetFilters = () => {
    setSelectedCanteens(allCanteens);
    const dates = records.map((r) => r.date).filter(Boolean).sort();
    if (dates.length > 0) {
      setDateStart(dates[0]);
      setDateEnd(dates[dates.length - 1]);
    }
    setRiskFilter('Tất cả');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        onLoadSample={handleLoadSample}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenThresholds={() => setIsThresholdsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onExportExcel={handleExportExcel}
        onDownloadTemplate={downloadSampleTemplate}
        hasData={records.length > 0}
        totalRecords={records.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Top Cards */}
        <KPISummary {...kpiData} />

        {/* Global Filter Bar */}
        <FilterBar
          allCanteens={allCanteens}
          selectedCanteens={selectedCanteens}
          onToggleCanteen={handleToggleCanteen}
          onSelectAllCanteens={() => setSelectedCanteens(allCanteens)}
          onClearCanteens={() => setSelectedCanteens([])}
          dateStart={dateStart}
          dateEnd={dateEnd}
          onDateChange={(start, end) => {
            setDateStart(start);
            setDateEnd(end);
          }}
          riskFilter={riskFilter}
          onRiskFilterChange={setRiskFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onResetAll={handleResetFilters}
          filteredCount={filteredRecords.length}
          totalCount={records.length}
        />

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-2 sm:space-x-8 -mb-px overflow-x-auto text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-3 sm:px-1 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Canteen</span>
              <span className="text-[11px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                {summaries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={`py-3 px-3 sm:px-1 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
                activeTab === 'trends'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Xu hướng & Bất thường (Anomaly)</span>
              {filteredRecords.some((r) => r.cost_per_meal_anomaly) && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('risk')}
              className={`py-3 px-3 sm:px-1 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
                activeTab === 'risk'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Rủi ro & Cảnh báo HSD</span>
              {kpiData.highRiskCount > 0 && (
                <span className="text-[11px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-bold">
                  {kpiData.highRiskCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('raw')}
              className={`py-3 px-3 sm:px-1 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
                activeTab === 'raw'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Dữ liệu chi tiết</span>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                {filteredRecords.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <TabDashboard summary={summaries} records={filteredRecords} thresholds={thresholds} />
        )}

        {activeTab === 'trends' && (
          <TabTrends records={filteredRecords} allCanteens={allCanteens} />
        )}

        {activeTab === 'risk' && (
          <TabRiskMatrix records={filteredRecords} thresholds={thresholds} />
        )}

        {activeTab === 'raw' && (
          <TabRawData records={filteredRecords} onExportExcel={handleExportExcel} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Canteen Risk Analytics • Hệ thống quản trị định mức, rủi ro thu mua & an toàn thực phẩm
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Robust Z-Score Anomaly Engine</span>
            <span>•</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-indigo-600 hover:underline"
            >
              Hướng dẫn thuật toán
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
        onLoadSample={handleLoadSample}
      />

      <ThresholdSettings
        isOpen={isThresholdsOpen}
        onClose={() => setIsThresholdsOpen(false)}
        thresholds={thresholds}
        onChange={handleThresholdsChange}
      />

      <FormulaGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
