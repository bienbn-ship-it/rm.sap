export function normCol(c: string | number): string {
  let str = String(c).trim().toLowerCase();
  
  const repl: Record<string, string> = {
    'đ': 'd', 'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
  };

  for (const [from, to] of Object.entries(repl)) {
    str = str.replaceAll(from, to);
  }

  const chars = [' ', '-', '/', '\\', '(', ')', '%', '.', ',', ':'];
  for (const ch of chars) {
    str = str.replaceAll(ch, '_');
  }

  while (str.includes('__')) {
    str = str.replaceAll('__', '_');
  }

  return str.replace(/^_+|_+$/g, '');
}

export const ALIASES: Record<string, string[]> = {
  date: ['date', 'ngay', 'posting_date', 'document_date', 'ngay_hach_toan', 'time', '일자', '날짜'],
  canteen: ['canteen', 'site', 'location', 'bep', 'nha_an', 'ma_canteen', 'ten_canteen', 'canteen_name', '급식소', '식당', '사업장', '급식소명', '식당명', '사업장명'],
  menu_plan_value: ['menu_plan_value', 'gia_tri_ke_hoach_menu', 'ke_hoach_menu', 'planned_food_value', 'menu_plan', 'ke_hoach', '메뉴계획', '메뉴계획액', '계획식재료비', '식단계획'],
  pr1_value: ['pr1_value', 'gia_tri_pr1', 'pr1', 'auto_pr1_value', 'pr1_cost', '정규발주', '정기발주', '표준발주', 'pr1금액'],
  pr3_value: ['pr3_value', 'gia_tri_pr3', 'pr3', 'extra_pr_value', 'pr3_cost', 'extra_pr', '추가발주', '긴급발주', '비정기발주', 'pr3금액'],
  gr_value: ['gr_value', 'gia_tri_gr', 'gr', 'nhap_kho', 'gia_tri_nhap_kho', 'goods_receipt', '입고', '입고액', '입고금액', '총입고'],
  gi_value: ['gi_value', 'gia_tri_gi', 'gi', 'xuat_kho', 'gia_tri_xuat_kho', 'goods_issue', 'cost_of_goods', '출고', '출고액', '출고금액', '식재료출고'],
  ending_inventory_value: ['ending_inventory_value', 'ton_kho_cuoi', 'ending_inventory', 'inventory_end', 'ton_cuoi_ky', 'gia_tri_ton', '기말재고', '기말재고액', '재고금액', '재고액'],
  planned_meals: ['planned_meals', 'suat_ke_hoach', 'so_suat_ke_hoach', 'menu_meals', 'ke_hoach_suat', '계획식수', '식수계획', '예상식수'],
  confirmed_meals: ['confirmed_meals', 'suat_confirm', 'so_suat_confirm', 'customer_confirmed_meals', 'suat_thuc_te', 'confirmed_count', '확정식수', '실적식수', '실제식수', '제공식수'],
  revenue: ['revenue', 'doanh_thu', 'sales', 'sales_value', 'tong_doanh_thu', '매출', '매출액', '총매출'],
  ingredient: ['ingredient', 'material', 'nguyen_lieu', 'ten_nguyen_lieu', 'item_name', 'mon_an', '식자재', '식재료', '품목', '식자재명', '원자재'],
  expiry_date: ['expiry_date', 'han_su_dung', 'hsd', 'expiration_date', 'ngay_het_han', '유통기한', '소비기한', '만료일'],
  qty: ['qty', 'quantity', 'so_luong', 'sl', '수량'],
  inventory_qty: ['inventory_qty', 'ton_sl', 'so_luong_ton', 'ending_inventory_qty', 'ton_kho_sl', '재고수량', '기말재고수량'],
};

export const REQUIRED_CORE = [
  'date', 'canteen', 'menu_plan_value', 'pr1_value', 'pr3_value',
  'gr_value', 'gi_value', 'ending_inventory_value',
  'planned_meals', 'confirmed_meals', 'revenue'
];

export function mapColumns(headers: string[]): { mapped: Record<string, string>; missing: string[] } {
  const normMap: Record<string, string> = {};
  for (const h of headers) {
    normMap[normCol(h)] = h;
  }

  const mapped: Record<string, string> = {};
  for (const [stdKey, aliases] of Object.entries(ALIASES)) {
    for (const alias of aliases) {
      if (normMap[alias]) {
        mapped[stdKey] = normMap[alias];
        break;
      }
    }
  }

  const missing = REQUIRED_CORE.filter(req => !mapped[req]);
  return { mapped, missing };
}
