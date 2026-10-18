import React from 'react';
import { X, BookOpen, Calculator } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FormulaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaGuideModal: React.FC<FormulaGuideModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  if (!isOpen) return null;

  const isKo = language === 'ko';

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
                {t.guideModalTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.guideModalSubtitle}
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
              <span>{t.guideSectionCore}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800 block text-xs">PR1 (Purchase Request 1)</span>
                <span className="text-slate-600 text-xs">
                  {isKo ? '식단 메뉴 및 표준 식재료 소요량에 따른 정기 발주 계획.' : 'Kế hoạch đặt hàng chuẩn theo thực đơn và định mức thực phẩm.'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800 block text-xs">PR3 (Purchase Request 3)</span>
                <span className="text-slate-600 text-xs">
                  {isKo ? '계획 외 돌발, 긴급 상황 발생 시 추가 발주하는 비정기 발주.' : 'Đơn đặt hàng phát sinh đột xuất, khẩn cấp ngoài kế hoạch menu.'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800 block text-xs">GR (Goods Receipt)</span>
                <span className="text-slate-600 text-xs">
                  {isKo ? '공급업체로부터 실제로 검수 입고 완료된 식재료 총 금액.' : 'Giá trị hàng hóa thực tế đã nhập kho và ký nhận từ nhà cung cấp.'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800 block text-xs">GI (Goods Issue)</span>
                <span className="text-slate-600 text-xs">
                  {isKo ? '식수 조리를 위해 창고에서 실제로 불출(소진)된 식재료 출고액.' : 'Giá trị nguyên vật liệu xuất kho phục vụ chế biến các ca ăn.'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Công thức tính toán */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-sm">{t.guideSectionRatios}</h4>
            <div className="space-y-2 font-mono text-xs bg-slate-900 text-slate-200 p-4 rounded-xl">
              <p>{isKo ? '• 총 발주금액 = PR1 + PR3' : '• Tổng đặt hàng = PR1 + PR3'}</p>
              <p>{isKo ? '• 추가발주(PR3) 비율 (%) = (PR3 / 총 발주금액) × 100' : '• Tỷ lệ PR3 (%) = (PR3 / Tổng đặt hàng) × 100'}</p>
              <p>{isKo ? '• GR 입고 초과율 (%) = ((GR - 메뉴계획) / 메뉴계획) × 100' : '• GR vượt kế hoạch (%) = ((GR - Kế hoạch Menu) / Kế hoạch Menu) × 100'}</p>
              <p className="text-emerald-300 font-semibold">
                {isKo ? '• 재고 / GR 계수 = 기말 재고액 / 총 입고액 (GR)' : '• Hệ số tồn kho / GR = Tồn kho cuối / GR'}
              </p>
              <p className="text-emerald-300 font-semibold">
                {isKo ? '• 재고 / GI 계수 = 기말 재고액 / 총 출고액 (GI)' : '• Hệ số tồn kho / GI = Tồn kho cuối / GI'}
              </p>
              <p>{isKo ? '• 1식당 식재료비 = GI 출고액 / 확정 식수' : '• Chi phí NVL / Suất = GI / Suất khách hàng confirm'}</p>
              <p>{isKo ? '• 1식당 재고액 = 기말 재고액 / 확정 식수' : '• Tồn kho / Suất = Tồn kho cuối / Suất khách hàng confirm'}</p>
              <p>{isKo ? '• 식수 차이율 (%) = ((확정 식수 - 계획 식수) / 계획 식수) × 100' : '• Độ lệch suất ăn (%) = ((Suất confirm - Suất kế hoạch) / Suất kế hoạch) × 100'}</p>
              <p>{isKo ? '• GR / 매출액 비율 (%) = (GR / 매출액) × 100' : '• GR / Doanh thu (%) = (GR / Doanh thu) × 100'}</p>
            </div>
            <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <p><strong>{isKo ? '📌 재고 계수 가이드:' : '📌 Hướng dẫn Hệ số Tồn kho:'}</strong></p>
              <p>• {t.guideInventoryGrDesc}</p>
              <p>• {t.guideInventoryGiDesc}</p>
            </div>
          </div>

          {/* Section 3: Thuật toán Robust Z-Score */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-sm">
              {isKo ? '3. Robust Z-Score 식단가 이상치(Anomaly) 탐지 알고리즘' : '3. Thuật Toán Phát Hiện Dị Biệt Chi Phí (Robust Z-Score)'}
            </h4>
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs space-y-1.5 text-slate-700">
              <p className="font-semibold text-indigo-900">
                {isKo ? '최근 14개 기간 이동 중앙값(Median) 및 중위절대편차(MAD) 기반:' : 'Áp dụng Trung vị (Median) và Độ lệch tuyệt đối trung vị (MAD - Median Absolute Deviation) trượt 14 kỳ gần nhất:'}
              </p>
              <p className="font-mono text-indigo-950 bg-white/70 p-2 rounded border border-indigo-200">
                Robust Z = 0.6745 × (Cost_per_meal - Median_14d) / MAD_14d
              </p>
              <p className="text-slate-600">
                {isKo 
                  ? '|Robust Z| ≥ 3.5 초과 시 통계적 이상치로 자동 분류하여 비정상 식재료비 스파이크를 경고합니다.' 
                  : 'Khi |Robust Z| ≥ 3.5, hệ thống tự động gắn nhãn "Chi phí/suất bất thường" do độ lệch quá lớn so với phân phối lịch sử của canteen đó.'}
              </p>
            </div>
          </div>

          {/* Section 4: Hệ thống chấm điểm */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-sm">{t.guideSectionRisk}</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 font-semibold text-slate-700">
                  <tr>
                    <th className="px-3 py-2">{isKo ? '위험 판정 항목' : 'Hành vi vi phạm'}</th>
                    <th className="px-3 py-2 text-center">{isKo ? '가산점' : 'Điểm cộng'}</th>
                    <th className="px-3 py-2">{isKo ? '관리상 의미' : 'Ý nghĩa quản trị'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">{isKo ? 'GR 입고 초과 (> 10%)' : 'GR cao hơn kế hoạch (>10%)'}</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+20</td>
                    <td className="px-3 py-2">{isKo ? '계획 메뉴 대비 과다 입고' : 'Nhập thừa hàng so với thực đơn dự tính'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">{isKo ? 'PR3 추가발주율 과다 (> 10%)' : 'Tỷ lệ PR3 cao (>10%)'}</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+20</td>
                    <td className="px-3 py-2">{isKo ? '긴급 소량 구매로 인한 단가 상승' : 'Quá nhiều đơn khẩn cấp, mua lẻ giá cao'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">{isKo ? '재고/GR 계수 과다 (> 0.20)' : 'Hệ số Tồn kho / GR cao (> 0.20)'}</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+15</td>
                    <td className="px-3 py-2">{isKo ? '입고 대비 기말 재고 과다, 운전자본 정체' : 'Tồn cuối kỳ vượt quá 20% lượng nhập, ứ đọng vốn lưu động'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">{isKo ? '재고/GR 계수 과소 (< 0.02)' : 'Hệ số Tồn kho / GR quá thấp (< 0.02)'}</td>
                    <td className="px-3 py-2 text-center font-bold text-amber-600">+8</td>
                    <td className="px-3 py-2">{isKo ? '완충 재고 결핍, 공급 단절 위험' : 'Thiếu đệm an toàn dự phòng, dễ đứt gãy cung ứng'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">{isKo ? '식수 예측 오차 (> 10%)' : 'Lệch suất ăn kế hoạch (>10%)'}</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+12</td>
                    <td className="px-3 py-2">{isKo ? '수요 예측 부정확' : 'Dự báo suất ăn thiếu chính xác'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-900">{isKo ? '1식당 식재료비 이상치' : 'Chi phí NVL / Suất bất thường'}</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+20</td>
                    <td className="px-3 py-2">{isKo ? '14일 이동 Z-Score 통계 이상치' : 'Dị biệt Z-Score theo lịch sử 14 kỳ'}</td>
                  </tr>
                  <tr className="bg-rose-50/40">
                    <td className="px-3 py-2 font-medium text-rose-900">{isKo ? '절차위반: 식수 감소 시 PR3 증가' : 'Vi phạm QT: Suất giảm nhưng PR3 tăng'}</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">+20</td>
                    <td className="px-3 py-2 text-rose-800">{isKo ? '식수 감소에도 PR3 발주가 증가하여 불필요한 재고 낭비 발생' : 'Suất ăn giảm mà đơn phát sinh PR3 tăng là bất thường gây tồn kho lãng phí'}</td>
                  </tr>
                  <tr className="bg-indigo-50/40">
                    <td className="px-3 py-2 font-medium text-indigo-950">{isKo ? '1식당 재고액 과다 (> 15,000 ₫)' : 'Tồn kho / Suất ăn cao (>15.000 ₫)'}</td>
                    <td className="px-3 py-2 text-center font-bold text-indigo-700">+15</td>
                    <td className="px-3 py-2 text-indigo-900">{isKo ? '1식당 배분 기말재고액이 안전 기준을 초과' : 'Giá trị tồn kho cuối kỳ quy đổi trên mỗi suất ăn vượt định mức an toàn'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs p-3 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700">{isKo ? '리스크 3단계 분류:' : 'Phân tầng rủi ro tổng hợp:'}</span>
              <div className="flex items-center space-x-2 font-bold">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{isKo ? '0 - 29: 안심' : '0 - 29: Thấp'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{isKo ? '30 - 59: 주의' : '30 - 59: Trung bình'}</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">{isKo ? '60 - 100: 경고' : '60 - 100: Cao'}</span>
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
            {t.guideClose}
          </button>
        </div>
      </div>
    </div>
  );
};
