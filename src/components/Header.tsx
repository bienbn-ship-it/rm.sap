import React from 'react';
import { 
  Building2, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  SlidersHorizontal, 
  HelpCircle, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onOpenUpload: () => void;
  onOpenThresholds: () => void;
  onOpenGuide: () => void;
  onExportExcel: () => void;
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
  onDownloadTemplate,
  hasData,
  totalRecords,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Canteen Risk Analytics
                </h1>
                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.4 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Quản trị rủi ro Đặt hàng (PR1/PR3) • Nhập/Xuất/Tồn (GR/GI) • Suất ăn • Hạn sử dụng • Bất thường chi phí
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenGuide}
              className="p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors flex items-center space-x-1.5"
              title="Hướng dẫn công thức & logic tính toán"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span className="hidden lg:inline">Công thức & Logic</span>
            </button>

            <button
              onClick={onOpenThresholds}
              className="p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors flex items-center space-x-1.5"
              title="Cấu hình ngưỡng cảnh báo rủi ro"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Ngưỡng cảnh báo</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5 shadow-sm"
              title="Tải lên file Excel/CSV"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Nạp dữ liệu</span>
            </button>

            {!hasData ? (
              <button
                onClick={onLoadSample}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Xem dữ liệu mẫu</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onExportExcel}
                  className="px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
                  title="Xuất 3 sheet Excel phân tích"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Xuất Excel</span>
                </button>
                <button
                  onClick={onLoadSample}
                  className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60"
                  title="Tải lại bộ dữ liệu mẫu 5 Canteen"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
