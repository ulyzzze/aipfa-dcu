export const categories = ["Housing", "Groceries", "Transport", "Shopping", "Leisure", "Bills"] as const;
export type Category = (typeof categories)[number];
export type Transaction = { id: string; date: string; description: string; category: Category | "Income"; amount: number };
export type DemoState = {
  version: 1;
  transactions: Transaction[];
  budgets: Record<string, Record<Category, number>>;
  profile: { name: string; email: string; insights: boolean };
};
export const demoMonths = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
export const defaultMonth = "2026-11";
export const openingBalance = 325000;
export const money = (cents: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);
export const monthLabel = (month: string) => new Intl.DateTimeFormat("en-IE", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T12:00:00Z`));
export const dateLabel = (date: string) => new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

const templates: [number, string, Category | "Income", number][] = [
  [1, "Monthly salary", "Income", 265000], [2, "Dublin apartment rent", "Housing", -85000],
  [2, "Tesco · weekly shop", "Groceries", -6850], [3, "Leap Card top-up", "Transport", -4000],
  [4, "Electric Ireland", "Bills", -7200], [5, "Spotify Premium", "Leisure", -1199],
  [6, "Lidl · weekly shop", "Groceries", -4835], [7, "Uniqlo", "Shopping", -7990],
  [8, "Coffee & catch-up", "Leisure", -1850], [10, "Dublin Bus", "Transport", -1200],
  [11, "Dunnes Stores", "Groceries", -6240], [12, "Three mobile", "Bills", -2000],
  [14, "Freelance design", "Income", 35000], [15, "Cinema with friends", "Leisure", -2600],
  [17, "Aldi · weekly shop", "Groceries", -5530], [18, "Books Upstairs", "Shopping", -3490],
  [20, "Dinner at Sprezzatura", "Leisure", -4800], [21, "Leap Card top-up", "Transport", -3000],
  [23, "Tesco · weekly shop", "Groceries", -4290], [24, "Gym membership", "Leisure", -4500],
  [25, "IKEA · home essentials", "Shopping", -4590], [26, "Broadband", "Bills", -4500],
  [27, "Weekend groceries", "Groceries", -3650], [28, "Train to Galway", "Transport", -2850],
];

export const createDemoState = (): DemoState => ({
  version: 1,
  transactions: demoMonths.flatMap((month, monthIndex) => templates.map(([day, description, category, amount], index) => ({
    id: `demo-${month}-${index}`, date: `${month}-${String(day).padStart(2, "0")}`, description, category,
    amount: amount > 0 || category === "Housing" ? amount : -Math.round(Math.abs(amount) * [0.91, 1.03, 0.96, 1.08, 1.12, 1][monthIndex]),
  }))),
  budgets: Object.fromEntries(demoMonths.map((month) => [month, { Housing: 90000, Groceries: 40000, Transport: 15000, Shopping: 18000, Leisure: 20000, Bills: 20000 }])),
  profile: { name: "Ulysse Couchoud", email: "ulysse@example.com", insights: true },
});

export const monthlyTransactions = (transactions: Transaction[], month: string) => transactions.filter((t) => t.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
export const totals = (transactions: Transaction[]) => {
  const income = transactions.reduce((sum, t) => sum + Math.max(t.amount, 0), 0);
  const expenses = transactions.reduce((sum, t) => sum + Math.max(-t.amount, 0), 0);
  return { income, expenses, savings: income - expenses, rate: income > 0 ? (income - expenses) / income * 100 : 0 };
};
export const categoryTotals = (transactions: Transaction[]) => categories.map((category) => ({ category, value: transactions.filter((t) => t.category === category && t.amount < 0).reduce((sum, t) => sum - t.amount, 0) }));
export const balanceAtMonth = (transactions: Transaction[], month: string) => openingBalance + transactions.filter((t) => t.date.slice(0, 7) <= month).reduce((sum, t) => sum + t.amount, 0);
export const balanceSeries = (transactions: Transaction[], month: string) => {
  const start = openingBalance + transactions.filter((t) => t.date.slice(0, 7) < month).reduce((sum, t) => sum + t.amount, 0);
  const days = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  let balance = start;
  return Array.from({ length: days }, (_, index) => {
    const date = `${month}-${String(index + 1).padStart(2, "0")}`;
    balance += transactions.filter((t) => t.date === date).reduce((sum, t) => sum + t.amount, 0);
    return { date: new Date(`${date}T12:00:00Z`), balance: balance / 100 };
  });
};
export const isCategory = (value: unknown): value is Category => categories.includes(value as Category);
export const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
export const isTransaction = (value: unknown): value is Transaction => {
  if (!value || typeof value !== "object") return false;
  const t = value as Transaction;
  return typeof t.id === "string" && typeof t.description === "string" && t.description.trim().length > 0 && t.description.length <= 160 && typeof t.date === "string" && isDate(t.date) && Number.isSafeInteger(t.amount) && t.amount !== 0 && Math.abs(t.amount) <= 100000000 && (t.amount > 0 ? t.category === "Income" : isCategory(t.category));
};
export const isDemoState = (value: unknown): value is DemoState => {
  if (!value || typeof value !== "object") return false;
  const s = value as DemoState;
  return s.version === 1 && Array.isArray(s.transactions) && s.transactions.length <= 10000 && s.transactions.every(isTransaction) && new Set(s.transactions.map((t) => t.id)).size === s.transactions.length && !!s.profile && typeof s.profile.name === "string" && typeof s.profile.email === "string" && typeof s.profile.insights === "boolean" && !!s.budgets && typeof s.budgets === "object" && Object.values(s.budgets).every((b) => b && categories.every((c) => Number.isSafeInteger(b[c]) && b[c] > 0));
};
