import * as XLSX from 'xlsx';
import { CanteenRecord, CanteenSummary } from '../types/canteen';

export function exportAnalysisExcel(detail: CanteenRecord[], summary: CanteenSummary[], filename = 'canteen_risk_analysis.xlsx') {
  const wb = XLSX.utils.book_new();

  // 1. Dashboard_Canteen Sheet
  const summaryData = summary.map(s => ({
    'Canteen': s.canteen,
    'Kế hoạch Menu (VNĐ)': s.menu_plan_value,
    'PR1 Đặt chuẩn (VNĐ)': s.pr1_value,
    'PR3 Phát sinh (VNĐ)': s.pr3_value,
    'Tổng đặt hàng (VNĐ)': s.total_order_value,
    'GR Nhập kho (VNĐ)': s.gr_value,
    'GI Xuất kho (VNĐ)': s.gi_value,
    'Tồn kho cuối (VNĐ)': s.ending_inventory_value,
    'Suất kế hoạch': s.planned_meals,
    'Suất confirm': s.confirmed_meals,
    'Lệch suất': s.meal_gap,
    'Doanh thu (VNĐ)': s.revenue,
    'Đặt vs Kế hoạch (%)': s.order_vs_plan_pct,
    'Tỷ lệ PR3 (%)': s.extra_order_pct,
    'Tồn kho / GR (%)': s.inventory_ratio_pct,
    'Chi phí NVL / suất (VNĐ)': s.material_cost_per_meal,
    'Tồn kho / suất (VNĐ)': s.inventory_value_per_meal,
    'Lệch suất (%)': s.meal_gap_pct,
    'GR / Doanh thu (%)': s.gr_per_revenue_pct,
    'Điểm rủi ro TB': s.avg_risk_score,
    'Mức độ rủi ro': s.risk_level,
    'Số ngày rủi ro cao': s.high_risk_days,
    'Số ca vi phạm quy trình PR3': s.pr3_mismatch_count,
    'Tổng số ngày': s.total_days,
  }));
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Dashboard_Canteen');

  // 2. Chi_tiet Sheet
  const detailData = detail.map(d => ({
    'Ngày': d.date,
    'Canteen': d.canteen,
    'Kế hoạch Menu': d.menu_plan_value,
    'PR1': d.pr1_value,
    'PR3': d.pr3_value,
    'Tổng đặt': d.total_order_value,
    'GR Nhập': d.gr_value,
    'GI Xuất': d.gi_value,
    'Tồn kho cuối': d.ending_inventory_value,
    'Suất kế hoạch': d.planned_meals,
    'Suất confirm': d.confirmed_meals,
    'Doanh thu': d.revenue,
    'GR vs Kế hoạch (%)': d.gr_vs_plan_pct,
    'Tỷ lệ PR3 (%)': d.extra_order_pct,
    'Tồn kho / GR (%)': d.inventory_ratio_pct,
    'Chi phí NVL/suất (VNĐ)': d.material_cost_per_meal,
    'Tồn kho / suất (VNĐ)': d.inventory_value_per_meal,
    'Vi phạm quy trình PR3': d.pr3_meal_mismatch ? 'CÓ (BẤT THƯỜNG)' : 'KHÔNG',
    'Biến thiên suất ăn (%)': d.meal_delta_pct !== undefined ? d.meal_delta_pct : '',
    'Biến thiên PR3 (%)': d.pr3_delta_pct !== undefined ? d.pr3_delta_pct : '',
    'Chi tiết vi phạm quy trình': d.pr3_meal_mismatch_desc || '',
    'Z-Score Chi phí': d.cost_per_meal_robust_z ?? 0,
    'Bất thường chi phí': d.cost_per_meal_anomaly ? 'CÓ' : 'KHÔNG',
    'Lệch suất (%)': d.meal_gap_pct,
    'GR / Doanh thu (%)': d.gr_per_revenue_pct,
    'Điểm rủi ro': d.risk_score,
    'Mức rủi ro': d.risk_level,
    'Lý do cảnh báo': d.risk_reason,
    'Nguyên liệu': d.ingredient || '',
    'Hạn sử dụng': d.expiry_date || '',
    'Ngày tới hạn': d.days_to_expiry !== undefined ? d.days_to_expiry : '',
    'SL Tồn': d.inventory_qty || 0,
  }));
  const wsDetail = XLSX.utils.json_to_sheet(detailData);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Chi_tiet');

  // 3. Vi_Pham_Quy_Trinh_PR3 Sheet (Nếu có)
  const pr3Violations = detail.filter(d => d.pr3_meal_mismatch);
  if (pr3Violations.length > 0) {
    const violationData = pr3Violations.map(d => ({
      'Ngày': d.date,
      'Canteen': d.canteen,
      'Suất Confirm': d.confirmed_meals,
      'Biến thiên Suất (%)': d.meal_delta_pct !== undefined ? `${d.meal_delta_pct}%` : `${d.meal_gap_pct}% vs KH`,
      'Giá trị PR3 (VNĐ)': d.pr3_value,
      'Biến thiên PR3 (%)': d.pr3_delta_pct !== undefined ? `${d.pr3_delta_pct}%` : `${d.extra_order_pct}% tổng`,
      'Tồn kho cuối (VNĐ)': d.ending_inventory_value,
      'Tồn kho / suất (VNĐ)': d.inventory_value_per_meal,
      'Chi tiết cảnh báo vi phạm': d.pr3_meal_mismatch_desc || 'Suất ăn giảm nhưng PR3 tăng',
      'Điểm rủi ro': d.risk_score,
      'Mức độ rủi ro': d.risk_level
    }));
    const wsViolation = XLSX.utils.json_to_sheet(violationData);
    XLSX.utils.book_append_sheet(wb, wsViolation, 'Vi_Pham_Quy_Trinh_PR3');
  }

  // 4. Can_Het_Han Sheet
  const nearExpiry = detail.filter(d => d.days_to_expiry !== undefined && d.days_to_expiry <= 30);
  if (nearExpiry.length > 0) {
    const expiryData = nearExpiry.map(d => ({
      'Ngày ghi nhận': d.date,
      'Canteen': d.canteen,
      'Nguyên liệu': d.ingredient || 'N/A',
      'Hạn sử dụng': d.expiry_date || '',
      'Số ngày còn lại': d.days_to_expiry,
      'Trạng thái': (d.days_to_expiry ?? 0) < 0 ? 'ĐÃ HẾT HẠN' : 'CẬN HẠN',
      'SL Tồn kho': d.inventory_qty || 0,
      'Mức rủi ro': d.risk_level,
      'Lý do': d.risk_reason
    }));
    const wsExpiry = XLSX.utils.json_to_sheet(expiryData);
    XLSX.utils.book_append_sheet(wb, wsExpiry, 'Can_Het_Han');
  }

  XLSX.writeFile(wb, filename);
}

export function downloadSampleTemplate() {
  const wb = XLSX.utils.book_new();

  const templateRows = [
    {
      'date': '2026-09-01',
      'canteen': 'Canteen Nhà máy 1',
      'menu_plan_value': 45000000,
      'pr1_value': 42000000,
      'pr3_value': 4000000,
      'gr_value': 46500000,
      'gi_value': 44000000,
      'ending_inventory_value': 12000000,
      'planned_meals': 2200,
      'confirmed_meals': 2180,
      'revenue': 66000000,
      'ingredient': 'Thịt lợn nạc',
      'expiry_date': '2026-09-15',
      'inventory_qty': 150
    },
    {
      'date': '2026-09-02',
      'canteen': 'Canteen Nhà máy 1',
      'menu_plan_value': 45000000,
      'pr1_value': 40000000,
      'pr3_value': 8500000,
      'gr_value': 49000000,
      'gi_value': 46000000,
      'ending_inventory_value': 15000000,
      'planned_meals': 2200,
      'confirmed_meals': 2250,
      'revenue': 67500000,
      'ingredient': 'Gà đông lạnh',
      'expiry_date': '2026-09-05',
      'inventory_qty': 80
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Du_lieu_Canteen');
  XLSX.writeFile(wb, 'mau_du_lieu_canteen_risk.xlsx');
}
