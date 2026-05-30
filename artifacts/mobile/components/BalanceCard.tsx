import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

interface Props {
  balance: number;
  income: number;
  expense: number;
  label?: string;
}

export function BalanceCard({ balance, income, expense, label = 'Total Saldo' }: Props) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [glowAnim]);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });
  const isPositive = balance >= 0;

  return (
    <LinearGradient
      colors={['#0d0d2b', '#12122e', '#0d0d2b']}
      style={styles.container}
    >
      <View style={styles.topBorder} />
      <Animated.View style={[styles.glow, { opacity: glowOpacity, backgroundColor: isPositive ? '#00d4ff15' : '#ff336615' }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.balance, { color: isPositive ? '#00d4ff' : '#ff3366' }]}>
        {formatCurrency(Math.abs(balance))}
      </Text>
      {!isPositive && (
        <View style={styles.deficit}>
          <Ionicons name="warning" size={12} color="#ff3366" />
          <Text style={styles.deficitText}>Defisit</Text>
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <View style={[styles.dot, { backgroundColor: '#00ff88' }]} />
            <Text style={styles.statLabel}>Pemasukan</Text>
          </View>
          <Text style={[styles.statAmount, { color: '#00ff88' }]}>{formatCurrency(income)}</Text>
        </View>
        <View style={[styles.divider]} />
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <View style={[styles.dot, { backgroundColor: '#ff3366' }]} />
            <Text style={styles.statLabel}>Pengeluaran</Text>
          </View>
          <Text style={[styles.statAmount, { color: '#ff3366' }]}>{formatCurrency(expense)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 40,
    right: 40,
    height: 2,
    backgroundColor: '#00d4ff',
    borderRadius: 1,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  label: {
    color: '#6b9bb8',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  balance: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  deficit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  deficitText: { color: '#ff3366', fontSize: 12, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 0,
  },
  statBox: { flex: 1 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statLabel: { color: '#6b9bb8', fontSize: 11 },
  statAmount: { fontSize: 14, fontWeight: '700' },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0,212,255,0.2)',
    marginHorizontal: 16,
  },
});
