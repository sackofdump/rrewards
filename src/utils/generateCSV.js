import { adminCustomers, orders, restaurants } from '../data/mockData';

function csvEscape(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(rows) {
  return rows.map(row => row.map(csvEscape).join(',')).join('\n');
}

function download(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCustomersCSV() {
  const rows = [
    ['ID', 'Name', 'Email', 'Phone', 'Tier', 'Status', 'Member Since', 'Visits', 'Lifetime Spend', 'Lifetime Earned', 'Rewards Balance', 'Last Visit'],
    ...adminCustomers.map(c => [
      c.id, c.name, c.email, c.phone, c.tier, c.status, c.memberSince,
      c.orders, c.lifetimeSpend.toFixed(2), c.lifetimeEarned.toFixed(2),
      c.rewardsBalance.toFixed(2), c.lastVisit,
    ]),
  ];
  download(`customers-${new Date().toISOString().split('T')[0]}.csv`, toCSV(rows));
}

export function exportOrdersCSV() {
  const rows = [
    ['Order ID', 'Customer ID', 'Customer', 'Restaurant', 'Date', 'Items', 'Subtotal', 'Tax', 'Total', 'Rewards Earned', 'Server', 'Status'],
    ...orders.map(o => {
      const customer = adminCustomers.find(c => c.id === o.userId);
      const restaurant = restaurants.find(r => r.id === o.restaurantId);
      const itemStr = o.items.map(i => `${i.qty}x ${i.name}`).join('; ');
      return [
        o.id, o.userId, customer?.name ?? '', restaurant?.name ?? '', o.date,
        itemStr, o.subtotal.toFixed(2), o.tax.toFixed(2), o.total.toFixed(2),
        o.rewards.toFixed(2), o.server ?? '', o.status,
      ];
    }),
  ];
  download(`orders-${new Date().toISOString().split('T')[0]}.csv`, toCSV(rows));
}
