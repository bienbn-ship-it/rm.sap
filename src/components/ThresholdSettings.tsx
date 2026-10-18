import React from 'react';
import { X, RotateCcw, SlidersHorizontal, Check } from 'lucide-react';
import { RiskThresholds, DEFAULT_THRESHOLDS } from '../types/canteen';
import { useLanguage } from '../context/LanguageContext';

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
  const { language, t } = useLanguage();
  if (!isOpen) return null;

  const isKo = language === 'ko';

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
                {t.threshModalTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.threshModalDesc}
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
                  {isKo ? '메뉴 계획 대비 입고(GR) 초과율 (%)' : 'GR vượt kế hoạch Menu (%)'}
                </label>
                <p className="text-xs text-slate-500">
                  {isKo ? '입고 금액이 계획을 초과할 경우 리스크 20점 부과' : 'Cộng 20 điểm rủi ro khi giá trị nhập kho vượt kế hoạch'}
                </p>
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
                  {isKo ? '총 발주 대비 추가발주(PR3) 초과율 (%)' : 'PR3 / Tổng đặt hàng cao (%)'}
                </label>
                <p className="text-xs text-slate-500">
                  {isKo ? '계획 외 추가/긴급 발주가 임계치를 초과할 경우 리스크 20점 부과' : 'Cộng 20 điểm rủi ro khi đơn mua phát sinh ngoài kế hoạch vượt ngưỡng'}
                </p>
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
                    {isKo 
                      ? `재고 / 입고(GR) 과다 비율 (${thresholds.inventory_high}% ~ ${(thresholds.inventory_high / 100).toFixed(2)})`
                      : `Hệ số Tồn kho / GR cao (${thresholds.inventory_high}% ~ ${(thresholds.inventory_high / 100).toFixed(2)})`}
                  </label>
                  <p className="text-xs text-slate-500">
                    {isKo 
                      ? `기말 재고가 입고액의 ${(thresholds.inventory_high / 100).toFixed(2)}배를 초과 시 리스크 15점 부과`
                      : `Cộng 15 điểm rủi ro khi tồn cuối kỳ vượt quá ${(thresholds.inventory_high / 100).toFixed(2)} lần lượng nhập GR`}
                  </p>
                </div>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {(thresholds.inventory_high / 100).toFixed(2)} ({thresholds.inventory_high}%)
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
                    {isKo ? '재고 / 입고(GR) 과소 경고 (%)' : 'Tồn kho / GR quá thấp (%)'}
                  </label>
                  <p className="text-xs text-slate-500">
                    {isKo ? '안전 완충재고 부족 위험 시 리스크 8점 부과' : 'Cộng 8 điểm rủi ro khi thiếu hụt hàng dự phòng an toàn'}
                  </p>
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
                  {isKo ? '예정 식수 대비 오차 허용치 (%)' : 'Lệch suất ăn kế hoạch (%)'}
                </label>
                <p className="text-xs text-slate-500">
                  {isKo ? '실적 식수가 계획과 크게 벗어날 시 리스크 12점 부과' : 'Cộng 12 điểm rủi ro khi số suất confirm lệch kế hoạch vượt ngưỡng'}
                </p>
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
                  {isKo ? '매출 대비 입고액(GR) 비율 상한 (%)' : 'GR / Doanh thu cao (%)'}
                </label>
                <p className="text-xs text-slate-500">
                  {isKo ? '입고 비용 비율이 매출 이익률을 훼손할 시 리스크 15점 부과' : 'Cộng 15 điểm rủi ro khi tỷ lệ nhập hàng ăn mòn biên lợi nhuận'}
                </p>
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
                  {isKo ? '유통기한 임박 경고 기준 (일)' : 'Cảnh báo cận hạn (ngày)'}
                </label>
                <p className="text-xs text-slate-500">
                  {isKo ? '잔여 유통기한이 설정 일수 이하 시 15점 부과 (만료 시 25점)' : 'Cộng 15 điểm khi HSD ≤ số ngày này (+25 điểm nếu đã hết hạn)'}
                </p>
              </div>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {thresholds.expiry_warning_days} {isKo ? '일' : 'ngày'}
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
                  {isKo ? '1식당 재고 보유액 상한 (VNĐ/식)' : 'Tồn kho trên mỗi suất ăn cao (VNĐ/suất)'}
                </label>
                <p className="text-xs text-slate-500">
                  {isKo ? '1식당 재고 금액이 허용 기준을 초과할 경우 리스크 15점 부과' : 'Cộng 15 điểm rủi ro khi số tiền tồn kho/suất ăn vượt định mức cho phép'}
                </p>
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
            <span>{t.threshResetDefault}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{t.threshSave}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
