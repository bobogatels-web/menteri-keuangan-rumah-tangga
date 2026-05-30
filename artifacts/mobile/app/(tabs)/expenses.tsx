import React, { useMemo, useState } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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

const CATEGORIES = ['Semua', 'Makanan & Minuman', 'Transportasi', 'Belanja', 'Kesehatan', 'Pendidikan', 'Hiburan', 'Utilitas', 'Sewa', 'Rumah Tangga', 'Lainnya'];

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useApp();
  const { transactions, removeTransaction } = useDB();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Semua');

  const expenseList = useMemo(() => {
    let list = transactions.filter(t => t.type === 'expense');
    if (catFilter !== 'Semua') list = list.filter(t => t.category === catFilter);
    if (search) list = list.filter(t =>
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.notes.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [transactions, catFilter, search]);

  const totalFiltered = useMemo(() => expenseList.reduce((s, t) => s + t.amount, 0), [expenseList]);
  const totalAll = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions]);

  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      item={item}
      onEdit={() => router.push({ pathname: '/add-expense', params: { id: item.id } })}
      onDelete={removeTransaction}
    />
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1a0818', '#080818']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Text style={styles.title}>{t('expenses')}</Text>
        <Text style={styles.totalHeader}>{formatCurrency(totalAll)}</Text>
      </View>

      <GlassCard style={styles.summaryCard} neonColor="#ff3366" padding={12}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Ditampilkan ({expenseList.length})</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(totalFiltered)}</Text>
          </View>
        </View>
      </GlassCard>

      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('search')} />
      </View>

      <View style={styles.catScroll}>
        {CATEGORIES.slice(0, 5).map(c => (
          <TouchableOpacity
            key={c}
            onPress={() => setCatFilter(c)}
            style={[styles.catBtn, catFilter === c && styles.catActive]}
          >
            <Text style={[styles.catText, catFilter === c && styles.catTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={expenseList}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + bottom }]}
        ListEmptyComponent={<EmptyState icon="trending-down-outline" title={t('noTransactions')} subtitle={t('addFirst')} />}
        showsVerticalScrollIndicator={false}
      />

      <FloatingAction
        onPress={() => router.push('/add-expense')}
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
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,51,102,0.2)',
  },
  title: { color: '#ff3366', fontSize: 22, fontWeight: '800' },
  totalHeader: { color: '#ff3366', fontSize: 16, fontWeight: '700' },
  summaryCard: { margin: 16, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#6b9bb8', fontSize: 11 },
  summaryAmount: { color: '#ff3366', fontSize: 16, fontWeight: '700', marginTop: 2 },
  searchWrap: { paddingHorizontal: 16 },
  catScroll: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  catBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    backgroundColor: 'rgba(255,51,102,0.07)', borderWidth: 1, borderColor: 'rgba(255,51,102,0.2)',
    marginBottom: 4,
  },
  catActive: { backgroundColor: 'rgba(255,51,102,0.2)', borderColor: '#ff3366' },
  catText: { color: '#6b9bb8', fontSize: 11 },
  catTextActive: { color: '#ff3366', fontWeight: '700' },
  list: { paddingHorizontal: 16 },
});
