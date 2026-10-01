import React from 'react';
import { X, RotateCcw, SlidersHorizontal, Check, AlertCircle } from 'lucide-react';
import { RiskThresholds, DEFAULT_THRESHOLDS } from '../types/canteen';

interface ThresholdSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: RiskThresholds;
  onChange: (newThresholds: RiskThresholds) => void;
}

export const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({
  isOpen,
  onClose,
  thresholds,
  onChange,
}) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof RiskThresholds, value: number) => {
    onChange({
      ...thresholds,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_THRESHOLDS });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ngưỡng Cảnh Báo & Chấm Điểm Rủi Ro
              </h3>
              <p className="text-xs text-slate-500">
                Điều chỉnh các mốc cảnh báo tự động cho toàn bộ hệ thống bếp ăn
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
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Threshold 1: GR over plan */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  GR vượt kế hoạch Menu (%)
                </label>
                <p className="text-xs text-slate-500">Cộng 20 điểm rủi ro khi giá trị nhập kho vượt kế hoạch</p>
              </div>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {thresholds.gr_over_plan_high}%
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={thresholds.gr_over_plan_high}
                onChange={(e) => handleChange('gr_over_plan_high', parseFloat(e.target.value) || 0)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="200"
                value={thresholds.gr_over_plan_high}
                onChange={(e) => handleChange('gr_over_plan_high', parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-sm text-center border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Threshold 2: PR3 High */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  PR3 / Tổng đặt hàng cao (%)
                </label>
                <p className="text-xs text-slate-500">Cộng 20 điểm rủi ro khi đơn mua phát sinh ngoài kế hoạch vượt ngưỡng</p>
              </div>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {thresholds.pr3_high}%
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={thresholds.pr3_high}
                onChange={(e) => handleChange('pr3_high', parseFloat(e.target.value) || 0)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={thresholds.pr3_high}
                onChange={(e) => handleChange('pr3_high', parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-sm text-center border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Threshold 3 & 4: Inventory High / Low */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Tồn kho / GR cao (%)
                  </label>
                  <p className="text-xs text-slate-500">Cộng 15 điểm rủi ro khi tồn đọng quá nhiều nguyên vật liệu</p>
                </div>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {thresholds.inventory_high}%
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={thresholds.inventory_high}
                  onChange={(e) => handleChange('inventory_high', parseFloat(e.target.value) || 0)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={thresholds.inventory_high}
                  onChange={(e) => handleChange('inventory_high', parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm text-center border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Tồn kho / GR quá thấp (%)
                  </label>
                  <p className="text-xs text-slate-500">Cộng 8 điểm rủi ro khi thiếu hụt hàng dự phòng an toàn</p>
                </div>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {thresholds.inventory_low}%
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={thresholds.inventory_low}
                  onChange={(e) => handleChange('inventory_low', parseFloat(e.target.value) || 0)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={thresholds.inventory_low}
                  onChange={(e) => handleChange('inventory_low', parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm text-center border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Threshold 5: Meal Gap */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Lệch suất ăn kế hoạch (%)
                </label>
                <p className="text-xs text-slate-500">Cộng 12 điểm rủi ro khi số suất confirm lệch kế hoạch vượt ngưỡng</p>
              </div>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {thresholds.meal_gap_high}%
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={thresholds.meal_gap_high}
                onChange={(e) => handleChange('meal_gap_high', parseFloat(e.target.value) || 0)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={thresholds.meal_gap_high}
                onChange={(e) => handleChange('meal_gap_high', parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-sm text-center border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Threshold 6: GR / Revenue */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  GR / Doanh thu cao (%)
                </label>
                <p className="text-xs text-slate-500">Cộng 15 điểm rủi ro khi tỷ lệ nhập hàng ăn mòn biên lợi nhuận</p>
              </div>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {thresholds.gr_revenue_high}%
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="10"
                max="90"
                step="1"
                value={thresholds.gr_revenue_high}
                onChange={(e) => handleChange('gr_revenue_high', parseFloat(e.target.value) || 0)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={thresholds.gr_revenue_high}
                onChange={(e) => handleChange('gr_revenue_high', parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-sm text-center border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Threshold 7: Expiry warning days */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Cảnh báo cận hạn (ngày)
                </label>
                <p className="text-xs text-slate-500">Cộng 15 điểm khi HSD ≤ số ngày này (+25 điểm nếu đã hết hạn)</p>
              </div>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {thresholds.expiry_warning_days} ngày
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1"
                max="90"
                step="1"
                value={thresholds.expiry_warning_days}
                onChange={(e) => handleChange('expiry_warning_days', parseInt(e.target.value, 10) || 1)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="180"
                value={thresholds.expiry_warning_days}
                onChange={(e) => handleChange('expiry_warning_days', parseInt(e.target.value, 10) || 1)}
                className="w-16 px-2 py-1 text-sm text-center border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Threshold 8: Inventory per Meal High */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Tồn kho trên mỗi suất ăn cao (VNĐ/suất)
                </label>
                <p className="text-xs text-slate-500">Cộng 15 điểm rủi ro khi số tiền tồn kho/suất ăn vượt định mức cho phép</p>
              </div>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {(thresholds.inventory_per_meal_high || 15000).toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="5000"
                max="40000"
                step="1000"
                value={thresholds.inventory_per_meal_high || 15000}
                onChange={(e) => handleChange('inventory_per_meal_high', parseFloat(e.target.value) || 15000)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <input
                type="number"
                min="1000"
                max="100000"
                step="1000"
                value={thresholds.inventory_per_meal_high || 15000}
                onChange={(e) => handleChange('inventory_per_meal_high', parseFloat(e.target.value) || 15000)}
                className="w-24 px-2 py-1 text-xs text-center border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Áp dụng ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
