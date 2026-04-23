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

export const orders = [
  {
    id: 'ord-0081',
    userId: 'u001',
    restaurantId: 1,
    date: '2026-04-21',
    items: ['Ribeye Steak', 'Truffle Fries', 'House Salad'],
    total: 87.50,
    rewards: 2.63,
    status: 'completed',
  },
  {
    id: 'ord-0074',
    userId: 'u001',
    restaurantId: 2,
    date: '2026-04-14',
    items: ['Dragon Roll', 'Miso Soup', 'Edamame'],
    total: 52.00,
    rewards: 1.56,
    status: 'completed',
  },
  {
    id: 'ord-0063',
    userId: 'u001',
    restaurantId: 3,
    date: '2026-04-02',
    items: ['Fettuccine Alfredo', 'Bruschetta', 'Tiramisu'],
    total: 61.00,
    rewards: 1.83,
    status: 'completed',
  },
  {
    id: 'ord-0055',
    userId: 'u001',
    restaurantId: 4,
    date: '2026-03-28',
    items: ['Lobster Bisque', 'Pan-Seared Salmon', 'Key Lime Pie'],
    total: 94.00,
    rewards: 2.82,
    status: 'completed',
  },
  {
    id: 'ord-0047',
    userId: 'u001',
    restaurantId: 1,
    date: '2026-03-15',
    items: ['Filet Mignon', 'Caesar Salad', 'Crème Brûlée'],
    total: 112.00,
    rewards: 3.36,
    status: 'completed',
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
