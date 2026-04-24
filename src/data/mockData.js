export const REWARDS_RATE = 0.03;

export const restaurants = [
  { id: 1, name: 'Ember & Oak', cuisine: 'American Steakhouse', logo: '🥩' },
  { id: 2, name: 'Sakura Garden', cuisine: 'Japanese Fusion', logo: '🌸' },
  { id: 3, name: 'La Piazza', cuisine: 'Italian', logo: '🍝' },
  { id: 4, name: 'The Coastal', cuisine: 'Seafood', logo: '🦞' },
];

export const promotions = [
  {
    id: 1,
    restaurantId: 1,
    title: 'Double Rewards Weekend',
    description: 'Eat at Ember & Oak and receive 10% back on your entire bill.',
    rewardRate: 0.10,
    startDate: '2026-05-01',
    endDate: '2026-05-29',
    color: 'from-amber-700 to-amber-500',
    active: true,
  },
  {
    id: 2,
    restaurantId: 3,
    title: 'Pasta Tuesday',
    description: 'Every Tuesday at La Piazza earns you 6% back on all pasta dishes.',
    rewardRate: 0.06,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    color: 'from-red-800 to-red-600',
    active: true,
  },
];

export const currentUser = {
  id: 'u001',
  name: 'Josh',
  email: 'joshe@email.com',
  phone: '(555) 210-3847',
  memberSince: '2024-08-15',
  tier: 'Gold',
  rewardsBalance: 24.87,
  lifetimeSpend: 829.00,
  lifetimeEarned: 24.87,
};

// Full order records with datetime, items, quantities, subtotal, tax, total, rewards
export const orders = [
  // ── Josh (u001) — 5 orders ────────────────────────────────────────
  { id: 'ord-0081', userId: 'u001', restaurantId: 1, date: '2026-04-21T19:42', items: [
      { name: 'Ribeye Steak',   qty: 1, price: 62.00 },
      { name: 'Truffle Fries',  qty: 1, price: 12.00 },
      { name: 'House Salad',    qty: 1, price: 10.00 },
    ], subtotal: 84.00, tax: 3.50, total: 87.50, rewards: 2.63, server: 'Mike T.', status: 'completed',
  },
  { id: 'ord-0074', userId: 'u001', restaurantId: 2, date: '2026-04-14T20:15', items: [
      { name: 'Dragon Roll',    qty: 2, price: 18.00 },
      { name: 'Miso Soup',      qty: 1, price: 6.00 },
      { name: 'Edamame',        qty: 1, price: 7.00 },
    ], subtotal: 49.00, tax: 3.00, total: 52.00, rewards: 1.56, server: 'Sara K.', status: 'completed',
  },
  { id: 'ord-0063', userId: 'u001', restaurantId: 3, date: '2026-04-02T18:30', items: [
      { name: 'Fettuccine Alfredo', qty: 1, price: 22.00 },
      { name: 'Bruschetta',         qty: 2, price: 11.00 },
      { name: 'Tiramisu',           qty: 1, price: 11.00 },
    ], subtotal: 55.00, tax: 6.00, total: 61.00, rewards: 1.83, server: 'Ana R.', status: 'completed',
  },
  { id: 'ord-0055', userId: 'u001', restaurantId: 4, date: '2026-03-28T19:05', items: [
      { name: 'Lobster Bisque',     qty: 1, price: 14.00 },
      { name: 'Pan-Seared Salmon',  qty: 2, price: 32.00 },
      { name: 'Key Lime Pie',       qty: 1, price: 9.00 },
    ], subtotal: 87.00, tax: 7.00, total: 94.00, rewards: 2.82, server: 'Jordan L.', status: 'completed',
  },
  { id: 'ord-0047', userId: 'u001', restaurantId: 1, date: '2026-03-15T20:40', items: [
      { name: 'Filet Mignon',       qty: 1, price: 72.00 },
      { name: 'Caesar Salad',       qty: 2, price: 14.00 },
      { name: 'Crème Brûlée',       qty: 1, price: 11.00 },
    ], subtotal: 104.00, tax: 8.00, total: 112.00, rewards: 3.36, server: 'Mike T.', status: 'completed',
  },

  // ── Morgan (u002) — 4 orders ──────────────────────────────────────
  { id: 'ord-0082', userId: 'u002', restaurantId: 2, date: '2026-04-20T12:20', items: [
      { name: 'Chicken Ramen',      qty: 2, price: 16.00 },
      { name: 'Gyoza (6)',          qty: 1, price: 10.00 },
    ], subtotal: 42.00, tax: 3.00, total: 45.00, rewards: 1.35, server: 'Sara K.', status: 'completed',
  },
  { id: 'ord-0070', userId: 'u002', restaurantId: 3, date: '2026-04-10T19:15', items: [
      { name: 'Margherita Pizza',   qty: 1, price: 18.00 },
      { name: 'Calamari Fritti',    qty: 1, price: 15.00 },
    ], subtotal: 33.00, tax: 2.00, total: 35.00, rewards: 1.05, server: 'Ana R.', status: 'completed',
  },
  { id: 'ord-0058', userId: 'u002', restaurantId: 4, date: '2026-03-25T20:00', items: [
      { name: 'Clam Chowder',       qty: 2, price: 11.00 },
      { name: 'Grilled Swordfish',  qty: 1, price: 38.00 },
    ], subtotal: 60.00, tax: 5.00, total: 65.00, rewards: 1.95, server: 'Jordan L.', status: 'completed',
  },
  { id: 'ord-0041', userId: 'u002', restaurantId: 1, date: '2026-03-08T18:45', items: [
      { name: 'NY Strip',           qty: 1, price: 48.00 },
      { name: 'Mac & Cheese',       qty: 1, price: 13.00 },
      { name: 'Old Fashioned',      qty: 2, price: 16.00 },
    ], subtotal: 93.00, tax: 7.00, total: 100.00, rewards: 3.00, server: 'Mike T.', status: 'completed',
  },

  // ── Jordan (u003) — 6 orders (Platinum spender) ──────────────────
  { id: 'ord-0083', userId: 'u003', restaurantId: 1, date: '2026-04-22T20:30', items: [
      { name: 'Bone-In Ribeye',     qty: 2, price: 72.00 },
      { name: 'Oysters Rockefeller', qty: 1, price: 22.00 },
      { name: 'Creamed Spinach',    qty: 1, price: 11.00 },
      { name: 'Chocolate Lava Cake', qty: 2, price: 13.00 },
    ], subtotal: 203.00, tax: 16.00, total: 219.00, rewards: 6.57, server: 'Mike T.', status: 'completed',
  },
  { id: 'ord-0076', userId: 'u003', restaurantId: 4, date: '2026-04-15T19:50', items: [
      { name: 'Maine Lobster Roll', qty: 2, price: 32.00 },
      { name: 'Tuna Tartare',       qty: 1, price: 19.00 },
      { name: 'Whiskey Sour',       qty: 3, price: 15.00 },
    ], subtotal: 128.00, tax: 10.00, total: 138.00, rewards: 4.14, server: 'Jordan L.', status: 'completed',
  },
  { id: 'ord-0068', userId: 'u003', restaurantId: 3, date: '2026-04-05T21:00', items: [
      { name: 'Osso Buco',          qty: 1, price: 38.00 },
      { name: 'Burrata',            qty: 1, price: 16.00 },
      { name: 'Cannoli (2)',        qty: 2, price: 11.00 },
      { name: 'Aperol Spritz',      qty: 2, price: 14.00 },
    ], subtotal: 104.00, tax: 8.00, total: 112.00, rewards: 3.36, server: 'Ana R.', status: 'completed',
  },
  { id: 'ord-0061', userId: 'u003', restaurantId: 2, date: '2026-03-30T18:40', items: [
      { name: 'Omakase (9 pc)',     qty: 2, price: 62.00 },
      { name: 'Sake Flight',        qty: 1, price: 24.00 },
    ], subtotal: 148.00, tax: 11.00, total: 159.00, rewards: 4.77, server: 'Sara K.', status: 'completed',
  },
  { id: 'ord-0052', userId: 'u003', restaurantId: 1, date: '2026-03-22T19:20', items: [
      { name: 'Surf & Turf',        qty: 1, price: 89.00 },
      { name: 'Caesar Salad',       qty: 1, price: 14.00 },
    ], subtotal: 103.00, tax: 8.00, total: 111.00, rewards: 3.33, server: 'Mike T.', status: 'completed',
  },
  { id: 'ord-0039', userId: 'u003', restaurantId: 4, date: '2026-03-05T20:10', items: [
      { name: 'Cioppino',           qty: 1, price: 42.00 },
      { name: 'Oysters on the Half', qty: 1, price: 24.00 },
    ], subtotal: 66.00, tax: 5.00, total: 71.00, rewards: 2.13, server: 'Jordan L.', status: 'completed',
  },

  // ── Taylor (u004) — 2 orders ──────────────────────────────────────
  { id: 'ord-0067', userId: 'u004', restaurantId: 3, date: '2026-04-10T19:00', items: [
      { name: 'Cacio e Pepe',       qty: 1, price: 21.00 },
      { name: 'Burrata',            qty: 1, price: 16.00 },
    ], subtotal: 37.00, tax: 3.00, total: 40.00, rewards: 1.20, server: 'Ana R.', status: 'completed',
  },
  { id: 'ord-0042', userId: 'u004', restaurantId: 2, date: '2026-03-18T20:30', items: [
      { name: 'Tonkotsu Ramen',     qty: 2, price: 18.00 },
      { name: 'Mochi Ice Cream',    qty: 1, price: 8.00 },
    ], subtotal: 44.00, tax: 3.00, total: 47.00, rewards: 1.41, server: 'Sara K.', status: 'completed',
  },

  // ── Casey (u005) — 3 recent orders (inactive account) ───────────
  { id: 'ord-0033', userId: 'u005', restaurantId: 1, date: '2026-02-14T19:30', items: [
      { name: 'NY Strip',           qty: 2, price: 48.00 },
      { name: 'Mac & Cheese',       qty: 1, price: 13.00 },
    ], subtotal: 109.00, tax: 8.00, total: 117.00, rewards: 3.51, server: 'Mike T.', status: 'completed',
  },
  { id: 'ord-0027', userId: 'u005', restaurantId: 3, date: '2026-01-28T20:00', items: [
      { name: 'Lasagna della Nonna', qty: 1, price: 24.00 },
      { name: 'Calamari Fritti',    qty: 1, price: 15.00 },
    ], subtotal: 39.00, tax: 3.00, total: 42.00, rewards: 1.26, server: 'Ana R.', status: 'completed',
  },
  { id: 'ord-0018', userId: 'u005', restaurantId: 2, date: '2026-01-10T19:45', items: [
      { name: 'Spicy Tuna Roll',    qty: 3, price: 14.00 },
      { name: 'Seaweed Salad',      qty: 1, price: 8.00 },
    ], subtotal: 50.00, tax: 4.00, total: 54.00, rewards: 1.62, server: 'Sara K.', status: 'completed',
  },
];

export const adminCustomers = [
  {
    id: 'u001',
    name: 'Josh',
    email: 'joshe@email.com',
    phone: '(555) 210-3847',
    memberSince: '2024-08-15',
    tier: 'Gold',
    rewardsBalance: 24.87,
    lifetimeSpend: 829.00,
    lifetimeEarned: 24.87,
    orders: 5,
    lastVisit: '2026-04-21',
    status: 'active',
  },
  {
    id: 'u002',
    name: 'Morgan Chen',
    email: 'morgan.chen@email.com',
    phone: '(555) 384-9210',
    memberSince: '2025-01-03',
    tier: 'Silver',
    rewardsBalance: 11.20,
    lifetimeSpend: 373.00,
    lifetimeEarned: 11.20,
    orders: 9,
    lastVisit: '2026-04-20',
    status: 'active',
  },
  {
    id: 'u003',
    name: 'Jordan Blake',
    email: 'jordan.blake@email.com',
    phone: '(555) 901-4762',
    memberSince: '2024-11-22',
    tier: 'Platinum',
    rewardsBalance: 68.45,
    lifetimeSpend: 2281.67,
    lifetimeEarned: 68.45,
    orders: 28,
    lastVisit: '2026-04-22',
    status: 'active',
  },
  {
    id: 'u004',
    name: 'Taylor Nguyen',
    email: 'taylor.nguyen@email.com',
    phone: '(555) 627-0193',
    memberSince: '2025-03-10',
    tier: 'Bronze',
    rewardsBalance: 3.60,
    lifetimeSpend: 120.00,
    lifetimeEarned: 3.60,
    orders: 2,
    lastVisit: '2026-04-10',
    status: 'active',
  },
  {
    id: 'u005',
    name: 'Casey Williams',
    email: 'casey.williams@email.com',
    phone: '(555) 452-8847',
    memberSince: '2024-06-01',
    tier: 'Silver',
    rewardsBalance: 0.00,
    lifetimeSpend: 510.00,
    lifetimeEarned: 15.30,
    orders: 14,
    lastVisit: '2026-02-14',
    status: 'inactive',
  },
];

export const MENU_CATEGORIES = ['Appetizers', 'Entrees', 'Sides', 'Desserts', 'Drinks'];

export const initialMenuItems = [
  // Ember & Oak (steakhouse)
  { id: 1001, restaurantId: 1, name: 'Wagyu Ribeye',    price: 68.00, category: 'Entrees',    description: '12oz aged wagyu, house rub', available: true },
  { id: 1002, restaurantId: 1, name: 'Filet Mignon',    price: 52.00, category: 'Entrees',    description: '8oz center cut filet',        available: true },
  { id: 1003, restaurantId: 1, name: 'Truffle Fries',   price: 12.00, category: 'Sides',      description: 'Hand-cut, parmesan, truffle', available: true },
  { id: 1004, restaurantId: 1, name: 'House Salad',     price: 10.00, category: 'Appetizers', description: 'Mixed greens, vinaigrette',   available: true },
  { id: 1005, restaurantId: 1, name: 'Crème Brûlée',    price: 11.00, category: 'Desserts',   description: 'Classic vanilla bean',        available: true },

  // Sakura Garden (Japanese)
  { id: 2001, restaurantId: 2, name: 'Dragon Roll',     price: 18.00, category: 'Entrees',    description: 'Eel, cucumber, avocado',      available: true },
  { id: 2002, restaurantId: 2, name: 'Miso Soup',       price: 6.00,  category: 'Appetizers', description: 'Tofu, scallions, wakame',     available: true },
  { id: 2003, restaurantId: 2, name: 'Edamame',         price: 7.00,  category: 'Appetizers', description: 'Sea salt',                    available: true },
  { id: 2004, restaurantId: 2, name: 'Chicken Ramen',   price: 16.00, category: 'Entrees',    description: 'Shoyu broth, soft egg',       available: true },

  // La Piazza (Italian)
  { id: 3001, restaurantId: 3, name: 'Fettuccine Alfredo', price: 22.00, category: 'Entrees',    description: 'Housemade pasta, cream sauce', available: true },
  { id: 3002, restaurantId: 3, name: 'Bruschetta',         price: 11.00, category: 'Appetizers', description: 'Tomato, basil, grilled bread', available: true },
  { id: 3003, restaurantId: 3, name: 'Tiramisu',           price: 10.00, category: 'Desserts',   description: 'Classic mascarpone',           available: true },
  { id: 3004, restaurantId: 3, name: 'Margherita Pizza',   price: 18.00, category: 'Entrees',    description: 'San Marzano, fresh mozz',      available: true },

  // The Coastal (Seafood)
  { id: 4001, restaurantId: 4, name: 'Lobster Bisque',   price: 14.00, category: 'Appetizers', description: 'Cream, sherry, chives',      available: true },
  { id: 4002, restaurantId: 4, name: 'Pan-Seared Salmon', price: 32.00, category: 'Entrees',    description: 'Atlantic salmon, lemon butter', available: true },
  { id: 4003, restaurantId: 4, name: 'Key Lime Pie',      price: 9.00,  category: 'Desserts',   description: 'Graham crust, whipped cream',  available: true },
];

export const staffAccounts = [
  { id: 's001', name: 'Mike T.', email: 'staff@rewards.com',  role: 'staff', restaurantId: 1, password: 'staff123' },
  { id: 's002', name: 'Sara K.', email: 'sara@rewards.com',   role: 'staff', restaurantId: 2, password: 'staff123' },
];

export const adminAccount = {
  id: 'a001', name: 'Admin', email: 'admin@rewards.com', role: 'admin', password: 'admin123',
};

export const devAdminAccount = {
  id: 'dev001', name: 'Dev', email: 'dev@rewards.com', role: 'devadmin', password: 'boobies04',
};

export const restaurantDetails = [
  {
    id: 1, name: 'Ember & Oak', cuisine: 'American Steakhouse', logo: '🥩',
    address: '142 Grill St, Downtown', phone: '(555) 100-2233',
    hours: 'Mon–Thu 11am–10pm · Fri–Sat 11am–11pm · Sun 12pm–9pm',
    description: 'Wood-fired steaks and seasonal American fare in an intimate setting.',
    rating: 4.8, reviews: 312,
  },
  {
    id: 2, name: 'Sakura Garden', cuisine: 'Japanese Fusion', logo: '🌸',
    address: '88 Blossom Ave, Midtown', phone: '(555) 200-4455',
    hours: 'Daily 12pm–10pm',
    description: 'Modern Japanese flavors meet traditional technique — sushi, ramen, and more.',
    rating: 4.7, reviews: 204,
  },
  {
    id: 3, name: 'La Piazza', cuisine: 'Italian', logo: '🍝',
    address: '31 Cobblestone Ln, West End', phone: '(555) 300-6677',
    hours: 'Tue–Sun 5pm–10pm · Closed Monday',
    description: 'Handmade pasta, wood-fired pizza, and an extensive Italian wine list.',
    rating: 4.9, reviews: 489,
  },
  {
    id: 4, name: 'The Coastal', cuisine: 'Seafood', logo: '🦞',
    address: '5 Harbor View Blvd, Waterfront', phone: '(555) 400-8899',
    hours: 'Mon–Sun 11am–11pm',
    description: 'Daily fresh-catch seafood with stunning waterfront views.',
    rating: 4.6, reviews: 177,
  },
];

export const tierConfig = {
  Bronze:   { min: 0,     max: 200,  color: '#cd7f32', bg: 'rgba(205,127,50,0.15)' },
  Silver:   { min: 200,   max: 600,  color: '#c0c0c0', bg: 'rgba(192,192,192,0.12)' },
  Gold:     { min: 600,   max: 1500, color: '#d4af37', bg: 'rgba(212,175,55,0.15)' },
  Platinum: { min: 1500,  max: null, color: '#e5e4e2', bg: 'rgba(229,228,226,0.12)' },
};
