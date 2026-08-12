import { formatIqd } from "./data.js";

const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char]);

export function makeInvoiceHtml(order) {
  const rows = order.items.map((item, index) => `<tr><td class="line-number">${index + 1}</td><td class="product"><span class="product-icon">${escapeHtml(item.icon)}</span>${escapeHtml(item.name)}</td><td>${item.quantity}</td><td>${formatIqd(item.sellPrice)}</td><td class="amount">${formatIqd(item.revenue)}</td></tr>`).join("");
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>فاتورة ${escapeHtml(order.shopName)}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #19324d; direction: rtl; font-family: Tahoma, Arial, sans-serif; font-size: 14px; line-height: 1.65; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .invoice { border: 1px solid #e7e1da; border-radius: 18px; overflow: hidden; }
      .header { min-height: 138px; color: #fff; background: #19324d; padding: 24px 27px; display: flex; justify-content: space-between; gap: 24px; position: relative; overflow: hidden; }
      .header::after { content: ""; position: absolute; width: 180px; height: 180px; left: -65px; bottom: -125px; border: 28px solid rgba(255,255,255,.08); border-radius: 50%; }
      .brand, .invoice-code { position: relative; z-index: 1; }
      .brand-row { display: flex; align-items: center; gap: 11px; }
      .mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; background: #d97745; font-size: 21px; font-weight: 800; }
      h1 { margin: 0; font-size: 22px; line-height: 1.3; }
      .brand p, .invoice-code p { margin: 3px 0 0; color: #d5e1eb; font-size: 12px; }
      .invoice-code { text-align: left; }
      .invoice-code strong { display: block; color: #fff0e7; font-size: 16px; }
      .body { padding: 23px 27px 27px; }
      .details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 11px; margin-bottom: 22px; }
      .detail { border: 1px solid #ece6df; border-radius: 11px; padding: 11px 13px; background: #fffdfb; }
      .detail small { display: block; color: #72808b; font-size: 11px; margin-bottom: 2px; }
      .detail b { font-size: 14px; color: #19324d; }
      table { width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; border: 1px solid #e7e1da; border-radius: 12px; }
      th { padding: 12px 11px; background: #edf2f5; color: #3c5366; font-size: 12px; text-align: right; white-space: nowrap; }
      td { padding: 13px 11px; text-align: right; border-top: 1px solid #eee8e2; }
      .line-number { color: #88949e; width: 36px; text-align: center; }
      .product { font-weight: 700; }
      .product-icon { margin-left: 7px; }
      .amount { color: #19324d; font-weight: 800; white-space: nowrap; }
      .summary { margin-top: 18px; padding: 17px 18px; background: linear-gradient(135deg, #19324d, #2b587b); color: #fff; border-radius: 13px; display: flex; align-items: center; justify-content: space-between; }
      .summary span { color: #d8e5ee; font-size: 13px; }
      .summary strong { font-size: 19px; color: #fff3ea; }
      .note { margin: 17px 0 0; padding: 12px 14px; color: #6b5849; background: #fff3e9; border-right: 4px solid #d97745; border-radius: 8px; }
      .footer { margin-top: 22px; padding-top: 15px; border-top: 1px dashed #d7d0c8; color: #71808a; font-size: 11px; display: flex; justify-content: space-between; gap: 16px; }
      @media print { body { font-size: 14px; } .invoice { border: 0; } }
    </style>
  </head>
  <body>
    <main class="invoice">
      <header class="header">
        <div class="brand"><div class="brand-row"><span class="mark">ب</span><div><h1>البركة للتوزيع</h1><p>فاتورة مبيعات وتوزيع</p></div></div></div>
        <div class="invoice-code"><strong>فاتورة #${escapeHtml(order.id.slice(-6).toUpperCase())}</strong><p>تاريخ الإصدار: ${escapeHtml(order.date)}</p></div>
      </header>
      <section class="body">
        <div class="details">
          <div class="detail"><small>المحل</small><b>${escapeHtml(order.shopName)}</b></div>
          <div class="detail"><small>المندوب المسؤول</small><b>${escapeHtml(order.representativeName || "غير محدد")}</b></div>
        </div>
        <table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="summary"><span>إجمالي المبيعات المستحقة</span><strong>${formatIqd(order.totalRevenue)}</strong></div>
        ${order.notes ? `<p class="note"><b>ملاحظات الطلب:</b> ${escapeHtml(order.notes)}</p>` : ""}
        <footer class="footer"><span>شكراً لتعاملكم مع البركة للتوزيع</span><span>هذه الفاتورة صادرة إلكترونياً</span></footer>
      </section>
    </main>
  </body>
</html>`;
}

export function printInvoice(order) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!printWindow) throw new Error("المتصفح منع نافذة الطباعة. اسمح بالنوافذ المنبثقة ثم حاول مجدداً.");
  printWindow.document.write(makeInvoiceHtml(order));
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => printWindow.print();
}

export async function shareInvoice(order) {
  const html = makeInvoiceHtml(order);
  const file = new File([html], `فاتورة-${order.shopName}-${order.date}.html`, { type: "text/html" });
  if (navigator.canShare?.({ files: [file] })) return navigator.share({ title: "فاتورة البركة للتوزيع", text: `فاتورة ${order.shopName} بتاريخ ${order.date}`, files: [file] });
  await navigator.clipboard.writeText(`فاتورة ${order.shopName}\nالإجمالي: ${formatIqd(order.totalRevenue)}`);
}
