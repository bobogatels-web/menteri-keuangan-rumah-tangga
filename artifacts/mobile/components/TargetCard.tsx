import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Target } from '@/services/database';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

const TYPE_COLORS: Record<string, string> = {
  savings: '#00d4ff',
  income: '#00ff88',
  expense: '#ff3366',
};

interface Props {
  item: Target;
  onEdit: (item: Target) => void;
  onDelete: (id: string) => void;
}

export function TargetCard({ item, onEdit, onDelete }: Props) {
  const pct = item.target_amount > 0 ? Math.min(100, (item.current_amount / item.target_amount) * 100) : 0;
  const color = TYPE_COLORS[item.target_type] ?? '#00d4ff';
  const remaining = item.target_amount - item.current_amount;

  const handleDelete = () => {
    Alert.alert('Hapus Target', 'Yakin ingin menghapus target ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View style={[styles.container, { borderColor: color + '40' }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.period}>{item.period} • {item.target_type}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.btn}>
            <Ionicons name="pencil" size={14} color="#00d4ff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.btn}>
            <Ionicons name="trash" size={14} color="#ff3366" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.amounts}>
        <Text style={[styles.current, { color }]}>{formatCurrency(item.current_amount)}</Text>
        <Text style={styles.target}>/ {formatCurrency(item.target_amount)}</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct}%` as `${number}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.pct, { color }]}>{pct.toFixed(1)}%</Text>
        {remaining > 0 ? (
          <Text style={styles.remaining}>Sisa {formatCurrency(remaining)}</Text>
        ) : (
          <View style={styles.achieved}>
            <Ionicons name="checkmark-circle" size={14} color="#00ff88" />
            <Text style={styles.achievedText}>Tercapai!</Text>
          </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { color: '#e0f7ff', fontSize: 14, fontWeight: '600' },
  period: { color: '#6b9bb8', fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { padding: 4 },
  amounts: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 8 },
  current: { fontSize: 18, fontWeight: '700' },
  target: { color: '#6b9bb8', fontSize: 13 },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, marginBottom: 6 },
  progressFill: { height: 6, borderRadius: 3 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pct: { fontSize: 12, fontWeight: '700' },
  remaining: { color: '#6b9bb8', fontSize: 11 },
  achieved: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  achievedText: { color: '#00ff88', fontSize: 11, fontWeight: '600' },
});
