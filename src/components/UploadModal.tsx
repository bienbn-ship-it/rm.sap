import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Download,
  Sparkles
} from 'lucide-react';
import { REQUIRED_CORE, mapColumns } from '../utils/normalize';
import { downloadSampleTemplate } from '../utils/exportExcel';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (rows: any[], filename: string) => void;
  onLoadSample: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  onLoadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleFiles = (file: File) => {
    setErrorMsg(null);
    setMissingColumns([]);
    setDetectedColumns([]);
    setFileName(file.name);

    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const wb = XLSX.read(csvText, { type: 'string' });
          const firstSheet = wb.SheetNames[0];
          const raw = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet]);
          processData(raw, file.name);
        } catch (err: any) {
          setErrorMsg('Lỗi đọc file CSV: ' + (err.message || 'File không hợp lệ'));
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          setWorkbook(wb);
          setSheetNames(wb.SheetNames);
          const defaultSheet = wb.SheetNames[0];
          setSelectedSheet(defaultSheet);

          const raw = XLSX.utils.sheet_to_json(wb.Sheets[defaultSheet]);
          processData(raw, file.name);
        } catch (err: any) {
          setErrorMsg('Lỗi đọc file Excel: ' + (err.message || 'File không hợp lệ'));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSheetChange = (sheet: string) => {
    setSelectedSheet(sheet);
    if (workbook) {
      const raw = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
      processData(raw, fileName);
    }
  };

  const processData = (rawRows: any[], name: string) => {
    if (!rawRows || rawRows.length === 0) {
      setErrorMsg('File rỗng hoặc không có dòng dữ liệu hợp lệ.');
      return;
    }

    const headers = Object.keys(rawRows[0]);
    setDetectedColumns(headers);

    const { missing } = mapColumns(headers);
    if (missing.length > 0) {
      setMissingColumns(missing);
      setErrorMsg(`Thiếu ${missing.length} cột bắt buộc trong file dữ liệu.`);
      return;
    }

    // Success
    onDataLoaded(rawRows, name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nạp Dữ Liệu Bếp Ăn / Canteen
              </h3>
              <p className="text-xs text-slate-500">
                Hỗ trợ định dạng Excel (.xlsx, .xls) và file văn bản (.csv)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFiles(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFiles(e.target.files[0]);
                }
              }}
            />
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-inner">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Kéo & thả file vào đây, hoặc click để chọn file
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ tự động nhận diện cả tiếng Việt có dấu, không dấu và tiếng Anh
            </p>
          </div>

          {/* Sheet Selector if multi-sheet */}
          {sheetNames.length > 1 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                Chọn Sheet chứa dữ liệu trong file:
              </label>
              <select
                value={selectedSheet}
                onChange={(e) => handleSheetChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {sheetNames.map((name) => (
                  <option key={name} value={name}>
                    Sheet: {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Missing column error alert */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{errorMsg}</p>
                  {missingColumns.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-rose-900">Các cột còn thiếu:</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {missingColumns.map((col) => (
                          <span
                            key={col}
                            className="px-2 py-0.5 bg-rose-100 text-rose-900 rounded font-mono text-xs border border-rose-300"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {detectedColumns.length > 0 && (
                    <p className="mt-2 text-rose-700 text-xs">
                      Cột hiện có trong file: {detectedColumns.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Column Guideline Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>11 Cột lõi hệ thống tự động nhận diện:</span>
            </div>
            <p className="leading-relaxed">
              <strong>Ngày</strong> (date), <strong>Canteen</strong> (nha_an, site), <strong>Kế hoạch Menu</strong> (menu_plan_value), <strong>PR1</strong> (đặt chuẩn), <strong>PR3</strong> (đặt phát sinh), <strong>GR</strong> (nhập kho), <strong>GI</strong> (xuất kho), <strong>Tồn kho cuối</strong> (ending_inventory), <strong>Suất kế hoạch</strong> (planned_meals), <strong>Suất confirm</strong> (confirmed_meals), <strong>Doanh thu</strong> (revenue).
            </p>
            <p className="text-slate-500 pt-1 border-t border-slate-200">
              💡 <em>Khuyến nghị thêm các cột để kích hoạt cảnh báo HSD:</em> Nguyên liệu (ingredient), Hạn sử dụng (expiry_date), Số lượng tồn (inventory_qty).
            </p>
          </div>

          {/* Quick buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 flex items-center justify-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Tải file Excel mẫu (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onLoadSample();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 flex items-center justify-center space-x-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Dùng ngay dữ liệu mẫu (5 Canteen)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
