import React from 'react';
import { 
  Building2, 
  Upload, 
  Download, 
  SlidersHorizontal, 
  HelpCircle, 
  RefreshCw,
  Sparkles,
  Globe,
  Printer
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  onLoadSample: () => void;
  onOpenUpload: () => void;
  onOpenThresholds: () => void;
  onOpenGuide: () => void;
  onExportExcel: () => void;
  onOpenVisualReport?: () => void;
  onDownloadTemplate: () => void;
  hasData: boolean;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onOpenUpload,
  onOpenThresholds,
  onOpenGuide,
  onExportExcel,
  onOpenVisualReport,
  onDownloadTemplate,
  hasData,
  totalRecords,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Row 1: Brand & System Configurations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
            {/* Welstory Logo Container */}
            <div className="bg-white px-2 py-1 sm:py-1.5 rounded-lg border border-slate-700/60 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/wel.webp"
                alt="WELSTORY VIỆT NAM"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-wide text-white uppercase whitespace-nowrap">
                  {t.appName}
                </h1>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 whitespace-nowrap">
                  {t.appBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xl:block truncate max-w-md">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* System Control Buttons & Language Switcher */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Language Switcher Segmented Control */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80 shadow-xs">
              <button
                onClick={() => setLanguage('vi')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center space-x-1 ${
                  language === 'vi'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Giao diện Tiếng Việt"
              >
                <span>🇻🇳</span>
                <span className="hidden sm:inline font-mono">VI</span>
              </button>
              <button
                onClick={() => setLanguage('ko')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center space-x-1 ${
                  language === 'ko'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="한국어 인터페이스"
              >
                <span>🇰🇷</span>
                <span className="hidden sm:inline font-mono">KO</span>
              </button>
            </div>

            <button
              onClick={onOpenGuide}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors flex items-center space-x-1.5"
              title={t.btnGuide}
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">{t.btnGuide}</span>
            </button>

            <button
              onClick={onOpenThresholds}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors flex items-center space-x-1.5"
              title={t.btnThresholds}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">{t.btnThresholds}</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5 shadow-2xs"
              title={t.btnUpload}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t.btnUpload}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Dedicated Operational Actions & Export Toolbar */}
      <div className="bg-slate-950/80 border-t border-slate-800/90 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Operational Status Indicator */}
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-300 hidden sm:inline">
              {language === 'ko' ? '운영 현황 모니터링:' : 'Giám sát vận hành:'}
            </span>
            <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px] border border-slate-700/70">
              {totalRecords > 0 
                ? `${totalRecords.toLocaleString(language === 'ko' ? 'ko-KR' : 'vi-VN')} ${language === 'ko' ? '건 데이터' : 'bản ghi SAP'}`
                : (language === 'ko' ? '데이터 대기 중' : 'Chưa có dữ liệu')}
            </span>
          </div>

          {/* Right: Primary Export & Operational Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 ml-auto">
            {!hasData ? (
              <button
                onClick={onLoadSample}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.btnSampleData}</span>
              </button>
            ) : (
              <>
                {/* Visual Report Export Button */}
                {onOpenVisualReport && (
                  <button
                    onClick={onOpenVisualReport}
                    className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-sm shadow-orange-950/40 flex items-center space-x-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    title="Mở báo cáo điều hành hoàn chỉnh kèm biểu đồ trực quan"
                  >
                    <Printer className="w-3.5 h-3.5 text-orange-100" />
                    <span>{t.btnExportVisualReport}</span>
                  </button>
                )}

                {/* Excel Export Button */}
                <button
                  onClick={onExportExcel}
                  className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-2xs flex items-center space-x-1.5 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  title={t.btnExportExcel}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-100" />
                  <span>{t.btnExportExcel}</span>
                </button>

                {/* Reload Sample Data */}
                <button
                  onClick={onLoadSample}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1"
                  title={t.btnReloadSample}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline">{language === 'ko' ? '샘플 새로고침' : 'Nạp lại mẫu'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
