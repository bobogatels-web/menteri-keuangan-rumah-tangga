import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getAllTransactions, getMonthlyStats, Transaction } from './database';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export type ExportPeriod = 'all' | '30days' | '3months' | 'thisyear';

function filterByPeriod(transactions: Transaction[], period: ExportPeriod): Transaction[] {
  const now = new Date();
  if (period === 'all') return transactions;
  if (period === '30days') {
    const d = new Date(now); d.setDate(d.getDate() - 30);
    return transactions.filter(t => new Date(t.date) >= d);
  }
  if (period === '3months') {
    const d = new Date(now); d.setMonth(d.getMonth() - 3);
    return transactions.filter(t => new Date(t.date) >= d);
  }
  if (period === 'thisyear') {
    return transactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
  }
  return transactions;
}

// ── PDF Export ────────────────────────────────────────────────────────────────

export async function exportPDF(period: ExportPeriod = 'all'): Promise<void> {
  const all = getAllTransactions();
  const filtered = filterByPeriod(all, period);
  const income = filtered.filter(t => t.type === 'income');
  const expenses = filtered.filter(t => t.type === 'expense');
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const incomeRows = income.map(t => `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td>${t.category}</td>
      <td>${t.buyer_name || '-'}</td>
      <td>${t.notes || '-'}</td>
      <td style="color:#00c853;text-align:right;">${formatCurrency(t.amount)}</td>
      <td>${t.status}</td>
    </tr>`).join('');

  const expenseRows = expenses.map(t => `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td>${t.category}</td>
      <td>${t.payment_method || '-'}</td>
      <td>${t.notes || '-'}</td>
      <td style="color:#e53935;text-align:right;">${formatCurrency(t.amount)}</td>
      <td>-</td>
    </tr>`).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; color: #333; }
  .header { background: linear-gradient(135deg, #0d0d2b, #1a1a4e); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
  .header h1 { margin: 0; font-size: 22px; color: #00d4ff; }
  .header p { margin: 5px 0; font-size: 12px; color: #aaa; }
  .watermark { font-size: 11px; color: #8b00ff; margin-top: 8px; font-style: italic; }
  .summary { display: flex; gap: 15px; margin-bottom: 20px; }
  .card { flex: 1; padding: 15px; border-radius: 8px; text-align: center; }
  .card.income { background: #e8f5e9; border: 1px solid #4caf50; }
  .card.expense { background: #fce4ec; border: 1px solid #e91e63; }
  .card.balance { background: #e3f2fd; border: 1px solid #2196f3; }
  .card h3 { margin: 0 0 8px; font-size: 12px; color: #666; }
  .card .amount { font-size: 16px; font-weight: bold; }
  .income .amount { color: #2e7d32; }
  .expense .amount { color: #c62828; }
  .balance .amount { color: #1565c0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white; border-radius: 8px; overflow: hidden; }
  th { background: #0d0d2b; color: #00d4ff; padding: 10px 8px; font-size: 11px; text-align: left; }
  td { padding: 8px; font-size: 11px; border-bottom: 1px solid #eee; }
  tr:nth-child(even) { background: #f9f9f9; }
  h2 { font-size: 14px; color: #0d0d2b; margin: 20px 0 10px; border-left: 4px solid #00d4ff; padding-left: 10px; }
  .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #999; }
  .health { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
  .health-bar { height: 8px; border-radius: 4px; background: #eee; margin-top: 8px; }
  .health-fill { height: 100%; border-radius: 4px; background: ${balance >= 0 ? '#4caf50' : '#e53935'}; width: ${Math.min(100, balance >= 0 ? Math.min(100, (balance / (totalIncome || 1)) * 100) : 0)}%; }
</style>
</head>
<body>
  <div class="header">
    <h1>MENTERI KEUANGAN RUMAH TANGGA</h1>
    <p>Laporan Keuangan — ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    <p class="watermark">WAROHATHUN NI'MAH</p>
  </div>
  <div class="summary">
    <div class="card income"><h3>Total Pemasukan</h3><div class="amount">${formatCurrency(totalIncome)}</div></div>
    <div class="card expense"><h3>Total Pengeluaran</h3><div class="amount">${formatCurrency(totalExpense)}</div></div>
    <div class="card balance"><h3>Saldo Bersih</h3><div class="amount">${formatCurrency(balance)}</div></div>
  </div>
  <div class="health">
    <strong>Kesehatan Keuangan</strong>
    <div class="health-bar"><div class="health-fill"></div></div>
    <small>${balance >= 0 ? 'Keuangan sehat — pengeluaran terkontrol' : 'Pengeluaran melebihi pemasukan'}</small>
  </div>
  <h2>Rincian Pemasukan (${income.length} transaksi)</h2>
  <table>
    <thead><tr><th>Tanggal</th><th>Sumber</th><th>Pembeli</th><th>Catatan</th><th>Jumlah</th><th>Status</th></tr></thead>
    <tbody>${incomeRows || '<tr><td colspan="6" style="text-align:center;color:#999;">Tidak ada data</td></tr>'}</tbody>
  </table>
  <h2>Rincian Pengeluaran (${expenses.length} transaksi)</h2>
  <table>
    <thead><tr><th>Tanggal</th><th>Kategori</th><th>Metode</th><th>Catatan</th><th>Jumlah</th><th>-</th></tr></thead>
    <tbody>${expenseRows || '<tr><td colspan="6" style="text-align:center;color:#999;">Tidak ada data</td></tr>'}</tbody>
  </table>
  <div class="footer">
    <p>Design By AHMAD AHFANI &nbsp;|&nbsp; WAROHATHUN NI'MAH &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('id-ID')}</p>
  </div>
</body>
</html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const dest = `${FileSystem.documentDirectory}MKRT_Report_${Date.now()}.pdf`;
  await FileSystem.moveAsync({ from: uri, to: dest });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dest, { mimeType: 'application/pdf' });
  }
}

// ── CSV Export ────────────────────────────────────────────────────────────────

export async function exportCSV(period: ExportPeriod = 'all'): Promise<void> {
  const all = getAllTransactions();
  const filtered = filterByPeriod(all, period);
  const header = 'Tanggal,Jenis,Kategori,Pembeli/Metode,Catatan,Jumlah,Status\n';
  const rows = filtered.map(t =>
    [
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.category}"`,
      `"${t.type === 'income' ? t.buyer_name : t.payment_method}"`,
      `"${t.notes.replace(/"/g, '""')}"`,
      t.amount,
      t.status,
    ].join(',')
  ).join('\n');
  const csv = '\uFEFF' + header + rows;
  const path = `${FileSystem.documentDirectory}MKRT_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
  }
}

// ── Excel (TSV) Export ────────────────────────────────────────────────────────

export async function exportExcel(period: ExportPeriod = 'all'): Promise<void> {
  const all = getAllTransactions();
  const filtered = filterByPeriod(all, period);
  const income = filtered.filter(t => t.type === 'income');
  const expenses = filtered.filter(t => t.type === 'expense');

  const summary = [
    ['LAPORAN KEUANGAN - MENTERI KEUANGAN RUMAH TANGGA'],
    ['Dibuat:', new Date().toLocaleString('id-ID')],
    ['WAROHATHUN NIMAH'],
    [],
    ['RINGKASAN'],
    ['Total Pemasukan', income.reduce((s, t) => s + t.amount, 0)],
    ['Total Pengeluaran', expenses.reduce((s, t) => s + t.amount, 0)],
    ['Saldo', income.reduce((s, t) => s + t.amount, 0) - expenses.reduce((s, t) => s + t.amount, 0)],
    [],
    ['PEMASUKAN'],
    ['Tanggal', 'Sumber', 'Pembeli', 'Catatan', 'Jumlah', 'Status'],
    ...income.map(t => [t.date, t.category, t.buyer_name, t.notes, t.amount, t.status]),
    [],
    ['PENGELUARAN'],
    ['Tanggal', 'Kategori', 'Metode', 'Catatan', 'Jumlah', ''],
    ...expenses.map(t => [t.date, t.category, t.payment_method, t.notes, t.amount, '']),
  ];

  const tsv = summary.map(row => (row as (string | number)[]).join('\t')).join('\n');
  const path = `${FileSystem.documentDirectory}MKRT_${Date.now()}.xls`;
  await FileSystem.writeAsStringAsync(path, tsv, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: 'application/vnd.ms-excel' });
  }
}

// ── Backup & Restore ──────────────────────────────────────────────────────────

export async function createBackup(): Promise<void> {
  const all = getAllTransactions();
  const data = JSON.stringify({ transactions: all, exportedAt: new Date().toISOString(), version: 1 }, null, 2);
  const path = `${FileSystem.documentDirectory}MKRT_Backup_${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(path, data);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: 'application/json' });
  }
}
