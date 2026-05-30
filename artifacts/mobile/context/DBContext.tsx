import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  Transaction, Target, RecurringItem,
  getAllTransactions, insertTransaction, updateTransaction, deleteTransaction,
  getAllTargets, insertTarget, updateTarget, deleteTarget,
  getAllRecurring, insertRecurring, updateRecurring, deleteRecurring,
  generateRecurringTransaction,
  getMonthlyStats, getCategoryStats, getLast12MonthsStats,
} from '@/services/database';

interface DBContextType {
  transactions: Transaction[];
  targets: Target[];
  recurring: RecurringItem[];
  ready: boolean;
  refreshTransactions: () => void;
  refreshAll: () => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => void;
  editTransaction: (t: Transaction) => void;
  removeTransaction: (id: string) => void;
  addTarget: (t: Omit<Target, 'id' | 'created_at'>) => void;
  editTarget: (t: Target) => void;
  removeTarget: (id: string) => void;
  addRecurring: (r: Omit<RecurringItem, 'id' | 'created_at'>) => void;
  editRecurring: (r: RecurringItem) => void;
  removeRecurring: (id: string) => void;
  triggerRecurring: (r: RecurringItem) => void;
  getMonthStats: (year: number, month: number) => { income: number; expense: number };
  getCatStats: (type: 'income' | 'expense', year: number, month: number) => { category: string; total: number }[];
  get12MonthStats: () => { month: string; income: number; expense: number }[];
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
}

const DBContext = createContext<DBContextType | null>(null);

function safeCall<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

export function DBProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [recurring, setRecurring] = useState<RecurringItem[]>([]);

  // Load all data after mount so SQLite worker is ready on web
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setTransactions(safeCall(getAllTransactions, []));
        setTargets(safeCall(getAllTargets, []));
        setRecurring(safeCall(getAllRecurring, []));
        setReady(true);
      } catch (e) {
        console.warn('DB init error:', e);
        setReady(true);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const refreshTransactions = useCallback(() => {
    setTransactions(safeCall(getAllTransactions, []));
  }, []);

  const refreshAll = useCallback(() => {
    setTransactions(safeCall(getAllTransactions, []));
    setTargets(safeCall(getAllTargets, []));
    setRecurring(safeCall(getAllRecurring, []));
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    safeCall(() => insertTransaction(t), null);
    setTransactions(safeCall(getAllTransactions, []));
  }, []);

  const editTransaction = useCallback((t: Transaction) => {
    safeCall(() => updateTransaction(t), undefined);
    setTransactions(safeCall(getAllTransactions, []));
  }, []);

  const removeTransaction = useCallback((id: string) => {
    safeCall(() => deleteTransaction(id), undefined);
    setTransactions(safeCall(getAllTransactions, []));
  }, []);

  const addTarget = useCallback((t: Omit<Target, 'id' | 'created_at'>) => {
    safeCall(() => insertTarget(t), null);
    setTargets(safeCall(getAllTargets, []));
  }, []);

  const editTarget = useCallback((t: Target) => {
    safeCall(() => updateTarget(t), undefined);
    setTargets(safeCall(getAllTargets, []));
  }, []);

  const removeTarget = useCallback((id: string) => {
    safeCall(() => deleteTarget(id), undefined);
    setTargets(safeCall(getAllTargets, []));
  }, []);

  const addRecurring = useCallback((r: Omit<RecurringItem, 'id' | 'created_at'>) => {
    safeCall(() => insertRecurring(r), null);
    setRecurring(safeCall(getAllRecurring, []));
  }, []);

  const editRecurring = useCallback((r: RecurringItem) => {
    safeCall(() => updateRecurring(r), undefined);
    setRecurring(safeCall(getAllRecurring, []));
  }, []);

  const removeRecurring = useCallback((id: string) => {
    safeCall(() => deleteRecurring(id), undefined);
    setRecurring(safeCall(getAllRecurring, []));
  }, []);

  const triggerRecurring = useCallback((r: RecurringItem) => {
    safeCall(() => generateRecurringTransaction(r), undefined);
    setTransactions(safeCall(getAllTransactions, []));
    setRecurring(safeCall(getAllRecurring, []));
  }, []);

  const getMonthStats = useCallback(
    (year: number, month: number) => safeCall(() => getMonthlyStats(year, month), { income: 0, expense: 0 }),
    []
  );
  const getCatStats = useCallback(
    (type: 'income' | 'expense', year: number, month: number) =>
      safeCall(() => getCategoryStats(type, year, month), []),
    []
  );
  const get12MonthStats = useCallback(
    () => safeCall(getLast12MonthsStats, []),
    []
  );

  const now = new Date();
  const monthStats = safeCall(() => getMonthlyStats(now.getFullYear(), now.getMonth() + 1), { income: 0, expense: 0 });
  const totalIncome = transactions.reduce((s, t) => t.type === 'income' ? s + t.amount : s, 0);
  const totalExpense = transactions.reduce((s, t) => t.type === 'expense' ? s + t.amount : s, 0);

  return (
    <DBContext.Provider value={{
      transactions, targets, recurring, ready,
      refreshTransactions, refreshAll,
      addTransaction, editTransaction, removeTransaction,
      addTarget, editTarget, removeTarget,
      addRecurring, editRecurring, removeRecurring,
      triggerRecurring,
      getMonthStats, getCatStats, get12MonthStats,
      totalBalance: totalIncome - totalExpense,
      monthIncome: monthStats.income,
      monthExpense: monthStats.expense,
    }}>
      {children}
    </DBContext.Provider>
  );
}

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error('useDB must be used within DBProvider');
  return ctx;
}
