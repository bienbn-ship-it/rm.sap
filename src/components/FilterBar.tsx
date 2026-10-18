import React from 'react';
import { Search, Calendar, RotateCcw, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FilterBarProps {
  allCanteens: string[];
  selectedCanteens: string[];
  onToggleCanteen: (canteen: string) => void;
  onSelectAllCanteens: () => void;
  onClearCanteens: () => void;
  dateStart: string;
  dateEnd: string;
  onDateChange: (start: string, end: string) => void;
  riskFilter: string;
  onRiskFilterChange: (risk: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onResetAll: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  allCanteens,
  selectedCanteens,
  onToggleCanteen,
  onSelectAllCanteens,
  onClearCanteens,
  dateStart,
  dateEnd,
  onDateChange,
  riskFilter,
  onRiskFilterChange,
  searchQuery,
  onSearchChange,
  onResetAll,
  filteredCount,
  totalCount,
}) => {
  const { t } = useLanguage();

  const riskOptions = [
    { id: 'Tất cả', label: t.filterAll },
    { id: 'Thấp', label: t.filterLow },
    { id: 'Trung bình', label: t.filterMedium },
    { id: 'Cao', label: t.filterHigh },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 space-y-3.5">
      {/* Top row: Search, Date Range, Risk Level, Reset */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.filterSearchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>

        {/* Date & Risk filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date range */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateStart}
              onChange={(e) => onDateChange(e.target.value, dateEnd)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none"
            />
            <span className="text-slate-400">→</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => onDateChange(dateStart, e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none"
            />
          </div>

          {/* Risk Level Segmented */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {riskOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onRiskFilterChange(opt.id)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  riskFilter === opt.id
                    ? opt.id === 'Cao'
                      ? 'bg-rose-600 text-white shadow-xs font-semibold'
                      : opt.id === 'Trung bình'
                      ? 'bg-amber-500 text-white shadow-xs font-semibold'
                      : opt.id === 'Thấp'
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Reset Filters */}
          <button
            onClick={onResetAll}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title={t.filterReset}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canteen Pills Selector */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {t.filterCanteenSelect} ({selectedCanteens.length}/{allCanteens.length}):
            </span>
            <button
              onClick={onSelectAllCanteens}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {t.filterSelectAll}
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={onClearCanteens}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              {t.filterDeselectAll}
            </button>
          </div>
          <div className="text-xs text-slate-500">
            {t.filterShowing} <span className="font-bold text-slate-800">{filteredCount}</span> / {totalCount} {t.filterRecords}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {allCanteens.map((canteen) => {
            const isSelected = selectedCanteens.includes(canteen);
            return (
              <button
                key={canteen}
                onClick={() => onToggleCanteen(canteen)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                <span className="truncate max-w-[200px]">{canteen}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
