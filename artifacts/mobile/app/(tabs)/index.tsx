import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/context/DBContext';
import { useApp } from '@/context/AppContext';
import { BalanceCard } from '@/components/BalanceCard';
import { GlassCard } from '@/components/GlassCard';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';

function formatCurrency(a: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(a);
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useApp();
  const { transactions, targets, totalBalance, monthIncome, monthExpense, editTransaction, removeTransaction } = useDB();

  const recent = useMemo(() => transactions.slice(0, 5), [transactions]);

  const healthScore = useMemo(() => {
    if (monthIncome === 0) return 0;
    const ratio = 1 - (monthExpense / monthIncome);
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  }, [monthIncome, monthExpense]);

  const healthLabel = healthScore >= 75 ? t('excellent') : healthScore >= 50 ? t('good') : healthScore >= 25 ? t('fair') : t('poor');
  const healthColor = healthScore >= 75 ? '#00ff88' : healthScore >= 50 ? '#00d4ff' : healthScore >= 25 ? '#ffdd00' : '#ff3366';

  const topTargets = targets.slice(0, 3);

  const top = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0a0a1e', '#080818']} style={StyleSheet.absoluteFill} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <View>
          <Text style={styles.greeting}>Selamat Datang</Text>
          <Text style={styles.appName}>Menteri Keuangan</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={22} color="#00d4ff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 100 + (Platform.OS === 'web' ? 34 : insets.bottom) }]}
        showsVerticalScrollIndicator={false}
      >
        <BalanceCard balance={totalBalance} income={monthIncome} expense={monthExpense} label={t('thisMonth')} />

        {/* Quick Actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/add-income')}>
            <LinearGradient colors={['#00ff8820', '#00ff8808']} style={styles.quickGrad}>
              <Ionicons name="add-circle" size={24} color="#00ff88" />
              <Text style={[styles.quickText, { color: '#00ff88' }]}>{t('addIncome')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/add-expense')}>
            <LinearGradient colors={['#ff336620', '#ff336608']} style={styles.quickGrad}>
              <Ionicons name="remove-circle" size={24} color="#ff3366" />
              <Text style={[styles.quickText, { color: '#ff3366' }]}>{t('addExpense')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/analytics')}>
            <LinearGradient colors={['#8b00ff20', '#8b00ff08']} style={styles.quickGrad}>
              <Ionicons name="analytics" size={24} color="#8b00ff" />
              <Text style={[styles.quickText, { color: '#8b00ff' }]}>{t('analytics')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/export-center')}>
            <LinearGradient colors={['#ffdd0020', '#ffdd0008']} style={styles.quickGrad}>
              <Ionicons name="share-social" size={24} color="#ffdd00" />
              <Text style={[styles.quickText, { color: '#ffdd00' }]}>{t('exportCenter')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Health Score */}
        <GlassCard style={styles.healthCard} neonColor={healthColor}>
          <View style={styles.healthHeader}>
            <Text style={styles.sectionLabel}>{t('financialHealth')}</Text>
            <Text style={[styles.healthScore, { color: healthColor }]}>{healthScore}/100</Text>
          </View>
          <View style={styles.healthBarBg}>
            <View style={[styles.healthBarFill, { width: `${healthScore}%` as `${number}%`, backgroundColor: healthColor }]} />
          </View>
          <Text style={[styles.healthLabel, { color: healthColor }]}>{healthLabel}</Text>
        </GlassCard>

        {/* Targets Preview */}
        {topTargets.length > 0 && (
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>{t('targetProgress')}</Text>
              <TouchableOpacity onPress={() => router.push('/targets')}>
                <Text style={styles.viewAll}>{t('viewAll')}</Text>
              </TouchableOpacity>
            </View>
            {topTargets.map(tgt => {
              const pct = tgt.target_amount > 0 ? Math.min(100, (tgt.current_amount / tgt.target_amount) * 100) : 0;
              return (
                <View key={tgt.id} style={styles.targetRow}>
                  <Text style={styles.targetTitle}>{tgt.title}</Text>
                  <View style={styles.targetBar}>
                    <View style={[styles.targetFill, { width: `${pct}%` as `${number}%` }]} />
                  </View>
                  <Text style={styles.targetPct}>{pct.toFixed(0)}%</Text>
                </View>
              );
            })}
          </GlassCard>
        )}

        {/* Recent Transactions */}
        <View style={styles.sectionHeader2}>
          <Text style={styles.sectionLabel}>{t('recentTransactions')}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/income')}>
            <Text style={styles.viewAll}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>
        {recent.length === 0 ? (
          <EmptyState icon="receipt-outline" title={t('noTransactions')} subtitle={t('addFirst')} />
        ) : (
          recent.map(item => (
            <TransactionItem
              key={item.id}
              item={item}
              onEdit={() => router.push(item.type === 'income' ? { pathname: '/add-income', params: { id: item.id } } : { pathname: '/add-expense', params: { id: item.id } })}
              onDelete={removeTransaction}
            />
          ))
        )}

        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>WAROHATHUN NI'MAH</Text>
          <Text style={styles.designerText}>Design By AHMAD AHFANI</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080818' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,255,0.15)',
  },
  greeting: { color: '#6b9bb8', fontSize: 12, letterSpacing: 1 },
  appName: { color: '#00d4ff', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', gap: 12 },
  headerBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(0,212,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 0 },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  quickGrad: { alignItems: 'center', paddingVertical: 12, gap: 4 },
  quickText: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  healthCard: { marginBottom: 16 },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionLabel: { color: '#6b9bb8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600' },
  healthScore: { fontSize: 20, fontWeight: '800' },
  healthBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, marginBottom: 6 },
  healthBarFill: { height: 6, borderRadius: 3 },
  healthLabel: { fontSize: 12, fontWeight: '600' },
  sectionCard: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeader2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  viewAll: { color: '#00d4ff', fontSize: 12, fontWeight: '600' },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  targetTitle: { color: '#e0f7ff', fontSize: 12, width: 100 },
  targetBar: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2 },
  targetFill: { height: 4, borderRadius: 2, backgroundColor: '#00d4ff' },
  targetPct: { color: '#00d4ff', fontSize: 11, width: 35, textAlign: 'right' },
  watermark: { alignItems: 'center', marginTop: 24, gap: 4 },
  watermarkText: { color: '#8b00ff', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  designerText: { color: '#6b9bb8', fontSize: 10 },
});
