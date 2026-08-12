export const STORAGE_KEY = "albaraka-web-data-v1";

export const defaultData = {
  shops: [
    { id: "shop-noor", name: "سوبرماركت النور", area: "الجانب الأيمن", phone: "", owner: "", location: "" },
    { id: "shop-rawan", name: "ميني ماركت روان", area: "الدواسة", phone: "", owner: "", location: "" },
  ],
  representatives: [{ id: "rep-moayad", name: "مؤيد", phone: "", area: "" }, { id: "rep-bakr", name: "بكر", phone: "", area: "" }],
  products: [
    { id: "juice-orange", name: "برتقال", category: "juice", icon: "🍊", cost: 3250, price: 4000 },
    { id: "juice-peach", name: "خوخ", category: "juice", icon: "🍑", cost: 3250, price: 4000 },
    { id: "cake-berry", name: "توت", category: "cake", icon: "🫐", cost: 4125, price: 4750 },
    { id: "cake-nutella", name: "نوتيلا", category: "cake", icon: "🍫", cost: 4125, price: 4750 },
  ],
  orders: [],
};

export function clone(value) { return JSON.parse(JSON.stringify(value)); }
export function loadLocalData() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(defaultData); } catch { return clone(defaultData); } }
export function saveLocalData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
export function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
export function today() { return new Date().toISOString().slice(0, 10); }
export function totals(items) { return items.reduce((sum, item) => ({ revenue: sum.revenue + item.revenue, cost: sum.cost + item.cost + (item.giftCost || 0) }), { revenue: 0, cost: 0 }); }
export function formatIqd(value) { return `${new Intl.NumberFormat("ar-IQ", { maximumFractionDigits: 0 }).format(Number(value || 0))} د.ع`; }
export function statusLabel(status) { return ({ pending: "قيد التوصيل", delivered: "مستلم", returned: "راجع" })[status] || "قيد التوصيل"; }
