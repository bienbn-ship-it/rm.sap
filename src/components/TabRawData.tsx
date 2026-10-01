import React, { useState } from 'react';
import { CanteenRecord } from '../types/canteen';
import { Table, ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react';

interface TabRawDataProps {
  records: CanteenRecord[];
  onExportExcel: () => void;
}

export const TabRawData: React.FC<TabRawDataProps> = ({ records, onExportExcel }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [selectedRecord, setSelectedRecord] = useState<CanteenRecord | null>(null);

  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const paginated = records.slice(startIdx, startIdx + pageSize);

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
  };

  return (
    <div className="space-y-4">
      {/* Top action toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Table className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Toàn Bộ Dữ Liệu Nhật Ký Chi Tiết ({records.length} bản ghi)
            </h3>
            <p className="text-xs text-slate-500">
              Kiểm tra chi tiết từng dòng dữ liệu đầu vào và các chỉ số dẫn xuất đã tính toán
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <span>Dòng/trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={onExportExcel}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất toàn bộ ra Excel</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-3 py-2.5">Ngày</th>
                <th className="px-3 py-2.5">Canteen</th>
                <th className="px-3 py-2.5 text-right">Kế Hoạch Menu</th>
                <th className="px-3 py-2.5 text-right">PR1 Chuẩn</th>
                <th className="px-3 py-2.5 text-right">PR3 Phát Sinh</th>
                <th className="px-3 py-2.5 text-right">GR Nhập Kho</th>
                <th className="px-3 py-2.5 text-right">GI Xuất Kho</th>
                <th className="px-3 py-2.5 text-right">Tồn Kho Cuối</th>
                <th className="px-3 py-2.5 text-right">Suất Confirm</th>
                <th className="px-3 py-2.5 text-right">CP NVL/Suất</th>
                <th className="px-3 py-2.5 text-right font-bold text-indigo-950 bg-indigo-50/50">Tồn/Suất</th>
                <th className="px-3 py-2.5 text-center bg-rose-50/50 text-rose-950">QT PR3</th>
                <th className="px-3 py-2.5 text-center">Điểm Rủi Ro</th>
                <th className="px-3 py-2.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginated.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-800 whitespace-nowrap">
                    {r.canteen}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                    {formatVND(r.menu_plan_value)} ₫
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap text-slate-600">
                    {formatVND(r.pr1_value)} ₫
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                    <span className={r.pr3_value > 0 ? 'text-amber-600 font-semibold' : ''}>
                      {formatVND(r.pr3_value)} ₫
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap font-semibold text-blue-700">
                    {formatVND(r.gr_value)} ₫
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                    {formatVND(r.gi_value)} ₫
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap text-slate-600">
                    {formatVND(r.ending_inventory_value)} ₫
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    {r.confirmed_meals.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap font-bold text-slate-900">
                    {formatVND(r.material_cost_per_meal)} ₫
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap font-bold text-indigo-900 bg-indigo-50/20">
                    {formatVND(r.inventory_value_per_meal)} ₫
                  </td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap">
                    {r.pr3_meal_mismatch ? (
                      <span 
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300"
                        title={r.pr3_meal_mismatch_desc}
                      >
                        ⚠️ Vi phạm
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-normal">Chuẩn</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        r.risk_level === 'Cao'
                          ? 'bg-rose-100 text-rose-800'
                          : r.risk_level === 'Trung bình'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.risk_score} • {r.risk_level}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                      title="Xem chi tiết toàn bộ trường dữ liệu"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Hiển thị <span className="font-semibold text-slate-800">{startIdx + 1}</span> -{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(startIdx + pageSize, records.length)}
            </span>{' '}
            trong tổng số <span className="font-semibold text-slate-800">{records.length}</span> dòng
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row details modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Chi Tiết Bản Ghi Vận Hành
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedRecord.canteen} • Ngày {selectedRecord.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Kế hoạch Menu:</span>
                <span className="font-mono font-bold text-slate-800">{formatVND(selectedRecord.menu_plan_value)} ₫</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Tổng Đặt Hàng (PR1+PR3):</span>
                <span className="font-mono font-bold text-slate-800">{formatVND(selectedRecord.total_order_value)} ₫</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Nhập kho (GR):</span>
                <span className="font-mono font-bold text-blue-600">{formatVND(selectedRecord.gr_value)} ₫</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Xuất kho (GI):</span>
                <span className="font-mono font-bold text-indigo-600">{formatVND(selectedRecord.gi_value)} ₫</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Tồn kho cuối:</span>
                <span className="font-mono font-bold text-slate-800">{formatVND(selectedRecord.ending_inventory_value)} ₫</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Doanh thu:</span>
                <span className="font-mono font-bold text-emerald-600">{formatVND(selectedRecord.revenue)} ₫</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Suất ăn Confirm / Kế hoạch:</span>
                <span className="font-bold text-slate-800">
                  {selectedRecord.confirmed_meals} / {selectedRecord.planned_meals} ({selectedRecord.meal_gap_pct > 0 ? '+' : ''}{selectedRecord.meal_gap_pct}%)
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Chi phí NVL / Suất:</span>
                <span className="font-mono font-bold text-purple-600">{formatVND(selectedRecord.material_cost_per_meal)} ₫</span>
              </div>
              <div className="bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                <span className="text-indigo-800 block font-semibold">Tồn kho / Suất ăn:</span>
                <span className="font-mono font-bold text-indigo-900 text-sm">{formatVND(selectedRecord.inventory_value_per_meal)} ₫/suất</span>
              </div>
              {selectedRecord.pr3_meal_mismatch && (
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 col-span-2">
                  <span className="text-rose-900 font-bold block mb-1 text-xs">⚠️ Vi phạm quy trình đặt hàng PR3:</span>
                  <p className="text-rose-800 text-xs">{selectedRecord.pr3_meal_mismatch_desc}</p>
                </div>
              )}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 col-span-2">
                <span className="text-slate-500 block mb-1">Đánh giá rủi ro:</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    selectedRecord.risk_level === 'Cao'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedRecord.risk_level === 'Trung bình'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedRecord.risk_score} điểm • {selectedRecord.risk_level}
                  </span>
                  <span className="text-slate-600 font-medium">{selectedRecord.risk_reason || 'Bình thường'}</span>
                </div>
              </div>
              {selectedRecord.ingredient && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 col-span-2">
                  <span className="text-slate-500 block">Nguyên liệu & HSD:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedRecord.ingredient} • HSD: {selectedRecord.expiry_date} 
                    {selectedRecord.days_to_expiry !== undefined && ` (${selectedRecord.days_to_expiry} ngày)`}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
