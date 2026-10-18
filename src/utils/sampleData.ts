import { CanteenRecord } from '../types/canteen';
import { safeDiv } from './analytics';

export function generateSampleData(): CanteenRecord[] {
  const canteens = [
    { name: 'Canteen A - Welstory 1', baseMeals: 3200, mealPrice: 32000, baseCostPerMeal: 19500, riskTendency: 'low' },
    { name: 'Canteen B - Welstory 2', baseMeals: 2100, mealPrice: 28000, baseCostPerMeal: 17200, riskTendency: 'medium' },
    { name: 'Canteen C - Welstory 3', baseMeals: 1500, mealPrice: 30000, baseCostPerMeal: 18500, riskTendency: 'high' },
    { name: 'Canteen D - Welstory 4', baseMeals: 2800, mealPrice: 35000, baseCostPerMeal: 21000, riskTendency: 'low' },
    { name: 'Canteen E - Welstory 5', baseMeals: 1800, mealPrice: 30000, baseCostPerMeal: 18800, riskTendency: 'medium' },
  ];

  const ingredientsPool = [
    'Thịt nạc vai heo tươi CP',
    'Ức gà phi lê đông lạnh',
    'Cá basa phi lê xuất khẩu',
    'Trứng gà công nghiệp Ba Huân',
    'Rau cải ngọt an toàn VietGAP',
    'Gạo ST25 loại 1 đóng bao',
    'Dầu đậu nành Simply 25L',
    'Đậu phụ làng Mơ',
    'Gia vị hạt nêm Knorr 5kg',
    'Nước mắm Nam Ngư Đệ Nhị',
    'Bắp cải thảo Đà Lạt',
    'Thịt bò thăn Úc thái lát'
  ];

  const records: CanteenRecord[] = [];
  const daysCount = 20; // 20 working days

  // Today reference
  const now = new Date();

  canteens.forEach((site, siteIdx) => {
    let runningInventory = site.baseMeals * site.baseCostPerMeal * 0.35;

    for (let d = daysCount - 1; d >= 0; d--) {
      const dt = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      const dateStr = dt.toISOString().slice(0, 10);

      // Random factors based on site tendency
      let mealNoise = (Math.random() - 0.48) * 0.12; // +/- 6%
      let costSpike = 1.0;
      let pr3Ratio = 0.05 + Math.random() * 0.04;
      let grOverPlan = 1.0 + (Math.random() - 0.45) * 0.06;

      // Injects specific realistic operational risk scenarios
      if (site.riskTendency === 'high') {
        if (d === 3 || d === 4) {
          // Scenario: Suất ăn giảm đột ngột nhưng đơn phát sinh PR3 lại vọt tăng (Vi phạm quy trình nghiêm trọng)
          mealNoise = -0.18; // Suất giảm 18%
          pr3Ratio = 0.35;   // PR3 phát sinh tăng vọt 35% tổng đơn
          grOverPlan = 1.28;
        }
        if (d === 11 || d === 12) {
          // Scenario: Huge PR3 urgent orders & GR spike
          mealNoise = -0.12;
          pr3Ratio = 0.28;
          grOverPlan = 1.22;
        }
        if (d === 7 || d === 8) {
          // Scenario: Cost per meal huge anomaly (sudden procurement spike)
          costSpike = 1.45;
        }
        if (d === 1) {
          // Scenario: Meal count drop by 30% but GR increased
          mealNoise = -0.32;
          grOverPlan = 1.18;
          pr3Ratio = 0.25;
        }
      } else if (site.riskTendency === 'medium') {
        if (d === 5 || d === 14) {
          mealNoise = -0.10;
          pr3Ratio = 0.22; // Suất ăn giảm nhưng PR3 tăng
          grOverPlan = 1.12;
        }
        if (d === 10) {
          costSpike = 1.32;
        }
      }

      const plannedMeals = Math.round(site.baseMeals * (1 + (Math.random() - 0.5) * 0.05));
      const confirmedMeals = Math.round(plannedMeals * (1 + mealNoise));
      const revenue = confirmedMeals * site.mealPrice;

      // Planned food cost ~ 60% of revenue
      const menuPlanValue = Math.round(plannedMeals * site.baseCostPerMeal);

      // Total orders
      const totalOrderValue = Math.round(menuPlanValue * grOverPlan);
      const pr3Value = Math.round(totalOrderValue * pr3Ratio);
      const pr1Value = totalOrderValue - pr3Value;

      // GR (nhập kho)
      const grValue = Math.round(totalOrderValue * (0.98 + Math.random() * 0.04));

      // GI (xuất kho chế biến)
      const materialCostPerMealRaw = site.baseCostPerMeal * costSpike * (0.97 + Math.random() * 0.06);
      const giValue = Math.round(confirmedMeals * materialCostPerMealRaw);

      // Ending Inventory
      runningInventory = Math.max(site.baseCostPerMeal * 200, runningInventory + grValue - giValue);
      const endingInventoryValue = Math.round(runningInventory);

      // Expiry scenarios
      const ingName = ingredientsPool[(siteIdx + d) % ingredientsPool.length];
      let daysToExpiryVal = 15 + ((siteIdx * 7 + d * 5) % 60);
      if (site.riskTendency === 'high' && d === 2) {
        daysToExpiryVal = -3; // Expired!
      } else if (site.riskTendency === 'high' && d === 4) {
        daysToExpiryVal = 4; // Near expiry (< 7 days)
      } else if (site.riskTendency === 'medium' && d === 1) {
        daysToExpiryVal = 18; // Warning (< 30 days)
      }

      const expDate = new Date(dt.getTime() + daysToExpiryVal * 24 * 60 * 60 * 1000);

      const record: CanteenRecord = {
        id: `${site.name}_${dateStr}_${d}`,
        date: dateStr,
        canteen: site.name,
        menu_plan_value: menuPlanValue,
        pr1_value: pr1Value,
        pr3_value: pr3Value,
        gr_value: grValue,
        gi_value: giValue,
        ending_inventory_value: endingInventoryValue,
        planned_meals: plannedMeals,
        confirmed_meals: confirmedMeals,
        revenue: revenue,
        ingredient: ingName,
        expiry_date: expDate.toISOString().slice(0, 10),
        qty: Math.round(confirmedMeals * 0.15),
        inventory_qty: Math.round(confirmedMeals * 0.3),

        // Pre-kpis (will be fully scored by analytics pipeline)
        total_order_value: totalOrderValue,
        order_vs_plan_pct: Math.round(safeDiv(totalOrderValue - menuPlanValue, menuPlanValue) * 1000) / 10,
        extra_order_pct: Math.round(safeDiv(pr3Value, totalOrderValue) * 1000) / 10,
        gr_vs_plan_pct: Math.round(safeDiv(grValue - menuPlanValue, menuPlanValue) * 1000) / 10,
        inventory_ratio_pct: Math.round(safeDiv(endingInventoryValue, grValue) * 1000) / 10,
        inventory_to_gr_ratio: Math.round(safeDiv(endingInventoryValue, grValue) * 100) / 100,
        inventory_to_gi_ratio: Math.round(safeDiv(endingInventoryValue, giValue) * 100) / 100,
        material_cost_per_meal: Math.round(safeDiv(giValue, confirmedMeals)),
        inventory_value_per_meal: Math.round(safeDiv(endingInventoryValue, confirmedMeals)),
        meal_gap: confirmedMeals - plannedMeals,
        meal_gap_pct: Math.round(safeDiv(confirmedMeals - plannedMeals, plannedMeals) * 1000) / 10,
        gr_per_revenue_pct: Math.round(safeDiv(grValue, revenue) * 1000) / 10,
        gi_per_revenue_pct: Math.round(safeDiv(giValue, revenue) * 1000) / 10,
        risk_score: 0,
        risk_level: 'Thấp',
        risk_reason: '',
      };

      records.push(record);
    }
  });

  return records;
}
