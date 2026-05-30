import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useDB } from '@/context/DBContext';
import { useApp } from '@/context/AppContext';
import { GlassCard } from '@/components/GlassCard';
import { ChartBar } from '@/components/ChartBar';
import { ChartPie } from '@/components/ChartPie';

function formatCurrency(a: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(a);
}

type Tab = 'monthly' | 'category' | 'yearly';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useApp();
  const { monthIncome, monthExpense, get12MonthStats, getCatStats } = useDB();
  const [tab, setTab] = useState<Tab>('monthly');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');

  const now = new Date();
  const stats12 = useMemo(() => get12MonthStats(), [get12MonthStats]);
  const catStats = useMemo(() => getCatStats(catType, now.getFullYear(), now.getMonth() + 1), [catType, now.getFullYear(), now.getMonth() + 1, getCatStats]);

  const totalIncome = useMemo(() => stats12.reduce((s, d) => s + d.income, 0), [stats12]);
  const totalExpense = useMemo(() => stats12.reduce((s, d) => s + d.expense, 0), [stats12]);

  const healthScore = monthIncome > 0 ? Math.max(0, Math.min(100, Math.round((1 - monthExpense / monthIncome) * 100))) : 0;
  const healthColor = healthScore >= 75 ? '#00ff88' : healthScore >= 50 ? '#00d4ff' : healthScore >= 25 ? '#ffdd00' : '#ff3366';
  const healthLabel = healthScore >= 75 ? t('excellent') : healthScore >= 50 ? t('good') : healthScore >= 25 ? t('fair') : t('poor');

  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0a0818', '#080818']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Text style={styles.title}>{t('analytics')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['monthly', 'category', 'yearly'] as Tab[]).map(tb => (
          <TouchableOpacity
            key={tb}
            onPress={() => setTab(tb)}
            style={[styles.tabBtn, tab === tb && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === tb && styles.tabTextActive]}>
              {tb === 'monthly' ? 'Bulanan' : tb === 'category' ? 'Kategori' : 'Tahunan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 80 + bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Health Score */}
        <GlassCard neonColor={healthColor} style={styles.card}>
          <View style={styles.healthHeader}>
            <View>
              <Text style={styles.cardLabel}>{t('healthScore')}</Text>
              <Text style={[styles.healthScore, { color: healthColor }]}>{healthScore}/100 — {healthLabel}</Text>
            </View>
            <Text style={[styles.bigScore, { color: healthColor }]}>{healthScore}</Text>
          </View>
          <View style={styles.healthBg}>
            <View style={[styles.healthFill, { width: `${healthScore}%` as `${number}%`, backgroundColor: healthColor }]} />
          </View>
        </GlassCard>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <GlassCard neonColor="#00ff88" style={styles.statCard} padding={12}>
            <Text style={styles.statLabel}>Total Pemasukan</Text>
            <Text style={[styles.statAmount, { color: '#00ff88' }]}>{formatCurrency(totalIncome)}</Text>
          </GlassCard>
          <GlassCard neonColor="#ff3366" style={styles.statCard} padding={12}>
            <Text style={styles.statLabel}>Total Pengeluaran</Text>
            <Text style={[styles.statAmount, { color: '#ff3366' }]}>{formatCurrency(totalExpense)}</Text>
          </GlassCard>
        </View>

        {tab === 'monthly' && (
          <GlassCard style={styles.card}>
            <Text style={styles.cardLabel}>{t('monthlyComparison')}</Text>
            <ChartBar data={stats12.slice(-6)} title="6 Bulan Terakhir" />
          </GlassCard>
        )}

        {tab === 'category' && (
          <GlassCard style={styles.card}>
            <Text style={styles.cardLabel}>{t('categoryBreakdown')}</Text>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                onPress={() => setCatType('income')}
                style={[styles.typeBtn, catType === 'income' && styles.typeBtnActive]}
              >
                <Text style={[styles.typeBtnText, catType === 'income' && { color: '#00ff88' }]}>Pemasukan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCatType('expense')}
                style={[styles.typeBtn, catType === 'expense' && styles.typeBtnActiveRed]}
              >
                <Text style={[styles.typeBtnText, catType === 'expense' && { color: '#ff3366' }]}>Pengeluaran</Text>
              </TouchableOpacity>
            </View>
            <ChartPie
              data={catStats.map(d => ({ category: d.category, total: d.total }))}
              size={130}
            />
          </GlassCard>
        )}

        {tab === 'yearly' && (
          <>
            <GlassCard style={styles.card}>
              <Text style={styles.cardLabel}>{t('yearlyOverview')} {now.getFullYear()}</Text>
              <ChartBar data={stats12} title="12 Bulan" />
            </GlassCard>
            {/* Monthly breakdown table */}
            <GlassCard style={styles.card}>
              <Text style={styles.cardLabel}>Rincian Bulanan</Text>
              {stats12.map(d => {
                const balance = d.income - d.expense;
                return (
                  <View key={d.month} style={styles.monthRow}>
                    <Text style={styles.monthName}>{d.month.substr(5)}/{d.month.substr(0, 4)}</Text>
                    <Text style={[styles.monthVal, { color: '#00ff88' }]}>{formatCurrency(d.income)}</Text>
                    <Text style={[styles.monthVal, { color: '#ff3366' }]}>{formatCurrency(d.expense)}</Text>
                    <Text style={[styles.monthVal, { color: balance >= 0 ? '#00d4ff' : '#ff3366' }]}>{formatCurrency(balance)}</Text>
                  </View>
                );
              })}
            </GlassCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080818' },
  header: {
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(139,0,255,0.2)',
  },
  title: { color: '#8b00ff', fontSize: 22, fontWeight: '800' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tabBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10,
    backgroundColor: 'rgba(139,0,255,0.07)', borderWidth: 1, borderColor: 'rgba(139,0,255,0.2)',
  },
  tabActive: { backgroundColor: 'rgba(139,0,255,0.2)', borderColor: '#8b00ff' },
  tabText: { color: '#6b9bb8', fontSize: 12 },
  tabTextActive: { color: '#8b00ff', fontWeight: '700' },
  content: { padding: 16, gap: 12 },
  card: { marginBottom: 0 },
  cardLabel: { color: '#6b9bb8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, fontWeight: '600' },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  healthScore: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  bigScore: { fontSize: 40, fontWeight: '800' },
  healthBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3 },
  healthFill: { height: 6, borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1 },
  statLabel: { color: '#6b9bb8', fontSize: 10, marginBottom: 4 },
  statAmount: { fontSize: 13, fontWeight: '700' },
  typeToggle: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  typeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  typeBtnActive: { borderColor: '#00ff88', backgroundColor: 'rgba(0,255,136,0.08)' },
  typeBtnActiveRed: { borderColor: '#ff3366', backgroundColor: 'rgba(255,51,102,0.08)' },
  typeBtnText: { color: '#6b9bb8', fontSize: 12, fontWeight: '600' },
  monthRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,255,0.08)' },
  monthName: { color: '#6b9bb8', fontSize: 11, width: 60 },
  monthVal: { flex: 1, fontSize: 10, fontWeight: '600', textAlign: 'right' },
});
