import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '@/services/database';
import { useApp } from '@/context/AppContext';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
  if (date === today) return 'Hari Ini';
  if (date === yesterday) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const CATEGORY_ICONS: Record<string, string> = {
  'Photo Editing': 'camera',
  'Shopee Affiliate': 'bag-handle',
  'TikTok Affiliate': 'musical-notes',
  'Lynk.id': 'link',
  'Super Grook': 'sparkles',
  'Chat GPT': 'chatbubble-ellipses',
  'CapCut Pro': 'videocam',
  'Netflix': 'play-circle',
  'Video Editing': 'film',
  'API Key': 'key',
  'Affiliate Vivi': 'people',
  'Others': 'ellipsis-horizontal',
  'Food & Drink': 'restaurant',
  'Transport': 'car',
  'Shopping': 'cart',
  'Health': 'medical',
  'Education': 'school',
  'Entertainment': 'game-controller',
  'Utilities': 'flash',
  'Rent': 'home',
  'Household': 'basket',
  'Other': 'ellipsis-horizontal',
};

interface Props {
  item: Transaction;
  onEdit: (item: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({ item, onEdit, onDelete }: Props) {
  const { t } = useApp();
  const isIncome = item.type === 'income';
  const neon = isIncome ? '#00ff88' : '#ff3366';
  const iconName = (CATEGORY_ICONS[item.category] || 'cash') as keyof typeof Ionicons.glyphMap;

  const handleDelete = () => {
    Alert.alert(t('confirmDelete'), t('deleteMessage'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View style={[styles.container, { borderLeftColor: neon }]}>
      <View style={[styles.iconBox, { backgroundColor: neon + '20', borderColor: neon + '40' }]}>
        <Ionicons name={iconName} size={18} color={neon} />
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{item.category || (isIncome ? 'Income' : 'Expense')}</Text>
        <Text style={styles.meta}>
          {formatDate(item.date)}
          {item.buyer_name ? ` • ${item.buyer_name}` : ''}
          {item.notes ? ` • ${item.notes}` : ''}
        </Text>
        {item.status && item.status !== 'received' && (
          <View style={[styles.statusBadge, item.status === 'pending' && styles.pending]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: neon }]}>
          {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
            <Ionicons name="pencil" size={14} color="#00d4ff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
            <Ionicons name="trash" size={14} color="#ff3366" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,13,43,0.9)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  info: { flex: 1 },
  category: { color: '#e0f7ff', fontSize: 14, fontWeight: '600' },
  meta: { color: '#6b9bb8', fontSize: 11, marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', backgroundColor: '#ff336630', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3 },
  pending: { backgroundColor: '#ffdd0030' },
  statusText: { color: '#ffdd00', fontSize: 10, fontWeight: '600' },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 4 },
});
