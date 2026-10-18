import { CanteenRecord, CanteenSummary, RiskThresholds } from '../types/canteen';

export function safeDiv(a: number, b: number): number {
  if (b === 0 || isNaN(b) || isNaN(a) || !isFinite(b) || !isFinite(a)) {
    return 0;
  }
  return a / b;
}

export function parseNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const clean = String(val).replace(/,/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export function parseDate(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10);
  }
  // Try Excel numeric date
  if (typeof val === 'number' && val > 20000 && val < 60000) {
    const utc_days = Math.floor(val - 25569);
    const date_info = new Date(utc_days * 86400 * 1000);
    return date_info.toISOString().slice(0, 10);
  }
  const str = String(val).trim();
  // Handle DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return str.slice(0, 10);
}

function computeMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function computeMAD(arr: number[], median: number): number {
  if (arr.length === 0) return 0;
  const deviations = arr.map(v => Math.abs(v - median));
  return computeMedian(deviations);
}

/**
 * Robust Z-score anomaly detection per canteen
 * Rolling 14 periods, minimum 5 periods required
 * robust_z = 0.6745 * (s - median) / mad
 * anomaly = abs(robust_z) >= 3.5
 */
export function calculateAnomalies(records: CanteenRecord[]): CanteenRecord[] {
  // Group by canteen
  const groups: Record<string, CanteenRecord[]> = {};
  for (const r of records) {
    if (!groups[r.canteen]) groups[r.canteen] = [];
    groups[r.canteen].push(r);
  }

  const results: CanteenRecord[] = [];

  for (const canteen in groups) {
    const list = groups[canteen].sort((a, b) => a.date.localeCompare(b.date));

    for (let i = 0; i < list.length; i++) {
      const current = list[i];
      // Previous rolling 14 periods (excluding current index)
      const windowStart = Math.max(0, i - 14);
      const history = list.slice(windowStart, i).map(item => item.material_cost_per_meal);

      if (history.length >= 5) {
        const med = computeMedian(history);
        const mad = computeMAD(history, med);

        if (mad > 0) {
          const z = 0.6745 * (current.material_cost_per_meal - med) / mad;
          current.cost_per_meal_robust_z = Math.round(z * 100) / 100;
          current.cost_per_meal_anomaly = Math.abs(z) >= 3.5;
        } else {
          current.cost_per_meal_robust_z = 0;
          current.cost_per_meal_anomaly = false;
        }
      } else {
        current.cost_per_meal_robust_z = 0;
        current.cost_per_meal_anomaly = false;
      }
      results.push(current);
    }
  }

  return results;
}

/**
 * Score risk based on rules and custom thresholds
 */
export function scoreRisks(records: CanteenRecord[], thresholds: RiskThresholds): CanteenRecord[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // First sort by canteen & date to calculate meal_delta & gr_delta
  const groups: Record<string, CanteenRecord[]> = {};
  for (const r of records) {
    if (!groups[r.canteen]) groups[r.canteen] = [];
    groups[r.canteen].push(r);
  }

  const scored: CanteenRecord[] = [];

  for (const canteen in groups) {
    const list = groups[canteen].sort((a, b) => a.date.localeCompare(b.date));

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      let points = 0;
      const reasons: string[] = [];

      // Calculate coefficients
      item.inventory_to_gr_ratio = Math.round(safeDiv(item.ending_inventory_value, item.gr_value) * 100) / 100;
      item.inventory_to_gi_ratio = Math.round(safeDiv(item.ending_inventory_value, item.gi_value) * 100) / 100;

      // Rule 1: GR cao hơn kế hoạch
      if (item.gr_vs_plan_pct > thresholds.gr_over_plan_high) {
        points += 20;
        reasons.push('GR cao hơn kế hoạch');
      }

      // Rule 2: Tỷ lệ PR3 cao
      if (item.extra_order_pct > thresholds.pr3_high) {
        points += 20;
        reasons.push('Tỷ lệ PR3 cao');
      }

      // Rule 3: Tồn kho cao
      if (item.inventory_ratio_pct > thresholds.inventory_high) {
        points += 15;
        reasons.push('Tồn kho cao');
      }

      // Rule 4: Tồn kho quá thấp
      if (item.inventory_ratio_pct < thresholds.inventory_low && item.gr_value > 0) {
        points += 8;
        reasons.push('Tồn kho quá thấp');
      }

      // Rule 5: Lệch suất ăn kế hoạch
      if (Math.abs(item.meal_gap_pct) > thresholds.meal_gap_high) {
        points += 12;
        reasons.push('Số suất lệch kế hoạch');
      }

      // Rule 6: Chi phí/suất bất thường (Robust Z-score)
      if (item.cost_per_meal_anomaly) {
        points += 20;
        reasons.push('Chi phí/suất bất thường');
      }

      // Rule 7: Nhập hàng / doanh thu cao
      if (item.gr_per_revenue_pct > thresholds.gr_revenue_high) {
        points += 15;
        reasons.push('Nhập hàng/doanh thu cao');
      }

      // Rule 8: Giám sát quy trình đặt hàng PR3 vs Suất ăn (Suất ăn giảm nhưng PR3 tăng là bất thường)
      item.inventory_value_per_meal = Math.round(safeDiv(item.ending_inventory_value, item.confirmed_meals));
      if (thresholds.inventory_per_meal_high && item.inventory_value_per_meal > thresholds.inventory_per_meal_high) {
        points += 15;
        reasons.push(`Tồn kho/suất cao (${item.inventory_value_per_meal.toLocaleString('vi-VN')} ₫/suất)`);
      }

      item.pr3_meal_mismatch = false;
      if (i > 0) {
        const prev = list[i - 1];
        const mealDelta = prev.confirmed_meals > 0 ? (item.confirmed_meals - prev.confirmed_meals) / prev.confirmed_meals : 0;
        const pr3Delta = prev.pr3_value > 0 ? (item.pr3_value - prev.pr3_value) / prev.pr3_value : (item.pr3_value > 0 ? 1 : 0);
        const grDelta = prev.gr_value > 0 ? (item.gr_value - prev.gr_value) / prev.gr_value : 0;

        item.meal_delta_pct = Math.round(mealDelta * 1000) / 10;
        item.pr3_delta_pct = Math.round(pr3Delta * 1000) / 10;

        // Quy trình: nếu suất ăn giảm (> 2%) mà đơn hàng PR3 lại tăng (> 5% hoặc từ 0 tăng lên)
        const mealDecreased = mealDelta < -0.02;
        const pr3Increased = (item.pr3_value > prev.pr3_value * 1.05) || (prev.pr3_value === 0 && item.pr3_value > 0);

        if (mealDecreased && pr3Increased) {
          item.pr3_meal_mismatch = true;
          item.pr3_meal_mismatch_desc = `Suất ăn giảm ${Math.abs(item.meal_delta_pct)}% nhưng PR3 lại tăng ${item.pr3_delta_pct > 0 ? '+' + item.pr3_delta_pct + '%' : ''}`;
          points += 20;
          reasons.push(`Bất thường quy trình: ${item.pr3_meal_mismatch_desc}`);
        }

        // Nhập hàng không đồng biến với số suất
        const isMismatch = (mealDelta < -0.05 && grDelta > 0.05) || (mealDelta > 0.05 && grDelta < -0.05);
        if (isMismatch) {
          points += 15;
          reasons.push('Nhập hàng không đồng biến với số suất');
        }
      } else {
        // Ngày đầu kỳ: kiểm tra nếu suất ăn hụt kế hoạch nhưng PR3 vẫn cao bất thường
        if (item.meal_gap_pct < -0.05 && item.extra_order_pct > thresholds.pr3_high) {
          item.pr3_meal_mismatch = true;
          item.pr3_meal_mismatch_desc = `Suất ăn hụt ${Math.abs(item.meal_gap_pct)}% so với kế hoạch nhưng PR3 chiếm ${item.extra_order_pct}% tổng đơn`;
          points += 15;
          reasons.push(`Bất thường quy trình: ${item.pr3_meal_mismatch_desc}`);
        }
      }

      // Rule 9: Expiry date check
      if (item.expiry_date) {
        const expDate = new Date(item.expiry_date);
        if (!isNaN(expDate.getTime())) {
          expDate.setHours(0, 0, 0, 0);
          const diffDays = Math.round((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          item.days_to_expiry = diffDays;

          if (diffDays < 0) {
            points += 25;
            reasons.push('Nguyên liệu đã hết hạn');
          } else if (diffDays <= thresholds.expiry_warning_days) {
            points += 15;
            reasons.push('Nguyên liệu cận hạn');
          }
        }
      }

      const finalScore = Math.min(100, Math.max(0, points));
      item.risk_score = finalScore;
      item.risk_level = finalScore <= 29 ? 'Thấp' : finalScore <= 59 ? 'Trung bình' : 'Cao';
      item.risk_reason = reasons.join('; ');

      scored.push(item);
    }
  }

  return scored;
}

export function summarizeByCanteen(records: CanteenRecord[]): CanteenSummary[] {
  const groups: Record<string, CanteenRecord[]> = {};
  for (const r of records) {
    if (!groups[r.canteen]) groups[r.canteen] = [];
    groups[r.canteen].push(r);
  }

  const summaries: CanteenSummary[] = [];

  for (const canteen in groups) {
    const list = groups[canteen].sort((a, b) => a.date.localeCompare(b.date));
    const lastRecord = list[list.length - 1];

    let sumMenuPlan = 0;
    let sumPr1 = 0;
    let sumPr3 = 0;
    let sumGr = 0;
    let sumGi = 0;
    let sumPlannedMeals = 0;
    let sumConfirmedMeals = 0;
    let sumRevenue = 0;
    let sumRiskScore = 0;
    let highRiskCount = 0;
    let pr3MismatchCount = 0;

    for (const r of list) {
      sumMenuPlan += r.menu_plan_value;
      sumPr1 += r.pr1_value;
      sumPr3 += r.pr3_value;
      sumGr += r.gr_value;
      sumGi += r.gi_value;
      sumPlannedMeals += r.planned_meals;
      sumConfirmedMeals += r.confirmed_meals;
      sumRevenue += r.revenue;
      sumRiskScore += r.risk_score;
      if (r.risk_level === 'Cao') {
        highRiskCount++;
      }
      if (r.pr3_meal_mismatch) {
        pr3MismatchCount++;
      }
    }

    const totalOrder = sumPr1 + sumPr3;
    const avgRisk = list.length > 0 ? sumRiskScore / list.length : 0;
    const endingInventory = lastRecord ? lastRecord.ending_inventory_value : 0;
    const mealGap = sumConfirmedMeals - sumPlannedMeals;

    summaries.push({
      canteen,
      menu_plan_value: Math.round(sumMenuPlan),
      pr1_value: Math.round(sumPr1),
      pr3_value: Math.round(sumPr3),
      gr_value: Math.round(sumGr),
      gi_value: Math.round(sumGi),
      ending_inventory_value: Math.round(endingInventory),
      planned_meals: sumPlannedMeals,
      confirmed_meals: sumConfirmedMeals,
      revenue: Math.round(sumRevenue),
      total_order_value: Math.round(totalOrder),
      order_vs_plan_pct: Math.round(safeDiv(totalOrder - sumMenuPlan, sumMenuPlan) * 1000) / 10,
      extra_order_pct: Math.round(safeDiv(sumPr3, totalOrder) * 1000) / 10,
      inventory_ratio_pct: Math.round(safeDiv(endingInventory, sumGr) * 1000) / 10,
      inventory_to_gr_ratio: Math.round(safeDiv(endingInventory, sumGr) * 100) / 100,
      inventory_to_gi_ratio: Math.round(safeDiv(endingInventory, sumGi) * 100) / 100,
      material_cost_per_meal: Math.round(safeDiv(sumGi, sumConfirmedMeals)),
      inventory_value_per_meal: Math.round(safeDiv(endingInventory, sumConfirmedMeals)),
      meal_gap: mealGap,
      meal_gap_pct: Math.round(safeDiv(mealGap, sumPlannedMeals) * 1000) / 10,
      gr_per_revenue_pct: Math.round(safeDiv(sumGr, sumRevenue) * 1000) / 10,
      avg_risk_score: Math.round(avgRisk * 10) / 10,
      risk_level: avgRisk <= 29 ? 'Thấp' : avgRisk <= 59 ? 'Trung bình' : 'Cao',
      high_risk_days: highRiskCount,
      total_days: list.length,
      pr3_mismatch_count: pr3MismatchCount,
    });
  }

  return summaries.sort((a, b) => b.avg_risk_score - a.avg_risk_score);
}
