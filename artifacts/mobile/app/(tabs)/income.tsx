import React, { useMemo, useState } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/context/DBContext';
import { useApp } from '@/context/AppContext';
import { Transaction } from '@/services/database';
import { TransactionItem } from '@/components/TransactionItem';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { FloatingAction } from '@/components/FloatingAction';
import { GlassCard } from '@/components/GlassCard';

function formatCurrency(a: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(a);
}

type Filter = 'all' | 'received' | 'pending';

export default function IncomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useApp();
  const { transactions, removeTransaction } = useDB();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const incomeList = useMemo(() => {
    let list = transactions.filter(t => t.type === 'income');
    if (filter !== 'all') list = list.filter(t => t.status === filter);
    if (search) list = list.filter(t =>
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.notes.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [transactions, filter, search]);

  const totalFiltered = useMemo(() => incomeList.reduce((s, t) => s + t.amount, 0), [incomeList]);
  const totalAll = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);

  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      item={item}
      onEdit={() => router.push({ pathname: '/add-income', params: { id: item.id } })}
      onDelete={removeTransaction}
    />
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0a0a1e', '#080818']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Text style={styles.title}>{t('income')}</Text>
        <Text style={styles.totalHeader}>{formatCurrency(totalAll)}</Text>
      </View>

      <GlassCard style={styles.summaryCard} neonColor="#00ff88" padding={12}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Ditampilkan ({incomeList.length})</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(totalFiltered)}</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: '#00ff88' }]} />
        </View>
      </GlassCard>

      <View style={styles.filterRow}>
        {(['all', 'received', 'pending'] as Filter[]).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? t('all') : f === 'received' ? t('received') : t('pending')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('search')} />
      </View>

      <FlatList
        data={incomeList}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + bottom }]}
        ListEmptyComponent={<EmptyState icon="trending-up-outline" title={t('noTransactions')} subtitle={t('addFirst')} />}
        showsVerticalScrollIndicator={false}
      />

      <FloatingAction
        onPress={() => router.push('/add-income')}
        icon="add"
        bottom={80 + bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080818' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,255,0.15)',
  },
  title: { color: '#00ff88', fontSize: 22, fontWeight: '800' },
  totalHeader: { color: '#00ff88', fontSize: 16, fontWeight: '700' },
  summaryCard: { margin: 16, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#6b9bb8', fontSize: 11 },
  summaryAmount: { color: '#00ff88', fontSize: 16, fontWeight: '700', marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(0,212,255,0.07)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)',
  },
  filterActive: { backgroundColor: 'rgba(0,255,136,0.15)', borderColor: '#00ff88' },
  filterText: { color: '#6b9bb8', fontSize: 12 },
  filterTextActive: { color: '#00ff88', fontWeight: '700' },
  searchWrap: { paddingHorizontal: 16 },
  list: { paddingHorizontal: 16 },
});
