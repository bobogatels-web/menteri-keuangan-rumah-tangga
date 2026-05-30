import * as SQLite from 'expo-sqlite';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  notes: string;
  date: string;
  time: string;
  payment_method: string;
  status: string;
  buyer_name: string;
  image_uri: string;
  created_at: string;
  updated_at: string;
}

export interface Target {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  period: string;
  target_type: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: string;
  next_date: string;
  notes: string;
  is_active: number;
  created_at: string;
}

let db: SQLite.SQLiteDatabase | null = null;

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('mkrt_v1.db');
    initDB(db);
  }
  return db;
}

function initDB(database: SQLite.SQLiteDatabase) {
  database.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      notes TEXT DEFAULT '',
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      payment_method TEXT DEFAULT '',
      status TEXT DEFAULT 'received',
      buyer_name TEXT DEFAULT '',
      image_uri TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS targets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      period TEXT NOT NULL DEFAULT 'monthly',
      target_type TEXT NOT NULL DEFAULT 'savings',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS recurring (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      frequency TEXT NOT NULL DEFAULT 'monthly',
      next_date TEXT NOT NULL,
      notes TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// ── Transactions ──────────────────────────────────────────────────────────────

export function getAllTransactions(): Transaction[] {
  const d = getDB();
  return d.getAllSync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC, time DESC'
  );
}

export function getTransactionsByType(type: 'income' | 'expense'): Transaction[] {
  const d = getDB();
  return d.getAllSync<Transaction>(
    'SELECT * FROM transactions WHERE type = ? ORDER BY date DESC, time DESC',
    [type]
  );
}

export function getTransactionsByDateRange(from: string, to: string): Transaction[] {
  const d = getDB();
  return d.getAllSync<Transaction>(
    'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC',
    [from, to]
  );
}

export function insertTransaction(t: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Transaction {
  const d = getDB();
  const now = new Date().toISOString();
  const id = genId();
  d.runSync(
    `INSERT INTO transactions (id, type, amount, category, notes, date, time, payment_method, status, buyer_name, image_uri, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, t.type, t.amount, t.category, t.notes, t.date, t.time, t.payment_method, t.status, t.buyer_name, t.image_uri, now, now]
  );
  return { ...t, id, created_at: now, updated_at: now };
}

export function updateTransaction(t: Transaction): void {
  const d = getDB();
  const now = new Date().toISOString();
  d.runSync(
    `UPDATE transactions SET type=?, amount=?, category=?, notes=?, date=?, time=?, payment_method=?, status=?, buyer_name=?, image_uri=?, updated_at=? WHERE id=?`,
    [t.type, t.amount, t.category, t.notes, t.date, t.time, t.payment_method, t.status, t.buyer_name, t.image_uri, now, t.id]
  );
}

export function deleteTransaction(id: string): void {
  getDB().runSync('DELETE FROM transactions WHERE id = ?', [id]);
}

export function getMonthlyStats(year: number, month: number): { income: number; expense: number } {
  const d = getDB();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const inc = d.getFirstSync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type='income' AND date LIKE ?",
    [`${prefix}%`]
  );
  const exp = d.getFirstSync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type='expense' AND date LIKE ?",
    [`${prefix}%`]
  );
  return { income: inc?.total ?? 0, expense: exp?.total ?? 0 };
}

export function getCategoryStats(type: 'income' | 'expense', year: number, month: number): { category: string; total: number }[] {
  const d = getDB();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return d.getAllSync<{ category: string; total: number }>(
    'SELECT category, SUM(amount) as total FROM transactions WHERE type=? AND date LIKE ? GROUP BY category ORDER BY total DESC',
    [type, `${prefix}%`]
  );
}

export function getLast12MonthsStats(): { month: string; income: number; expense: number }[] {
  const d = getDB();
  const results: { month: string; income: number; expense: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d2 = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const prefix = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}`;
    const inc = (d.getFirstSync<{ total: number }>(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='income' AND date LIKE ?",
      [`${prefix}%`]
    ))?.total ?? 0;
    const exp = (d.getFirstSync<{ total: number }>(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='expense' AND date LIKE ?",
      [`${prefix}%`]
    ))?.total ?? 0;
    results.push({ month: prefix, income: inc, expense: exp });
  }
  return results;
}

// ── Targets ───────────────────────────────────────────────────────────────────

export function getAllTargets(): Target[] {
  return getDB().getAllSync<Target>('SELECT * FROM targets ORDER BY created_at DESC');
}

export function insertTarget(t: Omit<Target, 'id' | 'created_at'>): Target {
  const d = getDB();
  const now = new Date().toISOString();
  const id = genId();
  d.runSync(
    'INSERT INTO targets (id, title, target_amount, current_amount, period, target_type, start_date, end_date, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, t.title, t.target_amount, t.current_amount, t.period, t.target_type, t.start_date, t.end_date, now]
  );
  return { ...t, id, created_at: now };
}

export function updateTarget(t: Target): void {
  getDB().runSync(
    'UPDATE targets SET title=?, target_amount=?, current_amount=?, period=?, target_type=?, start_date=?, end_date=? WHERE id=?',
    [t.title, t.target_amount, t.current_amount, t.period, t.target_type, t.start_date, t.end_date, t.id]
  );
}

export function deleteTarget(id: string): void {
  getDB().runSync('DELETE FROM targets WHERE id = ?', [id]);
}

// ── Recurring ─────────────────────────────────────────────────────────────────

export function getAllRecurring(): RecurringItem[] {
  return getDB().getAllSync<RecurringItem>('SELECT * FROM recurring ORDER BY is_active DESC, next_date ASC');
}

export function insertRecurring(r: Omit<RecurringItem, 'id' | 'created_at'>): RecurringItem {
  const d = getDB();
  const now = new Date().toISOString();
  const id = genId();
  d.runSync(
    'INSERT INTO recurring (id, title, amount, type, category, frequency, next_date, notes, is_active, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [id, r.title, r.amount, r.type, r.category, r.frequency, r.next_date, r.notes, r.is_active, now]
  );
  return { ...r, id, created_at: now };
}

export function updateRecurring(r: RecurringItem): void {
  getDB().runSync(
    'UPDATE recurring SET title=?, amount=?, type=?, category=?, frequency=?, next_date=?, notes=?, is_active=? WHERE id=?',
    [r.title, r.amount, r.type, r.category, r.frequency, r.next_date, r.notes, r.is_active, r.id]
  );
}

export function deleteRecurring(id: string): void {
  getDB().runSync('DELETE FROM recurring WHERE id = ?', [id]);
}

export function generateRecurringTransaction(r: RecurringItem): void {
  const today = new Date();
  insertTransaction({
    type: r.type,
    amount: r.amount,
    category: r.category,
    notes: `[Auto] ${r.title}`,
    date: today.toISOString().split('T')[0],
    time: today.toTimeString().substr(0, 5),
    payment_method: '',
    status: 'received',
    buyer_name: '',
    image_uri: '',
  });
  const next = computeNextDate(r.next_date, r.frequency);
  getDB().runSync('UPDATE recurring SET next_date=? WHERE id=?', [next, r.id]);
}

function computeNextDate(current: string, frequency: string): string {
  const d = new Date(current);
  switch (frequency) {
    case 'daily': d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split('T')[0];
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function getSetting(key: string, defaultValue = ''): string {
  const row = getDB().getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key=?', [key]);
  return row?.value ?? defaultValue;
}

export function setSetting(key: string, value: string): void {
  getDB().runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)', [key, value]);
}
