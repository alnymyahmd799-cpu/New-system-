const CATEGORY_MAP = {
  "عصير": "juice",
  "عصائر": "juice",
  juice: "juice",
  "كب كيك": "cake",
  cake: "cake",
  "منتج إضافي": "other",
  "منتجات أخرى": "other",
  other: "other",
};

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === "object") return Object.values(value).filter(Boolean);
  return [];
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function categoryFor(value) {
  return CATEGORY_MAP[String(value || "").trim()] || "other";
}

function categoryIcon(category) {
  return category === "juice" ? "🧃" : category === "cake" ? "🧁" : "📦";
}

function normalizeProduct(product, category, index) {
  return {
    id: String(product.id ?? `${category}-${index}`),
    name: product.name ?? product.type ?? "منتج بدون اسم",
    category,
    icon: product.icon ?? categoryIcon(category),
    cost: toNumber(product.cost ?? product.costPrice),
    price: toNumber(product.price ?? product.sellPrice),
    packetsPerCarton: toNumber(product.packetsPerCarton),
    piecesPerPacket: toNumber(product.piecesPerPacket),
  };
}

function normalizeItem(item, orderId, index) {
  const category = categoryFor(item.category);
  const quantity = toNumber(item.quantity ?? item.qty);
  const sellPrice = toNumber(item.sellPrice ?? item.price);
  const costPrice = toNumber(item.costPrice);
  const revenue = toNumber(item.revenue, quantity * sellPrice);
  const cost = toNumber(item.cost, quantity * costPrice);
  const giftCost = toNumber(item.giftCost);
  return {
    id: String(item.id ?? `${orderId}-item-${index}`),
    category,
    name: item.name ?? item.type ?? "منتج بدون اسم",
    icon: item.icon ?? categoryIcon(category),
    quantity,
    sellPrice,
    costPrice,
    unitLabel: category === "other" ? "كرتون" : "قطعة",
    revenue,
    cost,
    profit: toNumber(item.profit, revenue - cost - giftCost),
    hasGift: Boolean(item.hasGift),
    giftQty: toNumber(item.giftQty),
    giftType: item.giftType ?? "",
    giftCost,
  };
}

export function normalizeFirebaseData(remote) {
  const shops = asList(remote?.shops).map((shop, index) => ({
    id: String(shop.id ?? index),
    name: shop.name ?? "محل بدون اسم",
    area: shop.area ?? "",
    phone: shop.phone ?? "",
    owner: shop.owner ?? "",
    location: shop.location ?? "",
  }));
  const representatives = asList(remote?.reps ?? remote?.representatives).map((rep, index) => ({
    id: String(rep.id ?? index),
    name: rep.name ?? "مندوب بدون اسم",
    phone: rep.phone ?? "",
    area: rep.area ?? "",
  }));
  const products = [
    ...asList(remote?.juiceTypes).map((product, index) => normalizeProduct(product, "juice", index)),
    ...asList(remote?.cakeTypes).map((product, index) => normalizeProduct(product, "cake", index)),
    ...asList(remote?.otherTypes).map((product, index) => normalizeProduct(product, "other", index)),
  ];
  const orders = asList(remote?.orders).map((order, index) => {
    const id = String(order.id ?? index);
    const items = asList(order.items).map((item, itemIndex) => normalizeItem(item, id, itemIndex));
    const totalRevenue = toNumber(order.totalRevenue, items.reduce((sum, item) => sum + item.revenue, 0));
    const totalCost = toNumber(order.totalCost, items.reduce((sum, item) => sum + item.cost + item.giftCost, 0));
    return {
      id,
      shopId: String(order.shopId ?? ""),
      shopName: order.shopName ?? shops.find((shop) => shop.id === String(order.shopId))?.name ?? "محل غير محدد",
      representativeId: representatives.find((rep) => rep.name === order.repName)?.id ?? String(order.representativeId ?? ""),
      representativeName: order.repName ?? order.representativeName ?? "غير محدد",
      date: order.date ?? "",
      createdAt: order.createdAt ?? `${order.date ?? ""}T${order.time ?? "00:00"}:00`,
      notes: order.notes ?? "",
      status: order.status === "delivered" || order.status === "returned" ? order.status : "pending",
      deliveryDate: order.deliveryDate ?? null,
      items,
      totalRevenue,
      totalCost,
      totalProfit: toNumber(order.totalProfit, totalRevenue - totalCost),
    };
  });
  return { shops, representatives, products, orders };
}

function productsFor(data, category) {
  return data.products.filter((product) => product.category === category).map((product) => ({
    id: product.id,
    name: product.name,
    icon: product.icon,
    cost: product.cost,
    price: product.price,
    packetsPerCarton: product.packetsPerCarton || 0,
    piecesPerPacket: product.piecesPerPacket || 0,
  }));
}

export function serializeFirebaseData(data) {
  return {
    shops: data.shops,
    reps: data.representatives,
    orders: data.orders,
    juiceTypes: productsFor(data, "juice"),
    cakeTypes: productsFor(data, "cake"),
    otherTypes: productsFor(data, "other"),
  };
}

export function hasOriginalFirebaseData(remote) {
  return Boolean(remote && (remote.shops || remote.orders || remote.reps || remote.juiceTypes || remote.cakeTypes || remote.otherTypes));
}

export { asList };
