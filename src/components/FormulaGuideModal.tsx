import React from 'react';
import { X, BookOpen, Calculator, ShieldCheck, AlertCircle } from 'lucide-react';

interface FormulaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaGuideModal: React.FC<FormulaGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cơ Sở Lý Thuyết & Công Thức Phân Tích
              </h3>
              <p className="text-xs text-slate-500">
                Quy chuẩn công thức và thuật toán đánh giá rủi ro vận hành canteen
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {/* Section 1: Thuật ngữ */}
          <div>
            <h4 className="font-bold text-slate-900 flex items-center space-x-2 mb-2 text-sm">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>1. Thuật ngữ & Chỉ số Lõi</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800 block text-xs">PR1 (Purchase Request 1)</span>
                <span className="text-slate-600 text-xs">Kế hoạch đặt hàng chuẩn theo thực đơn và định mức thực phẩm.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800 block text-xs">PR3 (Purchase Request 3)</span>
                <span className="text-slate-600 text-xs">Đơn đặt hàng phát sinh đột xuất, khẩn cấp ngoài kế hoạch menu.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800 block text-xs">GR (Goods Receipt)</span>
                <span className="text-slate-600 text-xs">Giá trị hàng hóa thực tế đã nhập kho và ký nhận từ nhà cung cấp.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800 block text-xs">GI (Goods Issue)</span>
                <span className="text-slate-600 text-xs">Giá trị nguyên vật liệu xuất kho phục vụ chế biến các ca ăn.</span>
              </div>
            </div>
          </div>

          {/* Section 2: Công thức tính toán */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-sm">2. Công Thức Đo Lường Vận Hành</h4>
            <div className="space-y-2 font-mono text-xs bg-slate-900 text-slate-200 p-4 rounded-xl">
              <p>• Tổng đặt hàng = PR1 + PR3</p>
              <p>• Tỷ lệ PR3 (%) = (PR3 / Tổng đặt hàng) × 100</p>
              <p>• GR vượt kế hoạch (%) = ((GR - Kế hoạch Menu) / Kế hoạch Menu) × 100</p>
              <p>• Tỷ lệ tồn kho (%) = (Tồn kho cuối / GR) × 100</p>
              <p>• Chi phí NVL / Suất = GI / Suất khách hàng confirm</p>
              <p>• Tồn kho / Suất = Tồn kho cuối / Suất khách hàng confirm</p>
              <p>• Độ lệch suất ăn (%) = ((Suất confirm - Suất kế hoạch) / Suất kế hoạch) × 100</p>
              <p>• GR / Doanh thu (%) = (GR / Doanh thu) × 100</p>
            </div>
          </div>

          {/* Section 3: Thuật toán Robust Z-Score */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-sm">3. Thuật Toán Phát Hiện Dị Biệt Chi Phí (Robust Z-Score)</h4>
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs space-y-1.5 text-slate-700">
              <p className="font-semibold text-indigo-900">
                Áp dụng Trung vị (Median) và Độ lệch tuyệt đối trung vị (MAD - Median Absolute Deviation) trượt 14 kỳ gần nhất:
              </p>
              <p className="font-mono text-indigo-950 bg-white/70 p-2 rounded border border-indigo-200">
                Robust Z = 0.6745 × (Chi phí suất hiện tại - Median_14kỳ) / MAD_14kỳ
              </p>
              <p className="text-slate-600">
                Khi <strong>|Robust Z| &ge; 3.5</strong>, hệ thống tự động gắn nhãn "Chi phí/suất bất thường" do độ lệch quá lớn so với phân phối lịch sử của canteen đó.
              </p>
            </div>
          </div>

          {/* Section 4: Hệ thống chấm điểm */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-sm">4. Trọng Số Chấm Điểm Rủi Ro (Thang điểm 0 - 100)</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 font-semibold text-slate-700">
                  <tr>
                    <th className="px-3 py-2">Hành vi vi phạm</th>
                    <th className="px-3 py-2 text-center">Điểm cộng</th>
                    <th className="px-3 py-2">Ý nghĩa quản trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">GR cao hơn kế hoạch (&gt;10%)</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+20</td>
                    <td className="px-3 py-2">Nhập thừa hàng so với thực đơn dự tính</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">Tỷ lệ PR3 cao (&gt;10%)</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+20</td>
                    <td className="px-3 py-2">Quá nhiều đơn khẩn cấp, mua lẻ giá cao</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">Tồn kho / GR cao (&gt;20%)</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+15</td>
                    <td className="px-3 py-2">Ứ đọng vốn lưu động, nguy cơ hỏng hóc</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">Tồn kho / GR quá thấp (&lt;2%)</td>
                    <td className="px-3 py-2 text-center font-bold text-amber-600">+8</td>
                    <td className="px-3 py-2">Thiếu hàng an toàn, dễ đứt gãy cung ứng</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">Lệch suất ăn kế hoạch (&gt;10%)</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+12</td>
                    <td className="px-3 py-2">Dự báo suất ăn thiếu chính xác</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">Chi phí NVL / Suất bất thường</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+20</td>
                    <td className="px-3 py-2">Dị biệt Z-Score theo lịch sử 14 kỳ</td>
                  </tr>
                  <tr className="bg-rose-50/40">
                    <td className="px-3 py-2 font-medium text-rose-900">Vi phạm QT: Suất giảm nhưng PR3 tăng</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+20</td>
                    <td className="px-3 py-2 text-rose-800">Suất ăn giảm mà đơn phát sinh PR3 tăng là bất thường gây tồn kho lãng phí</td>
                  </tr>
                  <tr className="bg-indigo-50/40">
                    <td className="px-3 py-2 font-medium text-indigo-950">Tồn kho / Suất ăn cao (&gt;15.000 ₫)</td>
                    <td className="px-3 py-2 text-center font-bold text-indigo-700">+15</td>
                    <td className="px-3 py-2 text-indigo-900">Giá trị tồn kho cuối kỳ quy đổi trên mỗi suất ăn vượt định mức an toàn</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">GR / Doanh thu cao (&gt;45%)</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+15</td>
                    <td className="px-3 py-2">Ăn mòn tỷ suất biên lợi nhuận của bếp</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">Nhập hàng không đồng biến số suất</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+15</td>
                    <td className="px-3 py-2">Suất ăn giảm mà nhập tăng hoặc ngược lại</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">Nguyên liệu đã hết hạn (HSD &lt; 0)</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-700">+25</td>
                    <td className="px-3 py-2">Rủi ro an toàn vệ sinh thực phẩm nghiêm trọng</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">Nguyên liệu cận hạn (&le; 30 ngày)</td>
                    <td className="px-3 py-2 text-center font-bold text-amber-600">+15</td>
                    <td className="px-3 py-2">Cần ưu tiên xuất dùng trước (FIFO)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs p-3 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700">Phân tầng rủi ro tổng hợp:</span>
              <div className="flex items-center space-x-2 font-bold">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">0 - 29: Thấp</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">30 - 59: Trung bình</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">60 - 100: Cao</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
