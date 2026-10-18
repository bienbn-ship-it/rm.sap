import React, { createContext, useContext, useState } from 'react';

export type Language = 'vi' | 'ko';

export interface Translations {
  // Common / Header
  appName: string;
  appBadge: string;
  appSubtitle: string;
  btnGuide: string;
  btnThresholds: string;
  btnUpload: string;
  btnExportExcel: string;
  btnExportVisualReport: string;
  btnSampleData: string;
  btnReloadSample: string;
  langName: string;
  langSwitchTitle: string;
  
  // Navigation Tabs
  tabDashboard: string;
  tabTrends: string;
  tabRisk: string;
  tabRaw: string;

  // KPIs
  kpiTotalOrder: string;
  kpiTotalOrderDesc: string;
  kpiPr3Extra: string;
  kpiTotalGr: string;
  kpiGrVsPlan: string;
  kpiTotalGi: string;
  kpiEndingInventory: string;
  kpiInventoryRatioGr: string;
  kpiInventoryRatioGi: string;
  kpiInventoryRatioDesc: string;
  kpiTotalMeals: string;
  kpiMealGapDesc: string;
  kpiCostPerMeal: string;
  kpiInventoryPerMeal: string;
  kpiHighRiskCanteens: string;
  kpiCostAnomalies: string;
  kpiNormalState: string;

  // Filter Bar
  filterSearchPlaceholder: string;
  filterDateRange: string;
  filterAll: string;
  filterLow: string;
  filterMedium: string;
  filterHigh: string;
  filterCritical: string;
  filterSelectAll: string;
  filterDeselectAll: string;
  filterReset: string;
  filterShowing: string;
  filterOf: string;
  filterRecords: string;
  filterCanteenSelect: string;

  // TabDashboard Table
  tableCanteen: string;
  tableTotalOrder: string;
  tablePr3Extra: string;
  tableGr: string;
  tableGi: string;
  tableEndingInventory: string;
  tableCostPerMeal: string;
  tableInventoryPerMeal: string;
  tableInventoryRatioHeader: string;
  tableInventoryRatioTooltip: string;
  tablePr3Mismatch: string;
  tableMealGap: string;
  tableRiskLevel: string;
  tableAction: string;
  tableCases: string;
  tableDetailBtn: string;
  tableFilterCanteenPlaceholder: string;
  tableSortTooltip: string;

  // Heatmap
  heatmapTitle: string;
  heatmapSubtitle: string;
  heatmapMatrixTab: string;
  heatmapScatterTab: string;
  heatmapCriticalZone: string;
  heatmapOverstockZone: string;
  heatmapExtraOrderZone: string;
  heatmapOptimalZone: string;
  heatmapCriticalDesc: string;
  heatmapOverstockDesc: string;
  heatmapExtraOrderDesc: string;
  heatmapOptimalDesc: string;
  heatmapXAxis: string;
  heatmapYAxis: string;
  heatmapZAxis: string;
  heatmapClickHint: string;
  heatmapCloseModal: string;
  heatmapModalTitle: string;
  heatmapModalOverview: string;
  heatmapActionPlan: string;
  heatmapInventoryToGr: string;
  heatmapInventoryToGi: string;

  // TabTrends
  trendsTitle: string;
  trendsSubtitle: string;
  trendsCostPerMealOverTime: string;
  trendsPr1VsPr3: string;
  trendsMealPlanVsActual: string;
  trendsAnomalyBadge: string;
  trendsAnomalyDetected: string;

  // TabRiskMatrix
  riskTitle: string;
  riskSubtitle: string;
  riskScoreDistribution: string;
  riskExpiryWarnings: string;
  riskPr3Violations: string;
  riskTableTitle: string;
  riskFactorInventory: string;
  riskFactorPr3: string;
  riskFactorMealGap: string;
  riskFactorCost: string;

  // TabRawData
  rawTitle: string;
  rawSubtitle: string;
  rawExportBtn: string;
  rawDownloadTemplate: string;
  rawEmptyData: string;

  // Thresholds Modal
  threshModalTitle: string;
  threshModalDesc: string;
  threshInventoryRatio: string;
  threshPr3Extra: string;
  threshCostVariance: string;
  threshMealGap: string;
  threshSave: string;
  threshCancel: string;
  threshResetDefault: string;

  // Formula Guide Modal
  guideModalTitle: string;
  guideModalSubtitle: string;
  guideSectionCore: string;
  guideSectionRatios: string;
  guideInventoryGrFormula: string;
  guideInventoryGiFormula: string;
  guideInventoryGrDesc: string;
  guideInventoryGiDesc: string;
  guideSectionRisk: string;
  guideClose: string;

  // Upload Modal
  uploadModalTitle: string;
  uploadModalDesc: string;
  uploadDropText: string;
  uploadBrowse: string;
  uploadLoadSample: string;
  uploadRequiredCols: string;
  uploadTemplateDownload: string;

  // Footer
  footerCopyright: string;
  footerAlgorithm: string;
}

export const translations: Record<Language, Translations> = {
  vi: {
    appName: 'WELSTORY VIỆT NAM',
    appBadge: 'v2.4 Enterprise',
    appSubtitle: 'Quản trị rủi ro Đặt hàng (PR1/PR3) • Nhập/Xuất/Tồn (GR/GI) • Suất ăn • Hạn sử dụng • Bất thường chi phí',
    btnGuide: 'Công thức & Logic',
    btnThresholds: 'Ngưỡng cảnh báo',
    btnUpload: 'Nạp dữ liệu',
    btnExportExcel: 'Xuất Excel',
    btnExportVisualReport: 'Xuất Báo Cáo Kèm Biểu Đồ',
    btnSampleData: 'Xem dữ liệu mẫu',
    btnReloadSample: 'Tải lại dữ liệu mẫu',
    langName: 'Tiếng Việt',
    langSwitchTitle: 'Chuyển sang tiếng Hàn (한국어)',

    tabDashboard: 'Dashboard Canteen',
    tabTrends: 'Xu hướng & Bất thường',
    tabRisk: 'Rủi ro & Cảnh báo HSD',
    tabRaw: 'Dữ liệu chi tiết',

    kpiTotalOrder: 'Tổng Giá Trị Đặt Hàng',
    kpiTotalOrderDesc: 'PR1 (Kế hoạch) + PR3 (Phát sinh)',
    kpiPr3Extra: 'Đặt phát sinh (PR3)',
    kpiTotalGr: 'Tổng Nhập Kho (GR)',
    kpiGrVsPlan: 'so với đơn đặt',
    kpiTotalGi: 'Tổng Xuất Kho (GI)',
    kpiEndingInventory: 'Tồn Kho Cuối Kỳ',
    kpiInventoryRatioGr: 'Hệ số Tồn/GR',
    kpiInventoryRatioGi: 'Tồn/GI',
    kpiInventoryRatioDesc: 'Hệ số tồn kho thực tế so với nhập và xuất',
    kpiTotalMeals: 'Tổng Suất Ăn Thực Tế',
    kpiMealGapDesc: 'so với dự kiến',
    kpiCostPerMeal: 'Chi Phí NL / Suất',
    kpiInventoryPerMeal: 'Tồn Kho / Suất',
    kpiHighRiskCanteens: 'Canteen Nguy Cơ Cao',
    kpiCostAnomalies: 'Bất Thường Đột Biến',
    kpiNormalState: 'Bình thường',

    filterSearchPlaceholder: 'Tìm theo canteen, nguyên liệu, cảnh báo...',
    filterDateRange: 'Khoảng thời gian',
    filterAll: 'Tất cả',
    filterLow: 'Thấp',
    filterMedium: 'Trung bình',
    filterHigh: 'Cao',
    filterCritical: 'Nguy cấp',
    filterSelectAll: 'Chọn tất cả',
    filterDeselectAll: 'Bỏ chọn',
    filterReset: 'Đặt lại bộ lọc',
    filterShowing: 'Hiển thị',
    filterOf: 'trên tổng số',
    filterRecords: 'bản ghi',
    filterCanteenSelect: 'Chọn Canteen:',

    tableCanteen: 'Canteen',
    tableTotalOrder: 'Tổng Đặt',
    tablePr3Extra: 'PR3 Phát Sinh',
    tableGr: 'Nhập Kho (GR)',
    tableGi: 'Xuất Kho (GI)',
    tableEndingInventory: 'Tồn Cuối',
    tableCostPerMeal: 'Chi Phí / Suất',
    tableInventoryPerMeal: 'Tồn Kho / Suất',
    tableInventoryRatioHeader: 'Hệ số Tồn (GR / GI)',
    tableInventoryRatioTooltip: 'Hệ số Tồn kho/GR = Tồn kho cuối / GR | Hệ số Tồn kho/GI = Tồn kho cuối / GI',
    tablePr3Mismatch: 'Vi Phạm QT PR3',
    tableMealGap: 'Lệch Suất (%)',
    tableRiskLevel: 'Cấp Độ Rủi Ro',
    tableAction: 'Thao Tác',
    tableCases: 'Trường hợp',
    tableDetailBtn: 'Soi rủi ro',
    tableFilterCanteenPlaceholder: 'Tìm nhanh canteen...',
    tableSortTooltip: 'Nhấp để sắp xếp',

    heatmapTitle: 'Bản Đồ Nhiệt: Tương Quan Tồn Kho & Đặt Hàng Quá Mức',
    heatmapSubtitle: 'Trực quan hóa ma trận rủi ro tích lũy khi Canteen vừa ôm tồn kho cao vừa đặt hàng phát sinh PR3 lớn',
    heatmapMatrixTab: 'Ma trận nhiệt 4 Cấp độ',
    heatmapScatterTab: 'Biểu đồ phân tán (Scatter)',
    heatmapCriticalZone: 'RỦI RO TÍCH LŨY NGUY CẤP',
    heatmapOverstockZone: 'NGUY CƠ Ứ ĐỌNG KHO',
    heatmapExtraOrderZone: 'ĐẶT PHÁT SINH CAO',
    heatmapOptimalZone: 'KIỂM SOÁT TỐI ƯU',
    heatmapCriticalDesc: 'Tồn kho cao đồng thời PR3 phát sinh lớn. Rủi ro thất thoát kép nghiêm trọng.',
    heatmapOverstockDesc: 'Tồn kho vượt mức định mức nhưng kiểm soát đơn đặt hàng ổn định.',
    heatmapExtraOrderDesc: 'Tồn kho thấp nhưng đơn phát sinh PR3 liên tục cao bất thường.',
    heatmapOptimalDesc: 'Tồn kho và đơn hàng PR3 đều nằm trong ngưỡng an toàn.',
    heatmapXAxis: 'Tỷ lệ đơn phát sinh PR3 (%)',
    heatmapYAxis: 'Tỷ lệ tồn kho / GR (%)',
    heatmapZAxis: 'Điểm rủi ro tích lũy (0-100)',
    heatmapClickHint: 'Nhấp vào một ô hoặc điểm để xem chi tiết Canteen',
    heatmapCloseModal: 'Đóng',
    heatmapModalTitle: 'Hồ Sơ Rủi Ro Vận Hành Chi Tiết',
    heatmapModalOverview: 'Tổng quan chỉ số hoạt động',
    heatmapActionPlan: 'Khuyến nghị hành động kiểm soát',
    heatmapInventoryToGr: 'Hệ số Tồn/GR',
    heatmapInventoryToGi: 'Hệ số Tồn/GI',

    trendsTitle: 'Phân Tích Xu Hướng & Bất Thường (Anomaly Engine)',
    trendsSubtitle: 'Theo dõi biến động chi phí suất ăn, đơn phát sinh PR3 và sai lệch suất ăn theo thời gian',
    trendsCostPerMealOverTime: 'Chi phí nguyên liệu / suất ăn theo ngày',
    trendsPr1VsPr3: 'So sánh Đơn kế hoạch (PR1) vs Đơn phát sinh (PR3)',
    trendsMealPlanVsActual: 'So sánh Suất ăn Kế hoạch vs Thực tế',
    trendsAnomalyBadge: 'Bất thường Z-Score',
    trendsAnomalyDetected: 'Phát hiện điểm đột biến chi phí ngoài khoảng 3-Sigma',

    riskTitle: 'Ma Trận Rủi Ro & Cảnh Báo An Toàn Thực Phẩm',
    riskSubtitle: 'Đánh giá điểm rủi ro vận hành đa chiều và quản lý nguyên liệu cận hạn sử dụng (FEFO)',
    riskScoreDistribution: 'Phân bố cấp độ rủi ro các Canteen',
    riskExpiryWarnings: 'Cảnh báo nguyên liệu cận hạn sử dụng (≤ 7 ngày)',
    riskPr3Violations: 'Vi phạm quy trình PR3 (Suất giảm nhưng tăng đơn PR3)',
    riskTableTitle: 'Bảng xếp hạng rủi ro tổng hợp',
    riskFactorInventory: 'Rủi ro tồn kho',
    riskFactorPr3: 'Rủi ro đặt hàng PR3',
    riskFactorMealGap: 'Sai lệch suất ăn',
    riskFactorCost: 'Biến động chi phí',

    rawTitle: 'Dữ Liệu Chi Tiết Vận Hành',
    rawSubtitle: 'Toàn bộ hồ sơ giao dịch phát sinh: Đơn đặt hàng, Nhập/Xuất kho, Kiểm kê tồn và Suất ăn',
    rawExportBtn: 'Xuất Excel Phân Tích',
    rawDownloadTemplate: 'Tải File Mẫu (Excel)',
    rawEmptyData: 'Chưa có dữ liệu nào. Vui lòng tải lên file hoặc nhấn "Xem dữ liệu mẫu".',

    threshModalTitle: 'Cấu Hình Ngưỡng Cảnh Báo Rủi Ro',
    threshModalDesc: 'Điều chỉnh các tiêu chí định mức để hệ thống tự động phân loại rủi ro cho toàn bộ Canteen',
    threshInventoryRatio: 'Ngưỡng Tỷ lệ Tồn kho / GR (%)',
    threshPr3Extra: 'Ngưỡng Tỷ lệ Đặt hàng Phát sinh PR3 (%)',
    threshCostVariance: 'Ngưỡng Biến động Chi phí Nguyên liệu (%)',
    threshMealGap: 'Ngưỡng Chênh lệch Suất ăn Kế hoạch (%)',
    threshSave: 'Lưu cấu hình',
    threshCancel: 'Hủy bỏ',
    threshResetDefault: 'Khôi phục mặc định',

    guideModalTitle: 'Hướng Dẫn Phương Pháp & Công Thức Đo Lường Vận Hành',
    guideModalSubtitle: 'Chuẩn hóa định mức Quản trị Canteen theo phương pháp Kiểm soát Vận hành Chuyên sâu',
    guideSectionCore: '1. Khái Niệm Cốt Lõi',
    guideSectionRatios: '2. Công Thức Đo Lường Vận Hành',
    guideInventoryGrFormula: 'Hệ số Tồn kho / GR = (Tồn kho cuối / GR)',
    guideInventoryGiFormula: 'Hệ số Tồn kho / GI = (Tồn kho cuối / GI)',
    guideInventoryGrDesc: 'Đo lường mức độ tích lũy tồn kho so với tổng lượng nhập trong kỳ. Hệ số an toàn: 0.10 - 0.20.',
    guideInventoryGiDesc: 'Đo lường số ngày lưu kho đệm so với mức tiêu thụ xuất ăn thực tế. Hệ số cao phản ánh ứ đọng nguyên liệu so với tốc độ phục vụ.',
    guideSectionRisk: '3. Ma Trận Đánh Giá & Phân Loại Rủi Ro',
    guideClose: 'Đã hiểu & Đóng',

    uploadModalTitle: 'Nạp Dữ Liệu Hoạt Động Canteen',
    uploadModalDesc: 'Hỗ trợ tải lên tập tin Excel (.xlsx, .xls) hoặc CSV với cấu trúc cột chuẩn hóa',
    uploadDropText: 'Kéo thả file vào đây hoặc nhấp để chọn file',
    uploadBrowse: 'Chọn tập tin từ máy tính',
    uploadLoadSample: 'Hoặc nạp ngay dữ liệu mẫu (5 Canteen thực tế)',
    uploadRequiredCols: 'Các cột dữ liệu khuyến nghị:',
    uploadTemplateDownload: 'Tải tập tin Excel mẫu chuẩn',

    footerCopyright: 'WELSTORY VIỆT NAM • Hệ thống quản trị định mức, rủi ro thu mua & an toàn thực phẩm',
    footerAlgorithm: 'Thuật toán Phát hiện Anomaly Robust Z-Score',
  },
  ko: {
    appName: 'WELSTORY VIỆT NAM',
    appBadge: 'v2.4 엔터프라이즈',
    appSubtitle: '발주(PR1/PR3) · 입출고/재고(GR/GI) · 식수 · 유통기한 · 원가이상치 종합 리스크 분석',
    btnGuide: '산출 공식 및 가이드',
    btnThresholds: '위험 임계값 설정',
    btnUpload: '데이터 업로드',
    btnExportExcel: '엑셀 내보내기',
    btnExportVisualReport: '차트 포함 종합보고서 출력',
    btnSampleData: '샘플 데이터 보기',
    btnReloadSample: '샘플 데이터 새로고침',
    langName: '한국어',
    langSwitchTitle: 'Tiếng Việt로 변경',

    tabDashboard: '급식소 대시보드',
    tabTrends: '추세 및 이상치(Anomaly)',
    tabRisk: '리스크 및 유통기한 경고',
    tabRaw: '상세 원본 데이터',

    kpiTotalOrder: '총 발주금액',
    kpiTotalOrderDesc: 'PR1(정기) + PR3(추가/긴급)',
    kpiPr3Extra: '추가발주(PR3)',
    kpiTotalGr: '총 입고금액 (GR)',
    kpiGrVsPlan: '발주금액 대비',
    kpiTotalGi: '총 출고금액 (GI)',
    kpiEndingInventory: '기말 재고금액',
    kpiInventoryRatioGr: '재고/GR 계수',
    kpiInventoryRatioGi: '재고/GI 계수',
    kpiInventoryRatioDesc: '입고 및 출고 대비 기말 재고 보유 계수',
    kpiTotalMeals: '총 실적 식수',
    kpiMealGapDesc: '예정 식수 대비',
    kpiCostPerMeal: '1식당 식재료비',
    kpiInventoryPerMeal: '1식당 재고액',
    kpiHighRiskCanteens: '고위험 경고 급식소',
    kpiCostAnomalies: '원가 급변 이상치',
    kpiNormalState: '정상 상태',

    filterSearchPlaceholder: '급식소, 식재료, 경고 검색...',
    filterDateRange: '조회 기간',
    filterAll: '전체',
    filterLow: '안심(낮음)',
    filterMedium: '주의(보통)',
    filterHigh: '경고(높음)',
    filterCritical: '심각(위험)',
    filterSelectAll: '전체 선택',
    filterDeselectAll: '선택 해제',
    filterReset: '필터 초기화',
    filterShowing: '조회',
    filterOf: '전체',
    filterRecords: '건',
    filterCanteenSelect: '급식소 선택:',

    tableCanteen: '급식소명',
    tableTotalOrder: '총 발주액',
    tablePr3Extra: 'PR3 추가발주',
    tableGr: '입고액 (GR)',
    tableGi: '출고액 (GI)',
    tableEndingInventory: '기말 재고액',
    tableCostPerMeal: '1식당 재료비',
    tableInventoryPerMeal: '1식당 재고',
    tableInventoryRatioHeader: '재고 계수 (GR / GI)',
    tableInventoryRatioTooltip: '재고/입고(GR) 계수 = 기말재고 / GR | 재고/출고(GI) 계수 = 기말재고 / GI',
    tablePr3Mismatch: 'PR3 절차위반',
    tableMealGap: '식수 차이(%)',
    tableRiskLevel: '리스크 등급',
    tableAction: '상세분석',
    tableCases: '건',
    tableDetailBtn: '리스크 분석',
    tableFilterCanteenPlaceholder: '급식소 검색...',
    tableSortTooltip: '클릭하여 정렬',

    heatmapTitle: '히트맵: 재고율 및 추가발주 상관관계 분석',
    heatmapSubtitle: '재고 과다 누적과 PR3 추가/긴급발주 급증이 동시에 발생하는 복합 운영 리스크 시각화',
    heatmapMatrixTab: '4단계 복합 리스크 매트릭스',
    heatmapScatterTab: '산점도 분포 (Scatter Plot)',
    heatmapCriticalZone: '심각한 복합 누적 리스크',
    heatmapOverstockZone: '재고 과다 및 정체 위험',
    heatmapExtraOrderZone: '추가/긴급발주 과다 위험',
    heatmapOptimalZone: '안정적 최적 통제',
    heatmapCriticalDesc: '높은 재고율과 대량 추가발주가 동시 발생. 이중 손실 및 낭비 위험 심각.',
    heatmapOverstockDesc: '기준 대비 재고가 과다하나 발주는 정기 계획 내에서 통제됨.',
    heatmapExtraOrderDesc: '재고는 낮으나 계획 외 추가/긴급발주(PR3) 빈도가 비정상적으로 높음.',
    heatmapOptimalDesc: '재고 및 PR3 발주 비율이 모두 정상 안전 범위 내에서 통제됨.',
    heatmapXAxis: '추가발주(PR3) 비율 (%)',
    heatmapYAxis: '재고 / GR 비율 (%)',
    heatmapZAxis: '누적 리스크 점수 (0-100)',
    heatmapClickHint: '셀이나 포인트를 클릭하면 해당 급식소의 심층 분석이 열립니다',
    heatmapCloseModal: '닫기',
    heatmapModalTitle: '급식소 운영 리스크 심층 프로필',
    heatmapModalOverview: '주요 운영 지표 개요',
    heatmapActionPlan: '운영 개선 권고 조치',
    heatmapInventoryToGr: '재고/GR 계수',
    heatmapInventoryToGi: '재고/GI 계수',

    trendsTitle: '추세 및 이상치 분석 엔진 (Anomaly Engine)',
    trendsSubtitle: '식단가 변동, 정기 vs 추가발주 비교, 예정 vs 실적 식수 추이를 종합 모니터링',
    trendsCostPerMealOverTime: '일자별 1식당 식재료비 추이',
    trendsPr1VsPr3: '정기발주(PR1) vs 추가발주(PR3) 비교',
    trendsMealPlanVsActual: '예정 식수 vs 실적 식수 비교',
    trendsAnomalyBadge: 'Z-Score 이상치',
    trendsAnomalyDetected: '3-Sigma 범위를 벗어난 이상치(Spike)가 감지되었습니다',

    riskTitle: '리스크 매트릭스 및 식품 안전 경고',
    riskSubtitle: '다차원 운영 리스크 점수 평가 및 유통기한 임박 식재료(FEFO) 선제 관리',
    riskScoreDistribution: '급식소별 리스크 등급 분포',
    riskExpiryWarnings: '유통기한 임박 품목 경고 (≤ 7일)',
    riskPr3Violations: 'PR3 규정 위반 (식수 감소에도 추가발주 증가)',
    riskTableTitle: '급식소별 종합 리스크 평가 랭킹',
    riskFactorInventory: '재고 과다 리스크',
    riskFactorPr3: '추가발주 리스크',
    riskFactorMealGap: '식수 오차 리스크',
    riskFactorCost: '원가 변동 리스크',

    rawTitle: '상세 운영 원본 데이터',
    rawSubtitle: '발주, 입출고, 기말 재고, 식수 등 모든 거래 및 전표 데이터 원장',
    rawExportBtn: '분석 엑셀 내보내기',
    rawDownloadTemplate: '표준 엑셀 서식 다운로드',
    rawEmptyData: '데이터가 없습니다. 엑셀 파일을 업로드하거나 [샘플 데이터 보기]를 클릭하세요.',

    threshModalTitle: '위험 임계값 및 경고 기준 설정',
    threshModalDesc: '급식소별 리스크 판정 기준 파라미터를 맞춤 조정하여 시스템 자동 경고 수준을 변경합니다',
    threshInventoryRatio: '재고 / GR 임계 비율 (%)',
    threshPr3Extra: 'PR3 추가발주 허용 비율 (%)',
    threshCostVariance: '1식당 재료비 허용 변동률 (%)',
    threshMealGap: '예정 식수 대비 오차 허용률 (%)',
    threshSave: '설정 저장',
    threshCancel: '취소',
    threshResetDefault: '기본값 복원',

    guideModalTitle: '급식소 운영 관리 공식 및 산출 로직 가이드',
    guideModalSubtitle: '전문 단체급식 원가 및 재고 관리 방법론 표준화 가이드',
    guideSectionCore: '1. 핵심 관리 개념',
    guideSectionRatios: '2. 운영 측정 산출 공식',
    guideInventoryGrFormula: '재고 / GR 계수 = (기말 재고액 / 총 입고액)',
    guideInventoryGiFormula: '재고 / GI 계수 = (기말 재고액 / 총 출고액)',
    guideInventoryGrDesc: '해당 기간 총 입고액 대비 기말 재고 축적 수준을 측정합니다. 안전 계수 범위: 0.10 ~ 0.20.',
    guideInventoryGiDesc: '실제 식수 출고(소진) 속도 대비 완충 재고 보유 수준을 측정합니다. 계수가 높을 시 식재료 체류 및 정체 위험을 의미합니다.',
    guideSectionRisk: '3. 종합 리스크 평가 및 등급 기준',
    guideClose: '확인 및 닫기',

    uploadModalTitle: '급식소 운영 데이터 업로드',
    uploadModalDesc: '표준 컬럼 서식의 엑셀(.xlsx, .xls) 또는 CSV 파일을 업로드할 수 있습니다',
    uploadDropText: '파일을 이곳으로 드래그하거나 클릭하여 선택하세요',
    uploadBrowse: '내 컴퓨터에서 파일 선택',
    uploadLoadSample: '또는 5개 급식소 샘플 데이터 즉시 불러오기',
    uploadRequiredCols: '권장 데이터 컬럼 구성:',
    uploadTemplateDownload: '표준 엑셀 템플릿 다운로드',

    footerCopyright: 'WELSTORY VIỆT NAM • 급식소 리스크 분석 시스템 및 운영 관리 솔루션',
    footerAlgorithm: 'Robust Z-Score 이상치 탐지 엔진 가동 중',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  formatCurrency: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('canteen_app_lang');
      if (saved === 'ko' || saved === 'vi') return saved;
    } catch {
      // fallback
    }
    return 'vi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('canteen_app_lang', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'ko' : 'vi');
  };

  const t = translations[language];

  const formatCurrency = (amount: number): string => {
    if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
