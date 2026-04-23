import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { adminCustomers, orders, restaurants, REWARDS_RATE } from '../data/mockData';

const GOLD     = [212, 175, 55];
const DARK     = [15, 15, 24];
const MID_GRAY = [100, 100, 110];
const LIGHT_BG = [245, 242, 235];

function fmt$(n) { return `$${n.toFixed(2)}`; }
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function generateReport(menuItems = []) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 40;

  /* ── Header ────────────────────────────────────────────────────── */
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 90, 'F');

  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('REWARDS', 40, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  doc.text('Program Performance Report', 40, 62);

  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  const now = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
  doc.text(`Generated: ${now}`, pageW - 40, 45, { align: 'right' });
  doc.text(`All restaurants · All-time`, pageW - 40, 62, { align: 'right' });

  y = 110;

  /* ── Summary metrics ───────────────────────────────────────────── */
  const totalMembers    = adminCustomers.length;
  const activeMembers   = adminCustomers.filter(c => c.status === 'active').length;
  const totalRevenue    = adminCustomers.reduce((s, c) => s + c.lifetimeSpend, 0);
  const rewardsIssued   = adminCustomers.reduce((s, c) => s + c.lifetimeEarned, 0);
  const rewardsOutstanding = adminCustomers.reduce((s, c) => s + c.rewardsBalance, 0);
  const rewardsRedeemed = rewardsIssued - rewardsOutstanding;
  const totalOrders     = adminCustomers.reduce((s, c) => s + c.orders, 0);
  const avgOrderValue   = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const estFoodCost     = totalRevenue * 0.30;
  const netAfterRewards = totalRevenue - rewardsRedeemed;
  const estGrossProfit  = totalRevenue - estFoodCost - rewardsRedeemed;

  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PROGRAM SUMMARY', 40, y);
  y += 6;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.line(40, y, 150, y);
  y += 20;

  const metrics = [
    ['Total Members',      String(totalMembers),        `${activeMembers} active`],
    ['Total Revenue',      fmt$(totalRevenue),          `${totalOrders} orders`],
    ['Avg Order Value',    fmt$(avgOrderValue),         `at ${REWARDS_RATE * 100}% earn rate`],
    ['Rewards Issued',     fmt$(rewardsIssued),         'all-time earned'],
    ['Rewards Redeemed',   fmt$(rewardsRedeemed),       'used by customers'],
    ['Rewards Outstanding', fmt$(rewardsOutstanding),   'pending redemption'],
    ['Est. Food Cost',     fmt$(estFoodCost),           '30% of revenue'],
    ['Est. Gross Profit',  fmt$(estGrossProfit),        'revenue − food − rewards'],
  ];

  autoTable(doc, {
    startY: y,
    body: metrics,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 8 },
    columnStyles: {
      0: { cellWidth: 180, textColor: MID_GRAY, fontStyle: 'normal' },
      1: { cellWidth: 120, textColor: DARK,     fontStyle: 'bold'   },
      2: { cellWidth: 'auto', textColor: MID_GRAY, fontSize: 9, fontStyle: 'italic' },
    },
    alternateRowStyles: { fillColor: LIGHT_BG },
  });

  y = doc.lastAutoTable.finalY + 30;

  /* ── Customers ─────────────────────────────────────────────────── */
  if (y > 650) { doc.addPage(); y = 40; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text('CUSTOMERS', 40, y);
  y += 6;
  doc.line(40, y, 150, y);
  y += 12;

  autoTable(doc, {
    startY: y,
    head: [['Name', 'Tier', 'Visits', 'Lifetime Spend', 'Rewards Earned', 'Balance', 'Status']],
    body: adminCustomers
      .sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)
      .map(c => [
        c.name,
        c.tier,
        String(c.orders),
        fmt$(c.lifetimeSpend),
        fmt$(c.lifetimeEarned),
        fmt$(c.rewardsBalance),
        c.status === 'active' ? 'Active' : 'Inactive',
      ]),
    theme: 'striped',
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT_BG },
    margin: { left: 40, right: 40 },
  });

  y = doc.lastAutoTable.finalY + 30;

  /* ── Revenue by restaurant ─────────────────────────────────────── */
  if (y > 650) { doc.addPage(); y = 40; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('REVENUE BY LOCATION', 40, y);
  y += 6;
  doc.line(40, y, 200, y);
  y += 12;

  const revenueByRestaurant = restaurants.map(r => {
    const restaurantOrders = orders.filter(o => o.restaurantId === r.id);
    const revenue  = restaurantOrders.reduce((s, o) => s + o.total, 0);
    const rewardsOut = restaurantOrders.reduce((s, o) => s + o.rewards, 0);
    return {
      name: r.name,
      orders: restaurantOrders.length,
      revenue, rewardsOut,
    };
  });

  autoTable(doc, {
    startY: y,
    head: [['Restaurant', 'Orders (sample)', 'Revenue', 'Rewards Paid']],
    body: revenueByRestaurant.map(r => [
      r.name,
      String(r.orders),
      fmt$(r.revenue),
      fmt$(r.rewardsOut),
    ]),
    theme: 'striped',
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT_BG },
    margin: { left: 40, right: 40 },
  });

  y = doc.lastAutoTable.finalY + 30;

  /* ── Top menu items ────────────────────────────────────────────── */
  if (y > 600) { doc.addPage(); y = 40; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOP MENU ITEMS (from sample orders)', 40, y);
  y += 6;
  doc.line(40, y, 280, y);
  y += 12;

  // Tally items across orders
  const itemTally = {};
  orders.forEach(o => {
    o.items.forEach(itemName => {
      itemTally[itemName] = (itemTally[itemName] || 0) + 1;
    });
  });

  const menuItemsIndex = new Map(menuItems.map(mi => [mi.name.toLowerCase(), mi]));

  const topItems = Object.entries(itemTally)
    .map(([name, qty]) => {
      const menuMatch = menuItemsIndex.get(name.toLowerCase());
      const price = menuMatch?.price ?? 15;
      return { name, qty, revenue: qty * price };
    })
    .sort((a, b) => b.qty - a.qty);

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Quantity Sold', 'Est. Revenue']],
    body: topItems.map(t => [t.name, String(t.qty), fmt$(t.revenue)]),
    theme: 'striped',
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT_BG },
    margin: { left: 40, right: 40 },
  });

  /* ── Footer on every page ──────────────────────────────────────── */
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MID_GRAY);
    doc.text('Rewards Program — Confidential', 40, doc.internal.pageSize.getHeight() - 20);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageW - 40,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'right' }
    );
  }

  /* ── Save ──────────────────────────────────────────────────────── */
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`rewards-report-${dateStr}.pdf`);
}
