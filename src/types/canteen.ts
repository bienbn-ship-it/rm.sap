export interface RawRow {
  [key: string]: any;
}

export interface CanteenRecord {
  id: string;
  date: string; // YYYY-MM-DD
  canteen: string;
  menu_plan_value: number;
  pr1_value: number;
  pr3_value: number;
  gr_value: number;
  gi_value: number;
  ending_inventory_value: number;
  planned_meals: number;
  confirmed_meals: number;
  revenue: number;
  ingredient?: string;
  expiry_date?: string; // YYYY-MM-DD
  qty?: number;
  inventory_qty?: number;

  // Calculated KPIs
  total_order_value: number;
  order_vs_plan_pct: number;
  extra_order_pct: number;
  gr_vs_plan_pct: number;
  inventory_ratio_pct: number;
  inventory_to_gr_ratio: number;
  inventory_to_gi_ratio: number;
  material_cost_per_meal: number;
  inventory_value_per_meal: number;
  meal_gap: number;
  meal_gap_pct: number;
  gr_per_revenue_pct: number;
  gi_per_revenue_pct: number;

  // Anomaly & Process Compliance
  cost_per_meal_robust_z?: number;
  cost_per_meal_anomaly?: boolean;
  pr3_meal_mismatch?: boolean;
  meal_delta_pct?: number;
  pr3_delta_pct?: number;
  pr3_meal_mismatch_desc?: string;

  // Expiry
  days_to_expiry?: number;

  // Risk
  risk_score: number;
  risk_level: 'Thấp' | 'Trung bình' | 'Cao';
  risk_reason: string;
}

export interface CanteenSummary {
  canteen: string;
  menu_plan_value: number;
  pr1_value: number;
  pr3_value: number;
  gr_value: number;
  gi_value: number;
  ending_inventory_value: number;
  planned_meals: number;
  confirmed_meals: number;
  revenue: number;
  total_order_value: number;
  order_vs_plan_pct: number;
  extra_order_pct: number;
  inventory_ratio_pct: number;
  inventory_to_gr_ratio: number;
  inventory_to_gi_ratio: number;
  material_cost_per_meal: number;
  inventory_value_per_meal: number;
  meal_gap: number;
  meal_gap_pct: number;
  gr_per_revenue_pct: number;
  avg_risk_score: number;
  risk_level: 'Thấp' | 'Trung bình' | 'Cao';
  high_risk_days: number;
  total_days: number;
  pr3_mismatch_count: number;
}

export interface RiskThresholds {
  gr_over_plan_high: number;      // % GR vượt kế hoạch (default 10)
  pr3_high: number;               // % PR3 trên tổng đặt (default 10)
  inventory_high: number;         // % Tồn kho / GR cao (default 20)
  inventory_low: number;          // % Tồn kho / GR quá thấp (default 2)
  meal_gap_high: number;          // % Lệch suất kế hoạch (default 10)
  gr_revenue_high: number;        // % GR / Doanh thu cao (default 45)
  expiry_warning_days: number;    // Ngày cảnh báo cận hạn (default 30)
  inventory_per_meal_high: number; // Tiền tồn kho trên mỗi suất ăn cao (default 15,000 VNĐ)
}

export const DEFAULT_THRESHOLDS: RiskThresholds = {
  gr_over_plan_high: 10.0,
  pr3_high: 10.0,
  inventory_high: 20.0,
  inventory_low: 2.0,
  meal_gap_high: 10.0,
  gr_revenue_high: 45.0,
  expiry_warning_days: 30,
  inventory_per_meal_high: 15000,
};
