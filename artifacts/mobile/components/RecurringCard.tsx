import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecurringItem } from '@/services/database';

function formatCurrency(a: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(a);
}

interface Props {
  item: RecurringItem;
  onEdit: (item: RecurringItem) => void;
  onDelete: (id: string) => void;
  onGenerate: (item: RecurringItem) => void;
  onToggle: (item: RecurringItem) => void;
}

export function RecurringCard({ item, onEdit, onDelete, onGenerate, onToggle }: Props) {
  const isIncome = item.type === 'income';
  const color = isIncome ? '#00ff88' : '#ff3366';
  const activeColor = item.is_active ? color : '#6b9bb8';

  const handleDelete = () => {
    Alert.alert('Hapus Berkala', 'Yakin menghapus item berkala ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View style={[styles.container, { borderColor: activeColor + '40', opacity: item.is_active ? 1 : 0.6 }]}>
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.typeText, { color }]}>{isIncome ? 'Pemasukan' : 'Pengeluaran'}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onToggle(item)} style={styles.btn}>
            <Ionicons name={item.is_active ? 'pause-circle' : 'play-circle'} size={18} color={activeColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.btn}>
            <Ionicons name="pencil" size={14} color="#00d4ff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.btn}>
            <Ionicons name="trash" size={14} color="#ff3366" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={[styles.amount, { color: activeColor }]}>{formatCurrency(item.amount)}</Text>
      <View style={styles.footer}>
        <View style={styles.meta}>
          <Ionicons name="refresh" size={12} color="#6b9bb8" />
          <Text style={styles.metaText}>{item.frequency}</Text>
          <Ionicons name="calendar" size={12} color="#6b9bb8" />
          <Text style={styles.metaText}>{item.next_date}</Text>
        </View>
        {item.is_active && (
          <TouchableOpacity
            onPress={() => onGenerate(item)}
            style={styles.generateBtn}
          >
            <Ionicons name="flash" size={12} color="#ffdd00" />
            <Text style={styles.generateText}>Buat</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(13,13,43,0.9)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  typeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { padding: 3 },
  title: { color: '#e0f7ff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  amount: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#6b9bb8', fontSize: 11 },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,221,0,0.15)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  generateText: { color: '#ffdd00', fontSize: 11, fontWeight: '600' },
});
